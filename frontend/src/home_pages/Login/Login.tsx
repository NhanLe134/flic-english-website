import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

interface LoginProps {
  isModal?: boolean;
  onClose?: () => void;
}

const Login = ({ isModal = false, onClose }: LoginProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [loginError, setLoginError] = useState("");

  const handleLogin = async () => {
    const newErrors: typeof errors = {};
    let hasError = false;

    if (!username.trim()) {
      newErrors.username = "Vui lòng điền tên đăng nhập!";
      hasError = true;
    }
    if (!password.trim()) {
      newErrors.password = "Vui lòng điền mật khẩu!";
      hasError = true;
    }

    setErrors(newErrors);
    setLoginError("");

    if (hasError) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          alert("Tài khoản của bạn đã bị khóa");
        } else {
          setLoginError(data.message || "Tên đăng nhập hoặc mật khẩu không chính xác!");
        }
        return;
      }

      const roleRes = await fetch(`${API}/users/role/${data.MaNguoiDung}`);
      const roleData = await roleRes.json();
      const vaiTro = roleData?.VaiTro || "Học Viên";

      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        if (onClose) onClose();
        window.dispatchEvent(new CustomEvent("show-mobile-notice", { detail: { role: vaiTro } }));
        return;
      }

      sessionStorage.setItem("user", JSON.stringify({ ...data, VaiTro: vaiTro }));

      if (window.location.pathname.includes("/test-exam/")) {
        navigate("/test-thu-sv", { replace: true });
        setTimeout(() => {
          window.location.href = window.location.pathname;
        }, 100);
      } else {
        if (vaiTro === "Quản Trị Viên") navigate("/admin/admin-dashboard");
        else if (vaiTro === "Giảng Viên") navigate(`/teacher${data.MaNguoiDung}/lophoc`);
        else if (vaiTro === "Quản Trị Nội Dung") navigate("/QTV/khoahoc");
        else navigate("/course-register");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Không kết nối được server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
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
            placeholder="Tên đăng nhập hoặc email"
            value={username}
            onChange={e => {
              setUsername(e.target.value);
              setErrors(prev => ({ ...prev, username: undefined }));
            }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
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
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setErrors(prev => ({ ...prev, password: undefined }));
            }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
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

      {loginError && <div className="login-error-message">{loginError}</div>}

      <button className="auth-submit-btn" onClick={handleLogin} disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p className="auth-switch-link">
        Chưa có tài khoản?{" "}
        <Link replace to={isModal ? "?auth=register" : "/register"}>
          Đăng ký ngay
        </Link>
      </p>
      <Link to={isModal ? "?auth=forgot" : "/forgot-password"} className="auth-forgot-link">Quên mật khẩu?</Link>
    </div>
  );
};

export default Login;
