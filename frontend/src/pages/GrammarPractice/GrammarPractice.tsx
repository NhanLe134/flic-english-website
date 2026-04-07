import "./GrammarPractice.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:5000";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

function GrammarPractice() {
  const navigate    = useNavigate()
  const { id }      = useParams() // MaBaiHocMo
  const [data, setData]         = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`${API}/baihocmo/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d)
        // Parse câu hỏi từ NoiDung
        try {
          const parsed = JSON.parse(d?.NoiDung || "{}")
          const qs: Question[] = []

          // Dạng exercises (Grammar) — parse từng dòng
          if (parsed.exercises) {
            const lines = parsed.exercises.split("\n").filter((l: string) => l.trim())
            lines.forEach((line: string, i: number) => {
              // VD: "1. She ___ (work) every day. → works"
              const match = line.match(/^(\d+)\.\s(.+?)\s*→\s*(.+)$/)
              if (match) {
                const q = match[2].trim()
                const correct = match[3].trim()
                qs.push({
                  id: i + 1,
                  question: q,
                  options: shuffleWithCorrect(correct),
                  correct: 0, // correct luôn ở index 0 sau khi shuffle
                  explanation: `Đáp án: ${correct}`,
                })
              }
            })
          }

          // Dạng questions array (Reading/Listening)
          if (parsed.questions && Array.isArray(parsed.questions)) {
            parsed.questions.forEach((q: any, i: number) => {
              if (typeof q === "string") {
                qs.push({ id: i+1, question: q, options: [], correct: -1, explanation: "" })
              } else if (q.text && q.answer) {
                const opts = q.options
                  ? q.options.split(",").map((o: string) => o.trim())
                  : [q.answer]
                const correctIdx = opts.findIndex((o: string) => o === q.answer)
                qs.push({
                  id: i + 1,
                  question: q.text,
                  options: opts,
                  correct: correctIdx >= 0 ? correctIdx : 0,
                  explanation: `Đáp án đúng: ${q.answer}`,
                })
              }
            })
          }

          setQuestions(qs)
        } catch { setQuestions([]) }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  // Tạo options: đáp án đúng + 3 options giả
  function shuffleWithCorrect(correct: string): string[] {
    const fakes = ["always", "never", "sometimes", "usually",
                   "was", "were", "is", "are", "has", "have",
                   "can", "could", "should", "would", "might"]
    const opts = [correct]
    const pool = fakes.filter(f => f !== correct)
    for (let i = 0; i < 3 && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      opts.push(pool.splice(idx, 1)[0])
    }
    return opts
  }

  const handleSelect = (qId: number, optIdx: number) => {
    if (submitted) return
    setSelected(prev => ({ ...prev, [qId]: optIdx }))
  }

  const handleSubmit = () => {
    if (questions.length > 0 && Object.keys(selected).length < questions.length) {
      alert("Vui lòng trả lời tất cả câu hỏi trước khi nộp bài!")
      return
    }
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleReset = () => {
    setSelected({})
    setSubmitted(false)
  }

  const score = submitted
    ? questions.filter(q => selected[q.id] === q.correct).length
    : 0
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  const getOptionClass = (q: Question, optIdx: number) => {
    if (!submitted) return selected[q.id] === optIdx ? "gp-option selected" : "gp-option"
    if (optIdx === q.correct) return "gp-option correct"
    if (selected[q.id] === optIdx && optIdx !== q.correct) return "gp-option wrong"
    return "gp-option"
  }

  return (
        <div className="gp-content">

          <nav className="gp-breadcrumb">
            <span className="gp-bc-link" onClick={() => navigate("/grammar")}>Ngữ pháp</span>
            <span className="gp-bc-sep">›</span>
            <span className="gp-bc-link" onClick={() => navigate(-1)}>{data?.TieuDe || "Bài học"}</span>
            <span className="gp-bc-sep">›</span>
            <span>Luyện tập</span>
          </nav>
          <button className="gp-back" onClick={() => navigate(-1)}>← Quay lại</button>

          <h1 className="gp-title">Luyện tập – {data?.TieuDe || "Bài học"}</h1>
          <p className="gp-sub">{questions.length} câu hỏi · Chọn đáp án đúng</p>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>
              Bài học này chưa có câu hỏi luyện tập.
            </div>
          ) : (
            <>
              {/* Score banner */}
              {submitted && (
                <div className={`gp-score-banner ${pct >= 70 ? "pass" : "fail"}`}>
                  <div className="gp-score-icon">
                    {pct >= 70 ? (
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="currentColor" opacity=".15"/>
                        <circle cx="16" cy="16" r="12" fill="currentColor"/>
                        <path d="M9 16l5 5 9-9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="currentColor" opacity=".15"/>
                        <circle cx="16" cy="16" r="12" fill="currentColor"/>
                        <path d="M11 11l10 10M21 11L11 21" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="gp-score-main">Điểm của bạn: {score}/{questions.length} ({pct}%)</p>
                    <p className="gp-score-sub">
                      {pct === 100 ? "Xuất sắc! Bạn trả lời đúng tất cả câu." :
                       pct >= 70  ? "Tốt lắm! Hãy xem lại các câu sai bên dưới." :
                                    "Cần ôn tập thêm. Xem giải thích bên dưới nhé."}
                    </p>
                  </div>
                </div>
              )}

              {/* Questions */}
              <div className="gp-questions">
                {questions.map((q, qi) => (
                  <div key={q.id} className={`gp-question-card ${submitted && selected[q.id] !== q.correct ? "has-wrong" : ""}`}>
                    <div className="gp-question-header">
                      <span className="gp-q-num">Câu {qi + 1}</span>
                      {submitted && (
                        <span className={`gp-q-badge ${selected[q.id] === q.correct ? "badge-correct" : "badge-wrong"}`}>
                          {selected[q.id] === q.correct ? "✓ Đúng" : "✗ Sai"}
                        </span>
                      )}
                    </div>

                    <p className="gp-question-text">{q.question}</p>

                    {q.options.length > 0 && (
                      <div className="gp-options">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={getOptionClass(q, optIdx)}
                            onClick={() => handleSelect(q.id, optIdx)}
                          >
                            <span className="gp-opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                            <span>{opt}</span>
                            {submitted && optIdx === q.correct && <span className="gp-opt-check">✓</span>}
                            {submitted && selected[q.id] === optIdx && optIdx !== q.correct && <span className="gp-opt-x">✗</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {submitted && q.explanation && (
                      <div className="gp-explanation">
                        <span className="gp-explanation-label">💡 Giải thích: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="gp-footer">
                {!submitted ? (
                  <button className="gp-btn-submit" onClick={handleSubmit}>Nộp bài</button>
                ) : (
                  <>
                    <button className="gp-btn-reset" onClick={handleReset}>Làm lại</button>
                    <button className="gp-btn-back" onClick={() => navigate(-1)}>Quay lại lý thuyết</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
  )
}

export default GrammarPractice;