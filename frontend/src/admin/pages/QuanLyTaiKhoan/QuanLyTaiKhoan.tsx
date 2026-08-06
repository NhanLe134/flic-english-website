import "./QuanLyTaiKhoan.css";
import { useState, useEffect } from "react";
import type { User } from "./kieuDuLieu";
import { GV_PERMISSIONS, QTND_PERMISSIONS, isActive, roleColor } from "./hangSo";
import EditUserModal from "./components/ChinhSuaNguoiDungModal";
import AddUserModal from "./components/ThemNguoiDungModal";
import UserDetailModal from "./components/ChiTietNguoiDungModal";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

export default function QuanLyTaiKhoan() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("Tất cả");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState("");

  // State cho modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [permissions, setPermissions] = useState<string[]>([]);
  const [addErrors, setAddErrors] = useState<{ username?: string; fullname?: string; email?: string; password?: string }>({});
  const [editErrors, setEditErrors] = useState<{ email?: string }>({});

  useEffect(() => {
    if (!showModal) {
      setEditErrors({});
    }
  }, [showModal]);

  useEffect(() => {
    if (selectedUser) {
      // Fetch quyền từ backend
      fetch(`${API}/admin/users/${selectedUser.MaNguoiDung}/permissions`)
        .then(r => r.json())
        .then(data => {
          if (data.permissions && Array.isArray(data.permissions)) {
            setPermissions(data.permissions);
          } else {
            // Nếu chưa có quyền, gán mặc định
            if (selectedUser.VaiTro === "Giảng Viên") {
              setPermissions(GV_PERMISSIONS.map(p => p.code));
            } else if (selectedUser.VaiTro === "Quản Trị Nội Dung") {
              setPermissions(QTND_PERMISSIONS.map(p => p.code));
            } else {
              setPermissions([]);
            }
          }
        })
        .catch(() => setPermissions([]));
    } else {
      setPermissions([]);
    }
  }, [selectedUser]);

  const handlePermissionToggle = (permCode: string) => {
    setPermissions(prev =>
      prev.includes(permCode)
        ? prev.filter(p => p !== permCode)
        : [...prev, permCode]
    );
  };

  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!showAddModal) {
      setNewPermissions([]);
      setAddErrors({});
      setNewUser({ username: "", fullname: "", email: "", password: "123456", role: "Giảng Viên", gioiTinh: "Nam" });
    } else {
      setNewPermissions(GV_PERMISSIONS.map(p => p.code));
    }
  }, [showAddModal]);

  const handleNewUserPermissionToggle = (permCode: string) => {
    setNewPermissions(prev =>
      prev.includes(permCode)
        ? prev.filter(p => p !== permCode)
        : [...prev, permCode]
    );
  };

  const [newUser, setNewUser] = useState({
    username: "", fullname: "", email: "", password: "123456",
    role: "Giảng Viên", gioiTinh: "Nam",
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
    const errors: { email?: string } = {};
    if (!selectedUser.Email.trim()) {
      errors.email = "Vui lòng nhập email!";
    } else {
      // Basic email check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(selectedUser.Email.trim())) {
        errors.email = "Email không đúng định dạng!";
      }
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setEditErrors({});

    try {
      // Cập nhật thông tin cơ bản
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

      // Cập nhật quyền (nếu không phải Học Viên)
      if (selectedUser.VaiTro !== "Học Viên") {
        await fetch(`${API}/admin/users/${selectedUser.MaNguoiDung}/permissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions })
        });
      }

      showToast("Đã lưu thay đổi!");
      setShowModal(false);
      loadUsers();
    } catch { showToast("Lỗi khi lưu"); }
  };

  const handleCreateUser = async () => {
    const errors: { username?: string; fullname?: string; email?: string; password?: string } = {};
    if (!newUser.username.trim()) {
      errors.username = "Vui lòng nhập tên đăng nhập!";
    } else {
      const usernameExists = users.some(u => u.TenDangNhap?.toLowerCase().trim() === newUser.username.toLowerCase().trim());
      if (usernameExists) {
        errors.username = "Tên đăng nhập đã tồn tại!";
      }
    }
    if (!newUser.fullname.trim()) {
      errors.fullname = "Vui lòng nhập họ và tên!";
    }
    if (!newUser.email.trim()) {
      errors.email = "Vui lòng nhập email!";
    } else {
      // Basic email check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email.trim())) {
        errors.email = "Email không đúng định dạng!";
      } else {
        const emailExists = users.some(u => u.Email?.toLowerCase().trim() === newUser.email.toLowerCase().trim());
        if (emailExists) {
          errors.email = "Email đã tồn tại!";
        }
      }
    }
    if (!newUser.password.trim()) {
      errors.password = "Vui lòng nhập mật khẩu!";
    }

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    setAddErrors({});

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
      
      if (!response.ok) {
        if (data && data.errorType) {
          setAddErrors({ [data.errorType]: data.message });
        } else {
          showToast(data?.message || "Lỗi khi tạo tài khoản");
        }
        return;
      }

      if (data && data.MaNguoiDung) {
        // Gửi quyền lên API nếu không phải Học Viên
        if (newUser.role !== "Học Viên" && newPermissions.length > 0) {
          await fetch(`${API}/admin/users/${data.MaNguoiDung}/permissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ permissions: newPermissions })
          });
        }
      }
      showToast("Đã tạo tài khoản!");
      setShowAddModal(false);
      setNewUser({ username: "", fullname: "", email: "", password: "123456", role: "Giảng Viên", gioiTinh: "Nam" });
      loadUsers();
    } catch { showToast("Lỗi khi tạo tài khoản"); }
  };

  return (
    <div className="account-page">
      <h1>Quản lý tài khoản người dùng</h1>
      <p className="sub-title">Quản lý tổng hợp, tìm kiếm, thêm mới, sửa, xóa tài khoản</p>

      {/* SEARCH + FILTER */}
      <div className="account-top">
        <div className="search-filter-group">
          <input
            placeholder="Tìm theo họ tên, email, tên đăng nhập"
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
        <div className="box"><p>Quản trị nội dung</p><h3>{users.filter(u => u.VaiTro === "Quản Trị Nội Dung").length}</h3></div>
        <div className="box"><p>Đang hoạt động</p><h3>{users.filter(u => isActive(u.TrangThai)).length}</h3></div>
      </div>

      {/* TABLE */}
      <div className="account-table">
        {loading ? (
          <div className="table-loading">Đang tải...</div>
        ) : (
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="table-empty">Không có dữ liệu</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.MaNguoiDung} onClick={() => { setSelectedUser({ ...u }); setShowDetailModal(true); }}>
                  <td>
                    <div className="user-name">{u.HoTen}</div>
                  </td>
                  <td className="user-email">{u.Email}</td>
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
                  <td className="user-status">
                    <span className={`status-badge ${isActive(u.TrangThai) ? "active" : "locked"}`}>
                      {isActive(u.TrangThai) ? "Hoạt động" : "Khóa"}
                    </span>
                  </td>
                  <td className="user-created">
                    {u.NgayTao ? new Date(u.NgayTao).toLocaleDateString("vi-VN") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL */}
      {selectedUser && (
        <EditUserModal
          show={showModal}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          permissions={permissions}
          handlePermissionToggle={handlePermissionToggle}
          editErrors={editErrors}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {/* ADD USER MODAL */}
      <AddUserModal
        show={showAddModal}
        newUser={newUser}
        setNewUser={setNewUser}
        newPermissions={newPermissions}
        setNewPermissions={setNewPermissions}
        handleNewUserPermissionToggle={handleNewUserPermissionToggle}
        addErrors={addErrors}
        onClose={() => setShowAddModal(false)}
        onCreate={handleCreateUser}
      />

      {/* DETAIL MODAL */}
      {selectedUser && (
        <UserDetailModal
          show={showDetailModal}
          selectedUser={selectedUser}
          permissions={permissions}
          onClose={() => { setShowDetailModal(false); setSelectedUser(null); }}
          onEditClick={() => {
            setShowModal(true);
            setShowDetailModal(false);
          }}
        />
      )}

      {toast && (
        <div className="toast-notification">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
