import { FiX } from "react-icons/fi";
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
      <div className="course-form-modal w-480">
        <div className="modal-header-section">
          <h3>Chi tiết lớp học</h3>
          <button className="modal-close-icon-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-scrollable-body max-h-60">
          <div className="class-detail-field-item">
            <span className="class-detail-label">Tên lớp học</span>
            <div className="class-detail-value">{selectedClass.name}</div>
          </div>

          <div className="class-detail-field-item">
            <span className="class-detail-label">Sĩ số tối đa</span>
            <div className="class-detail-value">
              {selectedClass.maxStudents ? `${selectedClass.maxStudents} học viên` : "Không giới hạn"}
            </div>
          </div>

          <div className="class-detail-field-item">
            <span className="class-detail-label">Sĩ số hiện tại</span>
            <div className="class-detail-value">{selectedClass.students} học viên</div>
          </div>

          <div className="class-detail-field-item">
            <span className="class-detail-label">Lịch học</span>
            <div className="class-detail-value">{selectedClass.schedule || "Chưa thiết lập"}</div>
          </div>

          <div className="class-detail-field-item">
            <span className="class-detail-label">Trạng thái</span>
            <div className="class-detail-value">
              <span className={`status-badge-detail ${
                selectedClass.status === "Đã hoàn thành" ? "completed" :
                selectedClass.status === "Đang học" || selectedClass.status === "Đang diễn ra" ? "active" : "not-started"
              }`}>
                {selectedClass.status}
              </span>
            </div>
          </div>

          <div className="class-detail-field-item">
            <span className="class-detail-label">Tiến độ khóa học</span>
            <div className="class-detail-value">
              Đã học <strong>{selectedClass.progress}</strong> / {selectedClass.lessonCount} Buổi học
            </div>
          </div>

          <div className="class-detail-field-item">
            <span className="class-detail-label">Phân công giảng viên</span>
            <div className="class-detail-skills-list">
              {selectedClassAssignments.length === 0 ? (
                <div className="no-teachers-assigned-text" style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '13px' }}>
                  Chưa phân công giáo viên giảng dạy
                </div>
              ) : (
                selectedClassAssignments.map((assignment: any) => (
                  <div key={assignment.MaKyNang} className="class-detail-skill-row">
                    <span className="class-detail-skill-name">{assignment.TenKyNang}</span>
                    <span style={{ color: '#0f172a' }}>{assignment.HoTen}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer-section">
          <button
            className="delete-btn-confirm delete-class-detail-btn"
            onClick={onDeleteClick}
          >
            Xóa lớp
          </button>
          <button
            className="footer-save-btn"
            onClick={onEditClick}
          >
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}
