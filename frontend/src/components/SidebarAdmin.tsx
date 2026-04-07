import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import "./sidebarAdmin.css"

export default function SidebarAdmin() {
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    setShowLogoutModal(false)
    navigate("/")
  }

  return (
    <div className="sidebar-admin">
      <div className="sidebar-logo">
        <img src="/image.png" width="35" alt="logo" />
        <span>WEBSITE FLIC</span>
      </div>

      <div className="admin-info">
        <div className="admin-avatar">A</div>
        <span>Admin</span>
      </div>

      <div className="sidebar-menu">
        <NavLink to="/admin/admin-dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          🏠 Thống kê
        </NavLink>
        <NavLink to="/admin/approve" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          ✔ Kiểm duyệt
        </NavLink>
        <NavLink to="/admin/account" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          👤 Tài khoản
        </NavLink>
        <NavLink to="/admin/bao-cao-ket-qua" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          📊 Báo cáo kết quả
        </NavLink>
        <span
          className="menu-item"
          style={{ cursor: "pointer" }}
          onClick={() => setShowLogoutModal(true)}
        >
          🚪 Đăng xuất
        </span>
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
  )
}