import React from "react";
import { FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";

// Dinh nghia props cho component TimLoiSai
interface TimLoiSaiProps {
  q: any;
  qIdx: number;
  subIdxPrefix?: string;
  mcAnswers: Record<string | number, string>;
  setMcAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  essayAnswers: Record<string | number, string>;
  setEssayAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  submitted: boolean;
  isOverdue: boolean;
  isExam: boolean;
  examStarted: boolean;
  isReview?: boolean;
}

export const TimLoiSai: React.FC<TimLoiSaiProps> = ({
  q,
  qIdx,
  subIdxPrefix,
  mcAnswers,
  setMcAnswers,
  essayAnswers,
  setEssayAnswers,
  submitted,
  isOverdue,
  isExam,
  examStarted,
  isReview = false,
}) => {
  // Khoa dinh danh cau hoi
  const key = subIdxPrefix !== undefined ? `${subIdxPrefix}_${qIdx}` : qIdx;
  const chosenSegment = mcAnswers[key] || "";
  const correctionText = essayAnswers[key] || "";

  // Tach cau van thanh cac cum tu bang 2 khoang trang lien tiep
  const segments = (q.question || "")
    .split("  ")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const disabled = submitted || isOverdue || (isExam && !examStarted) || isReview;

  // Kiem tra tinh dung/sai cua cau tra loi
  const isMistakeCorrect = chosenSegment === q.correct;
  const isCorrectionCorrect =
    (correctionText || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "") ===
    (q.correctSentence || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  const isFullCorrect = (submitted || isReview) && isMistakeCorrect && isCorrectionCorrect;
  const isPartialCorrect = (submitted || isReview) && (isMistakeCorrect || isCorrectionCorrect) && !isFullCorrect;

  return (
    <div key={qIdx}>
      {/* Hang chua So thu tu va Cau van (can giua theo chieu doc) */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center", marginTop: "10px" }}>
        {/* So thu tu ben trai */}
        <div className="mcq-question-circle-badge" style={{ flexShrink: 0 }}>
          {qIdx + 1}
        </div>
        
        {/* Cau van va trang thai dung sai neu da nop bai */}
        <div style={{ flexGrow: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
          <div style={{ flexGrow: 1 }}>
            {segments.length > 0 ? (
              <div
                className="find-mistake-sentence-preview"
                style={{
                  fontSize: "18px",
                  lineHeight: "2.2",
                  color: "#1e293b",
                  padding: "4px 0",
                }}
              >
                {segments.map((text: string, sIdx: number) => {
                  const isSelected = chosenSegment === text;
                  
                  let displayColor = "#000000";
                  let displayUnderline = "2px solid #000000";
                  let displayBg = "transparent";

                  if (submitted || isReview) {
                    if (isSelected) {
                      if (text === q.correct) {
                        displayColor = "#16a34a"; // Dung -> Xanh la
                        displayUnderline = "2.5px solid #16a34a";
                        displayBg = "#f0fdf4";
                      } else {
                        displayColor = "#ef4444"; // Sai -> Do
                        displayUnderline = "2.5px solid #ef4444";
                        displayBg = "#fef2f2";
                      }
                    } else if (text === q.correct) {
                      // Highlight xanh la khi sinh vien chon sai
                      displayColor = "#16a34a";
                      displayUnderline = "2.5px dashed #16a34a";
                    }
                  } else {
                    // Click chon -> Hien thi mau cam
                    if (isSelected) {
                      displayColor = "#f58220";
                      displayUnderline = "2.5px solid #f58220";
                      displayBg = "#fdf8f3";
                    }
                  }

                  return (
                    <span
                      key={sIdx}
                      className={`student-mistake-segment ${isSelected ? "selected" : ""}`}
                      style={{
                        position: "relative",
                        display: "inline-block",
                        cursor: disabled ? "default" : "pointer",
                        padding: "0 2px",
                        margin: "0 4px",
                        color: displayColor,
                        borderBottom: displayUnderline,
                        fontWeight: isSelected || ((submitted || isReview) && text === q.correct) ? 700 : 500,
                        backgroundColor: displayBg,
                        borderRadius: "4px",
                        transition: "all 0.15s ease",
                      }}
                      onClick={() => {
                        if (!disabled) {
                          setMcAnswers((prev) => ({ ...prev, [key]: text }));
                        }
                      }}
                    >
                      {text}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontStyle: "italic", color: "#ef4444" }}>Câu hỏi bị lỗi định dạng phân đoạn.</p>
            )}
          </div>

          {/* Huy hieu dung/sai khi da nop bai */}
          {(submitted || isReview) && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: isFullCorrect ? "#16a34a" : (isPartialCorrect ? "#f58220" : (chosenSegment === "" ? "#eab308" : "#dc2626")),
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap"
              }}
            >
              {isFullCorrect ? (
                <>
                  <FiCheckCircle /> Correct
                </>
              ) : isPartialCorrect ? (
                <>
                  <FiInfo /> Partial (5/10)
                </>
              ) : chosenSegment === "" ? (
                <>
                  <FiInfo /> No answer
                </>
              ) : (
                <>
                  <FiXCircle /> Incorrect
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Cac phan input sua loi va giai thich hien thi thut le marginLeft 47px de thang hang voi cau van */}
      {(chosenSegment || submitted || isReview) && (
        <div style={{ marginLeft: "47px", marginTop: "10px" }}>
          {/* O nhap lieu sua loi sai */}
          {(chosenSegment || submitted || isReview) && (
            <div>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#4b5563", display: "block", marginBottom: "6px" }}>
                Correction:
              </label>
              <input
                type="text"
                className="exercise-content"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
                  borderColor: (submitted || isReview) ? (isCorrectionCorrect ? "#16a34a" : "#ef4444") : "#cbd5e1"
                }}
                placeholder="Enter the correction here..."
                disabled={disabled}
                value={correctionText}
                onChange={(e) => {
                  if (!disabled) {
                    setEssayAnswers((prev) => ({ ...prev, [key]: e.target.value }));
                  }
                }}
              />
            </div>
          )}

          {/* Khung hien thi giai thich dap an */}
          {(submitted || isReview) && (
            <div style={{ marginTop: "12px", borderTop: "1px dashed #cbd5e1", paddingTop: "12px" }}>
              <p style={{ margin: "0 0 6px 0", color: "#16a34a", fontWeight: 700, fontSize: "14px" }}>
                Explanation:
              </p>
              <p style={{ margin: "4px 0", fontSize: "14px", color: "#1e293b" }}>
                - Incorrect segment: <strong style={{ color: "#ef4444" }}>{q.correct}</strong>
              </p>
              <p style={{ margin: "4px 0", fontSize: "14px", color: "#1e293b" }}>
                - Correct form: <strong style={{ color: "#16a34a" }}>{q.correctSentence}</strong>
              </p>
              {q.explanation && (
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#475569", fontStyle: "italic" }}>
                  Detail explanation: {q.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
