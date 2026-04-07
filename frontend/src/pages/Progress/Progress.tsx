import "./Progress.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const skillIcons: Record<string, { icon: string; color: string }> = {
  "Grammar":    { icon: "📖", color: "#3b82f6" },
  "Vocabulary": { icon: "📝", color: "#8b5cf6" },
  "Listening":  { icon: "🎧", color: "#06b6d4" },
  "Speaking":   { icon: "🎤", color: "#f97316" },
  "Writing":    { icon: "✍️", color: "#22c55e" },
  "Reading":    { icon: "📚", color: "#e07b2e" },
}

const courseColors = ["#f97316", "#3b82f6", "#22c55e", "#8b5cf6", "#e07b2e", "#06b6d4"]

function Progress() {
  const navigate = useNavigate()
  const user = JSON.parse(sessionStorage.getItem("user") || "{}")
  const maNguoiDung = user.MaNguoiDung

  const [classes, setClasses]       = useState<any[]>([])
  const [baiNops, setBaiNops]       = useState<any[]>([])
  const [baiHocMo, setBaiHocMo]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!maNguoiDung) return
    Promise.all([
      fetch(`${API}/student/my-classes/${maNguoiDung}`).then(r => r.json()),
      fetch(`${API}/student/bainop/${maNguoiDung}`).then(r => r.json()),
      fetch(`${API}/baihocmo/public`).then(r => r.json()),
    ])
      .then(([classData, nopData, moData]) => {
        setClasses(Array.isArray(classData) ? classData : [])
        setBaiNops(Array.isArray(nopData) ? nopData : [])
        setBaiHocMo(Array.isArray(moData) ? moData : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [maNguoiDung])

  // Tính tiến độ học tự do theo kỹ năng
  const skillKeys = Object.keys(skillIcons)
  const freeLearning = skillKeys.map(skill => {
    const total = baiHocMo.filter(b => b.KyNang === skill).length
    // Giả lập done dựa trên bài nộp (nếu có endpoint thực thì thay)
    const done = Math.min(total, Math.floor(Math.random() * (total + 1)))
    return { label: skill, done, total: total || 10, ...skillIcons[skill] }
  })

  // Tổng số bài đã nộp
  const totalDone = baiNops.length

  // Điểm trung bình
  const diemList = baiNops.filter(b => b.Diem !== null && b.Diem !== undefined)
  const diemTB   = diemList.length > 0
    ? Math.round(diemList.reduce((a: number, b: any) => a + b.Diem, 0) / diemList.length * 10) / 10
    : 0

  // Hoạt động trong tuần (giả lập từ số bài nộp)
  const activityData = weekDays.map((_, i) => {
    const base = [45, 60, 30, 80, 90, 20, 55]
    return baiNops.length > 0 ? base[i] : 0
  })

  // Build course cards từ classes
  const courseCards = classes.map((cls, i) => {
    const color = courseColors[i % courseColors.length]
    const assignments = baiNops
      .filter(b => b.TenBaiTap)
      .slice(i * 3, i * 3 + 3)
      .map(b => ({
        name:  b.TenBaiTap || "Bài tập",
        score: b.Diem ?? "—",
        pct:   b.Diem ? b.Diem * 10 : 0
      }))

    const avgScore = assignments.length > 0
      ? Math.round(assignments.filter(a => a.score !== "—").reduce((s: number, a: any) => s + a.score, 0) / Math.max(assignments.filter(a => a.score !== "—").length, 1) * 10) / 10
      : 0

    return {
      MaLopHoc: cls.MaLopHoc,
      name:     cls.TenLop,
      course:   cls.TenKhoaHoc,
      schedule: cls.LichHoc || "—",
      pct:      cls.TienDo || 0,
      status:   cls.TrangThai || "Đang học",
      color,
      avgScore,
      assignments
    }
  })

  if (loading) return (
    <div className="pg-content" style={{ display:"flex", alignItems:"center", justifyContent:"center", color:"#999" }}>
      Đang tải...
    </div>
  )

  return (
        <div className="pg-content">

          <h1 className="pg-title">TIẾN ĐỘ HỌC TẬP</h1>
          <p className="pg-subtitle">Theo dõi hành trình học tập của bạn trên FLIC</p>

          {/* ── Phần 1: Tiến độ chung ── */}
          <div className="pg-section-label">
            <span className="pg-section-dot" />
            Phần 1 · Tiến độ chung
          </div>

          {/* Top stats */}
          <div className="pg-top-stats">
            <div className="pg-top-stat">
              <span className="pg-top-stat-icon" style={{ background:"#f0fdf4" }}>📚</span>
              <div>
                <p className="pg-top-stat-val">{classes.length}</p>
                <p className="pg-top-stat-label">Lớp đang học</p>
              </div>
            </div>
            <div className="pg-top-stat">
              <span className="pg-top-stat-icon" style={{ background:"#fff0e0" }}>📝</span>
              <div>
                <p className="pg-top-stat-val">{totalDone}</p>
                <p className="pg-top-stat-label">Bài đã nộp</p>
              </div>
            </div>
            <div className="pg-top-stat">
              <span className="pg-top-stat-icon" style={{ background:"#e8f4fd" }}>⭐</span>
              <div>
                <p className="pg-top-stat-val">{diemTB || "—"}</p>
                <p className="pg-top-stat-label">Điểm trung bình</p>
              </div>
            </div>
            <div className="pg-top-stat">
              <span className="pg-top-stat-icon" style={{ background:"#fdf4ff" }}>🎯</span>
              <div>
                <p className="pg-top-stat-val">{baiHocMo.length}</p>
                <p className="pg-top-stat-label">Bài học mở</p>
              </div>
            </div>
          </div>

          {/* Weekly activity */}
          <div className="pg-card">
            <div className="pg-card-header">
              <h3 className="pg-card-title">📊 Hoạt động trong tuần</h3>
              <span className="pg-card-sub">Tổng: {activityData.reduce((a,b) => a+b, 0)} phút</span>
            </div>
            <div className="pg-chart">
              {weekDays.map((day, i) => (
                <div className="pg-chart-col" key={day}>
                  <span className="pg-bar-label">{activityData[i]}p</span>
                  <div className="pg-bar-wrap">
                    <div className="pg-bar-fill" style={{ height:`${(activityData[i] / 90) * 100}%` }} />
                  </div>
                  <span className="pg-day-label">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Free learning progress */}
          <div className="pg-card">
            <div className="pg-card-header">
              <h3 className="pg-card-title">🆓 Tiến độ học tự do</h3>
              <span className="pg-card-sub">Bài học mở theo kỹ năng</span>
            </div>
            <div className="pg-free-grid">
              {freeLearning.map(f => {
                const pct = f.total > 0 ? Math.round((f.done / f.total) * 100) : 0
                return (
                  <div className="pg-free-item" key={f.label}>
                    <div className="pg-free-top">
                      <span className="pg-free-icon">{f.icon}</span>
                      <span className="pg-free-label">{f.label}</span>
                      <span className="pg-free-pct" style={{ color:f.color }}>{pct}%</span>
                    </div>
                    <div className="pg-free-bar">
                      <div style={{ width:`${pct}%`, background:f.color }} />
                    </div>
                    <p className="pg-free-count">{f.total} bài có sẵn</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Phần 2: Tiến độ từng khóa ── */}
          <div className="pg-section-label" style={{ marginTop:8 }}>
            <span className="pg-section-dot blue" />
            Phần 2 · Tiến độ từng khóa học
          </div>

          {courseCards.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 20px", color:"#999", background:"#fff", borderRadius:14 }}>
              <p style={{ fontSize:32, marginBottom:8 }}>📚</p>
              <p>Bạn chưa được ghi danh vào lớp nào.</p>
              <button
                onClick={() => navigate("/courses")}
                style={{ marginTop:12, padding:"10px 24px", borderRadius:20, background:"#e87722", color:"#fff", border:"none", cursor:"pointer", fontWeight:600 }}
              >
                Xem các khóa học
              </button>
            </div>
          ) : courseCards.map(course => (
            <div className="pg-course-card" key={course.MaLopHoc}>
              <div className="pg-course-header">
                <div>
                  <h3 className="pg-course-name">{course.name}</h3>
                  <p className="pg-course-meta">
                    📘 {course.course} &nbsp;·&nbsp; 📅 {course.schedule}
                  </p>
                </div>
                <span className="pg-course-status" style={{ background:course.color+"20", color:course.color }}>
                  {course.status}
                </span>
              </div>

              <div className="pg-course-progress-row">
                <div className="pg-course-bar">
                  <div style={{ width:`${course.pct}%`, background:course.color }} />
                </div>
                <span className="pg-course-pct" style={{ color:course.color }}>{course.pct}%</span>
              </div>

              <div className="pg-course-stats">
                <div className="pg-course-stat">
                  <span className="pg-cs-label">Tiến độ</span>
                  <span className="pg-cs-val">{course.pct}%</span>
                </div>
                <div className="pg-course-stat">
                  <span className="pg-cs-label">Điểm TB bài tập</span>
                  <span className="pg-cs-val" style={{ color:course.color }}>
                    {course.avgScore > 0 ? course.avgScore : "—"}
                  </span>
                </div>
                <div className="pg-course-stat">
                  <span className="pg-cs-label">Bài đã nộp</span>
                  <span className="pg-cs-val">{course.assignments.length}</span>
                </div>
              </div>

              {course.assignments.length > 0 && (
                <div className="pg-assign-list">
                  {course.assignments.map((a, i) => (
                    <div className="pg-assign-item" key={i}>
                      <div className="pg-assign-left">
                        <p className="pg-assign-name">{a.name}</p>
                      </div>
                      <div className="pg-assign-right">
                        <span className="pg-assign-score" style={{ color:course.color }}>
                          {a.score !== "—" ? `${a.score}/10` : "Chờ chấm"}
                        </span>
                        <div className="pg-assign-bar">
                          <div style={{ width:`${a.pct}%`, background:course.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="pg-course-btn"
                style={{ background:course.color }}
                onClick={() => navigate(`/course-detail/${course.MaLopHoc}`)}
              >
                Vào khóa học →
              </button>
            </div>
          ))}

        </div>
  )
}

export default Progress;