import { Outlet } from "react-router-dom";
import NavbarLogin from "../components/NavbarLogin";
import SidebarSV from "../components/Sidebar/Sidebar";
import "./StudentLayout.css";

const StudentLayout = () => {
  return (
    <div className="student-page">
      <NavbarLogin />
      <div className="student-body">
        <SidebarSV />
        <main className="student-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;