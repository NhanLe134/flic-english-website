import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import "./TestExamPage.css";

const BASE = import.meta.env.BASE_URL;

interface CauHoi { id: number; noiDung: string; luaChon: string[]; dapAn: string; }
interface ListeningPart { soPhan: number; tieuDe: string; huongDan: string; audioUrl: string; cauHois: CauHoi[]; }
interface ReadingPart { soPhan: number; tieuDe: string; huongDan: string; doanVan: string; cauHois: CauHoi[]; }
interface WritingPart { soPhan: number; tieuDe: string; huongDan: string; noiDung: string; yeuCau: string; soTuToiThieu: number; }
interface SpeakingPart { soPhan: number; tieuDe: string; moTa: string; audioUrl: string; noiDung: string; thoiGianNoi: number; }
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
      <div className="part-direction-box">
        {part.huongDan}
      </div>
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
        <div className="passage-header">Directions: {part.huongDan}</div>
        <div className="passage-content">{part.doanVan}</div>
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
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const ok = wordCount >= part.soTuToiThieu;
  return (
    <div className="writing-section">
      <div className="writing-prompt-box">
        <div className="writing-prompt-header">{part.huongDan}</div>
        <div className="writing-letter-quote">{part.noiDung}</div>
        <div className="writing-instruction">{part.yeuCau}</div>
      </div>
      <div className="writing-answer-box">
        <div className="writing-answer-header">
          <span className="writing-answer-label">Your answer:</span>
          <span className="word-count-display">Word count: <strong className={ok ? "ok" : ""}>{wordCount}</strong></span>
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
              <div className="speaking-q-content">{part.noiDung}</div>
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
              <span className="audio-time-current">--:--</span>
              <div className="audio-progress-bar"><div className="audio-progress-fill" style={{ width: "0%" }} /></div>
              <span className="audio-time-duration">--:--</span>
            </div>
            <p className="speaking-audio-warning">
              *Hệ thống tự động phát phát câu hỏi. Nếu không tự chạy, vui lòng bấm nút Play để nghe.
            </p>
          </div>

          <div className="speaking-q-content">{part.noiDung}</div>
        </div>
      </div>

      <div className="speaking-right-pane">
        <div className="speaking-status-box">
          {speakingPhase === "audio_playing" && (
            <div className="speaking-status-inner">
              <div className="speaking-status-label">Đang phát câu hỏi...</div>
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
              <div className="speaking-status-label green-text">ĐÃ LƯU BÀI NÓI SỐ {speakingPartIdx + 1} VÀO HỆ THỐNG</div>
              <div className="speaking-saved-sub">Câu hỏi tiếp theo sẽ bắt đầu sau...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- MAIN EXAM PAGE ----
export default function TestExamPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

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
    listening: "Listening - 47",
    reading: "Reading - 60",
    writing: "Writing - 60",
    speaking: "Speaking - 12"
  };

  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem("user") || "{}");
      setHoTen(u.HoTen || "Sinh Viên");
    } catch { /* empty */ }
    
    fetch(`http://localhost:5000/tests/${testId}`)
      .then(r => r.json())
      .then((d: TestData) => {
        setTestData(d);
        setTimeLeft(d.kyNang.listening.thoiGian);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [testId]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  const doSave = useCallback(() => {
    fetch(`http://localhost:5000/tests/${testId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill, partIdx, answers, writingAnswers })
    }).catch(() => {});
    showToast("Bài làm đã được lưu vào hệ thống.");
    setDoneParts(p => ({ ...p, [`${skill}_${partIdx}`]: true }));
  }, [testId, skill, partIdx, answers, writingAnswers, showToast]);

  // Speaking Audio Ended Callback
  const handleSpeakingAudioEnded = useCallback(() => {
    setSpeakingPhase("pre_record");
    setSpeakingCountdown(60); // 60s prep before recording
  }, []);

  // Timer Effect supporting refined Speaking logic
  useEffect(() => {
    if (!testData || loading || isSubmitted || reviewMode) return;

    if (skill !== "speaking") {
      // Standard skills ticking down
      if (timeLeft <= 0) {
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
      const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(t);
    } else {
      // Speaking ticking (Timer ONLY ticks down when recording)
      if (timeLeft <= 0 || speakingPhase === "all_done") {
        setSpeakingPhase("all_done");
        return;
      }

      const t = setInterval(() => {
        if (speakingPhase === "initial_prep" || speakingPhase === "pre_record") {
          setSpeakingCountdown(c => {
            if (c <= 1) {
              if (speakingPhase === "initial_prep") {
                setSpeakingPhase("audio_playing");
              } else {
                setSpeakingPhase("recording");
                // Q1: 3 min (180s), Q2: 4 min (240s), Q3: 5 min (300s)
                const recordTimes = [180, 240, 300];
                return recordTimes[speakingPartIdx] || 180;
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
          setTimeLeft(tl => tl - 1);
        } else if (speakingPhase === "saved") {
          setSpeakingCountdown(c => {
            if (c <= 1) {
              const nextIdx = speakingPartIdx + 1;
              if (nextIdx < testData.kyNang.speaking.parts.length) {
                setSpeakingPartIdx(nextIdx);
                setSpeakingPhase("audio_playing");
              } else {
                setSpeakingPhase("all_done");
              }
              return 0;
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
        fetch(`http://localhost:5000/tests/${testId}/submit`, { method: "POST" }).catch(() => {});
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
            <div className="exam-student-avatar-badge">{initials}</div>
            <span className="exam-student-name">{hoTen}</span>
          </div>
          <div className="exam-header-right">
            <button className="exam-submit-btn" onClick={() => navigate("/test-thu-sv")}>Quay lại danh sách</button>
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
          <div className="exam-student-avatar-badge">{initials}</div>
          <span className="exam-student-name">{hoTen}</span>
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
              <button className="exam-submit-btn" onClick={handleSubmit}>Nộp bài</button>
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
        <div className="bottom-bar-flex-container">
          <div className="bottom-skills-navigation">
            {skillList.map(sk => (
              <div key={sk} className="bottom-skill-group">
                <div className="bottom-parts-row">
                  {Array.from({ length: skillParts[sk] }).map((_, i) => {
                    const isDone = doneParts[`${sk}_${i}`] || doneSkills[sk];
                    const isActive = sk === skill && i === partIdx;
                    
                    const isDisabled = reviewMode ? false : (!!doneSkills[sk] || sk !== skill);
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
              <button className="btn-save" onClick={doSave}>Lưu bài</button>
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
    </div>
  );
}
