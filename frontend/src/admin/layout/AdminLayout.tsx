import SidebarAdmin from "../components/SidebarAdmin";
import { Outlet, Navigate } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  if (!user || user.VaiTro !== "Quản Trị Viên") {
    return <Navigate to="/" replace />;
  }

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