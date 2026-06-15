import "./EditPersonalInfo.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EditPersonalInfo = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    HoTen: "",
    HocVi: "",
    Email: "",
    SoDienThoai: "",
    ChuyenMon: "",
    KinhNghiem: "",
    GioiThieu: "",
    avatar: "",
  });

  /* ===== LOAD THÔNG TIN ===== */
  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) { navigate("/"); return; }

    const user = JSON.parse(userStr);
    const maNguoiDung = user.MaNguoiDung;

    fetch(`http://localhost:5000/giangvien/${maNguoiDung}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          HoTen: data.HoTen || "",
          HocVi: data.HocVi || "",
          Email: data.Email || "",
          SoDienThoai: data.SoDienThoai || "",
          ChuyenMon: data.ChuyenMon || "",
          KinhNghiem: data.KinhNghiem || "",
          GioiThieu: data.GioiThieu || "",
          avatar: "",
        });
      })
      .catch(err => console.log(err));
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  /* ===== CẬP NHẬT ===== */
  const handleUpdate = async () => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const maNguoiDung = user.MaNguoiDung;

    try {
      await fetch(`http://localhost:5000/giangvien/${maNguoiDung}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          HoTen: formData.HoTen,
          HocVi: formData.HocVi,
          Email: formData.Email,
          SoDienThoai: formData.SoDienThoai,
          ChuyenMon: formData.ChuyenMon,
          KinhNghiem: formData.KinhNghiem,
          GioiThieu: formData.GioiThieu,
        })
      });

      // Cập nhật lại localStorage để Header và Sidebar hiển thị đúng ngay
      user.HoTen = formData.HoTen;
      user.Email = formData.Email;
      sessionStorage.setItem("user", JSON.stringify(user));

      setShowPopup(true);
      setTimeout(() => navigate("/thong-tin-ca-nhan"), 1500);

    } catch (err) {
      console.log(err);
      alert("Lỗi khi cập nhật");
    }
  };

  const initials = formData.HoTen
    ? formData.HoTen.split(" ").pop()?.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="epi-wrapper">

      <div className="epi-header-row">
        <h1>Thông tin cá nhân</h1>
        <span className="back-btn" onClick={() => navigate("/thong-tin-ca-nhan")}>
          ← Quay lại
        </span>
      </div>

      <div className="profile-card">

        {/* AVATAR */}
        <div className="profile-left">
          <div className="profile-avatar">
            {formData.avatar
              ? <img src={formData.avatar} alt="avatar" />
              : initials
            }
          </div>
          <label className="upload-avatar-btn">
            <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            📷 Đổi ảnh
          </label>
        </div>

        {/* FORM */}
        <div className="profile-right">

          <label>Họ và tên</label>
          <input name="HoTen" value={formData.HoTen} onChange={handleChange} />

          <label>Chức danh</label>
          <input name="HocVi" value={formData.HocVi} onChange={handleChange} />

          <div className="row">
            <div>
              <label>Email</label>
              <input name="Email" value={formData.Email} onChange={handleChange} />
            </div>
            <div>
              <label>Số điện thoại</label>
              <input name="SoDienThoai" value={formData.SoDienThoai} onChange={handleChange} />
            </div>
          </div>

          <label>Chuyên môn</label>
          <input name="ChuyenMon" value={formData.ChuyenMon} onChange={handleChange} />

          <label>Kinh nghiệm giảng dạy</label>
          <input name="KinhNghiem" value={formData.KinhNghiem} onChange={handleChange} />

          <label>Giới thiệu</label>
          <textarea name="GioiThieu" value={formData.GioiThieu} onChange={handleChange} />

        </div>
      </div>

      <div className="update-btn-box">
        <button className="update-btn" onClick={handleUpdate}>Cập Nhật</button>
      </div>

      {/* SUCCESS POPUP */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="success-icon">✓</div>
            <p>Cập nhật thành công</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default EditPersonalInfo;
