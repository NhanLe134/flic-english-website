import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SidebarSV.css";

function SidebarSV() {
  const [showMore, setShowMore]         = useState(false);
  const [showSkills, setShowSkills]     = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ← thêm
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <div className="sidebar">
      <ul>

        <li>
          <Link to="/MyCourses">📚 Khóa học</Link>
        </li>

        <li>
          <Link to="/grammar">📖 Ngữ pháp</Link>
        </li>

        <li>
          <Link to="/vocabulary">📝 Từ vựng</Link>
        </li>

        <li className="sidebar-more-wrapper">
          <div className="sidebar-more-trigger" onClick={() => setShowSkills(!showSkills)}>
            🎧 Kỹ năng
          </div>
          {showSkills && (
            <div className="sidebar-dropdown">
              <Link to="/skills/listening" onClick={() => setShowSkills(false)}>Listening</Link>
              <Link to="/skills/speaking"  onClick={() => setShowSkills(false)}>Speaking</Link>
              <Link to="/skills/writing"   onClick={() => setShowSkills(false)}>Writing</Link>
              <Link to="/skills/reading"   onClick={() => setShowSkills(false)}>Reading</Link>
            </div>
          )}
        </li>

        <li>
          <Link to="/progress">📊 Tiến độ</Link>
        </li>

        <li>
          <Link to="/profile-info">👤 Hồ sơ</Link>
        </li>

        <li className="sidebar-more-wrapper">
          <div className="sidebar-more-trigger" onClick={() => setShowMore(!showMore)}>
            ⋯ Xem thêm
          </div>
          {showMore && (
            <div className="sidebar-dropdown">
              <Link to="/settings" onClick={() => setShowMore(false)}>Cài đặt</Link>
              <Link to="/help"     onClick={() => setShowMore(false)}>Trợ giúp</Link>
              <div
                className="sidebar-dropdown-item sidebar-logout"
                onClick={() => { setShowMore(false); setShowLogoutModal(true); }} // ← mở modal
              >
                Đăng xuất
              </div>
            </div>
          )}
        </li>

      </ul>

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