import { Link } from 'react-router-dom'
import './SidebarSV.css'

export default function SidebarSV() {
  return (
    <div style={{ width: '240px', background: '#000080', color: '#fff', padding: '24px', boxSizing: 'border-box', minHeight: '100vh' }}>
      <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700 }}>FLIC Student</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <li><Link to="/MyCourses" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>📚 Khóa học</Link></li>
        <li><Link to="/progress" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>📊 Tiến độ</Link></li>
        <li><Link to="/profile-info" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>👤 Hồ sơ</Link></li>
        <li><Link to="/settings" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>⚙️ Cài đặt</Link></li>
        <li><Link to="/" style={{ color: '#ff7f50', textDecoration: 'none', fontWeight: 600 }}>🚪 Đăng xuất</Link></li>
      </ul>
    </div>
  )
}
