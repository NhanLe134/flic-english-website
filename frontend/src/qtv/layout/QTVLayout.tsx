import SidebarQTV from "../components/SidebarQTV";
import { Outlet, Navigate } from "react-router-dom";
import styles from "./QTVLayout.module.css";

const QTVLayout = () => {
  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
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