import "./DocumentManagement.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiSearch, FiBookOpen, FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { hasPermission } from "../../utils/permission";

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5000`
    : "http://14.225.192.252:5000";

interface DocumentManagementProps {
  buoiHocIdProp?: string;
  isEmbedded?: boolean;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ buoiHocIdProp, isEmbedded }) => {
  const navigate = useNavigate();
  const { buoiHocId: paramBuoiHocId } = useParams();
  const buoiHocId = buoiHocIdProp || paramBuoiHocId;

  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [classStatus, setClassStatus] = useState<string>("");

  const handleViewDocumentDetail = (doc: any) => {
    const fileUrl = doc.FileUrl
      ? (doc.FileUrl.startsWith("http") ? doc.FileUrl : `${API}${doc.FileUrl}`)
      : doc.NoiDung?.includes("File: /uploads/")
      ? `${API}${doc.NoiDung.split("File: ")[1]?.trim()}`
      : null;

    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${doc.TieuDe || "Tài liệu"}</title>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  padding: 40px;
                  max-width: 800px;
                  margin: 0 auto;
                  line-height: 1.6;
                  color: #333;
                }
                h1 { color: #000080; border-bottom: 2px solid #eee; padding-bottom: 12px; }
                p { font-size: 16px; white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>${doc.TieuDe || "Tài liệu"}</h1>
              <p>${doc.NoiDung || ""}</p>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  const [showReuseModal, setShowReuseModal] = useState(false);
  const [allExistingDocs, setAllExistingDocs] = useState<any[]>([]);
  const [reuseSearch, setReuseSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const openReuseModal = async () => {
    setShowReuseModal(true);
    try {
      const userStr = sessionStorage.getItem("user");
      let url = `${API}/tailieu/list/all`;
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.MaNguoiDung) {
          url += `?maNguoiDung=${user.MaNguoiDung}`;
        }
      }
      const res = await fetch(url);
      const data = await res.json();
      setAllExistingDocs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReuseDocument = async (docId: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API}/tailieu/${docId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaBuoiHoc: buoiHocId })
      });
      if (res.ok) {
        alert("Chọn tài liệu thành công!");
        // Refresh documents list
        const dRes = await fetch(`${API}/tailieu/${buoiHocId}`);
        const dData = await dRes.json();
        setDocuments(dData);
        setShowReuseModal(false);
      } else {
        const txt = await res.text();
        alert("Không thể dùng lại tài liệu: " + txt);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err);
    } finally {
      setIsProcessing(false);
    }
  };

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    if (!buoiHocId) return;
    fetch(`${API}/tailieu/${buoiHocId}`)
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(err => console.log(err));

    fetch(`${API}/buoihoc/${buoiHocId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.TrangThaiLopHoc) {
          setClassStatus(data.TrangThaiLopHoc);
        }
      })
      .catch(err => console.log(err));
  }, [buoiHocId]);

  const filteredDocs = documents.filter(doc =>
    (doc.TieuDe + doc.MoTa).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDelete = (id: number) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  /* ===== XÓA ===== */
  const handleConfirmDelete = async () => {
    if (selectedId !== null) {
      await fetch(`${API}/tailieu/${selectedId}`, { method: "DELETE" });
      setDocuments(documents.filter(doc => doc.MaTaiLieu !== selectedId));
    }
    setShowConfirm(false);
  };

  return (
    <div className="dm-wrapper">
      {!isEmbedded && (
        <span className="dm-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Quay lại
        </span>
      )}

      {/* PAGE HEADER */}
      {!isEmbedded && (
        <div className="page-header">
          <h1 className="page-title">Danh sách tài liệu</h1>
        </div>
      )}

      {/* SEARCH AND ADD */}
      <div className="shared-tab-toolbar">
        <form className="search-container" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: 0 }}>
          <input
            className="search-input"
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button" type="button">
            <FiSearch size={16} />
          </button>
        </form>
        {classStatus !== "Đã hoàn thành" && (hasPermission("DOCUMENT_CREATE_PENDING") || hasPermission("DOCUMENT_CREATE_DIRECT")) && (
          <>
            <button
              className="add-btn-reuse"
              onClick={openReuseModal}
            >
              <FiBookOpen size={14} style={{ marginRight: 6 }} /> Chọn tài liệu có sẵn
            </button>
            <button className="add-btn" onClick={() => navigate(`/them-tai-lieu/${buoiHocId}`)}>
              <FiPlus size={14} style={{ marginRight: 6 }} /> Thêm tài liệu
            </button>
          </>
        )}
      </div>

      {/* LIST */}
      <div className="doc-list">
        {filteredDocs.map(doc => (
          <div key={doc.MaTaiLieu} className="doc-card">
            <div className="doc-left">
              <h3 style={{ margin: 0 }}>{doc.TieuDe}</h3>
              <p className="doc-desc" style={{ marginTop: '4px' }}>{doc.MoTa}</p>
            </div>
            <div className="doc-right">
              <span className="doc-date">
                ⏱ Cập nhật: {new Date(doc.NgayCapNhat).toLocaleDateString("vi-VN")}
              </span>
              <button className="action-icon-btn detail-icon-btn" 
                onClick={() => handleViewDocumentDetail(doc)}
                title="Xem Chi Tiết">
                <FiEye size={16} />
              </button>
              {classStatus !== "Đã hoàn thành" && (
                <button className="action-icon-btn delete-icon-btn" 
                  onClick={() => handleOpenDelete(doc.MaTaiLieu)}
                  title="Xóa tài liệu">
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* DELETE MODAL */}
      {showConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
        }} onClick={() => setShowConfirm(false)}>
          <div style={{
            background: "white", borderRadius: "12px", width: "450px", maxWidth: "90%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0", overflow: "hidden", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Xóa tài liệu</span>
              <button type="button" onClick={() => setShowConfirm(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b", padding: 0, display: "flex", alignItems: "center" }}>&times;</button>
            </div>
            <div style={{ padding: "20px 24px", textAlign: "left" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#1e293b", lineHeight: "1.6" }}>
                Bạn có chắc chắn muốn xóa tài liệu này không?
              </p>
              <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#475569" }}>
                <strong>Lưu ý:</strong> Xóa xong không thể khôi phục lại được
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  style={{
                    padding: "8px 16px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1",
                    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  style={{
                    padding: "8px 16px", background: "#c20e0e", color: "white", border: "none",
                    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 700
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReuseModal && (
        <div className="confirm-overlay" style={{ zIndex: 1000 }}>
          <div className="confirm-modal" style={{ maxWidth: "800px", width: "90%", padding: "20px" }}>
            <h3 style={{ marginBottom: "15px" }}>Chọn tài liệu có sẵn</h3>
            
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={reuseSearch}
              onChange={e => setReuseSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                marginBottom: "15px",
                boxSizing: "border-box"
              }}
            />

            <div style={{ maxHeight: "450px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", padding: "2px", textAlign: "left" }}>
              {allExistingDocs.filter(doc => doc.TieuDe?.toLowerCase().includes(reuseSearch.toLowerCase())).length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>Không tìm thấy tài liệu nào.</div>
              ) : (
                allExistingDocs.filter(doc => doc.TieuDe?.toLowerCase().includes(reuseSearch.toLowerCase())).map((doc: any) => (
                  <div key={doc.MaTaiLieu} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0f9ff", padding: "10px", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                    <div style={{ flex: 1, paddingRight: "8px" }}>
                      <strong style={{ fontSize: "14px", color: "#0369a1", display: "block" }}>{doc.TieuDe}</strong>
                      <span style={{ fontSize: "11px", color: "#0284c7" }}>
                        Lớp: {doc.TenLop || doc.TenBuoiHoc}
                      </span>
                    </div>
                     <button
                      className="btn-confirm"
                      style={{ fontSize: "12px", padding: "5px 12px", width: "auto", margin: 0, background: "#0284c7", opacity: isProcessing ? 0.6 : 1 }}
                      disabled={isProcessing}
                      onClick={() => handleReuseDocument(doc.MaTaiLieu)}
                    >
                      {isProcessing ? "Đang xử lý..." : "Chọn"}
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button className="btn-cancel" style={{ margin: 0 }} onClick={() => setShowReuseModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentManagement;

