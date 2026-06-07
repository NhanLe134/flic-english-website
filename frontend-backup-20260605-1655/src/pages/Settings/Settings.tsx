import "./Settings.css";
import { useState, useRef, useEffect } from "react";

const API = "http://localhost:5000";

function Settings() {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}")
  const maNguoiDung = user.MaNguoiDung

  const [avatar,      setAvatar]      = useState<string | null>(null)
  const [name,        setName]        = useState("")
  const [email,       setEmail]       = useState("")
  const [ngaySinh,    setNgaySinh]    = useState("")
  const [gioiTinh,    setGioiTinh]    = useState("")
  const [theme,       setTheme]       = useState<"sang"|"toi">("sang")
  const [lang,        setLang]        = useState<"vi"|"en">("vi")
  const [notifEmail,  setNotifEmail]  = useState(true)
  const [notifSystem, setNotifSystem] = useState(true)
  const [notifUpdate, setNotifUpdate] = useState(true)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [toast,       setToast]       = useState("")
  const [toastType,   setToastType]   = useState<"success"|"error">("success")

  // Đổi mật khẩu
  const [showPwForm,  setShowPwForm]  = useState(false)
  const [matKhauCu,   setMatKhauCu]   = useState("")
  const [matKhauMoi,  setMatKhauMoi]  = useState("")
  const [matKhauXN,   setMatKhauXN]   = useState("")
  const [pwSaving,    setPwSaving]    = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast(msg); setToastType(type)
    setTimeout(() => setToast(""), 3000)
  }

  // Load user data từ DB
  useEffect(() => {
    if (!maNguoiDung) { setLoading(false); return }
    fetch(`${API}/users/${maNguoiDung}`)
      .then(r => r.json())
      .then(d => {
        if (!d) return
        setName(d.HoTen || "")
        setEmail(d.Email || "")
        setNgaySinh(d.NgaySinh ? d.NgaySinh.split("T")[0] : "")
        setGioiTinh(d.GioiTinh || "")
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [maNguoiDung])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAvatar(URL.createObjectURL(file))
  }

  // Lưu thông tin profile
  const handleSave = async () => {
    if (!maNguoiDung) return
    setSaving(true)
    try {
      await fetch(`${API}/users/${maNguoiDung}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ HoTen: name, NgaySinh: ngaySinh || null, Email: email, GioiTinh: gioiTinh })
      })
      // Cập nhật localStorage
      const updatedUser = { ...user, HoTen: name, Email: email }
      sessionStorage.setItem("user", JSON.stringify(updatedUser))
      showToast("Đã lưu thay đổi thành công!")
    } catch {
      showToast("Lỗi khi lưu thay đổi!", "error")
    } finally {
      setSaving(false)
    }
  }

  // Đổi mật khẩu
  const handleChangePassword = async () => {
    if (!matKhauMoi.trim()) { showToast("Vui lòng nhập mật khẩu mới!", "error"); return }
    if (matKhauMoi !== matKhauXN) { showToast("Mật khẩu xác nhận không khớp!", "error"); return }
    if (matKhauMoi.length < 6)   { showToast("Mật khẩu phải có ít nhất 6 ký tự!", "error"); return }
    setPwSaving(true)
    try {
      const res = await fetch(`${API}/doi-mat-khau`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maNguoiDung, matKhauCu, matKhauMoi })
      })
      const data = await res.json()
      if (res.status === 401) {
        showToast(data.message || "Mật khẩu hiện tại không đúng!", "error")
      } else {
        showToast("Đổi mật khẩu thành công!")
        setShowPwForm(false)
        setMatKhauCu(""); setMatKhauMoi(""); setMatKhauXN("")
      }
    } catch {
      showToast("Lỗi khi đổi mật khẩu!", "error")
    } finally {
      setPwSaving(false)
    }
  }

  const initials = name
    ? name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase()
    : "SV"

  return (
        <div className="st-content">

          <h1 className="st-title">Cài đặt tài khoản</h1>
          <p className="st-subtitle">Quản lý thông tin cá nhân và tuỳ chỉnh hệ thống</p>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : (
            <>
              {/* ── Thông tin tài khoản ── */}
              <div className="st-card">
                <div className="st-card-header">
                  <span>✉️</span>
                  <div>
                    <p className="st-card-title">Thông tin tài khoản</p>
                    <p className="st-card-desc">Cập nhật thông tin cá nhân của bạn</p>
                  </div>
                </div>

                {/* Avatar */}
                <div className="st-avatar-wrapper">
                  <div className="st-avatar" onClick={() => fileRef.current?.click()}>
                    {avatar
                      ? <img src={avatar} alt="avatar" />
                      : <span style={{ fontSize:24, fontWeight:700 }}>{initials}</span>
                    }
                    <div className="st-avatar-overlay">📷</div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarChange} />
                  <p style={{ fontSize:12, color:"#aaa", marginTop:8 }}>Nhấn để đổi ảnh đại diện</p>
                </div>

                <div className="st-field">
                  <label>Họ và tên</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nhập họ và tên..." />
                </div>

                <div className="st-field">
                  <label>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Nhập email..." />
                </div>

                <div className="st-field">
                  <label>Ngày sinh</label>
                  <input type="date" value={ngaySinh} onChange={e => setNgaySinh(e.target.value)} />
                </div>

                <div className="st-field">
                  <label>Giới tính</label>
                  <select value={gioiTinh} onChange={e => setGioiTinh(e.target.value)}
                    style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #e0d8cc", borderRadius:8, fontSize:14, fontFamily:"inherit", outline:"none" }}>
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                {/* Đổi mật khẩu */}
                <button className="st-btn-outline" onClick={() => setShowPwForm(!showPwForm)}>
                  🔒 {showPwForm ? "Ẩn form đổi mật khẩu" : "Đổi mật khẩu"}
                </button>

                {showPwForm && (
                  <div style={{ marginTop:16, background:"#f9f5f0", borderRadius:12, padding:"16px 18px", border:"1px solid #f0e8dc" }}>
                    <p style={{ fontWeight:600, color:"#5a3e2b", marginBottom:12, fontSize:14 }}>🔐 Đổi mật khẩu</p>
                    <div className="st-field">
                      <label>Mật khẩu hiện tại</label>
                      <input type="password" value={matKhauCu} onChange={e => setMatKhauCu(e.target.value)} placeholder="Nhập mật khẩu hiện tại..." />
                    </div>
                    <div className="st-field">
                      <label>Mật khẩu mới</label>
                      <input type="password" value={matKhauMoi} onChange={e => setMatKhauMoi(e.target.value)} placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..." />
                    </div>
                    <div className="st-field">
                      <label>Xác nhận mật khẩu mới</label>
                      <input type="password" value={matKhauXN} onChange={e => setMatKhauXN(e.target.value)} placeholder="Nhập lại mật khẩu mới..." />
                    </div>
                    <div style={{ display:"flex", gap:10, marginTop:8 }}>
                      <button
                        onClick={handleChangePassword}
                        disabled={pwSaving}
                        style={{ padding:"9px 20px", borderRadius:20, background:"#e87722", color:"#fff", border:"none", cursor:"pointer", fontWeight:600, fontSize:14 }}
                      >
                        {pwSaving ? "Đang lưu..." : "Xác nhận đổi mật khẩu"}
                      </button>
                      <button
                        onClick={() => { setShowPwForm(false); setMatKhauCu(""); setMatKhauMoi(""); setMatKhauXN("") }}
                        style={{ padding:"9px 16px", borderRadius:20, background:"#f3f4f6", color:"#555", border:"none", cursor:"pointer", fontSize:14 }}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Cài đặt hiển thị ── */}
              <div className="st-card">
                <div className="st-card-header">
                  <span>☀️</span>
                  <div>
                    <p className="st-card-title">Cài đặt hiển thị</p>
                    <p className="st-card-desc">Tuỳ chỉnh giao diện và ngôn ngữ</p>
                  </div>
                </div>

                <div className="st-row">
                  <div>
                    <p className="st-row-label">Giao diện</p>
                    <p className="st-row-desc">Chọn chế độ hiển thị</p>
                  </div>
                  <div className="st-toggle-group">
                    <button className={`st-toggle-btn ${theme === "sang" ? "active" : ""}`} onClick={() => setTheme("sang")}>☀️ Sáng</button>
                    <button className={`st-toggle-btn ${theme === "toi" ? "active" : ""}`} onClick={() => setTheme("toi")}>🌙 Tối</button>
                  </div>
                </div>

                <div className="st-row">
                  <div>
                    <p className="st-row-label">Ngôn ngữ</p>
                    <p className="st-row-desc">Chọn ngôn ngữ hiển thị</p>
                  </div>
                  <div className="st-toggle-group">
                    <button className={`st-toggle-btn ${lang === "vi" ? "active" : ""}`} onClick={() => setLang("vi")}>Tiếng Việt</button>
                    <button className={`st-toggle-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>English</button>
                  </div>
                </div>
              </div>

              {/* ── Cài đặt thông báo ── */}
              <div className="st-card">
                <div className="st-card-header">
                  <span>🔔</span>
                  <div>
                    <p className="st-card-title">Cài đặt thông báo</p>
                    <p className="st-card-desc">Quản lý các thông báo bạn nhận được</p>
                  </div>
                </div>

                {[
                  { label:"✉️ Thông báo qua Email",      desc:"Nhận thông báo qua email",      val:notifEmail,  set:setNotifEmail },
                  { label:"🔔 Thông báo trong hệ thống", desc:"Hiển thị thông báo trong app",  val:notifSystem, set:setNotifSystem },
                  { label:"🔄 Cập nhật lớp mới",         desc:"Thông báo khi có lớp học mới",  val:notifUpdate, set:setNotifUpdate },
                ].map(item => (
                  <div className="st-notif-row" key={item.label}>
                    <div>
                      <p className="st-row-label">{item.label}</p>
                      <p className="st-row-desc">{item.desc}</p>
                    </div>
                    <div className={`st-switch ${item.val ? "on" : ""}`} onClick={() => item.set(!item.val)}>
                      <div className="st-switch-thumb" />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Save button ── */}
              <div className="st-footer">
                <button className="st-save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </>
          )}

          {/* Toast notification */}
          {toast && (
            <div style={{
              position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
              background: toastType === "success" ? "#22c55e" : "#ef4444",
              color:"#fff", padding:"12px 24px", borderRadius:24,
              fontWeight:600, fontSize:14, zIndex:9999,
              boxShadow:"0 4px 16px rgba(0,0,0,0.15)"
            }}>
              {toastType === "success" ? "✅" : "⚠️"} {toast}
            </div>
          )}

        </div>
  )
}

export default Settings;