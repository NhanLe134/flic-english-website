import "./CreatepersonalInfo.css";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

const PersonalInfo: React.FC = () => {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    specialty: "",
    experience: "",
    bio: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Lưu thông tin
  const handleSave = () => {

  const data = {
    ...formData,
    avatar: avatar
  };

  localStorage.setItem(
    "personalInfo",
    JSON.stringify(data)
  );

  setShowPopup(true);

  setTimeout(() => {
    navigate("/personal-info-view");
  }, 1500);
};

  // Bấm cập nhật avatar
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Chọn ảnh
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  return (
    <div className="page-container">
      {/* TOPBAR */}
      <div className="topbar">
        <img src={`${import.meta.env.BASE_URL}image.png`} className="logo" />
        <div className="avatar">👩‍🏫</div>
      </div>

      <div className="main-layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="avatar-circle small">👩‍🏫</div>

            <div className="teacher-info">
              <h4>Mr. Linh</h4>
              <span>Senior Teacher</span>
            </div>
          </div>

          <div className="sidebar-menu">
            <div
              className="sidebar-item"
              onClick={() => navigate("/quan-ly-khoa-hoc")}
            >
              Quản lý khóa học
            </div>

            <div onClick={() => navigate("/thong-tin-ca-nhan")} className="sidebar-item active">
              Thông tin cá nhân
            </div>

            <div
              className="sidebar-item"
              onClick={() => navigate("/danh-sach-hoc-vien")}
            >
              Danh sách học viên
            </div>

            <div onClick={() => navigate("/quan-ly-ket-qua")} className="sidebar-item">
              Quản lý kết quả học tập
            </div>
            <div onClick={() => navigate("/")} className="sidebar-item">Đăng xuất</div>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="content">
          <div className="header-row">
            <h1>Thông tin cá nhân</h1>

            {!showForm && (
              <button
  type="button"
  className="create-btn"
  onClick={() => setShowForm(true)}
>
  Tạo thông tin cá nhân
</button>
            )}
          </div>

          {/* FORM */}
          {showForm && (
            <div className="profile-card">

              {/* AVATAR */}
              <div className="profile-left">

                <img
                  src={
                    avatar
                      ? avatar
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  className="big-avatar"
                />

                <button
                  className="avatar-update"
                  onClick={handleAvatarClick}
                >
                  Cập nhật avatar
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* FORM RIGHT */}
              <div className="profile-right">

                <div className="cpi-info-item">
                  <label>Họ và tên</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="cpi-info-item">
                  <label>Chức danh</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="info-row">
                  <div>
                    <label>Email</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label>Số điện thoại</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="cpi-info-item">
                  <label>Chuyên môn</label>
                  <input
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                  />
                </div>

                <div className="cpi-info-item">
                  <label>Kinh nghiệm giảng dạy</label>
                  <input
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>

                <div className="cpi-info-item">
                  <label>Giới thiệu</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>

                <button
                  className="save-btn"
                  onClick={handleSave}
                >
                  Lưu
                </button>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="success-icon">✓</div>
            <p>Tạo thông tin cá nhân thành công</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;
