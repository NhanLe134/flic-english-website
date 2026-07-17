import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiBookOpen, FiEdit3, FiLogOut } from "react-icons/fi";
import "./NavDaDangNhap.css";

const logo = import.meta.env.BASE_URL + "flic_logo_full.png";
const userImg = import.meta.env.BASE_URL + "user.png";

function NavDaDangNhap() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTrialDropdown, setShowTrialDropdown] = useState(false); // Trạng thái kiểm soát dropdown trên di động
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Trạng thái bật/tắt menu di động
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleDocumentClick = () => {
      setShowTrialDropdown(false);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isTrialActive = location.pathname === "/hoc-thu" || location.pathname === "/test-thu";

  let currentUser: any = {};
  try {
    currentUser = JSON.parse(sessionStorage.getItem("user") || "{}") || {};
  } catch (e) {
    console.error("Lỗi parse thông tin user từ sessionStorage", e);
  }
  const hoTen = currentUser?.HoTen || "Học Viên";
  const tenNgan = hoTen.split(" ").pop() || hoTen;

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/login");
  };

  // Hàm chuyển đổi menu di động
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar-login">
      <div className="nav-logo" onClick={() => setIsMobileMenuOpen(false)}>
        <Link to="/"><img src={logo} alt="FLIC logo" /></Link>
      </div>

      {/* Nút Hamburger kích hoạt trên thiết bị di động */}
      <button 
        className={`nav-toggle-btn ${isMobileMenuOpen ? "active" : ""}`} 
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Thêm class active khi menu di động được bật */}
      <ul className={`nav-menu ${isMobileMenuOpen ? "responsive-active" : ""}`}>
        <li><Link to="/" className={isActive("/") ? "active" : ""} onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link></li>
        <li><Link to="/about" className={isActive("/about") ? "active" : ""} onClick={() => setIsMobileMenuOpen(false)}>Về Chúng Tôi</Link></li>
        <li><Link to="/courses" className={isActive("/courses") || location.pathname.startsWith("/courses-category/") ? "active" : ""} onClick={() => setIsMobileMenuOpen(false)}>Các Khóa Học</Link></li>

        <li className="nav-dropdown-wrap">
          <span 
            className={`nav-dropdown-trigger ${isTrialActive ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTrialDropdown(!showTrialDropdown);
            }}
          >
            Học & thi thử <span className="nav-chevron-space" style={{ width: "12px", display: "inline-block" }}></span>
          </span>
          <div className={`nav-dropdown ${showTrialDropdown ? "mobile-show" : ""}`}>
            <div className="nav-dropdown-inner">
              <Link to="/hoc-thu" onClick={() => { setIsMobileMenuOpen(false); setShowTrialDropdown(false); }} className={isActive("/hoc-thu") ? "active" : ""}>
                <FiBookOpen size={16} className="anicon" /> Học thử
              </Link>
              <Link to="/test-thu" onClick={() => { setIsMobileMenuOpen(false); setShowTrialDropdown(false); }} className={isActive("/test-thu") ? "active" : ""}>
                <FiEdit3 size={16} className="anicon" /> Làm bài test
              </Link>
            </div>
          </div>
        </li>
      </ul>

      {/* Khu vực tài khoản người dùng với menu thả xuống */}
      <div className="user-box" onClick={() => setShowUserMenu(!showUserMenu)}
        style={{ position: "relative", cursor: "pointer" }}>
        <img src={userImg} alt="user avatar" />
        <span>{tenNgan}</span>

        {showUserMenu && (
          <div style={{
            position: "absolute", top: "110%", right: 0, background: "#fff",
            borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            minWidth: 160, zIndex: 999, overflow: "hidden"
          }}>
            <Link to="/profile-info"
              style={{ display: "block", padding: "10px 16px", fontSize: 14, color: "#333", textDecoration: "none" }}
              onClick={() => { setShowUserMenu(false); setIsMobileMenuOpen(false); }}
            >
              👤 Thông tin cá nhân
            </Link>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(false);
                setIsMobileMenuOpen(false);
                setShowLogoutModal(true); // Mở hộp thoại xác nhận đăng xuất
              }}
              style={{
                padding: "10px 16px", fontSize: 14, color: "#c62828",
                cursor: "pointer", borderTop: "1px solid #f0e4d4"
              }}
            >
              🚪 Đăng xuất
            </div>
          </div>
        )}
      </div>

      {/* HỘP THOẠI XÁC NHẬN ĐĂNG XUẤT */}
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
    </nav>
  );
}

export default NavDaDangNhap;
