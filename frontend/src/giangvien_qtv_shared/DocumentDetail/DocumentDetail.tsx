import "./DocumentDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

const DocumentDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [document, setDocument] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/tailieu/detail/${id}`)
      .then(res => res.json())
      .then(data => setDocument(data))
      .catch(err => console.log(err));
  }, [id]);

  if (!document) return <p>Đang tải...</p>;

  // Lấy file từ FileUrl (cột riêng) hoặc fallback từ NoiDung cũ
  const noidungText = document.NoiDung?.split("\nFile:")[0] || "";

  const fileUrl = document.FileUrl
    ? (document.FileUrl.startsWith("http") ? document.FileUrl : `${API}${document.FileUrl}`)
    : document.NoiDung?.includes("File: /uploads/")
    ? `${API}${document.NoiDung.split("File: ")[1]?.trim()}`
    : null;

  const isImage = fileUrl && /\.(png|jpg|jpeg|gif|webp)$/i.test(fileUrl);
  const isPdf = fileUrl && /\.pdf$/i.test(fileUrl);

  return (
    <div className="dd-wrapper">

      <div className="header-row" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>{document.TieuDe}</h1>
        <span style={{
          background: document.TrangThai === 'published' ? '#e8f5e9' : document.TrangThai === 'pending' ? '#fff3e0' : '#ffebee',
          color: document.TrangThai === 'published' ? '#2e7d32' : document.TrangThai === 'pending' ? '#F95800' : '#c62828',
          padding: "3px 12px",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600
        }}>
          {document.TrangThai === 'published' ? 'Đã duyệt' : document.TrangThai === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
        </span>
        <span className="back-btn" onClick={() => navigate(-1)} style={{ marginLeft: "auto" }}>← Quay lại</span>
      </div>

      <p className="sub-title">{document.MoTa}</p>

      <div className="detail-card">

        {/* NỘI DUNG TEXT */}
        {noidungText && (
          <div className="text-content">
            {noidungText}
          </div>
        )}

        {/* HIỂN THỊ ẢNH */}
        {isImage && (
          <div className="image-content">
            <img
              src={fileUrl!}
              alt="document visual"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* HIỂN THỊ PDF */}
        {isPdf && (
          <div className="pdf-content">
            <iframe
              src={fileUrl!}
              width="100%"
              height="600px"
              title="PDF viewer"
            />
          </div>
        )}

        {/* HIỂN THỊ FILE KHÁC - NÚT TẢI */}
        {fileUrl && !isImage && !isPdf && (
          <div className="file-download">
            <a href={fileUrl} target="_blank" rel="noreferrer">
              📄 Tải file đính kèm
            </a>
          </div>
        )}

      </div>

    </div>
  );
};

export default DocumentDetail;

