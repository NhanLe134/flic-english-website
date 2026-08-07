import "./PheDuyetKhoaHoc.css";
import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import type { Course, LopHoc, Teacher } from "./kieuDuLieu";
import { serializeSchedule } from "./hangSo";

// Import các component con đã tách rời
import KhoaHocRow from "./components/KhoaHocRow";
import KhoaHocModal from "./components/KhoaHocModal";
import ThemLopHocModal from "./components/ThemLopHocModal";
import SuaLopHocModal from "./components/SuaLopHocModal";
import ChiTietLopHocModal from "./components/ChiTietLopHocModal";
import XoaXacNhanModal from "./components/XoaXacNhanModal";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

// Component hiển thị thông báo Toast nhanh
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="toast-message">✓ {msg}</div>;
}

export default function PheDuyetKhoaHoc() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Quản lý trạng thái mở rộng khóa học
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [classesMap, setClassesMap] = useState<Record<number, LopHoc[]>>({});
  const [courseDetailsMap, setCourseDetailsMap] = useState<Record<number, Array<{ MaLop: number; TenLop: string }>>>({});

  // Trạng thái cho modal khóa học
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [cForm, setCForm] = useState({ title: '', desc: '', level: 'TOEIC', category: 'Luyện thi', image: '' });
  const [formLevels, setFormLevels] = useState<string[]>([]);
  const [formNewLevelInput, setFormNewLevelInput] = useState("");
  const [courseFormErrors, setCourseFormErrors] = useState({ title: '', levels: '', levelInput: '', skills: '', image: '' });
  const [courseSkills, setCourseSkills] = useState<string[]>([]);

  // Trạng thái cho modal thêm lớp học
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassForm, setNewClassForm] = useState({
    name: '', schedule: '', days: '', daySchedules: {} as Record<string, { startTime: string; endTime: string }>,
    maxStudents: 30, maLop: 0, teachers: {} as Record<number, number>
  });
  const [addClassErrors, setAddClassErrors] = useState({ name: '', maLop: '', maxStudents: '' });

  // Trạng thái chỉnh sửa trình độ
  const [editingLevelIndex, setEditingLevelIndex] = useState<number | null>(null);
  const [editingLevelValue, setEditingLevelValue] = useState("");
  const [newLevelInput, setNewLevelInput] = useState("");
  const [addLevelError, setAddLevelError] = useState("");
  const editLevelWrapperRef = useRef<HTMLDivElement>(null);

  // Trạng thái sửa lớp học
  const [showClassEditModal, setShowClassEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<LopHoc | null>(null);
  const [classEditForm, setClassEditForm] = useState({
    name: '', schedule: '', days: '', daySchedules: {} as Record<string, { startTime: string; endTime: string }>,
    maxStudents: 30, status: 'Chưa bắt đầu', maLop: 0, teachers: {} as Record<number, number>
  });
  const [editClassErrors, setEditClassErrors] = useState({ name: '', maLop: '', maxStudents: '' });

  // Trạng thái xem chi tiết lớp học
  const [showClassDetailModal, setShowClassDetailModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<LopHoc | null>(null);
  const [selectedClassAssignments, setSelectedClassAssignments] = useState<any[]>([]);

  // Trạng thái xác nhận xóa
  const [deletingClass, setDeletingClass] = useState<LopHoc | null>(null);
  const [deletingLevelInfo, setDeletingLevelInfo] = useState<{ course: Course; levelName: string; index: number; maLop: number } | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  // Tải danh sách khóa học
  const loadCourses = () => {
    setLoading(true);
    fetch(`${API}/admin/khoahoc?all=true`)
      .then(r => r.json())
      .then(data => {
        setCourses(data.map((c: any) => ({
          id: c.MaKhoaHoc, title: c.TenKhoaHoc, desc: c.MoTa || '', level: c.TrinhDo || '', status: c.TrangThai || 'Ẩn',
          created: c.NgayTao ? new Date(c.NgayTao).toLocaleDateString('vi-VN') : '—', category: c.DanhMuc || 'Luyện thi',
          classCount: c.SoLop || 0, Listening: !!c.Listening, Reading: !!c.Reading, Speaking: !!c.Speaking, Writing: !!c.Writing, HinhAnh: c.HinhAnh || ''
        })));
      })
      .catch(() => setToast('Lỗi tải danh sách khóa học'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
    fetch(`${API}/qtv/giangvien`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTeachersList(data); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetch(`${API}/qtv/lophoc/${selectedClass.id}/giangvien`)
        .then(r => r.json())
        .then(data => setSelectedClassAssignments(Array.isArray(data) ? data : []))
        .catch(() => setSelectedClassAssignments([]));
    } else {
      setSelectedClassAssignments([]);
    }
  }, [selectedClass]);

  const loadClassesForCourse = (courseId: number) => {
    fetch(`${API}/course-detail/${courseId}/classes`)
      .then(r => r.json())
      .then(data => {
        const mapped = data.map((c: any) => ({
          id: c.MaLopHoc, name: c.TenLop, schedule: c.LichHoc || '—', students: c.SoLuongHocVien || 0,
          maxStudents: c.SiSoToiDa, progress: c.TienDo || 0, lessonCount: c.SoBuoiHoc || 0,
          completed: c.TrangThai === "Đã hoàn thành", status: c.TrangThai || 'Chưa bắt đầu', maLop: c.MaLop
        }));
        mapped.sort((a: any, b: any) => b.id - a.id);
        setClassesMap(prev => ({ ...prev, [courseId]: mapped }));
      })
      .catch(() => { });
  };

  const loadCourseDetails = (courseId: number) => {
    fetch(`${API}/courses/${courseId}/details`)
      .then(r => r.json())
      .then(data => { if (data && Array.isArray(data)) setCourseDetailsMap(prev => ({ ...prev, [courseId]: data })); })
      .catch(() => { });
  };

  const toggleExpandCourse = (courseId: number) => {
    setAddLevelError("");
    setNewLevelInput("");
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      setEditingLevelIndex(null);
      return;
    }
    setExpandedCourse(courseId);
    setEditingLevelIndex(null);
    loadClassesForCourse(courseId);
    loadCourseDetails(courseId);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (editingLevelIndex !== null && editLevelWrapperRef.current && !editLevelWrapperRef.current.contains(e.target as Node)) {
        setEditingLevelIndex(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [editingLevelIndex]);

  // Thao tác chỉnh sửa/thêm khóa học
  const openAddCourse = () => {
    setCForm({ title: '', desc: '', level: '', category: 'Luyện thi', image: '' });
    setEditCourse(null);
    setFormLevels([]);
    setFormNewLevelInput("");
    setCourseSkills([]);
    setCourseFormErrors({ title: '', levels: '', levelInput: '', skills: '', image: '' });
    setShowCourseModal(true);
  };

  const openEditCourse = (c: Course) => {
    const list = c.level ? c.level.split(',').map(s => s.trim()).filter(Boolean) : [];
    setCForm({ title: c.title, desc: c.desc, level: '', category: c.category, image: c.HinhAnh || '' });
    setEditCourse(c);
    setFormLevels(list);
    setFormNewLevelInput("");
    const skillsList = [];
    if (c.Listening) skillsList.push('Listening');
    if (c.Reading) skillsList.push('Reading');
    if (c.Speaking) skillsList.push('Speaking');
    if (c.Writing) skillsList.push('Writing');
    setCourseSkills(skillsList);
    setCourseFormErrors({ title: '', levels: '', levelInput: '', skills: '', image: '' });
    setShowCourseModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    fetch(`${API}/upload`, { method: "POST", body: formData })
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          setCForm(prev => ({ ...prev, image: data.url }));
          setCourseFormErrors(prev => ({ ...prev, image: "" }));
        }
      })
      .catch(() => setToast("Lỗi tải ảnh lên hệ thống!"));
  };

  const saveCourse = async () => {
    const errors = { title: '', levels: '', levelInput: '', skills: '', image: '' };
    if (!cForm.title.trim()) errors.title = 'Vui lòng nhập tên khóa học!';
    if (formLevels.length === 0) errors.levels = 'Vui lòng thêm ít nhất một trình độ!';
    if (courseSkills.length === 0) errors.skills = 'Vui lòng chọn ít nhất một kỹ năng!';
    if (!cForm.image) errors.image = 'Vui lòng tải lên ảnh khóa học!';
    if (errors.title || errors.levels || errors.skills || errors.image) {
      setCourseFormErrors(errors);
      return;
    }

    const finalLevel = formLevels.join(', ');
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    try {
      let courseId = editCourse?.id;
      if (editCourse) {
        await fetch(`${API}/admin/khoahoc/${editCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            TenKhoaHoc: cForm.title, MoTa: cForm.desc, TrinhDo: finalLevel, HinhAnh: cForm.image,
            Listening: courseSkills.includes('Listening') ? 1 : 0,
            Reading: courseSkills.includes('Reading') ? 1 : 0,
            Speaking: courseSkills.includes('Speaking') ? 1 : 0,
            Writing: courseSkills.includes('Writing') ? 1 : 0,
          })
        });
        setToast('Đã cập nhật thông tin khóa học!');
      } else {
        const res = await fetch(`${API}/qtv/khoahoc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            TenKhoaHoc: cForm.title, MoTa: cForm.desc, TrinhDo: finalLevel, MaNguoiDung: user.MaNguoiDung || 6, HinhAnh: cForm.image,
            Listening: courseSkills.includes('Listening') ? 1 : 0,
            Reading: courseSkills.includes('Reading') ? 1 : 0,
            Speaking: courseSkills.includes('Speaking') ? 1 : 0,
            Writing: courseSkills.includes('Writing') ? 1 : 0,
          })
        });
        const data = await res.json();
        courseId = data.MaKhoaHoc;
        for (const lvl of formLevels) {
          await fetch(`${API}/qtv/khoahocchitiet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ TenLop: lvl, MoTa: cForm.desc, MaKhoaHoc: courseId })
          });
        }
        setToast('Đã tạo khóa học mới thành công!');
      }
      setShowCourseModal(false);
      setEditCourse(null);
      loadCourses();
      if (courseId) {
        setClassesMap(prev => { const n = { ...prev }; delete n[courseId]; return n; });
      }
    } catch {
      alert('Gặp lỗi khi xử lý dữ liệu khóa học');
    }
  };

  const toggleCourseVisibility = async (courseId: number, currentStatus: string) => {
    const isVisible = currentStatus === 'Hiển thị' || currentStatus === 'Đã duyệt' || currentStatus === 'Hoạt động';
    const newStatus = isVisible ? 'Ẩn' : 'Hiển thị';
    try {
      await fetch(`${API}/admin/khoahoc/${courseId}/duyet`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TrangThai: newStatus })
      });
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: newStatus } : c));
      setToast(isVisible ? "Đã ẩn khóa học khỏi trang chủ!" : "Đã hiển thị khóa học lên trang chủ!");
    } catch {
      alert("Lỗi khi cập nhật trạng thái hiển thị");
    }
  };

  // Trình độ khóa học inline
  const saveCourseLevel = async (course: Course, newLevelName: string, maLop: number) => {
    if (!newLevelName.trim()) return;
    try {
      await fetch(`${API}/qtv/khoahocchitiet/${maLop}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TenLop: newLevelName })
      });
      setToast("Đã cập nhật trình độ khóa học thành công!");
      setEditingLevelIndex(null);
      loadCourseDetails(course.id);
      loadCourses();
    } catch {
      alert("Lỗi khi cập nhật trình độ");
    }
  };

  const addCourseLevel = async (course: Course, levelName: string) => {
    try {
      await fetch(`${API}/qtv/khoahocchitiet`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TenLop: levelName, MoTa: course.desc, MaKhoaHoc: course.id })
      });
      setToast("Đã thêm trình độ mới thành công!");
      setNewLevelInput("");
      setAddLevelError("");
      loadCourseDetails(course.id);
      loadCourses();
    } catch {
      alert("Lỗi khi thêm trình độ");
    }
  };

  // Thêm/Sửa lớp học
  const saveNewClass = async () => {
    if (!newClassForm.name.trim() || !newClassForm.maLop) {
      setAddClassErrors({
        name: !newClassForm.name.trim() ? "Vui lòng nhập tên lớp!" : "",
        maLop: !newClassForm.maLop ? "Vui lòng chọn trình độ!" : "",
        maxStudents: ""
      });
      return;
    }
    try {
      const finalSchedule = serializeSchedule(newClassForm.days, newClassForm.daySchedules);
      await fetch(`${API}/qtv/lophoc`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TenLop: newClassForm.name, MaLop: newClassForm.maLop, LichHoc: finalSchedule, SoLuongHocVien: null, teachers: newClassForm.teachers })
      });
      setToast("Đã tạo lớp học mới thành công!");
      setShowAddClassModal(false);
      setNewClassForm({ name: '', schedule: '', days: '', daySchedules: {}, maxStudents: 30, maLop: 0, teachers: {} });
      if (expandedCourse) loadClassesForCourse(expandedCourse);
    } catch {
      alert("Lỗi khi tạo lớp học");
    }
  };

  const openEditClass = (cls: LopHoc) => {
    setEditingClass(cls);
    const parts = (cls.schedule || '').split('·').map(p => p.trim());
    const daySchedules: Record<string, { startTime: string; endTime: string }> = {};
    const selectedDays: string[] = [];
    parts.forEach(part => {
      const match = part.match(/^(.+?)\s*\(([^)]+)\)$/);
      if (match) {
        const day = match[1].trim();
        const times = match[2].trim().split('-');
        selectedDays.push(day);
        daySchedules[day] = { startTime: times[0] || '07:00', endTime: times[1] || '08:30' };
      }
    });

    setClassEditForm({
      name: cls.name, schedule: cls.schedule, days: selectedDays.join(', '), daySchedules, maxStudents: cls.maxStudents, status: cls.status, maLop: cls.maLop || 0, teachers: {}
    });

    fetch(`${API}/qtv/lophoc/${cls.id}/giangvien`)
      .then(r => r.json())
      .then(data => {
        const teacherMap: Record<number, number> = {};
        if (Array.isArray(data)) data.forEach((item: any) => { teacherMap[item.MaKyNang] = item.MaGiangVien; });
        setClassEditForm(p => ({ ...p, teachers: teacherMap }));
      })
      .catch(() => { });
    setShowClassEditModal(true);
  };

  const saveEditedClass = async () => {
    if (!editingClass || !classEditForm.name.trim() || !classEditForm.maLop) {
      setEditClassErrors({
        name: !classEditForm.name.trim() ? "Vui lòng nhập tên lớp!" : "",
        maLop: !classEditForm.maLop ? "Vui lòng chọn trình độ!" : "",
        maxStudents: ""
      });
      return;
    }
    try {
      const finalSchedule = serializeSchedule(classEditForm.days, classEditForm.daySchedules);
      await fetch(`${API}/qtv/lophoc/${editingClass.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TenLop: classEditForm.name, LichHoc: finalSchedule, SoLuongHocVien: null, TrangThai: classEditForm.status, MaLop: classEditForm.maLop, teachers: classEditForm.teachers })
      });
      setToast("Đã cập nhật lớp học thành công!");
      setShowClassEditModal(false);
      setEditingClass(null);
      if (expandedCourse) loadClassesForCourse(expandedCourse);
    } catch {
      alert("Lỗi khi cập nhật lớp học");
    }
  };

  // Xác nhận xóa
  const confirmDeleteClass = async (id: number) => {
    try {
      await fetch(`${API}/qtv/lophoc/${id}`, { method: 'DELETE' });
      setToast("Đã xóa lớp học thành công!");
      setDeletingClass(null);
      setShowClassDetailModal(false);
      setSelectedClass(null);
      if (expandedCourse) loadClassesForCourse(expandedCourse);
    } catch {
      alert("Lỗi khi xóa lớp học");
    }
  };

  const confirmDeleteLevel = async (maLop: number) => {
    try {
      await fetch(`${API}/qtv/khoahocchitiet/${maLop}`, { method: 'DELETE' });
      setToast("Đã xóa trình độ thành công!");
      setDeletingLevelInfo(null);
      if (expandedCourse) {
        loadCourseDetails(expandedCourse);
        loadClassesForCourse(expandedCourse);
      }
      loadCourses();
    } catch {
      alert("Lỗi khi xóa trình độ");
    }
  };

  const confirmDeleteCourse = async (id: number) => {
    try {
      await fetch(`${API}/admin/khoahoc/${id}`, { method: 'DELETE' });
      setToast("Đã xóa khóa học thành công!");
      setDeletingCourse(null);
      loadCourses();
    } catch {
      alert("Lỗi khi xóa khóa học");
    }
  };

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="manage-courses-page">
      <div className="page-header-container">
        <div>
          <h1>Quản lý khóa học</h1>
          <p>Thêm mới, chỉnh sửa thông tin, xóa và quản lý các lớp học trực thuộc của các khóa học</p>
        </div>
        <button className="add-course-btn-primary" onClick={openAddCourse}>
          + Thêm khóa học mới
        </button>
      </div>

      <div className="search-bar-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm tên khóa học hoặc trình độ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="courses-table-container">
        {loading ? (
          <div className="loading-container">Đang tải dữ liệu khóa học...</div>
        ) : (
          <table className="courses-table">
            <thead>
              <tr>
                <th>TÊN KHÓA HỌC</th>
                <th>NGÀY TẠO</th>
                <th>HIỂN THỊ</th>
                <th>SỐ LỚP HỌC</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr><td colSpan={5} className="table-empty-message">Không tìm thấy khóa học nào phù hợp.</td></tr>
              ) : (
                filteredCourses.map((course, idx) => (
                  <KhoaHocRow
                    key={course.id} course={course} index={idx} expandedCourse={expandedCourse} toggleExpandCourse={toggleExpandCourse}
                    classesMap={classesMap} courseDetailsMap={courseDetailsMap} editingLevelIndex={editingLevelIndex} setEditingLevelIndex={setEditingLevelIndex}
                    editingLevelValue={editingLevelValue} setEditingLevelValue={setEditingLevelValue} editLevelWrapperRef={editLevelWrapperRef}
                    newLevelInput={newLevelInput} setNewLevelInput={setNewLevelInput} addLevelError={addLevelError} setAddLevelError={setAddLevelError}
                    toggleCourseVisibility={toggleCourseVisibility} openEditCourse={openEditCourse} startDelete={setDeletingCourse}
                    saveCourseLevel={saveCourseLevel} setDeletingLevelInfo={setDeletingLevelInfo} addCourseLevel={addCourseLevel}
                    setNewClassForm={setNewClassForm} setAddClassErrors={setAddClassErrors} setShowAddClassModal={setShowAddClassModal}
                    setSelectedClass={setSelectedClass} setShowClassDetailModal={setShowClassDetailModal}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <KhoaHocModal
        show={showCourseModal} editCourse={editCourse} cForm={cForm} setCForm={setCForm}
        formLevels={formLevels} setFormLevels={setFormLevels} formNewLevelInput={formNewLevelInput} setFormNewLevelInput={setFormNewLevelInput}
        courseFormErrors={courseFormErrors} setCourseFormErrors={setCourseFormErrors} courseSkills={courseSkills} setCourseSkills={setCourseSkills}
        onClose={() => { setShowCourseModal(false); setEditCourse(null); }} onSave={saveCourse} handleImageUpload={handleImageUpload}
      />

      <ThemLopHocModal
        show={showAddClassModal} expandedCourse={expandedCourse} courses={courses} courseDetailsMap={courseDetailsMap}
        newClassForm={newClassForm} setNewClassForm={setNewClassForm} addClassErrors={addClassErrors} setAddClassErrors={setAddClassErrors}
        teachersList={teachersList} onClose={() => setShowAddClassModal(false)} onSave={saveNewClass}
      />

      <SuaLopHocModal
        show={showClassEditModal} editingClass={editingClass} expandedCourse={expandedCourse} courses={courses} courseDetailsMap={courseDetailsMap}
        classEditForm={classEditForm} setClassEditForm={setClassEditForm} editClassErrors={editClassErrors} setEditClassErrors={setEditClassErrors}
        teachersList={teachersList} onClose={() => { setShowClassEditModal(false); setEditingClass(null); }} onSave={saveEditedClass}
      />

      <ChiTietLopHocModal
        show={showClassDetailModal} selectedClass={selectedClass} selectedClassAssignments={selectedClassAssignments}
        onClose={() => { setShowClassDetailModal(false); setSelectedClass(null); }}
        onEditClick={() => { openEditClass(selectedClass!); setShowClassDetailModal(false); }}
        onDeleteClick={() => { setDeletingClass(selectedClass); setShowClassDetailModal(false); }}
      />

      <XoaXacNhanModal
        deletingClass={deletingClass} deletingLevelInfo={deletingLevelInfo} deletingCourse={deletingCourse}
        onCancelDeleteClass={() => setDeletingClass(null)} onConfirmDeleteClass={confirmDeleteClass}
        onCancelDeleteLevel={() => setDeletingLevelInfo(null)} onConfirmDeleteLevel={confirmDeleteLevel}
        onCancelDeleteCourse={() => setDeletingCourse(null)} onConfirmDeleteCourse={confirmDeleteCourse}
      />

      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
    </div>
  );
}
