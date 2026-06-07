import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./addLesson.css";
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
  const { lessonId } = useParams();

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
        const uploadRes = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData
        });
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url ? `http://localhost:5000${uploadData.url}` : "";
      }

      if (link && !fileUrl) fileUrl = link;

      const newLesson = {
        TieuDe: name,
        LoaiBaiHoc: type,
        ThoiLuong: duration + " phút",
        TrangThai: status,
        NoiDung: moTa, // ← lưu Markdown
        FileUrl: fileUrl,
        ThuTu: 1,
        MaKhoaHoc: 1,
        MaGiangVien: 1,
        MaLesson: Number(lessonId)
      };

      await fetch("http://localhost:5000/baigiang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLesson)
      });

      alert("Thêm bài giảng thành công!");
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
            >
              {uploading ? "Đang lưu..." : "Xuất bản ngay"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddLesson;