import "./login.css";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const API = "http://localhost:5000";

const Login = () => {
  const navigate  = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }

      const roleRes  = await fetch(`${API}/users/role/${data.MaNguoiDung}`)
      const roleData = await roleRes.json()
      const vaiTro   = roleData?.VaiTro || "Học Viên"

      sessionStorage.setItem("user", JSON.stringify({ ...data, VaiTro: vaiTro }))

      if (vaiTro === "Quản Trị Viên")          navigate("/admin/admin-dashboard")
      else if (vaiTro === "Giảng Viên")         navigate("/quan-ly-khoa-hoc")
      else if (vaiTro === "Quản Trị Nội Dung")  navigate("/QTV/dashboard")
      else                                       navigate("/profile")

    } catch (err) {
      console.error(err);
      alert("Không kết nối được server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/image.png" alt="FLIC Logo" className="login-logo" />
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