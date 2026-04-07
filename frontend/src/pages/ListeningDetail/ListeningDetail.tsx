import "./ListeningDetail.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:5000";

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  isTrueFalse?: boolean;
}

function ListeningDetail() {
  const navigate        = useNavigate()
  const { id }          = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading]        = useState(true)
  const [selected, setSelected]      = useState<Record<number, string>>({})
  const [showAnswers, setShowAnswers] = useState(false)

  // Audio player
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying]     = useState(false)
  const [duration, setDuration]       = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume]           = useState(1)

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

  const questions: Question[] = (() => {
    if (!parsed?.questions) return []
    return (Array.isArray(parsed.questions) ? parsed.questions : []).map((q: any, i: number) => {
      if (typeof q === "string") return { id: i+1, question: q, options: [], answer: "", isTrueFalse: false }
      const opts = q.options ? q.options.split(",").map((o: string) => o.trim()).filter(Boolean) : []
      const isTF = opts.length === 0 || (opts.length === 2 && opts.includes("True") && opts.includes("False"))
      return { id: i+1, question: q.text || "", options: isTF ? [] : opts, answer: q.answer || "", isTrueFalse: isTF }
    })
  })()

  const objectives: string[] = parsed?.objectives || []
  const audioUrl = data?.FileUrl ? `${API}${data.FileUrl}` : null

  // ── Audio controls ─────────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
    else { audioRef.current.play(); setIsPlaying(true) }
  }

  const handleReplay = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play()
    setIsPlaying(true)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value)
    if (audioRef.current) audioRef.current.currentTime = t
    setCurrentTime(t)
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    if (audioRef.current) audioRef.current.volume = v
    setVolume(v)
  }
const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  const handleSelect = (qId: number, option: string) => {
    if (!showAnswers) setSelected(prev => ({ ...prev, [qId]: option }))
  }

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index)

  const score = showAnswers
    ? questions.filter(q => selected[q.id] === q.answer).length
    : 0

  return (
        <div className="ld-content">

          <nav className="ld-breadcrumb">
            <span className="ld-link" onClick={() => navigate("/skills/listening")}>Kỹ Năng</span>
            <span className="sep">›</span>
            <span className="ld-link" onClick={() => navigate("/skills/listening")}>Listening</span>
            {data?.TieuDe && <><span className="sep">›</span><span>{data.TieuDe}</span></>}
          </nav>

          <button className="ld-back" onClick={() => navigate(-1)}>‹ Quay lại</button>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : !data ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Không tìm thấy bài học.</div>
          ) : (
            <>
              <h1 className="ld-title">🎧 {data.TieuDe}</h1>
              {data.CapDo && (
                <span style={{ background:"#fff3e0", color:"#e87722", padding:"3px 12px", borderRadius:20, fontSize:13, fontWeight:600, marginBottom:16, display:"inline-block" }}>
                  {data.CapDo}
                </span>
              )}

              {/* Learning Objective */}
              {objectives.length > 0 && (
                <div className="ld-card">
                  <p className="ld-card-label">🎯 Learning Objective</p>
                  <p>Sau bài học này, bạn có thể:</p>
                  <ul>{objectives.map((obj, i) => <li key={i}>{obj}</li>)}</ul>
                </div>
              )}

              {/* Audio Player */}
              <div className="ld-card">
                <p className="ld-card-label">🔊 Part 1: Listen</p>

                {audioUrl ? (
                  <div style={{ background:"#f9f5f0", borderRadius:14, padding:"20px 24px", marginTop:8 }}>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                      onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                      onEnded={() => setIsPlaying(false)}
                    />
                    <p style={{ margin:"0 0 16px", fontSize:14, fontWeight:600, color:"#5a3e2b" }}>
                      🎵 {data.FileUrl?.split("/").pop() || "Audio bài nghe"}
                    </p>
<div style={{ marginBottom:12 }}>
                      <input type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
                        onChange={handleSeek}
                        style={{ width:"100%", accentColor:"#e87722", cursor:"pointer" }} />
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#888", marginTop:4 }}>
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <button onClick={togglePlay} style={{ width:48, height:48, borderRadius:"50%", background:"#e87722", border:"none", color:"#fff", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(232,119,34,0.4)" }}>
                        {isPlaying ? "⏸" : "▶"}
                      </button>
                      <button onClick={handleReplay} style={{ background:"#fff", border:"1.5px solid #e0d8cc", borderRadius:8, padding:"8px 14px", cursor:"pointer", fontSize:13, color:"#555" }}>
                        🔄 Replay
                      </button>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
                        <span style={{ fontSize:13, color:"#888" }}>🔊</span>
                        <input type="range" min={0} max={1} step={0.05} value={volume}
                          onChange={handleVolume}
                          style={{ width:80, accentColor:"#e87722", cursor:"pointer" }} />
                      </div>
                    </div>
                  </div>
                ) : data.LinkUrl ? (
                  <div style={{ marginTop:8 }}>
                    <a href={data.LinkUrl} target="_blank" rel="noreferrer">
                      <button className="ld-audio-btn">▶ Mở bài nghe</button>
                    </a>
                    <p style={{ fontSize:13, color:"#888", marginTop:8 }}>
                      🔗 <a href={data.LinkUrl} target="_blank" rel="noreferrer" style={{ color:"#e87722" }}>{data.LinkUrl}</a>
                    </p>
                  </div>
                ) : (
                  <p style={{ color:"#aaa", fontSize:14, marginTop:8 }}>
                    Chưa có file audio. QTV vui lòng upload file MP3.
                  </p>
                )}
              </div>

              {/* Questions */}
              {questions.length > 0 && (
                <div className="ld-card">
                  <p className="ld-card-label">📝 Part 2: Questions</p>
                  <div className="ld-questions">
                    {questions.map(q => (
                      <div className="ld-question" key={q.id}>
                        <p className="ld-q-text">{q.id}. {q.question}</p>
{q.isTrueFalse ? (
                          <div className="ld-options">
                            {["True", "False"].map(opt => (
                              <label key={opt}
                                className={`ld-option ${selected[q.id] === opt ? "selected" : ""}`}
                                onClick={() => handleSelect(q.id, opt)}
                              >{opt}</label>
                            ))}
                          </div>
                        ) : (
                          <div className="ld-options">
                            {q.options.map((opt, i) => (
                              <label key={opt}
                                className={`ld-option ${selected[q.id] === opt ? "selected" : ""}`}
                                onClick={() => handleSelect(q.id, opt)}
                              >
                                {getOptionLabel(i)}. {opt}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!showAnswers ? (
                    <button className="ld-check-btn" onClick={() => setShowAnswers(true)}>
                      Kiểm tra đáp án
                    </button>
                  ) : (
                    <p style={{ marginTop:12, fontWeight:600, color:"#2e7d32" }}>
                      ✅ Bạn đúng {score}/{questions.length} câu
                    </p>
                  )}
                </div>
              )}

              {/* Quick Check */}
              {showAnswers && questions.length > 0 && (
                <div className="ld-card">
                  <p className="ld-card-label">✅ Quick Check Questions</p>
                  <div className="ld-questions">
                    {questions.map(q => (
                      <div className="ld-question" key={q.id}>
                        <p className="ld-q-text-normal">{q.id}. {q.question}</p>
                        {q.isTrueFalse ? (
                          <div className="ld-options">
                            {["True", "False"].map(opt => (
                              <span key={opt} className={`ld-option-answer ${opt === q.answer ? "correct" : ""} ${selected[q.id] === opt && opt !== q.answer ? "wrong" : ""}`}>
                                {opt} {opt === q.answer ? "✅" : selected[q.id] === opt ? "✗" : ""}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="ld-options">
                            {q.options.map((opt, i) => (
                              <span key={opt} className={`ld-option-answer ${opt === q.answer ? "correct" : ""} ${selected[q.id] === opt && opt !== q.answer ? "wrong" : ""}`}>
{getOptionLabel(i)}. {opt} {opt === q.answer ? "✅" : selected[q.id] === opt ? "✗" : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
  )
}

export default ListeningDetail;
