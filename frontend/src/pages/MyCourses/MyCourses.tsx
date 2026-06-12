import "./MyCourses.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaCalendarAlt, FaUsers, FaChartLine, FaBookOpen, FaPenNib } from "react-icons/fa";

const API = "http://localhost:5000";

function pctColor(pct: number) {
  if (pct >= 90) return "#22c55e";
  if (pct >= 60) return "#E8683A";
  return "#f97316";
}

function MyCourses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [freeLectures, setFreeLectures] = useState<any[]>([]);
  const [freeExercises, setFreeExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFreeContent = () => {
    fetch(`${API}/student/free-content`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setFreeLectures(Array.isArray(data.lectures) ? data.lectures : []);
          setFreeExercises(Array.isArray(data.exercises) ? data.exercises : []);
        }
      })
      .catch((err) => console.error("Error fetching free content", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const userId = user.MaNguoiDung;

    if (!userId) {
      fetchFreeContent();
      return;
    }

    fetch(`${API}/student/my-classes/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        const classList = Array.isArray(data) ? data : [];
        setClasses(classList);
        if (classList.length === 0) {
          fetchFreeContent();
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setClasses([]);
        fetchFreeContent();
      });
  }, []);

  const avgPct = classes.length > 0
    ? Math.round(classes.reduce((a, c) => a + (c.TienDo || 0), 0) / classes.length)
    : 0;

  return (
    <>
      <div className="mc-content">
        <div className="mc-heading">
          <h1 className="mc-page-title">Lớp học của tôi</h1>
          <p className="mc-page-sub">Quản lý và theo dõi tiến độ các lớp học đang tham gia</p>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Đang tải...</div>
        ) : classes.length === 0 ? (
          /* Trial / Try-out view for unregistered students */
          <div className="trial-mode-container">
            <div className="trial-welcome-banner">
              <h2>✨ Chương trình học thử miễn phí</h2>
              <p>Bạn chưa ghi danh vào lớp học nào. Hãy trải nghiệm thử các bài giảng và bài tập miễn phí dưới đây để làm quen với hệ thống!</p>
            </div>

            {/* Trial Lectures Section */}
            <div className="mc-section-label" style={{ marginTop: 24 }}>
              <span>📖 Bài giảng học thử</span>
              <span className="mc-count-pill">{freeLectures.length} bài</span>
            </div>

            {freeLectures.length === 0 ? (
              <div className="trial-empty-box">Hiện tại chưa có bài giảng học thử nào được cập nhật.</div>
            ) : (
              <div className="mc-grid" style={{ marginBottom: 40 }}>
                {freeLectures.map((l, i) => (
                  <div className="mc-card trial-card" key={`lec-${l.MaBaiHoc}`} style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="mc-card-header">
                      <div>
                        <span className="trial-badge">Học thử</span>
                        <h3 className="mc-card-name" style={{ marginTop: 8 }}>{l.TieuDe}</h3>
                        <span className="mc-card-code" style={{ background: "#eff6ff", color: "#1d4ed8" }}>{l.LoaiBaiHoc} · {l.ThoiLuong || "N/A"}</span>
                      </div>
                      <div className="trial-icon-wrap"><FaBookOpen style={{ color: "#3b82f6" }} /></div>
                    </div>
                    <p className="trial-desc">
                      {l.NoiDung ? l.NoiDung.slice(0, 100) + (l.NoiDung.length > 100 ? "..." : "") : "Tài liệu học thử của khóa học."}
                    </p>
                    <Link
                      to={`/bai-giangSV/${l.MaBaiHoc}`}
                      state={{ maLopHoc: null }}
                      className="mc-access-btn"
                      style={{ background: "#3b82f6" }}
                    >
                      Học ngay
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Trial Exercises Section */}
            <div className="mc-section-label">
              <span>✍️ Bài tập thực hành thử</span>
              <span className="mc-count-pill">{freeExercises.length} bài</span>
            </div>

            {freeExercises.length === 0 ? (
              <div className="trial-empty-box">Hiện tại chưa có bài tập học thử nào được cập nhật.</div>
            ) : (
              <div className="mc-grid">
                {freeExercises.map((e, i) => (
                  <div className="mc-card trial-card" key={`ex-${e.MaExercise}`} style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="mc-card-header">
                      <div>
                        <span className="trial-badge" style={{ background: "#fef3c7", color: "#d97706" }}>Luyện tập</span>
                        <h3 className="mc-card-name" style={{ marginTop: 8 }}>{e.Title}</h3>
                        <span className="mc-card-code" style={{ background: "#ecfdf5", color: "#059669" }}>{e.Type}</span>
                      </div>
                      <div className="trial-icon-wrap" style={{ background: "#fef3c7" }}><FaPenNib style={{ color: "#d97706" }} /></div>
                    </div>
                    <p className="trial-desc">
                      {e.Content ? e.Content.slice(0, 100) + (e.Content.length > 100 ? "..." : "") : "Bài tập rèn luyện kỹ năng nâng cao."}
                    </p>
                    <Link
                      to={`/exercise/${e.MaExercise}`}
                      state={{ maLopHoc: null }}
                      className="mc-access-btn"
                      style={{ background: "#10b981" }}
                    >
                      Làm bài
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Normal Registered Classes View */
          <>
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

            <div className="mc-grid">
              {classes.map((c, i) => (
                <div className="mc-card" key={c.MaLopHoc} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="mc-card-header">
                    <div>
                      <h3 className="mc-card-name">{c.TenLop}</h3>
                      <span className="mc-card-code">{c.TenKhoaHoc}</span>
                    </div>
                    <div
                      className="mc-pct-circle"
                      style={{ "--pct-color": pctColor(c.TienDo || 0) } as React.CSSProperties}
                    >
                      {c.TienDo || 0}%
                    </div>
                  </div>

                  <div className="mc-card-meta">
                    {c.LichHoc && (
                      <span>
                        <FaCalendarAlt className="mc-icon" />
                        {c.LichHoc}
                      </span>
                    )}
                    <span>
                      <FaUsers className="mc-icon" />
                      {c.SoLuongHocVien || 0} học viên
                    </span>
                  </div>

                  <div className="mc-progress-row">
                    <span>
                      <FaChartLine className="mc-icon" />
                      Tiến độ khóa học
                    </span>
                    <span className="mc-progress-pct">{c.TienDo || 0}%</span>
                  </div>
                  <div className="mc-bar">
                    <div
                      className="mc-bar-fill"
                      style={{ width: `${c.TienDo || 0}%`, background: pctColor(c.TienDo || 0) }}
                    />
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
          </>
        )}
      </div>
    </>
  );
}

export default MyCourses;