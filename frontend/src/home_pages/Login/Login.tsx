import "./Login.css";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const API = "http://localhost:5000";

interface LoginProps {
  isModal?: boolean;
  onClose?: () => void;
}

const Login = ({ isModal = false }: LoginProps) => {
  const navigate  = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

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
        setLoginError(data.message || "Tên đăng nhập hoặc mật khẩu không chính xác!");
        return;
      }

      const roleRes  = await fetch(`${API}/users/role/${data.MaNguoiDung}`)
      const roleData = await roleRes.json()
      const vaiTro   = roleData?.VaiTro || "Học Viên"

      sessionStorage.setItem("user", JSON.stringify({ ...data, VaiTro: vaiTro }))
      localStorage.setItem("user", JSON.stringify({ ...data, VaiTro: vaiTro }))

      // Khi đăng nhập thành công và chuyển hướng, query param ?auth=login sẽ tự động mất đi
      if (vaiTro === "Quản Trị Viên")          navigate("/admin/admin-dashboard")
      else if (vaiTro === "Giảng Viên")         navigate("/quan-ly-khoa-hoc")
      else if (vaiTro === "Quản Trị Nội Dung")  navigate("/QTV/khoahoc")
      else                                       navigate("/profile")
    } catch (err) {
      console.error(err);
      setLoginError("Không kết nối được server");
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div className="login-card">
      {!isModal && <img src={`${import.meta.env.BASE_URL}image.png`} alt="FLIC Logo" className="login-logo" />}
      <h2 className="login-title">Đăng nhập</h2>
      <div className="form-wrapper">

        <label>Tên đăng nhập/Email <span>*</span></label>
        <input
          type="text"
          placeholder="Nhập tên đăng nhập hoặc email"
          value={username}
          onChange={e => {
            setUsername(e.target.value);
            setErrors(prev => ({ ...prev, username: undefined }));
          }}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          style={{ borderColor: errors.username ? "#ef4444" : undefined }}
        />
        {errors.username && (
          <span style={{ color: "#ef4444", fontSize: "13px", fontStyle: "italic", marginTop: "4px", display: "block" }}>
            {errors.username}
          </span>
        )}

        <label>Mật khẩu <span>*</span></label>
        <div style={{ position:"relative", width:"100%" }}>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setErrors(prev => ({ ...prev, password: undefined }));
            }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width:"100%", boxSizing:"border-box", paddingRight:44, borderColor: errors.password ? "#ef4444" : undefined }}
          />
          {/* Nút mắt */}
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPass(!showPass)}
            tabIndex={-1}
            style={{
              position:"absolute", right:12, top:"50%",
              transform:"translateY(-50%)",
              background:"none", border:"none",
              cursor:"pointer", padding:0,
              color:"#aaa", display:"flex", alignItems:"center",
              zIndex:1
            }}
          >
            {showPass ? (
              // Mắt gạch — đang hiện mật khẩu
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              // Mắt — đang ẩn mật khẩu
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

        {loginError && (
          <div style={{ color: "#ef4444", fontSize: "14px", marginTop: "16px", marginBottom: "-8px", textAlign: "left", fontStyle: "italic" }}>
            {loginError}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p style={{ textAlign:"center", marginTop:12, fontSize:15, color:"#666" }}>
          Chưa có tài khoản?{" "}
          <Link to={isModal ? "?auth=register" : "/register"} style={{ color:"#000080", fontWeight:600 }}>
            Đăng ký ngay
          </Link>
        </p>
        <Link to={isModal ? "?auth=forgot" : "/forgot-password"} className="forgot">Quên mật khẩu?</Link>
      </div>
    </div>
  );

  if (isModal) {
    return cardContent;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={import.meta.env.BASE_URL + "image.png"} alt="FLIC Logo" className="login-logo" />
        <h2 className="login-title">Đăng nhập</h2>
        <div className="form-wrapper">

          <label>Tên đăng nhập/Email <span>*</span></label>
          <input
            type="text"
            placeholder="Nhập tên đăng nhập hoặc email"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />

          <label>Mật khẩu <span>*</span></label>
          <div style={{ position:"relative", width:"100%" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width:"100%", boxSizing:"border-box", paddingRight:44 }}
            />
            {/* Nút mắt */}
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              tabIndex={-1}
              style={{
                position:"absolute", right:12, top:"50%",
                transform:"translateY(-50%)",
                background:"none", border:"none",
                cursor:"pointer", padding:0,
                color:"#aaa", display:"flex", alignItems:"center",
                zIndex:1
              }}
            >
              {showPass ? (
                // Mắt gạch — đang hiện mật khẩu
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                // Mắt — đang ẩn mật khẩu
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          <button onClick={handleLogin} disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p style={{ textAlign:"center", marginTop:12, fontSize:14, color:"#666" }}>
            Chưa có tài khoản?{" "}
            <Link to="/register" style={{ color:"#e87722", fontWeight:600 }}>
              Đăng ký ngay
            </Link>
          </p>
          <Link to="/forgot-password" className="forgot">Quên mật khẩu?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
