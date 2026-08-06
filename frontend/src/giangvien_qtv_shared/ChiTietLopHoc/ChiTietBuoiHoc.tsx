import "./ChiTietBuoiHoc.css";
import { formatScheduleOnlyDays } from "../../utils/schedule";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FiCalendar, FiArrowLeft, FiSearch } from "react-icons/fi";
import { FaClock, FaBook } from "react-icons/fa";
import LessonManagement from "../LessonManagement/LessonManagement";
import DocumentManagement from "../DocumentManagement/DocumentManagement";
import { hasPermission } from "../../utils/permission";
import { useChiTietBuoiHoc } from "./useChiTietBuoiHoc";
import BangBaiTap from "./BangBaiTap";

const ChiTietBuoiHoc = () => {
  const navigate = useNavigate();
  const { teacherId, maLop, buoiId, tab } = useParams<{ teacherId?: string; maLop?: string; buoiId?: string; tab?: string }>();
  const id = buoiId ? buoiId.replace("buoi", "") : "";

  // Sử dụng custom hook để lấy toàn bộ logic xử lý
  const {
    buoiHoc,
    activeTab,
    setActiveTab,
    exerciseSearch,
    setExerciseSearch,
    filterType,
    setFilterType,
    filteredExercises,
    showDeleteModal,
    setShowDeleteModal,
    setSelectedId,
    handleToggleOpen,
    handleDelete,
  } = useChiTietBuoiHoc(id);

  // Điều hướng mặc định sang /:teacherId/lophoc/:maLop/:buoiId/bt nếu không có tab
  useEffect(() => {
    if (!tab) {
      navigate(`/${teacherId}/lophoc/${maLop}/${buoiId}/bt`, { replace: true });
    } else {
      if (tab === "bt" && activeTab !== "exercises") setActiveTab("exercises");
      if (tab === "bg" && activeTab !== "lectures") setActiveTab("lectures");
      if (tab === "tl" && activeTab !== "documents") setActiveTab("documents");
    }
  }, [id, tab, maLop, teacherId, buoiId, navigate, activeTab, setActiveTab]);

  if (!buoiHoc) return <p className="loading-text">Đang tải dữ liệu...</p>;

  return (
    <div className="cd2-wrapper">
      {/* Nút quay lại trang trước */}
      <span className="cd2-back-btn" onClick={() => navigate(`/${teacherId}/lophoc/${maLop}`)}>
        <FiArrowLeft size={16} className="cd-back-btn-icon" />
        Quay lại
      </span>

      {/* Thẻ tổng quan buổi học */}
      <div className="cd-overview-card">
        <div className="cd-left-content">
          <h2 className="cd-class-title">{buoiHoc.TenBuoiHoc}</h2>

          <div className="cd-meta-grid">
            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaClock />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Lịch học</span>
                <span className="cd-meta-value">{formatScheduleOnlyDays(buoiHoc.LichHoc)}</span>
              </div>
            </div>

            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaBook />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Trạng thái</span>
                <span className="cd-meta-value">{buoiHoc.TrangThaiLopHoc || "Đang học"}</span>
              </div>
              <span className="cd-class-id">
                Mã lớp: {buoiHoc.MaLopHoc}
              </span>
            </div>
          </div>
        </div>

        <div className="cd-right-content">
          <span className="status-badge">
            {buoiHoc.TrangThaiLopHoc || "Đang học"}
          </span>
          <span className="cd-class-dates">
            <FiCalendar size={13} className="cd-back-btn-icon" />
            {new Date(buoiHoc.NgayBatDau).toLocaleDateString("vi-VN")} -{" "}
            {new Date(buoiHoc.NgayKetThuc).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>

      {/* Tabs điều hướng */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "exercises" ? "active" : ""}`}
          onClick={() => navigate(`/${teacherId}/lophoc/${maLop}/${buoiId}/bt`)}
        >
          Bài tập
        </button>
        <button
          className={`tab ${activeTab === "lectures" ? "active" : ""}`}
          onClick={() => navigate(`/${teacherId}/lophoc/${maLop}/${buoiId}/bg`)}
        >
          Bài giảng
        </button>
        <button
          className={`tab ${activeTab === "documents" ? "active" : ""}`}
          onClick={() => navigate(`/${teacherId}/lophoc/${maLop}/${buoiId}/tl`)}
        >
          Tài liệu
        </button>
      </div>

      {/* Tab Bài tập */}
      {activeTab === "exercises" && (
        <div className="lesson-tab-section">
          {/* Thanh Toolbar lọc & thêm bài tập */}
          <div className="shared-tab-toolbar">
            <form className="search-container" onSubmit={(e) => e.preventDefault()}>
              <input
                className="search-input"
                placeholder="Tìm kiếm bài tập..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
              />
              <button className="search-button" type="button" aria-label="Tìm kiếm">
                <FiSearch size={16} />
              </button>
            </form>

            <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
              <option value="all">Tất cả bài</option>
              <option value="homework">Bài tập</option>
              <option value="exam">Bài kiểm tra</option>
              <option value="practice">Bài LTT</option>
            </select>

            {/* Các nút bấm thêm bài tập */}
            {buoiHoc?.TrangThaiLopHoc !== "Đã hoàn thành" &&
              buoiHoc?.TrangThai !== "Đã hoàn thành" &&
              (hasPermission("BAITAP_CREATE") || hasPermission("QUIZ_CREATE")) && (
                <button className="add-btn" onClick={() => navigate(`/create-exercise/${id}`)}>
                  + Tạo BT/KT
                </button>
              )}

            {buoiHoc?.TrangThaiLopHoc !== "Đã hoàn thành" &&
              buoiHoc?.TrangThai !== "Đã hoàn thành" &&
              hasPermission("EXTRA_PRACTICE_CREATE") && (
                <button
                  className="add-btn-reuse"
                  onClick={() => navigate(`/create-exercise/${id}?isPractice=true`)}
                >
                  + Tạo bài LTT
                </button>
              )}

            <div className="ep-total-box">
              <p>Tổng số bài tập</p>
              <b>{filteredExercises.length}</b>
            </div>
          </div>

          {/* Bảng danh sách bài tập */}
          <BangBaiTap
            filteredExercises={filteredExercises}
            lesson={buoiHoc}
            buoiHocId={id}
            handleToggleOpen={handleToggleOpen}
            setSelectedId={setSelectedId}
            setShowDeleteModal={setShowDeleteModal}
          />
        </div>
      )}

      {/* Tab Bài giảng */}
      {activeTab === "lectures" && <LessonManagement buoiHocIdProp={id} isEmbedded={true} />}

      {/* Tab Tài liệu */}
      {activeTab === "documents" && <DocumentManagement buoiHocIdProp={id} isEmbedded={true} />}

      {/* Modal xác nhận xóa bài tập */}
      {showDeleteModal && (
        <div
          className="cd-modal-overlay"
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedId(null);
          }}
        >
          <div
            className="cd-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cd-modal-header">
              <span className="cd-modal-title">Xóa bài tập</span>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedId(null);
                }}
                className="cd-modal-close-btn"
              >
                &times;
              </button>
            </div>
            <div className="cd-modal-body">
              <p className="cd-modal-body-p">
                Bạn có chắc chắn muốn xóa bài tập này không?
              </p>
              <p className="cd-modal-body-p-note">
                <strong>Lưu ý:</strong> Xóa xong không thể khôi phục lại được
              </p>
              <div className="cd-modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedId(null);
                  }}
                  className="cd-modal-cancel-btn"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="cd-modal-delete-btn"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChiTietBuoiHoc;
