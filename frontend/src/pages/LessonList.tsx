import "./LessonList.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiUsers, FiTrendingUp, FiCheckSquare, FiArrowLeft, FiFileText } from "react-icons/fi";

interface Lesson {
  MaLesson: number;
  TenLesson: string;
  MoTa: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  ThuTu: number;
}

const LessonList = () => {

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const tenKhoaHoc = location.state?.tenKhoaHoc || "Chi tiết khóa học";
  const tenLop = location.state?.tenLop || "Danh sách buổi học";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const [classProgress, setClassProgress] = useState(57);
  const [pendingCount, setPendingCount] = useState(0);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}/${
      (d.getMonth() + 1).toString().padStart(2, "0")
    }/${d.getFullYear()}`;
  };

  useEffect(() => {
    fetch(`http://localhost:5000/classes/${id}/lessons`)
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(err => console.log(err));

    // Fetch số học viên của lớp
    fetch(`http://localhost:5000/lophoc/${id}/students/count`)
      .then(res => res.json())
      .then(data => setStudentCount(data?.SoLuongHocVien ?? 12))
      .catch(() => setStudentCount(12));

    // Thiết lập tiến độ lớp học dựa trên ID lớp học mẫu
    if (id === "101") {
      setClassProgress(68);
    } else if (id === "102") {
      setClassProgress(45);
    } else {
      setClassProgress(57);
    }

    // Lấy số lượng bài tập cần duyệt
    fetch("http://localhost:5000/teacher/submissions/pending-count")
      .then(res => res.json())
      .then(data => setPendingCount(data.count))
      .catch(err => console.log(err));
  }, [id]);

  const filteredLessons = lessons.filter((lesson) =>
    lesson.TenLesson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lesson-wrapper">
      <span className="lesson-back" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Quay lại
      </span>

      {/* HEADER */}
      <div className="lesson-header">
        <div>
          <h1 className="lesson-title">{tenLop}</h1>
        </div>
      </div>

      {/* STATS */}
      <div className="lesson-stats">
        <div className="lesson-stat-card students-card">
          <div className="stat-icon-wrapper">
            <FiUsers size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Học viên</span>
            <h3 className="stat-value">{studentCount}</h3>
            <span className="stat-desc">Tổng số học viên</span>
          </div>
        </div>
        <div className="lesson-stat-card progress-card">
          <div className="stat-icon-wrapper">
            <FiTrendingUp size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tiến độ</span>
            <h3 className="stat-value">{classProgress}%</h3>
            <span className="stat-desc">Tiến độ trung bình</span>
          </div>
        </div>
        <div className="lesson-stat-card pending-card">
          <div className="stat-icon-wrapper">
            <FiCheckSquare size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Bài tập</span>
            <h3 className="stat-value">{pendingCount} bài</h3>
            <span className="stat-desc">Bài tập cần duyệt</span>
          </div>
        </div>
      </div>

      {/* SEARCH CONTAINER & DRAFTS BUTTON */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "24px" }}>
        <form className="search-container" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: 0 }}>
          <input
            className="search-input"
            placeholder="Tìm kiếm buổi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button" type="button">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <button
          type="button"
          className="drafts-btn"
          onClick={() => navigate("/quan-ly-ban-nhap")}
          style={{
            height: "40px",
            padding: "0 20px",
            borderRadius: "8px",
            border: "1.5px solid #F95800",
            background: "white",
            color: "#F95800",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#fff4ec")}
          onMouseOut={(e) => (e.currentTarget.style.background = "white")}
        >
          <FiFileText size={16} />
          Quản lý bản nháp
        </button>
      </div>

      {/* LESSON GRID */}
      <div className="lesson-grid">
        {filteredLessons.map((lesson) => (
          <div key={lesson.MaLesson} className="lesson-card">
            <h3>{lesson.TenLesson}</h3>
            <p className="lesson-desc">{lesson.MoTa}</p>
            <button
              className="lesson-btn"
              onClick={() => navigate(`/class/${lesson.MaLesson}`, {
                state: { tenKhoaHoc, tenLop, maLopHoc: id } // ← thêm maLopHoc
              })}
            >
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default LessonList;