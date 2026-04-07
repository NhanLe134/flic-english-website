import "./VocabularyDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

function VocabularyDetail() {
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

  const vocabList: { word: string; meaning: string; example?: string }[] = parsed?.vocabList || []

  // Lấy câu ví dụ — từ vocabList hoặc từ field examples riêng
  const examples: { word: string; sentence: string }[] = parsed?.examples || 
    vocabList.filter(v => v.example).map(v => ({ word: v.word, sentence: v.example! }))

  return (
        <div className="vd-content">

          <button className="vd-back" onClick={() => navigate(-1)}>‹ Quay lại</button>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : !data ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Không tìm thấy bài học.</div>
          ) : (
            <div className="vd-card">
              <h2 className="vd-title">{data.TieuDe}</h2>

              {data.MoTa && (
                <p style={{ color:"#888", fontSize:14, marginBottom:12 }}>{data.MoTa}</p>
              )}
              {data.CapDo && (
                <span style={{
                  background:"#fff3e0", color:"#e87722",
                  padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:600,
                  display:"inline-block", marginBottom:16
                }}>
                  {data.CapDo}
                </span>
              )}

              {/* Bảng từ vựng */}
              {vocabList.length > 0 && (
                <table className="vd-table">
                  <thead>
                    <tr>
                      <th>Từ vựng</th>
                      <th>Nghĩa tiếng Việt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vocabList.map((item, i) => (
                      <tr key={i}>
                        <td>{i + 1}. {item.word}</td>
                        <td>{item.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Câu ví dụ */}
              {examples.length > 0 && (
                <div className="vd-examples">
                  <p className="vd-examples-title">💡 <em>Câu ví dụ</em></p>
                  {examples.map((item, i) => (
                    <div key={i} className="vd-example-item">
                      <p className="vd-example-word"><em>{item.word}</em></p>
                      <p className="vd-example-sentence">➡️ <em>{item.sentence}</em></p>
                    </div>
                  ))}
                </div>
              )}

              {/* Nếu không có ví dụ riêng thì tạo từ vocabList */}
              {examples.length === 0 && vocabList.length > 0 && (
                <div className="vd-examples">
                  <p className="vd-examples-title">💡 <em>Ví dụ sử dụng</em></p>
                  {vocabList.slice(0, 5).map((item, i) => (
                    <div key={i} className="vd-example-item">
                      <p className="vd-example-word"><em>{item.word}</em></p>
                      <p className="vd-example-sentence">
                        ➡️ <em>The word "<strong>{item.word}</strong>" means "{item.meaning}" in Vietnamese.</em>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {data.LinkUrl && (
                <div style={{ marginTop:16 }}>
                  <a href={data.LinkUrl} target="_blank" rel="noreferrer"
                    style={{ color:"#e87722", fontWeight:600 }}>
                    🔗 Xem tài nguyên bổ sung
                  </a>
                </div>
              )}

              {/* Nút luyện tập */}
              <div className="vd-footer">
                <button
                  className="vd-practice-btn"
                  onClick={() => navigate(`/vocabulary/practice/${id}`, {
                    state: { title: data.TieuDe }
                  })}
                >
                  Luyện tập
                </button>
              </div>
            </div>
          )}
        </div>
  )
}

export default VocabularyDetail;