import React, { useRef, useState } from "react";
import { FiVolume2, FiMic, FiPlay, FiPause } from "react-icons/fi";
import "./PhatAmTuDong.css";

interface PhatAmTuDongProps {
  q: any;
  qIdx: string | number;
  speechScores: Record<string | number, number | null>;
  setSpeechScores: React.Dispatch<React.SetStateAction<Record<string | number, number | null>>>;
  spokenTexts: Record<string | number, string>;
  setSpokenTexts: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  isListeningSTT: Record<string | number, boolean>;
  setIsListeningSTT: React.Dispatch<React.SetStateAction<Record<string | number, boolean>>>;
  submitted: boolean;
  isOverdue: boolean;
  isReview?: boolean; // Che do xem lai
}

export const PhatAmTuDong: React.FC<PhatAmTuDongProps> = ({
  q,
  qIdx,
  speechScores,
  setSpeechScores,
  spokenTexts,
  setSpokenTexts,
  isListeningSTT,
  setIsListeningSTT,
  submitted,
  isOverdue,
  isReview = false,
}) => {
  const speechScore = speechScores[qIdx];
  const spokenText = spokenTexts[qIdx] || "";
  const isList = isListeningSTT[qIdx];
  const recognitionRef = useRef<any>(null);
  
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Helper: Normalize single word for string matching
  const normalizeWord = (word: string): string => {
    return word.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  };

  // Helper: Normalize full sentence, preserving spaces
  const normalizeSentence = (text: string): string => {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  };

  // Helper: Compare student's spoken text and get word-by-word correctness
  const getWordListFeedback = () => {
    const rawExpectedWords = (q.text || "").split(/\s+/).filter(Boolean);
    const spokenTokens = normalizeSentence(spokenText).split(/\s+/).filter(Boolean);

    return rawExpectedWords.map((word: string) => {
      const normalizedWord = normalizeWord(word);
      const isMatched = spokenTokens.includes(normalizedWord);
      let status: "matched" | "mismatched" | "unspoken" = "unspoken";
      if (spokenText) {
        status = isMatched ? "matched" : "mismatched";
      }
      return {
        word,
        status,
      };
    });
  };

  // Calculate matching score
  const calcSpeechScore = (spoken: string, expected: string): number => {
    if (!expected) return 0;
    const spokenWords = normalizeSentence(spoken).split(/\s+/).filter(Boolean).map(normalizeWord);
    const expectedWords = normalizeSentence(expected).split(/\s+/).filter(Boolean).map(normalizeWord);
    if (expectedWords.length === 0) return 0;
    const correct = expectedWords.filter((w) => spokenWords.includes(w)).length;
    return Math.min(Math.round((correct / expectedWords.length) * 10 * 10) / 10, 10);
  };

  // Playback recorded user voice
  const toggleAudioPlayback = () => {
    if (!audioUrl) return;
    if (!audioPlaybackRef.current) {
      audioPlaybackRef.current = new Audio(audioUrl);
      audioPlaybackRef.current.onended = () => setIsAudioPlaying(false);
    }
    if (isAudioPlaying) {
      audioPlaybackRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioPlaybackRef.current.play();
      setIsAudioPlaying(true);
    }
  };

  // Web Speech Synthesis (TTS) - Play correct pronunciation
  const playNativePronunciation = () => {
    if (!q.text) return;
    setIsPlayingTTS(true);
    window.speechSynthesis.cancel(); // Cancel any current utterances
    const utterance = new SpeechSynthesisUtterance(q.text);
    utterance.lang = "en-US";
    utterance.rate = 0.9; // Slightly slower for training
    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech Recognition (STT) - Record user's pronunciation
  const startSpeechRecognition = (idx: number | string, expectedText: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Google Chrome để thực hiện bài tập này!");
      return;
    }

    // Capture microphone audio for playback
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        micStreamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          setIsAudioPlaying(false);
          if (audioPlaybackRef.current) {
            audioPlaybackRef.current = null;
          }
          // Stop stream tracks to release device
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      })
      .catch((err) => {
        console.error("Error accessing microphone for recording audio:", err);
      });

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListeningSTT((prev) => ({ ...prev, [idx]: true }));
    recognition.onend = () => setIsListeningSTT((prev) => ({ ...prev, [idx]: false }));
    recognition.onerror = (e: any) => {
      console.error("Speech recognition error", e);
      setIsListeningSTT((prev) => ({ ...prev, [idx]: false }));
    };
    
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      const score = calcSpeechScore(text, expectedText);
      setSpokenTexts((prev) => ({ ...prev, [idx]: text }));
      setSpeechScores((prev) => ({ ...prev, [idx]: score }));
    };
    recognition.start();
  };

  const stopSpeechRecognition = (idx: number | string) => {
    recognitionRef.current?.stop();
    setIsListeningSTT((prev) => ({ ...prev, [idx]: false }));

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const wordFeedback = getWordListFeedback();

  return (
    <div className="pronounce-card">
      <div className="pronounce-interactive-box">
        <button 
          type="button" 
          className="pronounce-tts-btn" 
          onClick={playNativePronunciation} 
          title="Nghe phát âm mẫu"
          style={{ animation: isPlayingTTS ? "pulseBlink 1.5s infinite" : "none" }}
        >
          <FiVolume2 size={20} />
        </button>

        <div className="pronounce-target-label">
          Câu {(() => {
            if (typeof qIdx === "string" && qIdx.includes("_")) {
              const parts = qIdx.split("_");
              const idx = Number(parts[parts.length - 1]);
              return isNaN(idx) ? qIdx : idx + 1;
            }
            const idx = Number(qIdx);
            return isNaN(idx) ? qIdx : idx + 1;
          })()}
        </div>
        <div className="pronounce-target-text-container">
          {wordFeedback.map((item: { word: string; status: string }, index: number) => (
            <span 
              key={index} 
              className={`pronounce-word-span ${item.status}`}
              title={
                item.status === "matched" 
                  ? "Phát âm chính xác!" 
                  : item.status === "mismatched" 
                  ? "Chưa chính xác" 
                  : "Chưa nói"
              }
            >
              {item.word}
            </span>
          ))}
        </div>

        {q.explanation && (
          <div className="pronounce-feedback-panel" style={{ marginTop: 15, borderLeft: "none" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              <strong>Gợi ý phát âm:</strong> {q.explanation}
            </p>
          </div>
        )}
      </div>

      {(!submitted && !isReview) ? (
        isList ? (
          <div className="pronounce-waveform-box" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div className="pronounce-waveform-listening">
              <div className="pronounce-wave-bar"></div>
              <div className="pronounce-wave-bar"></div>
              <div className="pronounce-wave-bar"></div>
              <div className="pronounce-wave-bar"></div>
              <div className="pronounce-wave-bar"></div>
              <div className="pronounce-wave-bar"></div>
            </div>
            <span className="asd-recording-status" style={{ color: "#000080", fontSize: 13, fontWeight: 700 }}>Đang lắng nghe...</span>
            <button
              type="button"
              onClick={() => stopSpeechRecognition(qIdx)}
              className="asd-record-stop-btn"
              style={{ background: "#dc2626", marginLeft: 0, padding: "6px 16px", fontSize: 13 }}
            >
              Dừng
            </button>
          </div>
        ) : !spokenText ? (
          <div className="pronounce-waveform-box" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <button
              type="button"
              disabled={isOverdue}
              onClick={() => startSpeechRecognition(qIdx, q.text)}
              className="asd-record-start-btn"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#000080" }}
            >
              <FiMic /> Nhấn vào đây để nói
            </button>
          </div>
        ) : (
          <div className="pronounce-waveform-box" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, textAlign: "left" }}>
            <div style={{ flex: 1 }}>
              <div className="asd-stt-text-output" style={{ width: "100%", borderTop: "none", marginTop: 0, paddingTop: 0 }}>
                <p style={{ fontStyle: "italic", margin: "0 0 8px 0" }}>Nhận diện được: "{spokenText}"</p>
                <div className="pronounce-score-container">
                  <div className={`pronounce-score-circle ${(speechScore || 0) >= 7 ? "excellent" : "needs-work"}`}>
                    {speechScore}/10
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", color: (speechScore || 0) >= 7 ? "#16a34a" : "#ea580c" }}>
                      {(speechScore || 0) >= 9 ? "Xuất sắc!" : (speechScore || 0) >= 7 ? "Rất tốt" : "Cần luyện tập thêm"}
                    </h4>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                      Độ chính xác dựa trên các từ khóa bạn phát âm.
                    </p>
                  </div>
                </div>
                {audioUrl && (
                  <button
                    type="button"
                    onClick={toggleAudioPlayback}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      background: "#ffffff",
                      border: "1px solid #bfdbfe",
                      color: "#000080",
                      borderRadius: "99px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      marginTop: "12px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {isAudioPlaying ? <FiPause size={14} /> : <FiPlay size={14} />}
                    {isAudioPlaying ? "Đang phát..." : "Nghe lại bài nói của bạn"}
                  </button>
                )}
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <button
                type="button"
                disabled={isOverdue}
                onClick={() => startSpeechRecognition(qIdx, q.text)}
                className="asd-record-start-btn"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#000080" }}
              >
                <FiMic /> Nhấn vào đây để nói
              </button>
            </div>
          </div>
        )
      ) : (
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
          <p style={{ margin: "0 0 10px 0", fontSize: 14 }}>
            <strong>Nội dung bạn đã đọc:</strong> "{spokenText || "(Không có phản hồi)"}"
          </p>
          <div className="pronounce-score-container">
            <div className={`pronounce-score-circle ${(speechScore || 0) >= 7 ? "excellent" : "needs-work"}`}>
              {speechScore !== null && speechScore !== undefined ? `${speechScore}/10` : "0/10"}
            </div>
            <div>
              <h4 style={{ margin: "0 0 4px 0", color: (speechScore || 0) >= 7 ? "#16a34a" : "#ea580c" }}>
                Điểm đánh giá tự động
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                {speechScore !== null && speechScore !== undefined ? (
                  (speechScore || 0) >= 9 ? "Xuất sắc (Phát âm chính xác hầu hết các từ)" : (speechScore || 0) >= 7 ? "Rất tốt (Phát âm chính xác phần lớn các từ)" : "Cần luyện tập thêm"
                ) : (
                  "Chưa thực hiện ghi âm luyện phát âm"
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
