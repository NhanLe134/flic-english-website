import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiChevronDown, FiBookOpen, FiEdit3 } from "react-icons/fi";
import "./NavbarLogin.css";
const logo = import.meta.env.BASE_URL + "flic_logo_full.png";
const user = import.meta.env.BASE_URL + "user.png";

function NavbarLogin() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTrialDropdown, setShowTrialDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isTrialActive = location.pathname === "/hoc-thu" || location.pathname === "/test-thu";

  let currentUser: any = {};
  try {
    currentUser = JSON.parse(sessionStorage.getItem("user") || "{}") || {};
  } catch (e) {
    console.error("Error parsing user from sessionStorage", e);
  }
  const hoTen = currentUser?.HoTen || "Học Viên";
  const tenNgan = hoTen.split(" ").pop() || hoTen;

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <nav className="navbar-login">

      <div className="nav-logo">
        <Link to="/"><img src={logo} alt="FLIC logo" /></Link>
      </div>

      <ul className="nav-menu">
        <li><Link to="/" className={isActive("/") ? "active" : ""}>Trang chủ</Link></li>
        <li><Link to="/about" className={isActive("/about") ? "active" : ""}>Về Chúng Tôi</Link></li>
        <li><Link to="/courses" className={isActive("/courses") || location.pathname.startsWith("/courses-category/") ? "active" : ""}>Các Khóa Học</Link></li>

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
      </ul>

      {/* User box với dropdown */}
      <div className="user-box" onClick={() => setShowUserMenu(!showUserMenu)}
        style={{ position: "relative", cursor: "pointer" }}>
        <img src={user} alt="user avatar" />
        <span>{tenNgan}</span>

        {showUserMenu && (
          <div style={{
            position: "absolute", top: "110%", right: 0, background: "#fff",
            borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            minWidth: 160, zIndex: 999, overflow: "hidden"
          }}>
            <Link to="/profile"
              style={{ display: "block", padding: "10px 16px", fontSize: 14, color: "#333", textDecoration: "none" }}
              onClick={() => setShowUserMenu(false)}
            >
              👤 Thông tin cá nhân
            </Link>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(false);
                setShowLogoutModal(true); // ← mở modal thay vì logout thẳng
              }}
              style={{
                padding: "10px 16px", fontSize: 14, color: "#c62828",
                cursor: "pointer", borderTop: "1px solid #f0f0f0"
              }}
            >
              🚪 Đăng xuất
            </div>
          </div>
        )}
      </div>

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
                  border: "none", background: "#e87722",
                  color: "#fff", cursor: "pointer", fontWeight: 600
                }}
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

export default NavbarLogin;