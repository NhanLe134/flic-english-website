import "./navbar.css";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const authMode = new URLSearchParams(location.search).get("auth");
  const isHome = location.pathname === "/" && !authMode;
  const isAbout = location.pathname === "/about";
  const isCourses =
    location.pathname === "/courses" ||
    location.pathname.startsWith("/courses-category") ||
    location.pathname.startsWith("/coursehome");
  const isHocThu = location.pathname === "/hoc-thu";

  return (
    <header className="navbar">
      <div className="nav-wrapper">
        <Link to="/" className="logo">
          <img src={`${import.meta.env.BASE_URL}flic_logo_full.png`} alt="FLIC" className="logo-img" />
        </Link>

        <ul className="navv-menu">
          <li><Link to="/" className={isHome ? "active" : ""}>Trang chủ</Link></li>
          <li><Link to="/about" className={isAbout ? "active" : ""}>Về Chúng Tôi</Link></li>
          <li><Link to="/courses" className={isCourses ? "active" : ""}>Các Khóa Học</Link></li>
          <li><Link to="/hoc-thu" className={isHocThu ? "active" : ""}>Học & thi thử</Link></li>
          <li><Link to="?auth=register" className={authMode === "register" ? "active" : ""}>Đăng ký</Link></li>
          <li><Link to="?auth=login" className={authMode === "login" ? "active" : ""}>Đăng nhập</Link></li>
        </ul>
      </div>
    </header>
  );
}

export default Navbar;
