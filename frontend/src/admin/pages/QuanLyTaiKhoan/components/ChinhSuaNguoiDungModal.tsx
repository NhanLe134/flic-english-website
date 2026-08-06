import type { User } from "../kieuDuLieu";
import { GV_PERMISSIONS, QTND_PERMISSIONS } from "../hangSo";

interface ChinhSuaNguoiDungModalProps {
  show: boolean;
  selectedUser: User;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  permissions: string[];
  handlePermissionToggle: (permCode: string) => void;
  editErrors: { email?: string };
  onClose: () => void;
  onSave: () => Promise<void>;
}

export default function ChinhSuaNguoiDungModal({
  show,
  selectedUser,
  setSelectedUser,
  permissions,
  handlePermissionToggle,
  editErrors,
  onClose,
  onSave,
}: ChinhSuaNguoiDungModalProps) {
  if (!show) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="modal account-modal">
        <div className="modal-header-container">
          <div className="modal-header">
            <h3>Chỉnh sửa tài khoản</h3>
            <span className="close" onClick={onClose}>×</span>
          </div>
          <p className="modal-sub">Cập nhật thông tin người dùng</p>
        </div>

        <div className="modal-scrollable-body">
          <div className="form-field">
            <label>Họ và tên</label>
            <div className="info-value">{selectedUser.HoTen}</div>
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
            <label>Email</label>
            <input
              value={selectedUser.Email}
              onChange={e => setSelectedUser({ ...selectedUser, Email: e.target.value })}
            />
            {editErrors.email && <span className="error-message">{editErrors.email}</span>}
          </div>

          <div className="form-field">
            <label>Trạng thái</label>
            <select
              value={selectedUser.TrangThai}
              onChange={e => setSelectedUser({ ...selectedUser, TrangThai: e.target.value })}
            >
              <option value="Active">Hoạt động</option>
              <option value="Khóa">Khóa</option>
            </select>
          </div>

          {/* PHÂN QUYỀN */}
          {selectedUser.TrangThai !== "Khóa" && (
            <>
              {selectedUser.VaiTro === "Quản Trị Nội Dung" && (
                <div className="permissions-section">
                  <div className="permissions-title">Phân quyền</div>
                  <div className="permissions-grid">
                    {QTND_PERMISSIONS.map(p => (
                      <label key={p.code} className="permission-item">
                        <input
                          type="checkbox"
                          checked={permissions.includes(p.code)}
                          onChange={() => handlePermissionToggle(p.code)}
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
                      <label key={p.code} className="permission-item">
                        <input
                          type="checkbox"
                          checked={permissions.includes(p.code)}
                          onChange={() => handlePermissionToggle(p.code)}
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
          <button className="cancel" onClick={onClose}>Hủy</button>
          <button className="save" onClick={onSave}>Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
}
