import "./Listening.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const capDoEmoji: Record<string, string> = {
  "Beginner":     "🟢",
  "Intermediate": "🟡",
  "Advanced":     "🔴",
  "TOEIC":        "💼",
  "IELTS":        "🎓",
}

function Listening() {
  const [data, setData]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/baihocmo/public`)
      .then(r => r.json())
      .then(all => {
        const listening = Array.isArray(all)
          ? all.filter((b: any) => b.KyNang === "Listening")
          : []
        setData(listening)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(topic =>
    topic.TieuDe.toLowerCase().includes(search.toLowerCase()) ||
    topic.MoTa?.toLowerCase().includes(search.toLowerCase())
  )

  const capDoColor: Record<string, { bg: string; color: string }> = {
    "Beginner":     { bg:"#e8f5e9", color:"#2e7d32" },
    "Intermediate": { bg:"#fff3e0", color:"#e65100" },
    "Advanced":     { bg:"#fce4ec", color:"#c62828" },
    "TOEIC":        { bg:"#e3f2fd", color:"#1565c0" },
    "IELTS":        { bg:"#f3e5f5", color:"#6a1b9a" },
  }

  return (
        <div className="listening-content">

          {/* Breadcrumb */}
          <nav className="listening-breadcrumb">
            <span>Kỹ Năng</span>
            <span className="sep">›</span>
            <span className="active">Listening</span>
          </nav>

          {/* Search */}
          <div className="listening-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm theo chủ đề..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <h1 className="listening-title">Listening – Luyện Nghe Mỗi Ngày</h1>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : (
            <div className="listening-grid">
              {filtered.length === 0 ? (
                <p className="listening-empty">Không tìm thấy chủ đề.</p>
              ) : filtered.map(topic => {
                const clr = capDoColor[topic.CapDo] || { bg:"#f5f5f5", color:"#555" }
                const emoji = capDoEmoji[topic.CapDo] || "🎧"
                return (
                  <div className="listening-card" key={topic.MaBaiHocMo}>
                    <div className="listening-card-top">
                      <span className="listening-card-emoji">{emoji}</span>
                      <strong>{topic.TieuDe}</strong>
                      {topic.CapDo && (
                        <span style={{
                          background: clr.bg, color: clr.color,
                          padding:"2px 8px", borderRadius:12, fontSize:11, fontWeight:600
                        }}>
                          {topic.CapDo}
                        </span>
                      )}
                    </div>
                    <p>{topic.MoTa || "Bài luyện nghe tiếng Anh"}</p>
                    <button
                      className="listening-btn"
                      onClick={() => navigate(`/skills/listening/detail/${topic.MaBaiHocMo}`, {
                        state: { title: topic.TieuDe }
                      })}
                    >
                      Truy cập
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
  )
}

export default Listening;