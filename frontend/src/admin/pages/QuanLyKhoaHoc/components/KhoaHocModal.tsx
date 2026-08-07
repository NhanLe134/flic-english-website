import React from "react";
import { FiX } from "react-icons/fi";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  ListsToggle,
  BlockTypeSelect,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import type { Course } from "../kieuDuLieu";

interface KhoaHocModalProps {
  show: boolean;
  editCourse: Course | null;
  cForm: { title: string; desc: string; level: string; category: string; image: string };
  setCForm: React.Dispatch<React.SetStateAction<{ title: string; desc: string; level: string; category: string; image: string }>>;
  formLevels: string[];
  setFormLevels: React.Dispatch<React.SetStateAction<string[]>>;
  formNewLevelInput: string;
  setFormNewLevelInput: (val: string) => void;
  courseFormErrors: { title: string; levels: string; levelInput: string; skills: string; image: string };
  setCourseFormErrors: React.Dispatch<React.SetStateAction<{ title: string; levels: string; levelInput: string; skills: string; image: string }>>;
  courseSkills: string[];
  setCourseSkills: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
  onSave: () => Promise<void>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function KhoaHocModal({
  show,
  editCourse,
  cForm,
  setCForm,
  formLevels,
  setFormLevels,
  formNewLevelInput,
  setFormNewLevelInput,
  courseFormErrors,
  setCourseFormErrors,
  courseSkills,
  setCourseSkills,
  onClose,
  onSave,
  handleImageUpload,
}: KhoaHocModalProps) {
  if (!show) return null;

  return (
    <div className="modal-backdrop-blur z-index-top">
      <div className="course-form-modal">
        <div className="modal-header-section">
          <h3>{editCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}</h3>
          <button className="modal-close-icon-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-scrollable-body">
          <div className="form-field-group">
            <label>Tên khóa học <span className="required-star">*</span></label>
            <input
              className={courseFormErrors.title ? "has-error" : ""}
              value={cForm.title}
              onChange={e => {
                setCForm(p => ({ ...p, title: e.target.value }));
                setCourseFormErrors(p => ({ ...p, title: '' }));
              }}
              placeholder="VD: Luyện thi IELTS 6.5+ mục tiêu"
            />
            {courseFormErrors.title && (
              <span className="form-field-error-text">{courseFormErrors.title}</span>
            )}
          </div>

          <div className="form-field-group">
            <label>Trình độ của khóa học <span className="required-star">*</span></label>

            {editCourse ? (
              <div style={{ color: '#8a6d3b', fontSize: '13px', backgroundColor: '#fcf8e3', padding: '12px', borderRadius: '8px', border: '1px solid #faebcc', lineHeight: '1.5' }}>
                Trình độ của khóa học này đang được liên kết trực tiếp với lớp học. Bạn có thể thêm, sửa, hoặc xóa các trình độ ở mục <strong>QUẢN LÝ TRÌNH ĐỘ</strong> bằng cách bấm mở rộng dòng thông tin của khóa học này ở danh sách bên ngoài.
              </div>
            ) : (
              <>
                {formLevels.length > 0 && (
                  <div className="selected-levels-preview-row">
                    <span className="preview-label">Danh sách trình độ:</span>
                    <div className="preview-pills-list">
                      {formLevels.map(l => (
                        <span key={l} className="selected-level-badge">
                          {l}
                          <button
                            type="button"
                            className="remove-level-badge-btn"
                            onClick={() => setFormLevels(prev => prev.filter(x => x !== l))}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="custom-level-add-input-row">
                  <input
                    type="text"
                    className="level-input-small-inline"
                    placeholder="Nhập tên trình độ mới (VD: IELTS 5.5, Beginner, ...)"
                    value={formNewLevelInput}
                    onChange={e => {
                      setFormNewLevelInput(e.target.value);
                      setCourseFormErrors(p => ({ ...p, levelInput: '' }));
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = formNewLevelInput.trim();
                        if (val) {
                          if (formLevels.includes(val)) {
                            setCourseFormErrors(p => ({ ...p, levelInput: 'Trình độ này đã có trong danh sách!' }));
                            return;
                          }
                          setFormLevels(prev => [...prev, val]);
                          setFormNewLevelInput("");
                          setCourseFormErrors(p => ({ ...p, levels: '', levelInput: '' }));
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="add-custom-level-btn"
                    onClick={() => {
                      const val = formNewLevelInput.trim();
                      if (val) {
                        if (formLevels.includes(val)) {
                          setCourseFormErrors(p => ({ ...p, levelInput: 'Trình độ này đã có trong danh sách!' }));
                          return;
                        }
                        setFormLevels(prev => [...prev, val]);
                        setFormNewLevelInput("");
                        setCourseFormErrors(p => ({ ...p, levels: '', levelInput: '' }));
                      }
                    }}
                  >
                    Thêm
                  </button>
                </div>
                {courseFormErrors.levelInput && (
                  <span className="form-field-error-text">{courseFormErrors.levelInput}</span>
                )}
                {courseFormErrors.levels && (
                  <span className="form-field-error-text">{courseFormErrors.levels}</span>
                )}
              </>
            )}
          </div>

          <div className="form-field-group">
            <label>Phân loại khóa học</label>
            <select
              value={cForm.category}
              onChange={e => setCForm(p => ({ ...p, category: e.target.value }))}
            >
              <option value="Luyện thi">Luyện thi</option>
              <option value="Giao tiếp">Giao tiếp</option>
              <option value="Trẻ em">Trẻ em</option>
              <option value="Doanh nghiệp">Doanh nghiệp</option>
            </select>
          </div>

          <div className="form-field-group">
            <label>Kỹ năng <span className="required-star">*</span></label>
            <div className="skills-checkbox-row">
              {['Listening', 'Reading', 'Speaking', 'Writing'].map(skill => (
                <label key={skill} className="skill-checkbox-label">
                  <input
                    type="checkbox"
                    className="skill-checkbox-input"
                    checked={courseSkills.includes(skill)}
                    onChange={() => {
                      setCourseSkills(prev =>
                        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                      );
                      setCourseFormErrors(p => ({ ...p, skills: '' }));
                    }}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
            {courseFormErrors.skills && (
              <span className="form-field-error-text">{courseFormErrors.skills}</span>
            )}
          </div>

          <div className="form-field-group">
            <div className="image-label-row">
              <label>Ảnh khóa học <span className="required-star">*</span></label>
              <label htmlFor="course-image-file-input" className="image-upload-trigger-btn">
                Tải ảnh mới lên
              </label>
            </div>
            <div className="image-upload-wrapper-box">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                id="course-image-file-input"
                style={{ display: 'none' }}
              />

              {cForm.image && (
                <div className="uploaded-image-preview-card">
                  <img src={cForm.image} alt="Xem trước ảnh khóa học" />
                </div>
              )}
            </div>
            {courseFormErrors.image && (
              <span className="form-field-error-text">{courseFormErrors.image}</span>
            )}
          </div>

          <div className="form-field-group">
            <label>Mô tả chi tiết khóa học</label>
            <div className="markdown-editor-container-wrapper">
              <MDXEditor
                key={editCourse ? editCourse.id : 'new'}
                markdown={cForm.desc || ''}
                onChange={val => setCForm(p => ({ ...p, desc: val }))}
                plugins={[
                  headingsPlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  tablePlugin(),
                  markdownShortcutPlugin(),
                  toolbarPlugin({
                    toolbarContents: () => (
                      <>
                        <BlockTypeSelect />
                        <BoldItalicUnderlineToggles />
                        <ListsToggle />
                      </>
                    )
                  })
                ]}
              />
            </div>
          </div>

        </div>

        <div className="modal-footer-section">
          <button className="footer-cancel-btn" onClick={onClose}>Hủy bỏ</button>
          <button className="footer-save-btn" onClick={onSave}>Lưu dữ liệu</button>
        </div>
      </div>
    </div>
  );
}
