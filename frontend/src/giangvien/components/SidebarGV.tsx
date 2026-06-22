import { useNavigate, useLocation } from "react-router-dom";
import { useAvatar } from "../../context/AvatarContext";
import { useState, useEffect } from "react";
import { FiBookOpen, FiUser, FiUsers, FiAward, FiLogOut } from "react-icons/fi";
import "./SidebarGV.css";

const menuItems = [
  { label: "Quản lý khóa học",       path: "/quan-ly-khoa-hoc",   icon: <FiBookOpen className="menu-icon" /> },
  { label: "Danh sách học viên",      path: "/danh-sach-hoc-vien",  icon: <FiUsers className="menu-icon" /> },
  { label: "Quản lý kết quả học tập", path: "/quan-ly-ket-qua",   icon: <FiAward className="menu-icon" /> },
  { label: "Thông tin cá nhân",       path: "/thong-tin-ca-nhan",   icon: <FiUser className="menu-icon" /> },
  { label: "Đăng xuất",               path: "/",                  icon: <FiLogOut className="menu-icon" /> },
];

const getActiveMenu = (pathname: string) => {
  if (
    pathname.startsWith("/quan-ly-khoa-hoc") ||
    pathname.startsWith("/khoa-hoc") ||
    pathname.startsWith("/lessonlist") ||
    pathname.startsWith("/class") ||
    pathname.startsWith("/bai-tap") ||
    pathname.startsWith("/create-exercise") ||
    pathname.startsWith("/baitap-detail") ||
    pathname.startsWith("/quan-ly-bai-giang") ||
    pathname.startsWith("/lesson/") ||
    pathname.startsWith("/lesson-discussion") ||
    pathname.startsWith("/them-bai-hoc") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/them-tai-lieu") ||
    pathname.startsWith("/quan-ly-tai-lieu")
  ) return "/quan-ly-khoa-hoc";

  if (
    pathname.startsWith("/thong-tin-ca-nhan") ||
    pathname.startsWith("/edit-personal-info") ||
    pathname.startsWith("/personal-info-view")
  ) return "/thong-tin-ca-nhan";

  if (
    pathname.startsWith("/danh-sach-hoc-vien") ||
    pathname.startsWith("/them-hoc-vien") ||
    pathname.startsWith("/xem-hoc-vien") ||
    pathname.startsWith("/sua-hoc-vien")
  ) return "/danh-sach-hoc-vien";

  if (
    pathname.startsWith("/quan-ly-ket-qua") ||
    pathname.startsWith("/lesson-result") ||
    pathname.startsWith("/ketqua") ||
    pathname.startsWith("/xem-ket-qua") ||
    pathname.startsWith("/sua-ket-qua")
  ) return "/quan-ly-ket-qua";

  if (
    pathname.startsWith("/quan-ly-ban-nhap")
  ) return "/quan-ly-ban-nhap";

  return pathname;
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { avatar, handleUpload } = useAvatar();

  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ← thêm

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    fetch(`http://localhost:5000/giangvien/${user.MaNguoiDung}`)
      .then(res => res.json())
      .then(data => setTeacherInfo(data))
      .catch(err => console.log(err));
  }, []);

  const activeMenu = getActiveMenu(location.pathname);

  const initials = teacherInfo?.HoTen
    ? teacherInfo.HoTen.split(" ").pop()?.charAt(0).toUpperCase()
    : "?";

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <aside className="teacher-sidebar">
      <div className="sidebar-logo">
        <img src={import.meta.env.BASE_URL + "flic_logo_full.png"} alt="logo" />
      </div>

      <div className="teacher-profile">
        <label className="avatar-wrapper sidebar-avatar-wrapper" title="Đổi ảnh">
          <input type="file" accept="image/*" onChange={handleUpload} hidden />
          {avatar
            ? <img src={avatar} alt="avatar" className="avatar-img" />
            : <div className="avatar-placeholder">{initials}</div>
          }
          <div className="avatar-overlay">📷</div>
        </label>

        <div className="teacher-info">
          <h4 className="teacher-name">{teacherInfo?.HoTen || "Đang tải..."}</h4>
          <span className="teacher-role">{teacherInfo?.HocVi || "Giảng viên"}</span>
        </div>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.path}
            onClick={() => {
              if (item.path === "/") {
                setShowLogoutModal(true); // ← mở modal thay vì logout thẳng
              } else {
                navigate(item.path);
              }
            }}
            className={activeMenu === item.path ? "active" : ""}
          >
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      {/* MODAL XÁC NHẬN ĐĂNG XUẤT */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999
          }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            style={{
              background: "#fff", borderRadius: 16, padding: "36px 32px",
              minWidth: 320, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <h3 style={{ marginBottom: 8, fontSize: 20, fontWeight: 700, color: "#222" }}>
              Đăng xuất
            </h3>
            <p style={{ color: "#777", marginBottom: 24, fontSize: 14 }}>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  padding: "10px 24px", borderRadius: 8,
                  border: "1px solid #ddd", background: "#fff",
                  color: "#555", cursor: "pointer", fontWeight: 500
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 24px", borderRadius: 8,
                  border: "none", background: "#F95800",
                  color: "#fff", cursor: "pointer", fontWeight: 600
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
};

export default Sidebar;
