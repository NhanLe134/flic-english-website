import "./Grammar.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

interface GrammarTopic {
  MaBaiHocMo: number;
  TieuDe: string;
  MoTa: string;
  CapDo: string;
  NoiDung: string;
  NgayTao: string;
  NgayDuyet: string;
}

function Grammar() {
  const [data, setData]     = useState<GrammarTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/baihocmo/public`)
      .then(r => r.json())
      .then(all => {
        // Chỉ lấy bài kỹ năng Grammar
        const grammar = Array.isArray(all)
          ? all.filter((b: any) => b.KyNang === "Grammar")
          : []
        setData(grammar)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(topic =>
    topic.TieuDe.toLowerCase().includes(search.toLowerCase()) ||
    topic.MoTa?.toLowerCase().includes(search.toLowerCase())
  )

  const capDoColor: Record<string, { bg: string; color: string }> = {
    "Beginner":     { bg: "#e8f5e9", color: "#2e7d32" },
    "Intermediate": { bg: "#fff3e0", color: "#e65100" },
    "Advanced":     { bg: "#fce4ec", color: "#c62828" },
    "TOEIC":        { bg: "#e3f2fd", color: "#1565c0" },
    "IELTS":        { bg: "#f3e5f5", color: "#6a1b9a" },
  }

  return (
        <div className="grammar-content">

          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#5a3e2b", margin:0 }}>📖 Ngữ Pháp</h1>
            <p style={{ color:"#888", fontSize:14, marginTop:4 }}>
              Tổng hợp các bài học ngữ pháp tiếng Anh miễn phí
            </p>
          </div>

          <div className="grammar-search">
            <span className="grammar-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm ngữ pháp..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : (
            <div className="grammar-list">
              {filtered.length === 0 ? (
                <p className="grammar-empty">Không tìm thấy kết quả.</p>
              ) : filtered.map(topic => {
                const clr = capDoColor[topic.CapDo] || { bg:"#f5f5f5", color:"#555" }
                return (
                  <div className="grammar-item" key={topic.MaBaiHocMo}>
                    <div className="grammar-item-info">
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
                      <p>{topic.MoTa || "Bài học ngữ pháp tiếng Anh"}</p>
                    </div>
                    <div className="grammar-item-right">
                      <span className="grammar-date">
                        🕐 {topic.NgayDuyet
                          ? new Date(topic.NgayDuyet).toLocaleDateString("vi-VN")
                          : topic.NgayTao
                            ? new Date(topic.NgayTao).toLocaleDateString("vi-VN")
                            : "—"}
                      </span>
                      <button
                        className="grammar-btn"
                        onClick={() => navigate(`/grammar/detail/${topic.MaBaiHocMo}`, {
                          state: { title: topic.TieuDe, subtitle: topic.MoTa }
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

export default Grammar;