import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./quanlyketquahoctap.css";

const QuanLyKetQuaHocTap = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    if (!maNguoiDung) { setLoading(false); return; }

    fetch(`http://localhost:5000/teacher/classes/${maNguoiDung}`)
      .then(res => res.json())
      .then(async (data) => {
        // Fetch số học viên thực tế cho từng lớp
        const withStudents = await Promise.all(
          data.map(async (c: any) => {
            try {
              const res = await fetch(`http://localhost:5000/lophoc/${c.MaLopHoc}/students/count`);
              const json = await res.json();
              return { ...c, SoLuongHocVien: json?.SoLuongHocVien ?? 0 };
            } catch {
              return { ...c, SoLuongHocVien: 0 };
            }
          })
        );
        setClasses(withStudents);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = classes.reduce((t, c) => t + (c.SoLuongHocVien || 0), 0);
  const avgProgress = classes.length > 0
    ? Math.round(classes.reduce((t, c) => t + (c.TienDo || 0), 0) / classes.length)
    : 0;

  return (
    <div className="qlkq-wrapper">

      <h1>Chào mừng trở lại!</h1>
      <p className="qlkq-sub">Hệ thống quản lý giáo viên FLIC</p>

      {/* STATS */}
      <div className="stats-container">
        <div className="stat-card">
          <p>Tổng số lớp</p>
          <h2>{classes.length}</h2>
          <p>Đang hoạt động</p>
        </div>
        <div className="stat-card">
          <p>Học sinh</p>
          <h2>{totalStudents}</h2>
          <p>Đang hoạt động</p>
        </div>
        <div className="stat-card">
          <p>Tiến độ trung bình</p>
          <h2>{avgProgress}%</h2>
          <p>Toàn bộ các lớp</p>
        </div>
        <div className="stat-card">
          <p>Điểm trung bình</p>
          <h2>8.5</h2>
          <p>+ 5% so với tuần trước</p>
        </div>
      </div>

      {/* CLASS CARDS */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Đang tải...</div>
      ) : (
        <div className="card-container">
          {classes.length === 0 ? (
            <p>Bạn chưa được phân công lớp học nào.</p>
          ) : (
            classes.map((c, i) => (
              <div key={i} className="class-card">
                <h2>{c.TenLop}</h2>
                <p className="class-code">Mã lớp: {c.MaLopHoc}</p>
                {c.TenKhoaHoc && (
                  <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>📚 {c.TenKhoaHoc}</p>
                )}

                <div className="class-info">
                  <span>📅</span>
                  <p>{c.LichHoc || "Chưa có lịch"}</p>
                </div>
                <div className="class-info">
                  <span>👥</span>
                  <p>{c.SoLuongHocVien} Học viên</p>
                </div>

                <div className="progress-row">
                  <span>📈 Tiến độ khóa học</span>
                  <span className="percent">{c.TienDo || 0}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-orange" style={{ width: `${Math.max((c.TienDo || 0) - 10, 0)}%` }} />
                  <div className="progress-green" style={{ width: "10%" }} />
                  <div className="progress-bg" style={{ flex: 1 }} />
                </div>

                <button
                  className="result-btn"
                  onClick={() => navigate(`/lesson-result/${c.MaLopHoc}`)}
                >
                  Xem Kết quả học tập
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default QuanLyKetQuaHocTap;