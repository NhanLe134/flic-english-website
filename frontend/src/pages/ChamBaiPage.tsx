import "./chamBaiPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const ChamBaiPage = () => {
  const navigate = useNavigate();
  const { maBaiNop } = useParams();

  const [baiNop,      setBaiNop]      = useState<any>(null);
  const [exercise,    setExercise]    = useState<any>(null);
  const [diem,        setDiem]        = useState<string>("");
  const [nhanXet,     setNhanXet]     = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    if (!maBaiNop) return;
    fetch(`http://localhost:5000/bainop/${maBaiNop}`)
      .then(res => res.json())
      .then(data => {
        setBaiNop(data);
        if (data.Diem !== null && data.Diem !== undefined) setDiem(data.Diem.toString());
        if (data.NhanXet) setNhanXet(data.NhanXet);
        return fetch(`http://localhost:5000/exercise/${data.MaExercise}`);
      })
      .then(res => res.json())
      .then(data => setExercise(data))
      .catch(err => console.log(err));
  }, [maBaiNop]);

  const handleCham = async () => {
    if (!diem) { alert("Vui lòng nhập điểm"); return; }
    const diemSo = parseFloat(diem);
    if (isNaN(diemSo) || diemSo < 0 || diemSo > 10) { alert("Điểm phải từ 0 đến 10"); return; }
    setLoading(true);
    try {
      await fetch(`http://localhost:5000/bainop/${maBaiNop}/cham`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Diem: diemSo, NhanXet: nhanXet })
      });
      setShowSuccess(true);
      setTimeout(() => navigate(-1), 2000);
    } catch { alert("Lỗi khi chấm bài"); }
    finally { setLoading(false); }
  };

  if (!baiNop || !exercise) return <p style={{ padding: 20 }}>Đang tải...</p>;

  // ── Normalize type ─────────────────────────────────────────────────────────
  const exType = (exercise.Type || "").toLowerCase();
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

  // Chỉ essay & speaking là giáo viên chấm tay
  // Tất cả còn lại là máy chấm tự động
  const isEssay    = normalizedType === "essay";
  const isSpeaking = normalizedType === "speaking";
  const isManual   = isEssay || isSpeaking;   // cần giáo viên chấm tay
  const isAuto     = !isManual;               // máy đã chấm

  const isMultiple  = normalizedType === "multiple";
  const isListening = normalizedType === "listening";
  const isMC        = isMultiple || isListening;

  // ── Parse content ──────────────────────────────────────────────────────────
  const contentParts = (exercise.Content || "")
    .split("\n---\n")
    .map((s: string) => s.trim())
    .filter(Boolean);
  const deiBai = contentParts[0] || "";

  // ── Câu hỏi essay ─────────────────────────────────────────────────────────
  const exerciseQuestions: string[] = (() => {
    if (!isManual) return [];
    const fromContent = contentParts.slice(1);
    if (fromContent.length > 0) return fromContent;
    const qs = exercise.Questions || "";
    if (qs) return qs.split("|").map((q: string) => q.trim()).filter(Boolean);
    return [];
  })();

  // ── Parse câu trả lời essay ───────────────────────────────────────────────
  const parseEssayAnswers = (noiDung: string): string[] => {
    if (!noiDung) return [];
    if (noiDung.includes("Trả lời:")) {
      return noiDung.split("\n\n").filter(Boolean).map(block => {
        const answerLine = block.split("\n").find(l => l.startsWith("Trả lời:")) || "";
        return answerLine.replace("Trả lời:", "").trim();
      });
    }
    return [noiDung];
  };
  const essayAnswers = isManual ? parseEssayAnswers(baiNop.NoiDung || "") : [];

  // ── Parse MC questions ─────────────────────────────────────────────────────
  const mcQuestions: { question: string; options: { label: string; text: string }[]; correct: string }[] = (() => {
    if (!isMC) return [];
    const raw = exercise.Questions || "";
    if (!raw) return [];
    // Format đầy đủ
    if (raw.includes("###") || raw.includes("||")) {
      return raw.split("###").map((block: string) => {
        const parts    = block.split("||");
        const question = parts[0]?.trim() || "";
        const rest     = parts[1] || "";
        const items    = rest.split("|");
        const options: { label: string; text: string }[] = [];
        let correct = "A";
        items.forEach((item: string) => {
          const trimmed = item.trim();
          if (trimmed.startsWith("Đáp án đúng:")) {
            correct = trimmed.replace("Đáp án đúng:", "").trim();
          } else {
            const match = trimmed.match(/^([A-D])\.\s*(.+)/);
            if (match) options.push({ label: match[1], text: match[2] });
          }
        });
        return { question, options, correct };
      }).filter((q: any) => q.question);
    }
    // Format đơn giản: câu hỏi cách nhau bằng |
    return raw.split("|").map((q: string) => q.trim()).filter(Boolean).map((q: string) => ({
      question: q, options: [], correct: ""
    }));
  })();

  // ── Parse MC answers từ noiDung ────────────────────────────────────────────
  const parseMCAnswers = (noiDung: string): Record<number, { chosen: string; correct: string; ok: boolean }> => {
    const result: Record<number, { chosen: string; correct: string; ok: boolean }> = {};
    if (!noiDung) return result;
    noiDung.split("\n\n").filter(Boolean).forEach((block, i) => {
      const chosenMatch  = block.match(/Chọn:\s*([A-D])/);
      const correctMatch = block.match(/Đúng:\s*([A-D])/);
      if (chosenMatch) {
        result[i] = {
          chosen:  chosenMatch[1],
          correct: correctMatch ? correctMatch[1] : "",
          ok:      block.includes("✓")
        };
      }
    });
    return result;
  };
  const mcAnswers = isMC ? parseMCAnswers(baiNop.NoiDung || "") : {};

  // ── Parse kết quả auto (connect/matching/ordering/vocabulary) ─────────────
  const autoLines = (!isManual && !isMC && baiNop.NoiDung)
    ? (baiNop.NoiDung as string).split("\n").filter(Boolean)
    : [];

  return (
    <div className="cb-wrapper">
      <div className="back" onClick={() => navigate(-1)}>← Quay lại</div>

      {/* Header */}
      <div className="cb-header">
        <div>
          <h1>{exercise.Title}</h1>
          <p>Loại: <strong>{exercise.Type}</strong></p>
        </div>
        <span className={`cb-status ${baiNop.TrangThai === "Đã chấm" ? "done" : "pending"}`}>
          {baiNop.TrangThai}
        </span>
      </div>

      {/* Thông tin SV */}
      <div className="cb-card">
        <h3>Thông tin học viên</h3>
        <div className="cb-info-row">
          <div className="cb-info-item">
            <span className="cb-label">Tên học viên</span>
            <b>{baiNop.HoTen}</b>
          </div>
          <div className="cb-info-item">
            <span className="cb-label">Mã sinh viên</span>
            <b>{baiNop.MaSinhVien}</b>
          </div>
          <div className="cb-info-item">
            <span className="cb-label">Ngày nộp</span>
            <b>{baiNop.NgayNop ? new Date(baiNop.NgayNop).toLocaleDateString("vi-VN") : "—"}</b>
          </div>
        </div>
      </div>

      {/* Bài làm */}
      <div className="cb-card">
        <h3>📝 Bài làm của học viên</h3>

        {deiBai && (
          <div className="cb-passage">
            <h4>Đề bài:</h4>
            <p>{deiBai}</p>
          </div>
        )}

        {/* ── TRẮC NGHIỆM / NGHE (máy chấm, có options A B C D) ── */}
        {isMC && mcQuestions.filter(q => q.options.length > 0).length > 0 && (
          <div className="cb-qa-list">
            {mcQuestions.map((q, i) => {
              const ans = mcAnswers[i];
              return (
                <div key={i} className="cb-qa-item">
                  <div className="cb-question">
                    <span className="cb-q-num">Câu {i + 1}:</span> {q.question}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {q.options.map(opt => {
                      const isChosen  = ans?.chosen === opt.label;
                      const isCorrect = opt.label === q.correct;
                      const isWrong   = isChosen && !isCorrect;
                      return (
                        <div key={opt.label} style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "7px 12px", borderRadius: 8, marginBottom: 6,
                          background: isCorrect ? "#f0fdf4" : isWrong ? "#fef2f2" : "#fafafa",
                          border: `1px solid ${isCorrect ? "#86efac" : isWrong ? "#fecaca" : "#f0e8dc"}`
                        }}>
                          <span style={{ fontWeight: 700, minWidth: 20, color: isCorrect ? "#16a34a" : isWrong ? "#dc2626" : "#888" }}>
                            {opt.label}.
                          </span>
                          <span style={{ color: "#444" }}>{opt.text}</span>
                          {isChosen && (
                            <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: isCorrect ? "#16a34a" : "#dc2626" }}>
                              {isCorrect ? "✓ SV chọn" : "✗ SV chọn"}
                            </span>
                          )}
                          {!isChosen && isCorrect && (
                            <span style={{ marginLeft: "auto", fontSize: 12, color: "#16a34a" }}>✓ Đáp án đúng</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: ans?.ok ? "#16a34a" : "#dc2626" }}>
                    {ans?.ok ? "✓ Đúng" : `✗ Sai (Đáp án: ${q.correct})`}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── NGHE / MC dạng tự luận (format đơn giản, không có options) ── */}
        {isMC && mcQuestions.every(q => q.options.length === 0) && (
          <div className="cb-qa-list">
            {mcQuestions.map((q, i) => {
              const answers = parseEssayAnswers(baiNop.NoiDung || "");
              return (
                <div key={i} className="cb-qa-item">
                  <div className="cb-question"><span className="cb-q-num">Câu {i + 1}:</span> {q.question}</div>
                  <div className="cb-answer">
                    <span className="cb-a-label">Trả lời:</span>
                    <p>{answers[i] || <span style={{ color: "#999" }}>Chưa trả lời</span>}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CONNECT / MATCHING / ORDERING / VOCABULARY (máy chấm, hiện từng dòng) ── */}
        {autoLines.length > 0 && (
          <div className="cb-full-answer">
            <h4>Kết quả:</h4>
            {autoLines.map((line, i) => (
              <p key={i} style={{
                padding: "6px 10px", borderRadius: 8, marginBottom: 6,
                background: line.includes("✓") ? "#f0fdf4" : line.includes("✗") ? "#fef2f2" : "#fafafa",
                border: `1px solid ${line.includes("✓") ? "#86efac" : line.includes("✗") ? "#fecaca" : "#f0e8dc"}`,
                fontSize: 14, color: "#444"
              }}>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* ── TỰ LUẬN (essay/reading/writing) ── */}
        {isEssay && (
          <div className="cb-qa-list">
            {exerciseQuestions.length > 0 ? (
              exerciseQuestions.map((q, i) => (
                <div key={i} className="cb-qa-item">
                  <div className="cb-question">{i + 1}. {q}</div>
                  <div className="cb-answer">
                    <span className="cb-a-label">Trả lời:</span>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {essayAnswers[i] || <span style={{ color: "#999" }}>Chưa trả lời</span>}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="cb-qa-item">
                <div className="cb-answer">
                  <span className="cb-a-label">Bài làm:</span>
                  <p style={{ whiteSpace: "pre-wrap" }}>
                    {essayAnswers[0] || <span style={{ color: "#999" }}>Chưa có nội dung</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── NÓI ── */}
        {isSpeaking && (
          <div className="cb-qa-item">
            <div className="cb-answer">
              <span className="cb-a-label">Ghi chú của học viên:</span>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {baiNop.NoiDung || <span style={{ color: "#999" }}>Không có ghi chú</span>}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chấm điểm */}
      <div className="cb-card">
        <h3>🎯 Chấm điểm</h3>

        {/* Máy chấm: hiện kết quả tự động */}
        {isAuto && baiNop.Diem !== null && baiNop.Diem !== undefined && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac",
            borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#15803d"
          }}>
            ✅ Hệ thống đã tự chấm: <strong>{baiNop.Diem}/10</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#166534" }}>
              Giáo viên có thể thêm nhận xét hoặc điều chỉnh điểm nếu cần.
            </p>
          </div>
        )}

        {/* Tự luận / Nói: cần chấm tay */}
        {isManual && (
          <div style={{
            background: "#fff3e0", border: "1px solid #f0d8b0",
            borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#92400e"
          }}>
            ✏️ Bài {isSpeaking ? "nói" : "tự luận"} cần giáo viên chấm điểm thủ công.
          </div>
        )}

        <div className="cb-score-row">
          <div className="cb-score-input">
            <label>Điểm (0 – 10) *</label>
            <input
              type="number" min="0" max="10" step="0.1"
              placeholder="Nhập điểm..."
              value={diem}
              onChange={e => setDiem(e.target.value)}
            />
          </div>
        </div>

        <label>Nhận xét</label>
        <textarea
          className="cb-nhanxet"
          placeholder="Nhập nhận xét cho học viên..."
          value={nhanXet}
          onChange={e => setNhanXet(e.target.value)}
          rows={4}
        />

        <div className="cb-actions">
          <button className="cb-cancel-btn" onClick={() => navigate(-1)}>Hủy</button>
          <button className="cb-submit-btn" onClick={handleCham} disabled={loading}>
            {loading ? "Đang lưu..." : "✓ Xác nhận chấm bài"}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="cb-success-overlay">
          <div className="cb-success-box">
            <div className="cb-success-icon">✓</div>
            <p>Chấm bài thành công</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChamBaiPage;