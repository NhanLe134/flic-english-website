import "./ClassDetailSV.css";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaClock,
  FaBook,
  FaCheck,
  FaChevronRight,
  FaListUl
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

  const [info, setInfo] = useState<ClassInfo | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

              let markerClass = "cd-timeline-marker cd-marker-upcoming";
              let markerContent: React.ReactNode = idx + 1;

              if (isCompleted) {
                markerClass = "cd-timeline-marker cd-marker-completed";
                markerContent = <FaCheck size={12} />;
              } else if (isCurrent) {
                markerClass = "cd-timeline-marker cd-marker-current";
                markerContent = idx + 1;
              }

              return (
                <div
                  key={lesson.MaLesson}
                  className={`cd-timeline-item ${isCurrent ? "current-item" : ""}`}
                >
                  {/* Timeline node marker */}
                  <div className={markerClass}>{markerContent}</div>

                  {/* Lesson detail card */}
                  <Link
                    to={`/lesson-detail/${info.MaLopHoc}/${lesson.MaLesson}`}
                    className="cd-session-card"
                  >
                    <div className="cd-session-left">
                      <h4 className="cd-session-title">{lesson.TenLesson}</h4>
                    </div>
                    <div className="cd-session-right">
                      <span className="cd-session-date">
                        <FaCalendarAlt size={12} />
                        {formatDate(lesson.NgayBatDau)}
                      </span>
                      <FaChevronRight className="cd-session-chevron" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
