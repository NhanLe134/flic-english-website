import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import Login from "../../home_pages/Login/Login";
import Register from "../../home_pages/Register/Register";
import ForgotPassword from "../../home_pages/ForgotPassword/ForgotPassword";
import "./PopupXacThuc.css";

const PopupXacThuc = () => {
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
      {/* Wrapper card có relative để nút close dính đúng góc card */}
      <div className="auth-modal-card-wrapper" onClick={(e) => e.stopPropagation()}>
        
        {/* Khối Header cố định chứa cả tiêu đề và nút close X - căn giữa chiều dọc và thẳng hàng ngang */}
        <div className="auth-modal-header">
          <h2 className="auth-modal-header-title">
            {authType === "login" && "Đăng nhập"}
            {authType === "register" && "Đăng ký tài khoản"}
            {authType === "forgot" && "Quên mật khẩu"}
          </h2>
          <button 
            className="auth-modal-close-btn-new" 
            onClick={handleClose} 
            aria-label="Đóng"
            type="button"
          >
            &times;
          </button>
        </div>

        {/* Khối Body có cuộn scroll tự động bên dưới */}
        <div className="auth-modal-body">
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
    </div>
  );
};

export default PopupXacThuc;
