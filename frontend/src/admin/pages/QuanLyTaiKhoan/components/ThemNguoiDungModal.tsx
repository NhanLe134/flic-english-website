import { GV_PERMISSIONS, QTND_PERMISSIONS } from "../hangSo";

interface ThemNguoiDungModalProps {
  show: boolean;
  newUser: any;
  setNewUser: React.Dispatch<React.SetStateAction<any>>;
  newPermissions: string[];
  setNewPermissions: React.Dispatch<React.SetStateAction<string[]>>;
  handleNewUserPermissionToggle: (permCode: string) => void;
  addErrors: { username?: string; fullname?: string; email?: string; password?: string };
  onClose: () => void;
  onCreate: () => Promise<void>;
}

export default function ThemNguoiDungModal({
  show,
  newUser,
  setNewUser,
  newPermissions,
  setNewPermissions,
  handleNewUserPermissionToggle,
  addErrors,
  onClose,
  onCreate,
}: ThemNguoiDungModalProps) {
  if (!show) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="modal account-modal">
        <div className="modal-header-container">
          <div className="modal-header">
            <h3>Thêm người dùng mới</h3>
            <span className="close" onClick={onClose}>×</span>
          </div>
          <p className="modal-sub">Điền thông tin để tạo tài khoản mới</p>
        </div>

        <div className="modal-scrollable-body">
          <div className="form-field">
            <label>Tên đăng nhập <span className="required-star">*</span></label>
            <input
              placeholder="VD: nguyenvana"
              value={newUser.username}
              onChange={e => setNewUser({ ...newUser, username: e.target.value })}
            />
            {addErrors.username && <span className="error-message">{addErrors.username}</span>}
          </div>

          <div className="form-field">
            <label>Họ và tên <span className="required-star">*</span></label>
            <input
              placeholder="Nguyễn Văn A"
              value={newUser.fullname}
              onChange={e => setNewUser({ ...newUser, fullname: e.target.value })}
            />
            {addErrors.fullname && <span className="error-message">{addErrors.fullname}</span>}
          </div>

          <div className="form-field">
            <label>Email <span className="required-star">*</span></label>
            <input
              placeholder="example@email.com"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            />
            {addErrors.email && <span className="error-message">{addErrors.email}</span>}
          </div>

          <div className="form-field">
            <label>Mật khẩu <span className="required-star">*</span></label>
            <input
              type="password"
              placeholder="Mặc định: 123456"
              value={newUser.password}
              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            />
            {addErrors.password && <span className="error-message">{addErrors.password}</span>}
          </div>

          <div className="form-field">
            <label>Giới tính</label>
            <select
              value={newUser.gioiTinh}
              onChange={e => setNewUser({ ...newUser, gioiTinh: e.target.value })}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div className="form-field">
            <label>Vai trò</label>
            <select
              value={newUser.role}
              onChange={e => {
                const selectedRole = e.target.value;
                setNewUser({ ...newUser, role: selectedRole });
                if (selectedRole === "Giảng Viên") {
                  setNewPermissions(GV_PERMISSIONS.map(p => p.code));
                } else if (selectedRole === "Quản Trị Nội Dung") {
                  setNewPermissions(QTND_PERMISSIONS.map(p => p.code));
                } else {
                  setNewPermissions([]);
                }
              }}
            >
              <option value="Giảng Viên">Giảng Viên</option>
              <option value="Quản Trị Nội Dung">Quản Trị Nội Dung</option>
            </select>
          </div>

          {/* PHÂN QUYỀN */}
          {newUser.role === "Quản Trị Nội Dung" && (
            <div className="permissions-section">
              <div className="permissions-title">Phân quyền</div>
              <div className="permissions-grid">
                {QTND_PERMISSIONS.map(p => (
                  <label key={p.code} className="permission-item">
                    <input
                      type="checkbox"
                      checked={newPermissions.includes(p.code)}
                      onChange={() => handleNewUserPermissionToggle(p.code)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {newUser.role === "Giảng Viên" && (
            <div className="permissions-section">
              <div className="permissions-title">Phân quyền</div>
              <div className="permissions-grid">
                {GV_PERMISSIONS.map(p => (
                  <label key={p.code} className="permission-item">
                    <input
                      type="checkbox"
                      checked={newPermissions.includes(p.code)}
                      onChange={() => handleNewUserPermissionToggle(p.code)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="cancel" onClick={onClose}>Hủy</button>
          <button className="save" onClick={onCreate}>Tạo tài khoản</button>
        </div>
      </div>
    </div>
  );
}
