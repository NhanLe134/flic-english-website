import React from "react";
import { FiEdit3 } from "react-icons/fi";
import { CustomAudioPlayer } from "../../components/CustomAudioPlayer/CustomAudioPlayer";

interface NgheChepChinhTaProps {
  q: any;
  qIdx: number;
  exercise: any;
  essayAnswers: Record<string | number, string>;
  setEssayAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  submitted: boolean;
  isOverdue: boolean;
  isExam: boolean;
  examStarted: boolean;
  API: string;
}

export const NgheChepChinhTa: React.FC<NgheChepChinhTaProps> = ({
  q,
  qIdx,
  exercise,
  essayAnswers,
  setEssayAnswers,
  submitted,
  isOverdue,
  isExam,
  examStarted,
  API,
}) => {
  const aud = q.audioUrl || exercise?.AudioUrl || "";
  const studentAns = essayAnswers[qIdx] || "";

  const calcDictationScore = (studentText: string, correctText: string): number => {
    const clean = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    const std = clean(studentText);
    const cor = clean(correctText);
    if (!cor) return 0;
    if (std === cor) return 10;
    const stdWords = std.split(" ").filter(Boolean);
    const corWords = cor.split(" ").filter(Boolean);
    if (corWords.length === 0) return 0;
    let correct = 0;
    corWords.forEach((word, idx) => {
      if (stdWords[idx] === word) correct++;
    });
    return Math.round((correct / corWords.length) * 10 * 10) / 10;
  };

  const score = submitted ? calcDictationScore(studentAns, q.text || "") : 0;
  const isPerfect = score === 10;

  return (
    <div className="ad-dictation-container">
      {aud && (
        <div className="ad-dictation-audio-wrapper">
          <CustomAudioPlayer src={`${API}${aud}`} className="ad-dictation-audio" />
        </div>
      )}
      <div className="ad-dictation-prompt">
        <FiEdit3 className="ad-dictation-icon" style={{ verticalAlign: "middle" }} />
        <span>Listen and write exactly what you hear:</span>
      </div>

      {submitted ? (
        <div className="ad-dictation-result-wrapper">
          <div className="ad-dictation-score-row">
            <div className={`ad-dictation-score-badge ${isPerfect ? "perfect" : "partial"}`}>
              {isPerfect ? "✓ Perfect Match" : `Score: ${score}/10`}
            </div>
          </div>
          <div className="ad-dictation-comparison-grid">
            <div className="ad-dictation-comparison-box student">
              <span className="ad-dictation-box-title">Your response:</span>
              <p className="ad-dictation-box-text">"{studentAns || "(Empty)"}"</p>
            </div>
            <div className="ad-dictation-comparison-box correct">
              <span className="ad-dictation-box-title">Correct answer:</span>
              <p className="ad-dictation-box-text">"{q.text}"</p>
            </div>
          </div>
          {q.explanation && (
            <div className="ad-dictation-explanation">
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>
      ) : (
        <div className="ad-dictation-input-wrapper">
          <textarea
            className="ad-dictation-textarea"
            disabled={isOverdue || (isExam && !examStarted)}
            value={studentAns}
            onChange={(e) =>
              setEssayAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))
            }
            placeholder="Type what you hear..."
            rows={3}
          />
        </div>
      )}
    </div>
  );
};
