import styles from "./SidebarQTV.module.css"
import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { FiBook, FiFileText, FiCheckSquare, FiLogOut, FiUsers } from "react-icons/fi"

const SidebarQTV = () => {
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    setShowLogoutModal(false)
    navigate("/")
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={`${import.meta.env.BASE_URL}flic_logo_full.png`} alt="logo" />
      </div>

      <div className={styles.adminInfo}>
        <div className={styles.avatar}>Q</div>
        <div className={styles.userText}>
          <p className={styles.name}>Quản trị nội dung</p>
        </div>
      </div>

      <ul className={styles.menu}>
        <li>
          <NavLink to="/QTV/khoahoc" className={({ isActive }) => isActive ? styles.active : ""}>
            <FiBook className="menu-icon" />
            <span>Khóa học</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/QTV/quan-ly-de-thi" className={({ isActive }) => isActive ? styles.active : ""}>
            <FiFileText className="menu-icon" />
            <span>Quản lý đề thi thử</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/QTV/hocvien" className={({ isActive }) => isActive ? styles.active : ""}>
            <FiUsers className="menu-icon" />
            <span>Danh sách Học viên</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/QTV/baocao" className={({ isActive }) => isActive ? styles.active : ""}>
            <FiFileText className="menu-icon" />
            <span>Báo cáo kết quả</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/QTV/duyet-bai" className={({ isActive }) => isActive ? styles.active : ""}>
            <FiCheckSquare className="menu-icon" />
            <span>Duyệt bài</span>
          </NavLink>
        </li>
        <li>
          {/* ← dùng style giống .menu a */}
          <span
            onClick={() => setShowLogoutModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 10,
              color: "#444",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <FiLogOut className="menu-icon" />
            <span>Đăng xuất</span>
          </span>
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
                  border: "none", background: "#F95800",
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

export default SidebarQTV