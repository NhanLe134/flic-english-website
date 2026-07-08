import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { formatScheduleOnlyDays } from "../../utils/schedule";
import "./QuanLyKetQuaHocTap.css";

const QuanLyKetQuaHocTap = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    if (!maNguoiDung) { setLoading(false); return; }

    fetch(`http://14.225.192.252:5000/teacher/classes/${maNguoiDung}`)
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Chuyển hướng ngay lập tức tới lớp học phụ trách đầu tiên
          navigate(`/lesson-result/${data[0].MaLopHoc}`, { replace: true });
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, [navigate]);



  return (
    <div className="qlkq-wrapper">
      <h1 className="qlkq-title">Quản lý kết quả học tập</h1>



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
                  <p>{formatScheduleOnlyDays(c.LichHoc) || "Chưa có lịch"}</p>
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

