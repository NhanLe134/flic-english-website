import { Outlet } from "react-router-dom";
import { AvatarProvider } from "../../context/AvatarContext";
import Sidebar from "../components/SidebarGV";
import "./TeacherLayout.css";

const TeacherLayout = () => {
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