import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEye, FiTrash2, FiSearch, FiBookOpen } from "react-icons/fi";
import "./LessonManagement.css";

interface LessonManagementProps {
  buoiHocIdProp?: string;
  isEmbedded?: boolean;
}

const LessonManagement: React.FC<LessonManagementProps> = ({ buoiHocIdProp, isEmbedded }) => {
  const navigate = useNavigate();
  const { buoiHocId: paramBuoiHocId } = useParams();
  const buoiHocId = buoiHocIdProp || paramBuoiHocId;

  const [lessons, setLessons] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [showReuseModal, setShowReuseModal] = useState(false);
  const [allExistingLectures, setAllExistingLectures] = useState<any[]>([]);
  const [reuseSearch, setReuseSearch] = useState("");

  const openReuseModal = async () => {
    setShowReuseModal(true);
    try {
      const userStr = sessionStorage.getItem("user");
      let url = "http://localhost:5000/baigiang/list/all";
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.MaNguoiDung) {
          url += `?maNguoiDung=${user.MaNguoiDung}`;
        }
      }
      const res = await fetch(url);
      const data = await res.json();
      setAllExistingLectures(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReuseLecture = async (lectureId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/baigiang/${lectureId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaBuoiHoc: buoiHocId })
      });
      if (res.ok) {
        // Refresh lessons list
        const lRes = await fetch(`http://localhost:5000/baigiang/${buoiHocId}`);
        const lData = await lRes.json();
        setLessons(lData);
        setShowReuseModal(false);
      } else {
        const txt = await res.text();
        alert("Không thể dùng lại bài giảng: " + txt);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err);
    }
  };

  useEffect(() => {
    if (!buoiHocId) return;
    fetch(`http://localhost:5000/baigiang/${buoiHocId}`)
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(err => console.log(err));
  }, [buoiHocId]);

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (selectedId !== null) {
      await fetch(`http://localhost:5000/baigiang/${selectedId}`, {
        method: "DELETE"
      });
      setLessons(lessons.filter(l => l.MaBaiHoc !== selectedId));
    }
    setShowModal(false);
    setSelectedId(null);
  };



  return (
    <div className="lm-wrapper">
      {!isEmbedded && (
        <span className="back-btn-span" onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Quay lại
        </span>
      )}

      {/* PAGE HEADER */}
      {!isEmbedded && (
        <div className="page-header">
          <div>
            <h1 className="page-title">Quản lý bài giảng</h1>
          </div>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="shared-tab-toolbar">
        <form className="search-container" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="Tìm kiếm bài giảng..."
            className="search-input"
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
          <FiBookOpen size={14} style={{ marginRight: 6 }} /> Chọn BG có sẵn
        </button>
        <button className="add-btn" onClick={() => navigate(`/them-bai-giang/${buoiHocId}`)}>
          <FiPlus size={14} style={{ marginRight: 6 }} /> Thêm BG mới
        </button>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên bài giảng</th>
              <th>Thời lượng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {lessons
              .filter(l => l.TieuDe?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((l, index) => (
                <tr key={l.MaBaiHoc}>
                  <td>{index + 1}</td>
                  <td>{l.TieuDe}</td>
                  <td>{l.ThoiLuong}</td>
                  <td>
                    <span
                      className="status-pill"
                      style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background:
                          l.TrangThai === "published" ? "#e8f5e9" :
                          l.TrangThai === "pending" ? "#fff3e0" :
                          l.TrangThai === "rejected" ? "#ffebee" : "#eee",
                        color:
                          l.TrangThai === "published" ? "#2e7d32" :
                          l.TrangThai === "pending" ? "#F95800" :
                          l.TrangThai === "rejected" ? "#c62828" : "#666"
                      }}
                    >
                      {l.TrangThai === "published" ? "Đã duyệt" :
                       l.TrangThai === "pending" ? "Chờ duyệt" :
                       l.TrangThai === "rejected" ? "Từ chối" : l.TrangThai || "Nháp"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-icon-btn detail-icon-btn"
                        onClick={() => navigate(`/bai-giang/${l.MaBaiHoc}`)}
                        title="Xem chi tiết">
                        <FiEye size={16} />
                      </button>
                      <button className="action-btn minitest-btn"
                        onClick={() => navigate(`/create-exercise/${buoiHocId}?maBaiHoc=${l.MaBaiHoc}&isMiniTest=true`)}
                        title="Tạo MiniTest">
                        <FiPlus size={14} style={{ marginRight: 4 }} />
                        <span>MiniTest</span>
                      </button>
                      <button className="action-icon-btn delete-icon-btn"
                        onClick={() => handleDeleteClick(l.MaBaiHoc)}
                        title="Xóa bài học">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* DELETE MODAL */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: "white", borderRadius: "12px", padding: "24px", width: "400px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #cbd5e1", textAlign: "center"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
              Xác nhận xóa bài học
            </h3>
            <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 20px 0", lineHeight: "1.5" }}>
              Bạn có chắc chắn muốn xóa bài học này?
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "8px 16px", background: "#f3f4f6", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#374151" }}
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                style={{ padding: "8px 16px", background: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "white" }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {showReuseModal && (
        <div className="baigiang-modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: "800px", width: "90%", padding: "20px" }}>
            <h3 style={{ marginBottom: "15px" }}>Chọn bài giảng có sẵn</h3>
            
            <input
              type="text"
              placeholder="Tìm kiếm bài giảng..."
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
              {allExistingLectures.filter(bg => bg.TieuDe?.toLowerCase().includes(reuseSearch.toLowerCase())).length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>Không tìm thấy bài giảng nào.</div>
              ) : (
                allExistingLectures.filter(bg => bg.TieuDe?.toLowerCase().includes(reuseSearch.toLowerCase())).map((bg: any) => (
                  <div key={bg.MaBaiHoc} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0f9ff", padding: "10px", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                    <div style={{ flex: 1, paddingRight: "8px" }}>
                      <strong style={{ fontSize: "14px", color: "#0369a1", display: "block" }}>{bg.TieuDe}</strong>
                      <span style={{ fontSize: "11px", color: "#0284c7" }}>
                        {bg.LoaiBaiHoc} · Lớp: {bg.TenLop || bg.TenBuoiHoc}
                      </span>
                    </div>
                    <button
                      className="confirm-btn"
                      style={{ fontSize: "12px", padding: "5px 12px", width: "auto", margin: 0, background: "#0284c7" }}
                      onClick={() => handleReuseLecture(bg.MaBaiHoc)}
                    >
                      Chọn
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button className="cancel-btn" style={{ margin: 0 }} onClick={() => setShowReuseModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LessonManagement;

