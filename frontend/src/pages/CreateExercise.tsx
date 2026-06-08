import "./createExercise.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

interface Question {
  question: string;
  answers: string[];
  correct: string;
}

const getDangBaiOptions = (kn: string): string[] => {
  if (kn === "Nghe") return ["Nghe audio trắc nghiệm", "Hình ảnh chọn đáp án", "Nghe chép chính tả", "Điền từ vào đoạn văn"];
  if (kn === "Noi") return ["Luyện phát âm (check phát âm tự động)", "Nói theo chủ đề (ghi âm nộp GV)"];
  if (kn === "Doc") return ["Trắc nghiệm đọc hiểu (chia đôi màn hình)", "Bài tập từ vựng"];
  if (kn === "Viet") return ["Sắp xếp từ thành câu", "Trắc nghiệm xác định thì", "Viết đoạn văn ngắn", "Sắp xếp câu thành đoạn văn"];
  return [];
};

const mapDangBaiToType = (db: string): string => {
  if (db === "Nghe audio trắc nghiệm" || db === "Hình ảnh chọn đáp án") return "listening";
  if (db === "Nghe chép chính tả" || db === "Điền từ vào đoạn văn") return "essay";
  if (db === "Luyện phát âm (check phát âm tự động)" || db === "Nói theo chủ đề (ghi âm nộp GV)") return "speaking";
  if (db === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") return "multiple";
  if (db === "Bài tập từ vựng") return "essay";
  if (db === "Sắp xếp từ thành câu") return "ordering";
  if (db === "Trắc nghiệm xác định thì") return "multiple";
  if (db === "Viết đoạn văn ngắn") return "essay";
  if (db === "Sắp xếp câu thành đoạn văn") return "ordering";
  return "multiple";
};

const CreateExercise = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isPractice = searchParams.get("isPractice") === "true";

  const [lesson, setLesson] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Lưu kết quả thành công");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("listening");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [extraContents, setExtraContents] = useState<string[]>([]);
  
  const [kyNang, setKyNang] = useState("Nghe");
  const [dangBai, setDangBai] = useState("Nghe audio trắc nghiệm");
  const [isFree, setIsFree] = useState(false);
  const [isExam, setIsExam] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    { question: "", answers: ["", "", "", ""], correct: "A" }
  ]);

  const [singleQuestion,  setSingleQuestion]  = useState("");
  const [speakingAnswer,  setSpeakingAnswer]  = useState(""); // đáp án mẫu cho speaking
  const [connectPairs,   setConnectPairs]   = useState([{ left: "", right: "" }]);
  const [matchingPairs,  setMatchingPairs]  = useState([{ left: "", right: "" }]);
  const [vocabPairs,     setVocabPairs]     = useState([{ word: "", meaning: "" }]);

  const handleKyNangChange = (kn: string) => {
    setKyNang(kn);
    const opts = getDangBaiOptions(kn);
    if (opts.length > 0) {
      handleDangBaiChange(opts[0]);
    }
  };

  const handleDangBaiChange = (db: string) => {
    setDangBai(db);
    const targetType = mapDangBaiToType(db);
    setType(targetType);
    setQuestions([{ question: "", answers: ["", "", "", ""], correct: "A" }]);
    setSingleQuestion("");
    setExtraContents([]);
    setAudioFile(null);
    setConnectPairs([{ left: "", right: "" }]);
    setMatchingPairs([{ left: "", right: "" }]);
    setVocabPairs([{ word: "", meaning: "" }]);
    setSpeakingAnswer("");
  };

  /* ===== LOAD LESSON ===== */
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/lesson/${id}`)
      .then(res => res.json())
      .then(data => setLesson(Array.isArray(data) ? data[0] : data))
      .catch(err => console.log(err));
  }, [id]);

  /* ===== HANDLE FILE ===== */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setUploadedFile(e.target.files[0]);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAudioFile(e.target.files[0]);
  };

  /* ===== HANDLE QUESTIONS ===== */
  const addQuestion = () => {
    setQuestions([...questions, { question: "", answers: ["", "", "", ""], correct: "A" }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateAnswer = (qIndex: number, aIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].answers[aIndex] = value;
    setQuestions(updated);
  };

  /* ===== HANDLE CONNECT ===== */
  const handleConnectChange = (index: number, field: "left" | "right", value: string) => {
    const updated = [...connectPairs];
    updated[index][field] = value;
    setConnectPairs(updated);
  };

  const addConnectPair = () => setConnectPairs([...connectPairs, { left: "", right: "" }]);

  const removeConnectPair = (index: number) => {
    if (connectPairs.length === 1) return;
    setConnectPairs(connectPairs.filter((_, i) => i !== index));
  };

  /* ===== HANDLE MATCHING ===== */
  const handleMatchingChange = (index: number, field: "left" | "right", value: string) => {
    const updated = [...matchingPairs];
    updated[index][field] = value;
    setMatchingPairs(updated);
  };

  const addMatchingPair = () => setMatchingPairs([...matchingPairs, { left: "", right: "" }]);

  const removeMatchingPair = (index: number) => {
    if (matchingPairs.length === 1) return;
    setMatchingPairs(matchingPairs.filter((_, i) => i !== index));
  };

  /* ===== HANDLE VOCAB ===== */
  const handleVocabChange = (index: number, field: "word" | "meaning", value: string) => {
    const updated = [...vocabPairs];
    updated[index][field] = value;
    setVocabPairs(updated);
  };

  const addVocabPair = () => setVocabPairs([...vocabPairs, { word: "", meaning: "" }]);

  const removeVocabPair = (index: number) => {
    if (vocabPairs.length === 1) return;
    setVocabPairs(vocabPairs.filter((_, i) => i !== index));
  };

  /* ===== HANDLE EXTRA CONTENTS ===== */
  const addExtraContent = () => setExtraContents([...extraContents, ""]);

  const updateExtraContent = (index: number, value: string) => {
    const updated = [...extraContents];
    updated[index] = value;
    setExtraContents(updated);
  };

  const removeExtraContent = (index: number) => {
    setExtraContents(extraContents.filter((_, i) => i !== index));
  };

  /* ===== CREATE ===== */
  const handleCreate = async (statusOverride?: "draft" | "pending" | "published" | "practice") => {
    if (!title) { alert("Vui lòng nhập tiêu đề"); return; }

    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
    const user = JSON.parse(userStr || "{}");
    const isTeacher = user.VaiTro === "Giảng Viên";
    const status = statusOverride || (isPractice ? "practice" : (isTeacher ? "pending" : "published"));

    const today = new Date().toISOString().split("T")[0];
    let content       = "";
    let questionsStr  = "";
    let audioUrl      = "";
    let vocabularyStr = "";

    if (type === "multiple" || type === "listening") {
      questionsStr = questions.map(q => {
        const answersStr = q.answers
          .map((a, i) => `${["A","B","C","D"][i]}. ${a}`)
          .join("|");
        return `${q.question}||${answersStr}|Đáp án đúng: ${q.correct}`;
      }).join("###");
    }

    if (type === "essay") {
      content      = singleQuestion;
      questionsStr = "";
    }
    if (type === "speaking") {
      // Content: "chủ đề
      content      = singleQuestion;
      questionsStr = speakingAnswer; // đáp án mẫu lưu vào Questions
    }

    if (type === "ordering") {
      content = singleQuestion;
    }

    if (type === "connect") {
      questionsStr = connectPairs.map(p => `${p.left}::${p.right}`).join("|");
    }

    if (type === "matching") {
      questionsStr = matchingPairs.map(p => `${p.left}::${p.right}`).join("|");
    }

    // Từ vựng — chỉ với essay
    if (type === "essay") {
      vocabularyStr = vocabPairs
        .filter(p => p.word.trim())
        .map(p => `${p.word.trim()}::${p.meaning.trim()}`)
        .join("|");
    }

    // Extra contents (câu hỏi bổ sung)
    if (extraContents.length > 0) {
      content += "\n---\n" + extraContents.join("\n---\n");
    }

    try {
      if (audioFile) {
        const formData = new FormData();
        formData.append("file", audioFile);
        const uploadRes = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData
        });
        const uploadData = await uploadRes.json();
        audioUrl = uploadData.url || "";
      }

      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData
        });
      }

      await fetch("http://localhost:5000/exercises/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Title:       title,
          Type:        type,
          Content:     content,
          Questions:   questionsStr,
          Vocabulary:  vocabularyStr,
          CreatedDate: today,
          MaLesson:    Number(id),
          AudioUrl:    audioUrl,
          ShowAnswer:  showAnswer ? 1 : 0,
          IsFree:      isFree ? 1 : 0,
          IsExam:      isExam ? 1 : 0,
          TrangThai:   status,
          KyNang:      kyNang,
          DangBai:     dangBai,
          MaGiangVien: user.MaNguoiDung || null
        })
      });

      setSuccessMessage(
        status === "draft"
          ? "Đã lưu bản nháp thành công"
          : status === "practice"
          ? "Tạo bài luyện tập thêm thành công"
          : isTeacher
          ? "Đã gửi yêu cầu duyệt bài tập đến QTV"
          : "Tạo bài tập thành công"
      );
      setShowSuccess(true);
      setTimeout(() => navigate(`/bai-tap/${id}`), 1500);
    } catch (err) {
      console.log(err);
      alert("Lỗi khi tạo bài tập");
    }
  };

  if (!lesson) return <p>Đang tải...</p>;

  return (
    <div className="ce-wrapper">

      <div className="back" onClick={() => navigate(-1)}>← Quay lại</div>

      {/* HEADER CARD */}
      <div className="ce-header-card">
        <h1>{lesson?.TenLesson || "Đang tải..."}</h1>
        <p>{lesson?.MoTa || ""}</p>
        <p>Mã lớp: B239B1</p>
      </div>

      {/* TABS */}
      <div className="tabs">
        <button className="tab" onClick={() => navigate(`/class/${id}`)}>Tổng quan</button>
        <button className="tab active" onClick={() => navigate(`/bai-tap/${id}`)}>Bài tập</button>
        <button className="tab" onClick={() => navigate(`/quan-ly-bai-giang/${id}`)}>Bài giảng</button>
        <button className="tab" onClick={() => navigate(`/documents/${id}`)}>Tài liệu</button>
      </div>

      {/* EXERCISE EDITOR */}
      <div className="exercise-editor">

        <input
          className="exercise-title"
          placeholder={isPractice ? "Tiêu đề bài luyện tập thêm" : "Tiêu đề bài tập"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5a3e2b', display: 'block', marginBottom: 4 }}>Kỹ năng</label>
            <select
              className="exercise-type"
              style={{ width: '100%', marginTop: 0, marginBottom: 0 }}
              value={kyNang}
              onChange={(e) => handleKyNangChange(e.target.value)}
            >
              <option value="Nghe">Nghe (Listening)</option>
              <option value="Noi">Nói (Speaking)</option>
              <option value="Doc">Đọc (Reading)</option>
              <option value="Viet">Viết (Writing)</option>
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5a3e2b', display: 'block', marginBottom: 4 }}>Dạng bài tập</label>
            <select
              className="exercise-type"
              style={{ width: '100%', marginTop: 0, marginBottom: 0 }}
              value={dangBai}
              onChange={(e) => handleDangBaiChange(e.target.value)}
            >
              {getDangBaiOptions(kyNang).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkboxes: Học thử miễn phí & Đặt làm bài kiểm tra */}
        <div style={{ display: "flex", gap: "24px", marginTop: "15px", marginBottom: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "#F95800", cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#5a3e2b" }}>
              Học thử miễn phí (Free)
            </span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isExam}
              onChange={(e) => setIsExam(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "#F95800", cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#5a3e2b" }}>
              Đặt làm bài kiểm tra (Exam)
            </span>
          </label>
        </div>

        <div style={{ marginBottom: "20px", fontSize: "13px", color: "#666" }}>
          Định dạng trình soạn thảo: <strong>{
            type === "listening" ? "Nghe / Audio Trắc nghiệm" :
            type === "multiple" ? "Trắc nghiệm" :
            type === "essay" ? "Tự luận / Đọc hiểu" :
            type === "speaking" ? "Nói / Ghi âm" :
            type === "ordering" ? "Sắp xếp từ" :
            type === "connect" ? "Nối từ" :
            type === "matching" ? "Ghép từ" : type
          }</strong>
        </div>

        {/* ── TRẮC NGHIỆM ── */}
        {type === "multiple" && (
          <div>
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="question-block">
                <div className="question-block-header">
                  <h4>Câu {qIndex + 1}</h4>
                  {questions.length > 1 && (
                    <button className="remove-btn" onClick={() => removeQuestion(qIndex)}>✕ Xóa</button>
                  )}
                </div>
                <textarea
                  className="exercise-content"
                  placeholder={`Nhập câu hỏi ${qIndex + 1}`}
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                />
                {["A", "B", "C", "D"].map((label, aIndex) => (
                  <input
                    key={label}
                    className="exercise-content"
                    placeholder={`Đáp án ${label}`}
                    value={q.answers[aIndex]}
                    onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                  />
                ))}
                <select
                  className="exercise-type"
                  value={q.correct}
                  onChange={(e) => updateQuestion(qIndex, "correct", e.target.value)}
                >
                  {["A", "B", "C", "D"].map((label) => (
                    <option key={label} value={label}>Đáp án đúng: {label}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="add-content" onClick={addQuestion}>+ Thêm câu hỏi</div>
          </div>
        )}

        {/* ── TỰ LUẬN ── */}
        {type === "essay" && (
          <div>
            <textarea
              className="exercise-content"
              placeholder="Nhập đoạn văn / nội dung đề bài..."
              value={singleQuestion}
              onChange={(e) => setSingleQuestion(e.target.value)}
            />

            {/* VOCABULARY */}
            <div className="question-block" style={{ marginTop: 16 }}>
              <div className="question-block-header">
                <h4>📚 Từ vựng (tuỳ chọn)</h4>
              </div>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
                Nhập từ vựng và nghĩa để hiển thị bảng Vocabulary Practice
              </p>
              {vocabPairs.map((pair, index) => (
                <div key={index} className="connect-row">
                  <input
                    className="exercise-content"
                    placeholder="Từ vựng (vd: Biodiversity)"
                    value={pair.word}
                    onChange={(e) => handleVocabChange(index, "word", e.target.value)}
                  />
                  <input
                    className="exercise-content"
                    placeholder="Nghĩa (vd: variety of different living things)"
                    value={pair.meaning}
                    onChange={(e) => handleVocabChange(index, "meaning", e.target.value)}
                  />
                  {vocabPairs.length > 1 && (
                    <button className="remove-btn" onClick={() => removeVocabPair(index)}>✕</button>
                  )}
                </div>
              ))}
              <div className="add-content" onClick={addVocabPair}>+ Thêm từ vựng</div>
            </div>
          </div>
        )}

        {/* ── GHÉP TỪ ── */}
        {type === "matching" && (
          <div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
              Nhập từng cặp từ và nghĩa tương ứng. Học viên sẽ click để ghép đúng cặp.
            </p>
            {matchingPairs.map((pair, index) => (
              <div key={index} className="connect-row">
                <input
                  className="exercise-content"
                  placeholder="Từ / cụm từ"
                  value={pair.left}
                  onChange={(e) => handleMatchingChange(index, "left", e.target.value)}
                />
                <input
                  className="exercise-content"
                  placeholder="Nghĩa / định nghĩa"
                  value={pair.right}
                  onChange={(e) => handleMatchingChange(index, "right", e.target.value)}
                />
                {matchingPairs.length > 1 && (
                  <button className="remove-btn" onClick={() => removeMatchingPair(index)}>✕</button>
                )}
              </div>
            ))}
            <div className="add-content" onClick={addMatchingPair}>+ Thêm cặp từ</div>
          </div>
        )}

        {/* ── SẮP XẾP ── */}
        {type === "ordering" && (
          <textarea
            className="exercise-content"
            placeholder="Nhập các từ cần sắp xếp (cách nhau bằng dấu phẩy)"
            value={singleQuestion}
            onChange={(e) => setSingleQuestion(e.target.value)}
          />
        )}

        {/* ── NỐI TỪ ── */}
        {type === "connect" && (
          <div>
            {connectPairs.map((pair, index) => (
              <div key={index} className="connect-row">
                <input
                  className="exercise-content"
                  placeholder="Từ bên trái"
                  value={pair.left}
                  onChange={(e) => handleConnectChange(index, "left", e.target.value)}
                />
                <input
                  className="exercise-content"
                  placeholder="Từ bên phải"
                  value={pair.right}
                  onChange={(e) => handleConnectChange(index, "right", e.target.value)}
                />
                {connectPairs.length > 1 && (
                  <button className="remove-btn" onClick={() => removeConnectPair(index)}>✕</button>
                )}
              </div>
            ))}
            <div className="add-content" onClick={addConnectPair}>+ Thêm cặp nối</div>
          </div>
        )}

        {/* ── NGHE ── */}
        {type === "listening" && (
          <div>
            <p className="upload-label">🎵 Upload file âm thanh</p>
            <div
              className="upload-box"
              onClick={() => document.getElementById("audio-input")?.click()}
            >
              <input
                id="audio-input"
                type="file"
                accept=".mp3,.wav,.m4a"
                onChange={handleAudioChange}
                hidden
              />
              {audioFile ? (
                <div className="upload-selected">
                  <span className="upload-icon">🎵</span>
                  <span className="upload-filename">{audioFile.name}</span>
                  <span
                    className="upload-remove"
                    onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                  >✕</span>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">⬆️</span>
                  <span>Kéo thả hoặc <u>chọn file âm thanh</u></span>
                  <span className="upload-hint">MP3, WAV, M4A</span>
                </div>
              )}
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} className="question-block">
                <div className="question-block-header">
                  <h4>Câu {qIndex + 1}</h4>
                  {questions.length > 1 && (
                    <button className="remove-btn" onClick={() => removeQuestion(qIndex)}>✕ Xóa</button>
                  )}
                </div>
                <textarea
                  className="exercise-content"
                  placeholder={`Nhập câu hỏi ${qIndex + 1} sau khi nghe...`}
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                />
                {["A", "B", "C", "D"].map((label, aIndex) => (
                  <input
                    key={label}
                    className="exercise-content"
                    placeholder={`Đáp án ${label}`}
                    value={q.answers[aIndex]}
                    onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                  />
                ))}
                <select
                  className="exercise-type"
                  value={q.correct}
                  onChange={(e) => updateQuestion(qIndex, "correct", e.target.value)}
                >
                  {["A", "B", "C", "D"].map((label) => (
                    <option key={label} value={label}>Đáp án đúng: {label}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="add-content" onClick={addQuestion}>+ Thêm câu hỏi</div>
          </div>
        )}

        {/* ── NÓI ── */}
        {type === "speaking" && (
          <div>
            <textarea
              className="exercise-content"
              placeholder="Nhập chủ đề / câu hỏi cho phần nói..."
              value={singleQuestion}
              onChange={(e) => setSingleQuestion(e.target.value)}
            />
            <input
              className="exercise-content"
              placeholder="Gợi ý từ vựng (ví dụ: travel, holiday, beach...)"
            />
            <textarea
              className="exercise-content"
              placeholder="Hướng dẫn (ví dụ: Hãy nói 2-3 phút về chủ đề này...)"
            />
            {/* Đáp án mẫu để máy chấm phát âm */}
            <div className="question-block" style={{ marginTop: 16 }}>
              <div className="question-block-header">
                <h4>🎯 Đáp án mẫu (dùng để máy chấm)</h4>
              </div>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
                Nhập câu / đoạn văn học viên cần đọc đúng. Máy sẽ nhận diện giọng nói và so sánh.
              </p>
              <textarea
                className="exercise-content"
                placeholder="VD: The quick brown fox jumps over the lazy dog"
                value={speakingAnswer}
                onChange={(e) => setSpeakingAnswer(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* ── EXTRA CONTENTS (câu hỏi bổ sung cho essay) ── */}
        {extraContents.map((content, index) => (
          <div key={index} className="question-block">
            <div className="question-block-header">
              <h4>Câu hỏi {index + 1}</h4>
              <button className="remove-btn" onClick={() => removeExtraContent(index)}>✕ Xóa</button>
            </div>
            <textarea
              className="exercise-content"
              placeholder="Nhập câu hỏi..."
              value={content}
              onChange={(e) => updateExtraContent(index, e.target.value)}
            />
          </div>
        ))}

        {/* Chỉ hiện "+ Thêm câu hỏi" với essay */}
        {type === "essay" && (
          <div className="add-content" onClick={addExtraContent}>+ Thêm câu hỏi</div>
        )}

        {/* ── UPLOAD FILE ── */}
        <div className="upload-section">
          <p className="upload-label">📎 Upload file bài tập</p>
          <div
            className="upload-box"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              hidden
            />
            {uploadedFile ? (
              <div className="upload-selected">
                <span className="upload-icon">📄</span>
                <span className="upload-filename">{uploadedFile.name}</span>
                <span
                  className="upload-remove"
                  onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                >✕</span>
              </div>
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">⬆️</span>
                <span>Kéo thả hoặc <u>chọn file</u></span>
                <span className="upload-hint">PDF, DOC, DOCX, PNG, JPG</span>
              </div>
            )}
          </div>
        </div>

        {/* ── HIỂN THỊ ĐÁP ÁN ── */}
        <div style={{ marginTop: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showAnswer}
              onChange={(e) => setShowAnswer(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#F95800", cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, color: "#5a3e2b" }}>
              Hiển thị đáp án cho học viên sau khi nộp bài
            </span>
          </label>
        </div>

        {(() => {
          const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
          const user = JSON.parse(userStr || "{}");
          const isTeacher = user.VaiTro === "Giảng Viên";

          return (
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              {isPractice ? (
                <button
                  type="button"
                  className="save-btn"
                  style={{ flex: 1, marginTop: 0 }}
                  onClick={() => handleCreate("practice")}
                >
                  Tạo bài luyện tập
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="draft-btn"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "10px",
                      background: "#fff",
                      border: "1.5px solid #F95800",
                      color: "#F95800",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onClick={() => handleCreate("draft")}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#fff4ec")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    Lưu nháp
                  </button>
                  <button
                    type="button"
                    className="save-btn"
                    style={{ flex: 1, marginTop: 0 }}
                    onClick={() => handleCreate(isTeacher ? "pending" : "published")}
                  >
                    {isTeacher ? "Gửi yêu cầu phê duyệt" : "Lưu & Xuất bản"}
                  </button>
                </>
              )}
            </div>
          );
        })()}

      </div>

      {/* SUCCESS */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-popup">
            <div className="check-icon">✓</div>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateExercise;