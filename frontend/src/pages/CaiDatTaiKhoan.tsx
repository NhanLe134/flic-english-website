import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./caidattaikhoan.css";

const CaiDatTaiKhoan = () => {
  const navigate = useNavigate();
  const [lightMode, setLightMode] = useState(true);
  const [language, setLanguage] = useState("vi");
  const [showPopup, setShowPopup] = useState(false);
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) { navigate("/"); return; }

    const user = JSON.parse(userStr);
    const maNguoiDung = user.MaNguoiDung;

    fetch(`http://localhost:5000/giangvien/${maNguoiDung}`)
      .then(res => res.json())
      .then(data => {
        setHoTen(data.HoTen || "");
        setEmail(data.Email || "");
        setInitials(data.HoTen?.split(" ").pop()?.charAt(0).toUpperCase() || "?");
      })
      .catch(err => console.log(err));
  }, []);

  const handleSave = async () => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const maNguoiDung = user.MaNguoiDung;

    try {
      await fetch(`http://localhost:5000/giangvien/${maNguoiDung}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ HoTen: hoTen, Email: email })
      });

      // Cập nhật localStorage
      user.HoTen = hoTen;
      user.Email = email;
      sessionStorage.setItem("user", JSON.stringify(user));

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      console.log(err);
      alert("Lỗi khi lưu");
    }
  };

  return (
    <div className="cdt-wrapper">

      <h1>Cài đặt tài khoản</h1>
      <p className="settings-sub">Quản lý thông tin cá nhân và tùy chỉnh hệ thống</p>

      {/* THÔNG TIN TÀI KHOẢN */}
      <div className="settings-card">
        <h3>Thông tin tài khoản</h3>

        <div className="settings-avatar-upload">
          <div className="settings-avatar-big">{initials}</div>
          <div>
            <p className="settings-upload-title">Ảnh đại diện</p>
            <span>Ảnh định dạng JPG, PNG (tối đa 2MB)</span>
          </div>
        </div>

        <label>Họ và tên</label>
        <input
          value={hoTen}
          onChange={(e) => setHoTen(e.target.value)}
        />

        <label>Email</label>
        <input value={email} disabled />

        <button className="settings-password-btn" onClick={() => navigate("/doi-mat-khau")}>
          🔒 Đổi mật khẩu
        </button>
      </div>

      {/* CÀI ĐẶT HIỂN THỊ */}
      <div className="settings-card">
        <h3>Cài đặt hiển thị</h3>

        <div className="settings-row">
          <div>
            <p className="settings-title">Giao diện</p>
            <span>Chọn chế độ hiển thị</span>
          </div>
          <div className="settings-toggle-group">
            <button className={lightMode ? "active" : ""} onClick={() => setLightMode(true)}>☀ Sáng</button>
            <button className={!lightMode ? "active" : ""} onClick={() => setLightMode(false)}>🌙 Tối</button>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <p className="settings-title">Ngôn ngữ</p>
            <span>Chọn ngôn ngữ hiển thị</span>
          </div>
          <div className="settings-toggle-group">
            <button className={language === "vi" ? "active" : ""} onClick={() => setLanguage("vi")}>Tiếng Việt</button>
            <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button>
          </div>
        </div>
      </div>

      {/* THÔNG BÁO */}
      <div className="settings-card">
        <h3>🔔 Cài đặt thông báo</h3>

        {[
          { label: "Thông báo qua Email",       desc: "Nhận thông báo qua email của bạn" },
          { label: "Thông báo trong hệ thống",  desc: "Hiển thị thông báo trong ứng dụng" },
          { label: "Cập nhật lớp mới",          desc: "Thông báo khi có lớp học mới" },
        ].map((item, i) => (
          <div key={i} className="settings-notify-row">
            <div>
              <p>{item.label}</p>
              <span>{item.desc}</span>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        ))}
      </div>

      <div className="settings-save">
        <button className="settings-save-btn" onClick={handleSave}>
          Lưu thay đổi
        </button>
      </div>

      {/* SUCCESS POPUP */}
      {showPopup && (
        <div className="settings-success-popup">
          <div className="settings-success-box">
            <div className="settings-success-icon">✓</div>
            <p>Lưu kết quả thành công</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default CaiDatTaiKhoan;