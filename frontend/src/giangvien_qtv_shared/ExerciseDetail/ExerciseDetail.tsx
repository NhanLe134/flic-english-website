import "./ExerciseDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

interface Pair { left: string; right: string; }
interface MCQuestion { question: string; options: { label: string; text: string }[]; correct: string; audioUrl?: string; }
interface Question { question: string; answers: string[]; correct: string; audioUrl?: string; }

const ExerciseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [exercise, setExercise] = useState<any>(null);

  const [editTitle,       setEditTitle]       = useState("");
  const [editContent,     setEditContent]     = useState("");
  const [editQuestions,   setEditQuestions]   = useState<Question[]>([]);
  const [editPairs,       setEditPairs]       = useState<Pair[]>([]);
  const [editVocab,       setEditVocab]       = useState<{ word: string; meaning: string }[]>([]);
  const [editExtraQs,     setEditExtraQs]     = useState<string[]>([]);
  const [editSpeakingAns, setEditSpeakingAns] = useState("");

  /* ===== NORMALIZE TYPE ===== */
  const exType = (exercise?.Type || "").toLowerCase();
  const normalizedType: string =
    ["writing", "reading", "essay"].includes(exType)     ? "essay"      :
    ["multiple", "quiz", "trắc nghiệm"].includes(exType) ? "multiple"   :
    ["listening", "nghe", "listening-mcq"].includes(exType) ? "listening" :
    ["matching", "ghép"].includes(exType)                ? "matching"   :
    ["connect", "nối"].includes(exType)                  ? "connect"    :
    ["ordering", "sắp xếp"].includes(exType)             ? "ordering"   :
    ["speaking", "nói"].includes(exType)                 ? "speaking"   :
    ["vocabulary", "từ vựng", "vocab"].includes(exType)  ? "vocabulary" :
    exType;

  const isPairs = normalizedType === "connect" || normalizedType === "matching";
  const isMC = normalizedType === "multiple" || normalizedType === "listening";

  const parseMCQuestions = (raw: string): MCQuestion[] => {
    if (!raw) return [];
    if (raw.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((q: any) => ({
            question: q.question || "",
            options: (q.answers || []).map((text: string, idx: number) => ({
              label: ["A", "B", "C", "D"][idx],
              text: text || ""
            })),
            correct: q.correct || "A",
            audioUrl: q.audioUrl || ""
          }));
        }
      } catch (e) {
        console.error("Failed to parse MCQuestions JSON", e);
      }
    }
    if (raw.includes("###") || raw.includes("||")) {
      return raw.split("###").map(block => {
        const parts = block.split("||");
        const question = parts[0]?.trim() || "";
        const rest = parts[1] || "";
        const items = rest.split("|");
        const options: { label: string; text: string }[] = [];
        let correct = "A";
        items.forEach(item => {
          const trimmed = item.trim();
          if (trimmed.startsWith("Đáp án đúng:")) correct = trimmed.replace("Đáp án đúng:", "").trim();
          else { const m = trimmed.match(/^([A-D])\.\s*(.+)/); if (m) options.push({ label: m[1], text: m[2] }); }
        });
        return { question, options, correct };
      }).filter(q => q.question);
    }
    return raw.split("|").map(q => q.trim()).filter(Boolean).map(q => ({ question: q, options: [], correct: "" }));
  };

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/baitap/${id}`).then(r => r.json()).then(setExercise).catch(console.log);
  }, [id]);

  useEffect(() => {
    if (!exercise) return;
    setEditTitle(exercise.Title || "");

    const contentParts: string[] = exercise.Content
      ? exercise.Content.split("\n---\n").map((s: string) => s.trim()).filter(Boolean)
      : [];
    const mainContent = contentParts[0] || "";
    setEditContent(mainContent);
    setEditSpeakingAns(normalizedType === "speaking" ? (exercise.Questions || "") : "");

    // MC questions
    if (isMC && exercise.Questions) {
      const mcQs = parseMCQuestions(exercise.Questions);
      setEditQuestions(mcQs.map(q => ({
        question: q.question,
        answers: ["A","B","C","D"].map(l => q.options.find(o => o.label === l)?.text || ""),
        correct: q.correct,
        audioUrl: q.audioUrl || "",
      })));
    } else {
      setEditQuestions([]);
    }

    // Pairs
    if (isPairs && exercise.Questions) {
      const parsedPairs = (exercise.Questions || "").split("|").map((item: string) => {
        const [left, right] = item.split("::");
        return { left: left?.trim() || "", right: right?.trim() || "" };
      }).filter((p: Pair) => p.left);
      setEditPairs(parsedPairs);
    } else {
      setEditPairs([]);
    }

    // Vocab
    const vocabList = exercise.Vocabulary
      ? exercise.Vocabulary.split("|").map((item: string) => {
          const [word, meaning] = item.split("::");
          return { word: word?.trim(), meaning: meaning?.trim() };
        }).filter((v: any) => v.word)
      : [];
    setEditVocab(vocabList);

    // Extra questions (essay)
    if (normalizedType === "essay") {
      const essayFromContent = contentParts.slice(1);
      const essayFromQuestions: string[] = exercise.Questions
        ? exercise.Questions.split("|").map((q: string) => q.trim()).filter(Boolean)
        : [];
      if (essayFromContent.length > 0) setEditExtraQs(essayFromContent);
      else if (essayFromQuestions.length > 0) setEditExtraQs(essayFromQuestions);
      else setEditExtraQs([]);
    }
  }, [exercise, normalizedType]);

  if (!exercise) return <p style={{ padding: 20 }}>Đang tải dữ liệu...</p>;

  return (
    <div className="ed-wrapper">
      <div className="back" onClick={() => navigate(-1)}>← Quay lại</div>

      {/* TITLE BAR */}
      <div className="exercise-header">
        <h1>{exercise.Title}</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="submissions-btn" onClick={() => navigate(`/danh-sach-bai-nop/${id}`)}>
            Danh sách bài nộp
          </button>
        </div>
      </div>

      {/* RENDER THE FORM DIRECTLY */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3>📝 Chi tiết bài tập ({exercise.Type})</h3>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>Tiêu đề</label>
          <input className="edit-textarea" value={editTitle} readOnly style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e0d8cc", fontSize: 14, background: "#f9f9f9" }} />
        </div>

        {/* MC / Listening questions */}
        {(normalizedType === "multiple" || normalizedType === "listening") && (
          <>
            {normalizedType === "listening" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>📖 Nội dung / đoạn văn</label>
                <textarea className="edit-textarea" value={editContent || "(Không có nội dung)"} readOnly rows={3} style={{ width: "100%", background: "#f9f9f9" }} />
              </div>
            )}
            {editQuestions.length === 0 ? (
              <p style={{ color: "#999", fontStyle: "italic", fontSize: "13px", padding: "10px 0" }}>
                (Không có câu hỏi trắc nghiệm nào trong bài tập này)
              </p>
            ) : (
              editQuestions.map((q, qi) => (
                <div key={qi} className="question-block" style={{ marginBottom: 16, padding: 14, background: "#fafafa", borderRadius: 10, border: "1px solid #f0e8dc" }}>
                  <div style={{ marginBottom: 8 }}>
                    <b style={{ color: "#5a3e2b" }}>Câu {qi + 1}</b>
                  </div>
                  <textarea className="edit-textarea" placeholder="Câu hỏi" value={q.question} readOnly
                    rows={2} style={{ width: "100%", marginBottom: 8, background: "#f9f9f9" }} />
                  {["A","B","C","D"].map((label, ai) => (
                    <input key={label} className="exercise-content" placeholder={`Đáp án ${label}`} value={q.answers[ai]} readOnly
                      style={{ width: "100%", marginBottom: 6, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13, background: "#f9f9f9" }} />
                  ))}
                  <select value={q.correct} disabled
                    style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13, marginTop: 4, background: "#f9f9f9", color: "#333" }}>
                    {["A","B","C","D"].map(l => <option key={l} value={l}>Đáp án đúng: {l}</option>)}
                  </select>
                </div>
              ))
            )}
          </>
        )}

        {/* Essay */}
        {normalizedType === "essay" && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>📖 Đoạn văn / Đề bài</label>
              <textarea className="edit-textarea" value={editContent || "(Không có đoạn văn)"} readOnly rows={4} style={{ width: "100%", background: "#f9f9f9" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>📚 Từ vựng</label>
              {editVocab.length === 0 ? (
                <p style={{ color: "#999", fontStyle: "italic", fontSize: "13px", padding: "5px 0" }}>
                  (Không có từ vựng)
                </p>
              ) : (
                editVocab.map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <input placeholder="Từ vựng" value={v.word} readOnly
                      style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13, background: "#f9f9f9" }} />
                    <input placeholder="Nghĩa" value={v.meaning} readOnly
                      style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13, background: "#f9f9f9" }} />
                  </div>
                ))
              )}
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>❓ Câu hỏi</label>
              {editExtraQs.length === 0 ? (
                <p style={{ color: "#999", fontStyle: "italic", fontSize: "13px", padding: "5px 0" }}>
                  (Không có câu hỏi tự luận nào)
                </p>
              ) : (
                editExtraQs.map((q, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <textarea placeholder={`Câu hỏi ${i + 1}`} value={q} readOnly
                      rows={2} style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13, resize: "vertical", background: "#f9f9f9" }} />
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Speaking */}
        {normalizedType === "speaking" && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>🎤 Chủ đề / Câu hỏi</label>
              <textarea className="edit-textarea" value={editContent || "(Không có chủ đề)"} readOnly rows={3} style={{ width: "100%", background: "#f9f9f9" }} />
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>🎯 Đáp án mẫu (máy chấm)</label>
              <textarea className="edit-textarea" value={editSpeakingAns || "(Không có đáp án mẫu)"} readOnly rows={3} style={{ width: "100%", background: "#f9f9f9" }} />
            </div>
          </>
        )}

        {/* Connect / Matching */}
        {isPairs && (
          <>
            <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 8 }}>
              {normalizedType === "matching" ? "🧩 Cặp ghép từ" : "🔗 Cặp nối từ"}
            </label>
            {editPairs.length === 0 ? (
              <p style={{ color: "#999", fontStyle: "italic", fontSize: "13px", padding: "10px 0" }}>
                (Không có cặp nối từ nào)
              </p>
            ) : (
              editPairs.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input placeholder="Từ / cụm từ" value={p.left} readOnly
                    style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13, background: "#f9f9f9" }} />
                  <input placeholder="Nghĩa / định nghĩa" value={p.right} readOnly
                    style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13, background: "#f9f9f9" }} />
                </div>
              ))
            )}
          </>
        )}

        {/* Ordering */}
        {normalizedType === "ordering" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>🔤 Các từ (cách nhau bằng dấu phẩy)</label>
            <textarea className="edit-textarea" value={editContent || "(Không có từ)"} readOnly rows={3} style={{ width: "100%", background: "#f9f9f9" }} />
          </div>
        )}

        {/* Vocabulary type */}
        {normalizedType === "vocabulary" && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>📝 Nội dung đề bài</label>
              <textarea className="edit-textarea" value={editContent || "(Không có nội dung)"} readOnly rows={2} style={{ width: "100%", background: "#f9f9f9" }} />
            </div>
            <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 8 }}>📚 Từ vựng</label>
            {editVocab.length === 0 ? (
              <p style={{ color: "#999", fontStyle: "italic", fontSize: "13px", padding: "10px 0" }}>
                (Không có từ vựng)
              </p>
            ) : (
              editVocab.map((v, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <input placeholder="Từ vựng" value={v.word} readOnly
                    style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13, background: "#f9f9f9" }} />
                  <input placeholder="Nghĩa" value={v.meaning} readOnly
                    style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13, background: "#f9f9f9" }} />
                </div>
              ))
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default ExerciseDetail;
