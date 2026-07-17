import { useNavigate, useLocation } from "react-router-dom";
import { useAvatar } from "../../context/AvatarContext";
import { useState, useEffect } from "react";
import { FiBookOpen, FiUser, FiUsers, FiAward, FiLogOut, FiFileText } from "react-icons/fi";
import "./SidebarGV.css";
import { hasPermission } from "../../utils/permission";

const menuItems = [
  { label: "Quản lý giảng dạy",       path: "/quan-ly-khoa-hoc",   icon: <FiBookOpen className="menu-icon" /> },
  { label: "Quản lý đề thi thử",          path: "/quan-ly-de-thi",     icon: <FiFileText className="menu-icon" /> },
  { label: "Danh sách học viên",      path: "/danh-sach-hoc-vien",  icon: <FiUsers className="menu-icon" /> },
  { label: "Quản lý kết quả học tập", path: "/quan-ly-ket-qua",   icon: <FiAward className="menu-icon" /> },
  { label: "Thông tin cá nhân",       path: "/thong-tin-ca-nhan",   icon: <FiUser className="menu-icon" /> },
  { label: "Đăng xuất",               path: "/",                  icon: <FiLogOut className="menu-icon" /> },
];

const getActiveMenu = (pathname: string) => {
  if (
    pathname.includes("/quan-ly-de-thi")
  ) return "/quan-ly-de-thi";

  if (
    pathname.includes("/quan-ly-khoa-hoc") ||
    pathname.includes("/lophoc") ||
    pathname.includes("/khoa-hoc") ||
    pathname.includes("/lessonlist") ||
    pathname.includes("/class") ||
    pathname.includes("/bai-tap") ||
    pathname.includes("/create-exercise") ||
    pathname.includes("/baitap-detail") ||
    pathname.includes("/quan-ly-bai-giang") ||
    pathname.includes("/lesson/") ||
    pathname.includes("/them-bai-hoc") ||
    pathname.includes("/them-bai-giang") ||
    pathname.includes("/bai-giang") ||
    pathname.includes("/danh-sach-bai-nop") ||
    pathname.includes("/cham-bai") ||
    pathname.includes("/documents") ||
    pathname.includes("/them-tai-lieu") ||
    pathname.includes("/quan-ly-tai-lieu") ||
    pathname.includes("/quan-ly-ban-nhap")
  ) return "/quan-ly-khoa-hoc";

  if (
    pathname.includes("/thong-tin-ca-nhan") ||
    pathname.includes("/edit-personal-info") ||
    pathname.includes("/personal-info-view")
  ) return "/thong-tin-ca-nhan";

  if (
    pathname.includes("/danh-sach-hoc-vien") ||
    pathname.includes("/them-hoc-vien") ||
    pathname.includes("/xem-hoc-vien") ||
    pathname.includes("/sua-hoc-vien")
  ) return "/danh-sach-hoc-vien";

  if (
    pathname.includes("/quan-ly-ket-qua") ||
    pathname.includes("/lesson-result") ||
    pathname.includes("/ketqua") ||
    pathname.includes("/xem-ket-qua") ||
    pathname.includes("/sua-ket-qua")
  ) return "/quan-ly-ket-qua";

  if (
    pathname.includes("/quan-ly-ban-nhap")
  ) return "/quan-ly-ban-nhap";

  return pathname;
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { avatar } = useAvatar();

  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ← thêm
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [avatar]);

  const allowedMenuItems = menuItems.filter(item => {
    if (item.path === "/quan-ly-khoa-hoc") {
      return hasPermission("LECTURE_CREATE") || hasPermission("BAITAP_CREATE") || hasPermission("QUIZ_CREATE") || hasPermission("EXTRA_PRACTICE_CREATE") || hasPermission("DOCUMENT_CREATE_PENDING");
    }
    if (item.path === "/quan-ly-de-thi") {
      return hasPermission("QUIZ_CREATE");
    }
    if (item.path === "/danh-sach-hoc-vien") {
      return hasPermission("SUBMISSION_VIEW") || hasPermission("STUDENT_GRADE");
    }
    if (item.path === "/quan-ly-ket-qua") {
      return hasPermission("GRADEBOOK_VIEW_CLASS") || hasPermission("GRADEBOOK_VIEW_ALL");
    }
    return true;
  });

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/giangvien/${user.MaNguoiDung}`)
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

      <div
        className="teacher-profile"
        onClick={() => {
          const userStr = sessionStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : {};
          navigate(`/teacher${user.MaNguoiDung || ""}/thong-tin-ca-nhan`);
        }}
        style={{ cursor: "pointer" }}
        title="Xem thông tin cá nhân"
      >
        <div className="avatar-wrapper sidebar-avatar-wrapper" style={{ cursor: "pointer" }}>
          {avatar && !imgFailed
            ? <img src={avatar} alt="avatar" className="avatar-img" onError={() => setImgFailed(true)} />
            : <div className="avatar-placeholder">{initials}</div>
          }
        </div>

        <div className="teacher-info">
          <h4 className="teacher-name">{teacherInfo?.HoTen || "Đang tải..."}</h4>
          <span className="teacher-role">{teacherInfo?.HocVi || "Giảng viên"}</span>
        </div>
      </div>

      <ul className="sidebar-menu">
        {allowedMenuItems.map((item) => (
          <li
            key={item.path}
            onClick={() => {
              if (item.path === "/") {
                setShowLogoutModal(true);
              } else {
                const userStr = sessionStorage.getItem("user");
                const user = userStr ? JSON.parse(userStr) : {};
                const teacherIdStr = `teacher${user.MaNguoiDung || ""}`;
                if (item.path === "/quan-ly-khoa-hoc") {
                  navigate(`/${teacherIdStr}/lophoc`);
                } else {
                  navigate(`/${teacherIdStr}${item.path}`);
                }
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
          className="logout-modal-backdrop"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="logout-modal-card"
            onClick={e => e.stopPropagation()}
          >
            <div className="logout-modal-icon-container">
              <FiLogOut className="logout-modal-large-icon" size={44} color="#F95800" />
            </div>
            <h3 className="logout-modal-title">Đăng xuất</h3>
            <p className="logout-modal-text">
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
            </p>
            <div className="logout-modal-actions">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="logout-modal-cancel-btn"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="logout-modal-confirm-btn"
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
