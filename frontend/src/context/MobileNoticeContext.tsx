import { createContext, useContext, useState, type ReactNode } from "react";
import { PopupThongBaoMobile } from "../components/PopupXacThuc/PopupThongBaoMobile";

interface MobileNoticeContextType {
  showMobileNotice: (role?: string) => void;
}

const MobileNoticeContext = createContext<MobileNoticeContextType | undefined>(undefined);

export const useMobileNotice = () => {
  const context = useContext(MobileNoticeContext);
  if (!context) {
    throw new Error("useMobileNotice must be used within a MobileNoticeProvider");
  }
  return context;
};

export const MobileNoticeProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [role, setRole] = useState("");

  const showMobileNotice = (selectedRole: string = "Học Viên") => {
    setRole(selectedRole);
    setVisible(true);
  };

  const handleConfirm = () => {
    setVisible(false);
    // Clear user session/localstorage
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    // Redirect to home page
    window.location.href = window.location.origin + "/flic-english-website/";
  };

  return (
    <MobileNoticeContext.Provider value={{ showMobileNotice: (r) => showMobileNotice(r) }}>
      {children}
      {visible && <PopupThongBaoMobile role={role} onConfirm={handleConfirm} />}
    </MobileNoticeContext.Provider>
  );
};
