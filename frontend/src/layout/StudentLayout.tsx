import { Outlet } from 'react-router-dom'
import StudentNavbar from '../components/StudentNavbar/StudentNavbar'
import './StudentLayout.css'

export default function StudentLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', background: '#f8fafc' }}>
      <StudentNavbar />
      <div style={{ flex: 1, padding: '32px' }}>
        <Outlet />
      </div>
    </div>
  )
}
