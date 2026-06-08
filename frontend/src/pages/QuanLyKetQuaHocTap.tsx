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

  return (
    <div className="qlkq-wrapper">
      <h1 className="qlkq-title">Quản lý kết quả học tập</h1>

      {/* STATS */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Tổng số lớp</span>
            <h3 className="stat-value">{classes.length}</h3>
            <span className="stat-desc">Đang hoạt động</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Học sinh</span>
            <h3 className="stat-value">{totalStudents}</h3>
            <span className="stat-desc">Đang hoạt động</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Điểm trung bình</span>
            <h3 className="stat-value">8.5</h3>
            <span className="stat-desc">+ 5% so với tuần trước</span>
          </div>
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
                  <p className="class-course">Khóa học: {c.TenKhoaHoc}</p>
                )}

                <div className="class-info">
                  <span className="class-info-label">Lịch học:</span>
                  <p>{c.LichHoc || "Chưa có lịch"}</p>
                </div>
                <div className="class-info">
                  <span className="class-info-label">Sĩ số:</span>
                  <p>{c.SoLuongHocVien} học viên</p>
                </div>

                <div className="progress-row">
                  <span>Tiến độ lớp học</span>
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