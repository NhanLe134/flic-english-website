import "./navbar.css";
import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [showSkills, setShowSkills] = useState(false);

  return (
    <header className="navbar">
      <div className="container nav-wrapper">

        {/* Logo */}
        <Link to="/" className="logo">
          <img src="/image.png" alt="FLIC" className="logo-img" />
        </Link>

        {/* Menu */}
        <ul className="navv-menu">
          <li><Link to="/about">Về Chúng Tôi</Link></li>
          <li><Link to="/courses-home">Các Khóa Học</Link></li>

          <li className="nav-dropdown-wrap">
            <span
              className="nav-dropdown-trigger"
              onClick={() => setShowSkills(!showSkills)}
            >
              Kỹ Năng <span className={`nav-chevron ${showSkills ? "open" : ""}`}>▾</span>
            </span>
            {showSkills && (
              <div className="nav-dropdown">
                <Link to="/skills/listening" onClick={() => setShowSkills(false)}>🎧 Listening</Link>
                <Link to="/skills/speaking"  onClick={() => setShowSkills(false)}>🎤 Speaking</Link>
                <Link to="/skills/writing"   onClick={() => setShowSkills(false)}>✍️ Writing</Link>
                <Link to="/skills/reading"   onClick={() => setShowSkills(false)}>📖 Reading</Link>
              </div>
            )}
          </li>

          <li><Link to="/grammar">Ngữ Pháp</Link></li>
          <li><Link to="/vocabulary">Từ Vựng</Link></li>
          <li><Link to="/register">Đăng ký</Link></li>
          <li><Link to="/login">Đăng nhập</Link></li>
        </ul>

      </div>
    </header>
  );
}

export default Navbar;