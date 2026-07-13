import "./AccountAdmin.css";
import { useState, useEffect } from "react";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

const GV_PERMISSIONS = [
  { code: "LECTURE_CREATE", label: "Đăng bài giảng" },
  { code: "BAITAP_CREATE", label: "Đăng bài tập" },
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
  { code: "BAITAP_CREATE", label: "Đăng bài tập" },
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
                <th>Tên đăng nhập</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">Không có dữ liệu</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.MaNguoiDung} onClick={() => { setSelectedUser({ ...u }); setShowDetailModal(true); }}>
                  <td className="user-username">
                    <div style={{ fontWeight: 600 }}>{u.TenDangNhap}</div>
                  </td>
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
                  <td>
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
      {showModal && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="modal account-modal">
            <div className="modal-header-container">
              <div className="modal-header">
                <h3>Chỉnh sửa tài khoản</h3>
                <span className="close" onClick={() => setShowModal(false)}>×</span>
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
                <input value={selectedUser.Email} onChange={e => setSelectedUser({ ...selectedUser, Email: e.target.value })} />
                {editErrors.email && <span className="error-message">{editErrors.email}</span>}
              </div>

              <div className="form-field">
                <label>Trạng thái</label>
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
          <div className="modal account-modal">
            <div className="modal-header-container">
              <div className="modal-header">
                <h3>Thêm người dùng mới</h3>
                <span className="close" onClick={() => setShowAddModal(false)}>×</span>
              </div>
              <p className="modal-sub">Điền thông tin để tạo tài khoản mới</p>
            </div>

            <div className="modal-scrollable-body">
              <div className="form-field">
                <label>Tên đăng nhập <span className="required-star">*</span></label>
                <input placeholder="VD: nguyenvana" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                {addErrors.username && <span className="error-message">{addErrors.username}</span>}
              </div>

              <div className="form-field">
                <label>Họ và tên <span className="required-star">*</span></label>
                <input placeholder="Nguyễn Văn A" value={newUser.fullname} onChange={e => setNewUser({ ...newUser, fullname: e.target.value })} />
                {addErrors.fullname && <span className="error-message">{addErrors.fullname}</span>}
              </div>

              <div className="form-field">
                <label>Email <span className="required-star">*</span></label>
                <input placeholder="example@email.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                {addErrors.email && <span className="error-message">{addErrors.email}</span>}
              </div>

              <div className="form-field">
                <label>Mật khẩu <span className="required-star">*</span></label>
                <input type="password" placeholder="Mặc định: 123456" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                {addErrors.password && <span className="error-message">{addErrors.password}</span>}
              </div>

              <div className="form-field">
                <label>Giới tính</label>
                <select value={newUser.gioiTinh} onChange={e => setNewUser({ ...newUser, gioiTinh: e.target.value })}>
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
              <button className="cancel" onClick={() => setShowAddModal(false)}>Hủy</button>
              <button className="save" onClick={handleCreateUser}>Tạo tài khoản</button>
            </div>
          </div>
        </div>
      )}



      {/* DETAIL MODAL */}
      {showDetailModal && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="modal account-modal">
            <div className="modal-header-container">
              <div className="modal-header">
                <h3>Chi tiết tài khoản</h3>
                <span className="close" onClick={() => { setShowDetailModal(false); setSelectedUser(null); }}>×</span>
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
        <div className="toast-notification">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
