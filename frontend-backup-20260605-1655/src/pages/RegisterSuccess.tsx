import "./registerSuccess.css";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

function RegisterSuccess() {
  const location = useLocation();
  const courseTitle = location.state?.title || "khóa học";

  return (
    <>
      <Navbar />

      <div className="rs-page">
        {/* Breadcrumb */}
        <nav className="rs-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="sep">»</span>
          <Link to="/courses">Các khóa học</Link>
          <span className="sep">»</span>
          <Link to="/courses/toeic">Luyện thi Toeic</Link>
          <span className="sep">»</span>
          <span className="active">{courseTitle}</span>
        </nav>

        <div className="rs-container">
          <div className="rs-card">
            <div className="rs-icon">🎯</div>

            <h1 className="rs-title">
              BẠN ĐÃ ĐĂNG KÝ KHÓA <br /> HỌC THÀNH CÔNG 🎉
            </h1>

            <p className="rs-subtitle">
              Cảm ơn bạn đã đăng ký khóa học tại FLIC
            </p>

            <div className="rs-info">
              <p>📞 Trung tâm sẽ liên hệ trong 24h</p>
              <p>📧 Email xác nhận đã được gửi</p>
            </div>

            <div className="rs-actions">
              <Link to="/" className="rs-btn rs-btn-primary">
                Về trang chủ
              </Link>
              <Link to="/courses-home" className="rs-btn rs-btn-outline">
                Xem khóa học khác
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterSuccess;