import "./exerciseDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

interface Pair { left: string; right: string; }
interface MCQuestion { question: string; options: { label: string; text: string }[]; correct: string; }
interface Question { question: string; answers: string[]; correct: string; }

const ExerciseDetail = () => {
  const navigate = useNavigate();
  const { id, lessonId } = useParams();

  const [exercise, setExercise]       = useState<any>(null);
  const [lesson, setLesson]           = useState<any>(null);
  const [isEdit, setIsEdit]           = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [teacherName, setTeacherName] = useState<string>("Đang tải...");

  // Edit states — giống CreateExercise
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
    ["listening", "nghe"].includes(exType)               ? "listening"  :
    ["matching", "ghép"].includes(exType)                ? "matching"   :
    ["connect", "nối"].includes(exType)                  ? "connect"    :
    ["ordering", "sắp xếp"].includes(exType)             ? "ordering"   :
    ["speaking", "nói"].includes(exType)                 ? "speaking"   :
    ["vocabulary", "từ vựng", "vocab"].includes(exType)  ? "vocabulary" :
    exType;

  /* ===== PARSE VOCABULARY ===== */
  const vocabularyList = exercise?.Vocabulary
    ? exercise.Vocabulary.split("|").map((item: string) => {
        const [word, meaning] = item.split("::");
        return { word: word?.trim(), meaning: meaning?.trim() };
      }).filter((v: any) => v.word)
    : [];

  /* ===== PARSE CONTENT PARTS ===== */
  const contentParts: string[] = exercise?.Content
    ? exercise.Content.split("\n---\n").map((s: string) => s.trim()).filter(Boolean)
    : [];
  const mainContent = contentParts[0] || "";
  const essayFromContent = contentParts.slice(1);
  const essayFromQuestions: string[] = exercise?.Questions
    ? exercise.Questions.split("|").map((q: string) => q.trim()).filter(Boolean)
    : [];
  const essayQuestions = (normalizedType === "essay") && essayFromContent.length === 0
    ? essayFromQuestions : essayFromContent;

  const isPairs = normalizedType === "connect" || normalizedType === "matching";
  const pairs: Pair[] = isPairs
    ? (exercise?.Questions || "").split("|").map((item: string) => {
        const [left, right] = item.split("::");
        return { left: left?.trim() || "", right: right?.trim() || "" };
      }).filter((p: Pair) => p.left)
    : [];

  const isMC = normalizedType === "multiple" || normalizedType === "listening";
  const parseMCQuestions = (raw: string): MCQuestion[] => {
    if (!raw) return [];
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
  const mcQuestions: MCQuestion[] = isMC ? parseMCQuestions(exercise?.Questions || "") : [];
  const orderingItems: string[] = normalizedType === "ordering"
    ? (exercise?.Questions || "").split("|").map((s: string) => s.trim()).filter(Boolean) : [];

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    if (!lessonId) return;
    fetch(`http://localhost:5000/lesson/${lessonId}`).then(r => r.json()).then(setLesson).catch(console.log);
  }, [lessonId]);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/exercise/${id}`).then(r => r.json()).then(setExercise).catch(console.log);
  }, [id]);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (user?.MaNguoiDung) {
      fetch(`http://localhost:5000/giangvien/${user.MaNguoiDung}`)
        .then(r => r.json()).then(d => setTeacherName(d?.HoTen || "Giảng viên")).catch(() => setTeacherName("Giảng viên"));
    }
  }, []);

  /* ===== INIT EDIT STATE ===== */
  const openEdit = () => {
    setEditTitle(exercise.Title || "");
    setEditContent(mainContent);
    setEditSpeakingAns(normalizedType === "speaking" ? (exercise.Questions || "") : "");

    // MC questions
    if (isMC && mcQuestions.length > 0) {
      setEditQuestions(mcQuestions.map(q => ({
        question: q.question,
        answers: ["A","B","C","D"].map(l => q.options.find(o => o.label === l)?.text || ""),
        correct: q.correct,
      })));
    } else {
      setEditQuestions([{ question: "", answers: ["","","",""], correct: "A" }]);
    }

    // Pairs
    if (isPairs && pairs.length > 0) setEditPairs(pairs);
    else setEditPairs([{ left: "", right: "" }]);

    // Vocab
    if (vocabularyList.length > 0) setEditVocab(vocabularyList.map((v: any) => ({ word: v.word, meaning: v.meaning })));
    else setEditVocab([{ word: "", meaning: "" }]);

    // Extra questions (essay)
    if (normalizedType === "essay") {
      if (essayFromContent.length > 0) setEditExtraQs(essayFromContent);
      else if (essayFromQuestions.length > 0) setEditExtraQs(essayFromQuestions);
      else setEditExtraQs([]);
    }

    setIsEdit(true);
  };

  /* ===== SAVE ===== */
  const handleSave = async () => {
    let content = "";
    let questionsStr = "";
    let vocabularyStr = "";

    if (normalizedType === "multiple" || normalizedType === "listening") {
      questionsStr = editQuestions.map(q => {
        const ans = q.answers.map((a, i) => `${["A","B","C","D"][i]}. ${a}`).join("|");
        return `${q.question}||${ans}|Đáp án đúng: ${q.correct}`;
      }).join("###");
      content = editContent;
    }
    if (normalizedType === "essay") {
      content = editExtraQs.length > 0
        ? [editContent, ...editExtraQs].join("\n---\n")
        : editContent;
      vocabularyStr = editVocab.filter(v => v.word.trim()).map(v => `${v.word.trim()}::${v.meaning.trim()}`).join("|");
    }
    if (normalizedType === "speaking") {
      content = editContent;
      questionsStr = editSpeakingAns;
    }
    if (isPairs) {
      questionsStr = editPairs.map(p => `${p.left}::${p.right}`).join("|");
    }
    if (normalizedType === "ordering") {
      content = editContent;
    }
    if (normalizedType === "vocabulary") {
      vocabularyStr = editVocab.filter(v => v.word.trim()).map(v => `${v.word.trim()}::${v.meaning.trim()}`).join("|");
      content = editContent;
    }

    await fetch(`http://localhost:5000/exercise/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Title: editTitle, Content: content, Questions: questionsStr, Vocabulary: vocabularyStr }),
    });

    // Reload exercise
    const updated = await fetch(`http://localhost:5000/exercise/${id}`).then(r => r.json());
    setExercise(updated);
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); setIsEdit(false); }, 2000);
  };

  if (!lesson || !exercise) return <p style={{ padding: 20 }}>Đang tải dữ liệu...</p>;

  /* ===== EDIT FORM ===== */
  const renderEditForm = () => (
    <div className="card" style={{ marginTop: 16 }}>
      <h3>✏️ Chỉnh sửa bài tập</h3>

      {/* Title */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>Tiêu đề</label>
        <input className="edit-textarea" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e0d8cc", fontSize: 14 }} />
      </div>

      {/* MC / Listening questions */}
      {(normalizedType === "multiple" || normalizedType === "listening") && (
        <>
          {normalizedType === "listening" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>📖 Nội dung / đoạn văn</label>
              <textarea className="edit-textarea" value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} style={{ width: "100%" }} />
            </div>
          )}
          {editQuestions.map((q, qi) => (
            <div key={qi} className="question-block" style={{ marginBottom: 16, padding: 14, background: "#fafafa", borderRadius: 10, border: "1px solid #f0e8dc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <b style={{ color: "#5a3e2b" }}>Câu {qi + 1}</b>
                {editQuestions.length > 1 && (
                  <button onClick={() => setEditQuestions(editQuestions.filter((_,i) => i !== qi))}
                    style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 13 }}>✕ Xóa</button>
                )}
              </div>
              <textarea className="edit-textarea" placeholder="Câu hỏi" value={q.question}
                onChange={e => { const u = [...editQuestions]; u[qi].question = e.target.value; setEditQuestions(u); }}
                rows={2} style={{ width: "100%", marginBottom: 8 }} />
              {["A","B","C","D"].map((label, ai) => (
                <input key={label} className="exercise-content" placeholder={`Đáp án ${label}`} value={q.answers[ai]}
                  onChange={e => { const u = [...editQuestions]; u[qi].answers[ai] = e.target.value; setEditQuestions(u); }}
                  style={{ width: "100%", marginBottom: 6, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13 }} />
              ))}
              <select value={q.correct} onChange={e => { const u = [...editQuestions]; u[qi].correct = e.target.value; setEditQuestions(u); }}
                style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13, marginTop: 4 }}>
                {["A","B","C","D"].map(l => <option key={l} value={l}>Đáp án đúng: {l}</option>)}
              </select>
            </div>
          ))}
          <div className="add-content" onClick={() => setEditQuestions([...editQuestions, { question: "", answers: ["","","",""], correct: "A" }])}>
            + Thêm câu hỏi
          </div>
        </>
      )}

      {/* Essay */}
      {normalizedType === "essay" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>📖 Đoạn văn / Đề bài</label>
            <textarea className="edit-textarea" value={editContent} onChange={e => setEditContent(e.target.value)} rows={4} style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>📚 Từ vựng</label>
            {editVocab.map((v, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <input placeholder="Từ vựng" value={v.word} onChange={e => { const u = [...editVocab]; u[i].word = e.target.value; setEditVocab(u); }}
                  style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13 }} />
                <input placeholder="Nghĩa" value={v.meaning} onChange={e => { const u = [...editVocab]; u[i].meaning = e.target.value; setEditVocab(u); }}
                  style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13 }} />
                {editVocab.length > 1 && <button onClick={() => setEditVocab(editVocab.filter((_,idx) => idx !== i))}
                  style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>✕</button>}
              </div>
            ))}
            <div className="add-content" onClick={() => setEditVocab([...editVocab, { word: "", meaning: "" }])}>+ Thêm từ vựng</div>
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>❓ Câu hỏi</label>
            {editExtraQs.map((q, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <textarea placeholder={`Câu hỏi ${i + 1}`} value={q}
                  onChange={e => { const u = [...editExtraQs]; u[i] = e.target.value; setEditExtraQs(u); }}
                  rows={2} style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13, resize: "vertical" }} />
                <button onClick={() => setEditExtraQs(editExtraQs.filter((_,idx) => idx !== i))}
                  style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>✕</button>
              </div>
            ))}
            <div className="add-content" onClick={() => setEditExtraQs([...editExtraQs, ""])}>+ Thêm câu hỏi</div>
          </div>
        </>
      )}

      {/* Speaking */}
      {normalizedType === "speaking" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>🎤 Chủ đề / Câu hỏi</label>
            <textarea className="edit-textarea" value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>🎯 Đáp án mẫu (máy chấm)</label>
            <textarea className="edit-textarea" value={editSpeakingAns} onChange={e => setEditSpeakingAns(e.target.value)} rows={3} style={{ width: "100%" }} placeholder="Câu học viên cần đọc đúng..." />
          </div>
        </>
      )}

      {/* Connect / Matching */}
      {isPairs && (
        <>
          <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 8 }}>
            {normalizedType === "matching" ? "🧩 Cặp ghép từ" : "🔗 Cặp nối từ"}
          </label>
          {editPairs.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input placeholder="Từ / cụm từ" value={p.left} onChange={e => { const u = [...editPairs]; u[i].left = e.target.value; setEditPairs(u); }}
                style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13 }} />
              <input placeholder="Nghĩa / định nghĩa" value={p.right} onChange={e => { const u = [...editPairs]; u[i].right = e.target.value; setEditPairs(u); }}
                style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13 }} />
              {editPairs.length > 1 && <button onClick={() => setEditPairs(editPairs.filter((_,idx) => idx !== i))}
                style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>✕</button>}
            </div>
          ))}
          <div className="add-content" onClick={() => setEditPairs([...editPairs, { left: "", right: "" }])}>+ Thêm cặp</div>
        </>
      )}

      {/* Ordering */}
      {normalizedType === "ordering" && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>🔤 Các từ (cách nhau bằng dấu phẩy)</label>
          <textarea className="edit-textarea" value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} style={{ width: "100%" }} />
        </div>
      )}

      {/* Vocabulary type */}
      {normalizedType === "vocabulary" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 6 }}>📝 Nội dung đề bài</label>
            <textarea className="edit-textarea" value={editContent} onChange={e => setEditContent(e.target.value)} rows={2} style={{ width: "100%" }} />
          </div>
          <label style={{ fontWeight: 600, fontSize: 13, color: "#5a3e2b", display: "block", marginBottom: 8 }}>📚 Từ vựng</label>
          {editVocab.map((v, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input placeholder="Từ vựng" value={v.word} onChange={e => { const u = [...editVocab]; u[i].word = e.target.value; setEditVocab(u); }}
                style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13 }} />
              <input placeholder="Nghĩa" value={v.meaning} onChange={e => { const u = [...editVocab]; u[i].meaning = e.target.value; setEditVocab(u); }}
                style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #e0d8cc", fontSize: 13 }} />
              {editVocab.length > 1 && <button onClick={() => setEditVocab(editVocab.filter((_,idx) => idx !== i))}
                style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>✕</button>}
            </div>
          ))}
          <div className="add-content" onClick={() => setEditVocab([...editVocab, { word: "", meaning: "" }])}>+ Thêm từ vựng</div>
        </>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
        <button onClick={() => setIsEdit(false)}
          style={{ padding: "9px 24px", borderRadius: 20, border: "1px solid #ccc", background: "#fff", color: "#666", cursor: "pointer", fontSize: 14 }}>
          Hủy
        </button>
        <button className="update-btn" onClick={handleSave}>✓ Lưu thay đổi</button>
      </div>
    </div>
  );

  return (
    <div className="ed-wrapper">
      <div className="back" onClick={() => navigate(-1)}>← Quay lại</div>

      {/* HEADER */}
      <div className="header-card">
        <div className="header-top">
          <div>
            <h1>{lesson.TenLesson}</h1>
            <p>{lesson.MoTa}</p>
            <p>Mã lớp: B239B1</p>
            <p>📅 {lesson.NgayBatDau ? new Date(lesson.NgayBatDau).toLocaleDateString("vi-VN") : "N/A"} - {lesson.NgayKetThuc ? new Date(lesson.NgayKetThuc).toLocaleDateString("vi-VN") : "N/A"}</p>
          </div>
          <span className="status-badge">Đang học</span>
        </div>
        <div className="info-row">
          <div className="info-col"><span>👨‍🏫</span><p className="label">Giáo viên</p><b>{teacherName}</b></div>
          <div className="info-col"><span>📅</span><p className="label">Lịch học</p><b>{lesson.LichHoc}</b></div>
          <div className="info-col"><span>👥</span><p className="label">Số học viên</p><b>{lesson.SoLuongHocVien}</b></div>
          <div className="info-col"><span>📘</span><p className="label">Trạng thái</p><b>Đang học</b></div>
        </div>
        <div className="progress-section">
          <div className="progress-label"><span>Tiến độ khóa học</span><span className="percent">68%</span></div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: "68%" }} /></div>
        </div>
      </div>

      {/* TITLE BAR */}
      <div className="exercise-header">
        <h1>{exercise.Title}</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ background: "#fff3e0", color: "#e87722", padding: "3px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
            {exercise.Type}
          </span>
          {!isEdit && <button className="edit-btn" onClick={openEdit}>Sửa</button>}
          <button className="submissions-btn" onClick={() => navigate(`/danh-sach-bai-nop/${id}`)}>
            📋 Danh sách bài nộp
          </button>
        </div>
      </div>

      {/* EDIT FORM */}
      {isEdit && renderEditForm()}

      {/* VIEW MODE */}
      {!isEdit && (
        <>
          {/* ESSAY */}
          {normalizedType === "essay" && (
            <>
              <div className="card">
                <h3>📖 Reading Passage</h3>
                <p className="passage">{mainContent || "Chưa có nội dung."}</p>
              </div>
              {vocabularyList.length > 0 && (
                <div className="card">
                  <h3>📚 Vocabulary Practice</h3>
                  <p className="vocab-subtitle">Match the words with their meanings:</p>
                  <table className="vocab-table">
                    <thead><tr><th>Word</th><th>Meaning</th></tr></thead>
                    <tbody>{vocabularyList.map((v: any, i: number) => <tr key={i}><td>{i+1}. {v.word}</td><td>{v.meaning}</td></tr>)}</tbody>
                  </table>
                </div>
              )}
              <div className="card">
                <h3>Comprehension Questions</h3>
                {essayQuestions.length > 0 ? essayQuestions.map((q: string, i: number) => (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <p style={{ fontWeight: 600, marginBottom: 6, color: "#333" }}>{i+1}. {q}</p>
                    <input type="text" placeholder="Nhập câu trả lời..." style={{ width: "100%", padding: "8px 12px", border: "1px solid #e0d8cc", borderRadius: 8, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }} />
                  </div>
                )) : <p>Chưa có câu hỏi.</p>}
              </div>
            </>
          )}

          {/* MC / LISTENING */}
          {isMC && (
            <div className="card">
              <h3>❓ Câu hỏi {normalizedType === "listening" ? "nghe" : "trắc nghiệm"}</h3>
              {normalizedType === "listening" && exercise.AudioUrl && (
                <audio controls style={{ width: "100%", marginBottom: 16 }}>
                  <source src={`http://localhost:5000${exercise.AudioUrl}`} />
                </audio>
              )}
              {mainContent && <div style={{ marginBottom: 16 }}><h4 style={{ color: "#5a3e2b", marginBottom: 6 }}>📖 Đoạn văn</h4><p className="passage">{mainContent}</p></div>}
              {mcQuestions.length > 0 ? mcQuestions.map((q: MCQuestion, qi: number) => (
                <div key={qi} className="question-block" style={{ marginBottom: 20 }}>
                  <p style={{ fontWeight: 700, color: "#5a3e2b", marginBottom: 8 }}>Câu {qi+1}: {q.question}</p>
                  {q.options.length > 0 ? q.options.map(opt => (
                    <p key={opt.label} style={{ padding: "7px 14px", borderRadius: 8, marginBottom: 5, background: opt.label === q.correct ? "#f0fdf4" : "#fafafa", border: `1px solid ${opt.label === q.correct ? "#86efac" : "#e0d8cc"}`, color: opt.label === q.correct ? "#16a34a" : "#444", fontWeight: opt.label === q.correct ? 600 : 400 }}>
                      {opt.label}. {opt.text} {opt.label === q.correct && "✓"}
                    </p>
                  )) : <input type="text" placeholder="Nhập câu trả lời..." style={{ width: "100%", padding: "8px 12px", border: "1px solid #e0d8cc", borderRadius: 8, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" as const }} />}
                </div>
              )) : <p>Chưa có câu hỏi.</p>}
            </div>
          )}

          {/* PAIRS */}
          {isPairs && (
            <div className="card">
              <h3>{normalizedType === "matching" ? "🧩 Ghép từ" : "🔗 Nối từ"}</h3>
              {pairs.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #f0e8dc", color: "#5a3e2b" }}>Từ / Cụm từ</th>
                    <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #f0e8dc", color: "#5a3e2b" }}>Nghĩa / Định nghĩa</th>
                  </tr></thead>
                  <tbody>{pairs.map((p: Pair, i: number) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0e8dc", fontWeight: 600 }}>{i+1}. {p.left}</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0e8dc", color: "#555" }}>{p.right}</td>
                    </tr>
                  ))}</tbody>
                </table>
              ) : <p>Chưa có dữ liệu.</p>}
            </div>
          )}

          {/* ORDERING */}
          {normalizedType === "ordering" && (
            <div className="card">
              <h3>🔤 Sắp xếp từ / câu</h3>
              {mainContent && <p className="passage" style={{ marginBottom: 12 }}>{mainContent}</p>}
              {orderingItems.length > 0 ? <ol style={{ paddingLeft: 20 }}>{orderingItems.map((item, i) => <li key={i} style={{ marginBottom: 8, color: "#444" }}>{item}</li>)}</ol> : <p>Chưa có nội dung.</p>}
            </div>
          )}

          {/* SPEAKING */}
          {normalizedType === "speaking" && (
            <div className="card">
              <h3>🎤 Bài nói</h3>
              {exercise.Content && <div style={{ marginBottom: 12 }}><p style={{ fontWeight: 600, color: "#5a3e2b", marginBottom: 4 }}>Chủ đề:</p><p className="passage">{exercise.Content}</p></div>}
              {exercise.Questions && <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 16px" }}><p style={{ margin: 0, fontSize: 13, color: "#1d4ed8", fontWeight: 600, marginBottom: 4 }}>🎯 Đáp án mẫu:</p><p style={{ margin: 0, color: "#1e3a8a", fontSize: 14 }}>{exercise.Questions}</p></div>}
            </div>
          )}

          {/* VOCABULARY */}
          {normalizedType === "vocabulary" && (
            <div className="card">
              <h3>📚 Vocabulary Practice</h3>
              {mainContent && <p className="passage" style={{ marginBottom: 16 }}>{mainContent}</p>}
              <p className="vocab-subtitle">Match the words with their meanings:</p>
              {vocabularyList.length > 0 ? (
                <table className="vocab-table">
                  <thead><tr><th>Word</th><th>Meaning</th></tr></thead>
                  <tbody>{vocabularyList.map((v: any, i: number) => <tr key={i}><td>{i+1}. {v.word}</td><td>{v.meaning}</td></tr>)}</tbody>
                </table>
              ) : <p>Chưa có từ vựng.</p>}
            </div>
          )}

          {/* VOCAB bổ sung */}
          {vocabularyList.length > 0 && !["essay", "vocabulary"].includes(normalizedType) && (
            <div className="card">
              <h3>📚 Vocabulary Practice</h3>
              <p className="vocab-subtitle">Match the words with their meanings:</p>
              <table className="vocab-table">
                <thead><tr><th>Word</th><th>Meaning</th></tr></thead>
                <tbody>{vocabularyList.map((v: any, i: number) => <tr key={i}><td>{i+1}. {v.word}</td><td>{v.meaning}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-box">
            <div className="check-icon">✓</div>
            <p>Lưu kết quả thành công</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseDetail;