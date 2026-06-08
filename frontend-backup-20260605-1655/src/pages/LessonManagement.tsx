import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./lessonManagement.css";

const LessonManagement: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [lessons, setLessons] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Tất cả");

  useEffect(() => {
    if (!lessonId) return;
    fetch(`http://localhost:5000/baigiang/${lessonId}`)
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(err => console.log(err));
  }, [lessonId]);

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

  // ← thêm hàm đổi trạng thái
  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      await fetch(`http://localhost:5000/baigiang/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TrangThai: newStatus })
      });
      setLessons(prev =>
        prev.map(l => l.MaBaiHoc === id ? { ...l, TrangThai: newStatus } : l)
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="lm-wrapper">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý bài giảng</h1>
          <p className="subtitle">Quản lý và tổ chức các bài học trong khóa học của bạn</p>
        </div>
        <button className="back-btn" onClick={() => navigate("/class/1")}>← Quay lại</button>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="🔍 Tìm bài học..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
        <button className="add-btn" onClick={() => navigate(`/them-bai-giang/${lessonId}`)}>
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
                    {/* ← đổi thành button có thể click */}
                    <span
                      className={`status ${l.TrangThai === "published" ? "published" : "draft"}`}
                      style={{ cursor: "pointer", userSelect: "none" }}
                      title="Bấm để đổi trạng thái"
                      onClick={() => toggleStatus(l.MaBaiHoc, l.TrangThai)}
                    >
                      {l.TrangThai === "published" ? "✅ Đã xuất bản" : "📝 Nháp"}
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