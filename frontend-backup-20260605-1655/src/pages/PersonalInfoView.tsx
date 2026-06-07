import "./personalInfoView.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const PersonalInfoView = () => {
  const navigate = useNavigate();
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

      <div className="header-row">
        <h1>Thông tin cá nhân</h1>
        <button className="edit-btn" onClick={() => navigate("/edit-personal-info")}>
          Sửa
        </button>
      </div>

      <div className="profile-view-card">

        <div className="profile-avatar">
          {data.Avatar
            ? <img src={data.Avatar} alt="avatar" />
            : data.HoTen?.charAt(0).toUpperCase()
          }
        </div>

        <div className="profile-info">

          <div className="info-block">
            <span className="label">Họ và tên</span>
            <p>{data.HoTen}</p>
          </div>

          <div className="info-block">
            <span className="label">Chức danh</span>
            <p className="highlight">{data.HocVi}</p>
          </div>

          <div className="info-row-two">
            <div>
              <span className="label">Email</span>
              <p>{data.Email}</p>
            </div>
            <div>
              <span className="label">Số điện thoại</span>
              <p>{data.SoDienThoai}</p>
            </div>
          </div>

          <div className="info-block">
            <span className="label">Chuyên môn</span>
            <p>{data.ChuyenMon}</p>
          </div>

          <div className="info-block">
            <span className="label">Kinh nghiệm giảng dạy</span>
            <p>{data.KinhNghiem}</p>
          </div>

          <div className="info-block">
            <span className="label">Giới thiệu</span>
            <p>{data.GioiThieu}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PersonalInfoView;