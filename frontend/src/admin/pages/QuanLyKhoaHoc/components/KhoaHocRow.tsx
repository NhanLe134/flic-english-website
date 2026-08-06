import React from "react";
import { FiEdit2, FiTrash2, FiUsers } from "react-icons/fi";
import { formatScheduleOnlyDays } from "../../../../utils/schedule";
import type { Course, LopHoc } from "../kieuDuLieu";

interface KhoaHocRowProps {
  course: Course;
  index: number;
  expandedCourse: number | null;
  toggleExpandCourse: (id: number) => void;
  classesMap: Record<number, LopHoc[]>;
  courseDetailsMap: Record<number, Array<{ MaLop: number; TenLop: string }>>;
  editingLevelIndex: number | null;
  setEditingLevelIndex: (idx: number | null) => void;
  editingLevelValue: string;
  setEditingLevelValue: (val: string) => void;
  editLevelWrapperRef: React.RefObject<HTMLDivElement | null>;
  newLevelInput: string;
  setNewLevelInput: (val: string) => void;
  addLevelError: string;
  setAddLevelError: (val: string) => void;
  toggleCourseVisibility: (id: number, currentStatus: string) => Promise<void>;
  openEditCourse: (c: Course) => void;
  startDelete: (c: Course) => void;
  saveCourseLevel: (course: Course, val: string, maLop: number) => Promise<void>;
  setDeletingLevelInfo: React.Dispatch<React.SetStateAction<{ course: Course; levelName: string; index: number; maLop: number } | null>>;
  addCourseLevel: (course: Course, levelName: string) => Promise<void>;
  setNewClassForm: React.Dispatch<React.SetStateAction<any>>;
  setAddClassErrors: React.Dispatch<React.SetStateAction<any>>;
  setShowAddClassModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedClass: React.Dispatch<React.SetStateAction<LopHoc | null>>;
  setShowClassDetailModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function KhoaHocRow({
  course,
  index,
  expandedCourse,
  toggleExpandCourse,
  classesMap,
  courseDetailsMap,
  editingLevelIndex,
  setEditingLevelIndex,
  editingLevelValue,
  setEditingLevelValue,
  editLevelWrapperRef,
  newLevelInput,
  setNewLevelInput,
  addLevelError,
  setAddLevelError,
  toggleCourseVisibility,
  openEditCourse,
  startDelete,
  saveCourseLevel,
  setDeletingLevelInfo,
  addCourseLevel,
  setNewClassForm,
  setAddClassErrors,
  setShowAddClassModal,
  setSelectedClass,
  setShowClassDetailModal,
}: KhoaHocRowProps) {
  const isExpanded = expandedCourse === course.id;
  const classes = classesMap[course.id] || [];
  const isVisible = course.status === 'Hiển thị' || course.status === 'Đã duyệt' || course.status === 'Hoạt động';

  return (
    <React.Fragment>
      <tr className={`course-row ${index % 2 === 0 ? "even-row" : "odd-row"}`} onClick={() => toggleExpandCourse(course.id)}>
        <td>
          <div className="course-title-flex-row">
            <span className="course-title-cell">{course.title}</span>
          </div>
          <div className="course-desc-cell">
            {course.desc.slice(0, 85)}{course.desc.length > 85 ? '...' : ''}
          </div>
        </td>
        <td>{course.created}</td>
        <td>
          <label className="switch-toggle" onClick={e => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isVisible}
              onChange={() => toggleCourseVisibility(course.id, course.status)}
            />
            <span className="switch-slider rounded"></span>
          </label>
        </td>
        <td>
          <span className="classes-count-text">
            {course.classCount} lớp
          </span>
        </td>
        <td>
          <div className="action-buttons-group">
            <button className="action-btn-edit" onClick={(e) => { e.stopPropagation(); openEditCourse(course); }} title="Sửa">
              <FiEdit2 size={14} /> Sửa
            </button>
            <button className="action-btn-delete" onClick={(e) => { e.stopPropagation(); startDelete(course); }} title="Xóa">
              <FiTrash2 size={14} /> Xóa
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="classes-expanded-row">
          <td colSpan={5}>
            <div className="course-expanded-panel-container">
              {/* Cột 1: Quản lý Trình độ */}
              <div className="course-level-management-box">
                <h4>QUẢN LÝ TRÌNH ĐỘ</h4>

                <div className="course-levels-editable-list">
                  {(() => {
                    const currentLevels = courseDetailsMap[course.id] || [];
                    if (currentLevels.length === 0) {
                      return <p className="no-levels-text">Chưa có trình độ nào được thiết lập.</p>;
                    }
                    return (
                      <div className="levels-items-container">
                        {currentLevels.map((lvl, idx) => {
                          const isEditingThis = editingLevelIndex === idx;
                          return (
                            <div
                              key={lvl.MaLop}
                              ref={isEditingThis ? editLevelWrapperRef : null}
                              className={`level-item-row ${isEditingThis ? 'is-editing' : ''}`}
                            >
                              {isEditingThis ? (
                                <>
                                  <input
                                    type="text"
                                    value={editingLevelValue}
                                    onChange={e => setEditingLevelValue(e.target.value)}
                                    className="level-edit-input"
                                    onKeyDown={async e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = editingLevelValue.trim();
                                        if (val) {
                                          await saveCourseLevel(course, val, lvl.MaLop);
                                          setEditingLevelIndex(null);
                                        }
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <button
                                    onClick={async () => {
                                      const val = editingLevelValue.trim();
                                      if (val) {
                                        await saveCourseLevel(course, val, lvl.MaLop);
                                        setEditingLevelIndex(null);
                                      }
                                    }}
                                    className="level-edit-btn-save"
                                  >
                                    Lưu
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="level-item-text">{lvl.TenLop}</span>
                                  <div className="level-item-actions">
                                    <button
                                      onClick={() => {
                                        setEditingLevelIndex(idx);
                                        setEditingLevelValue(lvl.TenLop);
                                      }}
                                      className="level-action-btn-edit"
                                      title="Sửa tên trình độ"
                                    >
                                      <FiEdit2 size={13} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDeletingLevelInfo({ course, levelName: lvl.TenLop, index: idx, maLop: lvl.MaLop });
                                      }}
                                      className="level-action-btn-delete"
                                      title="Xóa trình độ"
                                    >
                                      <FiTrash2 size={13} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  <div className="add-level-section">
                    <h5 className="add-level-section-title">THÊM TRÌNH ĐỘ MỚI</h5>
                    <div className="add-level-input-group">
                      <input
                        type="text"
                        value={newLevelInput}
                        onChange={e => {
                          setNewLevelInput(e.target.value);
                          setAddLevelError("");
                        }}
                        placeholder="Nhập tên trình độ mới"
                        className={`level-input-small-inline ${addLevelError ? 'has-error' : ''}`}
                        onKeyDown={async e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = newLevelInput.trim();
                            if (!trimmed) {
                              setAddLevelError("Vui lòng nhập tên trình độ!");
                              return;
                            }
                            const currentLevels = courseDetailsMap[course.id] || [];
                            if (currentLevels.some(l => l.TenLop.toLowerCase() === trimmed.toLowerCase())) {
                              setAddLevelError("Trình độ này đã tồn tại!");
                              return;
                            }
                            await addCourseLevel(course, trimmed);
                          }
                        }}
                      />
                      <button
                        onClick={async () => {
                          const trimmed = newLevelInput.trim();
                          if (!trimmed) {
                            setAddLevelError("Vui lòng nhập tên trình độ!");
                            return;
                          }
                          const currentLevels = courseDetailsMap[course.id] || [];
                          if (currentLevels.some(l => l.TenLop.toLowerCase() === trimmed.toLowerCase())) {
                            setAddLevelError("Trình độ này đã tồn tại!");
                            return;
                          }
                          await addCourseLevel(course, trimmed);
                        }}
                        className="add-level-btn-submit"
                      >
                        Thêm
                      </button>
                    </div>
                    {addLevelError && (
                      <div className="form-field-error-text mt-6">
                        {addLevelError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cột 2: Danh sách lớp học & Thêm lớp học */}
              <div className="course-classes-management-box">
                <div className="classes-management-header">
                  <h4>DANH SÁCH LỚP HỌC</h4>
                  <button
                    className="add-class-btn-inline"
                    onClick={() => {
                      const details = courseDetailsMap[course.id] || [];
                      const defaultMaLop = details.length > 0 ? details[0].MaLop : 0;
                      setNewClassForm({
                        name: '',
                        schedule: '',
                        days: '',
                        daySchedules: {},
                        maxStudents: 30,
                        maLop: defaultMaLop,
                        teachers: {}
                      });
                      setAddClassErrors({ name: '', maLop: '', maxStudents: '' });
                      setShowAddClassModal(true);
                    }}
                  >
                    + Thêm lớp mới
                  </button>
                </div>

                {classes.length === 0 ? (
                  <p className="no-classes-text">Chưa có lớp học nào trực thuộc khóa học này.</p>
                ) : (
                  <div className="classes-vertical-list">
                    <div className="classes-list-table-header">
                      <div className="class-header-name">TÊN LỚP HỌC</div>
                      <div className="class-header-schedule">LỊCH HỌC</div>
                      <div className="class-header-students">SĨ SỐ</div>
                      <div className="class-header-completed">TRẠNG THÁI</div>
                    </div>

                    {classes.map(cls => (
                      <div
                        key={cls.id}
                        className="classes-list-item-row"
                        onClick={() => {
                          setSelectedClass(cls);
                          setShowClassDetailModal(true);
                        }}
                      >
                        <div className="class-item-name">{cls.name}</div>
                        <div className="class-item-schedule">{formatScheduleOnlyDays(cls.schedule)}</div>
                        <div className="class-item-students">
                          <FiUsers className="class-row-icon" />
                          <span>{cls.students}</span>
                        </div>
                        <div className="class-item-completed">
                          <span className={`completed-text ${cls.status === 'Đã hoàn thành' ? 'is-completed' : ''}`}>
                            {cls.status || 'Chưa bắt đầu'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
