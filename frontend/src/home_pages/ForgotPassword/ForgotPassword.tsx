import "./ForgotPassword.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://14.225.192.252:5000";

interface ForgotPasswordProps {
  isModal?: boolean;
  onClose?: () => void;
}

const ForgotPassword = ({ isModal = false }: ForgotPasswordProps) => {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState("")
  const [errors,  setErrors]  = useState<{ email?: string }>({})

  const handleBlur = () => {
    const val = email.trim();
    if (!val) {
      setErrors({ email: "Vui lòng điền email!" });
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(val)) {
      setErrors({ email: "Vui lòng điền đúng định dạng email!" });
    } else {
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    let hasError = false;

    const emailVal = email.trim();
    if (!emailVal) {
      newErrors.email = "Vui lòng điền email!";
      hasError = true;
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(emailVal)) {
      newErrors.email = "Vui lòng điền đúng định dạng email!";
      hasError = true;
    }

    setErrors(newErrors);
    setError("");
    setSuccess("");

    if (hasError) return;

    setLoading(true)

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

  const cardContent = (
    <div className="forgot-card">

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
            onClick={() => navigate(isModal ? "?auth=login" : "/login")}
            style={{ marginTop:10, padding:"8px 20px", borderRadius:20, background:"#16a34a", color:"#fff", border:"none", cursor:"pointer", fontWeight:600, fontSize:13 }}
          >
            Về trang đăng nhập
          </button>
        </div>
      )}

      {!success && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <input
            type="email"
            placeholder="Nhập email đã đăng ký"
            className="forgot-input"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setErrors({});
              setError("");
            }}
            onBlur={handleBlur}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            disabled={loading}
            style={{ borderColor: errors.email ? "#ef4444" : undefined }}
          />
          {errors.email && (
            <span style={{ color: "#ef4444", fontSize: "13px", fontStyle: "italic", marginTop: "4px", display: "block", textAlign: "left", width: "100%" }}>
              {errors.email}
            </span>
          )}

          {error && (
            <div style={{ color: "#ef4444", fontSize: "14px", marginTop: "16px", marginBottom: "-8px", textAlign: "left", fontStyle: "italic" }}>
              {error}
            </div>
          )}

          <button
            className="forgot-button"
            onClick={handleSubmit}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Đang gửi..." : "Gửi mật khẩu mới"}
          </button>
        </div>
      )}

      <button className="forgot-back" onClick={() => navigate(isModal ? "?auth=login" : "/login")}>
        ← Quay lại đăng nhập
      </button>

    </div>
  );

  if (isModal) {
    return cardContent;
  }

  return (
    <div className="forgot-page">
      {cardContent}
    </div>
  );
}

export default ForgotPassword;