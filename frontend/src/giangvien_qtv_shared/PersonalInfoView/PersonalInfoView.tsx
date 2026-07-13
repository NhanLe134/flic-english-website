import "./PersonalInfoView.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAvatar } from "../../context/AvatarContext";
import { FiAward, FiBriefcase, FiUser, FiMail, FiPhone } from "react-icons/fi";

const PersonalInfoView = () => {
  const navigate = useNavigate();
  const { avatar } = useAvatar();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Lấy user đang đăng nhập từ localStorage
    const userStr = sessionStorage.getItem("user");
    if (!userStr) {
      navigate("/"); // chưa đăng nhập → về trang login
      return;
    }

    const user = JSON.parse(userStr);
    const maNguoiDung = user.MaNguoiDung;

    fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/giangvien/${maNguoiDung}`)
      .then(res => res.json())
      .then(info => setData(info))
      .catch(err => console.log(err));
  }, []);

  if (!data) return <p>Đang tải...</p>;

  const displayAvatar = avatar || (data.AnhDaiDien ? (data.AnhDaiDien.startsWith("http") ? data.AnhDaiDien : `${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}${data.AnhDaiDien}`) : null);

  return (
    <div className="piv-wrapper">
      <div className="piv-header-row">
        <h1>Thông tin cá nhân</h1>
        <button className="piv-edit-btn" onClick={() => navigate("/edit-personal-info")}>
          Sửa thông tin
        </button>
      </div>

      <div className="piv-grid">
        {/* LEFT CARD */}
        <div className="piv-sidebar-card">
          <div className="piv-avatar-wrapper">
            {displayAvatar ? (
              <img src={displayAvatar} alt="avatar" />
            ) : (
              <div className="piv-avatar-initial">{data.HoTen?.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <h2 className="piv-name">{data.HoTen}</h2>
          <span className="piv-badge">{data.HocVi || "Giảng viên FLIC"}</span>

          <div className="piv-contact-section">
            <div className="piv-contact-item">
              <span className="piv-contact-label">
                <FiMail style={{ marginRight: 6, verticalAlign: 'middle' }} /> Email
              </span>
              <p className="piv-contact-value">{data.Email || "Chưa cập nhật"}</p>
            </div>
            <div className="piv-contact-item">
              <span className="piv-contact-label">
                <FiPhone style={{ marginRight: 6, verticalAlign: 'middle' }} /> Số điện thoại
              </span>
              <p className="piv-contact-value">{data.SoDienThoai || "Chưa cập nhật"}</p>
            </div>
          </div>
        </div>

        {/* RIGHT CARDS */}
        <div className="piv-main-content">
          <div className="piv-info-card">
            <h3>
              <FiAward style={{ marginRight: 8, color: '#F95800', verticalAlign: 'middle' }} /> Chuyên môn
            </h3>
            <p>{data.ChuyenMon || "Chưa cập nhật thông tin chuyên môn."}</p>
          </div>

          <div className="piv-info-card">
            <h3>
              <FiBriefcase style={{ marginRight: 8, color: '#F95800', verticalAlign: 'middle' }} /> Kinh nghiệm giảng dạy
            </h3>
            <p>{data.KinhNghiem || "Chưa cập nhật kinh nghiệm giảng dạy."}</p>
          </div>

          <div className="piv-info-card">
            <h3>
              <FiUser style={{ marginRight: 8, color: '#F95800', verticalAlign: 'middle' }} /> Giới thiệu
            </h3>
            <p>{data.GioiThieu || "Chưa cập nhật thông tin giới thiệu."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoView;

