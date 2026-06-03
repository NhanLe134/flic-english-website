import "./navbar.css";
import { Link } from "react-router-dom";

function Navbar() {

  return (
    <header className="navbar">
      <div className="nav-wrapper">

        {/* Logo */}
        <Link to="/" className="logo">
          <img src={`${import.meta.env.BASE_URL}flic_logo_full.png`} alt="FLIC" className="logo-img" />
        </Link>

        {/* Menu */}
        <ul className="navv-menu">
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/about">Về Chúng Tôi</Link></li>
          <li><Link to="/courses">Các Khóa Học</Link></li>
          <li><Link to="/hoc-thu">Học thử</Link></li>
          <li><Link to="/register">Đăng ký</Link></li>
          <li><Link to="/login">Đăng nhập</Link></li>
        </ul>

      </div>
    </header>
  );
}

export default Navbar;