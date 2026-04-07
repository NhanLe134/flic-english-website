import "./Vocabulary.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

function Vocabulary() {
  const [data, setData]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/baihocmo/public`)
      .then(r => r.json())
      .then(all => {
        const vocab = Array.isArray(all)
          ? all.filter((b: any) => b.KyNang === "Vocabulary")
          : []
        setData(vocab)
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
        <div className="vocab-content">

          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#5a3e2b", margin:0 }}>📚 Từ Vựng</h1>
            <p style={{ color:"#888", fontSize:14, marginTop:4 }}>
              Tổng hợp các chủ đề từ vựng tiếng Anh miễn phí
            </p>
          </div>

          <div className="vocab-search">
            <span className="vocab-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm từ vựng theo chủ đề..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : (
            <div className="vocab-list">
              {filtered.length === 0 ? (
                <p className="vocab-empty">Không tìm thấy kết quả.</p>
              ) : filtered.map(topic => {
                const clr = capDoColor[topic.CapDo] || { bg:"#f5f5f5", color:"#555" }
                return (
                  <div className="vocab-item" key={topic.MaBaiHocMo}>
                    <div className="vocab-item-info">
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <h3 style={{ margin:0 }}>{topic.TieuDe}</h3>
                        {topic.CapDo && (
                          <span style={{
                            background: clr.bg, color: clr.color,
                            padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600
                          }}>
                            {topic.CapDo}
                          </span>
                        )}
                      </div>
                      <p>{topic.MoTa || "Bài học từ vựng tiếng Anh"}</p>
                    </div>
                    <div className="vocab-item-right">
                      <span className="vocab-date">
                        🕐 {topic.NgayDuyet
                          ? new Date(topic.NgayDuyet).toLocaleDateString("vi-VN")
                          : topic.NgayTao
                            ? new Date(topic.NgayTao).toLocaleDateString("vi-VN")
                            : "—"}
                      </span>
                      <button
                        className="vocab-btn"
                        onClick={() => navigate(`/vocabulary/detail/${topic.MaBaiHocMo}`, {
                          state: { title: topic.TieuDe }
                        })}
                      >
                        Xem Chi Tiết
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
  )
}

export default Vocabulary;