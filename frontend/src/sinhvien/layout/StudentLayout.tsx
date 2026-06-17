import { Outlet, useLocation, Navigate } from 'react-router-dom'
import StudentNavbar from '../components/StudentNavbar/StudentNavbar'
import './StudentLayout.css'

export default function StudentLayout() {
  const location = useLocation();
  const isExamPage = location.pathname.includes('/test-exam/');

  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  if (!user || user.VaiTro !== "Học Viên") {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', background: '#ffffff' }}>
      {!isExamPage && <StudentNavbar />}
      <div style={{ flex: 1, padding: '0' }}>
        <Outlet />
      </div>
    </div>
  )
}

