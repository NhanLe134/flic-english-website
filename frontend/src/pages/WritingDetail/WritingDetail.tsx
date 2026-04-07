import "./WritingDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

function WritingDetail() {
  const navigate        = useNavigate()
  const { id }          = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`${API}/baihocmo/${id}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id])

  const parsed = (() => {
    if (!data?.NoiDung) return null
    try { return JSON.parse(data.NoiDung) } catch { return null }
  })()

  // Build sections từ parsed JSON
  const buildSections = () => {
    if (!parsed) return []
    const sections: { title: string; items: { label: string; bullets: string[] }[] }[] = []

    // Prompt → Section A
    if (parsed.prompt) {
      sections.push({
        title: "A. Đề bài (Writing Prompt)",
        items: [{ label: "📌 Yêu cầu", bullets: [parsed.prompt] }]
      })
    }

    // Guide → Section B
    if (parsed.guide) {
      const steps = parsed.guide.split("→").map((s: string) => s.trim()).filter(Boolean)
      sections.push({
        title: "B. Hướng dẫn cấu trúc",
        items: [{ label: "📋 Các bước", bullets: steps.length > 1 ? steps : [parsed.guide] }]
      })
    }

    // Samples → Section C
    if (parsed.samples && Object.keys(parsed.samples).length > 0) {
      const cefrOrder = ["A2", "B1", "B2", "C1"]
      const items = cefrOrder
        .filter(lvl => parsed.samples[lvl])
        .map(lvl => ({
          label: `Bài mẫu cấp ${lvl}`,
          bullets: [parsed.samples[lvl]]
        }))
      if (items.length > 0) {
        sections.push({ title: "C. Bài mẫu theo cấp độ CEFR", items })
      }
    }

    return sections
  }

  const sections = buildSections()

  // Tips
  const tips: string[] = parsed?.tips
    ? (typeof parsed.tips === "string"
        ? parsed.tips.split("\n").filter((t: string) => t.trim())
        : parsed.tips)
    : []

  return (
        <div className="wd-content">

          {/* Breadcrumb + Back */}
          <div className="wd-top">
            <nav className="wd-breadcrumb">
              <span className="wd-link" onClick={() => navigate("/skills/writing")}>Kỹ Năng</span>
              <span className="wd-sep">›</span>
              <span className="wd-link" onClick={() => navigate("/skills/writing")}>Writing</span>
            </nav>
            <button className="wd-back" onClick={() => navigate(-1)}>← Quay lại</button>
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : !data ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Không tìm thấy bài học.</div>
          ) : (
            <>
              <h1 className="wd-title">{data.TieuDe}</h1>
              {data.MoTa && <p className="wd-subtitle">{data.MoTa}</p>}
              {data.CapDo && (
                <span style={{ background:"#fff3e0", color:"#e87722", padding:"3px 12px", borderRadius:20, fontSize:13, fontWeight:600, display:"inline-block", marginBottom:16 }}>
                  {data.CapDo}
                </span>
              )}

              {/* Sections */}
              {sections.map(section => (
                <div className="wd-card" key={section.title}>
                  <h3 className="wd-section-title">{section.title}</h3>
                  {section.items.map(item => (
                    <div className="wd-item" key={item.label}>
                      <p className="wd-item-label">{item.label}</p>
                      <ul className="wd-bullets">
                        {item.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}

              {/* Tips */}
              {tips.length > 0 && (
                <div className="wd-card wd-tips">
                  <h3 className="wd-section-title">D. Writing Tips & Useful Phrases</h3>
                  {tips.map((tip, i) => (
                    <p className="wd-tip" key={i}>✅ {tip}</p>
                  ))}
                </div>
              )}

              {/* Link tài nguyên */}
              {data.LinkUrl && (
                <div style={{ marginBottom:16 }}>
                  <a href={data.LinkUrl} target="_blank" rel="noreferrer"
                    style={{ color:"#e87722", fontWeight:600 }}>
                    🔗 Xem tài nguyên bổ sung
                  </a>
                </div>
              )}

              {/* Nút Luyện tập */}
              <div className="wd-footer">
                <button
                  className="wd-submit-btn"
                  onClick={() => navigate(`/skills/writing/practice/${id}`, {
                    state: { title: data.TieuDe }
                  })}
                >
                  Luyện tập
                </button>
              </div>
            </>
          )}
        </div>
  )
}

export default WritingDetail;