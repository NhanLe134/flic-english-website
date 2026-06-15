import "./MyCourses.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaCalendarAlt, FaUsers, FaChartLine } from "react-icons/fa";

const API = "http://localhost:5000";

function pctColor(pct: number) {
  if (pct >= 90) return "#22c55e";
  if (pct >= 60) return "#E8683A";
  return "#f97316";
}

function MyCourses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}")
    if (!user.MaNguoiDung) { setLoading(false); return }

    fetch(`${API}/student/my-classes/${user.MaNguoiDung}`)
      .then(r => r.json())
      .then(data => setClasses(Array.isArray(data) ? data : []))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false))
  }, [])

  const avgPct = classes.length > 0
    ? Math.round(classes.reduce((a, c) => a + (c.TienDo || 0), 0) / classes.length)
    : 0

  return (
    <>
        <div className="mc-content">

          <div className="mc-heading">
            <h1 className="mc-page-title">Khóa học của tôi</h1>
            <p className="mc-page-sub">Quản lý và theo dõi tiến độ các lớp học đang tham gia</p>
          </div>

          {/* Stats */}
          <div className="mc-stats">
            <div className="mc-stat">
              <span className="mc-stat-label">Tổng số lớp</span>
              <span className="mc-stat-value">{classes.length}</span>
            </div>
            <div className="mc-stat">
              <span className="mc-stat-label">Tỷ lệ hoàn thành TB</span>
              <span className="mc-stat-value green">{avgPct}%</span>
            </div>
            <div className="mc-stat">
              <span className="mc-stat-label">Trạng thái</span>
              <span className="mc-stat-value">Đang học</span>
            </div>
          </div>

          <div className="mc-section-label">
            <span>Tất cả lớp học</span>
            <span className="mc-count-pill">{classes.length} lớp</span>
          </div>

          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:"#999" }}>Đang tải...</div>
          ) : classes.length === 0 ? (
            <div style={{ padding:40, textAlign:"center", color:"#999" }}>
              Bạn chưa được ghi danh vào lớp nào.
            </div>
          ) : (
            <div className="mc-grid">
              {classes.map((c, i) => (
                <div className="mc-card" key={c.MaLopHoc} style={{ animationDelay:`${i * 60}ms` }}>

                  <div className="mc-card-header">
                    <div>
                      <h3 className="mc-card-name">{c.TenLop}</h3>
                      <span className="mc-card-code">{c.TenKhoaHoc}</span>
                    </div>
                    <div className="mc-pct-circle"
                      style={{ '--pct-color': pctColor(c.TienDo || 0) } as React.CSSProperties}>
                      {c.TienDo || 0}%
                    </div>
                  </div>

                  <div className="mc-card-meta">
                    {c.LichHoc && <span><FaCalendarAlt className="mc-icon" />{c.LichHoc}</span>}
                    <span><FaUsers className="mc-icon" />{c.SoLuongHocVien || 0} học viên</span>
                  </div>

                  <div className="mc-progress-row">
                    <span><FaChartLine className="mc-icon" />Tiến độ khóa học</span>
                    <span className="mc-progress-pct">{c.TienDo || 0}%</span>
                  </div>
                  <div className="mc-bar">
                    <div className="mc-bar-fill"
                      style={{ width:`${c.TienDo || 0}%`, background: pctColor(c.TienDo || 0) }} />
                  </div>

                  <Link
                    to={`/class-detail/${c.MaLopHoc}`}
                    state={{ courseName: c.TenLop, courseCode: c.TenKhoaHoc }}
                    className="mc-access-btn"
                  >
                    Truy cập
                  </Link>
                </div>
              ))}
            </div>
          )}

        </div>
    </>
  );
}

export default MyCourses;