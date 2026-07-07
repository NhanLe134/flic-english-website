import React, { useState, useEffect } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

interface VocabPair {
  word: string;
  meaning: string;
}

interface NoiTuProps {
  q: any;
  qIdx: string | number;
  mcAnswers: Record<string | number, string>;
  setMcAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  submitted: boolean;
  onAutoSubmit?: () => void;
}

export const NoiTu: React.FC<NoiTuProps> = ({
  q,
  qIdx,
  mcAnswers,
  setMcAnswers,
  submitted,
  onAutoSubmit,
}) => {
  const vocabPairs: VocabPair[] = q.vocabPairs || [];

  // Local states for game logic
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const [matchedLeft, setMatchedLeft] = useState<string[]>([]);
  const [matchedRight, setMatchedRight] = useState<string[]>([]);

  const [errorLeft, setErrorLeft] = useState<string | null>(null);
  const [errorRight, setErrorRight] = useState<string | null>(null);

  const [successLeft, setSuccessLeft] = useState<string | null>(null);
  const [successRight, setSuccessRight] = useState<string | null>(null);

  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = React.useRef<any>(null);
  const autoSubmitRef = React.useRef(onAutoSubmit);

  useEffect(() => {
    autoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  // Shuffle items on mount or when questions change
  useEffect(() => {
    if (vocabPairs.length > 0) {
      const words = vocabPairs.map((p) => p.word);
      const meanings = vocabPairs.map((p) => p.meaning);

      // Fisher-Yates Shuffle
      setLeftItems([...words].sort(() => Math.random() - 0.5));
      setRightItems([...meanings].sort(() => Math.random() - 0.5));

      // If already submitted, pre-populate matched
      if (submitted) {
        setMatchedLeft(words);
        setMatchedRight(meanings);
      } else {
        setMatchedLeft([]);
        setMatchedRight([]);
        setWrongAttempts(0);
      }
    }
  }, [q, submitted]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Save progress to mcAnswers (stores the list of correct matched words joined by |||)
  useEffect(() => {
    if (!submitted) {
      setMcAnswers((prev) => ({
        ...prev,
        [qIdx]: matchedLeft.join("|||"),
      }));
    }
  }, [matchedLeft, qIdx, setMcAnswers, submitted]);

  const checkMatch = (left: string, right: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const pair = vocabPairs.find((p) => p.word === left);
    const isMatch = pair && pair.meaning === right;

    if (isMatch) {
      setSuccessLeft(left);
      setSuccessRight(right);
      setSelectedLeft(null);
      setSelectedRight(null);
      setIsProcessing(true);

      timeoutRef.current = setTimeout(() => {
        setMatchedLeft((prev) => {
          const next = [...prev, left];
          if (next.length === vocabPairs.length && onAutoSubmit) {
            setTimeout(() => {
              autoSubmitRef.current?.();
            }, 500);
          }
          return next;
        });
        setMatchedRight((prev) => [...prev, right]);
        setSuccessLeft(null);
        setSuccessRight(null);
        setIsProcessing(false);
      }, 500);
    } else {
      setErrorLeft(left);
      setErrorRight(right);
      setSelectedLeft(null);
      setSelectedRight(null);
      setIsProcessing(true);

      const nextWrong = wrongAttempts + 1;
      setWrongAttempts(nextWrong);

      timeoutRef.current = setTimeout(() => {
        setErrorLeft(null);
        setErrorRight(null);
        setIsProcessing(false);
        if (nextWrong >= 3 && onAutoSubmit) {
          setTimeout(() => {
            autoSubmitRef.current?.();
          }, 500);
        }
      }, 1000);
    }
  };

  const handleLeftClick = (item: string) => {
    if (submitted || isProcessing || matchedLeft.includes(item) || wrongAttempts >= 3) return;

    if (selectedLeft === item) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(item);
      if (selectedRight) {
        checkMatch(item, selectedRight);
      }
    }
  };

  const handleRightClick = (item: string) => {
    if (submitted || isProcessing || matchedRight.includes(item) || wrongAttempts >= 3) return;

    if (selectedRight === item) {
      setSelectedRight(null);
    } else {
      setSelectedRight(item);
      if (selectedLeft) {
        checkMatch(selectedLeft, item);
      }
    }
  };

  if (submitted) {
    const matchedScore = mcAnswers[qIdx] || "";
    let correctCount = 0;
    let savedMatchedWords: string[] = [];

    if (matchedScore) {
      if (matchedScore.includes("|||")) {
        savedMatchedWords = matchedScore.split("|||").filter(Boolean);
        correctCount = savedMatchedWords.length;
      } else if (matchedScore.includes("/")) {
        const numerator = Number(matchedScore.split("/")[0]);
        correctCount = isNaN(numerator) ? 0 : numerator;
        savedMatchedWords = vocabPairs.slice(0, correctCount).map(p => p.word);
      } else if (!isNaN(Number(matchedScore))) {
        correctCount = Number(matchedScore);
        savedMatchedWords = vocabPairs.slice(0, correctCount).map(p => p.word);
      } else {
        savedMatchedWords = matchedScore.split(",").filter(Boolean);
        correctCount = savedMatchedWords.length;
      }
    } else {
      correctCount = vocabPairs.length;
      savedMatchedWords = vocabPairs.map(p => p.word);
    }

    const displayScore = `${correctCount}/${vocabPairs.length}`;

    return (
      <div className="flic-vocab-matching-container review-mode">
        <h4 className="flic-vocab-title" style={{ textAlign: "center", marginBottom: "8px" }}>Match the pairs</h4>
        
        {displayScore && (
          <div style={{
            textAlign: "center",
            fontSize: "14px",
            fontWeight: 700,
            color: "#1e3a8a",
            marginBottom: "16px"
          }}>
            Số cặp nối đúng: <span style={{ color: "#F95800", fontSize: "16px" }}>{displayScore}</span>
          </div>
        )}

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "500px",
          margin: "0 auto 24px auto",
          background: "#f8fafc",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 40px 1fr",
            fontWeight: "bold",
            color: "#64748b",
            fontSize: "12px",
            textTransform: "uppercase",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "8px",
            marginBottom: "4px"
          }}>
            <span>Từ vựng</span>
            <span></span>
            <span style={{ textAlign: "right" }}>Nghĩa của từ</span>
          </div>
          {vocabPairs.map((pair, idx) => {
            const isCorrect = savedMatchedWords.map(w => w.trim().toLowerCase()).includes(pair.word.trim().toLowerCase());
            return (
              <div key={idx} style={{
                display: "grid",
                gridTemplateColumns: "1fr 40px 1fr",
                alignItems: "center",
                background: isCorrect ? "#f0fdf4" : "#fef2f2",
                border: isCorrect ? "1px solid #bbf7d0" : "1px solid #fecaca",
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                color: isCorrect ? "#15803d" : "#b91c1c"
              }}>
                <span style={{ fontWeight: 600 }}>{pair.word}</span>
                <span style={{ textAlign: "center" }}>{isCorrect ? "➔" : "✗"}</span>
                <span style={{ textAlign: "right" }}>{pair.meaning}</span>
              </div>
            );
          })}
        </div>
        <div className="flic-vocab-result">
          <FiCheckCircle style={{ color: "#16a34a", fontSize: 20 }} />
          <span>Bài tập nối từ đã được hoàn thành!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flic-vocab-matching-container">
      <div className="flic-vocab-header">
        <h4 className="flic-vocab-title">Match the pairs</h4>
        {!submitted && (
          <div className="flic-vocab-hearts" style={{ marginTop: 12, display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
            {[1, 2, 3].map((heartIdx) => (
              <FaHeart
                key={heartIdx}
                style={{
                  fontSize: 18,
                  color: heartIdx <= (3 - wrongAttempts) ? "#ef4444" : "#cbd5e1",
                  transition: "all 0.3s ease",
                  transform: heartIdx > (3 - wrongAttempts) ? "scale(0.9)" : "scale(1)"
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flic-vocab-grid">
        {/* Left Column - English Words */}
        <div className="flic-vocab-column">
          {leftItems.map((word) => {
            const isMatched = matchedLeft.includes(word);
            if (isMatched) return null;

            const isSelected = selectedLeft === word;
            const isSuccess = successLeft === word;
            const isError = errorLeft === word;

            let cardClass = "flic-vocab-card";
            if (isSuccess) cardClass += " success";
            else if (isError) cardClass += " error";
            else if (isSelected) cardClass += " selected";

            return (
              <button
                key={word}
                type="button"
                className={cardClass}
                onClick={() => handleLeftClick(word)}
                disabled={submitted}
              >
                <span className="vocab-text">{word}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column - Vietnamese Meanings */}
        <div className="flic-vocab-column">
          {rightItems.map((meaning) => {
            const isMatched = matchedRight.includes(meaning);
            if (isMatched) return null;

            const isSelected = selectedRight === meaning;
            const isSuccess = successRight === meaning;
            const isError = errorRight === meaning;

            let cardClass = "flic-vocab-card";
            if (isSuccess) cardClass += " success";
            else if (isError) cardClass += " error";
            else if (isSelected) cardClass += " selected";

            return (
              <button
                key={meaning}
                type="button"
                className={cardClass}
                onClick={() => handleRightClick(meaning)}
                disabled={submitted}
              >
                <span className="vocab-text">{meaning}</span>
              </button>
            );
          })}
        </div>
      </div>

      {submitted && (
        <div className="flic-vocab-result">
          <FiCheckCircle style={{ color: "#16a34a", fontSize: 20 }} />
          <span>Bài tập nối từ đã được hoàn thành!</span>
        </div>
      )}
    </div>
  );
};
