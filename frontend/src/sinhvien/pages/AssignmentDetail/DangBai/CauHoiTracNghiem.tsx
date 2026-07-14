import React from "react";
import { FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";

// Dinh nghia interface cho props cua component
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
  isReview?: boolean; // Che do xem lai bai tap da nop
  displayIdx?: number;
  showAnswers?: boolean;
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
  isReview = false,
  displayIdx,
  showAnswers = false
}) => {
  // Khoa de lay cau tra loi da chon cua sinh vien
  const key = subIdxPrefix !== undefined ? `${subIdxPrefix}_${qIdx}` : qIdx;
  const chosen = mcAnswers[key] || "";
  
  // Chuyen doi mang dap an sang dang nhan A, B, C, D de hien thi
  const optionsList =
    q.options ||
    (q.answers?.map((t: string, i: number) => ({
      label: ["A", "B", "C", "D"][i],
      text: t,
    })) || []);
    
  // Kiem tra cau tra loi dung/sai
  const isCorrect = (submitted || isReview) && chosen === q.correct;

  return (
    <div
      key={qIdx}
      className="ad-mcq-question-box"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* McqQuestionCircleBadge: Hien thi so thu tu cau hoi dang vong tron mau xanh lam chu dao */}
          <div className="mcq-question-circle-badge">
            {displayIdx !== undefined ? displayIdx : qIdx + 1}
          </div>
          <p style={{ margin: 0, fontWeight: 700, color: "#1e3a8a", fontSize: 16 }}>
            {q.question}
          </p>
        </div>
        {(submitted || isReview) && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isCorrect ? "#16a34a" : (chosen === "" ? "#eab308" : "#dc2626"),
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {isCorrect ? (
              <>
                <FiCheckCircle /> Chính xác
              </>
            ) : chosen === "" ? (
              <>
                <FiInfo /> Chưa chọn
              </>
            ) : (
              <>
                <FiXCircle /> Chưa chính xác
              </>
            )}
          </span>
        )}
      </div>
      <div className="ad-mcq-list">
        {optionsList.map((opt: any) => {
          const isChosen = chosen === opt.label;
          let optionClass = "";

          // Ap dung logic to mau sac o che do xem lai (Review mode)
          if (isReview) {
            if (isChosen) {
              if (chosen === q.correct) {
                // Sinh vien chon dung -> to xanh o sinh vien chon
                optionClass = "review-correct-chosen";
              } else {
                // Sinh vien chon sai -> to do o sinh vien chon
                optionClass = "review-wrong-chosen";
              }
            } else {
              if (opt.label === q.correct) {
                if (chosen === "") {
                  // Sinh vien khong chon -> to vang o dap an dung
                  optionClass = "review-no-choice-correct";
                } else {
                  // Sinh vien chon sai o khac -> to xanh o dap an dung thuc te
                  optionClass = "review-correct-unchosen";
                }
              }
            }
          } else {
            // Che do binh thuong khi lam bai hoac da nop bai kieu cu
            const isCorrectOpt = (submitted || showAnswers) && opt.label === q.correct;
            const isWrongOpt = submitted && isChosen && opt.label !== q.correct;
            optionClass = isCorrectOpt ? "correct" : isWrongOpt ? "wrong" : isChosen ? "chosen" : "";
          }

          return (
            <label
              key={opt.label}
              className={`ad-mcq-option ${optionClass}`}
            >
              <input
                type="radio"
                disabled={submitted || isOverdue || (isExam && !examStarted) || isReview}
                checked={isChosen}
                onChange={() => {
                  if (!isReview) {
                    setMcAnswers((prev) => ({ ...prev, [key]: opt.label }));
                  }
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
      {(submitted || isReview || showAnswers) && (
        <div className="ad-explanation">
          <p className="correct-ans" style={{ margin: "4px 0", color: "#16a34a", fontWeight: "600" }}>
            Đáp án đúng: {q.correct}
          </p>
          {(q.explanation || q.Explanation) && (
            <p className="exp-text" style={{ margin: "4px 0", color: "#475569" }}>
              <strong>Giải thích:</strong> {q.explanation || q.Explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
