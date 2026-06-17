import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronDown, FiBookOpen, FiEdit3 } from "react-icons/fi";
import "./navbar.css";

function Navbar() {
  const [showTrialDropdown, setShowTrialDropdown] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isTrialActive = location.pathname === "/hoc-thu" || location.pathname === "/test-thu";

  return (
    <header className="navbar">
      <div className="nav-wrapper">

        {/* Logo */}
        <Link to="/" className="logo">
          <img src={`${import.meta.env.BASE_URL}flic_logo_full.png`} alt="FLIC" className="logo-img" />
        </Link>

        {/* Menu */}
        <ul className="navv-menu">
          <li>
            <Link to="/" className={isActive("/") ? "active" : ""}>Trang chủ</Link>
          </li>
          <li>
            <Link to="/about" className={isActive("/about") ? "active" : ""}>Về Chúng Tôi</Link>
          </li>
          <li>
            <Link to="/courses" className={isActive("/courses") || location.pathname.startsWith("/courses-category/") ? "active" : ""}>Các Khóa Học</Link>
          </li>

          {/* Học thử Dropdown */}
          <li
            className="nav-dropdown-wrap"
            onMouseEnter={() => setShowTrialDropdown(true)}
            onMouseLeave={() => setShowTrialDropdown(false)}
          >
            <span className={`nav-dropdown-trigger ${isTrialActive ? "active" : ""}`}>
              Học & thi thử <FiChevronDown className={`nav-chevron ${showTrialDropdown ? "open" : ""}`} />
            </span>
            {showTrialDropdown && (
              <div className="nav-dropdown">
                <div className="nav-dropdown-inner">
                  <Link to="/hoc-thu" onClick={() => setShowTrialDropdown(false)} className={isActive("/hoc-thu") ? "active" : ""}>
                    <FiBookOpen size={16} /> Học thử
                  </Link>
                  <Link to="/test-thu" onClick={() => setShowTrialDropdown(false)} className={isActive("/test-thu") ? "active" : ""}>
                    <FiEdit3 size={16} /> Làm bài test
                  </Link>
                </div>
              </div>
            )}
          </li>

          <li><Link to="?auth=register" className={location.search === "?auth=register" ? "active" : ""}>Đăng ký</Link></li>
          <li><Link to="?auth=login" className={location.search === "?auth=login" ? "active" : ""}>Đăng nhập</Link></li>
        </ul>

      </div>
    </header>
  );
}

export default Navbar;