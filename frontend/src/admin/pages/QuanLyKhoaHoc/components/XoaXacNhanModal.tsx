import { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import type { Course, LopHoc } from "../kieuDuLieu";

interface XoaXacNhanModalProps {
  deletingClass: LopHoc | null;
  deletingLevelInfo: { course: Course; levelName: string; index: number; maLop: number } | null;
  deletingCourse: Course | null;
  onCancelDeleteClass: () => void;
  onConfirmDeleteClass: (id: number) => void;
  onCancelDeleteLevel: () => void;
  onConfirmDeleteLevel: (maLop: number) => void;
  onCancelDeleteCourse: () => void;
  onConfirmDeleteCourse: (id: number) => void;
}

export default function XoaXacNhanModal({
  deletingClass,
  deletingLevelInfo,
  deletingCourse,
  onCancelDeleteClass,
  onConfirmDeleteClass,
  onCancelDeleteLevel,
  onConfirmDeleteLevel,
  onCancelDeleteCourse,
  onConfirmDeleteCourse,
}: XoaXacNhanModalProps) {
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    if (deletingCourse) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [deletingCourse]);

  // 1. Modal xóa lớp học
  if (deletingClass) {
    return (
      <div className="modal-backdrop-blur z-index-top">
        <div className="delete-confirm-card">
          <div className="delete-icon-warning">
            <FiAlertTriangle size={32} />
          </div>
          <h3>Xác nhận xóa lớp học</h3>
          <p>
            Bạn có chắc chắn muốn xóa lớp học <strong>{deletingClass.name}</strong> không?
            Hành động này không thể hoàn tác.
          </p>
          <div className="delete-actions-row">
            <button className="delete-btn-cancel" onClick={onCancelDeleteClass}>Hủy</button>
            <button className="delete-btn-confirm" onClick={() => onConfirmDeleteClass(deletingClass.id)}>Xóa</button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Modal xóa trình độ
  if (deletingLevelInfo) {
    return (
      <div className="modal-backdrop-blur z-index-top">
        <div className="delete-confirm-card">
          <div className="delete-icon-warning">
            <FiAlertTriangle size={32} />
          </div>
          <h3>Xác nhận xóa trình độ</h3>
          <p>
            Bạn có chắc chắn muốn xóa trình độ <strong>{deletingLevelInfo.levelName}</strong> của khóa học <strong>{deletingLevelInfo.course.title}</strong>?
            Hành động này sẽ xóa các lớp học liên quan trực tiếp đến trình độ này.
          </p>
          <div className="delete-actions-row">
            <button className="delete-btn-cancel" onClick={onCancelDeleteLevel}>Hủy</button>
            <button className="delete-btn-confirm" onClick={() => onConfirmDeleteLevel(deletingLevelInfo.maLop)}>Xóa</button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Modal xóa khóa học (Có đếm ngược)
  if (deletingCourse) {
    return (
      <div className="modal-backdrop-blur z-index-top">
        <div className="delete-confirm-card">
          <div className="delete-icon-warning">
            <FiAlertTriangle size={32} />
          </div>
          <h3>CẢNH BÁO XÓA KHÓA HỌC</h3>
          <p>
            Bạn đang yêu cầu xóa khóa học <strong>{deletingCourse.title}</strong>.
            Hành động này sẽ <strong>XÓA TOÀN BỘ</strong> các trình độ học và các lớp học nằm trong khóa học này!
          </p>
          <div className="delete-actions-row">
            <button className="delete-btn-cancel" onClick={onCancelDeleteCourse}>Hủy bỏ</button>
            <button
              className="delete-btn-confirm"
              disabled={countdown > 0}
              onClick={() => onConfirmDeleteCourse(deletingCourse.id)}
              style={{ opacity: countdown > 0 ? 0.5 : 1, cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}
            >
              {countdown > 0 ? `Xác nhận xóa (${countdown}s)` : "Tôi đồng ý xóa"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
