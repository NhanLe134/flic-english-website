import "./ReadingSubmit.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface GradedResult {
  questionId: number
  question:   string
  answer:     string       // câu trả lời học sinh
  correct:    string       // đáp án QTV
  score:      number       // 0, 1, hoặc 2
  feedback:   string
}

// So sánh câu trả lời học sinh với đáp án QTV
const gradeAnswer = (studentAns: string, correctAns: string): { score: number; feedback: string } => {
  const s = studentAns.toLowerCase().trim()
  const c = correctAns.toLowerCase().trim()

  if (!s) return { score: 0, feedback: "Chưa có câu trả lời." }
  if (!c) {
    // Không có đáp án QTV — chấm theo độ dài câu trả lời
    if (s.length >= 20) return { score: 2, feedback: "Câu trả lời đầy đủ." }
    if (s.length >= 8)  return { score: 1, feedback: "Câu trả lời còn ngắn." }
    return { score: 0, feedback: "Câu trả lời quá ngắn." }
  }

  // Tách thành các từ khóa quan trọng
  const keywords = c.split(/[\s,;.]+/).filter(w => w.length > 3)
  const matched  = keywords.filter(kw => s.includes(kw)).length
  const ratio    = keywords.length > 0 ? matched / keywords.length : 0

  if (ratio >= 0.7 || s.includes(c) || c.includes(s)) {
    return { score: 2, feedback: "✅ Câu trả lời chính xác và đầy đủ!" }
  } else if (ratio >= 0.3) {
    return { score: 1, feedback: "⚠️ Câu trả lời đúng một phần, cần bổ sung thêm." }
  } else {
    return { score: 0, feedback: "❌ Câu trả lời chưa đúng. Hãy đọc lại đoạn văn." }
  }
}

function ReadingSubmit() {
  const navigate = useNavigate()
  const location = useLocation()

  const title     = location.state?.title     || "Reading Comprehension"
  const id        = location.state?.id        || null
  const answers   = location.state?.answers   || {}
  const questions = location.state?.questions || []
  const total     = location.state?.total     ?? 10

  const [results, setResults]       = useState<GradedResult[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [showAnswers, setShowAnswers] = useState(false)

  useEffect(() => {
    if (!questions.length) return

    // Chấm điểm dựa trên đáp án QTV
    const graded: GradedResult[] = questions.map((q: any) => {
      const studentAns = answers[q.id] || ""
      const correctAns = q.answer || ""
      const { score, feedback } = gradeAnswer(studentAns, correctAns)
      return {
        questionId: q.id,
        question:   q.text,
        answer:     studentAns,
        correct:    correctAns,
        score,
        feedback
      }
    })

    setResults(graded)

    // Tính tổng điểm quy về thang 10
    const maxScore = questions.length * 2
    const rawScore = graded.reduce((sum, r) => sum + r.score, 0)
    const scaled   = maxScore > 0 ? Math.round((rawScore / maxScore) * total * 10) / 10 : 0
    setTotalScore(scaled)
  }, [])

  const isPassing = totalScore >= total * 0.5

  const scoreColor = (s: number) =>
    s === 2 ? "#16a34a" : s === 1 ? "#e87722" : "#dc2626"

  const scoreBg = (s: number) =>
    s === 2 ? "#dcfce7" : s === 1 ? "#fff3e0" : "#fef2f2"

  const scoreLabel = (s: number) =>
    s === 2 ? "Đúng (2đ)" : s === 1 ? "Một phần (1đ)" : "Sai (0đ)"

  return (
    <>
        <div className="sr-content">

          <h1 className="sr-page-title">Kết quả bài đọc</h1>
          <p className="sr-page-sub">{title}</p>

          {/* Score card */}
          <div className="sr-card">
            <div className={`sr-icon-wrap ${isPassing ? "pass" : "fail"}`}>
              {isPassing ? (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="24" fill="#E8683A" opacity=".15"/>
                  <circle cx="24" cy="24" r="18" fill="#E8683A"/>
                  <path d="M14 24l7 7 13-13" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="24" fill="#f97316" opacity=".15"/>
                  <circle cx="24" cy="24" r="18" fill="#f97316"/>
                  <path d="M16 16l16 16M32 16L16 32" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
            </div>

            <p className="sr-status">NỘP BÀI THÀNH CÔNG</p>

            <p className="sr-score">
              Điểm của bạn là: <span>{totalScore}</span>
            </p>

            <div className="sr-bar-wrap">
              <div className="sr-bar">
                <div className="sr-bar-fill" style={{ width:`${(totalScore / total) * 100}%` }} />
              </div>
              <span className="sr-bar-label">{totalScore}/{total}</span>
            </div>

            <p style={{ textAlign:"center", fontSize:14, color: isPassing ? "#16a34a" : "#dc2626", fontWeight:600, marginTop:8 }}>
              {isPassing ? "🎉 Xuất sắc! Bạn đã vượt qua bài kiểm tra!" : "💪 Cần ôn tập thêm nhé!"}
            </p>

            <div className="sr-actions">
              <button
                className="sr-btn-primary"
                onClick={() => setShowAnswers(!showAnswers)}
              >
                {showAnswers ? "Ẩn đáp án" : "📋 Xem đáp án & nhận xét"}
              </button>
              <button
                className="sr-btn-secondary"
                onClick={() => navigate("/skills/reading")}
              >
                Quay lại danh sách
              </button>
            </div>
          </div>

          {/* Chi tiết từng câu */}
          {showAnswers && results.length > 0 && (
            <div style={{ marginTop:16 }}>
              <h3 style={{ color:"#5a3e2b", marginBottom:12 }}>📋 Chi tiết từng câu</h3>
              {results.map(r => (
                <div key={r.questionId} style={{
                  background:"#fff", borderRadius:14, padding:"18px 20px",
                  marginBottom:12, border:"1px solid #f0e8dc",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.05)"
                }}>
                  {/* Header câu */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <p style={{ margin:0, fontWeight:700, color:"#5a3e2b", flex:1, lineHeight:1.5 }}>
                      Câu {r.questionId}: {r.question}
                    </p>
                    <span style={{
                      marginLeft:12, padding:"4px 12px", borderRadius:20,
                      background: scoreBg(r.score),
                      color: scoreColor(r.score),
                      fontSize:12, fontWeight:700, whiteSpace:"nowrap", flexShrink:0
                    }}>
                      {scoreLabel(r.score)}
                    </span>
                  </div>

                  {/* Câu trả lời học sinh */}
                  <div style={{ background:"#f9f5f0", borderRadius:8, padding:"10px 14px", marginBottom:10 }}>
                    <p style={{ margin:"0 0 4px", fontSize:12, color:"#888", fontWeight:600 }}>📝 Câu trả lời của bạn:</p>
                    <p style={{ margin:0, fontSize:14, color:"#444" }}>
                      {r.answer || <em style={{ color:"#ccc" }}>Không có câu trả lời</em>}
                    </p>
                  </div>

                  {/* Nhận xét */}
                  <div style={{ background: scoreBg(r.score), borderRadius:8, padding:"10px 14px", marginBottom:10 }}>
                    <p style={{ margin:"0 0 4px", fontSize:12, fontWeight:600, color: scoreColor(r.score) }}>
                      💬 Nhận xét:
                    </p>
                    <p style={{ margin:0, fontSize:14, color: scoreColor(r.score) }}>{r.feedback}</p>
                  </div>

                  {/* Đáp án QTV */}
                  {r.correct && (
                    <div style={{ background:"#f0fdf4", borderRadius:8, padding:"10px 14px" }}>
                      <p style={{ margin:"0 0 4px", fontSize:12, color:"#16a34a", fontWeight:600 }}>
                        ✅ Đáp án tham khảo:
                      </p>
                      <p style={{ margin:0, fontSize:14, color:"#166534" }}>{r.correct}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
    </>
  )
}

export default ReadingSubmit;