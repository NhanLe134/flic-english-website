import { Outlet, Navigate } from "react-router-dom";
import { AvatarProvider } from "../../context/AvatarContext";
import Sidebar from "../components/SidebarGV";
import "./TeacherLayout.css";

const TeacherLayout = () => {
  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
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