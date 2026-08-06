import "./ChamBaiPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import NoiDungBaiLam from "./NoiDungBaiLam";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

const ChamBaiPage = () => {
  const navigate = useNavigate();
  const { maBaiNop } = useParams();

  const [baiNop, setBaiNop] = useState<any>(null);
  const [exercise, setExercise] = useState<any>(null);
  const [diem, setDiem] = useState<string>("");
  const [nhanXet, setNhanXet] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!maBaiNop) return;
    fetch(`${API}/bainop/${maBaiNop}`)
      .then(res => res.json())
      .then(data => {
        setBaiNop(data);
        if (data.Diem !== null && data.Diem !== undefined) setDiem(data.Diem.toString());
        if (data.NhanXet) setNhanXet(data.NhanXet);
        return fetch(`${API}/baitap/${data.MaBaiTap}`);
      })
      .then(res => res.json())
      .then(data => setExercise(data))
      .catch(err => console.log(err));
  }, [maBaiNop]);

  const handleCham = async () => {
    if (diem === "") { alert("Vui lòng nhập điểm"); return; }
    const diemSo = parseFloat(diem);
    if (isNaN(diemSo) || diemSo < 0 || diemSo > 10) { alert("Điểm phải từ 0 đến 10"); return; }
    setLoading(true);
    try {
      await fetch(`${API}/bainop/${maBaiNop}/cham`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Diem: diemSo, NhanXet: nhanXet })
      });
      setShowSuccess(true);
      setTimeout(() => navigate(-1), 1500);
    } catch { alert("Lỗi khi chấm bài"); }
    finally { setLoading(false); }
  };

  // Trích xuất metadata từ Content của bài tập
  const parsedContent = useMemo(() => {
    if (!exercise?.Content) return {};
    try {
      if (exercise.Content.trim().startsWith("{")) {
        return JSON.parse(exercise.Content);
      }
    } catch (e) {}
    return { text: exercise.Content, description: exercise.Content };
  }, [exercise]);

  // Trích xuất JSON bài nộp của học viên
  const parsedSubmission = useMemo(() => {
    if (!baiNop?.NoiDung) return null;
    try {
      const content = baiNop.NoiDung.trim();
      if (content.startsWith("{") || content.startsWith("[")) {
        return JSON.parse(content);
      }
    } catch (e) {}
    return null;
  }, [baiNop]);

  // Danh sách câu hỏi của bài tập
  const questionsList = useMemo(() => {
    if (!exercise?.Questions) return [];
    try {
      if (exercise.Questions.trim().startsWith("[")) {
        return JSON.parse(exercise.Questions);
      }
    } catch (e) {}
    return [];
  }, [exercise]);

  if (!baiNop || !exercise) return <p style={{ padding: 20 }}>Đang tải...</p>;

  const exType = (exercise.Type || "").toLowerCase();
  const isExam = parsedSubmission?.isExam || exType === "exam";
  const hasSections = !!parsedSubmission?.sections || !!parsedContent?.sections;

  // Chuẩn hóa loại bài tập để kiểm tra cách render
  const normalizedType: string =
    ["writing", "reading", "essay", "viết đoạn văn ngắn", "nghe chép chính tả", "luyện phát âm (check phát âm tự động)", "sắp xếp từ thành câu", "sắp xếp câu thành đoạn văn", "tìm lỗi sai"].includes(exType) ? "essay" :
    ["tổng hợp", "quiz", "trắc nghiệm"].includes(exType) ? "Tổng hợp" :
    ["listening", "nghe", "nghe audio trắc nghiệm", "hình ảnh chọn đáp án"].includes(exType) ? "listening" :
    ["matching", "ghép"].includes(exType)                ? "matching"   :
    ["connect", "nối", "nối từ"].includes(exType)         ? "connect"    :
    ["ordering", "sắp xếp"].includes(exType)             ? "ordering"   :
    ["speaking", "nói", "nói theo chủ đề (ghi âm nộp gv)"].includes(exType) ? "speaking" :
    ["vocabulary", "từ vựng", "vocab"].includes(exType)  ? "vocabulary" :
    exType;

  const isMultiple  = normalizedType === "Tổng hợp";
  const isListening = normalizedType === "listening";
  const isMC        = isMultiple || isListening;

  const contentParts = (exercise.Content || "")
    .split("\n---\n")
    .map((s: string) => s.trim())
    .filter(Boolean);
  const deiBai = contentParts[0] || "";

  // Phân tích câu hỏi trắc nghiệm nếu định dạng cũ
  const mcQuestions: { question: string; options: { label: string; text: string }[]; correct: string }[] = (() => {
    if (!isMC) return [];
    const raw = exercise.Questions || "";
    if (!raw) return [];
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
    return raw.split("|").map((q: string) => q.trim()).filter(Boolean).map((q: string) => ({
      question: q, options: [], correct: ""
    }));
  })();

  // Phân tích câu trả lời trắc nghiệm cũ
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

  return (
    <div className="cb-wrapper">
      <div className="back" onClick={() => navigate(-1)}>← Quay lại</div>

      {/* Header */}
      <div className="cb-header">
        <div>
          <h1>{exercise.Title}</h1>
          <p>Loại: <strong>{isExam ? "Exam (Bài kiểm tra)" : exercise.Type}</strong></p>
        </div>
        <span className={`cb-status ${baiNop.TrangThai === "Đã chấm" ? "done" : "pending"}`}>
          {baiNop.TrangThai}
        </span>
      </div>

      {/* SV Info */}
      <div className="cb-card">
        <h3>Thông tin học viên</h3>
        <div className="cb-info-row">
          <div className="cb-info-item">
            <span className="cb-label">Tên học viên</span>
            <b>{baiNop.HoTen}</b>
          </div>
          <div className="cb-info-item">
            <span className="cb-label">Mã học viên</span>
            <b>{baiNop.MaSinhVien}</b>
          </div>
          <div className="cb-info-item">
            <span className="cb-label">MSSV (Trường)</span>
            <b>{baiNop.MSSV || "—"}</b>
          </div>
          <div className="cb-info-item">
            <span className="cb-label">Ngày nộp</span>
            <b>{baiNop.NgayNop ? new Date(baiNop.NgayNop).toLocaleString("vi-VN") : "—"}</b>
          </div>
        </div>
      </div>

      {/* Gọi component con hiển thị chi tiết bài làm học viên */}
      <NoiDungBaiLam
        isExam={isExam}
        hasSections={hasSections}
        parsedSubmission={parsedSubmission}
        parsedContent={parsedContent}
        exercise={exercise}
        baiNop={baiNop}
        questionsList={questionsList}
        deiBai={deiBai}
        isMC={isMC}
        mcQuestions={mcQuestions}
        mcAnswers={mcAnswers}
        API={API}
      />

      {/* Chấm điểm */}
      <div className="cb-card">
        <h3>Chấm điểm</h3>

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
            {loading ? "Đang lưu..." : "Xác nhận chấm bài"}
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
