import "./permissionsAdmin.css";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

type User = {
  MaNguoiDung: number;
  TenDangNhap: string;
  HoTen: string;
  Email: string;
  GioiTinh: string;
  TrangThai: string;
  NgayTao: string;
  VaiTro: string;
};

type PendingChange = {
  user: User;
  perm: string;
  nextVal: boolean;
};

export default function PermissionsAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<"Quản Trị Nội Dung" | "Giảng Viên">("Quản Trị Nội Dung");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const loadUsers = () => {
    setLoading(true);
    fetch(`${API}/admin/users`)
      .then(r => r.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => showToast("Lỗi tải danh sách người dùng"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getUserPermissions = (userId: number): string[] => {
    const saved = localStorage.getItem(`user_perms_${userId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleCheckboxClick = (user: User, perm: string, currentVal: boolean) => {
    setPendingChange({
      user,
      perm,
      nextVal: !currentVal
    });
    setShowConfirmModal(true);
  };

  const confirmChange = () => {
    if (!pendingChange) return;
    const { user, perm, nextVal } = pendingChange;
    let newPerms = getUserPermissions(user.MaNguoiDung);

    if (user.VaiTro === "Quản Trị Nội Dung") {
      if (nextVal) {
        newPerms.push(perm);
        const hasOthers = ["Kiểm duyệt", "Xem báo cáo kết quả", "Quản lý các khoá học"].every(p => newPerms.includes(p));
        if (hasOthers) {
          newPerms.push("Tất cả");
        }
      } else {
        newPerms = newPerms.filter(p => p !== perm && p !== "Tất cả");
      }
    } else if (user.VaiTro === "Giảng Viên") {
      if (nextVal) {
        // Teachers have mutually exclusive permissions
        newPerms = [perm];
      } else {
        newPerms = newPerms.filter(p => p !== perm);
      }
    }

    localStorage.setItem(`user_perms_${user.MaNguoiDung}`, JSON.stringify(newPerms));
    showToast("Cập nhật quyền thành công!");
    setShowConfirmModal(false);
    setPendingChange(null);
  };

  const cancelChange = () => {
    setShowConfirmModal(false);
    setPendingChange(null);
  };

  // Filter users by activeRole and active status (locked users shouldn't have permissions displayed/managed)
  const filteredUsers = users.filter(u => u.VaiTro === activeRole && u.TrangThai !== "Khóa");

  // Columns for each role (excluding 'Tất cả' according to user instructions)
  const qtvndColumns = ["Kiểm duyệt", "Xem báo cáo kết quả", "Quản lý các khoá học"];
  const gvColumns = ["Có tất cả quyền nhưng không có quyền đăng tải", "Có tất cả quyền"];

  const activeColumns = activeRole === "Quản Trị Nội Dung" ? qtvndColumns : gvColumns;

  return (
    <div className="permissions-page">
      <h1>Quản lý phân quyền tài khoản</h1>
      <p className="sub-title">Xem và thiết lập các quyền chi tiết cho Giảng viên và Quản trị nội dung</p>

      {/* ROLE TABS */}
      <div className="role-tabs">
        <button
          className={`tab-btn ${activeRole === "Quản Trị Nội Dung" ? "active" : ""}`}
          onClick={() => setActiveRole("Quản Trị Nội Dung")}
        >
          Quản trị nội dung
        </button>
        <button
          className={`tab-btn ${activeRole === "Giảng Viên" ? "active" : ""}`}
          onClick={() => setActiveRole("Giảng Viên")}
        >
          Giảng viên
        </button>
      </div>

      {/* TABLE */}
      <div className="table-card">
        {loading ? (
          <p style={{ padding: "20px", color: "#64748b" }}>Đang tải...</p>
        ) : filteredUsers.length === 0 ? (
          <p style={{ padding: "24px", color: "#64748b", fontStyle: "italic" }}>
            Không tìm thấy tài khoản hoạt động nào cho vai trò này.
          </p>
        ) : (
          <table className="permissions-table">
            <thead>
              <tr>
                <th style={{ width: "250px" }}>Tên người dùng</th>
                {activeColumns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const userPerms = getUserPermissions(u.MaNguoiDung);
                return (
                  <tr key={u.MaNguoiDung}>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{u.HoTen}</td>
                    {activeColumns.map(col => {
                      const isChecked = userPerms.includes(col);
                      return (
                        <td key={col} className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxClick(u, col, isChecked)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CONFIRMATION POPUP */}
      {showConfirmModal && pendingChange && (
        <div className="admin-modal-overlay">
          <div className="modal">
            <h3>Xác nhận thay đổi quyền</h3>
            <p>
              {pendingChange.nextVal ? (
                <>Bạn muốn bổ sung quyền <strong>"{pendingChange.perm}"</strong> cho <strong>"{pendingChange.user.HoTen}"</strong>?</>
              ) : (
                <>Bạn muốn xóa quyền <strong>"{pendingChange.perm}"</strong> của <strong>"{pendingChange.user.HoTen}"</strong>?</>
              )}
            </p>
            <div className="modal-actions">
              <button className="cancel" onClick={cancelChange}>Hủy</button>
              <button className="confirm" onClick={confirmChange}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}
      {toast && <div className="toast-msg">{toast}</div>}
    </div>
  );
}
