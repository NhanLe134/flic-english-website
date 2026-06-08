import "./EssayDetail.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const structure = [
  { part: "Introduction", tips: ["Giới thiệu chủ đề", "Nêu rõ quan điểm của bạn"] },
  { part: "Body Paragraph 1", tips: ["Lý do thứ nhất + ví dụ cụ thể", "Dùng linking words: Firstly, Moreover..."] },
  { part: "Body Paragraph 2", tips: ["Lý do thứ hai + ví dụ cụ thể", "Dùng linking words: Furthermore, However..."] },
  { part: "Conclusion", tips: ["Tóm tắt ý chính", "Nhấn mạnh lại quan điểm"] },
];

function EssayDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const assignment = location.state?.assignment;
  const title = assignment?.title || "Essay: My Summer Vacation";

  const [essay, setEssay] = useState("");
  const wordCount = essay.trim() === "" ? 0 : essay.trim().split(/\s+/).length;
  const submitted = assignment?.status === "Submitted";

  return (
        <div className="ed-content">

          <div className="ed-top">
            <nav className="ed-breadcrumb">
              <span className="ed-link" onClick={() => navigate("/assignments")}>Bài tập</span>
              <span>›</span>
              <span className="ed-active">Tự luận</span>
            </nav>
            <button className="ed-back" onClick={() => navigate(-1)}>← Quay lại</button>
          </div>

          {/* Header */}
          <div className="ed-header-card">
            <span className="ed-kind-badge">✍️ Tự luận</span>
            <h1 className="ed-title">{title}</h1>
            <p className="ed-meta">Writing · 120–150 từ · Nộp trước {assignment?.date || "07/11/2025"}</p>
          </div>

          {/* Topic */}
          <div className="ed-card">
            <h4 className="ed-card-title">📌 Đề bài</h4>
            <div className="ed-topic-box">
              <p className="ed-topic-text">
                Write about your most memorable summer vacation. Describe where you went,
                what you did, and why it was special to you. Use at least 3 tenses in your essay.
              </p>
            </div>
            <div className="ed-requirements">
              <span>📏 120–150 từ</span>
              <span>⏱ 30 phút</span>
              <span>📚 Dùng ít nhất 3 thì</span>
            </div>
          </div>

          {/* Structure guide */}
          <div className="ed-card">
            <h4 className="ed-card-title">🗂 Cấu trúc bài viết</h4>
            <div className="ed-structure">
              {structure.map((s) => (
                <div className="ed-struct-item" key={s.part}>
                  <p className="ed-struct-part">{s.part}</p>
                  <ul>{s.tips.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>

          {/* Write area */}
          <div className="ed-card">
            <div className="ed-write-header">
              <h4 className="ed-card-title">✏️ Bài viết của bạn</h4>
              <span className={`ed-wordcount ${wordCount >= 120 && wordCount <= 150 ? "good" : ""}`}>
                {wordCount} / 150 từ
              </span>
            </div>
            <textarea
              className="ed-textarea"
              placeholder="Bắt đầu viết bài của bạn tại đây..."
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              rows={12}
              disabled={submitted}
            />
            {wordCount > 0 && wordCount < 120 && (
              <p className="ed-hint">Cần thêm {120 - wordCount} từ nữa để đạt yêu cầu tối thiểu.</p>
            )}
            {wordCount >= 120 && wordCount <= 150 && (
              <p className="ed-hint good">✅ Bài viết đạt yêu cầu độ dài!</p>
            )}
            {wordCount > 150 && (
              <p className="ed-hint warn">⚠️ Bài viết đã vượt quá {wordCount - 150} từ.</p>
            )}
          </div>

          <div className="ed-footer">
            <button className="ed-draft-btn" onClick={() => {}}>Lưu nháp</button>
            <button className="ed-submit-btn" onClick={() => navigate("/assignment-success")}>
              Nộp bài
            </button>
          </div>

        </div>
  );
}

export default EssayDetail;