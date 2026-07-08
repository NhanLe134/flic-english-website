import "./ClassDetailSV.css";
import "../LessonDetail/LessonDetailSV.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { formatScheduleOnlyDays } from "../../../utils/schedule";
import {
  FaCalendarAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaClock,
  FaBook,
  FaCheck,
  FaChevronRight,
  FaListUl,
  FaPlayCircle,
  FaFileAlt,
  FaPencilAlt,
  FaClipboardCheck,
  FaInfoCircle,
  FaLock
} from "react-icons/fa";

const API = "http://14.225.192.252:5000";

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
  TrangThai?: string;
}

const getExerciseDeadline = (ex: any) => {
  if (ex.HanNop) return ex.HanNop;
  let deadlineStr = "";
  if (ex.Content) {
    try {
      const parsed = typeof ex.Content === "string" ? JSON.parse(ex.Content) : ex.Content;
      if (parsed && (parsed.deadline || parsed.deadlineDate)) {
        deadlineStr = parsed.deadline || parsed.deadlineDate;
      }
    } catch (e) {
      console.error("Error parsing content for deadline:", e);
    }
  }
  return deadlineStr;
};

const formatDeadline = (deadlineStr: string) => {
  if (!deadlineStr) return "—";
  const date = new Date(deadlineStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const isDeadlineOverdue = (deadlineStr: string) => {
  if (!deadlineStr) return false;
  return new Date().getTime() > new Date(deadlineStr).getTime();
};

export default function ClassDetailSV() {
  const { id, lessonId, tab, itemId } = useParams<{ id: string; lessonId?: string; tab?: string; itemId?: string }>();
  const classId = Number(id);
  const navigate = useNavigate();

  const [info, setInfo] = useState<ClassInfo | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingReview, setPendingReview] = useState<{ sub: any; selectedExercise: any } | null>(null);

  const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null);
  const [maSinhVien, setMaSinhVien] = useState<number | null>(null);
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
        const [infoRes, lessonsRes, submissionsRes, myClassesRes] = await Promise.all([
          fetch(`${API}/classes/${classId}/info`).then((r) => r.json()),
          fetch(`${API}/classes/${classId}/lessons`).then((r) => r.json()),
          userId
            ? fetch(`${API}/student/bainop/${userId}`).then((r) => r.json()).catch(() => [])
            : Promise.resolve([]),
          userId
            ? fetch(`${API}/student/my-classes/${userId}`).then((r) => r.json()).catch(() => [])
            : Promise.resolve([])
        ]);

        const myClasses = Array.isArray(myClassesRes) ? myClassesRes : [];
        const enrolledClass = myClasses.find((c: any) => c.MaLopHoc === Number(classId));

        if (!enrolledClass || (enrolledClass.TrangThai !== 'Đang học' && enrolledClass.TrangThai !== 'Đã hoàn thành')) {
          setError("Bạn không có quyền truy cập lớp học này hoặc yêu cầu ghi danh của bạn đang chờ duyệt.");
          return;
        }

        if (infoRes && infoRes.MaLopHoc) {
          setInfo(infoRes);
        } else {
          setError("Không tìm thấy thông tin lớp học.");
        }

        if (Array.isArray(lessonsRes)) {
          // Filter out sessions that are "Chờ mở" and sort lessons by ThuTu ascending
          const sorted = [...lessonsRes]
            .filter((l: any) => l.TrangThai !== "Chờ mở")
            .sort((a, b) => a.ThuTu - b.ThuTu);
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
    if (expandedLessonId === lessonId && defaultTab === "lectures") {
      setExpandedLessonId(null);
      navigate(`/MyCourses/${classId}`, { replace: true });
      return;
    }

    setExpandedLessonId(lessonId);
    const shortTab = urlTabMapping[defaultTab] || "bg";
    navigate(`/MyCourses/${classId}/${lessonId}/${shortTab}`, { replace: true });

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

    // Resolve student info first if not resolved
    let resolvedMaSV = maSinhVien;
    if (!resolvedMaSV) {
      try {
        const user = JSON.parse(sessionStorage.getItem("user") || "{}");
        const userId = user.MaNguoiDung;
        if (userId) {
          const svRes = await fetch(`${API}/students/by-user/${userId}`).then(r => r.json());
          if (svRes && svRes.MaSinhVien) {
            resolvedMaSV = svRes.MaSinhVien;
            setMaSinhVien(svRes.MaSinhVien);
          }
        }
      } catch (e) {
        console.error(e);
      }
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
      const [baigiangData, tailieuData, rawBaitapData, rawLuyentapData] = await Promise.all([
        fetch(`${API}/baigiang/${lessonId}?role=Sinh Viên`).then(r => r.json()),
        fetch(`${API}/tailieu/${lessonId}?role=Sinh Viên`).then(r => r.json()),
        fetch(`${API}/baitap/buoihoc/${lessonId}`).then(r => r.json()),
        fetch(`${API}/luyentapthem/buoihoc/${lessonId}`).then(r => r.json())
      ]);

      const published = Array.isArray(baigiangData)
        ? baigiangData.filter((b: any) => b.TrangThai === "published")
        : [];
      const taiLieus = Array.isArray(tailieuData) ? tailieuData : [];
      let baitapData = Array.isArray(rawBaitapData)
        ? rawBaitapData.filter((ex: any) => ex.TrangThai === "published" || ex.TrangThai === "Đã duyệt" || ex.TrangThaiDuyet === "Đã duyệt")
        : [];
      let luyentapData = Array.isArray(rawLuyentapData)
        ? rawLuyentapData.filter((ex: any) => ex.TrangThai === "published" || ex.TrangThai === "Đã duyệt" || ex.TrangThaiDuyet === "Đã duyệt")
        : [];

      const practices = luyentapData;
      const exams = baitapData;

      const activeBaiHoc = published.length > 0 ? published[0].MaBaiHoc : null;

      // Fetch progress for each published lecture in parallel
      const baiGiangsWithProgress = await Promise.all(
        published.map(async (b: any) => {
          if (resolvedMaSV) {
            try {
              const prog = await fetch(`${API}/student/progress/minitest/${b.MaBaiHoc}/${resolvedMaSV}`).then(r => r.json());
              return {
                ...b,
                completed: prog.DaXemVideo === 1
              };
            } catch (e) {
              console.error(e);
            }
          }
          return { ...b, completed: false };
        })
      );

      setLessonDetails(prev => ({
        ...prev,
        [lessonId]: {
          loading: false,
          baiGiangs: baiGiangsWithProgress,
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
    navigate(`/MyCourses/${classId}/${lessonId}/${shortTab}`, { replace: true });
  };

  // Helper date formatter
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const mapTypeToSkillName = (type?: string) => {
    if (!type) return "";
    const t = type.toLowerCase().trim();

    if (t.includes("listening") || t.includes("nghe") || t.includes("l") || t.includes("hình ảnh chọn đáp án") || t.includes("điền từ vào đoạn văn")) {
      return "Listening";
    }
    if (t.includes("reading") || t.includes("đọc") || t.includes("doc") || t.includes("r") || t.includes("từ vựng") || t.includes("nối từ")) {
      return "Reading";
    }
    if (t.includes("writing") || t.includes("viết") || t.includes("viet") || t.includes("w") || t.includes("sắp xếp") || t.includes("tìm lỗi sai") || t.includes("trắc nghiệm")) {
      return "Writing";
    }
    if (t.includes("speaking") || t.includes("nói") || t.includes("noi") || t.includes("s") || t.includes("phát âm")) {
      return "Speaking";
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
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
        <Link to="/MyCourses" className="cd-error-btn">
          Quay lại danh sách lớp học
        </Link>
      </div>
    );
  }

  // Calculate session completions based on progress percentage
  const totalLessons = lessons.length;
  const progressPercent = info.TienDo || 0;
  const completedCount = Math.round((progressPercent / 100) * totalLessons);

  // SVG Circular progress configurations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;



  return (
    <div className="cd-container">
      {/* Breadcrumb */}
      <div className="cd-breadcrumb">
        <Link to="/MyCourses">Lớp học của tôi</Link>
        <span className="cd-divider"> &gt; </span>
        <span className="cd-current">{info.TenLop}</span>
      </div>

      {/* Main Class Overview Card */}
      <div className="cd-overview-card">
        <div className="cd-left-content">
          <h2 className="cd-class-title">{info.TenLop}</h2>
          <p className="cd-class-desc">
            {info.MoTa || "Khóa học chất lượng cao của hệ thống Anh ngữ FLIC."}
          </p>

          <div className="cd-meta-grid">
            {/* Column 1 */}
            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaChalkboardTeacher />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Giáo viên</span>
                <span className="cd-meta-value">{info.TenGiangVien}</span>
              </div>
            </div>

            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaClock />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Lịch học</span>
                <span className="cd-meta-value">{formatScheduleOnlyDays(info.LichHoc) || "Chưa cập nhật"}</span>
              </div>
            </div>

            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaUsers />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Sĩ số</span>
                <span className="cd-meta-value">{info.SoLuongHocVien || 0} học viên</span>
              </div>
            </div>

            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaBook />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Khóa học</span>
                <span className="cd-meta-value">{info.TenKhoaHoc}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cd-right-content">
          <div className="cd-progress-circle-wrap">
            <svg width="120" height="120" className="cd-circle-svg">
              <circle cx="60" cy="60" r={radius} className="cd-circle-bg" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="cd-circle-bar"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="cd-progress-text-overlay">
              <span className="cd-progress-percent">{progressPercent}%</span>
              <span className="cd-progress-label-small">Tiến độ</span>
            </div>
          </div>
          <div className="cd-circle-stats">
            <span className="cd-circle-stats-number">{completedCount}/{totalLessons}</span>
            <span className="cd-circle-stats-text">Buổi đã học</span>
          </div>
        </div>
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
              const isLocked = lesson.TrangThai === "Chờ mở";
              const isCompleted = !isLocked && idx < completedCount;
              const isCurrent = !isLocked && idx === completedCount;
              const isExpanded = !isLocked && expandedLessonId === lesson.MaLesson;

              let markerClass = "cd-timeline-marker cd-marker-upcoming";
              let markerContent: React.ReactNode = idx + 1;

              if (isLocked) {
                markerClass = "cd-timeline-marker cd-marker-upcoming";
                markerContent = <FaLock size={10} />;
              } else if (isCompleted) {
                markerClass = "cd-timeline-marker cd-marker-completed";
                markerContent = <FaCheck size={12} />;
              } else if (isCurrent) {
                markerClass = "cd-timeline-marker cd-marker-current";
                markerContent = idx + 1;
              }

              const detail = lessonDetails[lesson.MaLesson];

              return (
                <div
                  key={lesson.MaLesson}
                  className={`cd-timeline-item ${isCurrent ? "current-item" : ""} ${isLocked ? "locked-item" : ""}`}
                >
                  {/* Timeline node marker */}
                  <div className={markerClass}>{markerContent}</div>

                  {/* Lesson detail card container */}
                  <div className={`cd-session-container ${isExpanded ? "expanded" : ""}`}>
                    {/* Header (clickable to toggle) */}
                    <div
                      className="cd-session-card"
                      onClick={() => !isLocked && handleToggleLesson(lesson.MaLesson)}
                      style={{ cursor: isLocked ? "not-allowed" : "pointer", opacity: isLocked ? 0.7 : 1 }}
                    >
                      <div className="cd-session-left">
                        <h4 className="cd-session-title">{lesson.TenLesson}</h4>
                        {isLocked && <span style={{ marginLeft: "10px", fontSize: "11px", fontWeight: "600", color: "#ef4444", background: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>Chờ mở</span>}
                      </div>
                      <div className="cd-session-right">
                        <span className="cd-session-date">
                          <FaCalendarAlt size={12} />
                          {formatDate(lesson.NgayBatDau)}
                        </span>
                        {!isLocked ? (
                          <FaChevronRight
                            className="cd-session-chevron"
                            style={{
                              transform: isExpanded ? "rotate(90deg)" : "none",
                              transition: "transform 0.2s ease"
                            }}
                          />
                        ) : (
                          <FaLock size={12} style={{ color: "#94a3b8" }} />
                        )}
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
                                    <>
                                      <div className="ld2-table-wrap">
                                        <table className="ld2-table">
                                          <thead>
                                            <tr>
                                              <th style={{ textAlign: "center" }}>#</th>
                                              <th>Tên bài giảng</th>
                                              <th style={{ textAlign: "center" }}>Loại</th>
                                              <th style={{ textAlign: "center" }}>Trạng thái</th>
                                              <th style={{ textAlign: "center" }}>Hành động</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {detail.baiGiangs.map((b, i) => (
                                              <tr key={b.MaBaiHoc}>
                                                <td style={{ textAlign: "center" }}>{i + 1}</td>
                                                <td><strong>{b.TieuDe}</strong></td>
                                                <td style={{ textAlign: "center" }}><span className="ld2-type-badge">{b.LoaiBaiHoc}</span></td>
                                                <td style={{ textAlign: "center" }}>
                                                  <span style={{
                                                    display: "inline-block",
                                                    padding: "4px 10px",
                                                    borderRadius: "20px",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    background: b.completed ? "#e8f5e9" : "#f1f5f9",
                                                    color: b.completed ? "#2e7d32" : "#64748b",
                                                    border: b.completed ? "1px solid #c8e6c9" : "1px solid #e2e8f0"
                                                  }}>
                                                    {b.completed ? "Đã hoàn thành" : "Chưa xem"}
                                                  </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                  <button
                                                    className="ld2-open-btn"
                                                    onClick={() => {
                                                      navigate(`/MyCourses/${info.MaLopHoc}/${lesson.MaLesson}/bg/${b.MaBaiHoc}`);
                                                    }}
                                                  >
                                                    Xem
                                                  </button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>

                                    </>
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
                                      {detail.taiLieus.map((t, idx) => (
                                        <a
                                          key={t.MaTaiLieu}
                                          href={t.FileUrl ? (t.FileUrl.startsWith('http') ? t.FileUrl : `${API}${t.FileUrl}`) : `${import.meta.env.BASE_URL}doc-detail/${t.MaTaiLieu}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="ld2-doc-card"
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
                                        </a>
                                      ))}
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
                                            <th style={{ textAlign: "center" }}>Hạn nộp bài</th>
                                            <th style={{ textAlign: "center" }}>Số lần làm bài</th>
                                            <th style={{ textAlign: "center" }}>Điểm số</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detail.practices.map((ex: any, i: number) => {
                                            const exSubmissions = submissions.filter(s => String(s.MaBaiTap) === String(ex.MaBaiTap));
                                            const attempts = exSubmissions.length;
                                            const gradedSubmissions = exSubmissions.filter(s => s.Diem !== null && s.Diem !== undefined && s.Diem !== "");
                                            let score = "";
                                            if (gradedSubmissions.length > 0) {
                                              const scores = gradedSubmissions.map(s => Number(s.Diem)).filter(d => !isNaN(d));
                                              if (scores.length > 0) {
                                                score = Math.max(...scores).toString();
                                              }
                                            }
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
                                                {(() => {
                                                  const dlStr = getExerciseDeadline(ex);
                                                  const overdue = isDeadlineOverdue(dlStr);
                                                  return (
                                                    <td style={{ textAlign: "center", color: overdue ? "#ef4444" : "inherit", fontWeight: overdue ? 600 : "normal" }}>
                                                      {formatDeadline(dlStr)}
                                                    </td>
                                                  );
                                                })()}
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
                                            <th style={{ textAlign: "center" }}>Hạn nộp bài</th>
                                            <th style={{ textAlign: "center" }}>Số lần làm bài</th>
                                            <th style={{ textAlign: "center" }}>Điểm số</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detail.exams.map((ex: any, i: number) => {
                                            const exSubmissions = submissions.filter(s => String(s.MaBaiTap) === String(ex.MaBaiTap));
                                            const attempts = exSubmissions.length;
                                            const gradedSubmissions = exSubmissions.filter(s => s.Diem !== null && s.Diem !== undefined && s.Diem !== "");
                                            let score = "";
                                            if (gradedSubmissions.length > 0) {
                                              const scores = gradedSubmissions.map(s => Number(s.Diem)).filter(d => !isNaN(d));
                                              if (scores.length > 0) {
                                                score = Math.max(...scores).toString();
                                              }
                                            }
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
                                                {(() => {
                                                  const dlStr = getExerciseDeadline(ex);
                                                  const overdue = isDeadlineOverdue(dlStr);
                                                  return (
                                                    <td style={{ textAlign: "center", color: overdue ? "#ef4444" : "inherit", fontWeight: overdue ? 600 : "normal" }}>
                                                      {formatDeadline(dlStr)}
                                                    </td>
                                                  );
                                                })()}
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

              {/* Lịch sử làm bài */}
              {(() => {
                const exSubs = submissions.filter(s => String(s.MaBaiTap) === String(selectedExercise.MaBaiTap))
                  .sort((a, b) => (a.SoLanLamBai || 0) - (b.SoLanLamBai || 0));

                if (exSubs.length === 0) {
                  return (
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}>
                      <span style={{ color: "#64748b", fontSize: "14px" }}>Số lần làm bài:</span>
                      <span style={{ fontWeight: "600", color: "#334155", fontSize: "14px" }}>Chưa làm lần nào</span>
                    </div>
                  );
                }

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    <span style={{ color: "#1e3a8a", fontWeight: "700", fontSize: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                      Lịch sử làm bài ({exSubs.length} lần):
                    </span>
                    <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {exSubs.map((sub, sIdx) => {
                        const attemptNum = sub.SoLanLamBai || (sIdx + 1);
                        const scoreDisplay = sub.Diem !== null && sub.Diem !== undefined && sub.Diem !== "" ? `${sub.Diem} điểm` : "Chờ chấm";
                        return (
                          <div key={sub.MaBaiNop} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                            <span style={{ fontSize: "13px", color: "#475569" }}>
                              Lần {attemptNum}: <strong style={{ color: "#f95800" }}>{scoreDisplay}</strong>
                            </span>
                            <button
                              className="ld2-review-btn"
                              style={{ margin: 0, padding: "4px 10px", fontSize: "12px", height: "auto", minWidth: "70px" }}
                              onClick={() => {
                                setPendingReview({ sub, selectedExercise });
                                setShowConfirmModal(true);
                              }}
                            >
                              Xem lại
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {(() => {
              const exSubs = submissions.filter(s => String(s.MaBaiTap) === String(selectedExercise.MaBaiTap));
              const lastSub = exSubs.length > 0 ? exSubs[exSubs.length - 1] : null;
              const attemptsCount = lastSub ? (lastSub.SoLanLamBai || 1) : 0;
              const hasReviewed = lastSub ? (lastSub.DaXemGiaiThich === 1) : false;

              const isMaxAttempt = attemptsCount >= 3;
              const isDisabled = isMaxAttempt || hasReviewed;

              let buttonText = "Làm bài";
              let tooltipText = "";
              if (attemptsCount > 0) {
                buttonText = "Làm lại";
              }
              if (isMaxAttempt) {
                tooltipText = "Bạn đã đạt giới hạn làm bài (tối đa 3 lần).";
              } else if (hasReviewed) {
                tooltipText = "Bạn đã xem giải thích đáp án, không thể làm lại.";
              }

              return (
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", alignItems: "center" }}>
                  {tooltipText && (
                    <span style={{ color: "#ef4444", fontSize: "12px", fontWeight: "600" }}>
                      {tooltipText}
                    </span>
                  )}
                  <button
                    className="ld2-open-btn"
                    style={{
                      padding: "10px 20px",
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      backgroundColor: isDisabled ? "#cbd5e1" : "#f95800"
                    }}
                    disabled={isDisabled}
                    onClick={() => {
                      const tabKey = selectedExercise.activeTab === 'practices' ? 'lt' : 'bt';
                      navigate(`/MyCourses/${info?.MaLopHoc}/${selectedExercise.lesson.MaLesson}/${tabKey}/${selectedExercise.MaBaiTap}`);
                      setSelectedExercise(null);
                    }}
                  >
                    {buttonText}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="auth-modal-backdrop confirm-modal-backdrop" onClick={() => {
          setShowConfirmModal(false);
          setPendingReview(null);
        }}>
          <div className="auth-modal-card-wrapper confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h2 className="auth-modal-header-title">Xác nhận xem lại</h2>
              <button
                className="auth-modal-close-btn-new"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingReview(null);
                }}
                type="button"
              >
                &times;
              </button>
            </div>
            <div className="auth-modal-body confirm-modal-body">
              <p className="confirm-modal-text">
                Nếu xem lại đáp án và giải thích, bạn sẽ <strong>KHÔNG</strong> được thực hiện lại (làm lại) bài tập này nữa.
                <br /><br />
                Bạn có chắc chắn muốn xem lại không?
              </p>
              <div className="confirm-modal-actions">
                <button className="confirm-btn-cancel" onClick={() => {
                  setShowConfirmModal(false);
                  setPendingReview(null);
                }}>
                  Hủy
                </button>
                <button className="confirm-btn-ok" onClick={async () => {
                  setShowConfirmModal(false);
                  if (pendingReview) {
                    const { sub, selectedExercise: selEx } = pendingReview;
                    try {
                      const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
                      const userObj = JSON.parse(userStr || "{}");
                      await fetch(`http://14.225.192.252:5000/bainop/xem-giai-thich`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          MaSinhVien: userObj.MaSinhVien || userObj.MaNguoiDung,
                          MaBaiTap: selEx.MaBaiTap
                        })
                      });
                    } catch (e) {
                      console.error("Error setting review flag:", e);
                    }
                    const tabKey = selEx.activeTab === 'practices' ? 'lt' : 'bt';
                    navigate(`/MyCourses/${info?.MaLopHoc}/${selEx.lesson.MaLesson}/${tabKey}/${selEx.MaBaiTap}?mode=review&submissionId=${sub.MaBaiNop}`);
                    setSelectedExercise(null);
                  }
                  setPendingReview(null);
                }}>
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

