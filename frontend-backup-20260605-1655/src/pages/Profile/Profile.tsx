import "./Profile.css";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

function Profile() {
  const [form, setForm] = useState({
    hoTen: "",
    ngaySinh: "",
    email: "",
    soDienThoai: "",
    gioiTinh: "",
    tenDangNhap: "",
    maSinhVien: "",
    lop: "",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}")
    if (!user.MaNguoiDung) return

    // Load thông tin user từ DB
    fetch(`${API}/users/${user.MaNguoiDung}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          hoTen:        data.HoTen        || "",
          ngaySinh:     data.NgaySinh
            ? new Date(data.NgaySinh).toISOString().split("T")[0]
            : "",
          email:        data.Email        || "",
          soDienThoai:  data.SoDienThoai  || "",
          gioiTinh:     data.GioiTinh     || "",
          tenDangNhap:  data.TenDangNhap  || "",
          maSinhVien:   data.MaSinhVien   || "",
          lop:          data.Lop          || "",
        })
      })
      .catch(() => setError("Không tải được thông tin!"))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSaved(false)
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}")
    if (!user.MaNguoiDung) return
    try {
      await fetch(`${API}/users/${user.MaNguoiDung}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          HoTen:       form.hoTen,
          NgaySinh:    form.ngaySinh || null,
          Email:       form.email,
          GioiTinh:    form.gioiTinh,
        })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)

      // Cập nhật localStorage
      sessionStorage.setItem("user", JSON.stringify({ ...user, HoTen: form.hoTen }))
    } catch {
      setError("Lỗi khi cập nhật!")
    }
  }

  return (
    <>
        <div className="profile-content">
          <h1>Thông tin cá nhân</h1>

          {loading && <p style={{ color:"#999" }}>Đang tải...</p>}
          {error   && <div style={{ color:"#c62828", marginBottom:12 }}>{error}</div>}

          {saved && (
            <div className="profile-success">✅ Cập nhật thông tin thành công!</div>
          )}

          {/* Thông tin không chỉnh sửa */}
          {(form.tenDangNhap || form.maSinhVien) && (
            <div style={{ background:"#f9f5f0", borderRadius:10, padding:"14px 18px", marginBottom:20, fontSize:14 }}>
              {form.tenDangNhap && (
                <p style={{ margin:"4px 0", color:"#666" }}>
                  <b>Tên đăng nhập:</b> {form.tenDangNhap}
                </p>
              )}
              {form.maSinhVien && (
                <p style={{ margin:"4px 0", color:"#666" }}>
                  <b>Mã sinh viên:</b> {form.maSinhVien}
                </p>
              )}
              {form.lop && (
                <p style={{ margin:"4px 0", color:"#666" }}>
                  <b>Lớp/Trường:</b> {form.lop}
                </p>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Họ và tên</label>
            <input type="text" name="hoTen" value={form.hoTen} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <input type="date" name="ngaySinh" value={form.ngaySinh} onChange={handleChange} />
          </div>

          <div className="form-group small">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select name="gioiTinh" value={form.gioiTinh} onChange={handleChange}
              style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #ddd", fontSize:14 }}>
              <option value="">-- Chọn --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <button className="update-btn" onClick={handleSubmit} disabled={loading}>
            Cập nhật
          </button>
        </div>
    </>
  );
}

export default Profile;