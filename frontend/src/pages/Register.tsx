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

  const [errors, setErrors] = useState<{
    username?: string;
    name?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = value.trim();

    if (name === "username") {
      if (!val) {
        setErrors(prev => ({ ...prev, username: "Vui lòng điền email hoặc số điện thoại!" }));
      } else {
        const isEmailAttempt = val.includes("@");
        if (isEmailAttempt) {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
          if (!emailRegex.test(val)) {
            setErrors(prev => ({ ...prev, username: "Vui lòng điền đúng định dạng email hoặc số điện thoại!" }));
          } else {
            setErrors(prev => ({ ...prev, username: undefined }));
          }
        } else {
          const phoneRegex = /^0\d{9}$/;
          if (!phoneRegex.test(val)) {
            setErrors(prev => ({ ...prev, username: "Vui lòng điền đúng định dạng email hoặc số điện thoại!" }));
          } else {
            setErrors(prev => ({ ...prev, username: undefined }));
          }
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    let hasError = false;

    const usernameVal = form.username.trim();
    if (!usernameVal) {
      newErrors.username = "Vui lòng điền email hoặc số điện thoại!";
      hasError = true;
    } else {
      const isEmailAttempt = usernameVal.includes("@");
      if (isEmailAttempt) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(usernameVal)) {
          newErrors.username = "Vui lòng điền đúng định dạng email hoặc số điện thoại!";
          hasError = true;
        }
      } else {
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(usernameVal)) {
          newErrors.username = "Vui lòng điền đúng định dạng email hoặc số điện thoại!";
          hasError = true;
        }
      }
    }
    if (!form.name.trim()) {
      newErrors.name = "Vui lòng điền họ và tên!";
      hasError = true;
    }
    if (!form.password.trim()) {
      newErrors.password = "Vui lòng điền mật khẩu!";
      hasError = true;
    }
    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng điền lại mật khẩu!";
      hasError = true;
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp!";
      hasError = true;
    }

    setErrors(newErrors);
    setError("");
    setSuccess("");

    if (hasError) return;

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

      <form onSubmit={handleSubmit} className="form-wrapper" noValidate>
        <label>Email hoặc Số điện thoại <span>*</span></label>
        <input
          type="text"
          name="username"
          placeholder="Nhập email hoặc số điện thoại"
          value={form.username}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{ borderColor: errors.username ? "#ef4444" : undefined }}
        />
        {errors.username && (
          <span style={{ color: "#ef4444", fontSize: "13px", fontStyle: "italic", marginTop: "4px", display: "block" }}>
            {errors.username}
          </span>
        )}

        <label>Họ và tên <span>*</span></label>
        <input
          type="text"
          name="name"
          placeholder="Nhập họ và tên đầy đủ"
          value={form.name}
          onChange={handleChange}
          style={{ borderColor: errors.name ? "#ef4444" : undefined }}
        />
        {errors.name && (
          <span style={{ color: "#ef4444", fontSize: "13px", fontStyle: "italic", marginTop: "4px", display: "block" }}>
            {errors.name}
          </span>
        )}

        <label>Mật khẩu <span>*</span></label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showPass ? "text" : "password"}
            name="password"
            placeholder="Nhập mật khẩu"
            value={form.password}
            onChange={handleChange}
            style={{ paddingRight: 44, borderColor: errors.password ? "#ef4444" : undefined }}
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
        {errors.password && (
          <span style={{ color: "#ef4444", fontSize: "13px", fontStyle: "italic", marginTop: "4px", display: "block" }}>
            {errors.password}
          </span>
        )}

        <label>Nhập lại mật khẩu <span>*</span></label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showConfirmPass ? "text" : "password"}
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu xác nhận"
            value={form.confirmPassword}
            onChange={handleChange}
            style={{ paddingRight: 44, borderColor: errors.confirmPassword ? "#ef4444" : undefined }}
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
        {errors.confirmPassword && (
          <span style={{ color: "#ef4444", fontSize: "13px", fontStyle: "italic", marginTop: "4px", display: "block" }}>
            {errors.confirmPassword}
          </span>
        )}

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