import { useState, useEffect } from "react";
import { FiClock, FiCheckCircle, FiAlertCircle, FiRotateCcw, FiBookOpen, FiBook } from "react-icons/fi";
import "./TestThuSV.css";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index (0-3)
}

export default function TestThuSV() {
  const [activeTab, setActiveTab] = useState<"grammar" | "reading">("grammar");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const grammarQuestions: Question[] = [
    {
      id: 1,
      question: "Choose the correct option: She ______ to school every day.",
      options: ["go", "goes", "going", "gone"],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "If I ______ you, I would study harder for the test.",
      options: ["am", "was", "were", "be"],
      correctAnswer: 2
    },
    {
      id: 3,
      question: "We ______ English at FLIC for three months now.",
      options: ["have been learning", "learned", "learn", "are learning"],
      correctAnswer: 0
    }
  ];

  const readingQuestions: Question[] = [
    {
      id: 4,
      question: "What is the primary purpose of scanning a text?",
      options: [
        "To read every word in detail.",
        "To find a specific piece of information quickly.",
        "To understand the general idea of the text.",
        "To write a summary of the text."
      ],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "The word 'flourish' is closest in meaning to ______.",
      options: ["wither", "grow successfully", "disappear", "struggle"],
      correctAnswer: 1
    }
  ];

  const currentQuestions = activeTab === "grammar" ? grammarQuestions : readingQuestions;

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleSelectOption = (qId: number, optIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const allQuestions = [...grammarQuestions, ...readingQuestions];
    allQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setTimeLeft(600);
  };

  return (
    <div className="test-thu-container">
      {/* Top Header */}
      <div className="test-header">
        <div>
          <h1>ĐỀ THI THỬ TRẠI NGHIỆM</h1>
          <p>Luyện tập trắc nghiệm kiến thức tổng hợp để đánh giá năng lực của bạn.</p>
        </div>
        <div className="timer-badge">
          <FiClock size={18} />
          <span>Thời gian: {formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="test-layout">
        {/* Main Quiz Area */}
        <div className="test-main">
          {/* Tabs */}
          <div className="test-tabs">
            <button
              className={`tab-btn ${activeTab === "grammar" ? "active" : ""}`}
              onClick={() => !isSubmitted && setActiveTab("grammar")}
              disabled={isSubmitted}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <FiBookOpen size={16} /> Ngữ pháp & Từ vựng
            </button>
            <button
              className={`tab-btn ${activeTab === "reading" ? "active" : ""}`}
              onClick={() => !isSubmitted && setActiveTab("reading")}
              disabled={isSubmitted}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <FiBook size={16} /> Đọc hiểu (Reading)
            </button>
          </div>

          {/* Question List */}
          <div className="questions-list">
            {currentQuestions.map((q, idx) => (
              <div key={q.id} className="question-card">
                <h3 className="question-text">
                  Câu {idx + 1}: {q.question}
                </h3>
                <div className="options-grid">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[q.id] === oIdx;
                    const isCorrect = q.correctAnswer === oIdx;
                    let optionClass = "";

                    if (isSelected) optionClass = "selected";
                    if (isSubmitted) {
                      if (isCorrect) optionClass = "correct";
                      else if (isSelected) optionClass = "wrong";
                    }

                    return (
                      <button
                        key={oIdx}
                        className={`option-btn ${optionClass}`}
                        onClick={() => handleSelectOption(q.id, oIdx)}
                        disabled={isSubmitted}
                      >
                        <span className="option-letter">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <span className="option-label">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Info & Submit */}
        <div className="test-sidebar">
          {!isSubmitted ? (
            <div className="submit-card">
              <h3>Tiến độ làm bài</h3>
              <p className="progress-info">
                Đã hoàn thành: {Object.keys(answers).length} / {grammarQuestions.length + readingQuestions.length} câu
              </p>
              
              <button
                className="submit-test-btn"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length === 0}
              >
                Nộp Bài Thi Thử
              </button>
              
              <p className="warning-text">
                <FiAlertCircle size={14} /> Bạn có thể chuyển đổi tab để hoàn thành toàn bộ câu hỏi trước khi nộp.
              </p>
            </div>
          ) : (
            <div className="result-card">
              <FiCheckCircle className="result-icon" />
              <h3>Kết quả kiểm tra</h3>
              <div className="result-score">
                <span className="score-num">
                  {score} / {grammarQuestions.length + readingQuestions.length}
                </span>
                <span className="score-label">Câu trả lời đúng</span>
              </div>
              <p className="result-feedback">
                {score >= 4 
                  ? "Tuyệt vời! Kiến thức nền tảng của bạn rất tốt." 
                  : "Khá tốt! Bạn nên ôn tập kỹ hơn các phần ngữ pháp cốt lõi."}
              </p>
              
              <button className="reset-test-btn" onClick={handleReset}>
                <FiRotateCcw size={16} /> Làm lại đề thi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
