import "./ForgotPassword.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async () => {
    if (!email.trim()) { setError("Vui lòng nhập email!"); return }
    if (!email.includes("@")) { setError("Email không hợp lệ!"); return }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res  = await fetch(`${API}/forgot-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email })
      })
      const data = await res.json()

      if (res.ok) {
        setSuccess(data.message || "Đã gửi mật khẩu mới về email của bạn!")
      } else {
        setError(data.message || "Có lỗi xảy ra. Vui lòng thử lại!")
      }
    } catch {
      setError("Không thể kết nối server. Vui lòng thử lại!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-page">
      <div className="forgot-card">

        <img src={`${import.meta.env.BASE_URL}image.png`} alt="FLIC Logo" className="forgot-logo" />

        <h2 className="forgot-title">QUÊN MẬT KHẨU</h2>
        <p className="forgot-text">Nhập email của bạn để nhận mật khẩu mới</p>

        {/* Success */}
        {success && (
          <div style={{
            background:"#dcfce7", border:"1px solid #86efac",
            borderRadius:10, padding:"12px 16px", marginBottom:16,
            fontSize:14, color:"#15803d", textAlign:"center", width:"100%"
          }}>
            ✅ {success}
            <br />
            <button
              onClick={() => navigate("/login")}
              style={{ marginTop:10, padding:"8px 20px", borderRadius:20, background:"#16a34a", color:"#fff", border:"none", cursor:"pointer", fontWeight:600, fontSize:13 }}
            >
              Về trang đăng nhập
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background:"#fef2f2", border:"1px solid #fecaca",
            borderRadius:10, padding:"10px 14px", marginBottom:14,
            fontSize:13, color:"#dc2626", textAlign:"center", width:"100%"
          }}>
            ⚠️ {error}
          </div>
        )}

        {!success && (
          <>
            <input
              type="email"
              placeholder="Nhập email đã đăng ký"
              className="forgot-input"
              value={email}
              onChange={e => { setEmail(e.target.value); setError("") }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              disabled={loading}
            />

            <button
              className="forgot-button"
              onClick={handleSubmit}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Đang gửi..." : "Gửi mật khẩu mới"}
            </button>
          </>
        )}

        <button className="forgot-back" onClick={() => navigate("/login")}>
          ← Quay lại đăng nhập
        </button>

      </div>
    </div>
  )
}

export default ForgotPassword;