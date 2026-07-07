import React, { useState, useEffect } from "react";
import { FiFileText } from "react-icons/fi";

interface SapXepTuProps {
  q: any;
  qIdx: string | number;
  shuffledWords: Record<string | number, string[]>;
  setShuffledWords: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  orderedWords: Record<string | number, string[]>;
  setOrderedWords: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  submitted: boolean;
}

export const SapXepTu: React.FC<SapXepTuProps> = ({
  q,
  qIdx,
  shuffledWords,
  orderedWords,
  setOrderedWords,
  submitted,
}) => {
  const sWords = shuffledWords[qIdx] || [];
  
  // Keep a fixed shuffled order of words to render placeholders correctly
  const [originalShuffled, setOriginalShuffled] = useState<string[]>([]);
  const [orderedIndices, setOrderedIndices] = useState<number[]>([]);

  // Drag and drop states
  const [draggedFrom, setDraggedFrom] = useState<{ type: "bank" | "ordered"; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOverArea, setIsDragOverArea] = useState(false);

  // Initialize originalShuffled from parent shuffledWords or from question
  useEffect(() => {
    if (originalShuffled.length === 0) {
      if (sWords && sWords.length > 0) {
        setOriginalShuffled(sWords);
      } else {
        const sentence = q.correctSentence || q.text || "";
        const words = sentence.split(/\s+/).map((w: string) => w.trim().replace(/[^a-zA-Z0-9']/g, "")).filter(Boolean);
        setOriginalShuffled([...words].sort(() => Math.random() - 0.5));
      }
    }
  }, [sWords, q, originalShuffled]);

  // Sync orderedIndices if orderedWords is cleared externally or pre-populated
  useEffect(() => {
    const parentOrdered = orderedWords[qIdx] || [];
    if (parentOrdered.length === 0 && orderedIndices.length > 0) {
      setOrderedIndices([]);
    }
  }, [orderedWords, qIdx]);

  const handleAddWord = (index: number) => {
    if (submitted || orderedIndices.includes(index)) return;
    const nextIndices = [...orderedIndices, index];
    setOrderedIndices(nextIndices);
    setOrderedWords((prev) => ({
      ...prev,
      [qIdx]: nextIndices.map((i) => originalShuffled[i]),
    }));
  };

  const handleRemoveWord = (k: number) => {
    if (submitted) return;
    const nextIndices = orderedIndices.filter((_, idx) => idx !== k);
    setOrderedIndices(nextIndices);
    setOrderedWords((prev) => ({
      ...prev,
      [qIdx]: nextIndices.map((i) => originalShuffled[i]),
    }));
  };

  // Drag and drop event handlers
  const handleDragStartFromBank = (e: React.DragEvent, index: number) => {
    if (submitted) return;
    setDraggedFrom({ type: "bank", index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragStartWithinOrdered = (e: React.DragEvent, index: number) => {
    if (submitted) return;
    setDraggedFrom({ type: "ordered", index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverArea = (e: React.DragEvent) => {
    if (submitted) return;
    e.preventDefault();
    setIsDragOverArea(true);
  };

  const handleDragLeaveArea = () => {
    setIsDragOverArea(false);
  };

  const handleDropOnArea = (e: React.DragEvent) => {
    if (submitted) return;
    e.preventDefault();
    setIsDragOverArea(false);
    if (!draggedFrom) return;

    if (draggedFrom.type === "bank") {
      const idx = draggedFrom.index;
      if (!orderedIndices.includes(idx)) {
        handleAddWord(idx);
      }
    }
    setDraggedFrom(null);
  };

  const handleDragOverWord = (e: React.DragEvent, targetIndex: number) => {
    if (submitted) return;
    e.preventDefault();
    setDragOverIndex(targetIndex);
  };

  const handleDropOnWord = (e: React.DragEvent, targetIndex: number) => {
    if (submitted) return;
    e.preventDefault();
    setDragOverIndex(null);
    if (!draggedFrom) return;

    if (draggedFrom.type === "bank") {
      const bankIdx = draggedFrom.index;
      if (!orderedIndices.includes(bankIdx)) {
        const nextIndices = [...orderedIndices];
        nextIndices.splice(targetIndex, 0, bankIdx);
        setOrderedIndices(nextIndices);
        setOrderedWords((prev) => ({
          ...prev,
          [qIdx]: nextIndices.map((i) => originalShuffled[i]),
        }));
      }
    } else if (draggedFrom.type === "ordered") {
      const fromIndex = draggedFrom.index;
      if (fromIndex !== targetIndex) {
        const nextIndices = [...orderedIndices];
        const [moved] = nextIndices.splice(fromIndex, 1);
        nextIndices.splice(targetIndex, 0, moved);
        setOrderedIndices(nextIndices);
        setOrderedWords((prev) => ({
          ...prev,
          [qIdx]: nextIndices.map((i) => originalShuffled[i]),
        }));
      }
    }
    setDraggedFrom(null);
  };

  const handleDropOnBank = (e: React.DragEvent) => {
    if (submitted) return;
    e.preventDefault();
    if (draggedFrom && draggedFrom.type === "ordered") {
      handleRemoveWord(draggedFrom.index);
    }
    setDraggedFrom(null);
  };

  const handleDragEnd = () => {
    setDraggedFrom(null);
    setDragOverIndex(null);
    setIsDragOverArea(false);
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
      <div className="ad-speaking-prompt-box" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
        <p
          className="ad-speaking-prompt-label"
          style={{ color: "#F95800", display: "flex", alignItems: "center", gap: 6, margin: "0 0 8px 0", fontSize: 13, fontWeight: 700 }}
        >
          <FiFileText /> {getQuestionNumberLabel()}
        </p>
        <p className="ad-speaking-prompt-text" style={{ color: "#334155", fontSize: 15, fontWeight: 500, margin: 0 }}>
          {q.text}
        </p>
      </div>

      {/* Answer Sentence Area */}
      <div
        className={`flic-word-ordered-area ${isDragOverArea ? "drag-over" : ""}`}
        onDragOver={handleDragOverArea}
        onDragLeave={handleDragLeaveArea}
        onDrop={handleDropOnArea}
      >
        {orderedIndices.map((origIdx, k) => {
          const word = originalShuffled[origIdx];
          const isOver = dragOverIndex === k;
          return (
            <div
              key={`${origIdx}-${k}`}
              draggable={!submitted}
              onDragStart={(e) => handleDragStartWithinOrdered(e, k)}
              onDragOver={(e) => handleDragOverWord(e, k)}
              onDrop={(e) => handleDropOnWord(e, k)}
              onDragEnd={handleDragEnd}
              onClick={() => handleRemoveWord(k)}
              className={`flic-word-card ${draggedFrom?.type === "ordered" && draggedFrom.index === k ? "dragging" : ""}`}
              style={{
                borderLeftColor: isOver ? "#F95800" : undefined,
                borderLeftWidth: isOver ? 4 : undefined,
                borderRightColor: (dragOverIndex === k + 1) ? "#F95800" : undefined,
                borderRightWidth: (dragOverIndex === k + 1) ? 4 : undefined,
              }}
            >
              {word}
            </div>
          );
        })}
        {orderedIndices.length === 0 && (
          <span style={{ color: "#94a3b8", fontSize: 14, fontStyle: "italic", userSelect: "none" }}>
            Kéo thả hoặc nhấn vào các từ bên dưới để ghép câu...
          </span>
        )}
      </div>

      {/* Word Bank Area */}
      <div
        className="flic-word-bank"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnBank}
      >
        {originalShuffled.map((word, i) => {
          const isUsed = orderedIndices.includes(i);
          if (isUsed) {
            return (
              <div key={i} className="flic-word-placeholder">
                {word}
              </div>
            );
          }

          return (
            <div
              key={i}
              draggable={!submitted}
              onDragStart={(e) => handleDragStartFromBank(e, i)}
              onDragEnd={handleDragEnd}
              onClick={() => handleAddWord(i)}
              className="flic-word-card"
            >
              {word}
            </div>
          );
        })}
      </div>

      {submitted && (
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
          <p className="correct-ans" style={{ margin: 0, fontWeight: 700, color: "#166534", fontSize: 14.5 }}>
            Đáp án đúng: {q.correctSentence}
          </p>
        </div>
      )}
    </div>
  );
};
