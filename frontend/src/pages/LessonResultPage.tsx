import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./lessonResultPage.css";

const LessonResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [lessons, setLessons] = useState<any[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [studentCount, setStudentCount] = useState<number>(0); // ← thêm
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`http://localhost:5000/classes/${id}/info`).then(r => r.json()),
      fetch(`http://localhost:5000/classes/${id}/lessons`).then(r => r.json()),
      fetch(`http://localhost:5000/lophoc/${id}/students/count`).then(r => r.json()), // ← thêm
    ])
      .then(([info, lessonData, countData]) => {
        setClassInfo(info);
        setStudentCount(countData?.SoLuongHocVien ?? 0); // ← thêm
        setLessons(Array.isArray(lessonData) ? lessonData.sort((a: any, b: any) => a.ThuTu - b.ThuTu) : []);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (d: string) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return `${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear()}`;
  };

  const tienDo = classInfo?.TienDo || 0;

  return (
    <div className="lrp-wrapper">

      <div className="lrp-top">
        <div>
          <h1>{loading ? "Đang tải..." : classInfo?.TenLop || "—"}</h1>
          <p>Quản lý tiến độ học tập của lớp</p>
        </div>
        <span className="lrp-back" onClick={() => navigate(-1)}>← Quay lại</span>
      </div>

      {/* STATS */}
      <div className="lrp-stats">
        <div className="lrp-card">
          <p>Tổng số buổi học</p>
          <h2>{lessons.length}</h2>
          <p>Trong lớp này</p>
        </div>
        <div className="lrp-card">
          <p>Tổng số học viên</p>
          <h2>{studentCount}</h2> {/* ← đổi */}
          <p>Đang hoạt động</p>
        </div>
        <div className="lrp-card">
          <p>Tiến độ lớp</p>
          <h2>{tienDo}%</h2>
          <p>Toàn bộ khóa học</p>
        </div>
        <div className="lrp-card">
          <p>Lịch học</p>
          <h2 style={{ fontSize: 16 }}>{classInfo?.LichHoc || "—"}</h2>
          <p>Thời khóa biểu</p>
        </div>
      </div>

      {/* LESSON GRID */}
      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
      ) : lessons.length === 0 ? (
        <div style={{ textAlign:"center", padding:40, color:"#999" }}>Chưa có buổi học nào.</div>
      ) : (
        <div className="lrp-lesson-grid">
          {lessons.map((lesson, idx) => (
            <div key={lesson.MaLesson} className="lrp-lesson-card">
              <div style={{ fontSize:12, color:"#e87722", fontWeight:600, marginBottom:4 }}>
                Buổi {lesson.ThuTu || idx + 1}
              </div>
              <h3>{lesson.TenLesson}</h3>
              {lesson.MoTa && <p className="lrp-class">{lesson.MoTa}</p>}
              <div className="lrp-info">
                📅 {formatDate(lesson.NgayBatDau)}
                {lesson.NgayKetThuc ? ` → ${formatDate(lesson.NgayKetThuc)}` : ""}
              </div>
              <div className="lrp-info">
                👥 {studentCount} Học viên {/* ← đổi */}
              </div>
              <div className="lrp-progress-row">
                <span>📈 Tiến độ</span>
                <span className="lrp-percent">{tienDo}%</span>
              </div>
              <div className="lrp-progress-bar">
                <div
                  className="lrp-progress-orange"
                  style={{ width: `${Math.max(tienDo - 10, 0)}%` }}
                />
                <div className="lrp-progress-green" style={{ width: "10%" }} />
              </div>
              <button
                className="lrp-btn"
                onClick={() => navigate(`/ketqua/${lesson.MaLesson}`)}
              >
                Xem kết quả học tập
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default LessonResultPage;