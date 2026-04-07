import "./VocabularyPractice.css";
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

function VocabularyPractice() {
  const navigate    = useNavigate()
  const { id }      = useParams()
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
        try {
          const parsed = JSON.parse(d?.NoiDung || "{}")
          const vocabList: { word: string; meaning: string }[] = parsed.vocabList || []


          if (vocabList.length === 0) { setQuestions([]); return }


          // Tạo câu hỏi từ vocabList — hỏi nghĩa của từ
          const allMeanings = vocabList.map(v => v.meaning)


          const qs: Question[] = vocabList.map((item, i) => {
            // Lấy 3 đáp án sai ngẫu nhiên
            const wrongOptions = allMeanings
              .filter(m => m !== item.meaning)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)


            // Trộn đáp án đúng vào vị trí ngẫu nhiên
            const allOptions = [...wrongOptions, item.meaning].sort(() => Math.random() - 0.5)
            const correctIdx = allOptions.indexOf(item.meaning)


            return {
              id: i + 1,
              question: `What is the meaning of "${item.word}"?`,
              options: allOptions,
              correct: correctIdx,
              explanation: `"${item.word}" có nghĩa là "${item.meaning}".`,
            }
          })


          // Xáo trộn câu hỏi và lấy tối đa 8 câu
          setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, 8))
        } catch { setQuestions([]) }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])


  const handleSelect = (qId: number, optIdx: number) => {
    if (submitted) return
    setSelected(prev => ({ ...prev, [qId]: optIdx }))
  }


  const handleSubmit = () => {
    if (Object.keys(selected).length < questions.length) {
      alert("Vui lòng trả lời tất cả câu hỏi trước khi nộp bài!")
      return
    }
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }


  const handleReset = () => {
    setSelected({})
    setSubmitted(false)
    // Tạo lại câu hỏi mới khi làm lại
    if (data) {
      try {
        const parsed = JSON.parse(data.NoiDung || "{}")
        const vocabList: { word: string; meaning: string }[] = parsed.vocabList || []
        const allMeanings = vocabList.map(v => v.meaning)
        const qs: Question[] = vocabList.map((item, i) => {
          const wrongOptions = allMeanings
            .filter(m => m !== item.meaning)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
          const allOptions = [...wrongOptions, item.meaning].sort(() => Math.random() - 0.5)
          return {
            id: i + 1,
            question: `What is the meaning of "${item.word}"?`,
            options: allOptions,
            correct: allOptions.indexOf(item.meaning),
            explanation: `"${item.word}" có nghĩa là "${item.meaning}".`,
          }
        })
        setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, 8))
      } catch {}
    }
  }


  const score = submitted
    ? questions.filter(q => selected[q.id] === q.correct).length
    : 0
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0


  const getOptionClass = (q: Question, optIdx: number) => {
    if (!submitted) return selected[q.id] === optIdx ? "vp-option selected" : "vp-option"
    if (optIdx === q.correct) return "vp-option correct"
    if (selected[q.id] === optIdx && optIdx !== q.correct) return "vp-option wrong"
    return "vp-option"
  }


  return (
        <div className="vp-content">


          <nav className="vp-breadcrumb">
            <span className="vp-bc-link" onClick={() => navigate("/vocabulary")}>Từ vựng</span>
            <span className="vp-bc-sep">›</span>
            <span className="vp-bc-link" onClick={() => navigate(-1)}>{data?.TieuDe || "Bài học"}</span>
            <span className="vp-bc-sep">›</span>
            <span>Luyện tập</span>
          </nav>
          <button className="vp-back" onClick={() => navigate(-1)}>← Quay lại</button>


          <h1 className="vp-title">Luyện tập – {data?.TieuDe || "Từ vựng"}</h1>
          <p className="vp-sub">{questions.length} câu hỏi trắc nghiệm · Chọn đáp án đúng</p>


          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>
              Bài học này chưa có từ vựng để luyện tập.
            </div>
          ) : (
            <>
              {/* Score banner */}
              {submitted && (
                <div className={`vp-score-banner ${pct >= 70 ? "pass" : "fail"}`}>
                  <div className="vp-score-icon">
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
                    <p className="vp-score-main">Điểm của bạn: {score}/{questions.length} ({pct}%)</p>
                    <p className="vp-score-sub">
                      {pct === 100 ? "Xuất sắc! Bạn thuộc tất cả từ vựng chủ đề này." :
                       pct >= 70  ? "Tốt lắm! Xem lại các từ sai bên dưới nhé." :
                                    "Cần ôn tập thêm. Đọc phần giải thích để ghi nhớ hơn."}
                    </p>
                  </div>
                </div>
              )}


              {/* Questions */}
              <div className="vp-questions">
                {questions.map((q, qi) => (
                  <div key={q.id} className={`vp-question-card ${submitted && selected[q.id] !== q.correct ? "has-wrong" : ""}`}>
                    <div className="vp-question-header">
                      <span className="vp-q-num">Câu {qi + 1}</span>
                      {submitted && (
                        <span className={`vp-q-badge ${selected[q.id] === q.correct ? "badge-correct" : "badge-wrong"}`}>
                          {selected[q.id] === q.correct ? "✓ Đúng" : "✗ Sai"}
                        </span>
                      )}
                    </div>


                    <p className="vp-question-text">{q.question}</p>


                    <div className="vp-options">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={getOptionClass(q, optIdx)}
                          onClick={() => handleSelect(q.id, optIdx)}
                        >
                          <span className="vp-opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                          <span>{opt}</span>
                          {submitted && optIdx === q.correct && <span className="vp-opt-check">✓</span>}
                          {submitted && selected[q.id] === optIdx && optIdx !== q.correct && <span className="vp-opt-x">✗</span>}
                        </div>
                      ))}
                    </div>


                    {submitted && (
                      <div className="vp-explanation">
                        <span className="vp-explanation-label">💡 Giải thích: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>


              <div className="vp-footer">
                {!submitted ? (
                  <button className="vp-btn-submit" onClick={handleSubmit}>Nộp bài</button>
                ) : (
                  <>
                    <button className="vp-btn-reset" onClick={handleReset}>Làm lại</button>
                    <button className="vp-btn-back" onClick={() => navigate(-1)}>Quay lại từ vựng</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
  )
}


export default VocabularyPractice;

