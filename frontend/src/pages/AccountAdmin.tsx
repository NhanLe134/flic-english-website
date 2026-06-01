import "./accountAdmin.css";
import { useState, useEffect } from "react";
import { FiEdit2, FiLock, FiUnlock, FiTrash2 } from "react-icons/fi";

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

export default function AccountAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("Tất cả");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState("");

  // ← thêm state cho modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (selectedUser) {
      const saved = localStorage.getItem(`user_perms_${selectedUser.MaNguoiDung}`);
      if (saved) {
        try {
          setPermissions(JSON.parse(saved));
        } catch {
          setPermissions([]);
        }
      } else {
        setPermissions([]);
      }
    } else {
      setPermissions([]);
    }
  }, [selectedUser]);

  const handleQTVNDPermissionChange = (perm: string) => {
    let newPerms = [...permissions];
    if (perm === "Tất cả") {
      if (newPerms.includes("Tất cả")) {
        newPerms = [];
      } else {
        newPerms = ["Kiểm duyệt", "Xem báo cáo kết quả", "Quản lý các khoá học", "Tất cả"];
      }
    } else {
      if (newPerms.includes(perm)) {
        newPerms = newPerms.filter(p => p !== perm && p !== "Tất cả");
      } else {
        newPerms.push(perm);
        const hasOthers = ["Kiểm duyệt", "Xem báo cáo kết quả", "Quản lý các khoá học"].every(p => newPerms.includes(p));
        if (hasOthers) {
          newPerms.push("Tất cả");
        }
      }
    }
    setPermissions(newPerms);
  };

  const handleGVPermissionChange = (perm: string) => {
    if (perm === "Có tất cả quyền nhưng không có quyền đăng tải") {
      if (permissions.includes(perm)) {
        setPermissions([]);
      } else {
        setPermissions([perm]);
      }
    } else if (perm === "Có tất cả quyền") {
      if (permissions.includes(perm)) {
        setPermissions([]);
      } else {
        setPermissions([perm]);
      }
    }
  };

  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!showAddModal) {
      setNewPermissions([]);
    }
  }, [showAddModal]);

  const handleNewUserQTVNDPermissionChange = (perm: string) => {
    let newPerms = [...newPermissions];
    if (perm === "Tất cả") {
      if (newPerms.includes("Tất cả")) {
        newPerms = [];
      } else {
        newPerms = ["Kiểm duyệt", "Xem báo cáo kết quả", "Quản lý các khoá học", "Tất cả"];
      }
    } else {
      if (newPerms.includes(perm)) {
        newPerms = newPerms.filter(p => p !== perm && p !== "Tất cả");
      } else {
        newPerms.push(perm);
        const hasOthers = ["Kiểm duyệt", "Xem báo cáo kết quả", "Quản lý các khoá học"].every(p => newPerms.includes(p));
        if (hasOthers) {
          newPerms.push("Tất cả");
        }
      }
    }
    setNewPermissions(newPerms);
  };

  const handleNewUserGVPermissionChange = (perm: string) => {
    if (perm === "Có tất cả quyền nhưng không có quyền đăng tải") {
      if (newPermissions.includes(perm)) {
        setNewPermissions([]);
      } else {
        setNewPermissions([perm]);
      }
    } else if (perm === "Có tất cả quyền") {
      if (newPermissions.includes(perm)) {
        setNewPermissions([]);
      } else {
        setNewPermissions([perm]);
      }
    }
  };

  const [newUser, setNewUser] = useState({
    username: "", fullname: "", email: "", password: "123456",
    role: "Học Viên", gioiTinh: "Nam",
  });

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(""), 2500);
  };

  const loadUsers = () => {
    setLoading(true);
    fetch(`${API}/admin/users`)
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => showToast("Lỗi tải danh sách"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.HoTen?.toLowerCase().includes(search.toLowerCase()) ||
      u.TenDangNhap?.toLowerCase().includes(search.toLowerCase()) ||
      u.Email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "Tất cả" || u.VaiTro === filterRole;
    return matchSearch && matchRole;
  });

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      localStorage.setItem(`user_perms_${selectedUser.MaNguoiDung}`, JSON.stringify(permissions));
      await fetch(`${API}/admin/users/${selectedUser.MaNguoiDung}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          HoTen: selectedUser.HoTen,
          Email: selectedUser.Email,
          TrangThai: selectedUser.TrangThai,
          GioiTinh: selectedUser.GioiTinh,
        })
      });
      showToast("Đã lưu thay đổi!"); setShowModal(false); loadUsers();
    } catch { showToast("Lỗi khi lưu"); }
  };

  // ← sửa handleDelete — mở modal thay vì confirm
  const handleDelete = (user: User) => {
    setDeleteTarget(user);
    setShowDeleteModal(true);
  };

  // ← thêm confirmDelete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`${API}/admin/users/${deleteTarget.MaNguoiDung}`, { method: "DELETE" });
      showToast("Đã xóa tài khoản!");
      loadUsers();
    } catch { showToast("Lỗi khi xóa"); }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleToggleStatus = async (user: User) => {
    const next = isActive(user.TrangThai) ? "Khóa" : "Active"; // giữ "Active"
    try {
      await fetch(`${API}/admin/users/${user.MaNguoiDung}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TrangThai: next }) // chỉ gửi TrangThai, không cần gửi thêm
      });
      showToast(`Đã ${next === "Khóa" ? "khóa" : "mở khóa"} tài khoản!`);
      loadUsers();
    } catch { showToast("Lỗi"); }
  };

  const handleCreateUser = async () => {
    if (!newUser.username.trim() || !newUser.email.trim()) {
      alert("Vui lòng nhập tên đăng nhập và email!"); return;
    }
    try {
      const response = await fetch(`${API}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TenDangNhap: newUser.username,
          HoTen: newUser.fullname,
          Email: newUser.email,
          MatKhau: newUser.password,
          GioiTinh: newUser.gioiTinh,
          VaiTro: newUser.role,
        })
      });
      const data = await response.json();
      if (data && data.MaNguoiDung) {
        localStorage.setItem(`user_perms_${data.MaNguoiDung}`, JSON.stringify(newPermissions));
      }
      showToast("Đã tạo tài khoản!");
      setShowAddModal(false);
      setNewUser({ username: "", fullname: "", email: "", password: "123456", role: "Học Viên", gioiTinh: "Nam" });
      loadUsers();
    } catch { showToast("Lỗi khi tạo tài khoản"); }
  };

  const isActive = (s: string) => s === "Active" || s === "Hoạt động" || s === "active";

  const roleColor: Record<string, { bg: string; color: string }> = {
    "Học Viên": { bg: "#e3f2fd", color: "#1565c0" },
    "Giảng Viên": { bg: "#e8f5e9", color: "#2e7d32" },
    "Quản Trị Viên": { bg: "#fce4ec", color: "#c62828" },
    "Quản Trị Nội Dung": { bg: "#fff3e0", color: "#e65100" },
  };

  return (
    <div className="account-page">
      <h1>Quản lý tài khoản người dùng</h1>
      <p className="sub-title">Quản lý tổng hợp, tìm kiếm, thêm mới, sửa, xóa tài khoản</p>

      {/* SEARCH + FILTER */}
      <div className="account-top">
        <div className="search-filter-group">
          <input
            placeholder="Tìm kiếm theo tên, email, tài khoản..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            <option value="Tất cả">Tất cả vai trò</option>
            <option value="Học Viên">Học Viên</option>
            <option value="Giảng Viên">Giảng Viên</option>
            <option value="Quản Trị Viên">Quản Trị Viên</option>
            <option value="Quản Trị Nội Dung">Quản Trị Nội Dung</option>
          </select>
        </div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          + Thêm người dùng
        </button>
      </div>

      {/* STATS */}
      <div className="account-stats">
        <div className="box"><p>Tổng người dùng</p><h3>{users.length}</h3></div>
        <div className="box"><p>Sinh viên</p><h3>{users.filter(u => u.VaiTro === "Học Viên").length}</h3></div>
        <div className="box"><p>Giảng viên</p><h3>{users.filter(u => u.VaiTro === "Giảng Viên").length}</h3></div>
        <div className="box"><p>Đang hoạt động</p><h3>{users.filter(u => isActive(u.TrangThai)).length}</h3></div>
      </div>

      {/* TABLE */}
      <div className="account-table">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Đang tải...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tên người dùng</th>
                <th>Tài khoản</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#999" }}>Không có dữ liệu</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.MaNguoiDung}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.HoTen}</div>
                  </td>
                  <td style={{ fontSize: 13, color: "#555" }}>{u.TenDangNhap}</td>
                  <td style={{ fontSize: 13 }}>{u.Email}</td>
                  <td>
                    <span
                      className="role-badge"
                      style={{
                        background: roleColor[u.VaiTro]?.bg ?? "#f5f5f5",
                        color: roleColor[u.VaiTro]?.color ?? "#333",
                      }}
                    >
                      {u.VaiTro || "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${isActive(u.TrangThai) ? "active" : "locked"}`}>
                      {isActive(u.TrangThai) ? "Hoạt động" : "Khóa"}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {u.NgayTao ? new Date(u.NgayTao).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="action-cell">
                    <button
                      className="btn-action btn-edit"
                      title="Sửa"
                      onClick={() => { setSelectedUser({ ...u }); setShowModal(true); }}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className={`btn-action ${isActive(u.TrangThai) ? "btn-lock" : "btn-unlock"}`}
                      title={isActive(u.TrangThai) ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      onClick={() => handleToggleStatus(u)}
                    >
                      {isActive(u.TrangThai) ? <FiLock /> : <FiUnlock />}
                    </button>
                    <button
                      className="btn-action btn-delete"
                      title="Xóa tài khoản"
                      onClick={() => handleDelete(u)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL */}
      {showModal && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Chỉnh sửa tài khoản</h3>
              <span className="close" onClick={() => setShowModal(false)}>×</span>
            </div>
            <p className="modal-sub">Cập nhật thông tin người dùng</p>
            
            <label>Họ và tên</label>
            <div className="info-value">{selectedUser.HoTen}</div>
            
            <label>Giới tính</label>
            <div className="info-value">{selectedUser.GioiTinh || "Nam"}</div>
            
            <label>Vai trò</label>
            <div className="info-value">{selectedUser.VaiTro}</div>
            
            <label>Email</label>
            <input value={selectedUser.Email} onChange={e => setSelectedUser({ ...selectedUser, Email: e.target.value })} />
            
            <label>Trạng thái</label>
            <select value={selectedUser.TrangThai} onChange={e => setSelectedUser({ ...selectedUser, TrangThai: e.target.value })}>
              <option value="Active">Hoạt động</option>
              <option value="Khóa">Khóa</option>
            </select>

            {/* PHÂN QUYỀN */}
            {selectedUser.TrangThai !== "Khóa" && (
              <>
                {selectedUser.VaiTro === "Quản Trị Nội Dung" && (
                  <div className="permissions-section">
                    <div className="permissions-title">Phân quyền</div>
                    <div className="permissions-grid">
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          checked={permissions.includes("Kiểm duyệt")}
                          onChange={() => handleQTVNDPermissionChange("Kiểm duyệt")}
                        />
                        Kiểm duyệt
                      </label>
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          checked={permissions.includes("Xem báo cáo kết quả")}
                          onChange={() => handleQTVNDPermissionChange("Xem báo cáo kết quả")}
                        />
                        Xem báo cáo kết quả
                      </label>
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          checked={permissions.includes("Tất cả")}
                          onChange={() => handleQTVNDPermissionChange("Tất cả")}
                        />
                        Tất cả
                      </label>
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          checked={permissions.includes("Quản lý các khoá học")}
                          onChange={() => handleQTVNDPermissionChange("Quản lý các khoá học")}
                        />
                        Quản lý các khoá học
                      </label>
                    </div>
                  </div>
                )}

                {selectedUser.VaiTro === "Giảng Viên" && (
                  <div className="permissions-section">
                    <div className="permissions-title">Phân quyền</div>
                    <div className="permissions-list">
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          checked={permissions.includes("Có tất cả quyền nhưng không có quyền đăng tải")}
                          onChange={() => handleGVPermissionChange("Có tất cả quyền nhưng không có quyền đăng tải")}
                        />
                        Có tất cả quyền nhưng không có quyền đăng tải
                      </label>
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          checked={permissions.includes("Có tất cả quyền")}
                          onChange={() => handleGVPermissionChange("Có tất cả quyền")}
                        />
                        Có tất cả quyền
                      </label>
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

            <div className="modal-actions">
              <button className="cancel" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="save" onClick={handleSave}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Thêm người dùng mới</h3>
              <span className="close" onClick={() => setShowAddModal(false)}>×</span>
            </div>
            <p className="modal-sub">Điền thông tin để tạo tài khoản mới</p>
            <label>Tên đăng nhập <span style={{ color: "red" }}>*</span></label>
            <input placeholder="VD: nguyenvana" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
            <label>Họ và tên</label>
            <input placeholder="Nguyễn Văn A" value={newUser.fullname} onChange={e => setNewUser({ ...newUser, fullname: e.target.value })} />
            <label>Email <span style={{ color: "red" }}>*</span></label>
            <input placeholder="example@email.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            <label>Mật khẩu</label>
            <input type="password" placeholder="Mặc định: 123456" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            <label>Giới tính</label>
            <select value={newUser.gioiTinh} onChange={e => setNewUser({ ...newUser, gioiTinh: e.target.value })}>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <label>Vai trò</label>
            <select value={newUser.role} onChange={e => { setNewUser({ ...newUser, role: e.target.value }); setNewPermissions([]); }}>
              <option value="Học Viên">Học Viên</option>
              <option value="Giảng Viên">Giảng Viên</option>
              <option value="Quản Trị Nội Dung">Quản Trị Nội Dung</option>
              <option value="Quản Trị Viên">Quản Trị Viên</option>
            </select>

            {/* PHÂN QUYỀN */}
            {newUser.role === "Quản Trị Nội Dung" && (
              <div className="permissions-section">
                <div className="permissions-title">Phân quyền</div>
                <div className="permissions-grid">
                  <label className="permission-item">
                    <input
                      type="checkbox"
                      checked={newPermissions.includes("Kiểm duyệt")}
                      onChange={() => handleNewUserQTVNDPermissionChange("Kiểm duyệt")}
                    />
                    Kiểm duyệt
                  </label>
                  <label className="permission-item">
                    <input
                      type="checkbox"
                      checked={newPermissions.includes("Xem báo cáo kết quả")}
                      onChange={() => handleNewUserQTVNDPermissionChange("Xem báo cáo kết quả")}
                    />
                    Xem báo cáo kết quả
                  </label>
                  <label className="permission-item">
                    <input
                      type="checkbox"
                      checked={newPermissions.includes("Tất cả")}
                      onChange={() => handleNewUserQTVNDPermissionChange("Tất cả")}
                    />
                    Tất cả
                  </label>
                  <label className="permission-item">
                    <input
                      type="checkbox"
                      checked={newPermissions.includes("Quản lý các khoá học")}
                      onChange={() => handleNewUserQTVNDPermissionChange("Quản lý các khoá học")}
                    />
                    Quản lý các khoá học
                  </label>
                </div>
              </div>
            )}

            {newUser.role === "Giảng Viên" && (
              <div className="permissions-section">
                <div className="permissions-title">Phân quyền</div>
                <div className="permissions-list">
                  <label className="permission-item">
                    <input
                      type="checkbox"
                      checked={newPermissions.includes("Có tất cả quyền nhưng không có quyền đăng tải")}
                      onChange={() => handleNewUserGVPermissionChange("Có tất cả quyền nhưng không có quyền đăng tải")}
                    />
                    Có tất cả quyền nhưng không có quyền đăng tải
                  </label>
                  <label className="permission-item">
                    <input
                      type="checkbox"
                      checked={newPermissions.includes("Có tất cả quyền")}
                      onChange={() => handleNewUserGVPermissionChange("Có tất cả quyền")}
                    />
                    Có tất cả quyền
                  </label>
                </div>
              </div>
            )}

            {newUser.role === "Quản Trị Viên" && (
              <div className="permissions-section">
                <div className="permissions-title">Phân quyền</div>
                <div className="permission-info-text">
                  Có tất cả quyền của Quản trị viên hệ thống.
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="cancel" onClick={() => setShowAddModal(false)}>Hủy</button>
              <button className="save" onClick={handleCreateUser}>Tạo tài khoản</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && deleteTarget && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              background: "#fff", borderRadius: 16, padding: "36px 32px",
              minWidth: 340, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Icon ! */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              border: "2px solid #e57373", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", color: "#e57373", fontSize: 24, fontWeight: 700
            }}>
              !
            </div>
            <h3 style={{ marginBottom: 8, fontSize: 18, fontWeight: 700, color: "#222" }}>
              Xác nhận Xóa
            </h3>
            <p style={{ color: "#777", marginBottom: 24, fontSize: 14 }}>
              Bạn có chắc chắn muốn xóa tài khoản <b>{deleteTarget.HoTen}</b> không?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "12px", borderRadius: 8,
                  border: "none", background: "#ef9a9a",
                  color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 15
                }}
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "12px", borderRadius: 8,
                  border: "none", background: "#f5f5f5",
                  color: "#555", cursor: "pointer", fontWeight: 500, fontSize: 15
                }}
              >
                Không
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#333", color: "#fff",
          padding: "12px 20px", borderRadius: 10, fontSize: 14, zIndex: 9999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}