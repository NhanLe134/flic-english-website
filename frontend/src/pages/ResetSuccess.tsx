import "./ResetSuccess.css";
import { useNavigate } from "react-router-dom";

const ResetSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <img src="/image.png" alt="FLIC Logo" className="success-logo" />

      <h2>QUÊN MẬT KHẨU</h2>

      <p>
        Mật khẩu mới đã được gửi đến email của bạn,
        <br />
        hãy quay lại đăng nhập!
      </p>

      <button onClick={() => navigate("/Login")}>
        Đăng Nhập
      </button>
    </div>
  );
};

export default ResetSuccess;