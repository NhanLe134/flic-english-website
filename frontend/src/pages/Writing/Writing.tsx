import "./Writing.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

function Writing() {
  const [data, setData]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/baihocmo/public`)
      .then(r => r.json())
      .then(all => {
        const writing = Array.isArray(all)
          ? all.filter((b: any) => b.KyNang === "Writing")
          : []
        setData(writing)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(t =>
    t.TieuDe.toLowerCase().includes(search.toLowerCase()) ||
    t.MoTa?.toLowerCase().includes(search.toLowerCase())
  )

  const capDoColor: Record<string, { bg: string; color: string }> = {
    "Beginner":     { bg:"#e8f5e9", color:"#2e7d32" },
    "Intermediate": { bg:"#fff3e0", color:"#e65100" },
    "Advanced":     { bg:"#fce4ec", color:"#c62828" },
    "TOEIC":        { bg:"#e3f2fd", color:"#1565c0" },
    "IELTS":        { bg:"#f3e5f5", color:"#6a1b9a" },
  }

  return (
        <div className="wr-content">

          {/* Breadcrumb */}
          <nav className="wr-breadcrumb">
            <span className="wr-link" onClick={() => navigate("/skills")}>Kỹ Năng</span>
            <span className="wr-sep">›</span>
            <span className="wr-active">Writing</span>
          </nav>

          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#5a3e2b", margin:0 }}>✍️ Writing</h1>
            <p style={{ color:"#888", fontSize:14, marginTop:4 }}>
              Tổng hợp các bài học kỹ năng viết tiếng Anh miễn phí
            </p>
          </div>

          {/* Search */}
          <div className="wr-search">
            <span>🔍</span>
            <input
              placeholder="Tìm kiếm theo chủ đề..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : (
            <div className="wr-list">
              {filtered.length === 0 ? (
                <p className="wr-empty">Không tìm thấy chủ đề.</p>
              ) : filtered.map(topic => {
                const clr = capDoColor[topic.CapDo] || { bg:"#f5f5f5", color:"#555" }
                return (
                  <div className="wr-item" key={topic.MaBaiHocMo}>
                    <div className="wr-item-text">
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <p className="wr-item-title" style={{ margin:0 }}>{topic.TieuDe}</p>
                        {topic.CapDo && (
                          <span style={{
                            background: clr.bg, color: clr.color,
                            padding:"2px 8px", borderRadius:12,
                            fontSize:11, fontWeight:600, whiteSpace:"nowrap"
                          }}>
                            {topic.CapDo}
                          </span>
                        )}
                      </div>
                      <p className="wr-item-desc">{topic.MoTa || "Bài học kỹ năng viết tiếng Anh"}</p>
                    </div>
                    <button
                      className="wr-btn"
                      onClick={() => navigate(`/skills/writing/detail/${topic.MaBaiHocMo}`, {
                        state: { title: topic.TieuDe }
                      })}
                    >
                      Xem Chi Tiết
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
  )
}

export default Writing;