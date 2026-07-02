import { useEffect } from "react";
import SidebarQTV from "../components/SidebarQTV";
import { Outlet, Navigate } from "react-router-dom";
import styles from "./QTVLayout.module.css";

const API = "http://localhost:5000";

const QTVLayout = () => {
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

  if (!user || user.VaiTro !== "Quản Trị Nội Dung") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.layout}>
      <SidebarQTV />
      <div className={styles.content}>        
        <Outlet />
      </div>
    </div>
  );
};

export default QTVLayout;