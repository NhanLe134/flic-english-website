import "./PersonalInfoView.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAvatar } from "../context/AvatarContext";

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

    fetch(`http://localhost:5000/giangvien/${maNguoiDung}`)
      .then(res => res.json())
      .then(info => setData(info))
      .catch(err => console.log(err));
  }, []);

  if (!data) return <p>Đang tải...</p>;

  return (
    <div className="piv-wrapper">
      <div className="piv-header-row">
        <h1>Thông tin cá nhân</h1>
        <button className="edit-btn" onClick={() => navigate("/edit-personal-info")}>
          Sửa thông tin
        </button>
      </div>

      <div className="piv-grid">
        {/* LEFT CARD */}
        <div className="piv-sidebar-card">
          <div className="piv-avatar-wrapper">
            {avatar || data.AnhDaiDien ? (
              <img src={avatar || data.AnhDaiDien} alt="avatar" />
            ) : (
              <div className="piv-avatar-initial">{data.HoTen?.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <h2 className="piv-name">{data.HoTen}</h2>
          <span className="piv-badge">{data.HocVi || "Giảng viên FLIC"}</span>

          <div className="piv-contact-section">
            <div className="piv-contact-item">
              <span className="piv-contact-label">Email</span>
              <p className="piv-contact-value">{data.Email || "Chưa cập nhật"}</p>
            </div>
            <div className="piv-contact-item">
              <span className="piv-contact-label">Số điện thoại</span>
              <p className="piv-contact-value">{data.SoDienThoai || "Chưa cập nhật"}</p>
            </div>
          </div>
        </div>

        {/* RIGHT CARDS */}
        <div className="piv-main-content">
          <div className="piv-info-card">
            <h3>Chuyên môn</h3>
            <p>{data.ChuyenMon || "Chưa cập nhật thông tin chuyên môn."}</p>
          </div>

          <div className="piv-info-card">
            <h3>Kinh nghiệm giảng dạy</h3>
            <p>{data.KinhNghiem || "Chưa cập nhật kinh nghiệm giảng dạy."}</p>
          </div>

          {/* 'Giới thiệu bản thân' đã được xoá theo yêu cầu */}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoView;
