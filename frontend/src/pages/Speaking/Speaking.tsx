import "./Speaking.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

// Nguyên âm & Phụ âm — giữ static vì đây là kiến thức cố định
const phonetics = [
  {
    group: "Nguyên âm (Vowels)",
    color: "#e07b2e",
    bg: "#fff3e0",
    items: [
      { symbol: "/iː/",  example: "see, tea, meet",     hint: "Kéo dài, môi mỉm cười" },
      { symbol: "/ɪ/",   example: "sit, hit, big",      hint: "Ngắn, môi hơi mỉm cười" },
      { symbol: "/e/",   example: "bed, red, head",     hint: "Môi mở ngang" },
      { symbol: "/æ/",   example: "cat, man, bad",      hint: "Miệng mở rộng, hàm xuống thấp" },
      { symbol: "/ɑː/",  example: "car, park, far",     hint: "Kéo dài, miệng mở rộng" },
      { symbol: "/ɒ/",   example: "hot, lot, stop",     hint: "Môi tròn, miệng mở" },
      { symbol: "/ɔː/",  example: "ball, fall, saw",    hint: "Kéo dài, môi tròn" },
      { symbol: "/ʊ/",   example: "book, cook, good",   hint: "Ngắn, môi tròn" },
      { symbol: "/uː/",  example: "food, moon, blue",   hint: "Kéo dài, môi tròn" },
      { symbol: "/ʌ/",   example: "cup, sun, love",     hint: "Ngắn, miệng hơi mở" },
      { symbol: "/ɜː/",  example: "bird, her, word",    hint: "Kéo dài, môi trung tính" },
      { symbol: "/ə/",   example: "about, better",      hint: "Âm trung tính, không nhấn" },
    ],
  },
  {
    group: "Phụ âm (Consonants)",
    color: "#3b82f6",
    bg: "#eff6ff",
    items: [
      { symbol: "/p/",   example: "pen, cup, stop",     hint: "Môi bật ra" },
      { symbol: "/b/",   example: "bad, job, web",      hint: "Môi bật ra, có thanh" },
      { symbol: "/t/",   example: "top, cat, sit",      hint: "Đầu lưỡi chạm lợi" },
      { symbol: "/d/",   example: "dog, red, bad",      hint: "Đầu lưỡi, có thanh" },
      { symbol: "/k/",   example: "cat, key, back",     hint: "Gốc lưỡi chạm vòm mềm" },
      { symbol: "/g/",   example: "go, bag, big",       hint: "Gốc lưỡi, có thanh" },
      { symbol: "/f/",   example: "fan, leaf, off",     hint: "Răng trên cắn môi dưới" },
      { symbol: "/v/",   example: "van, love, very",    hint: "Răng trên môi dưới, có thanh" },
      { symbol: "/θ/",   example: "think, both, truth", hint: "Lưỡi giữa hai hàm răng" },
      { symbol: "/ð/",   example: "this, that, with",   hint: "Lưỡi giữa răng, có thanh" },
      { symbol: "/s/",   example: "sun, miss, face",    hint: "Hơi thoát qua kẽ răng" },
      { symbol: "/z/",   example: "zoo, his, buzz",     hint: "Như /s/ nhưng có thanh" },
      { symbol: "/ʃ/",   example: "she, fish, wash",    hint: "Môi hơi chúm, hơi rộng" },
      { symbol: "/ʒ/",   example: "measure, vision",    hint: "Như /ʃ/ nhưng có thanh" },
      { symbol: "/h/",   example: "hat, who, behind",   hint: "Hơi từ cổ họng" },
      { symbol: "/tʃ/",  example: "chin, watch, teach", hint: "Kết hợp /t/ + /ʃ/" },
      { symbol: "/dʒ/",  example: "jam, age, bridge",   hint: "Kết hợp /d/ + /ʒ/" },
      { symbol: "/m/",   example: "man, swim, home",    hint: "Hai môi khép, âm mũi" },
      { symbol: "/n/",   example: "no, ten, can",       hint: "Đầu lưỡi, âm mũi" },
      { symbol: "/ŋ/",   example: "sing, ring, king",   hint: "Gốc lưỡi, âm mũi" },
      { symbol: "/l/",   example: "leg, fill, call",    hint: "Đầu lưỡi chạm lợi" },
      { symbol: "/r/",   example: "red, very, far",     hint: "Lưỡi cong, không chạm gì" },
      { symbol: "/j/",   example: "yes, you, year",     hint: "Như /i/ nhưng lướt nhanh" },
      { symbol: "/w/",   example: "wet, swim, quick",   hint: "Môi tròn, lướt nhanh" },
    ],
  },
]

const topicEmoji: Record<string, string> = {
  "Beginner":     "🟢",
  "Intermediate": "🟡",
  "Advanced":     "🔴",
  "TOEIC":        "💼",
  "IELTS":        "🎓",
  "Easy":         "😊",
  "Medium":       "🤔",
  "Hard":         "🔥",
}

type Tab = "chude" | "ngu-am"

function Speaking() {
  const [tab, setTab]         = useState<Tab>("chude")
  const [search, setSearch]   = useState("")
  const [data, setData]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/baihocmo/public`)
      .then(r => r.json())
      .then(all => {
        const speaking = Array.isArray(all)
          ? all.filter((b: any) => b.KyNang === "Speaking")
          : []
        setData(speaking)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredTopics = data.filter(t =>
    t.TieuDe.toLowerCase().includes(search.toLowerCase()) ||
    t.MoTa?.toLowerCase().includes(search.toLowerCase())
  )

  const capDoColor: Record<string, { bg: string; color: string }> = {
    "Beginner":     { bg:"#e8f5e9", color:"#2e7d32" },
    "Intermediate": { bg:"#fff3e0", color:"#e65100" },
    "Advanced":     { bg:"#fce4ec", color:"#c62828" },
    "TOEIC":        { bg:"#e3f2fd", color:"#1565c0" },
    "IELTS":        { bg:"#f3e5f5", color:"#6a1b9a" },
  }

  // Parse phrases từ NoiDung
  const getPhrases = (noiDung: string) => {
    try {
      const p = JSON.parse(noiDung)
      return p.phrases || []
    } catch { return [] }
  }

  return (
        <div className="sp-content">

          {/* Breadcrumb */}
          <nav className="sp-breadcrumb">
            <span className="sp-link" onClick={() => navigate("/skills")}>Kỹ Năng</span>
            <span>›</span>
            <span className="sp-active">Speaking</span>
          </nav>

          {/* Tabs */}
          <div className="sp-tabs">
            <button className={`sp-tab ${tab === "chude" ? "active" : ""}`} onClick={() => setTab("chude")}>
              🗣 Luyện theo chủ đề
            </button>
            <button className={`sp-tab ${tab === "ngu-am" ? "active" : ""}`} onClick={() => setTab("ngu-am")}>
              🔤 Nguyên âm & Phụ âm
            </button>
          </div>

          {/* Search */}
          <div className="sp-search">
            <span>🔍</span>
            <input
              placeholder={tab === "chude" ? "Tìm kiếm chủ đề..." : "Tìm kiếm âm..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Tab: Chủ đề — load từ DB */}
          {tab === "chude" && (
            <>
              <h2 className="sp-section-title">Luyện Nói Tiếng Anh Mỗi Ngày</h2>

              {loading ? (
                <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
              ) : (
                <div className="sp-topic-grid">
                  {filteredTopics.length === 0 ? (
                    <p className="sp-empty">Không tìm thấy chủ đề.</p>
                  ) : filteredTopics.map(topic => {
                    const clr = capDoColor[topic.CapDo] || { bg:"#f5f5f5", color:"#555" }
                    const phrases = getPhrases(topic.NoiDung)
                    const emoji = topicEmoji[topic.CapDo] || "🎤"
                    return (
                      <div className="sp-topic-card" key={topic.MaBaiHocMo}>
                        <div className="sp-topic-top">
                          <span className="sp-topic-emoji">{emoji}</span>
                          <div>
                            <p className="sp-topic-title">{topic.TieuDe}</p>
                            {topic.CapDo && (
                              <span style={{
                                background: clr.bg, color: clr.color,
                                padding:"2px 8px", borderRadius:12, fontSize:11, fontWeight:600
                              }}>
                                {topic.CapDo}
                              </span>
                            )}
                          </div>
                        </div>

                        {topic.MoTa && (
                          <p style={{ fontSize:13, color:"#666", margin:"8px 0", lineHeight:1.5 }}>
                            {topic.MoTa}
                          </p>
                        )}

                        {/* Preview 2 phrases */}
                        {phrases.length > 0 && (
                          <ul className="sp-topic-bullets">
                            {phrases.slice(0, 2).map((p: any, i: number) => (
                              <li key={i} style={{ fontSize:12.5 }}>"{p.text}"</li>
                            ))}
                            {phrases.length > 2 && (
                              <li style={{ color:"#e87722", fontSize:12 }}>+{phrases.length - 2} câu nữa...</li>
                            )}
                          </ul>
                        )}

                        <button
                          className="sp-topic-btn"
                          onClick={() => navigate(`/skills/speaking/detail/${topic.MaBaiHocMo}`, {
                            state: { title: topic.TieuDe }
                          })}
                        >
                          Truy cập
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Tab: Nguyên âm & Phụ âm — giữ static */}
          {tab === "ngu-am" && (
            <div className="sp-phonetics">
              {phonetics.map(group => {
                const filtered = group.items.filter(it =>
                  it.symbol.includes(search) ||
                  it.example.toLowerCase().includes(search.toLowerCase()) ||
                  it.hint.toLowerCase().includes(search.toLowerCase())
                )
                if (filtered.length === 0) return null
                return (
                  <div key={group.group} className="sp-phonetic-group">
                    <h3 className="sp-phonetic-group-title" style={{ color: group.color }}>
                      {group.group}
                    </h3>
                    <div className="sp-phonetic-grid">
                      {filtered.map(item => (
                        <div className="sp-phonetic-card" key={item.symbol} style={{ borderTop:`3px solid ${group.color}` }}>
                          <div className="sp-phonetic-symbol" style={{ color: group.color, background: group.bg }}>
                            {item.symbol}
                          </div>
                          <div className="sp-phonetic-info">
                            <p className="sp-phonetic-example">{item.example}</p>
                            <p className="sp-phonetic-hint">{item.hint}</p>
                          </div>
                          <button
                            className="sp-phonetic-btn"
                            style={{ background: group.color }}
                            onClick={() => navigate("/skills/speaking/phonetic", {
                              state: { symbol: item.symbol, example: item.example, hint: item.hint }
                            })}
                          >
                            Luyện tập
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
  )
}

export default Speaking;