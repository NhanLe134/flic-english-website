import React from "react";
import "./PopupThongBaoMobile.css";

interface PopupThongBaoMobileProps {
  onConfirm: () => void;
  role: string;
}

export const PopupThongBaoMobile: React.FC<PopupThongBaoMobileProps> = ({ onConfirm, role }) => {
  const getNoticeMessage = () => {
    switch (role) {
      case "Giảng Viên":
        return "Để thuận tiện cho việc quản lý lớp học, soạn bài giảng, tạo bài tập và chấm bài, giảng viên vui lòng đăng nhập trên máy tính.";
      case "Quản Trị Viên":
        return "Trang tổng quan quản trị và quản lý hệ thống yêu cầu độ phân giải lớn, quản trị viên vui lòng sử dụng máy tính.";
      case "Quản Trị Nội Dung":
        return "Để thực hiện các chức năng duyệt bài giảng, quản lý khóa học và cập nhật tài liệu, vui lòng đăng nhập trên máy tính.";
      case "Học Viên":
      default:
        return "Để đảm bảo trải nghiệm học tập, làm bài tập và thi thử đạt kết quả tốt nhất, học viên vui lòng sử dụng máy tính.";
    }
  };

  return (
    <div className="mobile-notice-backdrop">
      <div className="mobile-notice-card">
        <h3 className="mobile-notice-title">Thông báo hệ thống</h3>
        <div className="mobile-notice-content">
          {getNoticeMessage()}
        </div>
        <div className="mobile-notice-actions">
          <button className="mobile-notice-btn" onClick={onConfirm}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};
