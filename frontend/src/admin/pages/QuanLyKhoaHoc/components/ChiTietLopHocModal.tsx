import { FiX, FiUsers, FiEdit2, FiTrash2 } from "react-icons/fi";
import type { LopHoc } from "../kieuDuLieu";

interface ChiTietLopHocModalProps {
  show: boolean;
  selectedClass: LopHoc | null;
  selectedClassAssignments: any[];
  onClose: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export default function ChiTietLopHocModal({
  show,
  selectedClass,
  selectedClassAssignments,
  onClose,
  onEditClick,
  onDeleteClick,
}: ChiTietLopHocModalProps) {
  if (!show || !selectedClass) return null;

  return (
    <div className="modal-backdrop-blur z-index-top">
      <div className="course-form-modal w-520">
        <div className="modal-header-section">
          <h3>Thông tin chi tiết lớp học</h3>
          <button className="modal-close-icon-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-scrollable-body max-h-70">
          <div className="class-detail-info-grid">
            <div className="info-row">
              <span className="info-label">Tên lớp học:</span>
              <span className="info-value-text">{selectedClass.name}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Lịch học:</span>
              <span className="info-value-text font-italic">{selectedClass.schedule}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Sỹ số lớp:</span>
              <span className="info-value-text flex-align-center">
                <FiUsers size={16} style={{ marginRight: '6px' }} />
                <strong>{selectedClass.students}</strong> / {selectedClass.maxStudents} Học viên
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Trạng thái hoạt động:</span>
              <span className={`status-badge-class-text ${
                selectedClass.status === 'Đã hoàn thành' ? 'completed' :
                selectedClass.status === 'Đang học' ? 'active' : 'pending'
              }`}>
                {selectedClass.status}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Tiến độ khóa học:</span>
              <span className="info-value-text">
                Đã học <strong>{selectedClass.progress}</strong> / {selectedClass.lessonCount} Buổi học
              </span>
            </div>

            <div className="info-row-full-width">
              <span className="info-label-header">Danh sách giáo viên giảng dạy:</span>
              <div className="teachers-skills-list-box">
                {selectedClassAssignments.length === 0 ? (
                  <div className="no-teachers-assigned-text">Lớp học này chưa được phân công giáo viên giảng dạy.</div>
                ) : (
                  selectedClassAssignments.map((assignment: any) => (
                    <div key={assignment.MaKyNang} className="teacher-skill-card-item">
                      <span className="skill-name-tag">{assignment.TenKyNang}:</span>
                      <span className="teacher-name-assigned">{assignment.HoTen}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer-section flex-justify-between">
          <div className="left-footer-actions">
            <button className="footer-action-btn-red" onClick={onDeleteClick}>
              <FiTrash2 size={16} /> Xóa lớp
            </button>
          </div>
          <div className="right-footer-actions">
            <button className="footer-cancel-btn" onClick={onClose}>Đóng lại</button>
            <button className="footer-save-btn flex-align-center" onClick={onEditClick}>
              <FiEdit2 size={16} style={{ marginRight: '6px' }} /> Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
