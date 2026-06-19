import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import "./TestExamPage.css";

const BASE = import.meta.env.BASE_URL;

interface CauHoi { id: number; noiDung: string; luaChon: string[]; dapAn: string; }
interface ListeningPart { soPhan: number; tieuDe: string; huongDan: string; audioUrl: string; cauHois: CauHoi[]; }
interface ReadingPart { soPhan: number; tieuDe: string; huongDan: string; doanVan: string; cauHois: CauHoi[]; }
interface WritingPart { soPhan: number; tieuDe: string; huongDan: string; noiDung: string; yeuCau: string; soTuToiThieu: number; loaiBai?: string; goiY?: string; }
interface SpeakingPart { soPhan: number; tieuDe: string; moTa: string; audioUrl: string; noiDung: string; thoiGianNoi: number; imageUrl?: string; imageName?: string; }
interface TestData {
  MaBaiTest: number; TieuDe: string; CapDo: string;
  kyNang: {
    listening: { thoiGian: number; parts: ListeningPart[] };
    reading: { thoiGian: number; parts: ReadingPart[] };
    writing: { thoiGian: number; parts: WritingPart[] };
    speaking: { thoiGian: number; parts: SpeakingPart[] };
  };
}
type Skill = "listening" | "reading" | "writing" | "speaking";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// Extract initials for the student name avatar badge
const getInitials = (name: string) => {
  if (!name) return "SV";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// ---- CUSTOM MODAL ----
function Modal({ title, body, warn, onConfirm, onCancel, confirmLabel = "Tiếp tục" }: {
  title: string; body: string; warn?: string;
  onConfirm: () => void; onCancel: () => void;
  confirmLabel?: string;
}) {
  return (
    <div className="exam-modal-overlay">
      <div className="exam-modal-card">
        <button className="exam-modal-close-x" onClick={onCancel}>&times;</button>
        <div className="exam-modal-title">{title}</div>
        <div className="exam-modal-body">
          <p className="exam-modal-main-text">{body}</p>
          {warn && <p className="exam-modal-warn">{warn}</p>}
        </div>
        <div className="exam-modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel}>Hủy</button>
          <button className="modal-btn-confirm" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ---- CUSTOM AUDIO PLAYER ----
function CustomAudioPlayer({ audioUrl, onEnded, isOnce = true, reviewMode = false }: {
  audioUrl: string; onEnded?: () => void; isOnce?: boolean; reviewMode?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [played, setPlayed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeDisp, setTimeDisp] = useState("00:00");
  const [currentTimeDisp, setCurrentTimeDisp] = useState("--:--");

  const handlePlay = () => {
    if ((isOnce && played) || reviewMode) return;
    setPlayed(true);
    audioRef.current?.play();
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    
    const update = () => {
      if (el.duration) {
        setProgress((el.currentTime / el.duration) * 100);
        setCurrentTimeDisp(fmt(Math.floor(el.currentTime)));
      }
    };

    const handleLoadedMetadata = () => {
      setTimeDisp(fmt(Math.floor(el.duration)));
    };

    el.addEventListener("timeupdate", update);
    el.addEventListener("loadedmetadata", handleLoadedMetadata);
    
    if (el.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      el.removeEventListener("timeupdate", update);
      el.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioUrl]);

  return (
    <div className="custom-audio-wrapper">
      <audio ref={audioRef} src={BASE.replace(/\/$/, "") + audioUrl} preload="metadata" onEnded={onEnded} />
      <div className="audio-player-custom">
        <button
          className="audio-play-btn"
          onClick={handlePlay}
          disabled={(isOnce && played) || reviewMode}
          title={reviewMode ? "Không thể nghe ở chế độ xem lại" : (played ? "Đã nghe" : "Nhấn để nghe")}
        >
          <FiPlay style={{ marginLeft: 2 }} />
        </button>
        <span className="audio-time-current">{currentTimeDisp}</span>
        <div className="audio-progress-bar">
          <div className="audio-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="audio-time-duration">{timeDisp}</span>
      </div>
      {isOnce && !reviewMode && (
        <div className="audio-once-warning">
          *Nhấn Play để bắt đầu bài nghe. Khi đã bắt đầu, không thể tạm dừng. Thí sinh chỉ được nghe một lần.
        </div>
      )}
    </div>
  );
}

// ---- LISTENING SECTION ----
function ListeningSection({ part, answers, onAnswer, reviewMode }: {
  part: ListeningPart;
  answers: Record<number, string>;
  onAnswer: (id: number, v: string) => void;
  reviewMode: boolean;
}) {
  return (
    <div className="listening-section">
      <div className="part-direction-box" dangerouslySetInnerHTML={{ __html: part.huongDan || "" }} />
      <div className="part-title-label">PART {part.soPhan}</div>
      <div className="part-subtitle-desc">{part.tieuDe}</div>
      
      <CustomAudioPlayer audioUrl={part.audioUrl} isOnce={true} reviewMode={reviewMode} />

      <div className="questions-container">
        {part.cauHois.map((q) => (
          <div key={q.id} className="question-card-exam">
            <div className="question-text-exam">Question {q.id}: {q.noiDung}</div>
            <div className="options-list">
              {q.luaChon.map((opt) => {
                const optLetter = opt.charAt(0);
                const isSelected = answers[q.id] === optLetter;
                
                let reviewClass = "";
                if (reviewMode) {
                  if (optLetter === q.dapAn) {
                    reviewClass = "correct-answer-review";
                  } else if (isSelected) {
                    reviewClass = "incorrect-answer-review";
                  }
                }

                return (
                  <div
                    key={opt}
                    className={`option-row ${isSelected ? "selected" : ""} ${reviewClass} ${reviewMode ? "disabled" : ""}`}
                    onClick={() => !reviewMode && onAnswer(q.id, optLetter)}
                  >
                    <div className="option-radio">
                      {isSelected && <div className="option-radio-dot" />}
                    </div>
                    <span className="option-label-text">{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- READING SECTION ----
function ReadingSection({ part, answers, onAnswer, reviewMode }: {
  part: ReadingPart;
  answers: Record<number, string>;
  onAnswer: (id: number, v: string) => void;
  reviewMode: boolean;
}) {
  return (
    <div className="reading-layout">
      <div className="reading-passage">
        <div className="passage-header">Directions: <span dangerouslySetInnerHTML={{ __html: part.huongDan || "" }} /></div>
        <div className="passage-content" dangerouslySetInnerHTML={{ __html: part.doanVan || "" }} />
      </div>
      <div className="reading-questions">
        {part.cauHois.map((q) => (
          <div key={q.id} className="question-card-exam">
            <div className="question-text-exam">Question {q.id}: {q.noiDung}</div>
            <div className="options-list">
              {q.luaChon.map((opt) => {
                const optLetter = opt.charAt(0);
                const isSelected = answers[q.id] === optLetter;

                let reviewClass = "";
                if (reviewMode) {
                  if (optLetter === q.dapAn) {
                    reviewClass = "correct-answer-review";
                  } else if (isSelected) {
                    reviewClass = "incorrect-answer-review";
                  }
                }

                return (
                  <div
                    key={opt}
                    className={`option-row ${isSelected ? "selected" : ""} ${reviewClass} ${reviewMode ? "disabled" : ""}`}
                    onClick={() => !reviewMode && onAnswer(q.id, optLetter)}
                  >
                    <div className="option-radio">
                      {isSelected && <div className="option-radio-dot" />}
                    </div>
                    <span className="option-label-text">{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- WRITING SECTION ----
function WritingSection({ part, value, onChange, reviewMode }: {
  part: WritingPart; value: string; onChange: (v: string) => void; reviewMode: boolean;
}) {
  return (
    <div className="writing-section">
      <div className="writing-prompt-box">
        <div className="writing-prompt-header" dangerouslySetInnerHTML={{ __html: part.huongDan || "" }} />
        {part.goiY && (
          <div className="writing-suggested-hints" style={{ marginTop: 12, marginBottom: 12, padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}>
            <strong style={{ color: "#F95800" }}>Gợi ý làm bài:</strong>
            <div style={{ marginTop: 6, lineHeight: "1.5" }} dangerouslySetInnerHTML={{ __html: part.goiY }} />
          </div>
        )}
        <div className="writing-letter-quote" dangerouslySetInnerHTML={{ __html: part.noiDung || "" }} />
        <div className="writing-instruction">{part.yeuCau}</div>
      </div>
      <div className="writing-answer-box">
        <div className="writing-answer-header">
          <span className="writing-answer-label">Your answer:</span>
        </div>
        <textarea
          className="writing-textarea"
          value={value}
          disabled={reviewMode}
          onChange={e => onChange(e.target.value)}
          placeholder={reviewMode ? "Không có câu trả lời." : "Write your answer here..."}
        />
      </div>
    </div>
  );
}

// ---- SPEAKING SECTION ----
type SpeakPhase = "initial_prep" | "audio_playing" | "pre_record" | "recording" | "saved" | "all_done";

function SpeakingSection({
  parts,
  reviewMode,
  speakingPartIdx,
  speakingPhase,
  speakingCountdown,
  onAudioEnded
}: {
  parts: SpeakingPart[];
  reviewMode: boolean;
  speakingPartIdx: number;
  speakingPhase: SpeakPhase;
  speakingCountdown: number;
  onAudioEnded: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reviewPartIdx, setReviewPartIdx] = useState(0);

  const activeIdx = reviewMode ? reviewPartIdx : speakingPartIdx;
  const part = parts[activeIdx] || parts[0];

  useEffect(() => {
    if (audioRef.current && !reviewMode) {
      if (speakingPhase === "audio_playing") {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { /* autoplay block */ });
      } else {
        audioRef.current.pause();
      }
    }
  }, [speakingPhase, activeIdx, reviewMode]);

  // Speaking Review Mode Render
  if (reviewMode) {
    return (
      <div className="speaking-layout-review-wrapper">
        {/* Tab buttons to switch questions during review */}
        <div className="speaking-review-tabs" style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {parts.map((_, i) => (
            <button
              key={i}
              className={`bottom-part-btn ${activeIdx === i ? "active" : ""}`}
              onClick={() => setReviewPartIdx(i)}
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              Câu hỏi {i + 1}
            </button>
          ))}
        </div>

        <div className="speaking-layout">
          <div className="speaking-left-pane">
            <div className="speaking-question-box">
              <div className="speaking-q-title">{part.moTa}</div>
              <div className="speaking-q-content" dangerouslySetInnerHTML={{ __html: part.noiDung || "" }} />
              {part.imageUrl && (
                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <img src={part.imageUrl} alt="Speaking Visual Prompt" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px", objectFit: "contain", border: "1px solid #cbd5e1" }} />
                </div>
              )}
            </div>
          </div>
          <div className="speaking-right-pane">
            <div className="speaking-status-box">
              <div className="speaking-status-inner">
                <div className="speaking-status-label green-text">BÀI NÓI ĐÃ ĐƯỢC GHI NHẬN</div>
                <p className="speaking-saved-sub" style={{ marginTop: 12 }}>
                  Bài nói của phần này đã được lưu lại để gửi giảng viên chấm điểm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (speakingPhase === "all_done") return (
    <div className="speaking-section">
      <div className="speaking-done-box">
        <div className="speaking-done-title">Bài thi nói đã được ghi nhận.</div>
        <div className="speaking-done-sub">Nhấn nút Nộp bài tại góc trên cùng bên phải để hoàn tất bài thi.</div>
      </div>
    </div>
  );

  if (speakingPhase === "initial_prep") return (
    <div className="speaking-section">
      <div className="speaking-prep-screen">
        <div className="speaking-prep-icon">
          <img
            src={BASE.replace(/\/$/, "") + "/headset-student.png"}
            alt="Headset icon"
            className="speaking-prep-image"
            style={{ width: 120, height: 120, objectFit: "contain" }}
          />
        </div>
        <div className="speaking-prep-title">ĐEO TAI NGHE ĐỂ LÀM BÀI THI NÓI</div>
        <div className="speaking-prep-timer">{fmt(speakingCountdown)}</div>
        <div className="speaking-prep-sub">
          BÀI LÀM SẼ ĐƯỢC THU ÂM TRỰC TIẾP<br />
          TRONG LÚC THU ÂM KHÔNG ĐƯỢC TƯƠNG TÁC VỚI HỆ THỐNG
        </div>
      </div>
    </div>
  );

  return (
    <div className="speaking-layout">
      <audio
        ref={audioRef}
        src={BASE.replace(/\/$/, "") + part.audioUrl}
        autoPlay={speakingPhase === "audio_playing"}
        onEnded={onAudioEnded}
      />
      
      <div className="speaking-left-pane">
        <div className="speaking-question-box">
          <div className="speaking-q-title">{part.moTa}</div>
          
          <div className="custom-audio-wrapper speaking-audio-wrapper">
            <div className="audio-player-custom">
              <button
                className="audio-play-btn"
                onClick={() => audioRef.current?.play()}
                disabled={speakingPhase !== "audio_playing"}
              >
                <FiPlay style={{ marginLeft: 2 }} />
              </button>
              <span className="audio-time-current">
                {speakingPhase === "audio_playing" ? fmt(30 - speakingCountdown) : "--:--"}
              </span>
              <div className="audio-progress-bar">
                <div
                  className="audio-progress-fill"
                  style={{
                    width: speakingPhase === "audio_playing"
                      ? `${((30 - speakingCountdown) / 30) * 100}%`
                      : "0%"
                  }}
                />
              </div>
              <span className="audio-time-duration">
                {speakingPhase === "audio_playing" ? "00:30" : "--:--"}
              </span>
            </div>
            <p className="speaking-audio-warning">
              *Hệ thống tự động phát phát câu hỏi. Nếu không tự chạy, vui lòng bấm nút Play để nghe.
            </p>
          </div>

          <div className="speaking-q-content" dangerouslySetInnerHTML={{ __html: part.noiDung || "" }} />
          {part.imageUrl && (
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <img src={part.imageUrl} alt="Speaking Visual Prompt" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px", objectFit: "contain", border: "1px solid #cbd5e1" }} />
            </div>
          )}
        </div>
      </div>

      <div className="speaking-right-pane">
        <div className="speaking-status-box">
          {speakingPhase === "audio_playing" && (
            <div className="speaking-status-inner">
              <div className="speaking-status-label">Đang phát câu hỏi...</div>
              <div className="speaking-countdown-big">{speakingCountdown} GIÂY</div>
            </div>
          )}
          {speakingPhase === "pre_record" && (
            <div className="speaking-status-inner">
              <div className="speaking-status-label red-text">HỆ THỐNG GHI ÂM SẼ BẮT ĐẦU SAU</div>
              <div className="speaking-countdown-big red-text">{speakingCountdown} GIÂY</div>
            </div>
          )}
          {speakingPhase === "recording" && (
            <div className="speaking-status-inner">
              <div className="speaking-recording-label">
                ĐANG GHI ÂM BÀI NÓI TRỰC TIẾP
              </div>
              <div className="waveform-container">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="wave-bar" />
                ))}
              </div>
              <div className="speaking-countdown-big">{fmt(speakingCountdown)}</div>
            </div>
          )}
          {speakingPhase === "saved" && (
            <div className="speaking-status-inner">
              <div className="speaking-status-label green-text">
                {speakingPartIdx === parts.length - 1
                  ? "ĐÃ LƯU BÀI THI NÓI THÀNH CÔNG!"
                  : "ĐÃ LƯU ĐOẠN THU ÂM THÀNH CÔNG!"}
              </div>
              <div className="speaking-saved-sub">
                {speakingPartIdx === parts.length - 1
                  ? "Đang chuẩn bị nộp bài và chấm điểm..."
                  : "Đang tự động chuyển sang câu tiếp theo..."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STATIC_QUESTIONS = {
  listening: {
    thoiGian: 45 * 60,
    parts: [
      {
        soPhan: 1,
        tieuDe: "Part 1: Short Conversations",
        huongDan: "In this part, you will hear EIGHT short recordings. The recordings will be played ONCE only. There is one question following each recording. For each question, choose the right answer A, B, C or D.",
        audioUrl: "/coffee-shop.mp3",
        cauHois: [
          { id: 1, noiDung: "What music will they have at the party?", luaChon: ["A. guitar", "B. cello", "C. CDs", "D. piano"], dapAn: "D" },
          { id: 2, noiDung: "What is the man's problem?", luaChon: ["A. He lost his wallet", "B. He missed his flight", "C. He forgot his passport", "D. He is late for work"], dapAn: "B" },
          { id: 3, noiDung: "Where does this conversation take place?", luaChon: ["A. At a hospital", "B. At a bank", "C. At a restaurant", "D. At a school"], dapAn: "C" },
          { id: 4, noiDung: "What will the woman do next?", luaChon: ["A. Call a taxi", "B. Take the bus", "C. Walk home", "D. Drive her car"], dapAn: "A" },
          { id: 5, noiDung: "What is being discussed?", luaChon: ["A. A job promotion", "B. A business trip", "C. A company meeting", "D. A new project"], dapAn: "D" },
          { id: 6, noiDung: "How does the man feel about the news?", luaChon: ["A. Excited", "B. Disappointed", "C. Confused", "D. Worried"], dapAn: "A" },
          { id: 7, noiDung: "What time does the train depart?", luaChon: ["A. 8:00 AM", "B. 9:30 AM", "C. 10:00 AM", "D. 11:15 AM"], dapAn: "C" },
          { id: 8, noiDung: "What does the woman suggest?", luaChon: ["A. Buying a new phone", "B. Visiting a doctor", "C. Going on vacation", "D. Starting a business"], dapAn: "B" }
        ]
      },
      {
        soPhan: 2,
        tieuDe: "Part 2: Longer Conversations",
        huongDan: "In this part, you will hear TWO longer conversations. Answer the questions that follow each conversation.",
        audioUrl: "/job-interview.mp3",
        cauHois: [
          { id: 9, noiDung: "What is the main topic of the conversation?", luaChon: ["A. Travel planning", "B. Job application", "C. Business meeting", "D. School project"], dapAn: "B" },
          { id: 10, noiDung: "What position is being discussed?", luaChon: ["A. Manager", "B. Engineer", "C. Teacher", "D. Accountant"], dapAn: "A" },
          { id: 11, noiDung: "How long has the applicant worked in the field?", luaChon: ["A. 2 years", "B. 5 years", "C. 7 years", "D. 10 years"], dapAn: "C" },
          { id: 12, noiDung: "What will happen next?", luaChon: ["A. A second interview", "B. A written test", "C. A training session", "D. A contract signing"], dapAn: "A" },
          { id: 13, noiDung: "What does the interviewer say about the company?", luaChon: ["A. It is expanding rapidly", "B. It is facing financial difficulties", "C. It is looking for interns", "D. It recently merged"], dapAn: "A" }
        ]
      },
      {
        soPhan: 3,
        tieuDe: "Part 3: Talks and Announcements",
        huongDan: "In this part, you will hear THREE short talks. Answer the questions based on what you hear.",
        audioUrl: "/weather-forecast.mp3",
        cauHois: [
          { id: 14, noiDung: "What is the purpose of this announcement?", luaChon: ["A. To warn about bad weather", "B. To advertise a product", "C. To announce a schedule change", "D. To introduce new staff"], dapAn: "A" },
          { id: 15, noiDung: "According to the forecast, what will happen tomorrow?", luaChon: ["A. Heavy rain", "B. Strong winds", "C. Clear skies", "D. Thunderstorms"], dapAn: "D" },
          { id: 16, noiDung: "What advice is given to listeners?", luaChon: ["A. Stay indoors", "B. Drive carefully", "C. Carry an umbrella", "D. Avoid the beach"], dapAn: "C" },
          { id: 17, noiDung: "When will the weather improve?", luaChon: ["A. Tonight", "B. Tomorrow morning", "C. This weekend", "D. Next week"], dapAn: "C" },
          { id: 18, noiDung: "What temperature is expected?", luaChon: ["A. 15°C", "B. 20°C", "C. 25°C", "D. 30°C"], dapAn: "B" },
          { id: 19, noiDung: "Which area will be most affected?", luaChon: ["A. Northern region", "B. Southern region", "C. Coastal areas", "D. Mountain areas"], dapAn: "C" },
          { id: 20, noiDung: "What should people prepare for the storm?", luaChon: ["A. Emergency supplies", "B. Rain boots", "C. Sun cream", "D. Extra clothing"], dapAn: "A" }
        ]
      }
    ]
  },
  reading: {
    thoiGian: 60 * 60,
    parts: [
      {
        soPhan: 1,
        tieuDe: "Part 1: Reading Comprehension",
        huongDan: "Directions: In this section, you will read several passages. Each one is followed by several questions about it. For questions 1-40, you are to choose the one best answer A, B, C or D to each question. Answer all questions following a passage on the basis of what is stated or implied in that passage.",
        doanVan: "(A) It is estimated that over 99 percent of all species that ever existed have become extinct. What causes extinction? When a species is no longer adapted to a changed environment, it may perish. The exact causes of a species' death vary from situation to situation. Rapid ecological change may render an environment hostile to a species. For example, temperatures may change and a species may not be able to adapt. Food resources may be affected by environmental changes, which will then cause problems for a species requiring these resources. Other species may become better adapted to an environment, resulting in competition and, ultimately, in the death of a species. The fossil record reveals that extinction has occurred throughout the history of Earth. Recent analyses have also revealed that on some occasions many species became extinct at the same time—a mass extinction. One of the best-known examples of mass extinction occurred 65 million years ago with the demise of dinosaurs and many other forms of life.\n\n(B) Perhaps the largest mass extinction was the one that occurred 225 million years ago, when approximately 95 percent of all species died. Mass extinctions can be caused by a relatively rapid change in the environment and can be worsened by the close interrelationship of many species. If, for example, something was to happen to destroy much of the plankton in the oceans, then the oxygen content of Earth would drop, affecting even organisms not living in the oceans. Such a change would probably lead to a mass extinction.",
        cauHois: [
          { id: 1, noiDung: "The word 'it' in paragraph (A) refers to", luaChon: ["A. extinction", "B. species", "C. environment", "D. 99 percent"], dapAn: "A" },
          { id: 2, noiDung: "The word 'ultimately' in paragraph (A) is closest in meaning to", luaChon: ["A. unfortunately", "B. eventually", "C. exceptionally", "D. dramatically"], dapAn: "B" },
          { id: 3, noiDung: "What does the author say in paragraph (A) regarding most species in Earth's history?", luaChon: ["A. They have caused rapid change in the environment.", "B. They are no longer in existence.", "C. They have remained basically unchanged from their original forms.", "D. They have been able to adapt to ecological changes."], dapAn: "B" },
          { id: 4, noiDung: "Which of the following is NOT mentioned in paragraph (A) as resulting from rapid ecological change?", luaChon: ["A. Temperature changes", "B. Competition among species", "C. Availability of food resources", "D. Introduction of new species"], dapAn: "D" },
          { id: 5, noiDung: "The word 'demise' in paragraph (A) is closest in meaning to", luaChon: ["A. change", "B. recovery", "C. death", "D. escape"], dapAn: "C" },
          { id: 6, noiDung: "According to paragraph (B), what happened 225 million years ago?", luaChon: ["A. A new species evolved", "B. 95% of all species went extinct", "C. Plankton disappeared from oceans", "D. Dinosaurs first appeared"], dapAn: "B" },
          { id: 7, noiDung: "What role does plankton play according to paragraph (B)?", luaChon: ["A. It produces food for fish", "B. It contributes to Earth's oxygen content", "C. It prevents ocean pollution", "D. It regulates temperature"], dapAn: "B" },
          { id: 8, noiDung: "The word 'worsened' in paragraph (B) is closest in meaning to", luaChon: ["A. improved", "B. interrupted", "C. made more severe", "D. prevented"], dapAn: "C" },
          { id: 9, noiDung: "What is the main idea of this passage?", luaChon: ["A. Dinosaurs dominated Earth for millions of years", "B. Extinction is a natural process that has occurred throughout Earth's history", "C. Human activity is the main cause of extinction", "D. Most species alive today evolved from ancient organisms"], dapAn: "B" },
          { id: 10, noiDung: "Which is the best title for this passage?", luaChon: ["A. The Age of Dinosaurs", "B. Environmental Changes on Earth", "C. Extinction: Causes and Examples", "D. Marine Life and Oxygen"], dapAn: "C" }
        ]
      },
      {
        soPhan: 2,
        tieuDe: "Part 2: Vocabulary in Context",
        huongDan: "Read the passage and answer the vocabulary questions.",
        doanVan: "The Industrial Revolution, which began in Britain in the mid-18th century, fundamentally transformed society and the economy. Factories replaced cottage industries, urbanization accelerated as workers moved to cities, and new technologies like the steam engine dramatically increased productivity. However, these changes also brought significant social challenges, including harsh working conditions, child labor, and growing inequality between factory owners and workers. The era also sparked important social movements that eventually led to labor reforms and improvements in workers' rights.",
        cauHois: [
          { id: 11, noiDung: "The word 'fundamentally' in the passage is closest in meaning to", luaChon: ["A. temporarily", "B. basically/completely", "C. gradually", "D. partially"], dapAn: "B" },
          { id: 12, noiDung: "What does 'urbanization' refer to?", luaChon: ["A. The growth of rural areas", "B. The movement of people to cities", "C. Industrial development", "D. Agricultural expansion"], dapAn: "B" },
          { id: 13, noiDung: "Which best describes the 'cottage industries' mentioned in the passage?", luaChon: ["A. Large factory-based production", "B. Small-scale home-based production", "C. Agricultural activities", "D. International trade"], dapAn: "B" },
          { id: 14, noiDung: "According to the passage, what was a major social problem of the Industrial Revolution?", luaChon: ["A. Lack of new technology", "B. Decreasing productivity", "C. Harsh working conditions", "D. Rural overpopulation"], dapAn: "C" },
          { id: 15, noiDung: "What eventually resulted from social movements of that era?", luaChon: ["A. End of industrialization", "B. Return to cottage industries", "C. Labor reforms and workers' rights improvements", "D. Factory closures"], dapAn: "C" }
        ]
      },
      {
        soPhan: 3,
        tieuDe: "Part 3: Text Completion",
        huongDan: "Choose the best answer to complete each sentence based on the context.",
        doanVan: "Climate change is one of the most pressing issues of our time. Scientists have warned that without significant reductions in greenhouse gas emissions, global temperatures could rise by more than 2 degrees Celsius above pre-industrial levels by the end of this century. Such a rise would have devastating consequences for ecosystems, weather patterns, sea levels, and human societies. International agreements like the Paris Accord aim to coordinate global efforts to limit warming and transition to cleaner energy sources.",
        cauHois: [
          { id: 16, noiDung: "The word 'pressing' in the passage is closest in meaning to", luaChon: ["A. easy", "B. urgent", "C. minor", "D. outdated"], dapAn: "B" },
          { id: 17, noiDung: "What do scientists warn will happen without emission reductions?", luaChon: ["A. Sea levels will drop", "B. Temperatures will fall", "C. Global temperatures will rise significantly", "D. Weather will improve"], dapAn: "C" },
          { id: 18, noiDung: "What is the purpose of the Paris Accord according to the passage?", luaChon: ["A. To ban fossil fuels entirely", "B. To coordinate global efforts to limit warming", "C. To increase greenhouse gas emissions", "D. To fund new technologies"], dapAn: "B" },
          { id: 19, noiDung: "The word 'devastating' is closest in meaning to", luaChon: ["A. beneficial", "B. minor", "C. destructive", "D. temporary"], dapAn: "C" },
          { id: 20, noiDung: "What areas would be affected by a temperature rise above 2°C?", luaChon: ["A. Only polar regions", "B. Ecosystems and weather patterns", "C. Only human societies", "D. Only sea levels"], dapAn: "B" }
        ]
      },
      {
        soPhan: 4,
        tieuDe: "Part 4: Long Reading",
        huongDan: "Read the following passage carefully and answer all questions.",
        doanVan: "The continents may have first risen high above the oceans of the world about 3 billion years ago, researchers say. That is about a billion years earlier than geoscientists had suspected for the emergence of a good chunk of the continents.\n\nEarth is the only known planet whose surface is divided into continents and oceans. Currently, the continents rise an average of about 2.5 miles (4 kilometers) above the seafloor.\n\nThe continents are composed of a thick, buoyant crust that is about 21 miles (35 km) deep, on average, whereas the comparatively thin, dense crust of the ocean floor is only about 4 miles (7 km) thick. Because the continents are so thick and buoyant, they are less likely than oceanic crust to sink into Earth's interior, which is why so many ancient continental rocks have survived in the Earth's crust. Details of how the continents formed, when and how they formed, remains hotly contested.",
        cauHois: [
          { id: 21, noiDung: "According to the geoscientists, when were the continents assumed to first rise above the oceans?", luaChon: ["A. 2 billion years ago", "B. 3 billion years ago", "C. 4 billion years ago", "D. 1 billion years ago"], dapAn: "B" },
          { id: 22, noiDung: "What is true about the continents?", luaChon: ["A. They are thinner than oceanic crust", "B. They have a dense crust", "C. They are made of buoyant crust", "D. They sink frequently"], dapAn: "C" },
          { id: 23, noiDung: "What is Earth unique in having?", luaChon: ["A. A surface divided into continents and oceans", "B. Water on its surface", "C. A thick atmosphere", "D. Volcanic activity"], dapAn: "A" },
          { id: 24, noiDung: "The phrase 'To shed light on' means", luaChon: ["A. To ignite", "B. To clarify", "C. To illustrate", "D. To release"], dapAn: "B" },
          { id: 25, noiDung: "According to the passage, how was the crust of the seafloor formed?", luaChon: ["A. Through tectonic compression", "B. Through silica deposition", "C. Through volcanic activity on land", "D. Through erosion of continents"], dapAn: "A" },
          { id: 26, noiDung: "What is the average depth of continental crust?", luaChon: ["A. 4 km", "B. 7 km", "C. 35 km", "D. 21 miles"], dapAn: "C" },
          { id: 27, noiDung: "Why have ancient continental rocks survived in Earth's crust?", luaChon: ["A. They are harder than ocean rocks", "B. They are less likely to sink into Earth's interior", "C. They were protected by glaciers", "D. They formed recently"], dapAn: "B" },
          { id: 28, noiDung: "What remains 'hotly contested' according to the passage?", luaChon: ["A. The age of the oceans", "B. The formation of continents", "C. The depth of the seafloor", "D. The composition of rocks"], dapAn: "B" },
          { id: 29, noiDung: "How far do continents rise above the seafloor on average?", luaChon: ["A. 1.5 miles", "B. 2 miles", "C. 2.5 miles", "D. 3 miles"], dapAn: "C" },
          { id: 30, noiDung: "The passage is mainly about", luaChon: ["A. Ocean floor formation", "B. The origin and nature of continents", "C. Volcanic activity", "D. Erosion processes"], dapAn: "B" }
        ]
      }
    ]
  },
  writing: {
    thoiGian: 60 * 60,
    parts: [
      {
        soPhan: 1,
        tieuDe: "Part 1: Letter Writing",
        huongDan: "You should spend about 20 minutes on this task. You have received this email from an English-speaking pen friend.",
        noiDung: "I'm a rock fan. I can listen to rock all day.\n\nWhat about you?\nWhat kind of music do you like?\nWhat is your favourite song and artist?\nPlease write to tell me more about your music taste.",
        yeuCau: "Write an email to your friend responding to their questions and sharing your music preferences.\n\nYou should write at least 120 words. Do not include your name. Your response will be evaluated in terms of Task Fulfillment, Organization, Vocabulary and Grammar.",
        soTuToiThieu: 120
      },
      {
        soPhan: 2,
        tieuDe: "Part 2: Essay Writing",
        huongDan: "You should spend about 40 minutes on this task. Write about the following topic.",
        noiDung: "Some people believe that technology has made our lives easier and more convenient. Others think it has made life more complicated and stressful.\n\nDiscuss both views and give your own opinion.",
        yeuCau: "Give reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nYou should write at least 250 words. Your response will be evaluated in terms of Task Fulfillment, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.",
        soTuToiThieu: 250
      }
    ]
  },
  speaking: {
    thoiGian: 12 * 60,
    parts: [
      {
        soPhan: 1,
        tieuDe: "Part 1: Social Interaction",
        moTa: "Question 1: Social Interaction (3 minutes)",
        audioUrl: "/coffee-shop.mp3",
        noiDung: "The examiner will ask you some questions about yourself and your life. Please answer naturally and in full sentences. Topic: Your daily routine and hobbies.\n\nSample questions:\n- What do you usually do in the morning?\n- What are your hobbies and why do you enjoy them?\n- How do you spend your weekends?",
        thoiGianNoi: 3 * 60
      },
      {
        soPhan: 2,
        tieuDe: "Part 2: Solution Discussion",
        moTa: "Question 2: Solution Discussion (4 minutes)",
        audioUrl: "/job-interview.mp3",
        noiDung: "Situation: If you won a lottery of 1 billion VND, what would you do with the money? Three options are suggested: buying a new house, starting a business, and depositing the money in the bank. Which option do you think is the best choice? Why?",
        thoiGianNoi: 4 * 60
      },
      {
        soPhan: 3,
        tieuDe: "Part 3: Topic Development",
        moTa: "Question 3: Topic Development (5 minutes)",
        audioUrl: "/weather-forecast.mp3",
        noiDung: "Topic: The impact of social media on modern society.\n\nDiscuss the following points:\n- How has social media changed the way people communicate?\n- What are the positive and negative effects of social media?\n- Do you think the benefits of social media outweigh the disadvantages? Give your reasons.",
        thoiGianNoi: 5 * 60
      }
    ]
  }
};

// ---- MAIN EXAM PAGE ----
export default function TestExamPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const isLoggedIn = !!sessionStorage.getItem("user");

  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState<Skill>("listening");
  const [partIdx, setPartIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  const [writingAnswers, setWritingAnswers] = useState<Record<number, string>>({});
  const [doneParts, setDoneParts] = useState<Record<string, boolean>>({});
  const [doneSkills, setDoneSkills] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");
  const [violationCount, setViolationCount] = useState(0);
  const [modal, setModal] = useState<{ type: string; onConfirm: () => void } | null>(null);
  const [hoTen, setHoTen] = useState("Sinh Viên");

  // Submitted results state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [scores, setScores] = useState<{ listening: number; reading: number; final: number; level: string } | null>(null);

  // Speaking States
  const [speakingPartIdx, setSpeakingPartIdx] = useState(0);
  const [speakingPhase, setSpeakingPhase] = useState<SpeakPhase>("initial_prep");
  const [speakingCountdown, setSpeakingCountdown] = useState(60);

  // Generate persistent mock "Mã lượt thi"
  const luotThiCodeRef = useRef(Math.floor(100000 + Math.random() * 900000));

  const skillList: Skill[] = ["listening", "reading", "writing", "speaking"];
  const skillLabels: Record<Skill, string> = {
    listening: "Listening - 45",
    reading: "Reading - 60",
    writing: "Writing - 60",
    speaking: "Speaking - 12"
  };

  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem("user") || "{}");
      setHoTen(u.HoTen || "Sinh Viên");
    } catch { /* empty */ }

    const testIdNum = parseInt(testId || "1");
    let testTitle = testIdNum === 1 ? "VSTEP B1 - Đề thi mẫu số 1" : testIdNum === 2 ? "VSTEP B2 - Đề thi mẫu số 2" : "TOEIC Practice Test - Full Exam";
    let testLevel = testIdNum === 3 ? "Intermediate" : testIdNum === 1 ? "B1" : "B2";
    let customQuestions = STATIC_QUESTIONS;

    const localTestsStr = localStorage.getItem("flic_student_practice_tests");
    if (localTestsStr) {
      try {
        const localTests = JSON.parse(localTestsStr);
        const currentTest = localTests.find((t: any) => t.MaBaiTest === testIdNum);
        if (currentTest) {
          testTitle = currentTest.TieuDe;
          testLevel = currentTest.CapDo;
          if (currentTest.kyNang) {
            customQuestions = currentTest.kyNang;
          } else if (currentTest.questions && currentTest.questions.length > 0) {
            const cloned = JSON.parse(JSON.stringify(STATIC_QUESTIONS));
            cloned.reading.parts = [
              {
                soPhan: 1,
                tieuDe: "Phần 1: Câu hỏi do Giảng viên tạo",
                huongDan: "Đọc kỹ câu hỏi và chọn đáp án chính xác.",
                doanVan: currentTest.MoTa || "Vui lòng chọn đáp án đúng cho từng câu hỏi bên dưới.",
                cauHois: currentTest.questions.map((q: any, index: number) => ({
                  id: q.id || index + 1,
                  noiDung: q.noiDung,
                  luaChon: q.luaChon || [],
                  dapAn: q.dapAn
                }))
              }
            ];
            cloned.reading.parts = [cloned.reading.parts[0]];
            cloned.reading.thoiGian = (currentTest.TongThoiGian || 120) * 60;
            customQuestions = cloned;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    setTestData({
      MaBaiTest: testIdNum,
      TieuDe: testTitle,
      CapDo: testLevel,
      kyNang: customQuestions
    });
    setTimeLeft(customQuestions.listening.thoiGian);
    setLoading(false);
  }, [testId]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  const doSave = useCallback(() => {
    // Frontend-only: skip fetch call
    showToast("Bài làm đã được lưu vào hệ thống.");
    setDoneParts(p => ({ ...p, [`${skill}_${partIdx}`]: true }));
  }, [skill, partIdx, showToast]);

  // Speaking Audio Ended Callback
  const handleSpeakingAudioEnded = useCallback(() => {
    // Left empty: transitions are controlled strictly by speakingCountdown timer
  }, []);

  // Timer Effect supporting refined Speaking logic
  useEffect(() => {
    if (!testData || loading || isSubmitted || reviewMode) return;

    if (timeLeft <= 0) {
      if (skill === "speaking") {
        if (speakingPhase !== "saved") {
          calculateScores();
          setIsSubmitted(true);
          setModal(null);
          return;
        }
      } else {
        doSave();
        const idx = skillList.indexOf(skill);
        if (idx < skillList.length - 1) {
          const next = skillList[idx + 1];
          setDoneSkills(p => ({ ...p, [skill]: true }));
          setSkill(next);
          setPartIdx(0);
          setTimeLeft(testData.kyNang[next].thoiGian);
          
          if (next === "speaking") {
            setSpeakingPhase("initial_prep");
            setSpeakingCountdown(60);
            setSpeakingPartIdx(0);
          }
        }
        return;
      }
    }

    if (skill !== "speaking") {
      const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(t);
    } else {
      const t = setInterval(() => {
        if (speakingPhase === "recording") {
          setTimeLeft(p => p - 1);
        }

        if (speakingPhase === "initial_prep" || speakingPhase === "pre_record" || speakingPhase === "audio_playing" || speakingPhase === "saved") {
          setSpeakingCountdown(c => {
            if (c <= 1) {
              if (speakingPhase === "initial_prep") {
                setSpeakingPhase("audio_playing");
                return 30; // 30s audio playing countdown
              } else if (speakingPhase === "audio_playing") {
                setSpeakingPhase("pre_record");
                return 60; // 60s prep countdown
              } else if (speakingPhase === "pre_record") {
                setSpeakingPhase("recording");
                // Q1: 3 min (180s), Q2: 4 min (240s), Q3: 5 min (300s)
                const recordTimes = [180, 240, 300];
                return recordTimes[speakingPartIdx] || 180;
              } else if (speakingPhase === "saved") {
                const nextIdx = speakingPartIdx + 1;
                if (nextIdx < testData.kyNang.speaking.parts.length) {
                  setSpeakingPartIdx(nextIdx);
                  setSpeakingPhase("audio_playing");
                  return 30; // 30s audio playing for next part
                } else {
                  calculateScores();
                  setIsSubmitted(true);
                  setModal(null);
                  return 0;
                }
              }
              return 0;
            }
            return c - 1;
          });
        } else if (speakingPhase === "recording") {
          setSpeakingCountdown(c => {
            if (c <= 1) {
              setSpeakingPhase("saved");
              return 3; // 3 seconds display of saved status
            }
            return c - 1;
          });
        }
      }, 1000);

      return () => clearInterval(t);
    }
  }, [timeLeft, skill, testData, loading, doSave, isSubmitted, reviewMode, speakingPhase, speakingPartIdx]);

  // Keyboard block for Listening & Reading
  useEffect(() => {
    if (skill !== "listening" && skill !== "reading" || isSubmitted || reviewMode) return;
    const block = (e: KeyboardEvent) => {
      e.preventDefault();
      setViolationCount(p => {
        const next = p + 1;
        if (next >= 2 && skill === "reading") {
          showToast("Bài thi bị hủy do vi phạm quy định!");
          setTimeout(() => navigate("/test-thu-sv"), 2000);
        }
        return next;
      });
    };
    window.addEventListener("keydown", block);
    return () => window.removeEventListener("keydown", block);
  }, [skill, navigate, showToast, isSubmitted, reviewMode]);

  const getSkillData = () => testData ? testData.kyNang[skill] : null;

  const getCurrentPart = () => {
    const sd = getSkillData();
    if (!sd) return null;
    return (sd as any).parts[partIdx] as (ListeningPart | ReadingPart | WritingPart | SpeakingPart) | undefined;
  };

  const countAnswered = () => {
    if (skill === "writing") {
      return Object.keys(writingAnswers).length;
    }
    if (skill === "speaking") {
      return speakingPartIdx;
    }
    return Object.keys(answers[skill] || {}).length;
  };

  const countTotal = () => {
    const sd = getSkillData();
    if (!sd || !(sd as any).parts) return 1;
    if (!isLoggedIn) {
      return testData?.kyNang.listening.parts[0]?.cauHois?.length || 8;
    }
    if (skill === "writing" || skill === "speaking") {
      return (sd as any).parts.length;
    }
    return (sd as any).parts.reduce((s: number, p: any) => s + (p.cauHois?.length || 0), 0);
  };

  const moveToNextSkill = () => {
    const idx = skillList.indexOf(skill);
    if (idx < skillList.length - 1) {
      const next = skillList[idx + 1];
      setDoneSkills(p => ({ ...p, [skill]: true }));
      setSkill(next);
      setPartIdx(0);
      setTimeLeft(testData!.kyNang[next].thoiGian);
      if (next === "speaking") {
        setSpeakingPhase("initial_prep");
        setSpeakingCountdown(60);
        setSpeakingPartIdx(0);
      }
    }
  };

  const moveNext = () => {
    setModal(null);
    const sd = getSkillData() as { parts: unknown[] } | null;
    if (sd?.parts && partIdx < sd.parts.length - 1) {
      setDoneParts(p => ({ ...p, [`${skill}_${partIdx}`]: true }));
      setPartIdx(p => p + 1);
      return;
    }
    const idx = skillList.indexOf(skill);
    if (idx < skillList.length - 1) {
      setModal({
        type: "switch_skill",
        onConfirm: () => { setModal(null); moveToNextSkill(); }
      });
    }
  };

  const handleContinue = () => {
    if (!isLoggedIn) {
      setModal({
        type: "register_required",
        onConfirm: () => {
          setModal(null);
          setSearchParams({ auth: "register" }, { replace: true });
        }
      });
      return;
    }
    const sd = getSkillData() as { parts: { cauHois?: CauHoi[] }[] } | null;
    if (!sd?.parts) return;
    const partCauHois = sd.parts[partIdx]?.cauHois || [];
    const partAnswered = partCauHois.filter(q => (answers[skill] || {})[q.id]).length;
    if ((skill === "listening" || skill === "reading") && partAnswered < partCauHois.length) {
      setModal({ type: "incomplete", onConfirm: () => { setModal(null); moveNext(); } });
      return;
    }
    moveNext();
  };

  // Auto-grading of Listening & Reading
  const calculateScores = () => {
    if (!testData) return;

    // Listening
    let correctListening = 0;
    let totalListening = 0;
    testData.kyNang.listening.parts.forEach(part => {
      part.cauHois.forEach(q => {
        totalListening++;
        const userAns = answers.listening?.[q.id];
        if (userAns && userAns.toUpperCase() === q.dapAn.toUpperCase()) {
          correctListening++;
        }
      });
    });
    const listeningScore = totalListening > 0 ? parseFloat(((correctListening / totalListening) * 10).toFixed(2)) : 0;

    // Reading
    let correctReading = 0;
    let totalReading = 0;
    testData.kyNang.reading.parts.forEach(part => {
      part.cauHois.forEach(q => {
        totalReading++;
        const userAns = answers.reading?.[q.id];
        if (userAns && userAns.toUpperCase() === q.dapAn.toUpperCase()) {
          correctReading++;
        }
      });
    });
    const readingScore = totalReading > 0 ? parseFloat(((correctReading / totalReading) * 10).toFixed(2)) : 0;

    // Average VSTEP score rounded to nearest 0.5
    const avg = (listeningScore + readingScore) / 2;
    const finalScore = parseFloat((Math.round(avg * 2) / 2).toFixed(2));

    let level = "Không xét";
    if (finalScore >= 4.0 && finalScore < 6.0) level = "B1";
    else if (finalScore >= 6.0 && finalScore < 8.5) level = "B2";
    else if (finalScore >= 8.5) level = "C1";

    setScores({
      listening: listeningScore,
      reading: readingScore,
      final: finalScore,
      level
    });
  };

  const handleSubmit = () => {
    setModal({
      type: "submit",
      onConfirm: () => {
        setModal(null);
        calculateScores();
        setIsSubmitted(true);
      }
    });
  };

  const handleReset = () => {
    setAnswers({});
    setWritingAnswers({});
    setDoneParts({});
    setDoneSkills({});
    setViolationCount(0);
    setIsSubmitted(false);
    setScores(null);
    setSkill("listening");
    setPartIdx(0);
    setTimeLeft(testData ? testData.kyNang.listening.thoiGian : 0);
  };

  const onAnswer = (qId: number, val: string) => {
    setAnswers(p => ({ ...p, [skill]: { ...(p[skill] || {}), [qId]: val } }));
  };

  if (loading || !testData) return (
    <div className="exam-loading">
      <div className="exam-loading-spinner" />
      <span>Đang tải đề thi...</span>
    </div>
  );

  const skillParts: Record<Skill, number> = {
    listening: testData.kyNang.listening.parts.length,
    reading: testData.kyNang.reading.parts.length,
    writing: testData.kyNang.writing.parts.length,
    speaking: 1 // ONLY 1 PART in bottom nav, which encapsulates all 3 questions inside
  };

  const currentPart = getCurrentPart();
  const answered = countAnswered();
  const total = countTotal();
  const initials = getInitials(hoTen);

  // ---- RENDER SUBMITTED RESULTS SCREEN ----
  if (isSubmitted && scores) {
    return (
      <div className="exam-wrapper exam-results-wrapper">
        {toast && <div className="exam-toast">{toast}</div>}
        <header className="exam-header">
          <div className="exam-header-left">
            {isLoggedIn && (
              <>
                <div className="exam-student-avatar-badge">{initials}</div>
                <span className="exam-student-name">{hoTen}</span>
              </>
            )}
          </div>
          <div className="exam-header-right">
            <button className="exam-submit-btn" onClick={() => navigate(sessionStorage.getItem("user") ? "/test-thu-sv" : "/test-thu")}>Quay lại danh sách</button>
          </div>
        </header>

        <main className="exam-content results-content">
          <div className="results-title-section">
            <span className="sub-title-small">BẠN ĐANG TRUY CẬP</span>
            <h1 className="results-main-title">Kết quả thi</h1>
          </div>

          <div className="results-container">
            <div className="results-left-column">
              <div className="results-card">
                <div className="results-row">
                  <span className="results-label">Mã lượt thi</span>
                  <span className="results-value bold-text">{luotThiCodeRef.current}</span>
                </div>
                <div className="results-row">
                  <span className="results-label">Điểm nghe</span>
                  <span className="results-value highlight-score">{scores.listening}</span>
                </div>
                <div className="results-row">
                  <span className="results-label">Điểm đọc</span>
                  <span className="results-value highlight-score">{scores.reading}</span>
                </div>
                <div className="results-row action-row-res">
                  <span className="results-label">Điểm viết</span>
                  <div className="results-actions-mid">
                    <button className="btn-res-action blue-outline" onClick={() => showToast("Đã gửi yêu cầu chấm bài viết!")}>Gửi yêu cầu chấm</button>
                    <button className="btn-res-action grey-outline" onClick={() => { setReviewMode(true); setIsSubmitted(false); setSkill("writing"); setPartIdx(0); }}>Xem lại</button>
                  </div>
                  <span className="results-status-right">Chưa chấm</span>
                </div>
                <div className="results-row action-row-res">
                  <span className="results-label">Điểm nói</span>
                  <div className="results-actions-mid">
                    <button className="btn-res-action blue-outline" onClick={() => showToast("Đã gửi yêu cầu chấm bài nói!")}>Gửi yêu cầu chấm</button>
                    <button className="btn-res-action grey-outline" onClick={() => { setReviewMode(true); setIsSubmitted(false); setSkill("speaking"); setPartIdx(0); }}>Xem lại</button>
                  </div>
                  <span className="results-status-right">Chưa chấm</span>
                </div>
                <div className="results-row">
                  <span className="results-label">Điểm bài thi</span>
                  <span className="results-value highlight-score">{scores.final}</span>
                </div>
                <div className="results-row">
                  <span className="results-label">Bậc đạt được</span>
                  <span className={`results-value level-text ${scores.level === "Không xét" ? "no-level" : ""}`}>{scores.level}</span>
                </div>

                <div className="results-card-footer">
                  <button className="btn-res-footer-action blue-fill" onClick={() => { setReviewMode(true); setIsSubmitted(false); }}>Xem lại bài thi</button>
                  <button className="btn-res-footer-action outline-fill" onClick={handleReset}>Thi lại</button>
                </div>
              </div>
            </div>

            <div className="results-right-column">
              <div className="account-info-card">
                <h3 className="card-title-header">THÔNG TIN TÀI KHOẢN</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Tài khoản</span>
                    <span className="info-value">student</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Họ tên</span>
                    <span className="info-value">{hoTen}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Lượt chấm hiện có</span>
                    <span className="info-value">0</span>
                  </div>
                </div>
              </div>

              <div className="important-notice-card">
                <h4 className="notice-title">Lưu ý quan trọng</h4>
                <p className="notice-content">
                  Làm nhiều đề chưa chắc hiệu quả nếu không xem lại lỗi sai sau mỗi lần làm.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---- RENDER STANDARD EXAM / REVIEW SCREEN ----
  return (
    <div className="exam-wrapper">
      {toast && <div className="exam-toast">{toast}</div>}

      {violationCount === 1 && (skill === "listening" || skill === "reading") && !reviewMode && (
        <div className="violation-banner">CẢNH BÁO: Vi phạm quy định! Vi phạm tiếp theo sẽ HỦY bài thi.</div>
      )}

      {reviewMode && (
        <div className="review-mode-banner">
          <span>Chế độ xem lại bài thi — Điểm thi: <strong>{scores?.final}</strong> (Bậc: <strong>{scores?.level}</strong>)</span>
          <button className="btn-exit-review" onClick={() => { setReviewMode(false); setIsSubmitted(true); }}>Quay lại kết quả</button>
        </div>
      )}

      <header className={`exam-header ${reviewMode ? "review-header" : ""}`}>
        <div className="exam-header-left">
          {isLoggedIn && (
            <>
              <div className="exam-student-avatar-badge">{initials}</div>
              <span className="exam-student-name">{hoTen}</span>
            </>
          )}
        </div>
        
        {reviewMode ? (
          <div className="exam-timer review-mode-pill">XEM LẠI</div>
        ) : (
          <div className={`exam-timer ${timeLeft < 300 ? "danger" : ""}`}>{fmt(timeLeft)}</div>
        )}

        <div className="exam-header-right">
          {!reviewMode && (
            <>
              <span className="exam-answered-count">Đã trả lời: {answered}/{total}</span>
              {isLoggedIn && <button className="exam-submit-btn" onClick={handleSubmit}>Nộp bài</button>}
            </>
          )}
        </div>
      </header>

      <main className={`exam-content ${reviewMode ? "review-content-pad" : ""}`}>
        {skill === "listening" && currentPart && (
          <ListeningSection
            part={currentPart as unknown as ListeningPart}
            answers={answers.listening || {}}
            onAnswer={onAnswer}
            reviewMode={reviewMode}
          />
        )}
        {skill === "reading" && currentPart && (
          <ReadingSection
            part={currentPart as unknown as ReadingPart}
            answers={answers.reading || {}}
            onAnswer={onAnswer}
            reviewMode={reviewMode}
          />
        )}
        {skill === "writing" && currentPart && (
          <WritingSection
            part={currentPart as unknown as WritingPart}
            value={writingAnswers[(currentPart as unknown as WritingPart).soPhan] || ""}
            onChange={v => setWritingAnswers(p => ({ ...p, [(currentPart as unknown as WritingPart).soPhan]: v }))}
            reviewMode={reviewMode}
          />
        )}
        {skill === "speaking" && (
          <SpeakingSection
            parts={testData.kyNang.speaking.parts}
            reviewMode={reviewMode}
            speakingPartIdx={speakingPartIdx}
            speakingPhase={speakingPhase}
            speakingCountdown={speakingCountdown}
            onAudioEnded={handleSpeakingAudioEnded}
          />
        )}
      </main>

      <nav className="exam-bottom-bar">
        <div className={`bottom-bar-flex-container ${(reviewMode || skill === "speaking") ? "center-justify" : ""}`}>
          <div className="bottom-skills-navigation">
            {skillList.map(sk => (
              <div key={sk} className="bottom-skill-group">
                <div className="bottom-parts-row">
                  {Array.from({ length: skillParts[sk] }).map((_, i) => {
                    const isDone = doneParts[`${sk}_${i}`] || doneSkills[sk];
                    const isActive = sk === skill && i === partIdx;
                    
                    const isDisabled = reviewMode ? false : (!!doneSkills[sk] || sk !== skill || (!isLoggedIn && (sk !== "listening" || i !== 0)));
                    return (
                      <button
                        key={i}
                        className={`bottom-part-btn ${isActive ? "active" : ""} ${!reviewMode && isDone ? "done" : ""}`}
                        disabled={isDisabled}
                        onClick={() => {
                          if (reviewMode) {
                            setSkill(sk);
                            setPartIdx(i);
                          } else if (sk === skill && !isDone) {
                            setPartIdx(i);
                          }
                        }}
                      >
                        Part {i + 1}
                      </button>
                    );
                  })}
                </div>
                <div className={`bottom-skill-capsule-pill ${sk === skill ? "active" : ""}`}>
                  {skillLabels[sk]}
                </div>
              </div>
            ))}
          </div>

          {!reviewMode && skill !== "speaking" && (
            <div className="bottom-actions-container">
              <button className="btn-continue" onClick={handleContinue}>Tiếp tục</button>
              {isLoggedIn && <button className="btn-save" onClick={doSave}>Lưu bài</button>}
            </div>
          )}
        </div>
      </nav>

      {modal?.type === "incomplete" && (
        <Modal
          title="Chưa hoàn thành"
          body={`Bạn mới trả lời được ${answered}/${total} câu hỏi trong phần này. Bạn vẫn muốn chuyển sang phần tiếp theo không?`}
          onConfirm={modal.onConfirm} onCancel={() => setModal(null)} confirmLabel="Tiếp tục"
        />
      )}
      {modal?.type === "switch_skill" && (
        <Modal
          title="Chuyển kỹ năng"
          body="Bạn có chắc chắn muốn chuyển sang kỹ năng tiếp theo không?"
          warn="*Sau khi chuyển kỹ năng, bạn không thể quay lại kỹ năng trước đó."
          onConfirm={modal.onConfirm} onCancel={() => setModal(null)} confirmLabel="Tiếp tục"
        />
      )}
      {modal?.type === "submit" && (
        <Modal
          title="Nộp bài thi"
          body="Bạn đã hoàn thành bài thi và muốn nộp bài. Hãy chắc chắn rằng bạn thực sự đã hoàn tất bài thi."
          onConfirm={modal.onConfirm} onCancel={() => setModal(null)} confirmLabel="Đồng ý"
        />
      )}
      {modal?.type === "register_required" && (
        <Modal
          title="Đăng ký tài khoản"
          body="Bạn đã hoàn thành phần thi thử trải nghiệm (Part 1 của Listening). Vui lòng đăng ký hoặc đăng nhập tài khoản thành viên để được làm đầy đủ bài thi 4 kỹ năng."
          onConfirm={modal.onConfirm} onCancel={() => setModal(null)} confirmLabel="Đăng ký ngay"
        />
      )}
    </div>
  );
}
