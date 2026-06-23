import React from "react";

interface SapXepCauProps {
  q: any;
  qIdx: string | number;
  shuffledSentences: Record<string | number, string[]>;
  setShuffledSentences: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  submitted: boolean;
  isOverdue: boolean;
}

export const SapXepCau: React.FC<SapXepCauProps> = ({
  q: _q,
  qIdx,
  shuffledSentences,
  setShuffledSentences,
  submitted,
  isOverdue,
}) => {
  const sSents = shuffledSentences[qIdx] || [];

  return (
    <div>
      <p style={{ fontSize: 13, color: "#666" }}>
        Rearrange the sentences to form a logical paragraph:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sSents.map((sent, idx) => {
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 10,
                border: "1px solid #e0d8cc",
                borderRadius: 8,
                background: "#fafafa",
              }}
            >
              <span style={{ fontWeight: 700 }}>{idx + 1}.</span>
              <p style={{ margin: 0, flex: 1, fontSize: 14 }}>{sent}</p>
              {!submitted && (
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    disabled={idx === 0 || isOverdue}
                    onClick={() => {
                      const copy = [...sSents];
                      const tmp = copy[idx];
                      copy[idx] = copy[idx - 1];
                      copy[idx - 1] = tmp;
                      setShuffledSentences((prev) => ({ ...prev, [qIdx]: copy }));
                    }}
                  >
                    ▲
                  </button>
                  <button
                    disabled={idx === sSents.length - 1 || isOverdue}
                    onClick={() => {
                      const copy = [...sSents];
                      const tmp = copy[idx];
                      copy[idx] = copy[idx + 1];
                      copy[idx + 1] = tmp;
                      setShuffledSentences((prev) => ({ ...prev, [qIdx]: copy }));
                    }}
                  >
                    ▼
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
