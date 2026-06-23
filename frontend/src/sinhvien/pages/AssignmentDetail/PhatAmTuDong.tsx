import React, { useRef } from "react";
import { FiAward, FiVolume2, FiMic } from "react-icons/fi";

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
}) => {
  const speechScore = speechScores[qIdx];
  const spokenText = spokenTexts[qIdx] || "";
  const isList = isListeningSTT[qIdx];
  const recognitionRef = useRef<any>(null);

  const calcSpeechScore = (spoken: string, expected: string): number => {
    if (!expected) return 0;
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
    const spokenWords = normalize(spoken).split(/\s+/).filter(Boolean);
    const expectedWords = normalize(expected).split(/\s+/).filter(Boolean);
    if (expectedWords.length === 0) return 0;
    const correct = spokenWords.filter((w) => expectedWords.includes(w)).length;
    return Math.min(Math.round((correct / expectedWords.length) * 10 * 10) / 10, 10);
  };

  const startSpeechRecognition = (idx: number | string, expectedText: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListeningSTT((prev) => ({ ...prev, [idx]: true }));
    recognition.onend = () => setIsListeningSTT((prev) => ({ ...prev, [idx]: false }));
    recognition.onerror = () => setIsListeningSTT((prev) => ({ ...prev, [idx]: false }));
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
  };

  return (
    <div>
      <span className="ad-speaking-level-badge">
        <FiAward style={{ marginRight: 4, verticalAlign: "middle" }} /> Level: {q.level}
      </span>
      <div className="ad-speaking-prompt-box">
        <p
          className="ad-speaking-prompt-label"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <FiVolume2 /> Read the following sentence:
        </p>
        <p className="ad-speaking-prompt-text">{q.text}</p>
      </div>

      {!submitted ? (
        <div className="ad-recorder-dashed-box">
          {isList ? (
            <div>
              <span className="ad-recording-status">🔴 Listening...</span>
              <button
                onClick={() => stopSpeechRecognition(qIdx)}
                className="ad-record-stop-btn"
              >
                Stop
              </button>
            </div>
          ) : (
            <button
              disabled={isOverdue}
              onClick={() => startSpeechRecognition(qIdx, q.text)}
              className="ad-record-start-btn"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <FiMic /> Click to speak
            </button>
          )}
          {spokenText && (
            <div className="ad-stt-text-output">
              <p>Heard: "{spokenText}"</p>
              <p
                className="ad-stt-score-display"
                style={{ color: (speechScore || 0) >= 7 ? "#22c55e" : "#f97316" }}
              >
                Score: {speechScore}/10
              </p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "#fafafa", borderRadius: 8, padding: 12 }}>
          <p style={{ margin: 0 }}>
            <strong>Your reading:</strong> "{spokenText || "—"}"
          </p>
          <p style={{ margin: "5px 0 0", color: "green" }}>
            <strong>Auto-grading score:</strong> {speechScore}/10
          </p>
        </div>
      )}
    </div>
  );
};
