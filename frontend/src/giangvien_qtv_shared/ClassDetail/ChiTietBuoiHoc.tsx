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
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
        Quay lại
      </span>

      {/* Thẻ tổng quan buổi học */}
      <div
        className="cd-overview-card"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "18px 20px",
        }}
      >
        <div
          className="cd-left-content"
          style={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            marginRight: "auto",
          }}
        >
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
              <span
                className="cd-class-id"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: 1,
                  marginTop: "17px",
                  marginLeft: "10px",
                }}
              >
                Mã lớp: {buoiHoc.MaLopHoc}
              </span>
            </div>
          </div>
        </div>

        <div
          className="cd-right-content"
          style={{
            width: "auto",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            borderLeft: "1px dashed #e2e8f0",
            paddingLeft: "16px",
            paddingRight: "0px",
            flexShrink: 0,
            flexGrow: 0,
            gap: "12px",
            marginLeft: "auto",
            marginRight: "0px",
            alignSelf: "stretch",
          }}
        >
          <span
            className="status-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {buoiHoc.TrangThaiLopHoc || "Đang học"}
          </span>
          <span
            className="cd-class-dates"
            style={{
              display: "inline-flex",
              alignItems: "center",
              lineHeight: 1,
            }}
          >
            <FiCalendar size={13} style={{ marginRight: 6 }} />
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

            <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
              <option value="all">Tất cả bài</option>
              <option value="homework">Bài tập</option>
              <option value="exam">Bài kiểm tra</option>
              <option value="practice">Bài LTT</option>
            </select>

            {/* Các nút bấm thêm bài tập */}
            {buoiHoc?.TrangThaiLopHoc !== "Đã hoàn thành" &&
              buoiHoc?.TrangThai !== "Đã hoàn thành" &&
              (hasPermission("BAITAP_CREATE") || hasPermission("QUIZ_CREATE")) && (
                <button className="ep-add-btn" onClick={() => navigate(`/create-exercise/${id}`)}>
                  + Tạo BT/KT
                </button>
              )}

            {buoiHoc?.TrangThaiLopHoc !== "Đã hoàn thành" &&
              buoiHoc?.TrangThai !== "Đã hoàn thành" &&
              hasPermission("EXTRA_PRACTICE_CREATE") && (
                <button
                  className="ep-add-btn"
                  onClick={() => navigate(`/create-exercise/${id}?isPractice=true`)}
                  style={{
                    background: "#fff",
                    color: "#F95800",
                    border: "1.5px solid #F95800",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#fff4ec";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "#fff";
                  }}
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
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
          }}
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedId(null);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              width: "450px",
              maxWidth: "90%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Xóa bài tập</span>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedId(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#64748b",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: "20px 24px", textAlign: "left" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#1e293b", lineHeight: "1.6" }}>
                Bạn có chắc chắn muốn xóa bài tập này không?
              </p>
              <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#475569" }}>
                <strong>Lưu ý:</strong> Xóa xong không thể khôi phục lại được
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedId(null);
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: "8px 16px",
                    background: "#c20e0e",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
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
