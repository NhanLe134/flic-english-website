import "./QuizDetail.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const questions = [
  { id: 1, question: "She _____ to school every day.", options: ["go", "goes", "going", "gone"], answer: "goes" },
  { id: 2, question: "They _____ watching TV when I called.", options: ["was", "were", "are", "is"], answer: "were" },
  { id: 3, question: "I have _____ this movie before.", options: ["see", "saw", "seen", "seeing"], answer: "seen" },
  { id: 4, question: "She will _____ the report tomorrow.", options: ["finish", "finishes", "finished", "finishing"], answer: "finish" },
  { id: 5, question: "He _____ play the guitar very well.", options: ["can", "cans", "could to", "is able"], answer: "can" },
];

function QuizDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const assignment = location.state?.assignment;
  const title = assignment?.title || "Grammar Quiz: Tenses";

  const [selected, setSelected] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = submitted
    ? questions.filter((q) => selected[q.id] === q.answer).length
    : 0;

  return (
        <div className="qd-content">

          <div className="qd-top">
            <nav className="qd-breadcrumb">
              <span className="qd-link" onClick={() => navigate("/assignments")}>Bài tập</span>
              <span>›</span>
              <span className="qd-active">Trắc nghiệm</span>
            </nav>
            <button className="qd-back" onClick={() => navigate(-1)}>← Quay lại</button>
          </div>

          <div className="qd-header-card">
            <div>
              <span className="qd-kind-badge">📝 Trắc nghiệm</span>
              <h1 className="qd-title">{title}</h1>
              <p className="qd-meta">Grammar · {questions.length} câu hỏi · 15 phút</p>
            </div>
            {submitted && (
              <div className="qd-score-box">
                <span className="qd-score-num">{score}/{questions.length}</span>
                <span className="qd-score-label">Điểm của bạn</span>
              </div>
            )}
          </div>

          {questions.map((q, i) => (
            <div className="qd-question-card" key={q.id}>
              <p className="qd-q-num">Câu {i + 1} / {questions.length}</p>
              <p className="qd-q-text">{q.question}</p>
              <div className="qd-options">
                {q.options.map((opt) => {
                  let cls = "qd-option";
                  if (submitted) {
                    if (opt === q.answer) cls += " correct";
                    else if (opt === selected[q.id] && opt !== q.answer) cls += " wrong";
                  } else if (selected[q.id] === opt) {
                    cls += " selected";
                  }
                  return (
                    <button
                      key={opt}
                      className={cls}
                      onClick={() => !submitted && setSelected({ ...selected, [q.id]: opt })}
                    >
                      {opt}
                      {submitted && opt === q.answer && <span className="qd-tick">✓</span>}
                      {submitted && opt === selected[q.id] && opt !== q.answer && <span className="qd-cross">✗</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="qd-footer">
            {!submitted ? (
              <button className="qd-submit" onClick={() => setSubmitted(true)}>
                Nộp bài
              </button>
            ) : (
              <button className="qd-submit green" onClick={() => navigate("/assignments")}>
                ← Về danh sách bài tập
              </button>
            )}
          </div>

        </div>
  );
}

export default QuizDetail;