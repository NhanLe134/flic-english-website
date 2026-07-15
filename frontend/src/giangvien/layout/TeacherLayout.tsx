import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { AvatarProvider } from "../../context/AvatarContext";
import Sidebar from "../components/SidebarGV";
import "./TeacherLayout.css";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

const TeacherLayout = () => {
  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  const [, setPermissions] = useState<string[]>([]);
  
  useEffect(() => {
    if (user.MaNguoiDung) {
      fetch(`${API}/admin/users/${user.MaNguoiDung}/permissions`)
        .then(r => r.json())
        .then(data => {
          const perms = data.permissions || [];
          sessionStorage.setItem("permissions", JSON.stringify(perms));
          setPermissions(perms);
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