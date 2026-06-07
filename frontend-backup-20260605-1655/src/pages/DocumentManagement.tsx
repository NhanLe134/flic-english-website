import "./documentManagement.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DocumentManagement = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    if (!lessonId) return;
    fetch(`http://localhost:5000/tailieu/${lessonId}`)
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(err => console.log(err));
  }, [lessonId]);

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

      {/* PAGE HEADER */}
      <div className="page-header">
        <h1 className="page-title">DANH SÁCH TÀI LIỆU</h1>
        <button className="back-btn" onClick={() => navigate("/class/1")}>← Quay lại</button>
      </div>

      {/* SEARCH */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm tài liệu"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={() => navigate(`/them-tai-lieu/${lessonId}`)}>
          + Thêm tài liệu
        </button>
      </div>

      {/* LIST */}
      <div className="doc-list">
            {filteredDocs.map(doc => (
              <div key={doc.MaTaiLieu} className="doc-card">
                <div className="doc-left">
                  <h3>{doc.TieuDe}</h3>
                  <p className="doc-desc">{doc.MoTa}</p>
                </div>
                <div className="doc-right">
                  <span className="doc-date">
                    ⏱ Cập nhật: {new Date(doc.NgayCapNhat).toLocaleDateString("vi-VN")}
                  </span>
                  <button className="detaill-btn" onClick={() => navigate(`/quan-ly-tai-lieu/${doc.MaTaiLieu}`)}>
                    Xem Chi Tiết
                  </button>
                  <button className="delete-btn" onClick={() => handleOpenDelete(doc.MaTaiLieu)}>
                    Xóa
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

    </div>
  );
};

export default DocumentManagement;