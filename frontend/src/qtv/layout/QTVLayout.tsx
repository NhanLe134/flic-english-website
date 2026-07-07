import { useEffect, useState } from "react";
import SidebarQTV from "../components/SidebarQTV";
import { Outlet, Navigate } from "react-router-dom";
import styles from "./QTVLayout.module.css";

const API = "http://14.225.192.252:5000";

const QTVLayout = () => {
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