import "./ClassDetailSV.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

function ClassDetailSV() {
  const navigate      = useNavigate()
  const { id }        = useParams() // MaLopHoc từ URL /class-detail/:id
  const [lopInfo, setLopInfo]     = useState<any>(null)
  const [lessons, setLessons]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      fetch(`${API}/classes/${id}/info`).then(r => r.json()),
      fetch(`${API}/classes/${id}/lessons`).then(r => r.json()),
    ])
      .then(([info, lessonsData]) => {
        setLopInfo(info)
        setLessons(Array.isArray(lessonsData) ? lessonsData : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const tongBuoi    = lessons.length
  const hienTai     = new Date()
  const buoiDaHoc   = lessons.filter(l => l.NgayKetThuc && new Date(l.NgayKetThuc) < hienTai).length
  const tienDo      = lopInfo?.TienDo ?? (tongBuoi > 0 ? Math.round((buoiDaHoc / tongBuoi) * 100) : 0)
  const circumference = 2 * Math.PI * 50

  if (loading) return (
        <div className="cld-content" style={{ display:"flex", alignItems:"center", justifyContent:"center", color:"#999" }}>
          Đang tải...
        </div>
  )

  if (!lopInfo) return (
        <div className="cld-content" style={{ display:"flex", alignItems:"center", justifyContent:"center", color:"#999" }}>
          Không tìm thấy lớp học.
        </div>
  )

  return (
        <div className="cld-content">

          {/* Breadcrumb */}
          <nav className="cld-breadcrumb">
            <span className="cld-link" onClick={() => navigate("/MyCourses")}>Khóa học</span>
            <span className="cld-sep">›</span>
            <span className="cld-active">{lopInfo.TenLop}</span>
          </nav>

          {/* Hero card */}
          <div className="cld-hero">
            <div className="cld-hero-left">
              <span className="cld-badge-online">🟢 Đang mở</span>
              <h1 className="cld-hero-title">{lopInfo.TenLop}</h1>
              <p className="cld-hero-code">Mã lớp: {lopInfo.MaLopHoc}</p>
              <p className="cld-hero-desc">
                {lopInfo.MoTa || "Khóa học tiếng Anh chất lượng cao tại FLIC Language Center, giúp học viên nắm vững ngữ pháp, từ vựng và kỹ năng giao tiếp thực tế."}
              </p>

              <div className="cld-meta-grid">
                {lopInfo.TenGiangVien && (
                  <div className="cld-meta-item">
                    <span className="cld-meta-icon">👩‍🏫</span>
                    <div>
                      <p className="cld-meta-label">Giáo viên</p>
                      <p className="cld-meta-val">{lopInfo.TenGiangVien}</p>
                    </div>
                  </div>
                )}
                {lopInfo.LichHoc && (
                  <div className="cld-meta-item">
                    <span className="cld-meta-icon">📅</span>
                    <div>
                      <p className="cld-meta-label">Lịch học</p>
                      <p className="cld-meta-val">{lopInfo.LichHoc}</p>
                    </div>
                  </div>
                )}
                <div className="cld-meta-item">
                  <span className="cld-meta-icon">👥</span>
                  <div>
                    <p className="cld-meta-label">Sĩ số</p>
                    <p className="cld-meta-val">{lopInfo.SoLuongHocVien || 0} học viên</p>
                  </div>
                </div>
                <div className="cld-meta-item">
                  <span className="cld-meta-icon">📚</span>
                  <div>
                    <p className="cld-meta-label">Khóa học</p>
                    <p className="cld-meta-val">{lopInfo.TenKhoaHoc || "—"}</p>
                  </div>
                </div>
                {lessons.length > 0 && (
                  <>
                    <div className="cld-meta-item">
                      <span className="cld-meta-icon">📆</span>
                      <div>
                        <p className="cld-meta-label">Bắt đầu</p>
                        <p className="cld-meta-val">
                          {lessons[0].NgayBatDau
                            ? new Date(lessons[0].NgayBatDau).toLocaleDateString("vi-VN")
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="cld-meta-item">
                      <span className="cld-meta-icon">🏁</span>
                      <div>
                        <p className="cld-meta-label">Kết thúc</p>
                        <p className="cld-meta-val">
                          {lessons[lessons.length - 1].NgayKetThuc
                            ? new Date(lessons[lessons.length - 1].NgayKetThuc).toLocaleDateString("vi-VN")
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                <div className="cld-meta-item">
                  <span className="cld-meta-icon">📊</span>
                  <div>
                    <p className="cld-meta-label">Tiến độ</p>
                    <p className="cld-meta-val">{tienDo}% hoàn thành</p>
                  </div>
                </div>
              </div>

              <button className="cld-enter-btn" onClick={() => navigate(`/course-detail/${id}`)}>
                🎓 Vào lớp học
              </button>
            </div>

            {/* Progress circle */}
            <div className="cld-hero-right">
              <div className="cld-progress-circle">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" className="cld-circle-bg" />
                  <circle cx="60" cy="60" r="50" className="cld-circle-fill"
                    strokeDasharray={`${circumference * tienDo / 100} ${circumference}`}
                  />
                </svg>
                <div className="cld-circle-text">
                  <span className="cld-circle-pct">{tienDo}%</span>
                  <span className="cld-circle-label">Tiến độ</span>
                </div>
              </div>
              <div className="cld-stats">
                <div className="cld-stat">
                  <span className="cld-stat-num">{buoiDaHoc}/{tongBuoi}</span>
                  <span className="cld-stat-label">Buổi đã học</span>
                </div>
                <div className="cld-stat">
                  <span className="cld-stat-num">{tongBuoi}</span>
                  <span className="cld-stat-label">Tổng buổi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <h2 className="cld-timeline-title">📋 Lịch trình học tập chi tiết</h2>

          {lessons.length === 0 ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Chưa có buổi học nào.</div>
          ) : (
            <div className="cld-timeline">
              {lessons.map((lesson, i) => {
                const ngayKT  = lesson.NgayKetThuc ? new Date(lesson.NgayKetThuc) : null
                const ngayBD  = lesson.NgayBatDau  ? new Date(lesson.NgayBatDau)  : null
                const isDone    = ngayKT && ngayKT < hienTai
                const isCurrent = ngayBD && ngayBD <= hienTai && ngayKT && ngayKT >= hienTai

                return (
                  <div className={`cld-tl-item ${isDone ? "done" : ""}`} key={lesson.MaLesson}>
                    <div className="cld-tl-left">
                      <div className={`cld-tl-dot ${isDone ? "done" : isCurrent ? "current" : ""}`}>
                        {isDone ? "✓" : lesson.ThuTu || i + 1}
                      </div>
                      {i < lessons.length - 1 && <div className="cld-tl-line" />}
                    </div>

                    <div
                      className={`cld-tl-card ${isCurrent ? "current" : ""}`}
                      onClick={() => navigate(`/course-detail/${id}`)}
                      style={{ cursor:"pointer" }}
                    >
                      <div className="cld-tl-header">
                        <div>
                          <span className="cld-tl-session">Buổi {lesson.ThuTu || i + 1}</span>
                          <h4 className="cld-tl-lesson">{lesson.TenLesson}</h4>
                        </div>
                        <span className="cld-tl-date">
                          📅 {ngayBD ? ngayBD.toLocaleDateString("vi-VN") : "—"}
                        </span>
                      </div>
                      {lesson.MoTa && (
                        <div className="cld-tl-topics">
                          <span className="cld-tl-topic">{lesson.MoTa}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
  );
}

export default ClassDetailSV;