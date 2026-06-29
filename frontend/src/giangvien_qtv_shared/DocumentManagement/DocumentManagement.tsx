import "./DocumentManagement.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiSearch, FiBookOpen, FiPlus, FiEye, FiTrash2 } from "react-icons/fi";

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

  const [showReuseModal, setShowReuseModal] = useState(false);
  const [allExistingDocs, setAllExistingDocs] = useState<any[]>([]);
  const [reuseSearch, setReuseSearch] = useState("");

  const openReuseModal = async () => {
    setShowReuseModal(true);
    try {
      const userStr = sessionStorage.getItem("user");
      let url = "http://localhost:5000/tailieu/list/all";
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
    try {
      const res = await fetch(`http://localhost:5000/tailieu/${docId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaBuoiHoc: buoiHocId })
      });
      if (res.ok) {
        // Refresh documents list
        const dRes = await fetch(`http://localhost:5000/tailieu/${buoiHocId}`);
        const dData = await dRes.json();
        setDocuments(dData);
        setShowReuseModal(false);
      } else {
        const txt = await res.text();
        alert("Không thể dùng lại tài liệu: " + txt);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err);
    }
  };

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    if (!buoiHocId) return;
    fetch(`http://localhost:5000/tailieu/${buoiHocId}`)
      .then(res => res.json())
      .then(data => setDocuments(data))
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
      await fetch(`http://localhost:5000/tailieu/${selectedId}`, { method: "DELETE" });
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
        <button
          className="add-btn-reuse"
          onClick={openReuseModal}
        >
          <FiBookOpen size={14} style={{ marginRight: 6 }} /> Chọn tài liệu có sẵn
        </button>
        <button className="add-btn" onClick={() => navigate(`/them-tai-lieu/${buoiHocId}`)}>
          <FiPlus size={14} style={{ marginRight: 6 }} /> Thêm tài liệu
        </button>
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
                onClick={() => navigate(`/quan-ly-tai-lieu/${doc.MaTaiLieu}`)}
                title="Xem Chi Tiết">
                <FiEye size={16} />
              </button>
              <button className="action-icon-btn delete-icon-btn" 
                onClick={() => handleOpenDelete(doc.MaTaiLieu)}
                title="Xóa tài liệu">
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DELETE MODAL */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="warning-icon">!</div>
            <h3>Xác nhận Xóa</h3>
            <p>Bạn có chắc chắn muốn xóa tài liệu này không?</p>
            <div className="confirm-buttons">
              <button className="btn-confirm" onClick={handleConfirmDelete}>Xác nhận</button>
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>Không</button>
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
                      style={{ fontSize: "12px", padding: "5px 12px", width: "auto", margin: 0, background: "#0284c7" }}
                      onClick={() => handleReuseDocument(doc.MaTaiLieu)}
                    >
                      Chọn
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

