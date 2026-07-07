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
  const [examSections,     setExamSections]     = useState<any[]>([]);

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

    // Exam sections
    if (exercise.IsExam === 1 || (exercise.Type || "").toLowerCase() === "exam") {
      if (exercise.Content) {
        try {
          const parsed = JSON.parse(exercise.Content);
          if (parsed && Array.isArray(parsed.sections)) {
            setExamSections(parsed.sections);
          } else {
            setExamSections([]);
          }
        } catch (e) {
          console.error("Failed to parse exam content", e);
          setExamSections([]);
        }
      } else {
        setExamSections([]);
      }
    } else {
      setExamSections([]);
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

        {(exercise.IsExam === 1 || (exercise.Type || "").toLowerCase() === "exam") ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {examSections.length === 0 ? (
              <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>
                (Không có phần thi nào trong đề thi này)
              </p>
            ) : (
              examSections.map((sec, secIdx) => {
                const secType = (sec.type || "").toLowerCase();
                const normalizedSecType =
                  ["writing", "reading", "essay", "writing-essay", "listening-dictation", "speaking-pronounce", "writing-order-words", "writing-order-sentences"].includes(secType) ? "essay" :
                  ["multiple", "quiz", "trắc nghiệm", "writing-tense-mcq", "reading-vocab-mcq"].includes(secType) ? "multiple" :
                  ["listening", "nghe", "listening-mcq", "listening-image"].includes(secType) ? "listening" :
                  ["matching", "ghép"].includes(secType)                ? "matching"   :
                  ["connect", "nối"].includes(secType)                  ? "connect"    :
                  ["ordering", "sắp xếp"].includes(secType)             ? "ordering"   :
                  ["speaking", "nói", "speaking-topic"].includes(secType) ? "speaking" :
                  ["reading-split"].includes(secType)                    ? "reading-split" :
                  ["listening-fill-in"].includes(secType)                ? "listening-fill-in" :
                  ["vocabulary", "từ vựng", "vocab"].includes(secType)  ? "vocabulary" :
                  secType;

                return (
                  <div key={secIdx} style={{
                    padding: "20px",
                    background: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  }}>
                    {/* Section Header */}
                    <div style={{
                      paddingBottom: "10px",
                      borderBottom: "2px solid #f1f5f9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#000080" }}>
                        {sec.title || `Phần ${secIdx + 1}`}
                      </h3>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        background: "#e0f2fe",
                        borderRadius: "20px",
                        color: "#0369a1",
                        textTransform: "uppercase"
                      }}>
                        {sec.type}
                      </span>
                    </div>

                    {/* Section Audio */}
                    {sec.audioUrl && (
                      <div style={{ padding: "10px", background: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                        <label style={{ fontWeight: 600, fontSize: "12px", color: "#0369a1", display: "block", marginBottom: "4px" }}>
                          File nghe của phần này
                        </label>
                        <audio src={sec.audioUrl.startsWith("http") || sec.audioUrl.startsWith("/uploads") ? (sec.audioUrl.startsWith("http") ? sec.audioUrl : `http://14.225.192.252:5000${sec.audioUrl}`) : `http://14.225.192.252:5000/uploads/${sec.audioUrl}`} controls style={{ width: "100%", height: "32px" }} />
                      </div>
                    )}

                    {/* Section Image */}
                    {sec.imageUrl && (
                      <div style={{ textAlign: "center" }}>
                        <img src={sec.imageUrl.startsWith("http") || sec.imageUrl.startsWith("/uploads") ? (sec.imageUrl.startsWith("http") ? sec.imageUrl : `http://14.225.192.252:5000${sec.imageUrl}`) : `http://14.225.192.252:5000/uploads/${sec.imageUrl}`} alt="Section visual" style={{ maxHeight: "250px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                      </div>
                    )}

                    {/* Section Description / Content */}
                    {sec.content && sec.content.trim() !== "" && (
                      <div style={{
                        padding: "12px 16px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        borderLeft: "4px solid #000080",
                        fontSize: "13.5px",
                        color: "#334155",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap"
                      }}>
                        {sec.content}
                      </div>
                    )}

                    {/* Section Questions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {sec.questions && sec.questions.map((q: any, qi: number) => {
                        const hasAnswers = q.answers && q.answers.some((a: string) => a && a.trim() !== "");
                        const isFlatMC = sec.type === "Hình ảnh chọn đáp án" || sec.type === "Trắc nghiệm";
                        const hasSubQuestions = !isFlatMC && q.subQuestions && q.subQuestions.length > 0;
                        const isAudioOnlyMC = sec.type === "Hình ảnh chọn đáp án" || sec.type === "Nghe audio trắc nghiệm";

                        return (
                          <div key={qi} style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                            {/* Question prompt (if any) */}
                            {q.prompt && (
                              <div style={{ background: "#fff3e0", padding: "10px", borderRadius: "8px", marginBottom: "10px", fontSize: "13px", fontWeight: "600" }} dangerouslySetInnerHTML={{ __html: q.prompt }} />
                            )}

                            {/* Question audio / image */}
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

                            {/* Subquestions or Standard Question */}
                            {hasSubQuestions ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                                {q.subQuestions.map((sub: any, subIdx: number) => {
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
                              <div>
                                <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#1e293b", marginBottom: "8px" }}>
                                  Câu {qi + 1}{q.question ? `: ${q.question}` : (isAudioOnlyMC ? "" : " : (Chưa nhập câu hỏi)")}
                                </div>
                                {sec.type === "Viết đoạn văn ngắn" || sec.type === "Nói theo chủ đề (ghi âm nộp GV)" ? (
                                  <div style={{ fontSize: "13px", color: "#475569", fontStyle: "italic" }}>
                                    (Phần tự luận học sinh tự viết/nói)
                                  </div>
                                ) : sec.type === "Điền từ vào đoạn văn" ? (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {(q.fillInAnswers || []).map((ans: string, ai: number) => (
                                      <span key={ai} style={{ background: "#f0f9ff", border: "1px solid #bae6fd", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", color: "#0369a1" }}>
                                        Ô {ai + 1}: {ans}
                                      </span>
                                    ))}
                                  </div>
                                ) : sec.type === "Nối từ" ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    {(q.vocabPairs || []).map((p: any, pi: number) => (
                                      <div key={pi} style={{ fontSize: "12.5px" }}>
                                        {p.word} ➔ {p.meaning}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
                                    {["A", "B", "C", "D"].map((label, ai) => {
                                      const isCorrect = q.correct === label;
                                      return (
                                        <div key={label} style={{ fontSize: "12.5px", color: isCorrect ? "#107544" : "#475569", fontWeight: isCorrect ? 600 : 400, display: "flex", gap: "4px" }}>
                                          <span style={{ color: isCorrect ? "#107544" : "#94a3b8" }}>{label}.</span>
                                          {(!isAudioOnlyMC || hasAnswers) ? (
                                            <span>{q.answers?.[ai] || "(Trống)"}</span>
                                          ) : null}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
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

