import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEye, FiTrash2, FiSearch, FiBookOpen } from "react-icons/fi";
import "./LessonManagement.css";
import { hasPermission } from "../../utils/permission";

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
  const [isProcessing, setIsProcessing] = useState(false);

  const openReuseModal = async () => {
    setShowReuseModal(true);
    try {
      const userStr = sessionStorage.getItem("user");
      let url = "http://14.225.192.252:5000/baigiang/list/all";
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
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`http://14.225.192.252:5000/baigiang/${lectureId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaBuoiHoc: buoiHocId })
      });
      if (res.ok) {
        alert("Chọn bài giảng thành công!");
        // Refresh lessons list
        const lRes = await fetch(`http://14.225.192.252:5000/baigiang/${buoiHocId}`);
        const lData = await lRes.json();
        setLessons(lData);
        setShowReuseModal(false);
      } else {
        const txt = await res.text();
        alert("Không thể dùng lại bài giảng: " + txt);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!buoiHocId) return;
    fetch(`http://14.225.192.252:5000/baigiang/${buoiHocId}`)
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
      try {
        const res = await fetch(`http://14.225.192.252:5000/baigiang/${selectedId}`, {
          method: "DELETE"
        });
        if (res.ok) {
          setLessons(lessons.filter(l => l.MaBaiHoc !== selectedId));
        } else {
          const body = await res.text();
          alert("Xóa bài giảng thất bại: " + body);
        }
      } catch (err) {
        alert("Lỗi kết nối: " + err);
      }
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
        {hasPermission("LECTURE_CREATE") && (
          <>
            <button
              className="add-btn-reuse"
              onClick={openReuseModal}
            >
              <FiBookOpen size={14} style={{ marginRight: 6 }} /> Chọn BG có sẵn
            </button>
            <button className="add-btn" onClick={() => navigate(`/them-bai-giang/${buoiHocId}`)}>
              <FiPlus size={14} style={{ marginRight: 6 }} /> Thêm BG mới
            </button>
          </>
        )}
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
            background: "white", borderRadius: "12px", width: "450px", maxWidth: "90%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0", overflow: "hidden", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Xóa bài giảng</span>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b", padding: 0, display: "flex", alignItems: "center" }}>&times;</button>
            </div>
            <div style={{ padding: "20px 24px", textAlign: "left" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#1e293b", lineHeight: "1.6" }}>
                Bạn có chắc chắn muốn xóa bài giảng này không?
              </p>
              <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#475569" }}>
                <strong>Lưu ý:</strong> Xóa xong không thể khôi phục lại được
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "8px 16px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1",
                    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
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
                      style={{ fontSize: "12px", padding: "5px 12px", width: "auto", margin: 0, background: "#0284c7", opacity: isProcessing ? 0.6 : 1 }}
                      disabled={isProcessing}
                      onClick={() => handleReuseLecture(bg.MaBaiHoc)}
                    >
                      {isProcessing ? "Đang xử lý..." : "Chọn"}
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

