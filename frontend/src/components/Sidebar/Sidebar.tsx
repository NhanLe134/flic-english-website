import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./SidebarSV.css";
import userAvatar from "../../assets/user.png";

function SidebarSV() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  let currentUser: any = {};
  try {
    currentUser = JSON.parse(sessionStorage.getItem("user") || "{}") || {};
  } catch (e) {
    console.error("Error parsing user from sessionStorage", e);
  }
  const hoTen = currentUser?.HoTen || "Học Viên";

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <div className="sidebar">
      {/* Logo Doanh Nghiệp */}
      <div className="sidebar-logo">
        <img src={`${import.meta.env.BASE_URL}flic_logo_full.png`} alt="FLIC logo" />
      </div>

      {/* Profile Học Sinh */}
      <div className="sidebar-profile">
        <img src={userAvatar} alt="Student Avatar" className="sidebar-avatar" />
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{hoTen}</div>
          <div className="sidebar-user-role">Học viên</div>
        </div>
      </div>

      {/* Menu các chức năng */}
      <ul className="sidebar-menu">
        <li className={location.pathname === "/MyCourses" ? "active" : ""}>
          <Link to="/MyCourses">🏫 Lớp học</Link>
        </li>
        <li className={location.pathname === "/progress" ? "active" : ""}>
          <Link to="/progress">📊 Tiến độ</Link>
        </li>
        <li className={location.pathname === "/profile-info" ? "active" : ""}>
          <Link to="/profile-info">👤 Hồ sơ</Link>
        </li>
      </ul>

      {/* Nút Đăng xuất ở dưới cùng */}
      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={() => setShowLogoutModal(true)}>
          🚪 Đăng xuất
        </button>
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
    </div>
  );
}

export default SidebarSV;