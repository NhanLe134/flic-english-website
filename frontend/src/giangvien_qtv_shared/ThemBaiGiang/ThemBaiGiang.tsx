import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import "./ThemBaiGiang.css";
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

// Import component MiniTest con
import MiniTestSetup from "./MiniTestSetup";

const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004");

const ThemBaiGiang: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isQTV = location.pathname.startsWith("/QTV");
  const { buoiHocId } = useParams();
  const [searchParams] = useSearchParams();
  const editDraftId = searchParams.get("editDraftId");
  const [draftMaBuoiHoc, setDraftMaBuoiHoc] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const type = "Video";
  const duration = "";
  const [moTa, setMoTa] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [link, setLink] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [hasMinitest, setHasMinitest] = useState(false);
  
  const [minitestQuestions, setMinitestQuestions] = useState<any[]>([
    { question: "", answers: ["", "", "", ""], correct: "A", explanation: "" }
  ]);

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
          setEditorKey(prev => prev + 1);
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
        NoiDung: moTa,
        FileUrl: fileUrl,
        ThuTu: 1,
        MaKhoaHoc: null,
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
      
      if (isQTV) {
        navigate(-1);
      } else if (editDraftId) {
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
        if (isQTV) {
          navigate(-1);
        } else if (editDraftId) {
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

          <label>Nội dung bài giảng</label>
          <div style={{ border: "1px solid #ddd", borderRadius: 8, marginBottom: 16, background: "#fff" }}>
            <MDXEditor
              key={editorKey}
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
              <span>Cho phép học thử miễn phí </span>
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
              <MiniTestSetup
                minitestQuestions={minitestQuestions}
                setMinitestQuestions={setMinitestQuestions}
                handleMinitestFileScan={handleMinitestFileScan}
              />
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
                {!isQTV && (
                  <button
                    className="draft-btn"
                    disabled={uploading}
                    onClick={() => handleAddLesson("draft")}
                  >
                    {uploading ? "Đang lưu..." : "Lưu nháp"}
                  </button>
                )}
                <button
                  className="publish-btn"
                  disabled={uploading}
                  onClick={() => handleAddLesson("published")}
                  style={{ background: "#F95800", width: isQTV ? "100%" : undefined }}
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

export default ThemBaiGiang;
