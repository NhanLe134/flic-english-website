import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoiMatKhau.css";

// Component icon mắt tái sử dụng
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// Component ô nhập mật khẩu có icon mắt
const PasswordField = ({
  label, value, onChange
}: {
  label: string; value: string; onChange: (v: string) => void
}) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom:14 }}>
      <label className="password-label">{label} <span>*</span></label>
      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
        <input
          className="password-input"
          type={show ? "text" : "password"}
          placeholder="********"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width:"100%", boxSizing:"border-box", paddingRight:44, marginBottom:0 }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          tabIndex={-1}
          style={{
            position:"absolute", right:12,
            background:"none", border:"none",
            cursor:"pointer", padding:0,
            color:"#aaa", display:"flex", alignItems:"center",
            height:"100%", top:0, bottom:0, margin:"auto"
          }}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
};

const DoiMatKhau = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPopup,       setShowPopup]       = useState(false);
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);

  const handleSave = async () => {
    setError("");
    if (!currentPassword)             { setError("Vui lòng nhập mật khẩu hiện tại"); return; }
    if (!password)                    { setError("Vui lòng nhập mật khẩu mới"); return; }
    if (password.length < 6)          { setError("Mật khẩu phải có ít nhất 6 ký tự"); return; }
    if (password !== confirmPassword) { setError("Mật khẩu mới không khớp"); return; }

    const userStr = sessionStorage.getItem("user");
    if (!userStr) { navigate("/"); return; }
    const user = JSON.parse(userStr);

    setLoading(true);
    try {
      const res = await fetch("http://14.225.192.252:5000/doi-mat-khau", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maNguoiDung: user.MaNguoiDung,
          matKhauCu:   currentPassword,
          matKhauMoi:  password
        })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Có lỗi xảy ra"); return; }
      setShowPopup(true);
      setTimeout(() => navigate("/thong-tin-ca-nhan"), 2000);
    } catch {
      setError("Không kết nối được server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-page">
      <div className="password-card">
        <img src={`${import.meta.env.BASE_URL}image.png`} alt="logo" className="password-logo" />
        <h2 className="password-title">ĐỔI MẬT KHẨU</h2>

        <div className="password-form">

          {/* Thông báo lỗi */}
          {error && (
            <div style={{
              background:"#fff0f0", border:"1px solid #ffcccc",
              borderRadius:8, padding:"10px 14px",
              color:"#cc0000", fontSize:14, marginBottom:12
            }}>
              ⚠️ {error}
            </div>
          )}

          <PasswordField
            label="Mật khẩu hiện tại"
            value={currentPassword}
            onChange={setCurrentPassword}
          />

          <div className="password-divider" />

          <PasswordField
            label="Nhập mật khẩu mới"
            value={password}
            onChange={setPassword}
          />

          <PasswordField
            label="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <button
            className="password-save-btn"
            onClick={handleSave}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>

<button className="password-back-btn" onClick={() => navigate("/thong-tin-ca-nhan")}> 
            ← Quay lại
          </button>

        </div>
      </div>

      {showPopup && (
        <div className="doimatkhau-success-popup">
          <div className="doimatkhau-success-box">
            <div className="doimatkhau-success-icon">✓</div>
            <p>Đổi mật khẩu thành công</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoiMatKhau;

