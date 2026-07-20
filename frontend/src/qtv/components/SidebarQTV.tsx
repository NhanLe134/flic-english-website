import styles from "./SidebarQTV.module.css"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { FiBook, FiFileText, FiCheckSquare, FiLogOut, FiUsers } from "react-icons/fi"
import { hasPermission } from "../../utils/permission"

const SidebarQTV = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [hasPendingStudents, setHasPendingStudents] = useState(false)
  const [hasPendingContent, setHasPendingContent] = useState(false)

  const getStatusLabel = (s: string) => {
    const statusLower = (s || "").toLowerCase();
    if (statusLower === "published" || statusLower === "hoạt động" || statusLower === "đã duyệt") {
      return "Đã duyệt";
    }
    if (statusLower === "từ chối" || statusLower === "ẩn" || statusLower === "rejected") {
      return "Từ chối";
    }
    return "Chờ duyệt";
  };

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + '';

        // 1. Check pending students (Yêu cầu ghi danh)
        fetch(`${API}/dangky/pending?t=${Date.now()}`)
          .then(r => r.json())
          .then(data => {
            if (Array.isArray(data)) {
              const hasPending = data.some(r => {
                const status = r.TrangThai || '';
                return status !== 'Đã ghi danh' && status !== 'Từ chối';
              });
              setHasPendingStudents(hasPending);
            }
          })
          .catch(() => {});

        // 2. Check pending content to approve (Duyệt bài)
        Promise.all([
          fetch(`${API}/qtv/baigiang`).then((r) => r.json()),
          fetch(`${API}/qtv/baitap`).then((r) => r.json()),
          fetch(`${API}/qtv/dethi`).then((r) => r.json()),
        ])
          .then(([bg, bt, dt]) => {
            const allItems = [
              ...(Array.isArray(bg) ? bg : []),
              ...(Array.isArray(bt) ? bt : []),
              ...(Array.isArray(dt) ? dt : []),
            ];
            const hasPending = allItems.some(i => {
              const label = getStatusLabel(i.TrangThaiDuyet || i.TrangThai);
              return label === 'Chờ duyệt';
            });
            setHasPendingContent(hasPending);
          })
          .catch(() => {});
      } catch (e) {
        console.error("Error checking sidebar notifications:", e);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

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
      lower.startsWith("/qtv/baitap-detail") ||
      lower.startsWith("/quan-ly-ban-nhap")
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    setShowLogoutModal(false)
    navigate("/")
  }

  return (
    <div className={styles.sidebar}>
      <style>{`
        @keyframes slqtv-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
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
              <span>Lớp học</span>
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                <span>Danh sách Học viên</span>
                {hasPendingStudents && (
                  <span 
                    style={{ 
                      background: '#ef4444', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: '18px', 
                      height: '18px', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      marginLeft: 'auto',
                      animation: 'slqtv-pulse 1.8s infinite'
                    }}
                    title="Có yêu cầu ghi danh mới chờ duyệt!"
                  >
                    !
                  </span>
                )}
              </span>
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                <span>Duyệt bài</span>
                {hasPendingContent && (
                  <span 
                    style={{ 
                      background: '#ef4444', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: '18px', 
                      height: '18px', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      marginLeft: 'auto',
                      animation: 'slqtv-pulse 1.8s infinite'
                    }}
                    title="Có bài giảng/bài tập/đề thi mới chờ duyệt!"
                  >
                    !
                  </span>
                )}
              </span>
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