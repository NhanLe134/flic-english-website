import "./WritingPractice.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:5000";


interface Sentence {
  id: string;
  text: string;
}


type Level = "A2" | "B1" | "B2" | "C1";
const LEVELS: Level[] = ["A2", "B1", "B2", "C1"]


const levelColor: Record<Level, string> = {
  A2: "#22c55e", B1: "#3b82f6", B2: "#f97316", C1: "#8b5cf6"
}
const levelLabel: Record<Level, string> = {
  A2: "A2 – Sơ cấp", B1: "B1 – Trung cấp", B2: "B2 – Trên trung cấp", C1: "C1 – Nâng cao"
}


function WritingPractice() {
  const navigate = useNavigate()
  const { id }   = useParams()


  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [samples, setSamples] = useState<Record<string, string>>({})
  const [sentences, setSentences] = useState<Sentence[]>([])
  const [correctOrder, setCorrectOrder] = useState<string[]>([])


  const [pool, setPool]       = useState<Sentence[]>([])
  const [dropped, setDropped] = useState<Sentence[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore]     = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [activeLevel, setActiveLevel] = useState<Level>("B1")


  const dragging     = useRef<Sentence | null>(null)
  const draggingFrom = useRef<"pool" | "drop" | null>(null)


useEffect(() => {
  if (!id) return
  fetch(`${API}/baihocmo/${id}`)
    .then(r => r.json())
    .then(d => {
      setData(d)
      try {
        const parsed = JSON.parse(d?.NoiDung || "{}")


        if (parsed.samples) setSamples(parsed.samples)


        // ✅ Ưu tiên đọc sentences[] do admin nhập trực tiếp
        let rawSents: string[] = []


        if (Array.isArray(parsed.sentences) && parsed.sentences.length > 0) {
          rawSents = parsed.sentences.filter((s: string) => s?.trim())
        } else {
          // Fallback: tách từ bài mẫu B1 nếu không có sentences
          const b1 = parsed.samples?.B1 || parsed.samples?.B2 || ""
          if (b1) {
            rawSents = b1
              .split(/(?<=[.!?])\s+/)
              .filter((s: string) => s.trim().length > 10)
              .slice(0, 6)
          }
        }


        if (rawSents.length > 0) {
          const sents: Sentence[] = rawSents.map((text: string, i: number) => ({
            id: String.fromCharCode(65 + i),
            text: text.trim()
          }))
          setCorrectOrder(sents.map(s => s.id))
          setPool([...sents].sort(() => Math.random() - 0.5))
          setSentences(sents)
        }
      } catch {}
    })
    .finally(() => setLoading(false))
}, [id])


  // Drag & drop
  const onDragStart = (s: Sentence, from: "pool" | "drop") => {
    dragging.current     = s
    draggingFrom.current = from
  }


  const onDropToZone = (target: "pool" | "drop") => {
    const s    = dragging.current
    const from = draggingFrom.current
    if (!s || !from || from === target) return
    if (target === "drop" && from === "pool") {
      setPool(p => p.filter(x => x.id !== s.id))
      setDropped(d => [...d, s])
    } else if (target === "pool" && from === "drop") {
      setDropped(d => d.filter(x => x.id !== s.id))
      setPool(p => [...p, s])
    }
    dragging.current     = null
    draggingFrom.current = null
  }


  const handleSubmit = () => {
    if (dropped.length < sentences.length) {
      alert("Bạn chưa sắp xếp hết tất cả câu!")
      return
    }
    const correct = dropped.filter((s, i) => s.id === correctOrder[i]).length
    setScore(correct)
    setSubmitted(true)
  }


  const handleReset = () => {
    setPool([...sentences].sort(() => Math.random() - 0.5))
    setDropped([])
    setSubmitted(false)
    setScore(null)
  }


  const pct = score !== null ? Math.round((score / Math.max(sentences.length, 1)) * 100) : 0


  return (
    <>
        <div className="wp-content">


          {/* Breadcrumb */}
          <div className="wp-top">
            <nav className="wp-breadcrumb">
              <span className="wp-link" onClick={() => navigate("/skills/writing")}>Kỹ năng</span>
              <span className="wp-sep">›</span>
              <span className="wp-link" onClick={() => navigate("/skills/writing")}>Writing</span>
              <span className="wp-sep">›</span>
              <span>Luyện tập</span>
            </nav>
            <button className="wp-back" onClick={() => navigate(-1)}>← Quay lại</button>
          </div>


          <h1 className="wp-title">Luyện tập – {data?.TieuDe || "Writing"}</h1>
          <p className="wp-subtitle">Sắp xếp các câu thành một đoạn văn hoàn chỉnh</p>


          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : sentences.length === 0 ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>
              Bài học này chưa có nội dung luyện tập.
            </div>
          ) : (
            <>
              {/* Topic card */}
              <div className="wp-card">
                <p className="wp-clabel">Bài tập</p>
                <div className="wp-topic-box">
                  <p className="wp-topic">
                    {data?.MoTa || "Sắp xếp các câu thành đoạn văn hoàn chỉnh."}
                  </p>
                  <p className="wp-instr">
                    Kéo và thả các câu bên trái vào khung bên phải theo đúng thứ tự để tạo thành một đoạn văn hoàn chỉnh.
                  </p>
                </div>
              </div>


              {/* Drag & drop */}
              <div className="wp-card">
                <p className="wp-clabel">Sắp xếp câu</p>
                <div className="wp-two-col">
                  <div>
                    <p className="wp-col-title">Các câu (kéo sang phải)</p>
                    <div className="wp-pool" onDragOver={e => e.preventDefault()} onDrop={() => onDropToZone("pool")}>
                      {pool.length === 0 && <p className="wp-placeholder">Tất cả câu đã được sắp xếp</p>}
                      {pool.map(s => (
                        <div key={s.id} className="wp-sentence" draggable onDragStart={() => onDragStart(s, "pool")}>
                          <span className="wp-sent-label">{s.id}</span>
                          <span>{s.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="wp-col-title">Đoạn văn của bạn</p>
                    <div className="wp-dropzone" onDragOver={e => e.preventDefault()} onDrop={() => onDropToZone("drop")}>
                      {dropped.length === 0 && <p className="wp-placeholder">Kéo câu vào đây...</p>}
                      {dropped.map((s, i) => (
                        <div key={s.id} className="wp-sentence" draggable onDragStart={() => onDragStart(s, "drop")}>
                          <span className="wp-order-num">{i + 1}</span>
                          <span>{s.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>


              {/* Result */}
              {submitted && score !== null && (
                <div className="wp-card">
                  <p className="wp-clabel">Kết quả</p>
                  <div className={`wp-result-box ${pct === 100 ? "perfect" : ""}`}>
                    {dropped.map((s, i) => (
                      <p key={s.id} className="wp-result-line">
                        <strong>{i + 1}. [{s.id}]</strong> {s.text}
                      </p>
                    ))}
                  </div>
                </div>
              )}


              {/* Footer */}
              <div className="wp-footer">
                <button className="wp-btn-submit" onClick={handleSubmit}>Nộp bài</button>
                <button className="wp-btn-reset" onClick={handleReset}>Làm lại</button>
                {submitted && score !== null && (
                  <>
                    <div className={`wp-score-badge ${pct === 100 ? "perfect" : ""}`}>
                      Điểm: {score}/{sentences.length} ({pct}%)
                    </div>
                    <button className="wp-btn-sample" onClick={() => setShowModal(true)}>
                      📄 Xem bài mẫu
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>


      {/* Modal bài mẫu */}
      {showModal && (
        <div className="wp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="wp-modal" onClick={e => e.stopPropagation()}>
            <div className="wp-modal-header">
              <h2 className="wp-modal-title">Bài mẫu theo cấp độ</h2>
              <button className="wp-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>


            {/* Level tabs */}
            <div className="wp-level-tabs">
              {LEVELS.filter(lv => samples[lv]).map(lv => (
                <button
                  key={lv}
                  className={`wp-level-tab ${activeLevel === lv ? "active" : ""}`}
                  style={activeLevel === lv ? { borderColor: levelColor[lv], color: levelColor[lv] } : {}}
                  onClick={() => setActiveLevel(lv)}
                >
                  {lv}
                </button>
              ))}
            </div>


            {/* Level label */}
            <div className="wp-level-label" style={{ color: levelColor[activeLevel], background: levelColor[activeLevel] + "18" }}>
              {levelLabel[activeLevel]}
            </div>


            {/* Essay content */}
            <div className="wp-modal-essay">
              <p>{samples[activeLevel] || "Chưa có bài mẫu cho cấp độ này."}</p>
            </div>


            <div className="wp-modal-footer">
              <button className="wp-btn-submit" onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      </>
  )
}


export default WritingPractice;
