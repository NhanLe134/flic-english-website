import "./ReadingDetail.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:5000";

function ReadingDetail() {
  const navigate        = useNavigate()
  const { id }          = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [answers, setAnswers]       = useState<Record<number, string>>({})
  const [vocabInput, setVocabInput] = useState<Record<number, string>>({})
  const [vocabShown, setVocabShown] = useState<Record<number, boolean>>({})

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

  const passage: string[] = (() => {
    if (!parsed?.passage) return []
    if (Array.isArray(parsed.passage)) return parsed.passage
    return parsed.passage.split(/\n+/).filter((p: string) => p.trim())
  })()

  const vocab: { word: string; meaning: string }[] = parsed?.vocab || parsed?.vocabList || []

  // Questions — mỗi câu có text + answer (đáp án QTV nhập)
  const questions: { id: number; text: string; answer?: string }[] = (() => {
    if (!parsed?.questions) return []
    return (Array.isArray(parsed.questions) ? parsed.questions : []).map((q: any, i: number) => {
      if (typeof q === "string") return { id: i+1, text: q, answer: "" }
      return {
        id: i + 1,
        text: q.text || q.question || "",
        answer: q.answer || q.correctAnswer || ""   // ← đáp án QTV đã nhập
      }
    })
  })()

  const toggleVocab = (i: number) =>
    setVocabShown(prev => ({ ...prev, [i]: !prev[i] }))

  const handleSubmit = () => {
    const empty = questions.some(q => !answers[q.id]?.trim())
    if (empty && questions.length > 0) {
      alert("Vui lòng trả lời đầy đủ tất cả câu hỏi!")
      return
    }
    navigate("/skills/reading/submit-result", {
      state: {
        title:          data.TieuDe,
        id:             id,
        answers:        answers,                      // câu trả lời học sinh
        questions:      questions,                    // { id, text, answer }
        passage:        passage.join("\n"),            // đoạn văn gốc
        total:          10
      }
    })
  }

  return (
    <>
        <div className="rd-content">

          <nav className="rd-breadcrumb">
            <span className="rd-bc-link" onClick={() => navigate("/skills")}>Kỹ năng</span>
            <span className="rd-bc-sep">›</span>
            <span className="rd-bc-link" onClick={() => navigate("/skills/reading")}>Reading</span>
            <span className="rd-bc-sep">›</span>
            <span className="rd-bc-current">Chi tiết</span>
          </nav>
          <button className="rd-back" onClick={() => navigate(-1)}>← Quay lại</button>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : !data ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Không tìm thấy bài học.</div>
          ) : (
            <>
              <h1 className="rd-title">{data.TieuDe}</h1>
              {data.MoTa && <p style={{ color:"#888", marginBottom:12 }}>{data.MoTa}</p>}
              {data.CapDo && (
                <span style={{ background:"#fff3e0", color:"#e87722", padding:"3px 12px", borderRadius:20, fontSize:13, fontWeight:600, display:"inline-block", marginBottom:16 }}>
                  {data.CapDo}
                </span>
              )}

              {/* Reading Passage */}
              {passage.length > 0 && (
                <div className="rd-card">
                  <h2 className="rd-card-title">
                    <span className="rd-card-icon">📖</span> Bài đọc
                  </h2>
                  <div className="rd-passage-scroll">
                    {passage.map((para, i) => (
                      <p key={i} className="rd-para">{para}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary Practice */}
              {vocab.length > 0 && (
                <div className="rd-card">
                  <h2 className="rd-card-title">
                    <span className="rd-card-icon">📝</span> Luyện từ vựng
                  </h2>
                  <p className="rd-card-sub">
                    Nhập nghĩa tiếng Việt cho mỗi từ, sau đó bấm "Xem đáp án" để kiểm tra.
                  </p>
                  <div className="rd-vocab-scroll">
                    <table className="rd-vocab-table">
                      <thead>
                        <tr>
                          <th>Từ vựng</th>
                          <th>Nghĩa tiếng Anh</th>
                          <th>Nghĩa tiếng Việt (nhập vào)</th>
                          <th>Đáp án</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vocab.map((v, i) => (
                          <tr key={i}>
                            <td className="rd-vocab-word">{v.word}</td>
                            <td className="rd-vocab-meaning">{v.meaning}</td>
                            <td>
                              <input
                                className="rd-vocab-input"
                                placeholder="Nhập nghĩa tiếng Việt..."
                                value={vocabInput[i] || ""}
                                onChange={e => setVocabInput(prev => ({ ...prev, [i]: e.target.value }))}
                              />
                            </td>
                            <td>
                              <button className="rd-vocab-show-btn" onClick={() => toggleVocab(i)}>
                                {vocabShown[i] ? "Ẩn" : "Xem đáp án"}
                              </button>
                              {vocabShown[i] && (
                                <span className="rd-vocab-answer">{v.meaning}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Comprehension Questions */}
              {questions.length > 0 && (
                <div className="rd-card">
                  <h2 className="rd-card-title">
                    <span className="rd-card-icon">❓</span> Câu hỏi hiểu bài
                  </h2>
                  <div className="rd-questions">
                    {questions.map(q => (
                      <div key={q.id} className="rd-question-item">
                        <p className="rd-question-text">{q.id}. {q.text}</p>
                        <textarea
                          className="rd-answer-input"
                          placeholder="Nhập câu trả lời của bạn..."
                          value={answers[q.id] || ""}
                          onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.LinkUrl && (
                <div style={{ marginBottom:16 }}>
                  <a href={data.LinkUrl} target="_blank" rel="noreferrer"
                    style={{ color:"#e87722", fontWeight:600 }}>
                    🔗 Xem tài nguyên bổ sung
                  </a>
                </div>
              )}

              <div className="rd-footer">
                <button className="rd-btn-submit" onClick={handleSubmit}>Nộp bài</button>
              </div>
            </>
          )}
        </div>
    </>
  )
}

export default ReadingDetail;