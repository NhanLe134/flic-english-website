import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./StudentNavbar.css";
import { FiChevronDown, FiBookOpen, FiEdit3, FiLogOut } from "react-icons/fi";

const logo = import.meta.env.BASE_URL + "flic_logo_full.png";
const userIcon = import.meta.env.BASE_URL + "user.png";

const API = "http://14.225.192.252:5000";

export default function StudentNavbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTrialDropdown, setShowTrialDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [hoTen, setHoTen] = useState("Sinh Viên");
  const [avatarUrl, setAvatarUrl] = useState(userIcon);

  const syncUserInfo = () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}") || {};
      setHoTen(user.HoTen || "Sinh Viên");
      const avatar = user.AnhDaiDien;
      setAvatarUrl(avatar ? (avatar.startsWith("http") ? avatar : `${API}${avatar}`) : userIcon);
    } catch (e) {
      console.error("Error syncing user info in navbar", e);
    }
  };

  useEffect(() => {
    syncUserInfo();
    window.addEventListener("avatarChanged", syncUserInfo);
    return () => {
      window.removeEventListener("avatarChanged", syncUserInfo);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const isMyCoursesActive = () => {
    const p = location.pathname;
    return (
      p === "/MyCourses" ||
      p.startsWith("/class-detail/") ||
      p.startsWith("/course-detail/") ||
      p.startsWith("/doc-detail/") ||
      p.startsWith("/lesson-detail/") ||
      p.startsWith("/bai-giangSV/") ||
      p === "/assignments" ||
      p.startsWith("/exercise/") ||
      p.startsWith("/baitap/") ||
      p === "/assignment-success" ||
      p.startsWith("/quiz-detail") ||
      p.startsWith("/essay-detail")
    );
  };

  return (
    <header className="navbar student-navbar">
      <div className="nav-wrapper">
        {/* Logo */}
        <div className="logo">
          <img src={logo} alt="FLIC logo" className="logo-img" />
        </div>

        {/* Navigation Menu */}
        <ul className="navv-menu">
          <li>
            <Link
              to="/course-register"
              className={isActive("/course-register") ? "active-link" : ""}
            >
              Khóa học FLIC
            </Link>
          </li>

          {/* Học thử Dropdown */}
          <li
            className="nav-dropdown-wrap"
            onMouseEnter={() => setShowTrialDropdown(true)}
            onMouseLeave={() => setShowTrialDropdown(false)}
          >
            <span className={`nav-dropdown-trigger ${isActive("/hoc-thu-sv") || isActive("/test-thu-sv") ? "active-link" : ""}`}>
              Học & thi thử <FiChevronDown className={`nav-chevron ${showTrialDropdown ? "open" : ""}`} />
            </span>
            {showTrialDropdown && (
              <div className="nav-dropdown">
                <div className="nav-dropdown-inner">
                  <Link to="/hoc-thu-sv" onClick={() => setShowTrialDropdown(false)}>
                    <FiBookOpen size={16} /> Học thử
                  </Link>
                  <Link to="/test-thu-sv" onClick={() => setShowTrialDropdown(false)}>
                    <FiEdit3 size={16} /> Làm bài test
                  </Link>
                </div>
              </div>
            )}
          </li>

          <li>
            <Link
              to="/MyCourses"
              className={isMyCoursesActive() ? "active-link" : ""}
            >
              Lớp học của tôi
            </Link>
          </li>

          <li>
            <Link
              to="/progress"
              className={isActive("/progress") ? "active-link" : ""}
            >
              Tiến độ học tập
            </Link>
          </li>

          <li>
            <Link
              to="/profile-info"
              className={isActive("/profile-info") ? "active-link" : ""}
            >
              Hồ sơ cá nhân
            </Link>
          </li>
        </ul>

        {/* User Info & Dropdown (Ảnh bên trái tên bên phải) */}
        <div
          className="user-box"
          onMouseEnter={() => setShowUserMenu(true)}
          onMouseLeave={() => setShowUserMenu(false)}
          style={{ position: "relative", cursor: "pointer" }}
        >
          <img src={avatarUrl} alt="user avatar" className="user-avatar" />
          <span className="user-name">{hoTen}</span>
          <FiChevronDown className={`user-chevron ${showUserMenu ? "open" : ""}`} size={14} />

          {showUserMenu && (
            <div className="student-user-dropdown">
              <div className="student-user-dropdown-inner">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(false);
                    setShowLogoutModal(true);
                  }}
                  className="dropdown-logout-item"
                >
                  <FiLogOut size={16} /> Đăng xuất
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </header>
  );
}
