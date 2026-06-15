import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./lessonManagement.css";

const LessonManagement: React.FC = () => {
  const navigate = useNavigate();
  const { buoiHocId } = useParams();

  const [lessons, setLessons] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Tất cả");

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
      <span className="back-btn-span" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Quay lại
      </span>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý bài giảng</h1>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
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
        <button className="add-btn" onClick={() => navigate(`/them-bai-giang/${buoiHocId}`)}>
          + Thêm bài học mới
        </button>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>#</th>
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

    </div>
  );
};

export default LessonManagement;