import "./ProfilePage.css";
import { useState, useRef, useEffect } from "react";

const API = "http://localhost:5000";

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar]       = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    hoTen:      "",
    email:      "",
    soDienThoai:"",
    gioiTinh:   "",
    ngaySinh:   "",
    tenDangNhap:"",
    maSinhVien: "",
    lop:        "",
    khoaHoc:    "",
    thoiGian:   "",
  });
  const [draft, setDraft] = useState({ ...profile });

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(""), 3000)
  }

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}")
    if (!user.MaNguoiDung) { setLoading(false); return }

    Promise.all([
      fetch(`${API}/users/${user.MaNguoiDung}`).then(r => r.json()),
      fetch(`${API}/users/${user.MaNguoiDung}/courses`).then(r => r.json()),
    ])
      .then(([userData, courseData]) => {
        const p = {
          hoTen:       userData.HoTen        || "",
          email:       userData.Email        || "",
          soDienThoai: userData.SoDienThoai  || "",
          gioiTinh:    userData.GioiTinh     || "",
          ngaySinh:    userData.NgaySinh
            ? new Date(userData.NgaySinh).toLocaleDateString("vi-VN")
            : "",
          tenDangNhap: userData.TenDangNhap  || "",
          maSinhVien:  userData.MaSinhVien   || "",
          lop:         userData.Lop          || "",
          khoaHoc:     Array.isArray(courseData) && courseData.length > 0
            ? courseData.map((c: any) => c.TenKhoaHoc).join(", ")
            : "Chưa đăng ký",
          thoiGian:    Array.isArray(courseData) && courseData.length > 0
            ? new Date(courseData[0].NgayDangKy).toLocaleDateString("vi-VN")
            : "—",
        }
        setProfile(p)
        setDraft(p)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const initials = profile.hoTen
    .split(" ").slice(-2).map((w: string) => w[0] || "").join("").toUpperCase() || "HV"

  const handleSave = async () => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}")
    if (!user.MaNguoiDung) return
    try {
      await fetch(`${API}/users/${user.MaNguoiDung}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          HoTen:      draft.hoTen,
          Email:      draft.email,
          GioiTinh:   draft.gioiTinh,
        })
      })
      setProfile({ ...draft })
      setIsEditing(false)
      showToast("Cập nhật thành công!")
      sessionStorage.setItem("user", JSON.stringify({ ...user, HoTen: draft.hoTen }))
    } catch {
      showToast("Lỗi khi lưu!")
    }
  }

  const handleCancel = () => {
    setDraft({ ...profile })
    setIsEditing(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAvatar(URL.createObjectURL(file))
  }

  return (
    <>
        <div className="pp-content">
          <h1 className="pp-title">Thông tin cá nhân</h1>

          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:"#999" }}>Đang tải...</div>
          ) : (
            <div className="pp-card">
              {/* Actions */}
              <div className="pp-card-actions">
                {isEditing ? (
                  <>
                    <button className="pp-btn-save" onClick={handleSave}>Lưu</button>
                    <button className="pp-btn-cancel" onClick={handleCancel}>Hủy</button>
                  </>
                ) : (
                  <button className="pp-btn-edit" onClick={() => setIsEditing(true)}>Sửa</button>
                )}
              </div>

              <div className="pp-main">
                {/* Avatar */}
                <div className="pp-avatar-wrapper">
                  <div className="pp-avatar">
                    {avatar ? <img src={avatar} alt="avatar" /> : initials}
                  </div>
                  {isEditing && (
                    <>
                      <button className="pp-change-avatar" onClick={() => fileRef.current?.click()}>
                        Chọn ảnh
                      </button>
                      <input ref={fileRef} type="file" accept="image/*"
                        style={{ display:"none" }} onChange={handleAvatarChange} />
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="pp-info">

                  <div className="pp-field full">
                    <span className="pp-label">Họ và tên</span>
                    {isEditing
                      ? <input className="pp-input" value={draft.hoTen} onChange={e => setDraft({...draft, hoTen: e.target.value})} />
                      : <span className="pp-value bold">{profile.hoTen || "—"}</span>
                    }
                  </div>

                  <div className="pp-field full">
                    <span className="pp-label">Chức danh</span>
                    <span className="pp-value orange">
                      {profile.maSinhVien ? `Học Viên · ${profile.maSinhVien}` : "Học Viên"}
                    </span>
                  </div>

                  <div className="pp-field">
                    <span className="pp-label">✉ Email</span>
                    {isEditing
                      ? <input className="pp-input" value={draft.email} onChange={e => setDraft({...draft, email: e.target.value})} />
                      : <span className="pp-value">{profile.email || "—"}</span>
                    }
                  </div>

                  <div className="pp-field">
                    <span className="pp-label">👤 Giới tính</span>
                    {isEditing
                      ? (
                        <select className="pp-input" value={draft.gioiTinh} onChange={e => setDraft({...draft, gioiTinh: e.target.value})}
                          style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid #ddd", fontSize:14 }}>
                          <option value="">-- Chọn --</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      )
                      : <span className="pp-value">{profile.gioiTinh || "—"}</span>
                    }
                  </div>

                  <div className="pp-field">
                    <span className="pp-label">🎂 Ngày sinh</span>
                    <span className="pp-value">{profile.ngaySinh || "—"}</span>
                  </div>

                  <div className="pp-field">
                    <span className="pp-label">🏫 Lớp / Trường</span>
                    <span className="pp-value">{profile.lop || "—"}</span>
                  </div>

                  <div className="pp-field full">
                    <span className="pp-label">📚 Khóa học đã đăng ký</span>
                    <span className="pp-value bold">{profile.khoaHoc}</span>
                  </div>

                  <div className="pp-field full">
                    <span className="pp-label">📅 Ngày đăng ký</span>
                    <span className="pp-value bold">{profile.thoiGian}</span>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      {toast && (
        <div style={{
          position:"fixed", bottom:24, right:24, background:"#2e7d32",
          color:"#fff", padding:"12px 20px", borderRadius:10,
          fontSize:14, fontWeight:500, boxShadow:"0 4px 12px rgba(0,0,0,0.2)", zIndex:9999
        }}>
          ✓ {toast}
        </div>
      )}
      </>
  );
}

export default ProfilePage;