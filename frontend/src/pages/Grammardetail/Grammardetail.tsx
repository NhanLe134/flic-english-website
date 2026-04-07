import "./Grammardetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

function Grammardetail() {
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

  const renderContent = () => {
    if (!data?.NoiDung) return <p style={{ color:"#999" }}>Chưa có nội dung.</p>

    if (data.NoiDung.includes("<") && !data.NoiDung.startsWith("{")) {
      return <div dangerouslySetInnerHTML={{ __html: data.NoiDung }} />
    }

    if (parsed) {
      return (
        <div className="gd-sections">
          {parsed.subtitle && (
            <div className="gd-section">
              <h2 className="gd-section-title">📘 {parsed.subtitle}</h2>
            </div>
          )}

          {parsed.explanation && (
            <div className="gd-section">
              <h2 className="gd-section-title">🔵 Giải thích</h2>
              <div className="gd-section-body">
                {parsed.explanation.split("\n").map((line: string, i: number) =>
                  line.trim() === "" ? <br key={i} /> : <p key={i} style={{ margin:"4px 0" }}>{line}</p>
                )}
              </div>
            </div>
          )}

          {parsed.vocabList && (
            <div className="gd-section">
              <h2 className="gd-section-title">📚 Danh sách từ vựng</h2>
              <div className="gd-section-body">
                <table className="gd-table">
                  <thead><tr><th>Từ / Cụm từ</th><th>Nghĩa</th></tr></thead>
                  <tbody>
                    {parsed.vocabList.map((v: any, i: number) => (
                      <tr key={i}><td><strong>{v.word}</strong></td><td>{v.meaning}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {parsed.passage && (
            <div className="gd-section">
              <h2 className="gd-section-title">📖 Đoạn văn</h2>
              <div className="gd-section-body">
                <p style={{ lineHeight:1.8, background:"#f9f5f0", padding:16, borderRadius:10 }}>
                  {parsed.passage}
                </p>
              </div>
            </div>
          )}

          {parsed.vocab && (
            <div className="gd-section">
              <h2 className="gd-section-title">📚 Từ vựng trọng tâm</h2>
              <div className="gd-section-body">
                <table className="gd-table">
                  <thead><tr><th>Từ</th><th>Nghĩa</th></tr></thead>
                  <tbody>
                    {parsed.vocab.map((v: any, i: number) => (
                      <tr key={i}><td><strong>{v.word}</strong></td><td>{v.meaning}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {parsed.questions && (
            <div className="gd-section">
              <h2 className="gd-section-title">❓ Câu hỏi luyện tập</h2>
              <div className="gd-section-body">
                <ol>
                  {(Array.isArray(parsed.questions) ? parsed.questions : []).map((q: any, i: number) => (
                    <li key={i} style={{ marginBottom:8 }}>
                      {typeof q === "string" ? q : q.text}
                      {q.answer && <span style={{ marginLeft:8, color:"#2e7d32", fontWeight:600 }}>→ {q.answer}</span>}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {parsed.exercises && (
            <div className="gd-section">
              <h2 className="gd-section-title">✏️ Bài tập</h2>
              <div className="gd-section-body">
                {parsed.exercises.split("\n").map((line: string, i: number) =>
                  line.trim() === "" ? <br key={i} /> : <p key={i} style={{ margin:"6px 0" }}>{line}</p>
                )}
              </div>
            </div>
          )}

          {parsed.phrases && (
            <div className="gd-section">
              <h2 className="gd-section-title">🎤 Cụm từ thực hành</h2>
              <div className="gd-section-body">
                {parsed.phrases.map((p: any, i: number) => (
                  <div key={i} style={{ background:"#f9f5f0", borderRadius:10, padding:"12px 16px", marginBottom:12 }}>
                    <p style={{ fontWeight:600, margin:0 }}>{p.text}</p>
                    {p.phonetic && <p style={{ color:"#888", fontSize:13, margin:"4px 0" }}>{p.phonetic}</p>}
                    {p.translation && <p style={{ color:"#e87722", fontSize:14, margin:0 }}>→ {p.translation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed.tips && (
            <div className="gd-section">
              <h2 className="gd-section-title">💡 Mẹo học</h2>
              <div className="gd-section-body">
                <p style={{ background:"#fffde7", padding:12, borderRadius:10, borderLeft:"4px solid #f9a825" }}>
                  {parsed.tips}
                </p>
              </div>
            </div>
          )}

          {parsed.samples && (
            <div className="gd-section">
              <h2 className="gd-section-title">📝 Bài mẫu theo cấp độ</h2>
              <div className="gd-section-body">
                {Object.entries(parsed.samples).map(([level, text]) => (
                  <div key={level} style={{ marginBottom:16 }}>
                    <span style={{ background:"#e3f2fd", color:"#1565c0", padding:"2px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>
                      {level}
                    </span>
                    <p style={{ marginTop:8, lineHeight:1.8, color:"#444" }}>{text as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed.objectives && (
            <div className="gd-section">
              <h2 className="gd-section-title">🎯 Mục tiêu bài học</h2>
              <div className="gd-section-body">
                <ul>{parsed.objectives.map((o: string, i: number) => <li key={i}>{o}</li>)}</ul>
              </div>
            </div>
          )}

          {parsed.guide && (
            <div className="gd-section">
              <h2 className="gd-section-title">📋 Hướng dẫn</h2>
              <div className="gd-section-body">
                <p style={{ color:"#555" }}>{parsed.guide}</p>
              </div>
            </div>
          )}

          {parsed.prompt && (
            <div className="gd-section">
              <h2 className="gd-section-title">🖊️ Đề bài</h2>
              <div className="gd-section-body">
                <p style={{ background:"#f3e5f5", padding:12, borderRadius:10, fontStyle:"italic" }}>
                  {parsed.prompt}
                </p>
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="gd-sections">
        <div className="gd-section">
          <div className="gd-section-body">
            <p style={{ whiteSpace:"pre-wrap", lineHeight:1.8 }}>{data.NoiDung}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
        <div className="gd-content">
          <button className="gd-back" onClick={() => navigate(-1)}>‹ Quay lại</button>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : !data ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Không tìm thấy bài học.</div>
          ) : (
            <>
              <div className="gd-header">
                <h1>{data.TieuDe}</h1>
                {data.MoTa && <p className="gd-subtitle">🔷 {data.MoTa}</p>}
                {data.CapDo && (
                  <span style={{ background:"#fff3e0", color:"#e87722", padding:"3px 12px", borderRadius:20, fontSize:13, fontWeight:600 }}>
                    {data.CapDo}
                  </span>
                )}
              </div>

              {renderContent()}

              {data.LinkUrl && (
                <div style={{ marginTop:20, textAlign:"center" }}>
                  <a href={data.LinkUrl} target="_blank" rel="noreferrer"
                    style={{ color:"#e87722", fontWeight:600, fontSize:15 }}>
                    🔗 Xem tài nguyên bổ sung
                  </a>
                </div>
              )}

              {/* ── Nút Luyện tập ── */}
              <div className="gd-footer-btn">
                <button
                  className="gd-practice-btn"
                  onClick={() => navigate(`/grammar/practice/${id}`)}
                >
                  ✏️ Luyện tập
                </button>
              </div>
            </>
          )}
        </div>
  )
}

export default Grammardetail;