import "./accountAdmin.css";
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

  // State cho modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [permissions, setPermissions] = useState<string[]>([]);

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
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Tên người dùng</th>
                <th>Tài khoản</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: "#999" }}>Không có dữ liệu</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.MaNguoiDung} onClick={() => { setSelectedUser({ ...u }); setShowDetailModal(true); }}>
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
            <div className="modal-header-container" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '32px 32px 0 32px', flexShrink: 0 }}>
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0, padding: 0 }}>
                <h3 style={{ margin: 0, color: '#000080' }}>Chỉnh sửa tài khoản</h3>
                <span className="close" style={{ margin: 0 }} onClick={() => setShowModal(false)}>×</span>
              </div>
              <p className="modal-sub" style={{ margin: 0, padding: 0 }}>Cập nhật thông tin người dùng</p>
            </div>

            <div className="modal-scrollable-body" style={{ overflowY: 'auto', flex: 1, padding: '0 32px 24px 32px', margin: '16px 0 0 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Họ và tên</label>
                <div className="info-value">{selectedUser.HoTen}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Giới tính</label>
                <div className="info-value">{selectedUser.GioiTinh || "Nam"}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Vai trò</label>
                <div className="info-value">{selectedUser.VaiTro}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Email</label>
                <input value={selectedUser.Email} onChange={e => setSelectedUser({ ...selectedUser, Email: e.target.value })} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Trạng thái</label>
                <select value={selectedUser.TrangThai} onChange={e => setSelectedUser({ ...selectedUser, TrangThai: e.target.value })}>
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

            <div className="modal-actions" style={{ flexShrink: 0, borderTop: '1px solid #e2e8f0', padding: '16px 32px 32px 32px', margin: 0 }}>
              <button className="cancel" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="save" onClick={handleSave}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="modal" style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh', padding: 0 }}>
            <div className="modal-header-container" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '32px 32px 0 32px', flexShrink: 0 }}>
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0, padding: 0 }}>
                <h3 style={{ margin: 0, color: '#000080' }}>Thêm người dùng mới</h3>
                <span className="close" style={{ margin: 0 }} onClick={() => setShowAddModal(false)}>×</span>
              </div>
              <p className="modal-sub" style={{ margin: 0, padding: 0 }}>Điền thông tin để tạo tài khoản mới</p>
            </div>

            <div className="modal-scrollable-body" style={{ overflowY: 'auto', flex: 1, padding: '0 32px 24px 32px', margin: '16px 0 0 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Tên đăng nhập <span style={{ color: "red" }}>*</span></label>
                <input placeholder="VD: nguyenvana" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Họ và tên</label>
                <input placeholder="Nguyễn Văn A" value={newUser.fullname} onChange={e => setNewUser({ ...newUser, fullname: e.target.value })} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Email <span style={{ color: "red" }}>*</span></label>
                <input placeholder="example@email.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Mật khẩu</label>
                <input type="password" placeholder="Mặc định: 123456" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Giới tính</label>
                <select value={newUser.gioiTinh} onChange={e => setNewUser({ ...newUser, gioiTinh: e.target.value })}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Vai trò</label>
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
                  <option value="Học Viên">Học Viên</option>
                  <option value="Giảng Viên">Giảng Viên</option>
                  <option value="Quản Trị Nội Dung">Quản Trị Nội Dung</option>
                  <option value="Quản Trị Viên">Quản Trị Viên</option>
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

              {newUser.role === "Quản Trị Viên" && (
                <div className="permissions-section">
                  <div className="permissions-title">Phân quyền</div>
                  <div className="permission-info-text">
                    Có tất cả quyền của Quản trị viên hệ thống.
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ flexShrink: 0, borderTop: '1px solid #e2e8f0', padding: '16px 32px 32px 32px', margin: 0 }}>
              <button className="cancel" onClick={() => setShowAddModal(false)}>Hủy</button>
              <button className="save" onClick={handleCreateUser}>Tạo tài khoản</button>
            </div>
          </div>
        </div>
      )}



      {/* DETAIL MODAL */}
      {showDetailModal && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="modal" style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh', padding: 0 }}>
            <div className="modal-header-container" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '32px 32px 0 32px', flexShrink: 0 }}>
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0, padding: 0 }}>
                <h3 style={{ margin: 0, color: '#000080' }}>Chi tiết tài khoản</h3>
                <span className="close" style={{ margin: 0 }} onClick={() => { setShowDetailModal(false); setSelectedUser(null); }}>×</span>
              </div>
              <p className="modal-sub" style={{ margin: 0, padding: 0 }}>Thông tin chi tiết tài khoản người dùng</p>
            </div>

            <div className="modal-scrollable-body" style={{ overflowY: 'auto', flex: 1, padding: '0 32px 24px 32px', margin: '16px 0 0 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Họ và tên</label>
                <div className="info-value">{selectedUser.HoTen || "—"}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Tên đăng nhập</label>
                <div className="info-value">{selectedUser.TenDangNhap}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Email</label>
                <div className="info-value">{selectedUser.Email || "—"}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Giới tính</label>
                <div className="info-value">{selectedUser.GioiTinh || "Nam"}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Vai trò</label>
                <div className="info-value">{selectedUser.VaiTro}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Trạng thái</label>
                <div className="info-value" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                  <span className={`status-badge ${isActive(selectedUser.TrangThai) ? "active" : "locked"}`}>
                    {isActive(selectedUser.TrangThai) ? "Hoạt động" : "Khóa"}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ margin: 0 }}>Ngày tạo</label>
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
                          <label key={p.code} className="permission-item" style={{ cursor: 'default' }}>
                            <input
                              type="checkbox"
                              checked={permissions.includes(p.code)}
                              disabled
                              style={{ cursor: 'default' }}
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
                          <label key={p.code} className="permission-item" style={{ cursor: 'default' }}>
                            <input
                              type="checkbox"
                              checked={permissions.includes(p.code)}
                              disabled
                              style={{ cursor: 'default' }}
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

            <div className="modal-actions" style={{ flexShrink: 0, borderTop: '1px solid #e2e8f0', padding: '16px 32px 32px 32px', margin: 0, justifyContent: 'flex-end', display: 'flex', gap: '12px' }}>
              <button
                className="save"
                onClick={() => {
                  setShowModal(true);
                  setShowDetailModal(false);
                }}
              >
                Chỉnh sửa
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