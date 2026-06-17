import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import Login from "../home_pages/Login/Login";
import Register from "../home_pages/Register/Register";
import ForgotPassword from "../home_pages/ForgotPassword/ForgotPassword";
import "./authModal.css";

const AuthModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const authType = searchParams.get("auth");

  // Khóa cuộn trang khi modal đang mở
  useEffect(() => {
    if (authType) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [authType]);

  if (!authType || (authType !== "login" && authType !== "register" && authType !== "forgot")) {
    return null;
  }

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("auth");
    setSearchParams(newParams);
  };

  return (
    <div className="auth-modal-backdrop" onClick={handleClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button 
          className="auth-modal-close-btn" 
          onClick={handleClose} 
          aria-label="Đóng"
          type="button"
        >
          &times;
        </button>
        {authType === "login" && (
          <Login isModal={true} onClose={handleClose} />
        )}
        {authType === "register" && (
          <Register isModal={true} onClose={handleClose} />
        )}
        {authType === "forgot" && (
          <ForgotPassword isModal={true} onClose={handleClose} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
