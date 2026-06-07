import SidebarQTV from "../components/SidebarQTV";
import { Outlet } from "react-router-dom";
import styles from "./qtvLayout.module.css";

const QTVLayout = () => {
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