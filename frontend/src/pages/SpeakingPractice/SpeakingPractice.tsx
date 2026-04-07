import "./SpeakingPractice.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:5000";

type Stage = "practice" | "result";

// Tính điểm dựa trên độ khớp giữa text nói và câu gốc
const calcScore = (spoken: string, target: string): number => {
  const s = spoken.toLowerCase().trim()
  const t = target.toLowerCase().trim()
  if (s === t) return 95 + Math.floor(Math.random() * 5)

  // Đếm số từ khớp
  const sWords = s.split(" ")
  const tWords = t.split(" ")
  const matchedWords = sWords.filter(w => tWords.includes(w)).length
  const pct = Math.round((matchedWords / tWords.length) * 100)
  return Math.min(90, Math.max(30, pct))
}

function SpeakingPractice() {
  const navigate    = useNavigate()
  const { id }      = useParams()
  const [data, setData]           = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [phrases, setPhrases]     = useState<any[]>([])
  const [index, setIndex]         = useState(0)
  const [stage, setStage]         = useState<Stage>("practice")
  const [isListening, setIsListening] = useState(false)
  const [spokenText, setSpokenText]   = useState("")
  const [score, setScore]         = useState(0)
  const [error, setError]         = useState("")
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (!id) return
    fetch(`${API}/baihocmo/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d)
        try {
          const parsed = JSON.parse(d?.NoiDung || "{}")
          setPhrases(parsed.phrases || [])
        } catch { setPhrases([]) }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const current = phrases[index]

  // ── Phát âm mẫu bằng TTS ─────────────────────────────────────────────────
  const handleSpeak = () => {
    if (!current || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(current.text)
    utter.lang = "en-US"
    utter.rate = 0.85
    window.speechSynthesis.speak(utter)
  }

  // ── Nhận giọng nói ────────────────────────────────────────────────────────
  const handleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Trình duyệt không hỗ trợ. Vui lòng dùng Chrome!")
      return
    }

    setError("")
    setSpokenText("")

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart  = () => setIsListening(true)
    recognition.onend    = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setSpokenText(text)
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      if (event.error === "no-speech")       setError("Không nghe thấy giọng nói. Thử lại!")
      else if (event.error === "not-allowed") setError("⚠️ Microphone bị chặn! Vào Chrome Settings → Allow microphone.")
      else setError("Lỗi: " + event.error)
    }

    recognition.start()
  }

  const handleCheck = () => {
    const s = calcScore(spokenText || "", current?.text || "")
    setScore(s)
    setStage("result")
  }

  const handleNext = () => {
    if (index < phrases.length - 1) {
      setIndex(index + 1)
      setStage("practice")
      setSpokenText("")
      setError("")
    } else {
      navigate(-1)
    }
  }

  if (loading) return (
    <div className="spp-content" style={{ display:"flex", alignItems:"center", justifyContent:"center", color:"#999" }}>
      Đang tải...
    </div>
  )

  if (phrases.length === 0) return (
    <div className="spp-content" style={{ textAlign:"center", padding:40, color:"#999" }}>
      Bài học này chưa có câu luyện nói.
      <br />
      <button onClick={() => navigate(-1)} style={{ marginTop:16, padding:"8px 20px", borderRadius:8, background:"#e87722", color:"#fff", border:"none", cursor:"pointer" }}>
        Quay lại
      </button>
    </div>
  )

  return (
        <div className="spp-content">

          {/* Breadcrumb */}
          <nav className="spp-breadcrumb">
            <span className="spp-link" onClick={() => navigate("/skills/speaking")}>Kỹ Năng</span>
            <span>›</span>
            <span className="spp-link" onClick={() => navigate("/skills/speaking")}>Speaking</span>
            <span>›</span>
            <span className="spp-active">{data?.TieuDe || "Luyện nói"}</span>
          </nav>

          {/* Progress */}
          <div className="spp-progress-row">
            <span className="spp-progress-label">Câu {index + 1} / {phrases.length}</span>
            <div className="spp-progress-bar">
              <div style={{ width:`${((index + 1) / phrases.length) * 100}%` }} />
            </div>
          </div>

          {stage === "practice" ? (
            <div className="spp-card">
              <p className="spp-card-label">Nhắc lại câu này</p>

              {/* Speaker button */}
              <button className="spp-speaker-btn" onClick={handleSpeak}>
                <span className="spp-speaker-icon">🔊</span>
              </button>

              <p className="spp-sentence-preview">"{current.text}"</p>

              {/* Phiên âm */}
              {current.phonetic && (
                <p style={{ textAlign:"center", color:"#3b82f6", fontSize:14, fontStyle:"italic", marginBottom:8 }}>
                  {current.phonetic}
                </p>
              )}

              {/* Text đã nhận */}
              {spokenText && (
                <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:10, padding:"10px 16px", marginBottom:12, fontSize:14, textAlign:"center" }}>
                  🎙️ Bạn nói: <strong style={{ color:"#0369a1" }}>"{spokenText}"</strong>
                </div>
              )}

              {/* Lỗi */}
              {error && (
                <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 16px", marginBottom:12, fontSize:13, color:"#dc2626", textAlign:"center" }}>
                  {error}
                </div>
              )}

              {/* Mic */}
              <button
                className={`spp-mic-btn ${isListening ? "listening" : ""}`}
                onClick={handleMic}
                disabled={isListening}
              >
                🎤 {isListening ? "ĐANG NGHE..." : "NHẤN ĐỂ NÓI"}
              </button>

              <button
                className="spp-check-btn"
                onClick={handleCheck}
                disabled={isListening}
              >
                KIỂM TRA
              </button>

              <p style={{ textAlign:"center", fontSize:12, color:"#aaa", marginTop:8 }}>
                💡 Bấm 🔊 nghe mẫu → Bấm 🎤 nói → Bấm Kiểm tra
              </p>
            </div>
          ) : (
            <div className="spp-card result">
              <div className="spp-result-score-row">
                <div className={`spp-score-circle ${score >= 85 ? "great" : score >= 70 ? "good" : "low"}`}>
                  <span className="spp-score-num">{score}</span>
                  <span className="spp-score-label">/ 100</span>
                </div>
                <div className="spp-score-info">
                  <p className="spp-score-title">
                    {score >= 85 ? "🎉 Tuyệt vời!" : score >= 70 ? "👍 Khá tốt!" : "💪 Cần cải thiện"}
                  </p>
                  <p className="spp-score-desc">
                    {score >= 85 ? "Phát âm của bạn rất chính xác!" : "Hãy luyện tập thêm để cải thiện!"}
                  </p>
                </div>
              </div>

              {/* So sánh */}
              {spokenText && (
                <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:10, padding:"12px 16px", marginBottom:12 }}>
                  <p style={{ margin:"0 0 6px", fontSize:13, color:"#888" }}>🎙️ Bạn nói:</p>
                  <p style={{ margin:"0 0 10px", fontWeight:600, color:"#0369a1" }}>"{spokenText}"</p>
                  <p style={{ margin:"0 0 6px", fontSize:13, color:"#888" }}>✅ Câu đúng:</p>
                  <p style={{ margin:0, fontWeight:600, color:"#16a34a" }}>"{current.text}"</p>
                </div>
              )}

              <div className="spp-result-sentence">
                <p className="spp-result-label">🔤 Phiên âm</p>
                <p className="spp-phonetic-text">{current.phonetic}</p>
              </div>

              <div className="spp-result-meaning">
                <p className="spp-result-label">🇻🇳 Dịch nghĩa</p>
                <p className="spp-meaning-text">{current.translation || current.meaning}</p>
              </div>

              <div className="spp-result-actions">
                <button className="spp-retry-btn" onClick={() => { setStage("practice"); setSpokenText("") }}>
                  🔄 Thử lại
                </button>
                <button className="spp-next-btn" onClick={handleNext}>
                  {index < phrases.length - 1 ? "Câu tiếp theo →" : "Hoàn thành ✓"}
                </button>
              </div>
            </div>
          )}

        </div>
  )
}

export default SpeakingPractice;