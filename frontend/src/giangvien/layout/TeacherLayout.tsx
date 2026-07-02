import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { AvatarProvider } from "../../context/AvatarContext";
import Sidebar from "../components/SidebarGV";
import "./TeacherLayout.css";

const API = "http://localhost:5000";

const TeacherLayout = () => {
  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  
  useEffect(() => {
    if (user.MaNguoiDung) {
      fetch(`${API}/admin/users/${user.MaNguoiDung}/permissions`)
        .then(r => r.json())
        .then(data => {
          sessionStorage.setItem("permissions", JSON.stringify(data.permissions || []));
        })
        .catch(err => console.error("Error fetching permissions:", err));
    }
  }, [user.MaNguoiDung]);

  if (!user || user.VaiTro !== "Giảng Viên") {
    return <Navigate to="/" replace />;
  }

  return (
    <AvatarProvider>
      <div className="teacher-layout">
        <Sidebar />
        <main className="teacher-content">
          <Outlet />
        </main>
      </div>
    </AvatarProvider>
  );
};

export default TeacherLayout;