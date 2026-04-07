import SidebarAdmin from "../components/SidebarAdmin";
import { Outlet } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout">

      <SidebarAdmin />

      <div className="admin-content">
        <Outlet />
      </div>

    </div>
  );
};

export default AdminLayout;