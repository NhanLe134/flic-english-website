import styles from "./SidebarQTV.module.css"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { FiBook, FiFileText, FiCheckSquare, FiLogOut, FiUsers } from "react-icons/fi"
import { hasPermission } from "../../utils/permission"

const SidebarQTV = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const isCourseActive = (path: string) => {
    const lower = path.toLowerCase();
    return (
      lower.startsWith("/qtv/khoahoc") ||
      lower.startsWith("/qtv/kho-hoc-lieu") ||
      lower.startsWith("/qtv/class") ||
      lower.startsWith("/qtv/create-") ||
      lower.startsWith("/qtv/edit-") ||
      lower.startsWith("/qtv/add-") ||
      lower.startsWith("/qtv/lesson") ||
      lower.startsWith("/qtv/bai-giang") ||
      lower.startsWith("/qtv/bai-tap") ||
      lower.startsWith("/qtv/tai-lieu") ||
      lower.startsWith("/qtv/baitap-detail")
    );
  };

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
        {(hasPermission("CLASS_MANAGE") || hasPermission("LECTURE_CREATE") || hasPermission("BAITAP_CREATE") || hasPermission("QUIZ_CREATE") || hasPermission("EXTRA_PRACTICE_CREATE") || hasPermission("DOCUMENT_CREATE_DIRECT")) && (
          <li>
            <NavLink 
              to="/QTV/khoahoc" 
              className={
                isCourseActive(location.pathname) 
                  ? styles.active 
                  : ""
              }
            >
              <FiBook className="menu-icon" />
              <span>Khóa học</span>
            </NavLink>
          </li>
        )}
        {hasPermission("QUIZ_CREATE") && (
          <li>
            <NavLink to="/QTV/quan-ly-de-thi" className={({ isActive }) => isActive ? styles.active : ""}>
              <FiFileText className="menu-icon" />
              <span>Quản lý đề thi thử</span>
            </NavLink>
          </li>
        )}
        {(hasPermission("STUDENT_ASSIGN") || hasPermission("SUBMISSION_VIEW") || hasPermission("STUDENT_GRADE")) && (
          <li>
            <NavLink to="/QTV/hocvien" className={({ isActive }) => isActive ? styles.active : ""}>
              <FiUsers className="menu-icon" />
              <span>Danh sách Học viên</span>
            </NavLink>
          </li>
        )}
        {hasPermission("GRADEBOOK_VIEW_ALL") && (
          <li>
            <NavLink to="/QTV/baocao" className={({ isActive }) => isActive ? styles.active : ""}>
              <FiFileText className="menu-icon" />
              <span>Báo cáo kết quả</span>
            </NavLink>
          </li>
        )}
        {hasPermission("CONTENT_APPROVE") && (
          <li>
            <NavLink to="/QTV/duyet-bai" className={({ isActive }) => isActive ? styles.active : ""}>
              <FiCheckSquare className="menu-icon" />
              <span>Duyệt bài</span>
            </NavLink>
          </li>
        )}
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

export default SidebarQTV