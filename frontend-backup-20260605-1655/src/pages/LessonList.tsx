import "./LessonList.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

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
  }, [id]);

  const filteredLessons = lessons.filter((lesson) =>
    lesson.TenLesson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lesson-wrapper">

      {/* HEADER */}
      <div className="lesson-header">
        <div>
          <h1 className="lesson-title">{tenLop}</h1>
          <p className="lesson-subtitle">
            {tenKhoaHoc} · Quản lý các buổi học trong lớp và theo dõi tiến độ.
          </p>
        </div>
        <span className="lesson-back" onClick={() => navigate(-1)}>← Quay lại</span>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Tìm kiếm buổi..."
        className="lesson-search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* LESSON GRID */}
      <div className="lesson-grid">
        {filteredLessons.map((lesson) => (
          <div key={lesson.MaLesson} className="lesson-card">
            <h3>{lesson.TenLesson}</h3>
            <p>{lesson.MoTa}</p>
            <p>📅 {formatDate(lesson.NgayBatDau)} - {formatDate(lesson.NgayKetThuc)}</p>
            <button
              className="lesson-btn"
              onClick={() => navigate(`/class/${lesson.MaLesson}`, {
                state: { tenKhoaHoc, tenLop, maLopHoc: id } // ← thêm maLopHoc
              })}
            >
              📖 Xem chi tiết
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default LessonList;