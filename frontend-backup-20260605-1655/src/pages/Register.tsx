import "./register.css";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const API = "http://localhost:5000";

interface RegisterProps {
  isModal?: boolean;
  onClose?: () => void;
}

const Register = ({ isModal = false }: RegisterProps) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mật khẩu khớp nhau
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          name: form.name,
          email: form.username, // dùng email/sdt làm username
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Đăng ký thất bại!");
        return;
      }

      setSuccess("Đăng ký thành công! Đang chuyển sang trang đăng nhập...");
      setTimeout(() => navigate(isModal ? "?auth=login" : "/login"), 2000);
    } catch (err) {
      setError("Không thể kết nối đến server!");
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div className="register-card">
      <h2 className="register-title">Đăng ký tài khoản</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form-wrapper">
        <label>Email hoặc Số điện thoại <span>*</span></label>
        <input
          type="text"
          name="username"
          placeholder="Nhập email hoặc số điện thoại"
          value={form.username}
          onChange={handleChange}
          required
        />

        <label>Họ và tên <span>*</span></label>
        <input
          type="text"
          name="name"
          placeholder="Nhập họ và tên đầy đủ"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>Mật khẩu <span>*</span></label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showPass ? "text" : "password"}
            name="password"
            placeholder="Nhập mật khẩu"
            value={form.password}
            onChange={handleChange}
            required
            style={{ paddingRight: 44 }}
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPass(!showPass)}
            tabIndex={-1}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "#aaa",
              display: "flex",
              alignItems: "center",
              zIndex: 1
            }}
          >
            {showPass ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>

        <label>Nhập lại mật khẩu <span>*</span></label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showConfirmPass ? "text" : "password"}
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu xác nhận"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            style={{ paddingRight: 44 }}
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowConfirmPass(!showConfirmPass)}
            tabIndex={-1}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "#aaa",
              display: "flex",
              alignItems: "center",
              zIndex: 1
            }}
          >
            {showConfirmPass ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>

        <button type="submit" className="register-submit-btn" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "#666" }}>
          Đã có tài khoản?{" "}
          <Link to={isModal ? "?auth=login" : "/login"} style={{ color: "#000080", fontWeight: 600, textDecoration: "none" }}>
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </div>
  );

  if (isModal) {
    return cardContent;
  }

  return (
    <div>
      <Navbar />
      <div className="register-page">
        {cardContent}
      </div>
    </div>
  );
};

export default Register;