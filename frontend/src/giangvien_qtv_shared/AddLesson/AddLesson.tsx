import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const AddLesson: React.FC = () => {
  const navigate = useNavigate();
  const { buoiHocId } = useParams();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("Video");
  const [duration, setDuration] = useState("");
  const [lessonDate, setLessonDate] = useState("");
  const [moTa, setMoTa] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [level, setLevel] = useState("Beginner");
  const [link, setLink] = useState("");

  const [isFree, setIsFree] = useState(false);

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
    if (!lessonDate) { alert("Vui lòng chọn ngày dạy"); return; }

    try {
      setUploading(true);
      let fileUrl = "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch("http://14.225.192.252:5000/upload", {
          method: "POST",
          body: formData
        });
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url || "";
      }

      if (link && !fileUrl) fileUrl = link;

      const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
      const isTeacher = user.VaiTro === "Giảng Viên";

      const newLesson = {
        TieuDe: name,
        LoaiBaiHoc: type,
        ThoiLuong: duration ? duration + " phút" : "0 phút",
        TrangThai: isTeacher ? (status === "draft" ? "draft" : "pending") : status,
        NoiDung: moTa, // ← lưu Markdown
        FileUrl: fileUrl,
        ThuTu: 1,
        MaKhoaHoc: 1,
        MaGiangVien: user.MaNguoiDung || 1,
        MaBuoiHoc: Number(buoiHocId),
        IsFree: isFree ? 1 : 0
      };

      await fetch("http://14.225.192.252:5000/baigiang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLesson)
      });

      if (isTeacher) {
        alert("Gửi yêu cầu duyệt bài giảng thành công! Bài giảng sẽ hiển thị sau khi được phê duyệt.");
      } else {
        alert("Thêm bài giảng thành công!");
      }
      navigate(-1);

    } catch (err) {
      console.log(err);
      alert("Lỗi khi thêm bài giảng");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="al-wrapper">

      <div className="back-btn" onClick={() => navigate(-1)}>← Quay lại</div>
      <h1 className="page-title">Thêm bài giảng</h1>

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

          <label>Ngày dạy *</label>
          <input
            type="date"
            value={lessonDate}
            onChange={(e) => setLessonDate(e.target.value)}
          />

          <label>Loại nội dung *</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Video</option>
            <option>PDF</option>
            <option>Writing</option>
            <option>Audio</option>
          </select>

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

          <div className="row">
            <div>
              <label>Thời lượng (phút)</label>
              <input
                type="number"
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <label>Mức độ</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: '500', color: '#5a3e2b' }}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={e => setIsFree(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#F95800', cursor: 'pointer' }}
              />
              <span>Cho phép học thử miễn phí (Free)</span>
            </label>
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
            {JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}").VaiTro === "Giảng Viên" ? (
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
