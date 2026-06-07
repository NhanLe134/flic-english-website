import "./addDocument.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useRef } from "react";

const AddDocument = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [showSuccess, setShowSuccess] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loai, setLoai] = useState("Video");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleSave = async () => {
    if (!title) { alert("Vui lòng nhập tên tài liệu"); return; }

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
        fileUrl = uploadData.url || "";
      }

      await fetch("http://localhost:5000/tailieu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        TieuDe: title,
        MoTa: description || "Tài liệu mới",
        NoiDung: content,
        FileUrl: fileUrl,        // ← lưu riêng vào FileUrl
        MaLesson: Number(lessonId)
      })
    });

      setShowSuccess(true);
      setTimeout(() => navigate(-1), 1500);

    } catch (err) {
      console.log(err);
      alert("Lỗi khi thêm tài liệu");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="ad-wrapper">

      <div className="header-row">
        <h1>THÊM TÀI LIỆU</h1>
        <span className="back-btn" onClick={() => navigate(-1)}>← Quay lại</span>
      </div>

      <div className="form-card">
        <h3>Thông tin bài học</h3>

        <label>Tên bài học *</label>
        <input
          type="text"
          placeholder="Từ vựng Part 1 Toeic"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Loại nội dung *</label>
        <select value={loai} onChange={(e) => setLoai(e.target.value)}>
          <option>Video</option>
          <option>PDF</option>
          <option>Link</option>
        </select>

        <label>Nội dung</label>
        <textarea
          placeholder="Mô tả nội dung bài học..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label>Mô tả tài liệu</label>
        <textarea
          placeholder="Mô tả ngắn về tài liệu..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Tải tập tin</label>
        <div
          className={`upload-box ${isDragging ? "dragging" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
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
              <div className="upload-icon">⬆️</div>
              <p>Kéo thả hoặc nhấn để chọn file</p>
              <span className="upload-hint">PDF, DOC, DOCX, PNG, JPG</span>
            </>
          )}
        </div>

        <label>Hoặc liên kết (YouTube / Drive / Link trực tiếp)</label>
        <input type="text" placeholder="https://..." />

        <div className="save-row">
          <button className="save-btn" onClick={handleSave} disabled={uploading}>
            {uploading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-popup">
            <div className="success-icon">✓</div>
            <p>Lưu kết quả thành công</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddDocument;