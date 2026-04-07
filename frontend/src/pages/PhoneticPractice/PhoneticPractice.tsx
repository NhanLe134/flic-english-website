import "./PhoneticPractice.css";
import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const phoneticExercises: Record<string, { word: string; phonetic: string; meaning: string }[]> = {
  "/iː/": [
    { word: "see",   phonetic: "/siː/",  meaning: "nhìn thấy" },
    { word: "tea",   phonetic: "/tiː/",  meaning: "trà" },
    { word: "meet",  phonetic: "/miːt/", meaning: "gặp gỡ" },
    { word: "free",  phonetic: "/friː/", meaning: "tự do" },
  ],
  "/ɪ/": [
    { word: "sit",  phonetic: "/sɪt/",  meaning: "ngồi" },
    { word: "hit",  phonetic: "/hɪt/",  meaning: "đánh" },
    { word: "big",  phonetic: "/bɪɡ/",  meaning: "to lớn" },
    { word: "fish", phonetic: "/fɪʃ/",  meaning: "cá" },
  ],
  "/æ/": [
    { word: "cat",  phonetic: "/kæt/",  meaning: "con mèo" },
    { word: "man",  phonetic: "/mæn/",  meaning: "người đàn ông" },
    { word: "bad",  phonetic: "/bæd/",  meaning: "tệ, xấu" },
    { word: "hand", phonetic: "/hænd/", meaning: "bàn tay" },
  ],
  "/θ/": [
    { word: "think",  phonetic: "/θɪŋk/",  meaning: "suy nghĩ" },
    { word: "three",  phonetic: "/θriː/",  meaning: "ba" },
    { word: "both",   phonetic: "/boʊθ/",  meaning: "cả hai" },
    { word: "truth",  phonetic: "/truːθ/", meaning: "sự thật" },
  ],
  "/ð/": [
    { word: "this",  phonetic: "/ðɪs/",  meaning: "cái này" },
    { word: "that",  phonetic: "/ðæt/",  meaning: "cái đó" },
    { word: "with",  phonetic: "/wɪð/",  meaning: "với" },
    { word: "there", phonetic: "/ðɛr/",  meaning: "ở đó" },
  ],
  "/ʃ/": [
    { word: "she",  phonetic: "/ʃiː/",  meaning: "cô ấy" },
    { word: "fish", phonetic: "/fɪʃ/",  meaning: "cá" },
    { word: "wash", phonetic: "/wɒʃ/",  meaning: "rửa" },
    { word: "shop", phonetic: "/ʃɒp/",  meaning: "cửa hàng" },
  ],
  "default": [
    { word: "hello",   phonetic: "/həˈloʊ/",   meaning: "xin chào" },
    { word: "world",   phonetic: "/wɜːrld/",    meaning: "thế giới" },
    { word: "English", phonetic: "/ˈɪŋɡlɪʃ/",  meaning: "tiếng Anh" },
    { word: "speak",   phonetic: "/spiːk/",     meaning: "nói" },
  ],
}

type Stage = "practice" | "result"

// Tính điểm dựa trên độ khớp giữa text nhận được và từ cần nói
const calcScore = (spoken: string, target: string): number => {
  const s = spoken.toLowerCase().trim()
  const t = target.toLowerCase().trim()
  if (s === t) return 95 + Math.floor(Math.random() * 5)
  if (s.includes(t) || t.includes(s)) return 80 + Math.floor(Math.random() * 10)
  // Tính số ký tự khớp
  let match = 0
  for (let i = 0; i < Math.min(s.length, t.length); i++) {
    if (s[i] === t[i]) match++
  }
  const pct = Math.round((match / t.length) * 100)
  return Math.min(75, Math.max(30, pct))
}

function PhoneticPractice() {
  const navigate = useNavigate()
  const location = useLocation()
  const symbol  = location.state?.symbol  || "/iː/"
  const example = location.state?.example || "see, tea, meet"
  const hint    = location.state?.hint    || "Kéo dài, môi mỉm cười"

  const exercises = phoneticExercises[symbol] || phoneticExercises["default"]
  const [index, setIndex]         = useState(0)
  const [stage, setStage]         = useState<Stage>("practice")
  const [isListening, setIsListening] = useState(false)
  const [spokenText, setSpokenText]   = useState("")
  const [score, setScore]         = useState(0)
  const [error, setError]         = useState("")
  const recognitionRef = useRef<any>(null)

  const current = exercises[index]

  // Text-to-speech — phát âm mẫu
  const handleSpeak = () => {
    if (!window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(current.word)
    utter.lang = "en-US"
    utter.rate = 0.8
    window.speechSynthesis.speak(utter)
  }

  // Ghi âm giọng nói qua Web Speech API
  const handleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Trình duyệt không hỗ trợ nhận giọng nói. Vui lòng dùng Chrome!")
      return
    }

    setError("")
    setSpokenText("")
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend   = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setSpokenText(text)
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      if (event.error === "no-speech") setError("Không nghe thấy giọng nói. Thử lại!")
      else if (event.error === "not-allowed") setError("Vui lòng cho phép truy cập microphone!")
      else setError("Lỗi: " + event.error)
    }

    recognition.start()
  }

  const handleCheck = () => {
    const s = calcScore(spokenText || "", current.word)
    setScore(s)
    setStage("result")
  }

  const handleNext = () => {
    if (index < exercises.length - 1) {
      setIndex(index + 1)
      setStage("practice")
      setSpokenText("")
      setError("")
    } else {
      navigate(-1)
    }
  }

  return (
        <div className="php-content">

          {/* Breadcrumb */}
          <nav className="php-breadcrumb">
            <span className="php-link" onClick={() => navigate("/skills/speaking")}>Kỹ Năng</span>
            <span>›</span>
            <span className="php-link" onClick={() => navigate("/skills/speaking")}>Speaking</span>
            <span>›</span>
            <span className="php-active">Luyện âm {symbol}</span>
          </nav>

          {/* Progress */}
          <div className="php-progress-row">
            <span className="php-progress-label">Từ {index + 1} / {exercises.length}</span>
            <div className="php-progress-bar">
              <div style={{ width:`${((index + 1) / exercises.length) * 100}%` }} />
            </div>
          </div>

          {/* Banner */}
          <div className="php-banner">
            <div className="php-banner-symbol">{symbol}</div>
            <div className="php-banner-info">
              <p className="php-banner-example">Ví dụ: <em>{example}</em></p>
              <p className="php-banner-hint">💡 {hint}</p>
            </div>
          </div>

          {stage === "practice" ? (
            <div className="php-card">
              <p className="php-card-label">Phát âm từ này</p>

              {/* Word display */}
              <div className="php-word-display">
                <span className="php-word">{current.word}</span>
                <span className="php-word-phonetic">{current.phonetic}</span>
                <button className="php-speaker-btn" onClick={handleSpeak} title="Nghe phát âm mẫu">🔊</button>
              </div>

              <div className="php-highlight-box">
                <span className="php-highlight-label">Tập trung vào âm:</span>
                <span className="php-highlight-symbol">{symbol}</span>
              </div>

              {/* Hiển thị text đã nhận */}
              {spokenText && (
                <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:10, padding:"10px 16px", marginBottom:12, fontSize:14 }}>
                  🎙️ Bạn nói: <strong style={{ color:"#0369a1" }}>"{spokenText}"</strong>
                </div>
              )}

              {error && (
                <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 16px", marginBottom:12, fontSize:13, color:"#dc2626" }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Mic button */}
              <button
                className={`php-mic-btn ${isListening ? "listening" : ""}`}
                onClick={handleMic}
                disabled={isListening}
              >
                🎤 {isListening ? "ĐANG NGHE..." : "NHẤN ĐỂ NÓI"}
              </button>

              <button
                className="php-check-btn"
                onClick={handleCheck}
                disabled={isListening}
              >
                KIỂM TRA
              </button>

              <p style={{ textAlign:"center", fontSize:12, color:"#aaa", marginTop:8 }}>
                💡 Nhấn 🔊 để nghe mẫu, rồi nhấn 🎤 để nói
              </p>
            </div>
          ) : (
            <div className="php-card result">
              <div className="php-result-score-row">
                <div className={`php-score-circle ${score >= 85 ? "great" : score >= 70 ? "good" : "low"}`}>
                  <span className="php-score-num">{score}</span>
                  <span className="php-score-pct">/ 100</span>
                </div>
                <div>
                  <p className="php-score-title">
                    {score >= 85 ? "🎉 Phát âm chuẩn!" : score >= 70 ? "👍 Khá tốt!" : "💪 Cần luyện thêm!"}
                  </p>
                  <p className="php-score-desc">
                    {score >= 85 ? "Âm của bạn rất chính xác!" : "Hãy nghe lại và thử một lần nữa!"}
                  </p>
                </div>
              </div>

              {spokenText && (
                <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:10, padding:"10px 16px", marginBottom:12, fontSize:14 }}>
                  🎙️ Bạn nói: <strong style={{ color:"#0369a1" }}>"{spokenText}"</strong>
                  &nbsp;→ Đúng: <strong style={{ color:"#16a34a" }}>"{current.word}"</strong>
                </div>
              )}

              <div className="php-result-block">
                <p className="php-result-label">📢 Từ vừa luyện</p>
                <div className="php-result-word-row">
                  <span className="php-result-word">{current.word}</span>
                  <button className="php-small-speaker" onClick={handleSpeak}>🔊</button>
                </div>
              </div>

              <div className="php-result-block">
                <p className="php-result-label">🔤 Phiên âm IPA</p>
                <p className="php-result-phonetic">{current.phonetic}</p>
              </div>

              <div className="php-result-block">
                <p className="php-result-label">🇻🇳 Nghĩa</p>
                <p className="php-result-meaning">{current.meaning}</p>
              </div>

              <div className="php-result-block tip">
                <p className="php-result-label">💡 Mẹo phát âm</p>
                <p className="php-tip-text">{hint}</p>
              </div>

              <div className="php-result-actions">
                <button className="php-retry-btn" onClick={() => { setStage("practice"); setSpokenText("") }}>
                  🔄 Thử lại
                </button>
                <button className="php-next-btn" onClick={handleNext}>
                  {index < exercises.length - 1 ? "Từ tiếp theo →" : "Hoàn thành ✓"}
                </button>
              </div>
            </div>
          )}

        </div>
  )
}

export default PhoneticPractice;