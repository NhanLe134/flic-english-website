import "./CourseDetailSV.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://14.225.192.252:5000";

function CourseDetailSV() {
  const navigate        = useNavigate()
  const { id }          = useParams() // MaLopHoc
  const [lopInfo, setLopInfo]       = useState<any>(null)
  const [lessons, setLessons]       = useState<any[]>([])
  const [baiTaps, setBaiTaps]       = useState<any[]>([])
  const [taiLieus, setTaiLieus]     = useState<any[]>([])
  const [baiNops, setBaiNops]       = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [selectedSession, setSelectedSession] = useState("all")
  const [searchText, setSearchText] = useState("")

  const user = JSON.parse(sessionStorage.getItem("user") || "{}")

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      fetch(`${API}/classes/${id}/info`).then(r => r.json()),
      fetch(`${API}/classes/${id}/buoihoc`).then(r => r.json()),
      fetch(`${API}/classes/${id}/baitap`).then(r => r.json()),
      fetch(`${API}/classes/${id}/tailieu`).then(r => r.json()),
      fetch(`${API}/student/bainop/${user.MaNguoiDung}`).then(r => r.json()),
    ])
      .then(([info, lessonsData, exercises, tailieu, nops]) => {
        setLopInfo(info)
        setLessons(Array.isArray(lessonsData) ? lessonsData : [])
        setBaiTaps(Array.isArray(exercises) ? exercises : [])
        setTaiLieus(Array.isArray(tailieu) ? tailieu : [])
        setBaiNops(Array.isArray(nops) ? nops : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  // Sessions dropdown
  const sessionOptions = [
    { label: "Tất cả buổi", value: "all" },
    ...lessons.map(l => ({
      label: `Buổi ${l.ThuTu} – ${l.NgayBatDau ? new Date(l.NgayBatDau).toLocaleDateString("vi-VN") : ""}`,
      value: String(l.MaBuoiHoc)
    }))
  ]

  const filterBySession = <T extends { MaBuoiHoc?: number }>(arr: T[]) =>
    arr.filter(item => selectedSession === "all" || String(item.MaBuoiHoc) === selectedSession)

  const filterBySearch = <T extends { TieuDe?: string; Title?: string; TenBuoiHoc?: string }>(arr: T[]) =>
    arr.filter(item => {
      const name = item.TieuDe || item.Title || item.TenBuoiHoc || ""
      return name.toLowerCase().includes(searchText.toLowerCase())
    })

  const filteredLessons = filterBySearch(filterBySession(lessons.map(l => ({ ...l, MaBuoiHoc: l.MaBuoiHoc }))))
  const filteredBaiTaps = filterBySearch(filterBySession(baiTaps))
  const filteredTaiLieu = filterBySearch(filterBySession(taiLieus))

  // Tiến độ bài tập đã nộp
  const baiNopMap: Record<number, any> = {}
  baiNops.forEach((b: any) => { baiNopMap[b.MaBaiTap] = b })

  const hienTai   = new Date()
  const buoiDaHoc = lessons.filter(l => l.NgayKetThuc && new Date(l.NgayKetThuc) < hienTai).length
  // const tienDo    = lopInfo?.TienDo ?? (lessons.length > 0 ? Math.round(buoiDaHoc / lessons.length * 100) : 0)

  const diemList  = baiNops.filter((b: any) => b.Diem !== null)
  const diemTB    = diemList.length > 0
    ? (diemList.reduce((a: number, b: any) => a + b.Diem, 0) / diemList.length).toFixed(1)
    : null

  if (loading) return (
    <>
        <div className="cd-content" style={{ display:"flex", alignItems:"center", justifyContent:"center", color:"#999" }}>
          Đang tải...
        </div>
    </>
  )

  return (
    <>
        <div className="cd-content">

          {/* Header */}
          <div className="cd-header">
            <div>
              <h1 className="cd-title">{lopInfo?.TenLop || "Lớp học"}</h1>
              <p className="cd-sub">{lopInfo?.TenKhoaHoc || ""} · Theo dõi tiến độ học tập của bạn</p>
            </div>
            <div className="cd-session-badge">
              <span className="cd-session-dot" />
              Đang học · Buổi {buoiDaHoc}/{lessons.length}
            </div>
          </div>

          {/* Filter bar */}
          <div className="cd-filter-bar">
            <div className="cd-search-wrap">
              <span>🔍</span>
              <input
                className="cd-search"
                placeholder="Tìm kiếm bài học, bài tập, tài liệu..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
            <div className="cd-select-wrap">
              <select className="cd-select" value={selectedSession} onChange={e => setSelectedSession(e.target.value)}>
                {sessionOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <span className="cd-select-arrow">▾</span>
            </div>
          </div>

          <div className="cd-grid">

            {/* Bài học */}
            <div className="cd-card">
              <h3 className="cd-card-title">
                📚 Bài học của tôi
                <span className="cd-count">{filteredLessons.length}</span>
              </h3>
              <div className="cd-scroll-list">
                {filteredLessons.length === 0
                  ? <p className="cd-empty">Không có bài học nào.</p>
                  : filteredLessons.map((l: any) => (
                    <div className="cd-lesson" key={l.MaBuoiHoc}>
                      <div className="cd-lesson-left">
                        <div className="cd-lesson-icon video">📖</div>
                        <div>
                          <p className="cd-lesson-title">{l.TenBuoiHoc}</p>
                          <p className="cd-lesson-date">
                            <span className="cd-lesson-num sm">Buổi {l.ThuTu}</span>
                            &nbsp;📅 {l.NgayBatDau ? new Date(l.NgayBatDau).toLocaleDateString("vi-VN") : "—"}
                          </p>
                        </div>
                      </div>
                      <button className="cd-btn-orange" onClick={() => navigate(`/lesson-detail/${id}/${l.MaBuoiHoc}`)}>
                        Xem
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Bài tập */}
            <div className="cd-card">
              <div className="cd-card-header">
                <h3 className="cd-card-title">
                  📝 Bài tập
                  <span className="cd-count">{filteredBaiTaps.length}</span>
                </h3>
              </div>
              <div className="cd-scroll-list">
                {filteredBaiTaps.length === 0
                  ? <p className="cd-empty">Không có bài tập nào.</p>
                  : filteredBaiTaps.map((t: any) => {
                    const nop = baiNopMap[t.MaBaiTap]
                    const daNop = !!nop
                    return (
                      <div className="cd-task" key={t.MaBaiTap}>
                        <div>
                          <div className="cd-task-top">
                            <span className="cd-lesson-num sm">Buổi {t.ThuTuBuoiHoc}</span>
                            <p className="cd-task-title">{t.Title}</p>
                          </div>
                          <p className="cd-task-type">{t.Type}</p>
                          <div className="cd-task-meta">
                            <span className={`cd-badge ${daNop ? "submitted" : "pending"}`}>
                              {daNop ? `Đã nộp · ${nop.Diem !== null ? nop.Diem + "đ" : "Chờ chấm"}` : "Chưa nộp"}
                            </span>
                          </div>
                        </div>
                        {daNop
                          ? <span className="cd-done-check">✓</span>
                          : <button className="cd-btn-green"
                              onClick={() => navigate(`/baitap/${t.MaBaiTap}`, { state: { maLopHoc: id } })}>
                              Làm bài
                            </button>
                        }
                      </div>
                    )
                  })
                }
              </div>
            </div>

            {/* Tiến độ */}
            <div className="cd-card">
              <div className="cd-card-header">
                <h3 className="cd-card-title">📊 Tiến độ</h3>
                {diemTB && <span className="cd-avg">Điểm TB: {diemTB}</span>}
              </div>
              <div className="cd-scroll-list">
                {diemList.length === 0
                  ? <p className="cd-empty">Chưa có bài nộp nào được chấm.</p>
                  : diemList.map((item: any) => {
                    const pct = Math.round((item.Diem / 10) * 100)
                    return (
                      <div className="cd-progress-item" key={item.MaBaiNop}>
                        <div className="cd-progress-top">
                          <div>
                            <p className="cd-progress-name">{item.TenBaiTap || "Bài tập"}</p>
                            <p className="cd-progress-type">
                              {new Date(item.NgayNop).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                          <div className="cd-progress-right">
                            <span className="cd-score">{item.Diem}/10</span>
                          </div>
                        </div>
                        <div className="cd-bar">
                          <div style={{ width:`${pct}%`, background: pct >= 80 ? "#22c55e" : "#f97316" }} />
                        </div>
                      </div>
                    )
                  })
                }
              </div>
              {diemTB && (
                <p className="cd-motivation">
                  {Number(diemTB) >= 8 ? "🌟 Bạn đang học rất tốt! Hãy tiếp tục phát huy nhé."
                    : "💪 Cố gắng lên! Bạn có thể làm tốt hơn!"}
                </p>
              )}
            </div>

            {/* Tài liệu */}
            <div className="cd-card">
              <h3 className="cd-card-title">
                📁 Tài liệu
                <span className="cd-count">{filteredTaiLieu.length}</span>
              </h3>
              <div className="cd-scroll-list">
                {filteredTaiLieu.length === 0
                  ? <p className="cd-empty">Không có tài liệu nào.</p>
                  : filteredTaiLieu.map((doc: any) => (
                    <div className="cd-doc" key={doc.MaTaiLieu}>
                      <div className="cd-lesson-left">
                        <span className="cd-doc-icon">📄</span>
                        <span className="cd-doc-title">{doc.TieuDe}</span>
                      </div>
                      <button className="cd-btn-orange"
                        onClick={() => navigate(`/doc-detail/${doc.MaTaiLieu}`, { state: { title: doc.TieuDe } })}>
                        Xem
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>

          </div>
        </div>
    </>
  );
}

export default CourseDetailSV;