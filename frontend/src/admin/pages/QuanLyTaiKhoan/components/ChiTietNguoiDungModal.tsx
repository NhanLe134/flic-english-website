import type { User } from "../kieuDuLieu";
import { GV_PERMISSIONS, QTND_PERMISSIONS, isActive } from "../hangSo";

interface ChiTietNguoiDungModalProps {
  show: boolean;
  selectedUser: User;
  permissions: string[];
  onClose: () => void;
  onEditClick: () => void;
}

export default function ChiTietNguoiDungModal({
  show,
  selectedUser,
  permissions,
  onClose,
  onEditClick,
}: ChiTietNguoiDungModalProps) {
  if (!show) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="modal account-modal">
        <div className="modal-header-container">
          <div className="modal-header">
            <h3>Chi tiết tài khoản</h3>
            <span className="close" onClick={onClose}>×</span>
          </div>
          <p className="modal-sub">Thông tin chi tiết tài khoản người dùng</p>
        </div>

        <div className="modal-scrollable-body">
          <div className="form-field">
            <label>Họ và tên</label>
            <div className="info-value">{selectedUser.HoTen || "—"}</div>
          </div>

          <div className="form-field">
            <label>Tên đăng nhập</label>
            <div className="info-value">{selectedUser.TenDangNhap}</div>
          </div>

          <div className="form-field">
            <label>Email</label>
            <div className="info-value">{selectedUser.Email || "—"}</div>
          </div>

          <div className="form-field">
            <label>Giới tính</label>
            <div className="info-value">{selectedUser.GioiTinh || "Nam"}</div>
          </div>

          <div className="form-field">
            <label>Vai trò</label>
            <div className="info-value">{selectedUser.VaiTro}</div>
          </div>

          <div className="form-field">
            <label>Trạng thái</label>
            <div className="info-value">
              <span className={` ${isActive(selectedUser.TrangThai) ? "active" : "locked"}`}>
                {isActive(selectedUser.TrangThai) ? "Hoạt động" : "Khóa"}
              </span>
            </div>
          </div>

          <div className="form-field">
            <label>Ngày tạo</label>
            <div className="info-value">
              {selectedUser.NgayTao ? new Date(selectedUser.NgayTao).toLocaleDateString("vi-VN") : "—"}
            </div>
          </div>

          {/* PHÂN QUYỀN */}
          {selectedUser.TrangThai !== "Khóa" && (
            <>
              {selectedUser.VaiTro === "Quản Trị Nội Dung" && (
                <div className="permissions-section">
                  <div className="permissions-title">Phân quyền</div>
                  <div className="permissions-grid">
                    {QTND_PERMISSIONS.map(p => (
                      <label key={p.code} className="permission-item disabled">
                        <input
                          type="checkbox"
                          checked={permissions.includes(p.code)}
                          disabled
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.VaiTro === "Giảng Viên" && (
                <div className="permissions-section">
                  <div className="permissions-title">Phân quyền</div>
                  <div className="permissions-grid">
                    {GV_PERMISSIONS.map(p => (
                      <label key={p.code} className="permission-item disabled">
                        <input
                          type="checkbox"
                          checked={permissions.includes(p.code)}
                          disabled
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.VaiTro === "Quản Trị Viên" && (
                <div className="permissions-section">
                  <div className="permissions-title">Phân quyền</div>
                  <div className="permission-info-text">
                    Có tất cả quyền của Quản trị viên hệ thống.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="save" onClick={onEditClick}>
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}
