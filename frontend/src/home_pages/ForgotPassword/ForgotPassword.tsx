import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

interface ForgotPasswordProps {
  isModal?: boolean;
  onClose?: () => void;
}

const ForgotPassword = ({ isModal = false }: ForgotPasswordProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});

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

    setLoading(true);

    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || "Đã gửi mật khẩu mới về email của bạn!");
      } else {
        setError(data.message || "Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } catch {
      setError("Không thể kết nối server. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      {success && (
        <div className="auth-alert-success">
          {success}
          <br />
          <button
            onClick={() => navigate(isModal ? "?auth=login" : "/login", isModal ? { replace: true } : undefined)}
            className="auth-back-login-btn"
          >
            Về trang đăng nhập
          </button>
        </div>
      )}

      {!success && (
        <div className="form-wrapper">
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
                placeholder="Nhập email đã đăng ký"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setErrors({});
                  setError("");
                }}
                onBlur={handleBlur}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                disabled={loading}
                className={errors.email ? "input-error" : ""}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {error && <div className="login-error-message">{error}</div>}

          <button
            className="auth-submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi mật khẩu mới"}
          </button>

          <button className="auth-forgot-link" onClick={() => navigate(isModal ? "?auth=login" : "/login", isModal ? { replace: true } : undefined)}>
            ← Quay lại đăng nhập
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
