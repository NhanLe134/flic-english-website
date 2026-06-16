import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { FiTrendingUp, FiBookOpen, FiUsers, FiFileText, FiLogOut, FiShield } from "react-icons/fi"
import "./SidebarAdmin.css"

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
        <img src={`${import.meta.env.BASE_URL}flic_logo_full.png`} width="200" alt="logo" />
      </div>

      <div className="admin-info">
        <div className="admin-avatar">A</div>
        <span>Admin</span>
      </div>

      <div className="sidebar-menu">
        <NavLink
          to="/admin/admin-dashboard"
          className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
        >
          <FiTrendingUp className="menu-icon" />
          <span>Thống kê</span>
        </NavLink>
        <NavLink
          to="/admin/approve"
          className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
        >
          <FiBookOpen className="menu-icon" />
          <span>Quản lý khóa học</span>
        </NavLink>
        <NavLink
          to="/admin/account"
          className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
        >
          <FiUsers className="menu-icon" />
          <span>Quản lý tài khoản</span>
        </NavLink>
        <NavLink
          to="/admin/permissions"
          className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
        >
          <FiShield className="menu-icon" />
          <span>Phân quyền</span>
        </NavLink>
        <NavLink
          to="/admin/bao-cao-ket-qua"
          className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
        >
          <FiFileText className="menu-icon" />
          <span>Báo cáo kết quả</span>
        </NavLink>

        <span
          className="menu-item menu-item-logout"
          style={{ cursor: "pointer" }}
          onClick={() => setShowLogoutModal(true)}
        >
          <FiLogOut className="menu-icon" />
          <span>Đăng xuất</span>
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