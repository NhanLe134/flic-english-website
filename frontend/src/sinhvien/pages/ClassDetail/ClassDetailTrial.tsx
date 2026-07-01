import "./ClassDetailSV.css";
import "../LessonDetail/LessonDetailSV.css";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaChevronRight,
  FaListUl,
  FaPlayCircle,
  FaFileAlt,
  FaPencilAlt,
  FaClipboardCheck,
  FaInfoCircle
} from "react-icons/fa";

const API = "http://localhost:5000";

interface ClassInfo {
  MaLopHoc: number;
  TenLop: string;
  LichHoc: string;
  SoLuongHocVien: number;
  TienDo: number;
  MaLop: number;
  MoTa: string;
  TenKhoaHoc: string;
  TenGiangVien: string;
  ActiveLessonId: number | null;
  TrangThaiKhoaHoc: string;
  TrangThaiLopHoc: string;
  NgayBatDau: string;
  NgayKetThuc: string;
}

interface Lesson {
  MaLesson: number;
  TenLesson: string;
  MaLopHoc: number;
  MoTa: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  ThuTu: number;
  TrangThaiDuyet: string;
}

export default function ClassDetailTrial() {
  const { id, lessonId, tab, itemId } = useParams<{ id: string; lessonId?: string; tab?: string; itemId?: string }>();
  const classId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!sessionStorage.getItem("user");
  const isStudentRoute = location.pathname.includes("/hoc-thu-sv");

  const [info, setInfo] = useState<ClassInfo | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null);
  const [lessonDetails, setLessonDetails] = useState<Record<number, {
    loading: boolean;
    baiGiangs: any[];
    taiLieus: any[];
    practices: any[];
    exams: any[];
    activeBaiHoc: number | null;
    activeTab: string;
  }>>({});

  useEffect(() => {
    if (isNaN(classId)) {
      setError("Mã lớp học không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user from sessionStorage to get student ID
        const user = JSON.parse(sessionStorage.getItem("user") || "{}");
        const userId = user.MaNguoiDung;

        // Fetch class info, lessons, and student submissions in parallel
        const [infoRes, lessonsRes, submissionsRes] = await Promise.all([
          fetch(`${API}/classes/${classId}/info`).then((r) => r.json()),
          fetch(`${API}/classes/${classId}/lessons`).then((r) => r.json()),
          userId
            ? fetch(`${API}/student/bainop/${userId}`).then((r) => r.json()).catch(() => [])
            : Promise.resolve([])
        ]);

        if (infoRes && infoRes.MaLopHoc) {
          setInfo(infoRes);
        } else {
          setError("Không tìm thấy thông tin lớp học.");
        }

        if (Array.isArray(lessonsRes)) {
          // Sort lessons by ThuTu ascending
          const sorted = [...lessonsRes].sort((a, b) => a.ThuTu - b.ThuTu);
          setLessons(sorted);
        } else {
          setLessons([]);
        }

        if (Array.isArray(submissionsRes)) {
          setSubmissions(submissionsRes);
        }
      } catch (err) {
        console.error("Error fetching class details:", err);
        setError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const tabMapping: Record<string, string> = {
    bg: "lectures",
    tl: "documents",
    lt: "practices",
    bt: "exams",
    lectures: "lectures",
    documents: "documents",
    practices: "practices",
    exams: "exams"
  };

  const urlTabMapping: Record<string, string> = {
    lectures: "bg",
    documents: "tl",
    practices: "lt",
    exams: "bt"
  };

  useEffect(() => {
    if (lessons.length > 0 && lessonId) {
      const numericLessonId = Number(lessonId);
      const mappedTab = tab ? (tabMapping[tab] || "lectures") : "lectures";
      if (expandedLessonId !== numericLessonId || !lessonDetails[numericLessonId] || lessonDetails[numericLessonId].activeTab !== mappedTab) {
        handleToggleLesson(numericLessonId, mappedTab);
      }
    }
  }, [lessons, lessonId, tab]);

  // Scroll to selected exercise item if itemId is provided in URL
  useEffect(() => {
    if (itemId && expandedLessonId) {
      const detail = lessonDetails[expandedLessonId];
      if (detail && !detail.loading) {
        const timer = setTimeout(() => {
          const element = document.getElementById(`ex-${itemId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.style.transition = "background-color 0.5s ease";
            element.style.backgroundColor = "#fffae6";
            setTimeout(() => {
              element.style.backgroundColor = "";
            }, 2000);
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [itemId, expandedLessonId, lessonDetails]);

  // Toggle accordion and fetch data for the lesson
  const handleToggleLesson = async (lessonId: number, defaultTab: string = "lectures") => {
    const detailBasePath = isStudentRoute ? `/hoc-thu-sv/${classId}` : `/hoc-thu/${classId}`;

    if (expandedLessonId === lessonId && defaultTab === "lectures") {
      setExpandedLessonId(null);
      navigate(detailBasePath, { replace: true });
      return;
    }

    setExpandedLessonId(lessonId);
    const shortTab = urlTabMapping[defaultTab] || "bg";
    navigate(`${detailBasePath}/${lessonId}/${shortTab}`, { replace: true });

    if (lessonDetails[lessonId]) {
      setLessonDetails(prev => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          activeTab: defaultTab
        }
      }));
      return;
    }

    setLessonDetails(prev => ({
      ...prev,
      [lessonId]: {
        loading: true,
        baiGiangs: [],
        taiLieus: [],
        practices: [],
        exams: [],
        activeBaiHoc: null,
        activeTab: defaultTab
      }
    }));

    try {
      const [baigiangData, tailieuData, rawBaitapData] = await Promise.all([
        fetch(`${API}/baigiang/${lessonId}?role=Sinh Viên`).then(r => r.json()),
        fetch(`${API}/tailieu/${lessonId}?role=Sinh Viên`).then(r => r.json()),
        fetch(`${API}/baitap/buoihoc/${lessonId}`).then(r => r.json())
      ]);

      const published = Array.isArray(baigiangData)
        ? baigiangData.filter((b: any) => b.TrangThai === "published" && (b.IsFree === 1 || b.IsFree === true))
        : [];
      const taiLieus = Array.isArray(tailieuData) ? tailieuData : [];
      let baitapData = Array.isArray(rawBaitapData)
        ? rawBaitapData.filter((ex: any) => ex.TrangThai === "published" || ex.TrangThai === "Đã duyệt" || ex.TrangThaiDuyet === "Đã duyệt")
        : [];
      
      // Inject mock exercises unconditionally for testing
      if (!baitapData.some((ex: any) => ex.MaBaiTap === "mock-speaking-pronounce-1")) {
        baitapData.push({
          MaBaiTap: "mock-speaking-pronounce-1",
          Title: "Bài tập: Luyện phát âm tự động (Web Speech API)",
          Type: "speaking-pronounce",
          CreatedDate: new Date().toISOString(),
          IsExam: 1
        });
      }
      if (!baitapData.some((ex: any) => ex.MaBaiTap === "mock-speaking-pronounce-2")) {
        baitapData.push({
          MaBaiTap: "mock-speaking-pronounce-2",
          Title: "Luyện tập: Phát âm từ vựng cơ bản",
          Type: "speaking-pronounce",
          CreatedDate: new Date().toISOString(),
          IsExam: 0
        });
      }
      if (!baitapData.some((ex: any) => ex.MaBaiTap === "mock-speaking-topic-1")) {
        baitapData.push({
          MaBaiTap: "mock-speaking-topic-1",
          Title: "Bài tập: Nói theo chủ đề (ghi âm nộp GV chấm)",
          Type: "speaking-topic",
          CreatedDate: new Date().toISOString(),
          IsExam: 1
        });
      }
      if (!baitapData.some((ex: any) => ex.MaBaiTap === "mock-speaking-topic-2")) {
        baitapData.push({
          MaBaiTap: "mock-speaking-topic-2",
          Title: "Luyện tập: Giới thiệu bản thân và gia đình",
          Type: "speaking-topic",
          CreatedDate: new Date().toISOString(),
          IsExam: 0
        });
      }
      if (!baitapData.some((ex: any) => ex.MaBaiTap === "mock-reading-split-1")) {
        baitapData.push({
          MaBaiTap: "mock-reading-split-1",
          Title: "Luyện tập: Đọc hiểu - The History of Extinction",
          Type: "reading-split",
          CreatedDate: new Date().toISOString(),
          IsExam: 0
        });
      }
      if (!baitapData.some((ex: any) => ex.MaBaiTap === "mock-reading-vocab-1")) {
        baitapData.push({
          MaBaiTap: "mock-reading-vocab-1",
          Title: "Luyện tập: Từ vựng - Nối từ (Match the pairs)",
          Type: "reading-vocab-mcq",
          CreatedDate: new Date().toISOString(),
          IsExam: 0
        });
      }
      if (!baitapData.some((ex: any) => ex.MaBaiTap === "mock-writing-order-words-1")) {
        baitapData.push({
          MaBaiTap: "mock-writing-order-words-1",
          Title: "Luyện tập: Kéo thả sắp xếp câu",
          Type: "writing-order-words",
          CreatedDate: new Date().toISOString(),
          IsExam: 0
        });
      }
      if (!baitapData.some((ex: any) => ex.MaBaiTap === "mock-writing-essay-1")) {
        baitapData.push({
          MaBaiTap: "mock-writing-essay-1",
          Title: "Bài tập tự luận: Viết về đồng nghiệp của bạn",
          Type: "writing-essay",
          CreatedDate: new Date().toISOString(),
          IsExam: 0
        });
      }
      if (!baitapData.some((ex: any) => ex.MaBaiTap === "mock-writing-order-sentences-1")) {
        baitapData.push({
          MaBaiTap: "mock-writing-order-sentences-1",
          Title: "Luyện tập: Sắp xếp câu thành đoạn văn",
          Type: "writing-order-sentences",
          CreatedDate: new Date().toISOString(),
          IsExam: 0
        });
      }
      
      const baiTaps = baitapData;

      const practices = baiTaps.filter((ex: any) => {
        const isTest = ex.IsExam === 1 || ex.IsExam === true || ex.Type?.toLowerCase() === "exam" || ex.Type?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("kiểm tra");
        return !isTest;
      });
      const exams = baiTaps.filter((ex: any) => {
        const isTest = ex.IsExam === 1 || ex.IsExam === true || ex.Type?.toLowerCase() === "exam" || ex.Type?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("kiểm tra");
        return isTest;
      });

      const activeBaiHoc = published.length > 0 ? published[0].MaBaiHoc : null;

      setLessonDetails(prev => ({
        ...prev,
        [lessonId]: {
          loading: false,
          baiGiangs: published,
          taiLieus,
          practices,
          exams,
          activeBaiHoc,
          activeTab: defaultTab
        }
      }));
    } catch (err) {
      console.error("Error loading lesson details:", err);
      setLessonDetails(prev => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          loading: false
        }
      }));
    }
  };

  const handleTabChange = (lessonId: number, tabName: string) => {
    setLessonDetails(prev => {
      const item = prev[lessonId];
      if (!item) return prev;
      return {
        ...prev,
        [lessonId]: {
          ...item,
          activeTab: tabName
        }
      };
    });
    const shortTab = urlTabMapping[tabName] || "bg";
    const detailBasePath = isStudentRoute ? `/hoc-thu-sv/${classId}` : `/hoc-thu/${classId}`;
    navigate(`${detailBasePath}/${lessonId}/${shortTab}`, { replace: true });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const mapTypeToSkillName = (type?: string) => {
    if (!type) return "";
    const t = type.toLowerCase().trim();
    if (t === "listening" || t === "l" || t === "nghe") return "Listening";
    if (t === "reading" || t === "r" || t === "đọc" || t === "doc") return "Reading";
    if (t === "writing" || t === "w" || t === "viết" || t === "viet") return "Writing";
    if (t === "speaking" || t === "s" || t === "nói" || t === "noi") return "Speaking";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleActionClick = (targetUrl: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate(targetUrl);
    } else {
      alert("Vui lòng đăng nhập bằng tài khoản Học Viên để học thử nội dung này!");
    }
  };

  if (loading) {
    return (
      <div className="cd-loading-container">
        <div className="cd-spinner"></div>
        <p>Đang tải thông tin chi tiết lớp học...</p>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="cd-error-container">
        <h3>Đã xảy ra lỗi</h3>
        <p>{error || "Không tìm thấy dữ liệu lớp học."}</p>
        <Link to={isStudentRoute ? "/hoc-thu-sv" : "/hoc-thu"} className="cd-error-btn">
          Quay lại danh sách lớp học thử
        </Link>
      </div>
    );
  }

  return (
    <div className="cd-container" style={{ padding: "30px 40px 60px 40px" }}>
      {/* Breadcrumb */}
      <nav className="courses-breadcrumb" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", marginTop: "0px", marginBottom: "24px" }}>
        <Link to={isLoggedIn ? "/profile" : "/"} style={{ color: "#777777", textDecoration: "none", fontWeight: 500 }}>Trang chủ</Link>
        <span style={{ color: "#bbbbbb", fontSize: "14px", userSelect: "none" }}>›</span>
        <Link to={isStudentRoute ? "/hoc-thu-sv" : "/hoc-thu"} style={{ color: "#777777", textDecoration: "none", fontWeight: 500 }}>Học & thi thử</Link>
        <span style={{ color: "#bbbbbb", fontSize: "14px", userSelect: "none" }}>›</span>
        <span style={{ color: "#F95800", fontWeight: 600 }}>{info.TenLop}</span>
      </nav>

      {/* Main Class Overview Card - ONLY title and description */}
      <div className="cd-overview-card" style={{ padding: "30px", background: "#ffffff", border: "1px solid #e2e8f0", display: "block", borderRadius: "16px", marginBottom: "30px" }}>
        <h2 className="cd-class-title" style={{ color: "#000080", fontSize: "26px", fontWeight: 800, margin: "0 0 12px 0" }}>{info.TenLop}</h2>
        <p className="cd-class-desc" style={{ color: "#64748b", fontSize: "15px", margin: 0, lineHeight: "1.6" }}>
          {info.MoTa || "Lớp học thử nghiệm chất lượng cao của hệ thống Anh ngữ FLIC."}
        </p>
      </div>

      {/* Detailed Learning Schedule Timeline */}
      <div className="cd-timeline-section">
        <h3 className="cd-timeline-title">
          <FaListUl className="cd-title-icon" /> Lịch trình học tập chi tiết
        </h3>

        {lessons.length === 0 ? (
          <div style={{ color: "#64748b", padding: "10px 0" }}>
            Lịch trình học tập của lớp học này đang được cập nhật. Vui lòng quay lại sau.
          </div>
        ) : (
          <div className="cd-timeline-list">
            {[...lessons].reverse().map((lesson, indexInReversed) => {
              const idx = (lessons.length - 1) - indexInReversed;
              const isExpanded = expandedLessonId === lesson.MaLesson;

              let markerClass = "cd-timeline-marker cd-marker-current";
              let markerContent: React.ReactNode = idx + 1;

              const detail = lessonDetails[lesson.MaLesson];

              return (
                <div
                  key={lesson.MaLesson}
                  className={`cd-timeline-item ${isExpanded ? "current-item" : ""}`}
                >
                  {/* Timeline node marker */}
                  <div className={markerClass}>{markerContent}</div>

                  {/* Lesson detail card container */}
                  <div className={`cd-session-container ${isExpanded ? "expanded" : ""}`}>
                    {/* Header (clickable to toggle) */}
                    <div
                      className="cd-session-card"
                      onClick={() => handleToggleLesson(lesson.MaLesson)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="cd-session-left">
                        <h4 className="cd-session-title">{lesson.TenLesson}</h4>
                      </div>
                      <div className="cd-session-right">
                        <span className="cd-session-date">
                          <FaCalendarAlt size={12} />
                          {formatDate(lesson.NgayBatDau)}
                        </span>
                        <FaChevronRight
                          className="cd-session-chevron"
                          style={{
                            transform: isExpanded ? "rotate(90deg)" : "none",
                            transition: "transform 0.2s ease"
                          }}
                        />
                      </div>
                    </div>

                    {/* Expanded Body containing Tabs and Contents */}
                    {isExpanded && (
                      <div className="cd-session-expanded-body">
                        {(!detail || detail.loading) ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#999", padding: "30px 0" }}>
                            <div className="cd-spinner" style={{ width: "24px", height: "24px", borderWidth: "3px" }}></div>
                            <span style={{ marginLeft: "10px" }}>Đang tải nội dung buổi học...</span>
                          </div>
                        ) : (
                          <>
                            {/* Tabs Navigation */}
                            <div className="ld2-tabs" style={{ marginTop: "15px" }}>
                              <button
                                className={`ld2-tab-btn ${detail.activeTab === 'lectures' ? 'active' : ''}`}
                                onClick={() => handleTabChange(lesson.MaLesson, 'lectures')}
                              >
                                <FaPlayCircle className="ld2-tab-icon" />
                                <span>Bài giảng</span>
                                <span className="ld2-tab-badge">{detail.baiGiangs.length}</span>
                              </button>
                              <button
                                className={`ld2-tab-btn ${detail.activeTab === 'documents' ? 'active' : ''}`}
                                onClick={() => handleTabChange(lesson.MaLesson, 'documents')}
                              >
                                <FaFileAlt className="ld2-tab-icon" />
                                <span>Tài liệu</span>
                                <span className="ld2-tab-badge">{detail.taiLieus.length}</span>
                              </button>
                              <button
                                className={`ld2-tab-btn ${detail.activeTab === 'practices' ? 'active' : ''}`}
                                onClick={() => handleTabChange(lesson.MaLesson, 'practices')}
                              >
                                <FaPencilAlt className="ld2-tab-icon" />
                                <span>Luyện tập</span>
                                <span className="ld2-tab-badge">{detail.practices.length}</span>
                              </button>
                              <button
                                className={`ld2-tab-btn ${detail.activeTab === 'exams' ? 'active' : ''}`}
                                onClick={() => handleTabChange(lesson.MaLesson, 'exams')}
                              >
                                <FaClipboardCheck className="ld2-tab-icon" />
                                <span>Bài tập</span>
                                <span className="ld2-tab-badge">{detail.exams.length}</span>
                              </button>
                            </div>

                            {/* Tabs Content */}
                            <div className="ld2-tab-pane">
                              {detail.activeTab === 'lectures' && (
                                <div className="ld2-tab-content anim-fade-in">
                                  {detail.baiGiangs.length > 0 ? (
                                    <div className="ld2-table-wrap">
                                      <table className="ld2-table">
                                        <thead>
                                          <tr>
                                            <th style={{ textAlign: "center" }}>#</th>
                                            <th>Tên bài giảng</th>
                                            <th style={{ textAlign: "center" }}>Loại</th>
                                            <th style={{ textAlign: "center" }}>Thời lượng</th>
                                            <th style={{ textAlign: "center" }}>Hành động</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detail.baiGiangs.map((b, i) => (
                                            <tr key={b.MaBaiHoc}>
                                              <td style={{ textAlign: "center" }}>{i + 1}</td>
                                              <td><strong>{b.TieuDe}</strong></td>
                                              <td style={{ textAlign: "center" }}><span className="ld2-type-badge">{b.LoaiBaiHoc}</span></td>
                                              <td style={{ textAlign: "center" }}>{b.ThoiLuong || "—"}</td>
                                              <td style={{ textAlign: "center" }}>
                                                <button
                                                  className="ld2-open-btn"
                                                  onClick={(e) => handleActionClick(`/hoc-thu-sv/${info.MaLopHoc}/${lesson.MaLesson}/bg/${b.MaBaiHoc}`, e)}
                                                >
                                                  Xem
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="ld2-empty-state">
                                      <div className="ld2-empty-icon"><FaInfoCircle /></div>
                                      <p className="ld2-empty-text">Chưa có bài giảng nào được xuất bản cho buổi học này.</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {detail.activeTab === 'documents' && (
                                <div className="ld2-tab-content anim-fade-in">
                                  {detail.taiLieus.length > 0 ? (
                                    <div className="ld2-docs-grid">
                                      {detail.taiLieus.map((t, idx) => {
                                        const docUrl = t.FileUrl ? (t.FileUrl.startsWith('http') ? t.FileUrl : `${API}${t.FileUrl}`) : `${import.meta.env.BASE_URL}doc-detail/${t.MaTaiLieu}`;
                                        return (
                                          <div
                                            key={t.MaTaiLieu}
                                            className="ld2-doc-card"
                                            onClick={() => {
                                              if (isLoggedIn) {
                                                if (t.FileUrl) {
                                                  window.open(docUrl, "_blank");
                                                } else {
                                                  navigate(`/doc-detail/${t.MaTaiLieu}`);
                                                }
                                              } else {
                                                alert("Vui lòng đăng nhập bằng tài khoản Học Viên để học thử nội dung này!");
                                              }
                                            }}
                                            style={{ cursor: "pointer" }}
                                          >
                                            <div className="ld2-doc-icon-wrapper">
                                              <FaFileAlt className="ld2-doc-icon" />
                                            </div>
                                            <div className="ld2-doc-info">
                                              <h4 className="ld2-doc-title">{t.TieuDe || `Tài liệu số ${idx + 1}`}</h4>
                                              <p className="ld2-doc-desc">{t.MoTa || "Tài liệu học tập đính kèm buổi học"}</p>
                                            </div>
                                            <div className="ld2-doc-action">
                                              <button className="ld2-doc-btn">Xem chi tiết</button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="ld2-empty-state">
                                      <div className="ld2-empty-icon"><FaInfoCircle /></div>
                                      <p className="ld2-empty-text">Chưa có tài liệu đính kèm nào cho buổi học này.</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {detail.activeTab === 'practices' && (
                                <div className="ld2-tab-content anim-fade-in">
                                  {detail.practices.length > 0 ? (
                                    <div className="ld2-table-wrap">
                                      <table className="ld2-table">
                                        <thead>
                                          <tr>
                                            <th style={{ textAlign: "center" }}>#</th>
                                            <th>Tên bài luyện tập thêm</th>
                                            <th style={{ textAlign: "center" }}>Phân loại</th>
                                            <th style={{ textAlign: "center" }}>Ngày tạo</th>
                                            <th style={{ textAlign: "center" }}>Số lần làm bài</th>
                                            <th style={{ textAlign: "center" }}>Điểm số</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detail.practices.map((ex: any, i: number) => {
                                            const exSubmissions = submissions.filter(s => String(s.MaBaiTap) === String(ex.MaBaiTap));
                                            const attempts = exSubmissions.length;
                                            const gradedSubmissions = exSubmissions.filter(s => s.Diem !== null && s.Diem !== undefined && s.Diem !== "");
                                            const score = gradedSubmissions.length > 0 ? gradedSubmissions[gradedSubmissions.length - 1].Diem : "";
                                            return (
                                              <tr 
                                                key={ex.MaBaiTap} 
                                                id={`ex-${ex.MaBaiTap}`}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setSelectedExercise({ ...ex, activeTab: 'practices', lesson })}
                                              >
                                                <td style={{ textAlign: "center" }}>{i + 1}</td>
                                                <td><strong>{ex.Title}</strong></td>
                                                <td style={{ textAlign: "center" }}><span className="ld2-type-badge">{mapTypeToSkillName(ex.Type) || "Practice"}</span></td>
                                                <td style={{ textAlign: "center" }}>{ex.CreatedDate ? new Date(ex.CreatedDate).toLocaleDateString("vi-VN") : "—"}</td>
                                                <td style={{ textAlign: "center" }}>{attempts}</td>
                                                <td style={{ textAlign: "center" }}>{score !== "" ? score : ""}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="ld2-empty-state">
                                      <div className="ld2-empty-icon"><FaInfoCircle /></div>
                                      <p className="ld2-empty-text">Chưa có bài tập luyện tập nào cho buổi học này.</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {detail.activeTab === 'exams' && (
                                <div className="ld2-tab-content anim-fade-in">
                                  {detail.exams.length > 0 ? (
                                    <div className="ld2-table-wrap">
                                      <table className="ld2-table">
                                        <thead>
                                          <tr>
                                            <th style={{ textAlign: "center" }}>#</th>
                                            <th>Tên bài tập</th>
                                            <th style={{ textAlign: "center" }}>Phân loại</th>
                                            <th style={{ textAlign: "center" }}>Ngày tạo</th>
                                            <th style={{ textAlign: "center" }}>Số lần làm bài</th>
                                            <th style={{ textAlign: "center" }}>Điểm số</th>
                                            <th style={{ textAlign: "center" }}>Hành động</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detail.exams.map((ex: any, i: number) => {
                                            const exSubmissions = submissions.filter(s => String(s.MaBaiTap) === String(ex.MaBaiTap));
                                            const attempts = exSubmissions.length;
                                            const gradedSubmissions = exSubmissions.filter(s => s.Diem !== null && s.Diem !== undefined && s.Diem !== "");
                                            const score = gradedSubmissions.length > 0 ? gradedSubmissions[gradedSubmissions.length - 1].Diem : "";
                                            return (
                                              <tr 
                                                key={ex.MaBaiTap} 
                                                id={`ex-${ex.MaBaiTap}`}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setSelectedExercise({ ...ex, activeTab: 'exams', lesson })}
                                              >
                                                <td style={{ textAlign: "center" }}>{i + 1}</td>
                                                <td><strong>{ex.Title}</strong></td>
                                                <td style={{ textAlign: "center" }}><span className="ld2-type-badge">{mapTypeToSkillName(ex.Type) || "Exam"}</span></td>
                                                <td style={{ textAlign: "center" }}>{ex.CreatedDate ? new Date(ex.CreatedDate).toLocaleDateString("vi-VN") : "—"}</td>
                                                <td style={{ textAlign: "center" }}>{attempts}</td>
                                                <td style={{ textAlign: "center" }}>{score !== "" ? score : ""}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="ld2-empty-state">
                                      <div className="ld2-empty-icon"><FaInfoCircle /></div>
                                      <p className="ld2-empty-text">Chưa có bài kiểm tra nào cho buổi học này.</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedExercise && (
        <div className="exit-confirm-modal-backdrop" onClick={() => setSelectedExercise(null)}>
          <div className="exit-confirm-modal-card" style={{ maxWidth: "420px", textAlign: "left", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button 
              className="exit-modal-close-x" 
              onClick={() => setSelectedExercise(null)}
              title="Đóng"
            >
              &times;
            </button>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700", color: "#1e3a8a", paddingRight: "24px" }}>
              {selectedExercise.Title}
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span style={{ color: "#64748b", fontSize: "14px" }}>Phân loại:</span>
                <span style={{ fontWeight: "600", color: "#334155", fontSize: "14px" }}>
                  {mapTypeToSkillName(selectedExercise.Type) || (selectedExercise.activeTab === 'practices' ? 'Practice' : 'Exam')}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span style={{ color: "#64748b", fontSize: "14px" }}>Ngày tạo:</span>
                <span style={{ fontWeight: "600", color: "#334155", fontSize: "14px" }}>
                  {selectedExercise.CreatedDate ? new Date(selectedExercise.CreatedDate).toLocaleDateString("vi-VN") : "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span style={{ color: "#64748b", fontSize: "14px" }}>Số lần làm bài:</span>
                <span style={{ fontWeight: "600", color: "#334155", fontSize: "14px" }}>
                  {submissions.filter(s => String(s.MaBaiTap) === String(selectedExercise.MaBaiTap)).length} lần
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}>
                <span style={{ color: "#64748b", fontSize: "14px" }}>Điểm số gần nhất:</span>
                <span style={{ fontWeight: "700", color: "#f95800", fontSize: "14px" }}>
                  {(() => {
                    const exSubs = submissions.filter(s => String(s.MaBaiTap) === String(selectedExercise.MaBaiTap));
                    const graded = exSubs.filter(s => s.Diem !== null && s.Diem !== undefined && s.Diem !== "");
                    return graded.length > 0 ? graded[graded.length - 1].Diem : "Chưa có điểm";
                  })()}
                </span>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              {submissions.filter(s => String(s.MaBaiTap) === String(selectedExercise.MaBaiTap)).length > 0 && (
                <button
                  className="ld2-review-btn"
                  style={{ margin: 0, padding: "10px 20px" }}
                  onClick={(e) => {
                    const tabKey = selectedExercise.activeTab === 'practices' ? 'lt' : 'bt';
                    handleActionClick(`/hoc-thu-sv/${info?.MaLopHoc}/${selectedExercise.lesson.MaLesson}/${tabKey}/${selectedExercise.MaBaiTap}?mode=review`, e);
                    setSelectedExercise(null);
                  }}
                >
                  Xem lại
                </button>
              )}
              <button
                className="ld2-open-btn"
                style={{ padding: "10px 20px" }}
                onClick={(e) => {
                  const tabKey = selectedExercise.activeTab === 'practices' ? 'lt' : 'bt';
                  handleActionClick(`/hoc-thu-sv/${info?.MaLopHoc}/${selectedExercise.lesson.MaLesson}/${tabKey}/${selectedExercise.MaBaiTap}`, e);
                  setSelectedExercise(null);
                }}
              >
                Làm bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
