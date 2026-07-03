import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiBookOpen, FiEdit3 } from "react-icons/fi";
import "./Nav.css";

function Nav() {
  const [showTrialDropdown, setShowTrialDropdown] = useState(false); // Trạng thái kiểm soát dropdown trên di động
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Trạng thái bật/tắt menu di động
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

  const authMode = new URLSearchParams(location.search).get("auth");

  const isActive = (path: string) => location.pathname === path;
  
  const isHome = location.pathname === "/" && !authMode;
  const isAbout = location.pathname === "/about";
  const isCourses =
    location.pathname === "/courses" ||
    location.pathname.startsWith("/courses-category") ||
    location.pathname.startsWith("/coursehome");
  const isTrialActive = location.pathname === "/hoc-thu" || location.pathname === "/test-thu";

  // Hàm chuyển đổi menu di động
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="nav-wrapper">
        <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
          <img src={`${import.meta.env.BASE_URL}flic_logo_full.png`} alt="FLIC" className="logo-img" />
        </Link>

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

        {/* Thêm class active khi menu được bật */}
        <ul className={`navv-menu ${isMobileMenuOpen ? "responsive-active" : ""}`}>
          <li>
            <Link to="/" className={isHome ? "active" : ""} onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link>
          </li>
          <li>
            <Link to="/about" className={isAbout ? "active" : ""} onClick={() => setIsMobileMenuOpen(false)}>Về Chúng Tôi</Link>
          </li>
          <li>
            <Link to="/courses" className={isCourses ? "active" : ""} onClick={() => setIsMobileMenuOpen(false)}>Các Khóa Học</Link>
          </li>

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

          <li><Link to="?auth=register" className={authMode === "register" ? "active" : ""} onClick={() => setIsMobileMenuOpen(false)}>Đăng ký</Link></li>
          <li><Link to="?auth=login" className={authMode === "login" ? "active" : ""} onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập</Link></li>
        </ul>
      </div>
    </header>
  );
}

export default Nav;
