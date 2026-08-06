import React from "react";
import { FiX } from "react-icons/fi";
import { DAYS_OF_WEEK, START_TIME_OPTIONS, END_TIME_OPTIONS, serializeSchedule, getSkillId } from "../hangSo";
import type { Course, LopHoc, Teacher } from "../kieuDuLieu";

interface SuaLopHocModalProps {
  show: boolean;
  editingClass: LopHoc | null;
  expandedCourse: number | null;
  courses: Course[];
  courseDetailsMap: Record<number, Array<{ MaLop: number; TenLop: string }>>;
  classEditForm: {
    name: string;
    schedule: string;
    days: string;
    daySchedules: Record<string, { startTime: string; endTime: string }>;
    maxStudents: number;
    status: string;
    maLop: number;
    teachers: Record<number, number>;
  };
  setClassEditForm: React.Dispatch<React.SetStateAction<any>>;
  editClassErrors: { name: string; maLop: string; maxStudents: string };
  setEditClassErrors: React.Dispatch<React.SetStateAction<{ name: string; maLop: string; maxStudents: string }>>;
  teachersList: Teacher[];
  onClose: () => void;
  onSave: () => Promise<void>;
}

export default function SuaLopHocModal({
  show,
  editingClass,
  expandedCourse,
  courses,
  courseDetailsMap,
  classEditForm,
  setClassEditForm,
  editClassErrors,
  setEditClassErrors,
  teachersList,
  onClose,
  onSave,
}: SuaLopHocModalProps) {
  if (!show || !editingClass) return null;

  const expandedCourseObj = courses.find(c => c.id === expandedCourse);
  const courseSkillsList = [];
  if (expandedCourseObj?.Listening) courseSkillsList.push('Listening');
  if (expandedCourseObj?.Reading) courseSkillsList.push('Reading');
  if (expandedCourseObj?.Speaking) courseSkillsList.push('Speaking');
  if (expandedCourseObj?.Writing) courseSkillsList.push('Writing');

  return (
    <div className="modal-backdrop-blur z-index-top">
      <div className="course-form-modal w-520">
        <div className="modal-header-section">
          <h3>Chỉnh sửa lớp học</h3>
          <button className="modal-close-icon-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-scrollable-body max-h-70">
          <div className="form-field-group">
            <label>Tên lớp học <span className="required-star">*</span></label>
            <input
              className={editClassErrors.name ? "has-error" : ""}
              value={classEditForm.name}
              onChange={e => {
                setClassEditForm((p: any) => ({ ...p, name: e.target.value }));
                setEditClassErrors(p => ({ ...p, name: '' }));
              }}
              placeholder="VD: Lớp IELTS-01"
            />
            {editClassErrors.name && (
              <span className="form-field-error-text">{editClassErrors.name}</span>
            )}
          </div>

          <div className="form-field-group">
            <label>Trình độ <span className="required-star">*</span></label>
            <select
              className={editClassErrors.maLop ? "has-error" : ""}
              value={classEditForm.maLop || ''}
              onChange={e => {
                setClassEditForm((p: any) => ({ ...p, maLop: Number(e.target.value) }));
                setEditClassErrors(p => ({ ...p, maLop: '' }));
              }}
            >
              <option value="">-- Chọn trình độ --</option>
              {(courseDetailsMap[expandedCourse || 0] || []).map(d => (
                <option key={d.MaLop} value={d.MaLop}>
                  {d.TenLop}
                </option>
              ))}
            </select>
            {editClassErrors.maLop && (
              <span className="form-field-error-text">{editClassErrors.maLop}</span>
            )}
          </div>

          <div className="form-field-group">
            <label>Trạng thái lớp học</label>
            <select
              value={classEditForm.status}
              onChange={e => setClassEditForm((p: any) => ({ ...p, status: e.target.value }))}
            >
              <option value="Chưa bắt đầu">Chưa bắt đầu</option>
              <option value="Đang học">Đang học</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>

          <div className="form-field-group">
            <label>Lịch học (Chọn các ngày học trong tuần):</label>
            <div className="weekday-selection-row">
              {DAYS_OF_WEEK.map(d => {
                const isSelected = classEditForm.days.split(',').map(x => x.trim()).filter(Boolean).includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    className={`weekday-btn-choice ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      const daysList = classEditForm.days.split(',').map(x => x.trim()).filter(Boolean);
                      let newDaysList = [];
                      const newDaySchedules = { ...classEditForm.daySchedules };

                      if (daysList.includes(d.value)) {
                        newDaysList = daysList.filter(day => day !== d.value);
                        delete newDaySchedules[d.value];
                      } else {
                        newDaysList = [...daysList, d.value];
                        newDaySchedules[d.value] = { startTime: '07:00', endTime: '08:30' };
                      }

                      newDaysList.sort((a, b) => {
                        const idxA = DAYS_OF_WEEK.findIndex(item => item.value === a);
                        const idxB = DAYS_OF_WEEK.findIndex(item => item.value === b);
                        return idxA - idxB;
                      });

                      setClassEditForm((p: any) => ({
                        ...p,
                        days: newDaysList.join(', '),
                        daySchedules: newDaySchedules
                      }));
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {classEditForm.days.split(',').map(x => x.trim()).filter(Boolean).map(day => {
            const sched = classEditForm.daySchedules[day] || { startTime: '07:00', endTime: '08:30' };
            return (
              <div key={day} className="day-schedule-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ minWidth: '70px', fontWeight: 'bold' }}>{day}:</div>
                <div className="form-field-group" style={{ flex: 1, marginBottom: 0 }}>
                  <select
                    value={sched.startTime}
                    onChange={e => {
                      const val = e.target.value;
                      setClassEditForm((p: any) => ({
                        ...p,
                        daySchedules: {
                          ...p.daySchedules,
                          [day]: { ...sched, startTime: val }
                        }
                      }));
                    }}
                  >
                    {START_TIME_OPTIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div style={{ alignSelf: 'center' }}>đến</div>
                <div className="form-field-group" style={{ flex: 1, marginBottom: 0 }}>
                  <select
                    value={sched.endTime}
                    onChange={e => {
                      const val = e.target.value;
                      setClassEditForm((p: any) => ({
                        ...p,
                        daySchedules: {
                          ...p.daySchedules,
                          [day]: { ...sched, endTime: val }
                        }
                      }));
                    }}
                  >
                    {END_TIME_OPTIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}

          {classEditForm.days && (
            <div className="modal-skills-info">
              Đã chọn: {serializeSchedule(classEditForm.days, classEditForm.daySchedules)}
            </div>
          )}

          <div className="form-field-group">
            <label className="skills-assignment-label">Phân công giáo viên theo kỹ năng</label>
            <div className="skills-assignment-container">
              {courseSkillsList.map(skill => {
                const skillId = getSkillId(skill);
                return (
                  <div key={skill} className="skill-assignment-row">
                    <span className="skill-assignment-name">{skill}:</span>
                    <select
                      value={classEditForm.teachers[skillId] || ''}
                      onChange={e => {
                        const val = e.target.value ? Number(e.target.value) : 0;
                        setClassEditForm((prev: any) => ({
                          ...prev,
                          teachers: {
                            ...prev.teachers,
                            [skillId]: val
                          }
                        }));
                      }}
                      className="skill-assignment-select"
                    >
                      <option value="">Chưa phân công</option>
                      {teachersList.map(t => (
                        <option key={t.MaGiangVien} value={t.MaGiangVien}>
                          {t.HoTen}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer-section">
          <button className="footer-cancel-btn" onClick={onClose}>Hủy bỏ</button>
          <button className="footer-save-btn" onClick={onSave}>Lưu lớp học</button>
        </div>
      </div>
    </div>
  );
}
