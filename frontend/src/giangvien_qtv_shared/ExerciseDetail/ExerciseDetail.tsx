import "./ExerciseDetail.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

interface Pair { left: string; right: string; }
interface MCQuestion { question: string; options: { label: string; text: string }[]; correct: string; audioUrl?: string; imageUrl?: string; }
interface Question {
  question: string;
  answers: string[];
  correct: string;
  audioUrl?: string;
  imageUrl?: string;
  prompt?: string;
  subQuestions?: any[];
}

const mapDangBaiToType = (db: string): string => {
  if (!db) return "Tổng hợp";
  const dbClean = db.trim();
  if (dbClean === "Nghe audio trắc nghiệm") return "Nghe audio trắc nghiệm";
  if (dbClean === "Hình ảnh chọn đáp án") return "Hình ảnh chọn đáp án";
  if (dbClean === "Nghe chép chính tả") return "Nghe chép chính tả";
  if (dbClean === "Điền từ vào đoạn văn") return "Điền từ vào đoạn văn";
  if (dbClean === "Luyện phát âm (check phát âm tự động)") return "Luyện phát âm (check phát âm tự động)";
  if (dbClean === "Nói theo chủ đề (ghi âm nộp GV)") return "Nói theo chủ đề (ghi âm nộp GV)";
  if (dbClean === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") return "Trắc nghiệm đọc hiểu (chia đôi màn hình)";
  if (dbClean === "Bài tập từ vựng" || dbClean === "Nối từ") return "Nối từ";
  if (dbClean === "Sắp xếp từ thành câu") return "Sắp xếp từ thành câu";
  if (dbClean === "Tìm lỗi sai") return "Tìm lỗi sai";
  if (dbClean === "Trắc nghiệm xác định thì" || dbClean === "Trắc nghiệm") return "Trắc nghiệm";
  if (dbClean === "Viết đoạn văn ngắn") return "Viết đoạn văn ngắn";
  if (dbClean === "Sắp xếp câu thành đoạn văn") return "Sắp xếp câu thành đoạn văn";
  return dbClean;
};

const ExerciseDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isQTV = location.pathname.startsWith("/QTV");

  const [exercise, setExercise] = useState<any>(null);


  const [editContent,     setEditContent]     = useState("");
  const [editQuestions,   setEditQuestions]   = useState<Question[]>([]);
  const [editPairs,       setEditPairs]       = useState<Pair[]>([]);
  const [editVocab,       setEditVocab]       = useState<{ word: string; meaning: string }[]>([]);
  const [editExtraQs,     setEditExtraQs]     = useState<string[]>([]);
  const [editSpeakingAns, setEditSpeakingAns] = useState("");
  const [editReadingSplit, setEditReadingSplit] = useState<any[]>([]);
  const [editFillIn,       setEditFillIn]       = useState<any[]>([]);

  /* ===== NORMALIZE TYPE ===== */
  const exType = (exercise?.Type || "").toLowerCase();
  const normalizedType: string =
    ["writing", "reading", "essay", "Viết đoạn văn ngắn", "Nghe chép chính tả", "Luyện phát âm (check phát âm tự động)", "Sắp xếp từ thành câu", "Sắp xếp câu thành đoạn văn"].includes(exType) ? "essay" :
    ["Tổng hợp", "quiz", "trắc nghiệm", "Trắc nghiệm", "Nối từ"].includes(exType) ? "Tổng hợp" :
    ["listening", "nghe", "Nghe audio trắc nghiệm", "Hình ảnh chọn đáp án"].includes(exType) ? "listening" :
    ["matching", "ghép"].includes(exType)                ? "matching"   :
    ["connect", "nối"].includes(exType)                  ? "connect"    :
    ["ordering", "sắp xếp"].includes(exType)             ? "ordering"   :
    ["speaking", "nói", "Nói theo chủ đề (ghi âm nộp GV)"].includes(exType) ? "speaking" :
    ["Trắc nghiệm đọc hiểu (chia đôi màn hình)"].includes(exType)                    ? "Trắc nghiệm đọc hiểu (chia đôi màn hình)" :
    ["Điền từ vào đoạn văn"].includes(exType)                ? "Điền từ vào đoạn văn" :
    ["vocabulary", "từ vựng", "vocab"].includes(exType)  ? "vocabulary" :
    exType;

  const isPairs = normalizedType === "connect" || normalizedType === "matching";
  const isMC = normalizedType === "Tổng hợp" || normalizedType === "listening";

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
            audioUrl: q.audioUrl || "",
            imageUrl: q.imageUrl || ""
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
    fetch(`http://14.225.192.252:5000/baitap/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.Type) {
          data.Type = mapDangBaiToType(data.Type);
        }
        setExercise(data);
      })
      .catch(console.log);
  }, [id]);

  useEffect(() => {
    if (!exercise) return;


    let mainContent = "";
    if (exercise.Content) {
      if (exercise.Content.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(exercise.Content);
          mainContent = parsed.description || "";
        } catch (e) {
          mainContent = exercise.Content;
        }
      } else {
        const contentParts: string[] = exercise.Content.split("\n---\n").map((s: string) => s.trim()).filter(Boolean);
        mainContent = contentParts[0] || "";
      }
    }
    setEditContent(mainContent);

    // Speaking topic
    let speakingAns = "";
    if (normalizedType === "speaking") {
      if (exercise.Questions) {
        if (exercise.Questions.trim().startsWith("[")) {
          try {
            const parsed = JSON.parse(exercise.Questions);
            if (Array.isArray(parsed)) {
              speakingAns = parsed.map(q => q.prompt || q.question || "").join("\n");
            }
          } catch (e) {}
        } else {
          speakingAns = exercise.Questions;
        }
      }
    }
    setEditSpeakingAns(speakingAns);

    // MC questions
    if (isMC && exercise.Questions) {
      if (exercise.Questions.trim().startsWith("[")) {
        try {
          const parsed = JSON.parse(exercise.Questions);
          if (Array.isArray(parsed)) {
            setEditQuestions(parsed.map((q: any) => ({
              question: q.question || "",
              answers: q.answers || [],
              correct: q.correct || "A",
              audioUrl: q.audioUrl || "",
              imageUrl: q.imageUrl || "",
              prompt: q.prompt || "",
              subQuestions: q.subQuestions || []
            })));
          } else {
            setEditQuestions([]);
          }
        } catch (e) {
          console.error("Failed to parse MCQuestions JSON", e);
          setEditQuestions([]);
        }
      } else {
        const mcQs = parseMCQuestions(exercise.Questions);
        setEditQuestions(mcQs.map(q => ({
          question: q.question,
          answers: ["A","B","C","D"].map(l => q.options.find(o => o.label === l)?.text || ""),
          correct: q.correct,
          audioUrl: q.audioUrl || "",
          imageUrl: q.imageUrl || "",
          prompt: "",
          subQuestions: []
        })));
      }
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

    // Extra questions (essay/dictation/pronounce/order words/sentences)
    if (normalizedType === "essay") {
      const contentParts: string[] = exercise.Content?.split("\n---\n").map((s: string) => s.trim()).filter(Boolean) || [];
      const essayFromContent = contentParts.slice(1);
      let essayFromQuestions: string[] = [];
      if (exercise.Questions) {
        if (exercise.Questions.trim().startsWith("[")) {
          try {
            const parsed = JSON.parse(exercise.Questions);
            if (Array.isArray(parsed)) {
              if (exercise.Type === "Nghe chép chính tả" || exercise.Type === "Luyện phát âm (check phát âm tự động)") {
                essayFromQuestions = parsed.map(q => q.text || q.question || "");
              } else if (exercise.Type === "Sắp xếp từ thành câu") {
                essayFromQuestions = parsed.map(q => q.correctSentence || q.question || "");
              } else if (exercise.Type === "Sắp xếp câu thành đoạn văn") {
                essayFromQuestions = parsed.map(q => (q.sentences || []).filter(Boolean).join(" / "));
              } else {
                essayFromQuestions = parsed.map(q => q.question || "");
              }
            }
          } catch (e) {}
        } else {
          essayFromQuestions = exercise.Questions.split("|").map((q: string) => q.trim()).filter(Boolean);
        }
      }
      if (essayFromContent.length > 0) setEditExtraQs(essayFromContent);
      else if (essayFromQuestions.length > 0) setEditExtraQs(essayFromQuestions);
      else setEditExtraQs([]);
    }

    // Reading split
    if (normalizedType === "Trắc nghiệm đọc hiểu (chia đôi màn hình)" && exercise.Questions) {
      try {
        const parsed = JSON.parse(exercise.Questions);
        if (Array.isArray(parsed)) setEditReadingSplit(parsed);
        else setEditReadingSplit([]);
      } catch (e) {
        setEditReadingSplit([]);
      }
    } else {
      setEditReadingSplit([]);
    }

    // Listening fill in
    if (normalizedType === "Điền từ vào đoạn văn" && exercise.Questions) {
      try {
        const parsed = JSON.parse(exercise.Questions);
        if (Array.isArray(parsed)) setEditFillIn(parsed);
        else setEditFillIn([]);
      } catch (e) {
        setEditFillIn([]);
      }
    } else {
      setEditFillIn([]);
    }
  }, [exercise, normalizedType]);

  if (!exercise) return <p style={{ padding: 20 }}>Đang tải dữ liệu...</p>;

  return (
    <div className="ed-wrapper" style={isQTV ? { maxWidth: "1200px", margin: "0 auto", padding: "24px 32px 32px 32px", boxSizing: "border-box" } : undefined}>
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
      <div className="exercise-detail-card">

        {/* Section Audio Player */}
        {exercise.AudioUrl && (
          <div style={{ padding: "12px", background: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd" }}>
            <label style={{ fontWeight: 600, fontSize: "13px", color: "#0369a1", display: "block", marginBottom: "6px" }}>File nghe chung cho phần này</label>
            <audio src={exercise.AudioUrl.startsWith("http") || exercise.AudioUrl.startsWith("/uploads") ? (exercise.AudioUrl.startsWith("http") ? exercise.AudioUrl : `http://14.225.192.252:5000${exercise.AudioUrl}`) : `http://14.225.192.252:5000/uploads/${exercise.AudioUrl}`} controls style={{ width: "100%", height: "35px" }} />
          </div>
        )}

        {/* Passage / Content / Instructions */}
        {editContent && editContent.trim() !== "" && (
          <div style={{
            padding: "16px 20px",
            background: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            borderLeft: "4px solid #000080",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            marginBottom: "16px"
          }}>
            <label style={{
              fontWeight: 700,
              fontSize: "12px",
              color: "#000080",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "block",
              marginBottom: "8px"
            }}>
              Đề bài
            </label>
            <div style={{
              fontSize: "14px",
              color: "#334155",
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
              fontFamily: "inherit"
            }}>
              {editContent}
            </div>
          </div>
        )}

        {/* MC / Listening questions */}
        {(normalizedType === "Tổng hợp" || normalizedType === "listening") && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {editQuestions.length === 0 ? (
              <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>
                (Không có câu hỏi trắc nghiệm nào trong bài tập này)
              </p>
            ) : (
              editQuestions.map((q, qi) => {
                const isAudioOnlyMC = exType === "Hình ảnh chọn đáp án" || exType === "Nghe audio trắc nghiệm";
                const hasAnswers = q.answers && q.answers.some(a => a && a.trim() !== "");
                const isFlatMC = exType === "Hình ảnh chọn đáp án" || exType === "Trắc nghiệm";
                const hasSubQuestions = !isFlatMC && q.subQuestions && q.subQuestions.length > 0;
                return (
                  <div key={qi} style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    {/* Parent prompt / context (if any) */}
                    {q.prompt && (
                      <div style={{ background: "#fff3e0", padding: "10px", borderRadius: "8px", marginBottom: "10px", fontSize: "13px", fontWeight: "600" }} dangerouslySetInnerHTML={{ __html: q.prompt }} />
                    )}

                    {/* Question audio / image (if any) */}
                    {q.audioUrl && (
                      <div style={{ marginBottom: "8px" }}>
                        <audio src={q.audioUrl.startsWith("http") || q.audioUrl.startsWith("/uploads") ? (q.audioUrl.startsWith("http") ? q.audioUrl : `http://14.225.192.252:5000${q.audioUrl}`) : `http://14.225.192.252:5000/uploads/${q.audioUrl}`} controls style={{ width: "100%", height: "32px" }} />
                      </div>
                    )}
                    {q.imageUrl && (
                      <div style={{ marginBottom: "8px" }}>
                        <img src={q.imageUrl.startsWith("http") || q.imageUrl.startsWith("/uploads") ? (q.imageUrl.startsWith("http") ? q.imageUrl : `http://14.225.192.252:5000${q.imageUrl}`) : `http://14.225.192.252:5000/uploads/${q.imageUrl}`} alt="Question visual" style={{ maxHeight: "150px", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
                      </div>
                    )}

                    {/* Render subquestions if present */}
                    {hasSubQuestions ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                        {q.subQuestions!.map((sub: any, subIdx: number) => {
                          const hasSubAnswers = sub.answers && sub.answers.some((a: string) => a && a.trim() !== "");
                          return (
                            <div key={subIdx} style={{ background: "#ffffff", padding: "12px", border: "1px solid #cbd5e1", borderLeft: "4px solid #000080", borderRadius: "8px" }}>
                              <div style={{ fontWeight: 600, fontSize: "13px", color: "#000080", marginBottom: "6px" }}>
                                Câu {qi + 1}.{subIdx + 1}: {sub.question || "(Chưa nhập câu hỏi)"}
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" }}>
                                {["A", "B", "C", "D"].map((lbl) => {
                                  const isCorrect = sub.correct === lbl;
                                  const choiceIndex = ["A", "B", "C", "D"].indexOf(lbl);
                                  return (
                                    <div key={lbl} style={{ fontSize: "12px", color: isCorrect ? "#107544" : "#475569", fontWeight: isCorrect ? 600 : 400, display: "flex", gap: "4px" }}>
                                      <span style={{ color: isCorrect ? "#107544" : "#94a3b8" }}>{lbl}.</span>
                                      {(!isAudioOnlyMC || hasSubAnswers) ? (
                                        <span>{sub.answers?.[choiceIndex] || "(Trống)"}</span>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                              {sub.explanation && (
                                <div style={{ fontSize: "11.5px", color: "#64748b", fontStyle: "italic", marginTop: "6px", background: "#f8fafc", padding: "6px 8px", borderRadius: "4px" }}>
                                  Giải thích: {sub.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Flat/Standard question layout */
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#1e293b", marginBottom: "8px" }}>
                          Câu {qi + 1}{q.question ? `: ${q.question}` : (isAudioOnlyMC ? "" : " : (Chưa nhập câu hỏi)")}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
                          {["A","B","C","D"].map((label, ai) => {
                            const isCorrect = q.correct === label;
                            return (
                              <div key={label} style={{ fontSize: "12.5px", color: isCorrect ? "#107544" : "#475569", fontWeight: isCorrect ? 600 : 400, display: "flex", gap: "4px" }}>
                                <span style={{ color: isCorrect ? "#107544" : "#94a3b8" }}>{label}.</span>
                                {(!isAudioOnlyMC || hasAnswers) ? (
                                  <span>{q.answers[ai] || "(Trống)"}</span>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Essay */}
        {normalizedType === "essay" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {editVocab.length > 0 && (
              <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#000080", marginBottom: "8px" }}>Từ vựng</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {editVocab.map((v, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                      <span style={{ flex: 1, fontSize: "13px", fontWeight: 600 }}>{v.word}</span>
                      <span style={{ flex: 2, fontSize: "13px", color: "#475569" }}>{v.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {editExtraQs.length === 0 ? (
                <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>
                  (Không có câu hỏi tự luận nào)
                </p>
              ) : (
                editExtraQs.map((q, i) => (
                  <div key={i} style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#1e293b" }}>
                      Câu {i + 1}: {q || "(Trống)"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Speaking */}
        {normalizedType === "speaking" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {editSpeakingAns && (
              <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#107544", marginBottom: "6px" }}>
                  Đáp án mẫu / Gợi ý
                </div>
                <div style={{ fontSize: "13px", color: "#334155", whiteSpace: "pre-wrap" }}>
                  {editSpeakingAns}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Connect / Matching */}
        {isPairs && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {editPairs.length === 0 ? (
              <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>
                (Không có cặp nối từ nào)
              </p>
            ) : (
              editPairs.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                  <div style={{ flex: 1, fontSize: "13px", color: "#1e293b" }}>
                    <strong>Từ / Cụm từ:</strong> {p.left}
                  </div>
                  <div style={{ flex: 1, fontSize: "13px", color: "#107544", fontWeight: 500 }}>
                    <strong>Nghĩa / Định nghĩa:</strong> {p.right}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Ordering */}
        {normalizedType === "ordering" && (
          <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
            <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#1e293b" }}>
              Các từ cần sắp xếp
            </div>
            <div style={{ fontSize: "13.5px", color: "#475569", marginTop: "8px" }}>
              {editContent || "(Không có từ)"}
            </div>
          </div>
        )}

        {/* Vocabulary type */}
        {normalizedType === "vocabulary" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {editVocab.length > 0 && (
              <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#107544", marginBottom: "8px" }}>
                  Danh sách từ vựng
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {editVocab.map((v, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                      <span style={{ flex: 1, fontSize: "13px", fontWeight: 600 }}>{v.word}</span>
                      <span style={{ flex: 2, fontSize: "13px", color: "#475569" }}>{v.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reading Split */}
        {normalizedType === "Trắc nghiệm đọc hiểu (chia đôi màn hình)" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {editReadingSplit.length === 0 ? (
              <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>
                (Không có câu hỏi đọc hiểu nào)
              </p>
            ) : (
              editReadingSplit.map((group, gi) => (
                <div key={gi} style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                  <div style={{ marginBottom: "14px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "10px" }}>
                    <h4 style={{ color: "#0f172a", fontSize: "14px", fontWeight: 700, margin: "0 0 8px 0" }}>Nhóm bài đọc {gi + 1}</h4>
                    {group.imageUrl && (
                      <div style={{ marginBottom: "10px" }}>
                        <img src={group.imageUrl.startsWith("http") || group.imageUrl.startsWith("/uploads") ? (group.imageUrl.startsWith("http") ? group.imageUrl : `http://14.225.192.252:5000${group.imageUrl}`) : `http://14.225.192.252:5000/uploads/${group.imageUrl}`} alt="Passage visual" style={{ maxHeight: "200px", borderRadius: "8px" }} />
                      </div>
                    )}
                    <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-wrap", background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      {group.text || "(Không có bài đọc)"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {(group.subQuestions || []).map((sub: any, si: number) => (
                      <div key={si} style={{ background: "#ffffff", padding: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #000080", borderRadius: "8px" }}>
                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#000080", marginBottom: "6px" }}>
                          Câu {si + 1}: {sub.question}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" }}>
                          {["A", "B", "C", "D"].map((lbl) => {
                            const isCorrect = sub.correct === lbl;
                            const choiceIndex = ["A", "B", "C", "D"].indexOf(lbl);
                            return (
                              <div key={lbl} style={{ fontSize: "12px", color: isCorrect ? "#107544" : "#475569", fontWeight: isCorrect ? 600 : 400 }}>
                                <strong>{lbl}.</strong> {sub.answers?.[choiceIndex] || ""}
                              </div>
                            );
                          })}
                        </div>
                        {sub.explanation && (
                          <div style={{ fontSize: "11.5px", color: "#64748b", fontStyle: "italic", marginTop: "6px", background: "#f8fafc", padding: "6px 8px", borderRadius: "4px" }}>
                            Giải thích: {sub.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Listening Fill In */}
        {normalizedType === "Điền từ vào đoạn văn" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {editFillIn.length === 0 ? (
              <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>
                (Không có câu hỏi điền từ nào)
              </p>
            ) : (
              editFillIn.map((group, gi) => (
                <div key={gi} style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <h4 style={{ color: "#0f172a", fontSize: "14px", fontWeight: 700, margin: "0 0 6px 0" }}>Nhóm điền từ {gi + 1}</h4>
                    <div style={{ padding: "12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", lineHeight: "1.6" }}>
                      {group.text || "(Không có nội dung)"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {(group.fillInAnswers || []).map((ans: string, ai: number) => (
                      <div key={ai} style={{ background: "#f0f9ff", border: "1px solid #bae6fd", padding: "6px 12px", borderRadius: "6px", fontSize: "12.5px", color: "#0369a1", fontWeight: 500 }}>
                        Ô trống {ai + 1}: <strong>{ans}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ExerciseDetail;

