// @ts-nocheck
import "./AssignmentDetail.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";

const API = "http://localhost:5000";

interface MCQuestion {
  question: string
  options:  { label: string; text: string }[]
  correct:  string
}

function AssignmentDetail() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { id }    = useParams()
  const maLopHoc  = location.state?.maLopHoc

  const user        = JSON.parse(sessionStorage.getItem("user") || "{}")
  const maNguoiDung = user.MaNguoiDung

  const [exercise,   setExercise]   = useState<any>(null)
  const [lopInfo,    setLopInfo]    = useState<any>(null)
  const [baiNop,     setBaiNop]     = useState<any>(null)
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)

  const [selectedWord, setSelectedWord] = useState<number | null>(null)
  const [matches,      setMatches]      = useState<Record<number, string>>({})
  const [mcAnswers,    setMcAnswers]    = useState<Record<number, string>>({})
  const [vocabSelected, setVocabSelected] = useState<number | null>(null)
  const [vocabMatches,  setVocabMatches]  = useState<Record<number, string>>({})
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({})

  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const [orderedWords,  setOrderedWords]  = useState<string[]>([])

  const [isRecording,   setIsRecording]   = useState(false)
  const [recordedBlob,  setRecordedBlob]  = useState<Blob | null>(null)
  const [recordedUrl,   setRecordedUrl]   = useState<string>("")
  const [recordSeconds, setRecordSeconds] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef         = useRef<any>(null)

  // Web Speech API — nhận diện giọng nói
  const [spokenText,    setSpokenText]    = useState<string>("")   // text nhận diện được
  const [speechScore,   setSpeechScore]   = useState<number | null>(null) // điểm phát âm
  const [isListeningSTT, setIsListeningSTT] = useState(false)
  const recognitionRef   = useRef<any>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`${API}/exercise/${id}`).then(r => r.json()),
      maLopHoc ? fetch(`${API}/classes/${maLopHoc}/info`).then(r => r.json()) : Promise.resolve(null),
      fetch(`${API}/bainop/exercise/${id}`).then(r => r.json()),
    ])
      .then(([exData, lopData, nopData]) => {
        setExercise(exData)
        setLopInfo(lopData)
        const myNop = Array.isArray(nopData)
          ? nopData.find((b: any) => b.MaSinhVien === maNguoiDung || b.MaNguoiDung === maNguoiDung)
          : null
        setBaiNop(myNop || null)
        if (myNop) setSubmitted(true)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, maLopHoc])

  // ── Normalize type (lowercase + alias mapping) ────────────────────────────
  const exType = (exercise?.Type || "").toLowerCase()
  const normalizedType: string =
    ["writing", "reading", "essay"].includes(exType)     ? "essay"      :
    ["multiple", "quiz", "trắc nghiệm"].includes(exType) ? "multiple"   :
    ["listening", "nghe"].includes(exType)               ? "listening"  :
    ["matching", "ghép"].includes(exType)                ? "matching"   :
    ["connect", "nối"].includes(exType)                  ? "connect"    :
    ["ordering", "sắp xếp"].includes(exType)             ? "ordering"   :
    ["speaking", "nói"].includes(exType)                 ? "speaking"   :
    ["vocabulary", "từ vựng", "vocab"].includes(exType)  ? "vocabulary" :
    exType

  // Giáo viên bật "Hiển thị đáp án" → học viên thấy đáp án sau khi nộp
  const showAnswerEnabled = !!exercise?.ShowAnswer

  const isEssay    = normalizedType === "essay"
  const isMultiple = normalizedType === "multiple"
  const isListening= normalizedType === "listening"
  const isConnect  = normalizedType === "connect"
  const isMatching = normalizedType === "matching"
  const isOrdering = normalizedType === "ordering"
  const isSpeaking    = normalizedType === "speaking"
  const isVocabulary  = normalizedType === "vocabulary"

  // ── Parse MC questions (hỗ trợ cả 2 format) ──────────────────────────────
  const parseMCQuestions = (raw: string): MCQuestion[] => {
    if (!raw) return []
    // Format đầy đủ: ### tách câu, || tách đề/đáp án, options A B C D
    if (raw.includes("###") || raw.includes("||")) {
      return raw.split("###").map(block => {
        const parts    = block.split("||")
        const question = parts[0]?.trim() || ""
        const rest     = parts[1] || ""
        const items    = rest.split("|")
        const options: { label: string; text: string }[] = []
        let correct = "A"
        items.forEach(item => {
          const trimmed = item.trim()
          if (trimmed.startsWith("Đáp án đúng:")) {
            correct = trimmed.replace("Đáp án đúng:", "").trim()
          } else {
            const match = trimmed.match(/^([A-D])\.\s*(.+)/)
            if (match) options.push({ label: match[1], text: match[2] })
          }
        })
        return { question, options, correct }
      }).filter(q => q.question)
    }
    // Format đơn giản: câu hỏi phân cách bằng |
    return raw.split("|").map(q => q.trim()).filter(Boolean).map(q => ({
      question: q,
      options: [] as { label: string; text: string }[],
      correct: "",
    }))
  }

  const mcQuestions = (isMultiple || isListening)
    ? parseMCQuestions(exercise?.Questions || "")
    : []

  // ── Parse content parts ───────────────────────────────────────────────────
  const contentParts: string[] = exercise?.Content
    ? exercise.Content.split("\n---\n").map((s: string) => s.trim()).filter(Boolean)
    : []
  const mainContent = contentParts[0] || ""

  // Essay questions: ưu tiên contentParts[1+], fallback sang Questions field
  const essayFromContent   = isEssay ? contentParts.slice(1) : []
  const essayFromQuestions: string[] = isEssay
    ? (exercise?.Questions || "").split("|").map((q: string) => q.trim()).filter(Boolean)
    : []
  const essayQuestions = essayFromContent.length > 0 ? essayFromContent : essayFromQuestions

  // Listening tự luận (Questions không phải MC format)
  const listeningEssayQuestions: string[] = isListening && mcQuestions.every(q => q.options.length === 0)
    ? mcQuestions.map(q => q.question)
    : []

  // ── Speaking ──────────────────────────────────────────────────────────────
  const speakingTopic  = contentParts[0] || ""
  const speakingVocab  = contentParts[1] || ""
  const speakingGuide  = contentParts[2] || ""
  const speakingAnswer = isSpeaking ? (exercise?.Questions || "") : "" // đáp án mẫu

  // ── Ordering ─────────────────────────────────────────────────────────────
  const originalWords: string[] = isOrdering
    ? (exercise?.Content || "").split(",").map((w: string) => w.trim()).filter(Boolean)
    : []

  useEffect(() => {
    if (isOrdering && originalWords.length > 0) {
      setShuffledWords([...originalWords].sort(() => Math.random() - 0.5))
      setOrderedWords([])
    }
  }, [exercise])

  // ── Vocab ─────────────────────────────────────────────────────────────────
  const vocab: { word: string; meaning: string }[] = (() => {
    const v = exercise?.Vocabulary || ""
    if (!v) return []
    return v.split("|").map((item: string) => {
      const parts = item.split("::")
      return { word: parts[0]?.trim() || "", meaning: parts[1]?.trim() || "" }
    }).filter((v: any) => v.word)
  })()

  // ── Connect / Matching pairs ──────────────────────────────────────────────
  const connectPairs = isConnect
    ? (exercise?.Questions || "").split("|").map((item: string) => {
        const [word, meaning] = item.split("::")
        return { word: word?.trim(), meaning: meaning?.trim() }
      }).filter((p: any) => p.word)
    : []

  const matchingPairs = isMatching
    ? (exercise?.Questions || "").split("|").map((item: string) => {
        const [word, meaning] = item.split("::")
        return { word: word?.trim(), meaning: meaning?.trim() }
      }).filter((p: any) => p.word)
    : []

  const vocabMeanings = useMemo(
    () => [...vocab.map(v => v.meaning)].sort(() => Math.random() - 0.5),
    [exercise?.Vocabulary, isVocabulary]
  )

  const connectMeanings = useMemo(
    () => [...connectPairs.map((p: any) => p.meaning)].sort(() => Math.random() - 0.5),
    [exercise?.Questions, isConnect]
  )
  const matchingMeanings = useMemo(
    () => [...matchingPairs.map((p: any) => p.meaning)].sort(() => Math.random() - 0.5),
    [exercise?.Questions, isMatching]
  )

  // ── Recording ─────────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = e => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        setRecordedBlob(blob)
        setRecordedUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }
      mediaRecorder.start()
      setIsRecording(true)
      setRecordSeconds(0)
      timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000)
    } catch {
      alert("Không thể truy cập microphone. Vui lòng cấp quyền!")
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    clearInterval(timerRef.current)
  }

  // ── Web Speech API ────────────────────────────────────────────────────────
  const calcSpeechScore = (spoken: string, expected: string): number => {
    if (!expected) return 0
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim()
    const spokenWords   = normalize(spoken).split(/\s+/).filter(Boolean)
    const expectedWords = normalize(expected).split(/\s+/).filter(Boolean)
    if (expectedWords.length === 0) return 0
    const correct = spokenWords.filter(w => expectedWords.includes(w)).length
    return Math.min(Math.round((correct / expectedWords.length) * 10 * 10) / 10, 10)
  }

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome!"); return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = false
    recognition.interimResults = false
    recognitionRef.current = recognition
    recognition.onstart  = () => setIsListeningSTT(true)
    recognition.onend    = () => setIsListeningSTT(false)
    recognition.onerror  = () => setIsListeningSTT(false)
    recognition.onresult = (e: any) => {
      const text  = e.results[0][0].transcript
      const score = calcSpeechScore(text, speakingAnswer)
      setSpokenText(text)
      setSpeechScore(score)
    }
    recognition.start()
  }

  const stopSpeechRecognition = () => {
    recognitionRef.current?.stop()
    setIsListeningSTT(false)
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`

  // ── Tính điểm ─────────────────────────────────────────────────────────────
  const calcScore = () => {
    if (isSpeaking) return speechScore
    const scoreable = mcQuestions.filter(q => q.options.length > 0)
    if (scoreable.length === 0) return null
    const correct = scoreable.filter((q, i) => mcAnswers[i] === q.correct).length
    return Math.round((correct / scoreable.length) * 10 * 10) / 10
  }

  // ── Nộp bài ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (submitted) { navigate(-1); return }

    if (isMultiple && mcQuestions.filter(q => q.options.length > 0).length > 0) {
      if (mcQuestions.some((_, i) => !mcAnswers[i])) {
        alert("Vui lòng trả lời tất cả câu hỏi!"); return
      }
    }
    if (isEssay && essayQuestions.length > 0) {
      if (essayQuestions.some((_, i) => !essayAnswers[i]?.trim())) {
        alert("Vui lòng trả lời tất cả câu hỏi!"); return
      }
    }
    if ((isConnect || isMatching) && Object.keys(matches).length < (isConnect ? connectPairs.length : matchingPairs.length)) {
      alert("Vui lòng nối tất cả các cặp!"); return
    }
    if (isOrdering && orderedWords.length < originalWords.length) {
      alert("Vui lòng sắp xếp tất cả các từ!"); return
    }

    setSubmitting(true)
    try {
      let noiDung = ""
      let diem: number | null = null

      if (isMultiple) {
        diem = calcScore()
        noiDung = mcQuestions.map((q, i) => {
          const chosen = mcAnswers[i] || "—"
          return `Câu ${i+1}: ${q.question}\nChọn: ${chosen} | Đúng: ${q.correct} | ${chosen === q.correct ? "✓" : "✗"}`
        }).join("\n\n")
      } else if (isEssay) {
        noiDung = essayQuestions.map((q, i) =>
          `${i+1}. ${q}\nTrả lời: ${essayAnswers[i] || "—"}`
        ).join("\n\n")
      } else if (isListening) {
        const hasMC = mcQuestions.some(q => q.options.length > 0)
        diem = hasMC ? calcScore() : null
        noiDung = hasMC
          ? mcQuestions.map((q, i) => {
              const chosen = mcAnswers[i] || "—"
              return `Câu ${i+1}: ${q.question}\nChọn: ${chosen} | Đúng: ${q.correct} | ${chosen === q.correct ? "✓" : "✗"}`
            }).join("\n\n")
          : listeningEssayQuestions.map((q, i) =>
              `${i+1}. ${q}\nTrả lời: ${essayAnswers[i] || "—"}`
            ).join("\n\n")
      } else if (isConnect || isMatching) {
        const pairs = isConnect ? connectPairs : matchingPairs
        noiDung = pairs.map((p: any, i: number) =>
          `${p.word} → ${matches[i] || "—"} (Đúng: ${p.meaning})`
        ).join("\n")
      } else if (isOrdering) {
        noiDung = `Thứ tự đã sắp xếp: ${orderedWords.join(", ")}\nThứ tự đúng: ${originalWords.join(", ")}`
      } else if (isVocabulary) {
        const allCorrect = vocab.filter((v, i) => vocabMatches[i] === v.meaning).length
        diem = Math.round((allCorrect / vocab.length) * 10 * 10) / 10
        noiDung = vocab.map((v, i) =>
          `${v.word} → ${vocabMatches[i] || "—"} (Đúng: ${v.meaning}) ${vocabMatches[i] === v.meaning ? "✓" : "✗"}`
        ).join("\n")
      } else if (isSpeaking) {
        diem    = speechScore
        noiDung = [
          `Chủ đề: ${speakingTopic}`,
          `Đáp án mẫu: ${speakingAnswer}`,
          `Học viên nói: ${spokenText || "—"}`,
          `Điểm phát âm: ${speechScore !== null ? speechScore + "/10" : "Chưa chấm"}`,
          `Ghi chú: ${essayAnswers[0] || "—"}`
        ].join("\n")
        if (recordedBlob) {
          const formData = new FormData()
          formData.append("file", recordedBlob, "speaking.webm")
          try { await fetch(`${API}/upload`, { method: "POST", body: formData }) } catch {}
        }
      } else {
        noiDung = essayAnswers[0] || "Đã hoàn thành"
      }

      await fetch(`${API}/bainop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MaExercise: parseInt(id!),
          MaSinhVien: maNguoiDung,
          NoiDung:    noiDung,
          Diem:       diem,
          TrangThai:  (isMultiple || isVocabulary || isSpeaking || (isListening && mcQuestions.some(q => q.options.length > 0)))
            ? "Đã chấm" : undefined
        })
      })

      navigate("/assignment-success", {
        state: {
          title:    exercise?.Title,
          maLopHoc: maLopHoc,
          diem:     diem,
          soLuong:  (isMultiple || isListening)
            ? `${mcQuestions.filter((q,i) => mcAnswers[i] === q.correct).length}/${mcQuestions.length}`
            : undefined,
          loai: exercise?.Type || "Bài tập"
        }
      })
    } catch {
      alert("Lỗi khi nộp bài!")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render MC questions ───────────────────────────────────────────────────
  const renderMCQuestions = () => (
    <>
      {mcQuestions.map((q, qi) => {
        const chosen    = mcAnswers[qi]
        const isCorrect = submitted && chosen === q.correct
        const isWrong   = submitted && !!chosen && chosen !== q.correct

        // Format đơn giản: chỉ có câu hỏi, không có options → input box
        if (q.options.length === 0) {
          return (
            <div key={qi} className="ad-question">
              <p className="ad-q-text">{qi+1}. {q.question}</p>
              {submitted ? (
                <div style={{ background:"#f9f5f0", borderRadius:8, padding:"10px 12px", fontSize:14, color:"#444" }}>
                  {essayAnswers[qi] || <em style={{ color:"#ccc" }}>Không có câu trả lời</em>}
                </div>
              ) : (
                <textarea
                  className="ad-q-input"
                  value={essayAnswers[qi] || ""}
                  onChange={e => setEssayAnswers(prev => ({ ...prev, [qi]: e.target.value }))}
                  placeholder="Nhập câu trả lời..."
                  rows={3}
                  style={{ resize:"vertical" }}
                />
              )}
            </div>
          )
        }

        // Format đầy đủ: có options A B C D
        return (
          <div key={qi} style={{
            background: submitted ? (isCorrect ? "#f0fdf4" : isWrong ? "#fef2f2" : "#fff") : "#fff",
            border:`1px solid ${submitted ? (isCorrect ? "#86efac" : isWrong ? "#fecaca" : "#f0e8dc") : "#f0e8dc"}`,
            borderRadius:12, padding:"16px 18px", marginBottom:14
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <p style={{ margin:0, fontWeight:700, color:"#5a3e2b", flex:1 }}>
                Câu {qi+1}: {q.question}
              </p>
              {submitted && (
                <span style={{
                  marginLeft:12, padding:"3px 10px", borderRadius:20,
                  fontSize:12, fontWeight:700, flexShrink:0,
                  background: isCorrect ? "#dcfce7" : "#fef2f2",
                  color: isCorrect ? "#16a34a" : "#dc2626"
                }}>
                  {isCorrect ? "✓ Đúng" : "✗ Sai"}
                </span>
              )}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {q.options.map(opt => {
                const isChosen     = mcAnswers[qi] === opt.label
                const isCorrectOpt = (submitted && opt.label === q.correct) ||
                                   (submitted && showAnswerEnabled && opt.label === q.correct)
                const isWrongOpt   = submitted && isChosen && opt.label !== q.correct
                return (
                  <label key={opt.label} style={{
                    display:"flex", alignItems:"center", gap:10,
                    padding:"10px 14px", borderRadius:8,
                    cursor: submitted ? "default" : "pointer",
                    border:`1.5px solid ${isCorrectOpt ? "#86efac" : isWrongOpt ? "#fecaca" : isChosen ? "#e87722" : "#e0d8cc"}`,
                    background: isCorrectOpt ? "#f0fdf4" : isWrongOpt ? "#fef2f2" : isChosen ? "#fff3e0" : "#fafafa",
                    transition:"all 0.15s"
                  }}>
                    <input
                      type="radio"
                      name={`q${qi}`}
                      value={opt.label}
                      checked={mcAnswers[qi] === opt.label}
                      onChange={() => { if (!submitted) setMcAnswers(prev => ({ ...prev, [qi]: opt.label })) }}
                      disabled={submitted}
                      style={{ accentColor:"#e87722" }}
                    />
                    <span style={{ fontWeight:600, color:"#e87722", minWidth:20 }}>{opt.label}.</span>
                    <span style={{ color:"#444" }}>{opt.text}</span>
                    {isCorrectOpt && <span style={{ marginLeft:"auto", color:"#16a34a", fontWeight:700 }}>✓</span>}
                    {isWrongOpt   && <span style={{ marginLeft:"auto", color:"#dc2626", fontWeight:700 }}>✗</span>}
                  </label>
                )
              })}
            </div>
            {submitted && isWrong && (
              <p style={{ margin:"10px 0 0", fontSize:13, color:"#16a34a" }}>
                💡 Đáp án đúng: <strong>{q.correct}</strong> — {q.options.find(o => o.label === q.correct)?.text}
              </p>
            )}
          </div>
        )
      })}
    </>
  )

  // ── Render cặp nối ────────────────────────────────────────────────────────
  const renderPairs = (pairs: any[], meanings: string[]) => (
    <div style={{ display:"flex", gap:24 }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
        {pairs.map((p: any, i: number) => {
          const isSelected = selectedWord === i
          const isMatched  = matches[i] !== undefined
          return (
            <div key={i}
              onClick={() => { if (!submitted) setSelectedWord(i) }}
              style={{
                padding:"12px 16px", borderRadius:10,
                cursor: submitted ? "default" : "pointer",
                fontWeight:600, textAlign:"center",
                border:`2px solid ${isSelected ? "#e87722" : isMatched ? "#22c55e" : "#f0e8dc"}`,
                background: isSelected ? "#fff3e0" : isMatched ? "#f0fdf4" : "#fafafa",
                color: isSelected ? "#e87722" : isMatched ? "#16a34a" : "#444",
                transition:"all 0.15s"
              }}
            >
              {p.word}
              {isMatched && (
                <span style={{ fontSize:12, display:"block", fontWeight:400, color:"#16a34a" }}>
                  → {matches[i]}
                </span>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
        {meanings.map((meaning: string, i: number) => {
          const isUsed = Object.values(matches).includes(meaning)
          return (
            <div key={i}
              onClick={() => {
                if (submitted || isUsed || selectedWord === null) return
                setMatches(prev => ({ ...prev, [selectedWord]: meaning }))
                setSelectedWord(null)
              }}
              style={{
                padding:"12px 16px", borderRadius:10,
                cursor: submitted || isUsed ? "default" : selectedWord !== null ? "pointer" : "default",
                textAlign:"center",
                border:`2px solid ${isUsed ? "#22c55e" : selectedWord !== null ? "#e87722" : "#f0e8dc"}`,
                background: isUsed ? "#f0fdf4" : selectedWord !== null ? "#fffbf5" : "#fafafa",
                color: isUsed ? "#16a34a" : "#444",
                opacity: isUsed ? 0.6 : 1,
                transition:"all 0.15s"
              }}
            >
              {meaning}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
        <div className="ad-content">

          <button className="ad-back" onClick={() => navigate(-1)}>← Quay lại</button>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : !exercise ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Không tìm thấy bài tập.</div>
          ) : (
            <>
              {/* Course info */}
              {lopInfo && (
                <div className="ad-info-card">
                  <div className="ad-info-left">
                    <p className="ad-course-name">{lopInfo.TenLop}</p>
                    <p className="ad-course-code">{lopInfo.TenKhoaHoc}</p>
                  </div>
                  <span className="ad-badge-active">Active</span>
                  <div className="ad-info-meta">
                    {lopInfo.TenGiangVien && (
                      <div className="ad-meta-item">
                        <span className="ad-meta-label">Giáo viên</span>
                        <span className="ad-meta-val">{lopInfo.TenGiangVien}</span>
                      </div>
                    )}
                    {lopInfo.LichHoc && (
                      <div className="ad-meta-item">
                        <span className="ad-meta-label">Lịch học</span>
                        <span className="ad-meta-val">{lopInfo.LichHoc}</span>
                      </div>
                    )}
                    <div className="ad-meta-item">
                      <span className="ad-meta-label">Trạng thái</span>
                      <span className="ad-meta-val">Đang học</span>
                    </div>
                  </div>

                </div>
              )}

              {/* Tabs */}
              <div className="ad-tabs">
                <span className="ad-tab">Tổng quan</span>
                <span className="ad-tab active">Bài tập</span>
              </div>

              <h2 className="ad-title">{exercise.Title}</h2>
              {exercise.Type && (
                <span style={{
                  background:"#fff3e0", color:"#e87722", padding:"3px 12px",
                  borderRadius:20, fontSize:13, fontWeight:600,
                  display:"inline-block", marginBottom:16
                }}>
                  {exercise.Type}
                </span>
              )}

              {/* Đã nộp */}
              {submitted && baiNop && (
                <div style={{
                  background:"#dcfce7", border:"1px solid #86efac",
                  borderRadius:12, padding:"14px 18px", marginBottom:20
                }}>
                  <p style={{ margin:0, fontWeight:600, color:"#15803d" }}>✅ Bạn đã nộp bài này</p>
                  {baiNop.Diem !== null && baiNop.Diem !== undefined ? (
                    <p style={{ margin:"6px 0 0", color:"#166534" }}>
                      Điểm: <strong>{baiNop.Diem}/10</strong>
                      {baiNop.NhanXet && ` · ${baiNop.NhanXet}`}
                    </p>
                  ) : (
                    <p style={{ margin:"6px 0 0", fontSize:13, color:"#166534" }}>
                      Đang chờ giảng viên chấm điểm.
                    </p>
                  )}
                </div>
              )}

              {/* Banner đáp án — chỉ hiện khi đã nộp + giáo viên cho phép + có đáp án tự động */}
              {submitted && showAnswerEnabled && (isMultiple || isListening) && mcQuestions.some(q => q.options.length > 0) && (
                <div style={{
                  background:"#fffbf0", border:"1px solid #fcd34d",
                  borderRadius:12, padding:"12px 16px", marginBottom:16,
                  display:"flex", alignItems:"center", gap:8
                }}>
                  <span style={{ fontSize:18 }}>💡</span>
                  <span style={{ fontWeight:600, color:"#92400e", fontSize:14 }}>
                    Đáp án đúng đã được hiển thị — xem phần highlight xanh bên dưới
                  </span>
                </div>
              )}

              {/* ══ ESSAY / READING / WRITING ══ */}
              {isEssay && (
                <>
                  {/* 1. Reading Passage */}
                  {mainContent && (
                    <div className="ad-section">
                      <h4 className="ad-section-title">📖 Reading Passage</h4>
                      <p style={{ lineHeight:1.7, color:"#333" }}>{mainContent}</p>
                    </div>
                  )}

                  {/* 2. Vocabulary */}
                  {vocab.length > 0 && (
                    <div className="ad-section">
                      <h4 className="ad-section-title">📚 Vocabulary Practice</h4>
                      <p style={{ fontSize:13, color:"#888", marginBottom:10 }}>
                        Match the words with their meanings:
                      </p>
                      <table className="ad-vocab-table">
                        <thead><tr><th>Từ vựng</th><th>Nghĩa</th></tr></thead>
                        <tbody>
                          {vocab.map((v, i) => (
                            <tr key={i}>
                              <td><strong>{v.word}</strong></td>
                              <td>{v.meaning}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 3. Comprehension Questions */}
                  {essayQuestions.length > 0 && (
                    <div className="ad-section">
                      <h4 className="ad-section-title">✍️ Comprehension Questions</h4>
                      {essayQuestions.map((q: string, i: number) => (
                        <div className="ad-question" key={i}>
                          <p className="ad-q-text">{i+1}. {q}</p>
                          {submitted ? (
                            <div style={{ background:"#f9f5f0", borderRadius:8, padding:"10px 12px", fontSize:14, color:"#444" }}>
                              {essayAnswers[i] || <em style={{ color:"#ccc" }}>Không có câu trả lời</em>}
                            </div>
                          ) : (
                            <textarea
                              className="ad-q-input"
                              value={essayAnswers[i] || ""}
                              onChange={e => setEssayAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                              placeholder="Nhập câu trả lời..."
                              rows={3}
                              style={{ resize:"vertical" }}
                            />
                          )}
                          {/* Gợi ý đáp án cho essay nếu giáo viên cho phép */}
                          {submitted && showAnswerEnabled && (
                            <div style={{
                              marginTop:8, padding:"8px 12px", borderRadius:8,
                              background:"#f0fdf4", border:"1px solid #86efac",
                              fontSize:13, color:"#15803d"
                            }}>
                              💡 Gợi ý: Hãy đọc lại đoạn văn và trả lời dựa trên nội dung chính.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ══ TRẮC NGHIỆM ══ */}
              {isMultiple && mcQuestions.length > 0 && (
                <div className="ad-section">
                  <h4 className="ad-section-title">❓ Câu hỏi trắc nghiệm</h4>
                  <p className="ad-section-sub">{mcQuestions.length} câu · Chọn đáp án đúng</p>
                  {renderMCQuestions()}
                </div>
              )}

              {/* ══ NGHE ══ */}
              {isListening && (
                <div className="ad-section">
                  <h4 className="ad-section-title">🎵 Bài nghe</h4>
                  {exercise.AudioUrl ? (
                    <audio controls style={{ width:"100%", marginBottom:20, borderRadius:8 }}>
                      <source src={`${API}${exercise.AudioUrl}`} />
                    </audio>
                  ) : (
                    <p style={{ color:"#999", fontSize:13, marginBottom:16 }}>Chưa có file âm thanh.</p>
                  )}
                  {mainContent && (
                    <div style={{ marginBottom:16, background:"#f9f5f0", borderRadius:8, padding:"12px 14px" }}>
                      <p style={{ margin:0, color:"#333", lineHeight:1.7 }}>{mainContent}</p>
                    </div>
                  )}
                  {mcQuestions.length > 0 && (
                    <>
                      <h4 className="ad-section-title" style={{ marginTop:16 }}>❓ Câu hỏi sau khi nghe</h4>
                      <p className="ad-section-sub">{mcQuestions.length} câu</p>
                      {renderMCQuestions()}
                    </>
                  )}
                </div>
              )}

              {/* ══ NÓI ══ */}
              {isSpeaking && (
                <div className="ad-section">
                  <h4 className="ad-section-title">🎤 Bài nói</h4>

                  {/* Chủ đề */}
                  {speakingTopic && (
                    <div style={{ background:"#fff3e0", border:"1px solid #f0d8b0", borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
                      <p style={{ margin:0, fontSize:13, color:"#888", marginBottom:4 }}>Chủ đề / Câu hỏi</p>
                      <p style={{ margin:0, fontWeight:700, color:"#5a3e2b", fontSize:15 }}>📌 {speakingTopic}</p>
                    </div>
                  )}
                  {speakingVocab && (
                    <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:10, padding:"12px 16px", marginBottom:14 }}>
                      <p style={{ margin:0, fontSize:13, color:"#16a34a", fontWeight:600, marginBottom:4 }}>💡 Gợi ý từ vựng</p>
                      <p style={{ margin:0, color:"#444", fontSize:14 }}>{speakingVocab}</p>
                    </div>
                  )}
                  {speakingGuide && (
                    <div style={{ background:"#f9f5f0", border:"1px solid #e0d8cc", borderRadius:10, padding:"12px 16px", marginBottom:14 }}>
                      <p style={{ margin:0, fontSize:13, color:"#888", fontWeight:600, marginBottom:4 }}>📋 Hướng dẫn</p>
                      <p style={{ margin:0, color:"#444", fontSize:14 }}>{speakingGuide}</p>
                    </div>
                  )}

                  {/* Đáp án mẫu */}
                  {speakingAnswer && (
                    <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
                      <p style={{ margin:0, fontSize:13, color:"#1d4ed8", fontWeight:600, marginBottom:4 }}>🗣️ Câu cần đọc</p>
                      <p style={{ margin:0, color:"#1e3a8a", fontSize:15, fontWeight:500, lineHeight:1.6 }}>{speakingAnswer}</p>
                    </div>
                  )}

                  {!submitted ? (
                    <>
                      {/* Nhận diện giọng nói bằng Web Speech API */}
                      <div style={{ border:"2px dashed #e87722", borderRadius:12, padding:"24px 16px", textAlign:"center", marginBottom:16 }}>
                        <p style={{ margin:"0 0 6px", fontWeight:700, color:"#5a3e2b", fontSize:15 }}>
                          🎙️ Nhấn để đọc câu trên
                        </p>
                        <p style={{ margin:"0 0 16px", fontSize:13, color:"#888" }}>
                          Máy sẽ nhận diện và chấm điểm phát âm của bạn
                        </p>

                        {isListeningSTT ? (
                          <div>
                            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fef2f2", borderRadius:20, padding:"8px 20px", marginBottom:16 }}>
                              <span style={{ width:10, height:10, borderRadius:"50%", background:"#dc2626", display:"inline-block", animation:"pulse 1s infinite" }} />
                              <span style={{ color:"#dc2626", fontWeight:700 }}>Đang nghe...</span>
                            </div>
                            <br />
                            <button onClick={stopSpeechRecognition} style={{ padding:"10px 24px", borderRadius:24, background:"#dc2626", color:"#fff", border:"none", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                              ⏹ Dừng
                            </button>
                          </div>
                        ) : (
                          <button onClick={startSpeechRecognition} style={{ padding:"12px 28px", borderRadius:24, background:"#e87722", color:"#fff", border:"none", fontWeight:700, cursor:"pointer", fontSize:15 }}>
                            🎙️ Bắt đầu nói
                          </button>
                        )}

                        {/* Kết quả nhận diện */}
                        {spokenText && (
                          <div style={{ marginTop:20, textAlign:"left" }}>
                            <div style={{ background:"#f9f5f0", borderRadius:10, padding:"12px 16px", marginBottom:12 }}>
                              <p style={{ margin:"0 0 4px", fontSize:13, color:"#888", fontWeight:600 }}>Máy nhận diện được:</p>
                              <p style={{ margin:0, color:"#333", fontSize:14, fontStyle:"italic" }}>"{spokenText}"</p>
                            </div>
                            {speechScore !== null && (
                              <div style={{
                                background: speechScore >= 7 ? "#f0fdf4" : speechScore >= 5 ? "#fffbf0" : "#fef2f2",
                                border: `1px solid ${speechScore >= 7 ? "#86efac" : speechScore >= 5 ? "#fcd34d" : "#fecaca"}`,
                                borderRadius:10, padding:"12px 16px", textAlign:"center"
                              }}>
                                <p style={{ margin:"0 0 4px", fontSize:13, color:"#888" }}>Điểm phát âm</p>
                                <p style={{ margin:0, fontSize:28, fontWeight:800, color: speechScore >= 7 ? "#16a34a" : speechScore >= 5 ? "#d97706" : "#dc2626" }}>
                                  {speechScore}/10
                                </p>
                                <p style={{ margin:"4px 0 0", fontSize:13, color:"#666" }}>
                                  {speechScore >= 8 ? "🌟 Xuất sắc!" : speechScore >= 6 ? "👍 Tốt!" : speechScore >= 4 ? "💪 Cần luyện thêm" : "📚 Hãy thử lại"}
                                </p>
                              </div>
                            )}
                            <button onClick={() => { setSpokenText(""); setSpeechScore(null) }}
                              style={{ marginTop:10, fontSize:12, color:"#e87722", background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>
                              🔄 Thử lại
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Ghi chú */}
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:"#5a3e2b", marginBottom:6 }}>📝 Ghi chú (tuỳ chọn):</p>
                        <textarea className="ad-q-input" value={essayAnswers[0] || ""} onChange={e => setEssayAnswers(prev => ({ ...prev, [0]: e.target.value }))} placeholder="Nhập ghi chú..." rows={2} style={{ resize:"vertical" }} />
                      </div>
                    </>
                  ) : (
                    /* Đã nộp — hiện kết quả */
                    <div>
                      {speechScore !== null && (
                        <div style={{
                          background: speechScore >= 7 ? "#f0fdf4" : speechScore >= 5 ? "#fffbf0" : "#fef2f2",
                          border:`1px solid ${speechScore >= 7 ? "#86efac" : speechScore >= 5 ? "#fcd34d" : "#fecaca"}`,
                          borderRadius:12, padding:"16px", textAlign:"center", marginBottom:16
                        }}>
                          <p style={{ margin:"0 0 6px", fontSize:14, color:"#666" }}>Điểm phát âm của bạn</p>
                          <p style={{ margin:0, fontSize:32, fontWeight:800, color: speechScore >= 7 ? "#16a34a" : speechScore >= 5 ? "#d97706" : "#dc2626" }}>
                            {speechScore}/10
                          </p>
                        </div>
                      )}
                      {spokenText && (
                        <div style={{ background:"#f9f5f0", borderRadius:8, padding:"10px 12px", fontSize:14, color:"#444", marginBottom:10 }}>
                          <strong>Bạn đã nói:</strong> "{spokenText}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ══ NỐI TỪ ══ */}
              {isConnect && (
                <div className="ad-section">
                  <h4 className="ad-section-title">🔗 Nối từ với nghĩa</h4>
                  <p style={{ fontSize:13, color:"#999", marginBottom:16 }}>Click vào từ bên trái, sau đó click vào nghĩa bên phải để nối</p>
                  {renderPairs(connectPairs, connectMeanings)}
                </div>
              )}

              {/* ══ GHÉP TỪ ══ */}
              {isMatching && (
                <div className="ad-section">
                  <h4 className="ad-section-title">🧩 Ghép từ với nghĩa</h4>
                  <p style={{ fontSize:13, color:"#999", marginBottom:16 }}>Click vào từ bên trái, sau đó click vào nghĩa bên phải để ghép</p>
                  {renderPairs(matchingPairs, matchingMeanings)}
                </div>
              )}

              {/* ══ SẮP XẾP TỪ ══ */}
              {isOrdering && (
                <div className="ad-section">
                  <h4 className="ad-section-title">🔤 Sắp xếp từ</h4>
                  <p style={{ fontSize:13, color:"#999", marginBottom:16 }}>Click vào từ bên dưới để sắp xếp theo thứ tự đúng</p>
                  <p style={{ fontSize:13, fontWeight:600, color:"#5a3e2b", marginBottom:6 }}>Thứ tự của bạn:</p>
                  <div style={{ minHeight:52, border:"2px dashed #e87722", borderRadius:10, padding:"10px 12px", marginBottom:16, display:"flex", flexWrap:"wrap", gap:8, background:"#fffbf5" }}>
                    {orderedWords.length === 0 && <span style={{ color:"#ccc", fontSize:13 }}>Từ đã chọn sẽ hiện ở đây...</span>}
                    {orderedWords.map((w, i) => (
                      <span key={i} onClick={() => { if (submitted) return; setOrderedWords(prev => prev.filter((_,idx)=>idx!==i)); setShuffledWords(prev=>[...prev,w]) }}
                        style={{ padding:"6px 14px", borderRadius:20, background:"#e87722", color:"#fff", fontWeight:600, cursor:submitted?"default":"pointer", fontSize:14, userSelect:"none" }}>
                        {w} {!submitted && "✕"}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize:13, fontWeight:600, color:"#5a3e2b", marginBottom:6 }}>Các từ:</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {shuffledWords.map((w, i) => (
                      <span key={i} onClick={() => { if (submitted) return; setOrderedWords(prev=>[...prev,w]); setShuffledWords(prev=>prev.filter((_,idx)=>idx!==i)) }}
                        style={{ padding:"6px 14px", borderRadius:20, background:"#f0e8dc", color:"#5a3e2b", fontWeight:600, cursor:submitted?"default":"pointer", fontSize:14, border:"1.5px solid #e0d8cc", userSelect:"none" }}>
                        {w}
                      </span>
                    ))}
                  </div>
                  {!submitted && orderedWords.length > 0 && (
                    <button onClick={() => { setShuffledWords([...originalWords].sort(()=>Math.random()-0.5)); setOrderedWords([]) }}
                      style={{ marginTop:12, padding:"6px 16px", borderRadius:20, border:"1px solid #ccc", background:"#fff", color:"#888", cursor:"pointer", fontSize:13 }}>
                      🔄 Làm lại
                    </button>
                  )}
                </div>
              )}

              {/* ══ TỪ VỰNG (Vocabulary type) — matching game ══ */}
              {isVocabulary && (
                <div className="ad-section">
                  <h4 className="ad-section-title">📚 Vocabulary Practice</h4>
                  <p style={{ fontSize:13, color:"#999", marginBottom:16 }}>
                    Click vào từ bên trái, sau đó click vào nghĩa bên phải để ghép
                  </p>
                  {vocab.length > 0 ? (
                    <div style={{ display:"flex", gap:24 }}>
                      {/* Cột từ */}
                      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
                        {vocab.map((v, i) => {
                          const isSel     = vocabSelected === i
                          const isMatched = vocabMatches[i] !== undefined
                          const isCorrect = submitted && vocabMatches[i] === v.meaning
                          const isWrong   = submitted && vocabMatches[i] !== undefined && vocabMatches[i] !== v.meaning
                          return (
                            <div key={i}
                              onClick={() => { if (!submitted) setVocabSelected(i) }}
                              style={{
                                padding:"12px 16px", borderRadius:10, textAlign:"center",
                                cursor: submitted ? "default" : "pointer", fontWeight:600,
                                border:`2px solid ${isSel ? "#e87722" : isCorrect ? "#22c55e" : isWrong ? "#ef4444" : isMatched ? "#22c55e" : "#f0e8dc"}`,
                                background: isSel ? "#fff3e0" : isCorrect ? "#f0fdf4" : isWrong ? "#fef2f2" : isMatched ? "#f0fdf4" : "#fafafa",
                                color: isSel ? "#e87722" : isCorrect ? "#16a34a" : isWrong ? "#dc2626" : isMatched ? "#16a34a" : "#444",
                                transition:"all 0.15s"
                              }}
                            >
                              {v.word}
                              {isMatched && (
                                <span style={{ fontSize:12, display:"block", fontWeight:400 }}>
                                  → {vocabMatches[i]}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {/* Cột nghĩa */}
                      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
                        {vocabMeanings.map((meaning, i) => {
                          const isUsed = Object.values(vocabMatches).includes(meaning)
                          return (
                            <div key={i}
                              onClick={() => {
                                if (submitted || isUsed || vocabSelected === null) return
                                setVocabMatches(prev => ({ ...prev, [vocabSelected]: meaning }))
                                setVocabSelected(null)
                              }}
                              style={{
                                padding:"12px 16px", borderRadius:10, textAlign:"center",
                                cursor: submitted || isUsed ? "default" : vocabSelected !== null ? "pointer" : "default",
                                border:`2px solid ${isUsed ? "#22c55e" : vocabSelected !== null ? "#e87722" : "#f0e8dc"}`,
                                background: isUsed ? "#f0fdf4" : vocabSelected !== null ? "#fffbf5" : "#fafafa",
                                color: isUsed ? "#16a34a" : "#444",
                                opacity: isUsed ? 0.6 : 1,
                                transition:"all 0.15s"
                              }}
                            >
                              {meaning}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color:"#999" }}>Chưa có từ vựng.</p>
                  )}
                  {/* Nút làm lại */}
                  {!submitted && Object.keys(vocabMatches).length > 0 && (
                    <button
                      onClick={() => { setVocabMatches({}); setVocabSelected(null) }}
                      style={{ marginTop:14, padding:"6px 16px", borderRadius:20, border:"1px solid #ccc", background:"#fff", color:"#888", cursor:"pointer", fontSize:13 }}
                    >
                      🔄 Làm lại
                    </button>
                  )}
                </div>
              )}

              {/* Vocabulary bổ sung (cho các type khác) */}
              {vocab.length > 0 && !isEssay && !isVocabulary && (
                <div className="ad-section">
                  <h4 className="ad-section-title">📝 Vocabulary</h4>
                  <table className="ad-vocab-table">
                    <thead><tr><th>Từ vựng</th><th>Nghĩa</th></tr></thead>
                    <tbody>
                      {vocab.map((v, i) => (
                        <tr key={i}>
                          <td><strong>{v.word}</strong></td>
                          <td>{v.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer */}
              <div className="ad-footer">
                {submitted ? (
                  <button className="ad-submit-btn" style={{ background:"#6b7280" }} onClick={() => navigate(-1)}>
                    ← Quay lại
                  </button>
                ) : (
                  <button className="ad-submit-btn" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Đang nộp..." : "Nộp bài"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
  )
}

export default AssignmentDetail;