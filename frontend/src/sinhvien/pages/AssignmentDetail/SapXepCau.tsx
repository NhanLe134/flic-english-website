import React, { useState } from "react";
import { FiFileText, FiArrowUp, FiArrowDown } from "react-icons/fi";

interface SapXepCauProps {
  q: any;
  qIdx: string | number;
  shuffledSentences: Record<string | number, string[]>;
  setShuffledSentences: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  submitted: boolean;
  isOverdue: boolean;
}

export const SapXepCau: React.FC<SapXepCauProps> = ({
  q,
  qIdx,
  shuffledSentences,
  setShuffledSentences,
  submitted,
  isOverdue,
}) => {
  const sSents = shuffledSentences[qIdx] || [];

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (submitted || isOverdue) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (submitted || isOverdue) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (submitted || isOverdue) return;
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const copy = [...sSents];
    const [moved] = copy.splice(draggedIndex, 1);
    copy.splice(targetIndex, 0, moved);

    setShuffledSentences((prev) => ({
      ...prev,
      [qIdx]: copy,
    }));
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const copy = [...sSents];
    const tmp = copy[idx];
    copy[idx] = copy[idx - 1];
    copy[idx - 1] = tmp;
    setShuffledSentences((prev) => ({ ...prev, [qIdx]: copy }));
  };

  const handleMoveDown = (idx: number) => {
    if (idx === sSents.length - 1) return;
    const copy = [...sSents];
    const tmp = copy[idx];
    copy[idx] = copy[idx + 1];
    copy[idx + 1] = tmp;
    setShuffledSentences((prev) => ({ ...prev, [qIdx]: copy }));
  };

  const getQuestionNumberLabel = () => {
    if (typeof qIdx === "string" && qIdx.includes("_")) {
      const parts = qIdx.split("_");
      const idx = Number(parts[parts.length - 1]);
      return `Câu ${isNaN(idx) ? qIdx : idx + 1}:`;
    }
    const idx = Number(qIdx);
    return `Câu ${isNaN(idx) ? qIdx : idx + 1}:`;
  };

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Instructions header card */}
      <div className="ad-speaking-prompt-box" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
        <p
          className="ad-speaking-prompt-label"
          style={{ color: "#F95800", display: "flex", alignItems: "center", gap: 6, margin: "0 0 8px 0", fontSize: 13, fontWeight: 700 }}
        >
          <FiFileText /> {getQuestionNumberLabel()}
        </p>
        <p className="ad-speaking-prompt-text" style={{ color: "#334155", fontSize: 15, fontWeight: 500, margin: 0 }}>
          Kéo thả hoặc sử dụng nút bấm để sắp xếp các câu sau thành một đoạn văn hoàn chỉnh có nghĩa:
        </p>
      </div>

      {/* Draggable Vertical Card List */}
      <div className="flic-sentence-list">
        {sSents.map((sent, idx) => {
          const isOver = dragOverIndex === idx;
          const isNextOver = dragOverIndex === idx + 1;
          const isCurrentDragging = draggedIndex === idx;

          return (
            <div
              key={`${sent}-${idx}`}
              draggable={!submitted && !isOverdue}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flic-sentence-card ${isCurrentDragging ? "dragging" : ""}`}
              style={{
                borderTopColor: isOver ? "#F95800" : undefined,
                borderTopWidth: isOver ? 4 : undefined,
                borderBottomColor: isNextOver ? "#F95800" : undefined,
                borderBottomWidth: isNextOver ? 4 : undefined,
              }}
            >


              {/* Index Number */}
              <div className="flic-sentence-number">
                {idx + 1}
              </div>

              {/* Sentence Text */}
              <p className="flic-sentence-text">
                {sent}
              </p>

              {/* Accessible Fallback Buttons */}
              {!submitted && !isOverdue && (
                <div className="flic-sentence-actions">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="flic-sentence-btn"
                    title="Di chuyển lên"
                  >
                    <FiArrowUp />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sSents.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="flic-sentence-btn"
                    title="Di chuyển xuống"
                  >
                    <FiArrowDown />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {submitted && q.sentences && (
        <div
          className="ad-explanation"
          style={{
            background: "#f0fdf4",
            border: "1px solid #86efac",
            padding: 16,
            borderRadius: 12,
            marginTop: 20,
          }}
        >
          <p className="correct-ans" style={{ margin: "0 0 10px 0", fontWeight: 700, color: "#166534", fontSize: 14.5 }}>
            Thứ tự đoạn văn đúng:
          </p>
          <ol style={{ margin: 0, paddingLeft: 20, color: "#1b4332", fontSize: 14, fontWeight: 500, lineHeight: 1.6 }}>
            {q.sentences.map((correctSent: string, cIdx: number) => (
              <li key={cIdx} style={{ marginBottom: 6 }}>{correctSent}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
