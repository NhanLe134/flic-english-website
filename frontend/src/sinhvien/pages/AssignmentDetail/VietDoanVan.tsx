import React from "react";
import { FiEdit3, FiFileText, FiClock } from "react-icons/fi";

interface VietDoanVanProps {
  q: any;
  qIdx: number;
  essayAnswers: Record<string | number, string>;
  setEssayAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  submitted: boolean;
  isOverdue: boolean;
}

export const VietDoanVan: React.FC<VietDoanVanProps> = ({
  q,
  qIdx,
  essayAnswers,
  setEssayAnswers,
  submitted,
  isOverdue,
}) => {
  const text = essayAnswers[qIdx] || "";
  
  // Word & Character count computation
  const charCount = text.length;
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  return (
    <div className="flic-essay-container">
      {/* Question Prompt Header */}
      <div className="flic-essay-prompt">
        <p className="flic-essay-prompt-label">
          <FiEdit3 style={{ color: "#F95800" }} /> Đề bài tự luận:
        </p>
        <p className="flic-essay-prompt-text">{q.prompt || q.text}</p>
      </div>

      {submitted ? (
        // Submitted (Lined notebook paper look)
        <div>
          <div className="flic-paper-ruled">
            <pre className="flic-paper-ruled-content">{text || "(Không có nội dung bài viết)"}</pre>
          </div>
          
          <div className="flic-paper-meta">
            <span className="flic-paper-badge">Số từ: {wordCount} từ</span>
            <span className="flic-paper-badge">Số ký tự: {charCount} ký tự</span>
          </div>

          {/* Teacher feedback panel */}
          {q.score !== undefined && q.score !== null ? (
            <div className="flic-feedback-panel flic-feedback-graded">
              <div className="flic-feedback-header">
                <FiFileText /> Kết quả chấm điểm: {q.score}/10
              </div>
              <p className="flic-feedback-text">
                <strong>Nhận xét từ giáo viên:</strong> {q.teacherComment || "Không có nhận xét thêm."}
              </p>
            </div>
          ) : (
            <div className="flic-feedback-panel flic-feedback-awaiting">
              <div className="flic-feedback-header">
                <FiClock /> Trạng thái: Chờ giảng viên chấm điểm
              </div>
              <p className="flic-feedback-text">
                Bài luận của bạn đã được ghi nhận thành công và đang đợi giảng viên chấm điểm và cho nhận xét chi tiết.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Active Writing Interface
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="flic-essay-textarea-wrapper">
            <textarea
              className="flic-essay-textarea"
              disabled={isOverdue}
              value={text}
              onChange={(e) => setEssayAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))}
              placeholder="Nhập bài viết luận của bạn tại đây bằng tiếng Anh..."
              rows={8}
            />
          </div>
        </div>
      )}
    </div>
  );
};
