import React from "react";

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
  return (
    <div>
      <div style={{ background: "#fff3e0", padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{q.prompt}</p>
      </div>
      {submitted ? (
        <div
          style={{
            background: "#fafafa",
            padding: 12,
            border: "1px solid #e0d8cc",
            borderRadius: 8,
          }}
        >
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{essayAnswers[qIdx] || ""}</p>
        </div>
      ) : (
        <textarea
          className="ad-q-input"
          disabled={isOverdue}
          value={essayAnswers[qIdx] || ""}
          onChange={(e) =>
            setEssayAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))
          }
          placeholder="Write your essay here..."
          rows={6}
        />
      )}
    </div>
  );
};
