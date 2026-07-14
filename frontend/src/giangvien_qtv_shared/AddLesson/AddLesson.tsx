import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./AddLesson.css";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  ListsToggle,
  InsertTable,
  BlockTypeSelect,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004");

const AddLesson: React.FC = () => {
  const navigate = useNavigate();
  const { buoiHocId } = useParams();
  const [searchParams] = useSearchParams();
  const editDraftId = searchParams.get("editDraftId");
  const [draftMaBuoiHoc, setDraftMaBuoiHoc] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editDraftId) return;

    fetch(`${API_BASE}/baigiang/detail/${editDraftId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setName(data.TieuDe || "");
          setMoTa(data.NoiDung || "");
          setLink(data.FileUrl || "");
          setIsFree(data.IsFree === 1);
          if (data.MaBuoiHoc) {
            setDraftMaBuoiHoc(Number(data.MaBuoiHoc));
          }
        }
      })
      .catch(err => console.error("Lỗi tải chi tiết bản nháp bài giảng:", err));

    fetch(`${API_BASE}/minitest/baigiang/${editDraftId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.CauHoi) {
          try {
            const questions = JSON.parse(data.CauHoi);
            if (Array.isArray(questions) && questions.length > 0) {
              setMinitestQuestions(questions);
              setHasMinitest(true);
            }
          } catch (e) {
            console.error("Lỗi parse câu hỏi MiniTest:", e);
          }
        }
      })
      .catch(err => console.error("Lỗi tải MiniTest của bản nháp:", err));
  }, [editDraftId]);

  const [name, setName] = useState("");
  const type = "Video";
  const duration = "";
  const [moTa, setMoTa] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [link, setLink] = useState("");

  const [isFree, setIsFree] = useState(false);

  const [hasMinitest, setHasMinitest] = useState(false);
  const [minitestQuestions, setMinitestQuestions] = useState<any[]>([
    { question: "", answers: ["", "", "", ""], correct: "A", explanation: "" }
  ]);

  const addMinitestQuestion = () => {
    setMinitestQuestions([
      ...minitestQuestions,
      { question: "", answers: ["", "", "", ""], correct: "A", explanation: "" }
    ]);
  };

  const removeMinitestQuestion = (index: number) => {
    if (minitestQuestions.length > 1) {
      setMinitestQuestions(minitestQuestions.filter((_, i) => i !== index));
    } else {
      alert("MiniTest cần có ít nhất 1 câu hỏi.");
    }
  };

  const updateQuestionField = (index: number, field: string, value: any) => {
    const copy = [...minitestQuestions];
    copy[index] = { ...copy[index], [field]: value };
    setMinitestQuestions(copy);
  };

  const updateQuestionAnswer = (qIndex: number, aIndex: number, value: string) => {
    const copy = [...minitestQuestions];
    const answers = [...copy[qIndex].answers];
    answers[aIndex] = value;
    copy[qIndex] = { ...copy[qIndex], answers };
    setMinitestQuestions(copy);
  };

  const handleMinitestFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let text = "";
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const mammothModule = await import("mammoth");
        const extractRawText = mammothModule.extractRawText || mammothModule.default?.extractRawText;
        if (!extractRawText) {
          throw new Error("Mammoth library did not export extractRawText");
        }
        const result = await extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        text = await file.text();
      }

      if (!text.trim()) {
        alert("File trống hoặc không đọc được nội dung.");
        return;
      }

      const qBoundary = /(?=Câu\s*\d+|Question\s*\d+|\b\d+\s*(?:[\.\)]|:(?!\d)))/i;
      const qBlocks = text.split(qBoundary).map(b => b.trim()).filter(Boolean);
      const parsed: any[] = [];
      
      for (const block of qBlocks) {
        const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) continue;

        let questionText = "";
        let answers = ["", "", "", ""];
        let correct = "A";
        let explanation = "";

        for (let line of lines) {
          if (/^[A]\s*[\.\:\)]\s*(.*)/i.test(line)) {
            answers[0] = line.match(/^[A]\s*[\.\:\)]\s*(.*)/i)![1].trim();
          } else if (/^[B]\s*[\.\:\)]\s*(.*)/i.test(line)) {
            answers[1] = line.match(/^[B]\s*[\.\:\)]\s*(.*)/i)![1].trim();
          } else if (/^[C]\s*[\.\:\)]\s*(.*)/i.test(line)) {
            answers[2] = line.match(/^[C]\s*[\.\:\)]\s*(.*)/i)![1].trim();
          } else if (/^[D]\s*[\.\:\)]\s*(.*)/i.test(line)) {
            answers[3] = line.match(/^[D]\s*[\.\:\)]\s*(.*)/i)![1].trim();
          } else if (/^(Đáp án đúng|Correct|Key|Đáp án|Chọn)\s*[\.\:\-]?\s*([A-D])/i.test(line)) {
            correct = line.match(/^(Đáp án đúng|Correct|Key|Đáp án|Chọn)\s*[\.\:\-]?\s*([A-D])/i)![2].toUpperCase();
          } else if (/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i.test(line)) {
            explanation = line.match(/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i)![2].trim();
          } else {
            if (answers.every(a => !a)) {
              if (questionText) questionText += "\n";
              questionText += line;
            } else {
              if (explanation) {
                explanation += "\n" + line;
              }
            }
          }
        }
        
        questionText = questionText.replace(/^(Câu\s*\d+\s*[\.\:\-]?\s*|Question\s*\d+\s*[\.\:\-]?\s*|\d+\s*[\.\:\)]\s*)/i, "").trim();
        parsed.push({
          question: questionText,
          answers,
          correct,
          explanation
        });
      }

      if (parsed.length > 0) {
        setMinitestQuestions(parsed);
        alert(`Đã quét thành công ${parsed.length} câu hỏi MiniTest từ file!`);
      } else {
        alert("Không thể phân tích câu hỏi nào. Vui lòng kiểm tra lại định dạng file.");
      }
    } catch (err) {
      alert("Lỗi khi đọc file: " + err);
    }
  };

  const handleChooseFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleAddLesson = async (status: "published" | "draft") => {
    if (!name) { alert("Vui lòng nhập tên bài giảng"); return; }

    try {
      setUploading(true);
      let fileUrl = "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: "POST",
          body: formData
        });
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url || "";
      }

      if (link && !fileUrl) fileUrl = link;

      const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
      const vaiTroLower = (user.VaiTro || "").toLowerCase().trim();
      const isTeacher = vaiTroLower === "giảng viên";

      const targetStatus = isTeacher ? (status === "draft" ? "Lưu nháp" : "Chờ duyệt") : (status === "draft" ? "Lưu nháp" : "Đã duyệt");

      const newLesson = {
        TieuDe: name,
        LoaiBaiHoc: type,
        ThoiLuong: duration ? duration + " phút" : "0 phút",
        TrangThai: targetStatus,
        NoiDung: moTa, // ← lưu Markdown
        FileUrl: fileUrl,
        ThuTu: 1,
        MaKhoaHoc: 1,
        MaGiangVien: user.MaNguoiDung || 1,
        MaBuoiHoc: (Number(buoiHocId) && Number(buoiHocId) !== 0) ? Number(buoiHocId) : (draftMaBuoiHoc || null),
        IsFree: isFree ? 1 : 0
      };

      const requestUrl = editDraftId 
        ? `${API_BASE}/baigiang/${editDraftId}`
        : `${API_BASE}/baigiang`;
      const requestMethod = editDraftId ? "PUT" : "POST";

      const res = await fetch(requestUrl, {
        method: requestMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLesson)
      });
      
      if (!res.ok) {
        throw new Error(editDraftId ? "Không thể cập nhật bài giảng" : "Không thể lưu bài giảng");
      }

      let createdMaBaiHoc = editDraftId;
      if (!editDraftId) {
        const resData = await res.json();
        createdMaBaiHoc = resData.MaBaiHoc;
      }

      if (hasMinitest && createdMaBaiHoc) {
        const minitestRes = await fetch(`${API_BASE}/minitest/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            MaBaiHoc: Number(createdMaBaiHoc),
            CauHoi: JSON.stringify(minitestQuestions),
            DiemDat: 100,
            TrangThai: targetStatus
          })
        });
        if (!minitestRes.ok) {
          throw new Error("Không thể đính kèm MiniTest");
        }
      }

      if (status === "draft") {
        alert(hasMinitest ? "Đã lưu bản nháp bài giảng và MiniTest thành công!" : "Đã lưu bản nháp bài giảng thành công!");
      } else {
        if (isTeacher) {
          alert(
            hasMinitest
              ? "Gửi yêu cầu duyệt bài giảng và MiniTest thành công! Nội dung sẽ hiển thị sau khi được phê duyệt."
              : "Gửi yêu cầu duyệt bài giảng thành công! Bài giảng sẽ hiển thị sau khi được phê duyệt."
          );
        } else {
          alert(hasMinitest ? "Thêm bài giảng và MiniTest thành công!" : "Thêm bài giảng thành công!");
        }
      }
      
      if (editDraftId) {
        navigate("/quan-ly-ban-nhap");
      } else {
        navigate(-1);
      }

    } catch (err) {
      console.log(err);
      alert("Lỗi khi thêm bài giảng");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="al-wrapper">

      <div className="back-btn" onClick={() => {
        if (editDraftId) {
          navigate("/quan-ly-ban-nhap");
        } else {
          navigate(-1);
        }
      }}>← Quay lại</div>
      <h1 className="page-title">{editDraftId ? "Chỉnh sửa bản nháp bài giảng" : "Thêm bài giảng"}</h1>

      <div className="form-layout">

        {/* LEFT */}
        <div className="left-card">
          <h3>Thông tin bài giảng</h3>

          <label>Tên bài giảng *</label>
          <input
            type="text"
            placeholder="Ví dụ: Bài 1 - Giới thiệu bản thân"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Mô tả nội dung</label>
          <div style={{ border: "1px solid #ddd", borderRadius: 8, marginBottom: 16, background: "#fff" }}>
            <MDXEditor
              markdown={moTa}
              onChange={setMoTa}
              plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                tablePlugin(),
                markdownShortcutPlugin(),
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <BlockTypeSelect />
                      <BoldItalicUnderlineToggles />
                      <ListsToggle />
                      <InsertTable />
                    </>
                  )
                })
              ]}
            />
          </div>
          
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: '500', color: '#5a3e2b' }}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={e => setIsFree(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#F95800', cursor: 'pointer', margin: 0 }}
              />
              <span>Cho phép học thử miễn phí (Free)</span>
            </label>
          </div>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #e2e8f0" }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: '600', color: '#000080', fontSize: '15px' }}>
              <input
                type="checkbox"
                checked={hasMinitest}
                onChange={e => setHasMinitest(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#F95800', cursor: 'pointer', margin: 0 }}
              />
              <span>Đính kèm bài kiểm tra nhanh (MiniTest)</span>
            </label>
            
            {hasMinitest && (
              <div style={{
                marginTop: 15,
                padding: "20px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #cbd5e1"
              }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#000080", fontSize: "14px", fontWeight: 700 }}>
                  Thiết lập câu hỏi cho MiniTest
                </h4>
                
                {/* File Scan Card */}
                <div style={{
                  background: "#ffffff",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "20px",
                  textAlign: "left"
                }}>
                  <h5 style={{ margin: "0 0 5px 0", color: "#000080", fontSize: "13px", fontWeight: 600 }}>
                    Quét câu hỏi từ file Word (.docx) hoặc Text (.txt)
                  </h5>
                  <p style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#475569", lineHeight: "1.4" }}>
                    Tự động điền nhanh danh sách câu hỏi. Định dạng file mẫu:
                  </p>
                  <pre style={{
                    background: "#f1f5f9",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "10px",
                    fontFamily: "Courier New, monospace",
                    whiteSpace: "pre-wrap",
                    color: "#334155",
                    margin: "0 0 10px 0",
                    border: "1px solid #e2e8f0"
                  }}>
{`Câu 1: She _______ English for 5 years.
A. has studied
B. studies
C. studied
D. is studying
Đáp án đúng: A
Giải thích: Hành động bắt đầu trong quá khứ kéo dài đến hiện tại (tùy chọn)`}
                  </pre>
                  <input
                    type="file"
                    accept=".txt,.docx"
                    onChange={handleMinitestFileScan}
                    style={{ fontSize: "12px", width: "100%" }}
                  />
                </div>

                {/* List of Questions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  {minitestQuestions.map((q, qIndex) => (
                    <div key={qIndex} style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "15px",
                      position: "relative"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <strong style={{ fontSize: 13, color: "#000080" }}>Câu hỏi {qIndex + 1}</strong>
                        {minitestQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMinitestQuestion(qIndex)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontWeight: "600",
                              padding: 0
                            }}
                          >
                            Xóa câu hỏi
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Nhập nội dung câu hỏi..."
                        value={q.question || ""}
                        onChange={e => updateQuestionField(qIndex, "question", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          marginBottom: "10px",
                          boxSizing: "border-box"
                        }}
                      />

                      {["A", "B", "C", "D"].map((lbl, aIndex) => (
                        <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontWeight: "bold", fontSize: 12, width: 15 }}>{lbl}.</span>
                          <input
                            type="text"
                            placeholder={`Lựa chọn ${lbl}`}
                            value={q.answers[aIndex] || ""}
                            onChange={e => updateQuestionAnswer(qIndex, aIndex, e.target.value)}
                            style={{
                              flex: 1,
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12.5px",
                              margin: 0,
                              boxSizing: "border-box"
                            }}
                          />
                        </div>
                      ))}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>
                            Đáp án đúng
                          </label>
                          <select
                            value={q.correct || "A"}
                            onChange={e => updateQuestionField(qIndex, "correct", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12.5px",
                              background: "#fff",
                              boxSizing: "border-box"
                            }}
                          >
                            <option value="A">Đáp án đúng: A</option>
                            <option value="B">Đáp án đúng: B</option>
                            <option value="C">Đáp án đúng: C</option>
                            <option value="D">Đáp án đúng: D</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>
                            Giải thích đáp án (tùy chọn)
                          </label>
                          <input
                            type="text"
                            placeholder="Giải thích..."
                            value={q.explanation || ""}
                            onChange={e => updateQuestionField(qIndex, "explanation", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12.5px",
                              margin: 0,
                              boxSizing: "border-box"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addMinitestQuestion}
                  style={{
                    marginTop: 15,
                    width: "100%",
                    padding: "10px",
                    background: "#000080",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px"
                  }}
                >
                  + Thêm câu hỏi trắc nghiệm
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-side">

          <div className="right-card">
            <h3>Tải nội dung</h3>
            <div
              className={`upload-box ${isDragging ? "dragging" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleChooseFile}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*,video/*,audio/*,application/pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="upload-selected">
                  <span>📄</span>
                  <span className="upload-filename">{selectedFile.name}</span>
                  <span
                    className="upload-remove"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  >✕</span>
                </div>
              ) : (
                <>
                  <div className="upload-icon">⬆</div>
                  <p>Kéo thả file vào đây</p>
                  <span>hoặc nhấn để chọn file</span>
                </>
              )}
            </div>

            <label style={{ marginTop: 16, display: "block" }}>
              Hoặc nhập link (YouTube / Google Drive)
            </label>
            <input
              placeholder="https://youtube.com/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="right-card">
            <h3>Hành động</h3>
            {(JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}").VaiTro || "").toLowerCase().trim() === "giảng viên" ? (
              <>
                <button
                  className="draft-btn"
                  disabled={uploading}
                  onClick={() => handleAddLesson("draft")}
                  style={{ width: "100%", marginBottom: "10px" }}
                >
                  {uploading ? "Đang lưu..." : "Lưu nháp"}
                </button>
                <button
                  className="publish-btn"
                  disabled={uploading}
                  onClick={() => handleAddLesson("published")}
                  style={{ width: "100%", background: "#F95800" }}
                >
                  {uploading ? "Đang gửi..." : "Gửi yêu cầu phê duyệt"}
                </button>
              </>
            ) : (
              <>
                <button
                  className="draft-btn"
                  disabled={uploading}
                  onClick={() => handleAddLesson("draft")}
                >
                  {uploading ? "Đang lưu..." : "Lưu nháp"}
                </button>
                <button
                  className="publish-btn"
                  disabled={uploading}
                  onClick={() => handleAddLesson("published")}
                  style={{ background: "#F95800" }}
                >
                  {uploading ? "Đang lưu..." : "Xuất bản ngay"}
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddLesson;

