import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
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
  const [filterType, setFilterType] = useState("Tất cả");

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
            placeholder="Tìm bài học..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button" type="button">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option>Tất cả</option>
          <option>Video</option>
          <option>PDF</option>
          <option>Writing</option>
        </select>
        <button
          className="add-btn-reuse"
          onClick={openReuseModal}
        >
          + Chọn BG có sẵn
        </button>
        <button className="add-btn" onClick={() => navigate(`/them-bai-giang/${buoiHocId}`)}>
          + Thêm BG mới
        </button>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên bài giảng</th>
              <th>Loại</th>
              <th>Thời lượng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {lessons
              .filter(l => l.TieuDe?.toLowerCase().includes(searchTerm.toLowerCase()))
              .filter(l => filterType === "Tất cả" ? true : l.LoaiBaiHoc === filterType)
              .map((l, index) => (
                <tr key={l.MaBaiHoc}>
                  <td>{index + 1}</td>
                  <td>{l.TieuDe}</td>
                  <td>{l.LoaiBaiHoc}</td>
                  <td>{l.ThoiLuong}</td>
                  <td>
                    <span
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
                      <button className="action-btn discuss-btn"
                        onClick={() => navigate(`/lesson-discussion/${l.MaBaiHoc}`)}>
                        Thảo luận
                      </button>
                      <button className="action-btn minitest-btn"
                        onClick={() => navigate(`/create-exercise/${buoiHocId}?maBaiHoc=${l.MaBaiHoc}&isMiniTest=true`)}>
                        + MiniTest
                      </button>
                      <button className="action-btn detaill-btn"
                        onClick={() => navigate(`/bai-giang/${l.MaBaiHoc}`)}>
                        Xem chi tiết
                      </button>
                      <button className="action-btn deletee-btn"
                        onClick={() => handleDeleteClick(l.MaBaiHoc)}>
                        Xóa
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
        <div className="baigiang-modal-overlay">
          <div className="modal">
            <div className="modal-icon">!</div>
            <h3>Xác nhận Xóa</h3>
            <p>Bạn có chắc chắn muốn xóa bài học này?</p>
            <button className="confirm-btn" onClick={confirmDelete}>Xác nhận</button>
            <button className="cancel-btn" onClick={() => setShowModal(false)}>Không</button>
          </div>
        </div>
      )}

      {showReuseModal && (
        <div className="baigiang-modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: "600px", padding: "20px" }}>
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

            <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", padding: "2px", textAlign: "left" }}>
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

