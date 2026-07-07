import React from "react";
import { FiEdit3 } from "react-icons/fi";
import { CustomAudioPlayer } from "../../../components/CustomAudioPlayer/CustomAudioPlayer";
import "./NgheChepChinhTa.css";

interface NgheChepChinhTaProps {
  q: any;
  qIdx: string | number;
  exercise: any;
  essayAnswers: Record<string | number, string>;
  setEssayAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  submitted: boolean;
  isOverdue: boolean;
  isExam: boolean;
  examStarted: boolean;
  API: string;
  isReview?: boolean; // Che do xem lai
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
  isReview = false,
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
      {!isReview && (
        <div className="ad-dictation-prompt">
          <FiEdit3 className="ad-dictation-icon" style={{ verticalAlign: "middle" }} />
          <span>Listen and write exactly what you hear:</span>
        </div>
      )}

      {isReview ? (
        <div className="ad-dictation-result-wrapper review-mode">
          <div className="ad-dictation-score-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div className="ad-dictation-score-badge" style={{ backgroundColor: "#eff6ff", color: "#1e3a8a", border: "1px solid #bfdbfe", padding: "6px 16px", borderRadius: "20px", fontWeight: "700" }}>
              Tỷ lệ chính xác: {(() => {
                const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
                const std = clean(studentAns);
                const cor = clean(q.text || "");
                if (!cor) return 0;
                const stdWords = std.split(" ").filter(Boolean);
                const corWords = cor.split(" ").filter(Boolean);
                let correctCount = 0;
                corWords.forEach((word, idx) => {
                  if (stdWords[idx] === word) correctCount++;
                });
                return Math.round((correctCount / corWords.length) * 100);
              })()}%
            </div>
          </div>
          <div className="ad-dictation-comparison-grid" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="ad-dictation-comparison-box student" style={{ background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <span className="ad-dictation-box-title" style={{ display: "block", color: "#64748b", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                Nội dung bạn nghe và nhập vào:
              </span>
              <div className="ad-dictation-box-text" style={{ fontSize: "16px", lineHeight: "1.6" }}>
                {(() => {
                  const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
                  const stdWords = studentAns.split(/\s+/).filter(Boolean);
                  const corWords = (q.text || "").split(/\s+/).filter(Boolean);

                  if (stdWords.length === 0) {
                    return <span style={{ color: "#94a3b8", fontStyle: "italic" }}>(Không có phản hồi)</span>;
                  }

                  return stdWords.map((stdWord, idx) => {
                    const cleanedStd = cleanWord(stdWord);
                    const isWordCorrect = cleanedStd === cleanWord(corWords[idx] || "");
                    return (
                      <span 
                        key={idx} 
                        style={{ 
                          color: isWordCorrect ? "#16a34a" : "#ef4444", 
                          fontWeight: isWordCorrect ? "600" : "500",
                          marginRight: "6px",
                          display: "inline-block"
                        }}
                      >
                        {stdWord}
                      </span>
                    );
                  });
                })()}
              </div>
            </div>
            
            <div className="ad-dictation-comparison-box correct" style={{ background: "#f0fdf4", padding: "16px", borderRadius: "8px", border: "1.5px solid #bbf7d0" }}>
              <span className="ad-dictation-box-title" style={{ display: "block", color: "#16a34a", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                Nội dung chính xác:
              </span>
              <p className="ad-dictation-box-text" style={{ margin: 0, fontSize: "16px", color: "#16a34a", fontWeight: "600" }}>
                {q.text}
              </p>
            </div>
          </div>
          {q.explanation && (
            <div className="ad-dictation-explanation" style={{ marginTop: "16px", padding: "12px", background: "#f1f5f9", borderRadius: "6px", color: "#475569", fontSize: "14px" }}>
              <strong>Giải thích:</strong> {q.explanation}
            </div>
          )}
        </div>
      ) : submitted ? (
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
