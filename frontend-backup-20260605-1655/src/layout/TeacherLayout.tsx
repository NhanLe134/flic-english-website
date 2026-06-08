import { Outlet } from "react-router-dom";
import { AvatarProvider } from "../context/AvatarContext";
import Header from "../components/Header";
import Sidebar from "../components/SidebarGV";
import "../layout/TeacherLayout.css";

const TeacherLayout = () => {
  return (
    <AvatarProvider>
      <div className="teacher-page">
        <Header />
        <div className="teacher-layout">
          <Sidebar />
          <main className="teacher-content">
            <Outlet />
          </main>
        </div>
      </div>
    </AvatarProvider>
  );
};

export default TeacherLayout;