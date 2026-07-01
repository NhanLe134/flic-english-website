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
          className="logout-modal-backdrop"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="logout-modal-card"
            onClick={e => e.stopPropagation()}
          >
            <div className="logout-modal-icon-container">
              <FiLogOut className="logout-modal-large-icon" size={44} color="#F95800" />
            </div>
            <h3 className="logout-modal-title">Đăng xuất</h3>
            <p className="logout-modal-text">
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
            </p>
            <div className="logout-modal-actions">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="logout-modal-cancel-btn"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="logout-modal-confirm-btn"
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