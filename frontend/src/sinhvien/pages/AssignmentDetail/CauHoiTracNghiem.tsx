import React from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

interface CauHoiTracNghiemProps {
  q: any;
  qIdx: number;
  subIdxPrefix?: string;
  mcAnswers: Record<string | number, string>;
  setMcAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  submitted: boolean;
  isOverdue: boolean;
  isExam: boolean;
  examStarted: boolean;
}

export const CauHoiTracNghiem: React.FC<CauHoiTracNghiemProps> = ({
  q,
  qIdx,
  subIdxPrefix,
  mcAnswers,
  setMcAnswers,
  submitted,
  isOverdue,
  isExam,
  examStarted,
}) => {
  const key = subIdxPrefix !== undefined ? `${subIdxPrefix}_${qIdx}` : qIdx;
  const chosen = mcAnswers[key] || "";
  const optionsList =
    q.options ||
    (q.answers?.map((t: string, i: number) => ({
      label: ["A", "B", "C", "D"][i],
      text: t,
    })) || []);
  const isCorrect = submitted && chosen === q.correct;
  const isWrong = submitted && chosen && chosen !== q.correct;

  return (
    <div
      key={qIdx}
      className={`ad-mcq-question-box ${
        submitted ? (isCorrect ? "correct-box" : isWrong ? "wrong-box" : "") : ""
      }`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ margin: 0, fontWeight: 700, color: "#1e3a8a", fontSize: 16 }}>
          Question {qIdx + 1}: {q.question}
        </p>
        {submitted && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isCorrect ? "#16a34a" : "#dc2626",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {isCorrect ? (
              <>
                <FiCheckCircle /> Correct
              </>
            ) : (
              <>
                <FiXCircle /> Incorrect
              </>
            )}
          </span>
        )}
      </div>
      <div className="ad-mcq-list">
        {optionsList.map((opt: any) => {
          const isChosen = chosen === opt.label;
          const isCorrectOpt = submitted && opt.label === q.correct;
          const isWrongOpt = submitted && isChosen && opt.label !== q.correct;

          return (
            <label
              key={opt.label}
              className={`ad-mcq-option ${
                isCorrectOpt ? "correct" : isWrongOpt ? "wrong" : isChosen ? "chosen" : ""
              }`}
            >
              <input
                type="radio"
                disabled={submitted || isOverdue || (isExam && !examStarted)}
                checked={isChosen}
                onChange={() => {
                  setMcAnswers((prev) => ({ ...prev, [key]: opt.label }));
                }}
              />
              <span className="ad-mcq-label-text">{opt.label}.</span>
              {opt.text && opt.text.trim().toUpperCase() !== opt.label && (
                <span>{opt.text}</span>
              )}
            </label>
          );
        })}
      </div>
      {submitted && (
        <div className="ad-explanation">
          <p className="correct-ans">Correct answer: {q.correct}</p>
          {q.explanation && <p className="exp-text">Explanation: {q.explanation}</p>}
        </div>
      )}
    </div>
  );
};
