import React from "react";

interface MiniTestSetupProps {
  minitestQuestions: any[];
  setMinitestQuestions: React.Dispatch<React.SetStateAction<any[]>>;
  handleMinitestFileScan: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MiniTestSetup({
  minitestQuestions,
  setMinitestQuestions,
  handleMinitestFileScan,
}: MiniTestSetupProps) {
  
  const addMinitestQuestion = () => {
    setMinitestQuestions(prev => [
      ...prev,
      { question: "", answers: ["", "", "", ""], correct: "A", explanation: "" }
    ]);
  };

  const removeMinitestQuestion = (index: number) => {
    if (minitestQuestions.length > 1) {
      setMinitestQuestions(prev => prev.filter((_, i) => i !== index));
    } else {
      alert("MiniTest cần có ít nhất 1 câu hỏi.");
    }
  };

  const updateQuestionField = (index: number, field: string, value: any) => {
    setMinitestQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const updateQuestionAnswer = (qIndex: number, aIndex: number, value: string) => {
    setMinitestQuestions(prev => {
      const copy = [...prev];
      const answers = [...copy[qIndex].answers];
      answers[aIndex] = value;
      copy[qIndex] = { ...copy[qIndex], answers };
      return copy;
    });
  };

  return (
    <div style={{
      marginTop: 15,
      padding: "20px",
      background: "#f8fafc",
      borderRadius: "12px",
      border: "1px solid #cbd5e1"
    }}>
      <h4 style={{ margin: "0 0 10px 0", color: "#000080", fontSize: "14px", fontWeight: 700 }}>
        Thiết lập câu hỏi cho MiniTest
      </h4>
      
      {/* File Scan Card */}
      <div style={{
        background: "#ffffff",
        border: "1px dashed #cbd5e1",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "20px",
        textAlign: "left"
      }}>
        <h5 style={{ margin: "0 0 5px 0", color: "#000080", fontSize: "13px", fontWeight: 600 }}>
          Quét câu hỏi từ file Word (.docx) hoặc Text (.txt)
        </h5>
        <p style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#475569", lineHeight: "1.4" }}>
          Tự động điền nhanh danh sách câu hỏi. Định dạng file mẫu:
        </p>
        <pre style={{
          background: "#f1f5f9",
          padding: "8px 12px",
          borderRadius: "6px",
          fontSize: "10px",
          fontFamily: "Courier New, monospace",
          whiteSpace: "pre-wrap",
          color: "#334155",
          margin: "0 0 10px 0",
          border: "1px solid #e2e8f0"
        }}>
{`Câu 1: She _______ English for 5 years.
A. has studied
B. studies
C. studied
D. is studying
Đáp án đúng: A
Giải thích: Hành động bắt đầu trong quá khứ kéo dài đến hiện tại (tùy chọn)`}
        </pre>
        <input
          type="file"
          accept=".txt,.docx"
          onChange={handleMinitestFileScan}
          style={{ fontSize: "12px", width: "100%" }}
        />
      </div>

      {/* List of Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {minitestQuestions.map((q, qIndex) => (
          <div key={qIndex} style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "15px",
            position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <strong style={{ fontSize: 13, color: "#000080" }}>Câu hỏi {qIndex + 1}</strong>
              {minitestQuestions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMinitestQuestion(qIndex)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: "600",
                    padding: 0
                  }}
                >
                  Xóa câu hỏi
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Nhập nội dung câu hỏi..."
              value={q.question || ""}
              onChange={e => updateQuestionField(qIndex, "question", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                marginBottom: "10px",
                boxSizing: "border-box"
              }}
            />

            {["A", "B", "C", "D"].map((lbl, aIndex) => (
              <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: "bold", fontSize: 12, width: 15 }}>{lbl}.</span>
                <input
                  type="text"
                  placeholder={`Lựa chọn ${lbl}`}
                  value={q.answers[aIndex] || ""}
                  onChange={e => updateQuestionAnswer(qIndex, aIndex, e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    margin: 0,
                    boxSizing: "border-box"
                  }}
                />
              </div>
            ))}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>
                  Đáp án đúng
                </label>
                <select
                  value={q.correct || "A"}
                  onChange={e => updateQuestionField(qIndex, "correct", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    background: "#fff",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="A">Đáp án đúng: A</option>
                  <option value="B">Đáp án đúng: B</option>
                  <option value="C">Đáp án đúng: C</option>
                  <option value="D">Đáp án đúng: D</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>
                  Giải thích đáp án (tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Giải thích..."
                  value={q.explanation || ""}
                  onChange={e => updateQuestionField(qIndex, "explanation", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    margin: 0,
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addMinitestQuestion}
        style={{
          marginTop: 15,
          width: "100%",
          padding: "10px",
          background: "#000080",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "13px"
        }}
      >
        + Thêm câu hỏi trắc nghiệm
      </button>
    </div>
  );
}
