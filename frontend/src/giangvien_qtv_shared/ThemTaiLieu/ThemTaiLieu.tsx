import "./ThemTaiLieu.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useRef } from "react";

const ThemTaiLieu = () => {
  const navigate = useNavigate();
  const { buoiHocId } = useParams();

  const [showSuccess, setShowSuccess] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loai, setLoai] = useState("Tệp");
  const [linkUrl, setLinkUrl] = useState("");
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

  const [successMessage, setSuccessMessage] = useState("Lưu kết quả thành công");

  const handleSave = async () => {
    if (!title) { alert("Vui lòng nhập tên tài liệu"); return; }

    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
    const user = JSON.parse(userStr || "{}");
    const status = "Đã duyệt";

    try {
      setUploading(true);
      let fileUrl = "";

      if (loai === "Tệp" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "/upload", {
          method: "POST",
          body: formData
        });
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url || "";
      } else if (loai === "Link" && linkUrl) {
        fileUrl = linkUrl;
      }

      await fetch((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "/tailieu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TieuDe: title,
          MoTa: description || "Tài liệu mới",
          NoiDung: "",
          FileUrl: fileUrl,
          MaBuoiHoc: Number(buoiHocId),
          TrangThai: status,
          MaGiangVien: user.MaNguoiDung || null
        })
      });

      setSuccessMessage("Tạo tài liệu thành công");
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
      <span className="back-btn" onClick={() => navigate(-1)}>← Quay lại</span>
      <h1 className="page-title">Thêm tài liệu</h1>

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
          <option value="Tệp">Tệp</option>
          <option value="Link">Link</option>
        </select>

        <label>Mô tả tài liệu</label>
        <textarea
          placeholder="Mô tả ngắn về tài liệu..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {loai === "Tệp" && (
          <>
            <label>Tải tập tin</label>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <div className="upload-selected" style={{ marginBottom: "16px" }} onClick={() => fileInputRef.current?.click()}>
                <span className="upload-filename">{selectedFile.name}</span>
                <span
                  className="upload-remove"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                >✕</span>
              </div>
            ) : (
              <div
                className={`upload-box ${isDragging ? "dragging" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">⬆️</div>
                <p>Kéo thả hoặc nhấn để chọn file</p>
                <span className="upload-hint">PDF, DOC, DOCX, PNG, JPG</span>
              </div>
            )}
          </>
        )}

        {loai === "Link" && (
          <>
            <label>Liên kết (YouTube / Drive / Link trực tiếp)</label>
            <input 
              type="text" 
              placeholder="https://..." 
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </>
        )}

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
            <p>{successMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ThemTaiLieu;

