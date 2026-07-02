import "./HeaderGiangVien.css";
import { useAvatar } from "../../context/AvatarContext";
import { useState, useEffect } from "react";

const HeaderGiangVien = () => {
  const { avatar, handleUpload } = useAvatar();
  const [teacherInfo, setTeacherInfo] = useState<any>(null);

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const maNguoiDung = user.MaNguoiDung;

    fetch(`http://localhost:5000/giangvien/${maNguoiDung}`)
      .then(res => res.json())
      .then(data => setTeacherInfo(data))
      .catch(err => console.log(err));
  }, []);

  const initials = teacherInfo?.HoTen
    ? teacherInfo.HoTen.split(" ").pop()?.charAt(0).toUpperCase()
    : "?";

  return (
    <header className="teacher-header">
      <img src={`${import.meta.env.BASE_URL}image.png`} alt="logo" className="teacher-logo" />

      <label className="avatar-wrapper header-avatar-wrapper" title="Đổi ảnh">
        <input type="file" accept="image/*" onChange={handleUpload} hidden />
        {avatar
          ? <img src={avatar} alt="avatar" className="avatar-img" />
          : <div className="avatar-placeholder">{initials}</div>
        }
        <div className="avatar-overlay">📷</div>
      </label>
    </header>
  );
};

export default HeaderGiangVien;
