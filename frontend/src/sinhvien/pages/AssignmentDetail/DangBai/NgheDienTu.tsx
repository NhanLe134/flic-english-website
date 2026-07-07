import React from "react";
import { FiVolume2 } from "react-icons/fi";
import { CustomAudioPlayer } from "../../../components/CustomAudioPlayer/CustomAudioPlayer";
import "./NgheDienTu.css";

// Dinh nghia interface props cua component
interface NgheDienTuProps {
  q: any;
  qIdx: string | number;
  fillInAnswers: Record<string | number, string[]>;
  setFillInAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  submitted: boolean;
  isOverdue: boolean;
  API: string;
  isReview?: boolean; // Che do xem lai bai tap da lam
}

export const NgheDienTu: React.FC<NgheDienTuProps> = ({
  q,
  qIdx,
  fillInAnswers,
  setFillInAnswers,
  submitted,
  isOverdue,
  API,
  isReview = false,
}) => {
  // Tach doan van thanh cac phan theo ky tu danh dau o trong [1], [2]...
  const parts = (q.text || "").split(/(\[\d+\])/g);
  const correctAnswers = q.fillInAnswers || [];

  // Tinh toan diem so o trong dien dung o che do xem lai (Review) hoac da nop (Submitted)
  const numCorrect = correctAnswers.reduce((acc: number, correctAns: string, index: number) => {
    const stdAns = (fillInAnswers[qIdx] || [])[index] || "";
    return stdAns.trim().toLowerCase() === correctAns.trim().toLowerCase() ? acc + 1 : acc;
  }, 0);
  const totalBlanks = correctAnswers.length;
  const percent = totalBlanks > 0 ? Math.round((numCorrect / totalBlanks) * 100) : 0;

  return (
    <div className="ad-cloze-test-container">
      {/* Audio player dung de nghe lai */}
      {q.audioUrl && (
        <div style={{ marginBottom: 16 }}>
          <CustomAudioPlayer src={`${API}${q.audioUrl}`} />
        </div>
      )}

      {/* Tieu de huong dan, an di khi o che do xem lai */}
      {!isReview && (
        <p
          style={{
            fontWeight: 600,
            color: "#5a3e2b",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12
          }}
        >
          <FiVolume2 /> Listen and fill in the blanks:
        </p>
      )}

      {/* Thanh hien thi ket qua ti le chinh xac trong che do xem lai */}
      {isReview && (
        <div 
          className="ad-cloze-score-bar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 16px",
            background: "#eff6ff",
            border: "1.5px solid #bfdbfe",
            borderRadius: "8px",
            marginBottom: 16,
            fontWeight: "700",
            color: "#1e3a8a",
            fontSize: "14px"
          }}
        >
          <span>Kết quả đối chiếu</span>
          <span>Tỷ lệ chính xác: {numCorrect}/{totalBlanks} ô ({percent}%)</span>
        </div>
      )}

      {/* Doan van chua cac o trong dien tu */}
      <div
        style={{
          lineHeight: 2.3,
          fontSize: 15,
          color: "#333",
          background: "#f9f5f0",
          padding: 20,
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
            const hasResponse = stdAns.trim() !== "";
            const isCorrect = stdAns.trim().toLowerCase() === correctAns.trim().toLowerCase();

            // Xac dinh mau sac cho tung o nhap dien tu
            let borderColor = "#e87722";
            let bgColor = "#ffffff";
            let fontColor = "#333";

            if (submitted || isReview) {
              if (isCorrect) {
                borderColor = "#22c55e"; // Xanh la khi dung
                bgColor = "#f0fdf4";
                fontColor = "#16a34a";
              } else if (!hasResponse) {
                borderColor = "#eab308"; // Vang khi bo trong
                bgColor = "#fefce8";
              } else {
                borderColor = "#ef4444"; // Do khi sai
                bgColor = "#fef2f2";
                fontColor = "#dc2626";
              }
            }

            return (
              <span key={idx} style={{ display: "inline-block", margin: "0 6px", verticalAlign: "middle", textAlign: "center" }}>
                <input
                  type="text"
                  disabled={submitted || isOverdue || isReview}
                  value={stdAns}
                  placeholder={`(${blankIdx + 1})`}
                  onChange={(e) => {
                    if (!isReview) {
                      const copyAnswers = [...(fillInAnswers[qIdx] || [])];
                      copyAnswers[blankIdx] = e.target.value;
                      setFillInAnswers((prev) => ({ ...prev, [qIdx]: copyAnswers }));
                    }
                  }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    textAlign: "center",
                    width: 110,
                    border: `1.5px solid ${borderColor}`,
                    background: bgColor,
                    color: fontColor,
                    fontWeight: (submitted || isReview) ? "600" : "400",
                    transition: "all 0.2s ease"
                  }}
                />
                {(submitted || isReview) && !isCorrect && (
                  <span style={{ fontSize: 12, color: "#16a34a", display: "block", fontWeight: "600", marginTop: "2px" }}>
                    ({correctAns})
                  </span>
                )}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>

      {/* Loi giai thich */}
      {(submitted || isReview) && q.explanation && (
        <div 
          className="ad-cloze-explanation"
          style={{ 
            marginTop: 16, 
            padding: 12, 
            background: "#f1f5f9", 
            borderRadius: 6, 
            color: "#475569", 
            fontSize: "14px",
            borderLeft: "4px solid #94a3b8" 
          }}
        >
          <strong>Giải thích:</strong> {q.explanation}
        </div>
      )}
    </div>
  );
};
