/**
 * CHỨC NĂNG CỦA FILE:
 * Component này hiển thị một Hộp thoại xác nhận (Popup) cảnh báo
 * khi học sinh muốn thoát khỏi màn hình làm bài trong lúc bài chưa nộp.
 */

import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

interface PopupXacNhanThoatProps {
  onClose: () => void;
  onConfirm: () => void;
}

export const PopupXacNhanThoat: React.FC<PopupXacNhanThoatProps> = ({ onClose, onConfirm }) => {
  return (
    <div className="exit-confirm-modal-backdrop" onClick={onClose}>
      <div 
        className="exit-confirm-modal-card" 
        style={{ 
          width: "fit-content", 
          maxWidth: "480px", 
          textAlign: "center", 
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="exit-modal-close-x"
          onClick={onClose}
          title="Đóng hộp thoại"
        >
          &times;
        </button>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <FiAlertTriangle size={56} color="#d97706" />
        </div>
        <p className="exit-confirm-modal-text" style={{ fontSize: "15px", fontWeight: "500", color: "#334155", textAlign: "center", margin: "0" }}>
          Bạn có chắc chắn muốn rời khỏi trang này? <br></br> Tất cả các câu trả lời hiện tại sẽ bị mất.
        </p>
        <div className="exit-confirm-modal-actions" style={{ justifyContent: "center", marginTop: "24px", width: "100%" }}>
          <button
            className="exit-confirm-btn"
            onClick={onConfirm}
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};
