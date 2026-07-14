import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

interface RegisterProps {
  isModal?: boolean;
  onClose?: () => void;
}

const Register = ({ isModal = false }: RegisterProps) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    name?: string;
    username?: string;
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

    if (name === "email") {
      if (!val) {
        setErrors(prev => ({ ...prev, email: "Vui lòng điền email!" }));
      } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(val)) {
          setErrors(prev => ({ ...prev, email: "Vui lòng điền đúng định dạng email!" }));
        } else {
          setErrors(prev => ({ ...prev, email: undefined }));
        }
      }
    } else if (name === "username") {
      if (!val) {
        setErrors(prev => ({ ...prev, username: "Vui lòng điền tên đăng nhập!" }));
      } else if (val.length < 3) {
        setErrors(prev => ({ ...prev, username: "Tên đăng nhập phải có ít nhất 3 ký tự!" }));
      } else {
        setErrors(prev => ({ ...prev, username: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    let hasError = false;

    const emailVal = form.email.trim();
    if (!emailVal) {
      newErrors.email = "Vui lòng điền email!";
      hasError = true;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailVal)) {
        newErrors.email = "Vui lòng điền đúng định dạng email!";
        hasError = true;
      }
    }

    if (!form.name.trim()) {
      newErrors.name = "Vui lòng điền họ và tên!";
      hasError = true;
    }

    const usernameVal = form.username.trim();
    if (!usernameVal) {
      newErrors.username = "Vui lòng điền tên đăng nhập!";
      hasError = true;
    } else if (usernameVal.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự!";
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
          email: form.email,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Đăng ký thất bại!");
        return;
      }

      setSuccess("Đăng ký thành công! Đang chuyển sang trang đăng nhập...");
      setTimeout(() => navigate(isModal ? "?auth=login" : "/login", isModal ? { replace: true } : undefined), 2000);
    } catch (err) {
      setError("Không thể kết nối đến server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      {error && <div className="auth-alert-error">{error}</div>}
      {success && <div className="auth-alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form-wrapper" noValidate>
        <div className="auth-input-group">
          <div className="auth-input-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <input
              type="email"
              name="email"
              placeholder="Địa chỉ email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email ? "input-error" : ""}
            />
          </div>
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="auth-input-group">
          <div className="auth-input-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
                <line x1="7" y1="8" x2="11" y2="8"/>
                <line x1="7" y1="12" x2="13" y2="12"/>
                <circle cx="16" cy="14" r="2"/>
              </svg>
            </span>
            <input
              type="text"
              name="name"
              placeholder="Họ và tên"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? "input-error" : ""}
            />
          </div>
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="auth-input-group">
          <div className="auth-input-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.username ? "input-error" : ""}
            />
          </div>
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>

        <div className="auth-input-group">
          <div className="auth-input-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPass(!showPass)}
              tabIndex={-1}
            >
              {showPass ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="auth-input-group">
          <div className="auth-input-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              type={showConfirmPass ? "text" : "password"}
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              tabIndex={-1}
            >
              {showConfirmPass ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <p className="auth-switch-link">
          Đã có tài khoản?{" "}
          <Link replace to={isModal ? "?auth=login" : "/login"}>
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
