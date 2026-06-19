import "./ClassDetailSV.css";
import "../LessonDetail/LessonDetailSV.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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

export default function ClassDetailSV() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const navigate = useNavigate();

  const [info, setInfo] = useState<ClassInfo | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Fetch class info and lessons in parallel
        const [infoRes, lessonsRes] = await Promise.all([
          fetch(`${API}/classes/${classId}/info`).then((r) => r.json()),
          fetch(`${API}/classes/${classId}/lessons`).then((r) => r.json())
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
      } catch (err) {
        console.error("Error fetching class details:", err);
        setError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  // Toggle accordion and fetch data for the lesson
  const handleToggleLesson = async (lessonId: number) => {
    if (expandedLessonId === lessonId) {
      setExpandedLessonId(null);
      return;
    }

    setExpandedLessonId(lessonId);

    if (lessonDetails[lessonId]) return;

    setLessonDetails(prev => ({
      ...prev,
      [lessonId]: {
        loading: true,
        baiGiangs: [],
        taiLieus: [],
        practices: [],
        exams: [],
        activeBaiHoc: null,
        activeTab: "lectures"
      }
    }));

    try {
      const [baigiangData, tailieuData, baitapData] = await Promise.all([
        fetch(`${API}/baigiang/${lessonId}?role=Sinh Viên`).then(r => r.json()),
        fetch(`${API}/tailieu/${lessonId}?role=Sinh Viên`).then(r => r.json()),
        fetch(`${API}/baitap/${lessonId}`).then(r => r.json())
      ]);

      const published = Array.isArray(baigiangData)
        ? baigiangData.filter((b: any) => b.TrangThai === "published")
        : [];
      const taiLieus = Array.isArray(tailieuData) ? tailieuData : [];
      const baiTaps = Array.isArray(baitapData) ? baitapData : [];

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
          activeTab: "lectures"
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
  };

  // Helper date formatter
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
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
                <span className="cd-meta-value">{info.LichHoc || "Chưa cập nhật"}</span>
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
              const isCompleted = idx < completedCount;
              const isCurrent = idx === completedCount;
              const isExpanded = expandedLessonId === lesson.MaLesson;

              let markerClass = "cd-timeline-marker cd-marker-upcoming";
              let markerContent: React.ReactNode = idx + 1;

              if (isCompleted) {
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
                  className={`cd-timeline-item ${isCurrent ? "current-item" : ""}`}
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
                                    <>
                                      <div className="ld2-table-wrap">
                                        <table className="ld2-table">
                                          <thead>
                                            <tr>
                                              <th>#</th>
                                              <th>Tên bài giảng</th>
                                              <th>Loại</th>
                                              <th>Thời lượng</th>
                                              <th>Hành động</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {detail.baiGiangs.map((b, i) => (
                                              <tr key={b.MaBaiHoc}>
                                                <td>{i + 1}</td>
                                                <td><strong>{b.TieuDe}</strong></td>
                                                <td><span className="ld2-type-badge">{b.LoaiBaiHoc}</span></td>
                                                <td>{b.ThoiLuong || "—"}</td>
                                                <td>
                                                  <button
                                                    className="ld2-open-btn"
                                                    onClick={() => {
                                                      navigate(`/bai-giangSV/${b.MaBaiHoc}`, {
                                                        state: { fromStudent: true, maLopHoc: info.MaLopHoc, maBuoiHoc: lesson.MaLesson }
                                                      });
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

                                      <div className="ld2-video-wrap">
                                        <div className="ld2-video-player">
                                          <div className="ld2-play-icon" onClick={() => {
                                            if (detail.activeBaiHoc) {
                                              navigate(`/bai-giangSV/${detail.activeBaiHoc}`, {
                                                state: { fromStudent: true, maLopHoc: info.MaLopHoc, maBuoiHoc: lesson.MaLesson }
                                              });
                                            }
                                          }}>▶</div>
                                          <p className="ld2-video-label">{lesson.TenLesson || "Bài học"}</p>
                                          <p className="ld2-video-sub">
                                            {detail.activeBaiHoc ? "Bấm phát video hoặc Xem để bắt đầu học" : "Chọn bài giảng từ danh sách trên để xem"}
                                          </p>
                                        </div>
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
                                        <div
                                          key={t.MaTaiLieu}
                                          className="ld2-doc-card"
                                          onClick={() => navigate(`/doc-detail/${t.MaTaiLieu}`)}
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
                                            <th>#</th>
                                            <th>Tên bài tập</th>
                                            <th>Phân loại</th>
                                            <th>Ngày tạo</th>
                                            <th>Hành động</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detail.practices.map((ex: any, i: number) => (
                                            <tr key={ex.MaBaiTap}>
                                              <td>{i + 1}</td>
                                              <td><strong>{ex.Title}</strong></td>
                                              <td><span className="ld2-type-badge" style={{ background: '#fff7ed', color: '#ea580c' }}>{ex.Type || "Practice"}</span></td>
                                              <td>{ex.CreatedDate ? new Date(ex.CreatedDate).toLocaleDateString("vi-VN") : "—"}</td>
                                              <td>
                                                <button
                                                  className="ld2-open-btn"
                                                  style={{ background: '#F95800' }}
                                                  onClick={() => {
                                                    navigate(`/baitap/${ex.MaBaiTap}`, {
                                                      state: { maLopHoc: info.MaLopHoc }
                                                    });
                                                  }}
                                                >
                                                  Làm bài
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
                                            <th>#</th>
                                            <th>Tên bài kiểm tra</th>
                                            <th>Phân loại</th>
                                            <th>Ngày tạo</th>
                                            <th>Hành động</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detail.exams.map((ex: any, i: number) => (
                                            <tr key={ex.MaBaiTap}>
                                              <td>{i + 1}</td>
                                              <td><strong>{ex.Title}</strong></td>
                                              <td><span className="ld2-type-badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>{ex.Type || "Exam"}</span></td>
                                              <td>{ex.CreatedDate ? new Date(ex.CreatedDate).toLocaleDateString("vi-VN") : "—"}</td>
                                              <td>
                                                <button
                                                  className="ld2-open-btn"
                                                  style={{ background: '#16a34a' }}
                                                  onClick={() => {
                                                    navigate(`/baitap/${ex.MaBaiTap}`, {
                                                      state: { maLopHoc: info.MaLopHoc }
                                                    });
                                                  }}
                                                >
                                                  Làm bài
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
    </div>
  );
}
