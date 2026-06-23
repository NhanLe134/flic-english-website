import React from "react";
import { FiVolume2 } from "react-icons/fi";
import { CustomAudioPlayer } from "../../components/CustomAudioPlayer/CustomAudioPlayer";

interface NgheDienTuProps {
  q: any;
  qIdx: number;
  fillInAnswers: Record<string | number, string[]>;
  setFillInAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  submitted: boolean;
  isOverdue: boolean;
  API: string;
}

export const NgheDienTu: React.FC<NgheDienTuProps> = ({
  q,
  qIdx,
  fillInAnswers,
  setFillInAnswers,
  submitted,
  isOverdue,
  API,
}) => {
  const parts = (q.text || "").split(/(\[\d+\])/g);
  const correctAnswers = q.fillInAnswers || [];

  return (
    <div>
      {q.audioUrl && (
        <div style={{ marginBottom: 12 }}>
          <CustomAudioPlayer src={`${API}${q.audioUrl}`} />
        </div>
      )}
      <p
        style={{
          fontWeight: 600,
          color: "#5a3e2b",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <FiVolume2 /> Listen and fill in the blanks:
      </p>
      <div
        style={{
          lineHeight: 2.2,
          fontSize: 15,
          color: "#333",
          background: "#f9f5f0",
          padding: 16,
          borderRadius: 10,
          border: "1px solid #e0d8cc",
        }}
      >
        {parts.map((part: string, idx: number) => {
          const match = part.match(/^\[(\d+)\]$/);
          if (match) {
            const blankIdx = parseInt(match[1]) - 1;
            const stdAns = (fillInAnswers[qIdx] || [])[blankIdx] || "";
            const correctAns = correctAnswers[blankIdx] || "";
            const isCorrect =
              submitted && stdAns.trim().toLowerCase() === correctAns.trim().toLowerCase();

            return (
              <span key={idx} style={{ display: "inline-block", margin: "0 4px" }}>
                <input
                  type="text"
                  disabled={submitted || isOverdue}
                  value={stdAns}
                  onChange={(e) => {
                    const copyAnswers = [...(fillInAnswers[qIdx] || [])];
                    copyAnswers[blankIdx] = e.target.value;
                    setFillInAnswers((prev) => ({ ...prev, [qIdx]: copyAnswers }));
                  }}
                  style={{
                    padding: "2px 6px",
                    borderRadius: 4,
                    textAlign: "center",
                    width: 100,
                    border: `1.5px solid ${
                      submitted ? (isCorrect ? "#22c55e" : "#ef4444") : "#e87722"
                    }`,
                    background: submitted ? (isCorrect ? "#f0fdf4" : "#fef2f2") : "#fff",
                  }}
                />
                {submitted && !isCorrect && (
                  <span style={{ fontSize: 11, color: "#16a34a", display: "block" }}>
                    ({correctAns})
                  </span>
                )}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    </div>
  );
};
