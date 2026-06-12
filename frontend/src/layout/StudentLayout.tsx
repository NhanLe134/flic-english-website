import { Outlet } from "react-router-dom";
import SidebarSV from "../components/Sidebar/Sidebar";
import "./StudentLayout.css";

const StudentLayout = () => {
  return (
    <div className="student-page">
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