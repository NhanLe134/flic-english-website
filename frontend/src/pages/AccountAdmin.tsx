import "./accountAdmin.css";
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

export default function AccountAdmin() {
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState("Tất cả");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast]           = useState("");

  // ← thêm state cho modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

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
      await fetch(`${API}/admin/users`, {
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
      showToast("Đã tạo tài khoản!");
      setShowAddModal(false);
      setNewUser({ username:"", fullname:"", email:"", password:"123456", role:"Học Viên", gioiTinh:"Nam" });
      loadUsers();
    } catch { showToast("Lỗi khi tạo tài khoản"); }
  };

  const isActive = (s: string) => s === "Active" || s === "Hoạt động" || s === "active";

  const roleColor: Record<string, { bg: string; color: string }> = {
    "Học Viên":          { bg: "#e3f2fd", color: "#1565c0" },
    "Giảng Viên":        { bg: "#e8f5e9", color: "#2e7d32" },
    "Quản Trị Viên":     { bg: "#fce4ec", color: "#c62828" },
    "Quản Trị Nội Dung": { bg: "#fff3e0", color: "#e65100" },
  };

  return (
    <div className="account-page">
      <h1>Quản lý tài khoản người dùng</h1>
      <p className="sub-title">Quản lý tổng hợp, tìm kiếm, thêm mới, sửa, xóa tài khoản</p>

      {/* SEARCH + FILTER */}
      <div className="account-top">
        <input
          placeholder="Tìm kiếm theo tên, email, tài khoản..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={{ padding:"8px 12px", borderRadius:8, border:"1px solid #ddd", fontSize:14 }}
        >
          <option value="Tất cả">Tất cả vai trò</option>
          <option value="Học Viên">Học Viên</option>
          <option value="Giảng Viên">Giảng Viên</option>
          <option value="Quản Trị Viên">Quản Trị Viên</option>
          <option value="Quản Trị Nội Dung">Quản Trị Nội Dung</option>
        </select>
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
          <div style={{ padding:40, textAlign:"center", color:"#999" }}>Đang tải...</div>
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
                <tr><td colSpan={7} style={{ textAlign:"center", padding:20, color:"#999" }}>Không có dữ liệu</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.MaNguoiDung}>
                  <td>
                    <div style={{ fontWeight:600 }}>{u.HoTen}</div>
                    <div style={{ fontSize:12, color:"#888" }}>{u.GioiTinh || "—"}</div>
                  </td>
                  <td style={{ fontSize:13, color:"#555" }}>{u.TenDangNhap}</td>
                  <td style={{ fontSize:13 }}>{u.Email}</td>
                  <td>
                    <span style={{
                      background: roleColor[u.VaiTro]?.bg ?? "#f5f5f5",
                      color: roleColor[u.VaiTro]?.color ?? "#333",
                      padding:"3px 10px", borderRadius:12, fontSize:12, fontWeight:600
                    }}>
                      {u.VaiTro || "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${isActive(u.TrangThai) ? "active" : "locked"}`}>
                      {isActive(u.TrangThai) ? "Hoạt động" : "Khóa"}
                    </span>
                  </td>
                  <td style={{ fontSize:13 }}>
                    {u.NgayTao ? new Date(u.NgayTao).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td>
                    <button className="edit" onClick={() => { setSelectedUser({...u}); setShowModal(true); }}>Sửa</button>
                    <button
                      className={isActive(u.TrangThai) ? "delete" : "edit"}
                      style={{ marginLeft:4 }}
                      onClick={() => handleToggleStatus(u)}
                    >
                      {isActive(u.TrangThai) ? "Khóa" : "Mở"}
                    </button>
                    <button
                      className="delete"
                      style={{ marginLeft:4 }}
                      onClick={() => handleDelete(u)} // ← đổi sang mở modal
                    >
                      Xóa
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
            <input value={selectedUser.HoTen} onChange={e => setSelectedUser({...selectedUser, HoTen: e.target.value})} />
            <label>Email</label>
            <input value={selectedUser.Email} onChange={e => setSelectedUser({...selectedUser, Email: e.target.value})} />
            <label>Giới tính</label>
            <select value={selectedUser.GioiTinh || "Nam"} onChange={e => setSelectedUser({...selectedUser, GioiTinh: e.target.value})}>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <label>Trạng thái</label>
            <select value={selectedUser.TrangThai} onChange={e => setSelectedUser({...selectedUser, TrangThai: e.target.value})}>
              <option value="Active">Hoạt động</option>
              <option value="Khóa">Khóa</option>
            </select>
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
            <label>Tên đăng nhập <span style={{ color:"red" }}>*</span></label>
            <input placeholder="VD: nguyenvana" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
            <label>Họ và tên</label>
            <input placeholder="Nguyễn Văn A" value={newUser.fullname} onChange={e => setNewUser({...newUser, fullname: e.target.value})} />
            <label>Email <span style={{ color:"red" }}>*</span></label>
            <input placeholder="example@email.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            <label>Mật khẩu</label>
            <input type="password" placeholder="Mặc định: 123456" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            <label>Giới tính</label>
            <select value={newUser.gioiTinh} onChange={e => setNewUser({...newUser, gioiTinh: e.target.value})}>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <label>Vai trò</label>
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
              <option value="Học Viên">Học Viên</option>
              <option value="Giảng Viên">Giảng Viên</option>
              <option value="Quản Trị Nội Dung">Quản Trị Nội Dung</option>
              <option value="Quản Trị Viên">Quản Trị Viên</option>
            </select>
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
            position:"fixed", inset:0, background:"rgba(0,0,0,0.4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            zIndex:9999
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              background:"#fff", borderRadius:16, padding:"36px 32px",
              minWidth:340, textAlign:"center", boxShadow:"0 8px 32px rgba(0,0,0,0.15)"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Icon ! */}
            <div style={{
              width:52, height:52, borderRadius:"50%",
              border:"2px solid #e57373", display:"flex",
              alignItems:"center", justifyContent:"center",
              margin:"0 auto 16px", color:"#e57373", fontSize:24, fontWeight:700
            }}>
              !
            </div>
            <h3 style={{ marginBottom:8, fontSize:18, fontWeight:700, color:"#222" }}>
              Xác nhận Xóa
            </h3>
            <p style={{ color:"#777", marginBottom:24, fontSize:14 }}>
              Bạn có chắc chắn muốn xóa tài khoản <b>{deleteTarget.HoTen}</b> không?
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button
                onClick={confirmDelete}
                style={{
                  padding:"12px", borderRadius:8,
                  border:"none", background:"#ef9a9a",
                  color:"#fff", cursor:"pointer", fontWeight:600, fontSize:15
                }}
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding:"12px", borderRadius:8,
                  border:"none", background:"#f5f5f5",
                  color:"#555", cursor:"pointer", fontWeight:500, fontSize:15
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
          position:"fixed", bottom:24, right:24, background:"#333", color:"#fff",
          padding:"12px 20px", borderRadius:10, fontSize:14, zIndex:9999,
          boxShadow:"0 4px 12px rgba(0,0,0,0.2)"
        }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}