import "./permissionsAdmin.css";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

const GV_PERMISSIONS = [
  { code: "LECTURE_CREATE", label: "Đăng bài giảng" },
  { code: "EXERCISE_CREATE", label: "Đăng bài tập" },
  { code: "QUIZ_CREATE", label: "Đăng bài kiểm tra" },
  { code: "EXTRA_PRACTICE_CREATE", label: "Đăng bài luyện tập thêm" },
  { code: "DOCUMENT_CREATE_PENDING", label: "Đăng tài liệu" },
  { code: "STUDENT_GRADE", label: "Chấm điểm bài tập" },
  { code: "GRADEBOOK_VIEW_CLASS", label: "Xem điểm lớp phụ trách" },
  { code: "SUBMISSION_VIEW", label: "Xem bài làm của SV" }
];

const QTND_PERMISSIONS = [
  { code: "CLASS_MANAGE", label: "Tạo & quản lý lớp" },
  { code: "STUDENT_ASSIGN", label: "Xếp lớp cho SV" },
  { code: "LECTURE_CREATE", label: "Đăng bài giảng" },
  { code: "EXERCISE_CREATE", label: "Đăng bài tập" },
  { code: "QUIZ_CREATE", label: "Đăng bài kiểm tra" },
  { code: "EXTRA_PRACTICE_CREATE", label: "Đăng bài luyện tập thêm" },
  { code: "DOCUMENT_CREATE_DIRECT", label: "Đăng tài liệu" },
  { code: "CONTENT_APPROVE", label: "Duyệt bài & tài liệu của GV" },
  { code: "STUDENT_GRADE", label: "Chấm điểm bài tập" },
  { code: "GRADEBOOK_VIEW_ALL", label: "Xem điểm toàn hệ thống" },
  { code: "SUBMISSION_VIEW", label: "Xem bài làm của SV" }
];

const getPermissionLabel = (permCode: string) => {
  const found = [...GV_PERMISSIONS, ...QTND_PERMISSIONS].find(p => p.code === permCode);
  return found ? found.label : permCode;
};

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
  const [permissionsMap, setPermissionsMap] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<"Quản Trị Nội Dung" | "Giảng Viên">("Quản Trị Nội Dung");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/users`);
      const data = await r.json();
      const userList: User[] = Array.isArray(data) ? data : [];
      setUsers(userList);

      // Fetch permissions for each relevant user concurrently
      const permsData: Record<number, string[]> = {};
      const relevantUsers = userList.filter(u => 
        (u.VaiTro === "Giảng Viên" || u.VaiTro === "Quản Trị Nội Dung") && u.TrangThai !== "Khóa"
      );

      await Promise.all(
        relevantUsers.map(async (u) => {
          try {
            const permRes = await fetch(`${API}/admin/users/${u.MaNguoiDung}/permissions`);
            const permJson = await permRes.json();
            permsData[u.MaNguoiDung] = permJson.permissions || [];
          } catch (e) {
            permsData[u.MaNguoiDung] = [];
          }
        })
      );
      
      setPermissionsMap(permsData);
    } catch (err) {
      showToast("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getUserPermissions = (userId: number): string[] => {
    return permissionsMap[userId] || [];
  };

  const handleCheckboxClick = (user: User, perm: string, currentVal: boolean) => {
    setPendingChange({
      user,
      perm,
      nextVal: !currentVal
    });
    setShowConfirmModal(true);
  };

  const confirmChange = async () => {
    if (!pendingChange) return;
    const { user, perm, nextVal } = pendingChange;
    let newPerms = [...getUserPermissions(user.MaNguoiDung)];

    if (nextVal) {
      if (!newPerms.includes(perm)) {
        newPerms.push(perm);
      }
    } else {
      newPerms = newPerms.filter(p => p !== perm);
    }

    try {
      // Call backend to save permissions
      const response = await fetch(`${API}/admin/users/${user.MaNguoiDung}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: newPerms })
      });

      if (response.ok) {
        setPermissionsMap(prev => ({
          ...prev,
          [user.MaNguoiDung]: newPerms
        }));
        showToast("Cập nhật quyền thành công!");
      } else {
        showToast("Lưu thất bại trên máy chủ.");
      }
    } catch (err) {
      showToast("Lỗi kết nối đến máy chủ.");
    }

    setShowConfirmModal(false);
    setPendingChange(null);
  };

  const cancelChange = () => {
    setShowConfirmModal(false);
    setPendingChange(null);
  };

  // Filter users by activeRole and active status
  const filteredUsers = users.filter(u => u.VaiTro === activeRole && u.TrangThai !== "Khóa");
  const activeColumns = activeRole === "Quản Trị Nội Dung" ? QTND_PERMISSIONS : GV_PERMISSIONS;

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
          <p style={{ padding: "20px", color: "#64748b" }}>Đang tải dữ liệu...</p>
        ) : filteredUsers.length === 0 ? (
          <p style={{ padding: "24px", color: "#64748b", fontStyle: "italic" }}>
            Không tìm thấy tài khoản hoạt động nào cho vai trò này.
          </p>
        ) : (
          <table className="permissions-table">
            <thead>
              <tr>
                <th>Tên người dùng</th>
                {activeColumns.map(col => (
                  <th key={col.code}>{col.label}</th>
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
                      const isChecked = userPerms.includes(col.code);
                      return (
                        <td key={col.code} className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxClick(u, col.code, isChecked)}
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
                <>Bạn muốn bổ sung quyền <strong>"{getPermissionLabel(pendingChange.perm)}"</strong> cho <strong>"{pendingChange.user.HoTen}"</strong>?</>
              ) : (
                <>Bạn muốn xóa quyền <strong>"{getPermissionLabel(pendingChange.perm)}"</strong> của <strong>"{pendingChange.user.HoTen}"</strong>?</>
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
