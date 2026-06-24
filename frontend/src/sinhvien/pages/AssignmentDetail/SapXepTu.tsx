import React from "react";
import { FiFileText } from "react-icons/fi";

interface SapXepTuProps {
  q: any;
  qIdx: string | number;
  shuffledWords: Record<string | number, string[]>;
  setShuffledWords: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  orderedWords: Record<string | number, string[]>;
  setOrderedWords: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  submitted: boolean;
}

export const SapXepTu: React.FC<SapXepTuProps> = ({
  q,
  qIdx,
  shuffledWords,
  setShuffledWords,
  orderedWords,
  setOrderedWords,
  submitted,
}) => {
  const sWords = shuffledWords[qIdx] || [];
  const oWords = orderedWords[qIdx] || [];

  return (
    <div>
      <div className="ad-speaking-prompt-box" style={{ backgroundColor: "#fff8f5" }}>
        <p
          className="ad-speaking-prompt-label"
          style={{ color: "#F95800", display: "flex", alignItems: "center", gap: 6 }}
        >
          <FiFileText /> Translation hint:
        </p>
        <p className="ad-speaking-prompt-text" style={{ color: "#334155", fontSize: 15 }}>
          {q.text}
        </p>
      </div>

      <div className="ad-word-ordered-box">
        {oWords.map((w, i) => (
          <span
            key={i}
            onClick={() => {
              if (submitted) return;
              setOrderedWords((prev) => ({
                ...prev,
                [qIdx]: oWords.filter((_, idx) => idx !== i),
              }));
              setShuffledWords((prev) => ({ ...prev, [qIdx]: [...sWords, w] }));
            }}
            className="ad-word-badge"
          >
            {w} ✕
          </span>
        ))}
      </div>

      {!submitted && (
        <div className="ad-word-shuffled-box">
          {sWords.map((w, i) => (
            <span
              key={i}
              onClick={() => {
                setOrderedWords((prev) => ({ ...prev, [qIdx]: [...oWords, w] }));
                setShuffledWords((prev) => ({
                  ...prev,
                  [qIdx]: sWords.filter((_, idx) => idx !== i),
                }));
              }}
              className="ad-word-badge-inactive"
            >
              {w}
            </span>
          ))}
        </div>
      )}

      {submitted && (
        <div
          className="ad-explanation"
          style={{
            background: "#f0fdf4",
            border: "1px solid #86efac",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <p className="correct-ans">Correct sentence: {q.correctSentence}</p>
        </div>
      )}
    </div>
  );
};
