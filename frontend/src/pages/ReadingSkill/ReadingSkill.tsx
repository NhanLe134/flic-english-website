import "./ReadingSkill.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const capDoMap: Record<string, { label: string; cls: string }> = {
  "Beginner":     { label: "Cơ bản",   cls: "rc-level-basic" },
  "Intermediate": { label: "Trung cấp", cls: "rc-level-mid" },
  "Advanced":     { label: "Nâng cao", cls: "rc-level-adv" },
  "TOEIC":        { label: "TOEIC",    cls: "rc-level-mid" },
  "IELTS":        { label: "IELTS",    cls: "rc-level-adv" },
}

function ReadingSkill() {
  const navigate = useNavigate()
  const [data, setData]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")

  useEffect(() => {
    fetch(`${API}/baihocmo/public`)
      .then(r => r.json())
      .then(all => {
        const reading = Array.isArray(all)
          ? all.filter((b: any) => b.KyNang === "Reading")
          : []
        setData(reading)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(r =>
    r.TieuDe.toLowerCase().includes(search.toLowerCase()) ||
    r.MoTa?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
        <div className="rc-content">

          {/* Breadcrumb */}
          <nav className="rc-breadcrumb">
            <span className="rc-bc-link" onClick={() => navigate("/skills")}>Kỹ năng</span>
            <span className="rc-bc-sep">›</span>
            <span className="rc-bc-current">Reading</span>
          </nav>

          {/* Header */}
          <div className="rc-header">
            <div>
              <h1 className="rc-title">Kỹ năng Reading</h1>
              <p className="rc-sub">Luyện đọc hiểu với các bài đọc đa dạng chủ đề và cấp độ</p>
            </div>
            <div className="rc-stats">
              <div className="rc-stat">
                <span className="rc-stat-num">{data.length}</span>
                <span className="rc-stat-label">Bài đọc</span>
              </div>
              <div className="rc-stat-divider" />
              <div className="rc-stat">
                <span className="rc-stat-num">
                  {new Set(data.map(d => d.CapDo)).size}
                </span>
                <span className="rc-stat-label">Cấp độ</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="rc-search-wrap">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="#bbb" strokeWidth="1.4"/>
              <path d="M10.5 10.5l3 3" stroke="#bbb" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              className="rc-search"
              placeholder="Tìm kiếm theo chủ đề..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="rc-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : (
            <div className="rc-list">
              {filtered.length === 0 && (
                <p className="rc-empty">Không tìm thấy bài đọc nào.</p>
              )}
              {filtered.map((r, i) => {
                const lvl = capDoMap[r.CapDo] || { label: r.CapDo, cls: "rc-level-basic" }
                return (
                  <div
                    className="rc-item"
                    key={r.MaBaiHocMo}
                    style={{ animationDelay:`${i * 40}ms` }}
                  >
                    <div className="rc-item-left">
                      <div className="rc-item-top">
                        <h3 className="rc-item-title">{r.TieuDe}</h3>
                        {r.CapDo && (
                          <span className={`rc-level ${lvl.cls}`}>{lvl.label}</span>
                        )}
                      </div>
                      <p className="rc-item-desc">
                        {r.MoTa || "Bài luyện đọc hiểu tiếng Anh"}
                      </p>
                      <div className="rc-item-meta">
                        <span className="rc-meta-chip">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                            <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                          </svg>
                          {r.CapDo === "Beginner" ? "10 phút"
                            : r.CapDo === "Intermediate" ? "12 phút"
                            : "15 phút"}
                        </span>
                      </div>
                    </div>
                    <button
                      className="rc-btn"
                      onClick={() => navigate(`/skills/reading/detail/${r.MaBaiHocMo}`, {
                        state: { title: r.TieuDe }
                      })}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
    </>
  )
}

export default ReadingSkill;