import "./EditPersonalInfo.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAvatar } from "../../context/AvatarContext";
import { FiCamera } from "react-icons/fi";

const EditPersonalInfo = () => {
  const navigate = useNavigate();
  const { teacherId } = useParams<{ teacherId?: string }>();
  const { setAvatar } = useAvatar();
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

    fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/giangvien/${maNguoiDung}`)
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
          avatar: data.AnhDaiDien || "",
        });
      })
      .catch(err => console.log(err));
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const uploadRes = await fetch((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "/upload", {
          method: "POST",
          body: formDataUpload
        });
        if (!uploadRes.ok) throw new Error("Upload thất bại");

        const uploadData = await uploadRes.json();
        const relativeUrl = uploadData.url; // e.g. /uploads/filename.png
        setFormData(prev => ({ ...prev, avatar: relativeUrl }));
      } catch (err) {
        console.error("Lỗi upload ảnh:", err);
        alert("Lỗi khi tải ảnh đại diện lên máy chủ");
      }
    }
  };

  /* ===== CẬP NHẬT ===== */
  const handleUpdate = async () => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const maNguoiDung = user.MaNguoiDung;

    try {
      await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/giangvien/${maNguoiDung}`, {
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
          AnhDaiDien: formData.avatar,
        })
      });

      // Cập nhật lại localStorage để Header và Sidebar hiển thị đúng ngay
      user.HoTen = formData.HoTen;
      user.Email = formData.Email;
      user.AnhDaiDien = formData.avatar;
      sessionStorage.setItem("user", JSON.stringify(user));
      
      const absoluteUrl = formData.avatar ? (formData.avatar.startsWith("http") ? formData.avatar : `${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}${formData.avatar}`) : null;
      setAvatar(absoluteUrl);

      setShowPopup(true);
      setTimeout(() => navigate(`/${teacherId}/thong-tin-ca-nhan`), 1500);

    } catch (err) {
      console.log(err);
      alert("Lỗi khi cập nhật");
    }
  };

  const initials = formData.HoTen
    ? formData.HoTen.split(" ").pop()?.charAt(0).toUpperCase()
    : "?";

  const displayAvatar = formData.avatar ? (formData.avatar.startsWith("http") ? formData.avatar : `${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}${formData.avatar}`) : "";

  return (
    <div className="epi-wrapper">

      <div className="epi-header-row">
        <h1>Thông tin cá nhân</h1>
        <span className="back-btn" onClick={() => navigate(`/${teacherId}/thong-tin-ca-nhan`)}>
          ← Quay lại
        </span>
      </div>

      <div className="profile-card">

        {/* AVATAR */}
        <div className="profile-left">
          <div className="profile-avatar">
            {displayAvatar
              ? <img src={displayAvatar} alt="avatar" />
              : initials
            }
          </div>
          <label className="upload-avatar-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            <FiCamera size={14} /> Đổi ảnh
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

