import "./DanhSachBuoiHoc.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiArrowLeft, FiFileText, FiTrash2, FiPlay, FiBookOpen } from "react-icons/fi";
import { useDanhSachBuoiHoc } from "./useDanhSachBuoiHoc";

const DanhSachBuoiHoc = () => {
  const navigate = useNavigate();
  const { id, teacherId } = useParams<{ id: string; teacherId?: string }>();
  const location = useLocation();

  // Lấy tên khóa học và tên lớp học từ state truyền qua route
  const tenKhoaHoc = location.state?.tenKhoaHoc || "Chi tiết khóa học";
  const tenLop = location.state?.tenLop || "Danh sách buổi học";

  // Sử dụng custom hook để lấy logic nghiệp vụ
  const {
    cacBuoiHoc,
    danhSachLoc,
    tuKhoaTimKiem,
    setTuKhoaTimKiem,
    hienThiModalThem,
    setHienThiModalThem,
    trangThaiLopHoc,
    formBuoiHoc,
    setFormBuoiHoc,
    hopThoai,
    dongHopThoai,
    xuLyXoaBuoiHoc,
    xuLyCapNhatBuoiHocDangHoc,
    moModalThemBuoiHoc,
    luuBuoiHocMoi,
  } = useDanhSachBuoiHoc(id);

  return (
    <div className="lesson-wrapper">
      {/* Nút quay lại trang trước */}
      <span className="lesson-back" onClick={() => teacherId ? navigate(`/${teacherId}/lophoc`) : navigate(-1)}>
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
        Quay lại
      </span>

      {/* Tiêu đề trang */}
      <div className="lesson-header">
        <div>
          <h1 className="lesson-title">{tenLop}</h1>
          <p className="lesson-subtitle">{tenKhoaHoc}</p>
        </div>
      </div>

      {/* Thanh tìm kiếm và các nút chức năng */}
      <div className="action-bar-container">
        <form className="search-container" onSubmit={(e) => e.preventDefault()}>
          <input
            className="search-input"
            placeholder="Tìm kiếm buổi..."
            value={tuKhoaTimKiem}
            onChange={(e) => setTuKhoaTimKiem(e.target.value)}
          />
          <button className="search-button" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <div className="action-buttons">
          <button
            type="button"
            className="drafts-btn"
            onClick={() => navigate("/quan-ly-ban-nhap")}
          >
            <FiFileText size={16} />
            Quản lý bản nháp
          </button>

          {trangThaiLopHoc !== "Đã hoàn thành" && (
            <button
              type="button"
              className="create-lesson-btn"
              onClick={moModalThemBuoiHoc}
            >
              Tạo buổi học
            </button>
          )}
        </div>
      </div>

      {/* Bảng danh sách buổi học */}
      <div className="table-responsive">
        <table className="lesson-table">
          <thead>
            <tr>
              <th style={{ width: "80px", textAlign: "center" }}>Thứ tự</th>
              <th style={{ width: "220px" }}>Tên buổi học</th>
              <th>Mô tả</th>
              <th style={{ width: "120px", textAlign: "center" }}>Trạng thái</th>
              <th style={{ width: "90px", textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {danhSachLoc.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">
                  Không tìm thấy buổi học nào.
                </td>
              </tr>
            ) : (
              danhSachLoc.map((buoiHoc) => {
                const laBuoiDangMo = buoiHoc.TrangThai === "Đang học" || buoiHoc.TrangThai === "Đã mở";

                return (
                  <tr
                    key={buoiHoc.MaBuoiHoc}
                    className="lesson-row"
                    onClick={() =>
                      navigate(`/${teacherId}/lophoc/${id}/buoi${buoiHoc.MaBuoiHoc}/bt`, {
                        state: { tenKhoaHoc, tenLop, maLopHoc: id },
                      })
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {/* Cột Thứ tự */}
                    <td className="col-order">{buoiHoc.ThuTu}</td>

                    {/* Cột Tên buổi học */}
                    <td className="col-name">
                      <div className="lesson-title-cell">
                        <span className="lesson-name">{buoiHoc.TenBuoiHoc}</span>
                      </div>
                    </td>

                    {/* Cột Mô tả */}
                    <td className="col-desc">
                      {buoiHoc.MoTa ? (
                        <span className="lesson-desc-text">{buoiHoc.MoTa}</span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>
                          Không có mô tả
                        </span>
                      )}
                    </td>

                    {/* Cột Trạng thái */}
                    <td className="col-status">
                      {trangThaiLopHoc === "Đã hoàn thành" ? (
                        <span className={`status-badge ${laBuoiDangMo ? "opened" : "closed"}`}>
                          {laBuoiDangMo ? "Đã mở" : "Chưa mở"}
                        </span>
                      ) : buoiHoc.TrangThai === "Đã hoàn thành" ? (
                        <span className="status-badge closed" style={{ backgroundColor: "#e2e8f0", color: "#475569", border: "1px solid #cbd5e1" }}>
                          Đã hoàn thành
                        </span>
                      ) : laBuoiDangMo ? (
                        <div className="status-badge-container">
                          <span className="status-badge active-learning-badge">
                            Đang học
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-status-toggle"
                          onClick={(e) => {
                            e.stopPropagation();
                            xuLyCapNhatBuoiHocDangHoc(buoiHoc.MaBuoiHoc);
                          }}
                        >
                          Mở buổi
                        </button>
                      )}
                    </td>

                    {/* Cột Thao tác */}
                    <td className="col-actions">
                      <div className="actions-group" onClick={(e) => e.stopPropagation()}>
                        {trangThaiLopHoc !== "Đã hoàn thành" ? (
                          <button
                            type="button"
                            className="btn-delete"
                            title="Xóa buổi học"
                            onClick={(e) => {
                              e.stopPropagation();
                              xuLyXoaBuoiHoc(buoiHoc.MaBuoiHoc, buoiHoc.TenBuoiHoc);
                            }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "13px" }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm buổi học */}
      {hienThiModalThem && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-top">
              <h3>Thêm buổi học vào lộ trình</h3>
              <button className="modal-close" onClick={() => setHienThiModalThem(false)}>
                ×
              </button>
            </div>
            <p className="modal-sub">
              Lớp: {tenLop} · {tenKhoaHoc}
            </p>
            <div className="form-group">
              <label>
                Tên buổi học <span className="req">*</span>
              </label>
              <input
                value={formBuoiHoc.title}
                onChange={(e) => setFormBuoiHoc((p) => ({ ...p, title: e.target.value }))}
                placeholder="VD: Buổi 1: Ngữ pháp cơ bản"
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                value={formBuoiHoc.desc}
                onChange={(e) => setFormBuoiHoc((p) => ({ ...p, desc: e.target.value }))}
                placeholder="Nội dung buổi học..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Thứ tự</label>
              <input
                type="number"
                min={Math.max(1, cacBuoiHoc.length)}
                value={formBuoiHoc.order}
                onChange={(e) => setFormBuoiHoc((p) => ({ ...p, order: Number(e.target.value) }))}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setHienThiModalThem(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={luuBuoiHocMoi}>
                Thêm buổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hộp thoại thông báo & xác nhận tùy chỉnh */}
      {hopThoai.show && (
        <div className="custom-dialog-overlay">
          <div className="custom-dialog-container">
            <h3>{hopThoai.type === "confirm" ? "Xác nhận xóa" : "Thông báo"}</h3>
            <p className="dialog-main-message">{hopThoai.message}</p>
            {hopThoai.subMessage && <p className="dialog-sub-message">{hopThoai.subMessage}</p>}
            <div className="dialog-buttons">
              {hopThoai.type === "confirm" ? (
                <>
                  <button type="button" className="btn-dialog-cancel" onClick={dongHopThoai}>
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn-dialog-confirm"
                    onClick={() => {
                      dongHopThoai();
                      if (hopThoai.onConfirm) hopThoai.onConfirm();
                    }}
                  >
                    Xóa
                  </button>
                </>
              ) : (
                <button type="button" className="btn-dialog-close" onClick={dongHopThoai}>
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanhSachBuoiHoc;
