import "./approveAdmin.css";
import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiAlertTriangle } from "react-icons/fi";

const API = "http://localhost:5000";

const CATS = ['Cơ bản', 'Luyện thi', 'Giao tiếp', 'Ngữ pháp', 'Từ vựng', 'Kỹ năng'];
const DAYS_OF_WEEK = [
  { label: 'T2', value: 'Thứ 2' },
  { label: 'T3', value: 'Thứ 3' },
  { label: 'T4', value: 'Thứ 4' },
  { label: 'T5', value: 'Thứ 5' },
  { label: 'T6', value: 'Thứ 6' },
  { label: 'T7', value: 'Thứ 7' },
  { label: 'CN', value: 'Chủ nhật' },
];

const formatSchedule = (selectedDays: string[]) => {
  if (selectedDays.length === 0) return '';
  const sorted = [...selectedDays].sort((a, b) => {
    const idxA = DAYS_OF_WEEK.findIndex(d => d.value === a);
    const idxB = DAYS_OF_WEEK.findIndex(d => d.value === b);
    return idxA - idxB;
  });

  if (sorted.length === 1) return sorted[0];

  const thuNums = sorted.filter(d => d !== 'Chủ nhật').map(d => d.replace('Thứ ', ''));
  const hasCN = sorted.includes('Chủ nhật');

  if (!hasCN) {
    const lastThu = thuNums[thuNums.length - 1];
    const otherThus = thuNums.slice(0, -1).join(', ');
    return `Thứ ${otherThus} & ${lastThu}`;
  } else {
    if (thuNums.length === 0) return 'Chủ nhật';
    if (thuNums.length === 1) return `Thứ ${thuNums[0]} & Chủ nhật`;
    return `Thứ ${thuNums.join(', ')} & Chủ nhật`;
  }
};

const getSelectedDaysFromSchedule = (schedule: string): string[] => {
  if (!schedule) return [];
  const days: string[] = [];
  if (schedule.includes('Chủ nhật')) {
    days.push('Chủ nhật');
  }
  const match = schedule.match(/Thứ\s+([^&]+)/);
  if (match) {
    const parts = match[1].split(',').map(s => s.trim());
    parts.forEach(p => {
      if (p.includes('&')) {
        p.split('&').forEach(sp => {
          const clean = sp.trim();
          if (clean && !isNaN(Number(clean))) {
            days.push(`Thứ ${clean}`);
          }
        });
      } else {
        if (p && !isNaN(Number(p))) {
          days.push(`Thứ ${p}`);
        }
      }
    });
  }
  const lastMatch = schedule.match(/&\s*(\d+)/);
  if (lastMatch) {
    const num = lastMatch[1];
    if (!days.includes(`Thứ ${num}`)) {
      days.push(`Thứ ${num}`);
    }
  }
  return days;
};

const toggleDayInSchedule = (day: string, currentSchedule: string) => {
  const days = getSelectedDaysFromSchedule(currentSchedule);
  let newDays = [];
  if (days.includes(day)) {
    newDays = days.filter(d => d !== day);
  } else {
    newDays = [...days, day];
  }
  return formatSchedule(newDays);
};

interface Course {
  id: number;
  title: string;
  desc: string;
  level: string;
  status: string;
  created: string;
  category: string;
  classCount: number;
}

interface LopHoc {
  id: number;
  name: string;
  schedule: string;
  students: number;
  progress: number;
  lessonCount: number;
}



function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="toast-message">✓ {msg}</div>;
}

export default function ApproveAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Mở rộng lớp học
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [classesMap, setClassesMap] = useState<Record<number, LopHoc[]>>({});

  // Modal Thêm/Sửa khóa học
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [cForm, setCForm] = useState({ title: '', desc: '', level: 'TOEIC', category: 'Luyện thi' });
  const [formLevels, setFormLevels] = useState<string[]>([]);
  const [formNewLevelInput, setFormNewLevelInput] = useState("");

  // Bản đồ lưu MaLop theo MaKhoaHoc
  const [courseDetailsMap, setCourseDetailsMap] = useState<Record<number, { maLop: number }>>({});

  // Modal Thêm lớp học mới từ danh sách mở rộng
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassForm, setNewClassForm] = useState({ name: '', schedule: '', maxStudents: 30 });

  // State chỉnh sửa trình độ inline của từng khóa học
  const [editingLevelIndex, setEditingLevelIndex] = useState<number | null>(null);
  const [editingLevelValue, setEditingLevelValue] = useState("");
  const [newLevelInput, setNewLevelInput] = useState("");

  // Modal Chỉnh sửa lớp học trực tiếp
  const [showClassEditModal, setShowClassEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<LopHoc | null>(null);
  const [classEditForm, setClassEditForm] = useState({ name: '', schedule: '', maxStudents: 30 });

  // Modal Xác nhận xóa lớp học
  const [deletingClass, setDeletingClass] = useState<LopHoc | null>(null);

  // Modal Xác nhận xóa đếm ngược
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadCourses = () => {
    setLoading(true);
    fetch(`${API}/admin/khoahoc`)
      .then(r => r.json())
      .then(data => {
        setCourses(data.map((c: any) => ({
          id: c.MaKhoaHoc,
          title: c.TenKhoaHoc,
          desc: c.MoTa || '',
          level: c.TrinhDo || '',
          status: c.TrangThai || 'Pending',
          created: c.NgayTao ? new Date(c.NgayTao).toLocaleDateString('vi-VN') : '—',
          category: c.DanhMuc || 'Luyện thi',
          classCount: c.SoLop || 0
        })));
      })
      .catch(() => setToast('Lỗi tải danh sách khóa học'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const loadClassesForCourse = (courseId: number) => {
    fetch(`${API}/course-detail/${courseId}/classes`)
      .then(r => r.json())
      .then(data => {
        const mapped: LopHoc[] = data.map((c: any) => ({
          id: c.MaLopHoc,
          name: c.TenLop,
          schedule: c.LichHoc || '—',
          students: c.SoLuongHocVien || 0,
          progress: c.TienDo || 0,
          lessonCount: c.SoBuoiHoc || 0
        }));
        // Sắp xếp lớp mới nhất lên đầu
        mapped.sort((a, b) => b.id - a.id);
        setClassesMap(prev => ({ ...prev, [courseId]: mapped }));
      })
      .catch(() => { });
  };

  const loadCourseDetails = (courseId: number) => {
    fetch(`${API}/courses/${courseId}/details`)
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          const maLop = data[0].MaLop;
          setCourseDetailsMap(prev => ({ ...prev, [courseId]: { maLop } }));
        }
      })
      .catch(() => {});
  };

  const toggleExpandCourse = (courseId: number) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      setEditingLevelIndex(null); // Reset inline edit when collapsing
      return;
    }
    setExpandedCourse(courseId);
    loadClassesForCourse(courseId);
    loadCourseDetails(courseId);
  };

  // ── Thao tác Form Thêm/Sửa khóa học ──
  const openAddCourse = () => {
    setCForm({ title: '', desc: '', level: '', category: 'Luyện thi' });
    setEditCourse(null);
    setFormLevels([]);
    setFormNewLevelInput("");
    setShowCourseModal(true);
  };

  const openEditCourse = (c: Course) => {
    const list = c.level ? c.level.split(',').map(s => s.trim()).filter(Boolean) : [];
    setCForm({ title: c.title, desc: c.desc, level: '', category: c.category });
    setEditCourse(c);
    setFormLevels(list);
    setFormNewLevelInput("");
    setShowCourseModal(true);
  };



  const saveCourse = async () => {
    if (!cForm.title.trim()) {
      alert('Vui lòng nhập tên khóa học!');
      return;
    }
    const finalLevel = formLevels.join(', ');
    if (!finalLevel.trim()) {
      alert('Vui lòng nhập hoặc thêm ít nhất một trình độ cho khóa học!');
      return;
    }
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');

    try {
      let courseId = editCourse?.id;

      if (editCourse) {
        await fetch(`${API}/admin/khoahoc/${editCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ TenKhoaHoc: cForm.title, MoTa: cForm.desc, TrinhDo: finalLevel })
        });
        setToast('Đã cập nhật thông tin khóa học!');
      } else {
        // Tạo khóa học mới, mặc định ẩn (false) -> TrangThai = 'Pending'
        const res = await fetch(`${API}/qtv/khoahoc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            TenKhoaHoc: cForm.title,
            MoTa: cForm.desc,
            TrinhDo: finalLevel,
            MaNguoiDung: user.MaNguoiDung || 6
          })
        });
        const data = await res.json();
        courseId = data.MaKhoaHoc;

        // Tạo khóa học chi tiết chi tiết
        await fetch(`${API}/qtv/khoahocchitiet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ TenLop: cForm.title, MoTa: cForm.desc, MaKhoaHoc: courseId })
        });
        setToast('Đã tạo khóa học mới thành công!');
      }

      setShowCourseModal(false);
      setEditCourse(null);
      loadCourses();

      if (courseId) {
        setClassesMap(prev => {
          const n = { ...prev };
          delete n[courseId];
          return n;
        });
      }
    } catch (err) {
      alert('Gặp lỗi khi xử lý dữ liệu khóa học');
    }
  };

  // ── Toggle Trạng thái hiển thị ──
  const toggleCourseVisibility = async (courseId: number, currentStatus: string) => {
    const isVisible = currentStatus === 'Đã duyệt' || currentStatus === 'Hoạt động';
    const newStatus = isVisible ? 'Ẩn' : 'Đã duyệt';
    try {
      await fetch(`${API}/admin/khoahoc/${courseId}/duyet`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TrangThai: newStatus })
      });
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: newStatus } : c));
      setToast(isVisible ? "Đã ẩn khóa học khỏi trang chủ!" : "Đã hiển thị khóa học lên trang chủ!");
    } catch {
      alert("Lỗi khi cập nhật trạng thái hiển thị");
    }
  };

  // ── Sửa lớp học trực tiếp ──
  const openEditClass = (cls: LopHoc) => {
    setEditingClass(cls);
    setClassEditForm({ name: cls.name, schedule: cls.schedule, maxStudents: cls.students });
    setShowClassEditModal(true);
  };

  const saveEditedClass = async () => {
    if (!classEditForm.name.trim()) {
      alert("Vui lòng nhập tên lớp học!");
      return;
    }
    if (!editingClass) return;
    try {
      await fetch(`${API}/qtv/lophoc/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenLop: classEditForm.name,
          LichHoc: classEditForm.schedule,
          SoLuongHocVien: classEditForm.maxStudents
        })
      });
      setToast("Đã cập nhật lớp học thành công!");
      setShowClassEditModal(false);
      setEditingClass(null);
      if (expandedCourse) {
        loadClassesForCourse(expandedCourse);
      }
    } catch {
      alert("Lỗi khi cập nhật lớp học");
    }
  };

  // ── Lưu trình độ khóa học inline ──
  const saveCourseLevel = async (course: Course, newLevel: string) => {
    if (!newLevel.trim()) {
      alert("Vui lòng nhập hoặc chọn trình độ!");
      return;
    }
    try {
      await fetch(`${API}/admin/khoahoc/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenKhoaHoc: course.title,
          MoTa: course.desc,
          TrinhDo: newLevel
        })
      });
      setToast("Đã cập nhật trình độ khóa học thành công!");
      setEditingLevelIndex(null);
      loadCourses();
    } catch {
      alert("Lỗi khi cập nhật trình độ");
    }
  };

  // ── Lưu lớp học mới ──
  const saveNewClass = async () => {
    if (!newClassForm.name.trim()) {
      alert("Vui lòng nhập tên lớp học!");
      return;
    }
    const details = courseDetailsMap[expandedCourse || 0];
    if (!details || !details.maLop) {
      alert("Đang tải chi tiết khóa học, vui lòng đợi vài giây và thử lại!");
      return;
    }
    try {
      await fetch(`${API}/qtv/lophoc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenLop: newClassForm.name,
          MaLop: details.maLop,
          LichHoc: newClassForm.schedule,
          SoLuongHocVien: newClassForm.maxStudents
        })
      });
      setToast("Đã tạo lớp học mới thành công!");
      setShowAddClassModal(false);
      setNewClassForm({ name: '', schedule: '', maxStudents: 30 });
      if (expandedCourse) {
        loadClassesForCourse(expandedCourse);
        loadCourses(); // Cập nhật số lớp hiển thị
      }
    } catch {
      alert("Lỗi khi thêm lớp học");
    }
  };

  // ── Xóa lớp học trực tiếp ──
  const deleteClass = async (classId: number) => {
    try {
      await fetch(`${API}/qtv/lophoc/${classId}`, { method: 'DELETE' });
      setToast("Đã xóa lớp học!");
      setDeletingClass(null);
      if (expandedCourse) {
        loadClassesForCourse(expandedCourse);
      }
      loadCourses(); // Cập nhật số lượng lớp hiển thị ở dòng khóa học
    } catch {
      alert("Lỗi khi xóa lớp học");
    }
  };

  // ── Xử lý Xóa khóa học đếm ngược ──
  const startDelete = (c: Course) => {
    setDeletingCourse(c);
    setCountdown(null);
  };

  const confirmDelete = () => {
    setCountdown(5);
  };

  const cancelDelete = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setCountdown(null);
    setDeletingCourse(null);
  };

  const executeDelete = async (id: number) => {
    try {
      await fetch(`${API}/qtv/khoahoc/${id}`, { method: 'DELETE' });
      setToast(`Đã xóa hoàn toàn khóa học và thông tin liên quan!`);
      setDeletingCourse(null);
      setCountdown(null);
      loadCourses();
    } catch {
      alert("Lỗi khi kết nối để xóa khóa học.");
      cancelDelete();
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      if (deletingCourse) {
        executeDelete(deletingCourse.id);
      }
      return;
    }
    timerRef.current = setTimeout(() => {
      setCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown, deletingCourse]);

  // Filter tìm kiếm
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.level.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="manage-courses-page">
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      <div className="page-header-container">
        <div>
          <h1>Quản lý khóa học</h1>
          <p>Thêm mới, chỉnh sửa thông tin, xóa và quản lý các lớp học trực thuộc của các khóa học</p>
        </div>
        <button className="add-course-btn-primary" onClick={openAddCourse}>
          <FiPlus size={16} style={{ marginRight: 6 }} /> Thêm khóa học mới
        </button>
      </div>

      <div className="search-bar-wrapper">
        <FiSearch className="search-icon" />
        <input
          placeholder="Tìm tên khóa học hoặc trình độ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="courses-table-container">
        {loading ? (
          <div className="loading-container">Đang tải danh sách khóa học...</div>
        ) : (
          <table className="courses-table">
            <thead>
              <tr>
                <th>TÊN KHÓA HỌC</th>
                <th>NGÀY TẠO</th>
                <th>HIỂN THỊ</th>
                <th>LỚP HỌC</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                    Không tìm thấy khóa học nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCourses.map(course => {
                  const isExpanded = expandedCourse === course.id;
                  const classes = classesMap[course.id] || [];
                  const isVisible = course.status === 'Đã duyệt' || course.status === 'Hoạt động';

                  return (
                    <React.Fragment key={course.id}>
                      <tr className="course-row" onClick={() => toggleExpandCourse(course.id)}>
                        <td>
                          <div className="course-title-flex-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span className="course-title-cell" style={{ marginBottom: 0 }}>{course.title}</span>
                            {course.level && course.level.split(',').map((lvl, idx) => {
                              const cleanLvl = lvl.trim();
                              if (!cleanLvl) return null;
                              return (
                                <span key={idx} className="course-row-level-badge">
                                  {cleanLvl}
                                </span>
                              );
                            })}
                          </div>
                          <div className="course-desc-cell">{course.desc.slice(0, 85)}{course.desc.length > 85 ? '...' : ''}</div>
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
                                    const currentLevels = course.level ? course.level.split(',').map(s => s.trim()).filter(Boolean) : [];
                                    if (currentLevels.length === 0) {
                                      return <p className="no-levels-text" style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 12px 0', textAlign: 'left' }}>Chưa có trình độ nào được thiết lập.</p>;
                                    }
                                    return (
                                      <div className="levels-items-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                                        {currentLevels.map((lvl, index) => {
                                          const isEditingThis = editingLevelIndex === index;
                                          return (
                                            <div key={index} className="level-item-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', gap: '8px' }}>
                                              {isEditingThis ? (
                                                <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                                                  <input 
                                                    type="text" 
                                                    value={editingLevelValue} 
                                                    onChange={e => setEditingLevelValue(e.target.value)} 
                                                    style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                                                    onKeyDown={e => {
                                                      if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = editingLevelValue.trim();
                                                        if (val) {
                                                          const updated = [...currentLevels];
                                                          updated[index] = val;
                                                          saveCourseLevel(course, updated.join(', '));
                                                          setEditingLevelIndex(null);
                                                        }
                                                      }
                                                    }}
                                                    autoFocus
                                                  />
                                                  <button 
                                                    onClick={() => {
                                                      const val = editingLevelValue.trim();
                                                      if (val) {
                                                        const updated = [...currentLevels];
                                                        updated[index] = val;
                                                        saveCourseLevel(course, updated.join(', '));
                                                        setEditingLevelIndex(null);
                                                      }
                                                    }}
                                                    style={{ border: 'none', background: '#22c55e', color: '#fff', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                                  >
                                                    Lưu
                                                  </button>
                                                  <button 
                                                    onClick={() => setEditingLevelIndex(null)}
                                                    style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#475569', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                                                  >
                                                    Hủy
                                                  </button>
                                                </div>
                                              ) : (
                                                <>
                                                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{lvl}</span>
                                                  <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button 
                                                      onClick={() => {
                                                        setEditingLevelIndex(index);
                                                        setEditingLevelValue(lvl);
                                                      }}
                                                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                                                      title="Sửa tên trình độ"
                                                    >
                                                      <FiEdit2 size={13} />
                                                    </button>
                                                    <button 
                                                      onClick={() => {
                                                        const updated = currentLevels.filter((_, i) => i !== index);
                                                        saveCourseLevel(course, updated.join(', '));
                                                      }}
                                                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
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
                                  
                                  <div className="add-level-inline-form" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '12px', textAlign: 'left' }}>
                                    <label className="form-label-small" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                                      THÊM TRÌNH ĐỘ MỚI
                                    </label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <input 
                                        type="text" 
                                        value={newLevelInput} 
                                        onChange={e => setNewLevelInput(e.target.value)} 
                                        placeholder="Nhập tên trình độ mới..." 
                                        className="level-input-small-inline"
                                        style={{ flex: 1, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const trimmed = newLevelInput.trim();
                                            if (trimmed) {
                                              const currentLevels = course.level ? course.level.split(',').map(s => s.trim()).filter(Boolean) : [];
                                              if (currentLevels.includes(trimmed)) {
                                                alert("Trình độ này đã tồn tại!");
                                                return;
                                              }
                                              const updated = [...currentLevels, trimmed];
                                              saveCourseLevel(course, updated.join(', '));
                                              setNewLevelInput("");
                                            }
                                          }
                                        }}
                                      />
                                      <button 
                                        onClick={() => {
                                          const trimmed = newLevelInput.trim();
                                          if (trimmed) {
                                            const currentLevels = course.level ? course.level.split(',').map(s => s.trim()).filter(Boolean) : [];
                                            if (currentLevels.includes(trimmed)) {
                                              alert("Trình độ này đã tồn tại!");
                                              return;
                                            }
                                            const updated = [...currentLevels, trimmed];
                                            saveCourseLevel(course, updated.join(', '));
                                            setNewLevelInput("");
                                          }
                                        }}
                                        style={{ background: '#f58220', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                                      >
                                        Thêm
                                      </button>
                                    </div>
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
                                      setNewClassForm({ name: '', schedule: '', maxStudents: 30 });
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
                                      <div style={{ flex: 1.5 }}>TÊN LỚP HỌC</div>
                                      <div style={{ flex: 2 }}>LỊCH HỌC</div>
                                      <div style={{ flex: 1 }}>SĨ SỐ</div>
                                      <div style={{ flex: 1 }}>TIẾN ĐỘ</div>
                                      <div style={{ flex: 1 }}>BUỔI HỌC</div>
                                      <div style={{ flex: 1, textAlign: "right" }}>THAO TÁC</div>
                                    </div>
                                    
                                    {classes.map(cls => (
                                      <div key={cls.id} className="classes-list-item-row">
                                        <div style={{ flex: 1.5, fontWeight: 600, color: "#0f172a" }}>{cls.name}</div>
                                        <div style={{ flex: 2, color: "#475569" }}>{cls.schedule}</div>
                                        <div style={{ flex: 1, color: "#475569" }}>{cls.students} học viên</div>
                                        <div style={{ flex: 1 }}>
                                          <span className="class-progress-percent">{cls.progress}%</span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                          <span className="class-lessons-pill">{cls.lessonCount} buổi học</span>
                                        </div>
                                        <div style={{ flex: 1, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                          <button className="class-list-action-btn-edit" onClick={(e) => { e.stopPropagation(); openEditClass(cls); }} title="Sửa lớp">
                                            <FiEdit2 size={13} />
                                          </button>
                                          <button className="class-list-action-btn-delete" onClick={(e) => { e.stopPropagation(); setDeletingClass(cls); }} title="Xóa lớp">
                                            <FiTrash2 size={13} />
                                          </button>
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
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL: TẠO / SỬA KHÓA HỌC ── */}
      {showCourseModal && (
        <div className="modal-backdrop-blur">
          <div className="course-form-modal">
            <div className="modal-header-section">
              <h3>{editCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}</h3>
              <button className="modal-close-icon-btn" onClick={() => { setShowCourseModal(false); setEditCourse(null); }}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-scrollable-body">
              <div className="form-section-title">Thông tin khóa học cơ bản</div>
              <div className="form-field-group">
                <label>Tên khóa học <span className="required-star">*</span></label>
                <input value={cForm.title} onChange={e => setCForm(p => ({ ...p, title: e.target.value }))} placeholder="VD: Luyện thi IELTS 6.5+ mục tiêu" />
              </div>
              <div className="form-field-row">
                <div className="form-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Danh mục</label>
                  <select value={cForm.category} onChange={e => setCForm(p => ({ ...p, category: e.target.value }))}>
                    {CATS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-field-group">
                <label>Trình độ của khóa học (Danh sách trình độ riêng) <span className="required-star">*</span></label>
                
                {formLevels.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 12px 0', textAlign: 'left' }}>Chưa có trình độ nào được thêm cho khóa học này. Hãy nhập ở dưới.</p>
                ) : (
                  <div className="selected-levels-preview-row" style={{ marginTop: '4px' }}>
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

                <div className="custom-level-add-input-row" style={{ marginTop: '8px' }}>
                  <input 
                    type="text" 
                    value={formNewLevelInput} 
                    onChange={(e) => setFormNewLevelInput(e.target.value)} 
                    placeholder="Nhập tên trình độ mới (VD: IELTS 5.5, Beginner, ...)" 
                    className="level-input-small-inline"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = formNewLevelInput.trim();
                        if (trimmed) {
                          if (formLevels.includes(trimmed)) {
                            alert("Trình độ này đã tồn tại!");
                            return;
                          }
                          setFormLevels(prev => [...prev, trimmed]);
                          setFormNewLevelInput("");
                        }
                      }
                    }}
                  />
                  <button 
                    type="button"
                    className="add-custom-level-btn"
                    onClick={() => {
                      const trimmed = formNewLevelInput.trim();
                      if (trimmed) {
                        if (formLevels.includes(trimmed)) {
                          alert("Trình độ này đã tồn tại!");
                          return;
                        }
                        setFormLevels(prev => [...prev, trimmed]);
                        setFormNewLevelInput("");
                      }
                    }}
                    style={{ background: '#f58220', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Thêm
                  </button>
                </div>
              </div>

              <div className="form-field-group">
                <label>Mô tả chi tiết</label>
                <textarea value={cForm.desc} onChange={e => setCForm(p => ({ ...p, desc: e.target.value }))} placeholder="Nội dung chính và mô tả khóa học..." rows={3} />
              </div>

            </div>

            <div className="modal-footer-section">
              <button className="footer-cancel-btn" onClick={() => { setShowCourseModal(false); setEditCourse(null); }}>Hủy bỏ</button>
              <button className="footer-save-btn" onClick={saveCourse}>Lưu dữ liệu</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: THÊM LỚP HỌC MỚI ── */}
      {showAddClassModal && (
        <div className="modal-backdrop-blur z-index-top">
          <div className="course-form-modal" style={{ width: '520px' }}>
            <div className="modal-header-section">
              <h3>Thêm lớp học mới</h3>
              <button className="modal-close-icon-btn" onClick={() => setShowAddClassModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-scrollable-body" style={{ maxHeight: '70vh' }}>
              <div className="form-field-group">
                <label>Tên lớp học <span className="required-star">*</span></label>
                <input 
                  value={newClassForm.name} 
                  onChange={e => setNewClassForm(p => ({ ...p, name: e.target.value }))} 
                  placeholder="VD: Lớp IELTS-01" 
                />
              </div>
              <div className="form-field-group">
                <label>Sĩ số tối đa</label>
                <input 
                  type="number" 
                  min={1} 
                  value={newClassForm.maxStudents} 
                  onChange={e => setNewClassForm(p => ({ ...p, maxStudents: Number(e.target.value) }))} 
                />
              </div>
              <div className="form-field-group">
                <label>Lịch học (Chọn các ngày học trong tuần)</label>
                <div className="weekday-selection-row">
                  {DAYS_OF_WEEK.map(d => {
                    const isSelected = getSelectedDaysFromSchedule(newClassForm.schedule).includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        className={`weekday-btn-choice ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          const newSchedule = toggleDayInSchedule(d.value, newClassForm.schedule);
                          setNewClassForm(p => ({ ...p, schedule: newSchedule }));
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                {newClassForm.schedule && (
                  <div style={{ fontSize: '13px', color: '#f58220', fontWeight: 600, marginTop: '4px', textAlign: 'left' }}>
                    Đã chọn: {newClassForm.schedule}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer-section">
              <button className="footer-cancel-btn" onClick={() => setShowAddClassModal(false)}>Hủy bỏ</button>
              <button className="footer-save-btn" onClick={saveNewClass}>Lưu lớp học</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CHỈNH SỬA LỚP HỌC TRỰC TIẾP ── */}
      {showClassEditModal && editingClass && (
        <div className="modal-backdrop-blur z-index-top">
          <div className="course-form-modal" style={{ width: '480px' }}>
            <div className="modal-header-section">
              <h3>Chỉnh sửa lớp học trực tiếp</h3>
              <button className="modal-close-icon-btn" onClick={() => { setShowClassEditModal(false); setEditingClass(null); }}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-scrollable-body" style={{ maxHeight: '60vh' }}>
              <div className="form-field-group">
                <label>Tên lớp học <span className="required-star">*</span></label>
                <input value={classEditForm.name} onChange={e => setClassEditForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: Lớp IELTS-01" />
              </div>
              <div className="form-field-group">
                <label>Sĩ số tối đa</label>
                <input type="number" min={1} value={classEditForm.maxStudents} onChange={e => setClassEditForm(p => ({ ...p, maxStudents: Number(e.target.value) }))} />
              </div>
              <div className="form-field-group">
                <label>Lịch học (Chọn các ngày học trong tuần)</label>
                <div className="weekday-selection-row">
                  {DAYS_OF_WEEK.map(d => {
                    const isSelected = getSelectedDaysFromSchedule(classEditForm.schedule).includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        className={`weekday-btn-choice ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          const newSchedule = toggleDayInSchedule(d.value, classEditForm.schedule);
                          setClassEditForm(p => ({ ...p, schedule: newSchedule }));
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                {classEditForm.schedule && (
                  <div style={{ fontSize: '13px', color: '#f58220', fontWeight: 600, marginTop: '4px', textAlign: 'left' }}>
                    Đã chọn: {classEditForm.schedule}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer-section">
              <button className="footer-cancel-btn" onClick={() => { setShowClassEditModal(false); setEditingClass(null); }}>Hủy bỏ</button>
              <button className="footer-save-btn" onClick={saveEditedClass}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* ── POPUP: XÓA ĐẾM NGƯỢC 5 GIÂY ── */}
      {deletingCourse && (
        <div className="modal-backdrop-blur z-index-top">
          <div className="delete-confirm-modal-box">
            {countdown === null && <FiAlertTriangle className="delete-modal-warning-icon" size={48} />}
            {countdown === null ? (
              <>
                <h3>Xác nhận xóa khóa học</h3>
                <p className="delete-warning-text">
                  Bạn có chắc chắn muốn xóa khóa học <strong>{deletingCourse.title}</strong>?
                  Nếu xóa khóa học này, tất cả những thông tin liên quan đến khóa học (lớp học, buổi học, tiến trình đăng ký) sẽ bị xóa hoàn toàn.
                </p>
                <div className="delete-modal-actions">
                  <button className="delete-btn-cancel" onClick={cancelDelete}>Hủy</button>
                  <button className="delete-btn-confirm" onClick={confirmDelete}>Xóa</button>
                </div>
              </>
            ) : (
              <>
                <div className="countdown-timer-circle">
                  <span className="countdown-number">{countdown}s</span>
                </div>
                <p className="countdown-warning-text">
                  Khóa học sẽ bị xóa vĩnh viễn trong <strong>{countdown}</strong> giây.
                  Bạn có thể bấm Hủy để hủy bỏ yêu cầu này ngay lập tức.
                </p>
                <div className="delete-modal-actions">
                  <button className="delete-btn-abort-countdown" onClick={cancelDelete}>
                    Hủy xóa khóa học
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── POPUP: XÓA LỚP HỌC ── */}
      {deletingClass && (
        <div className="modal-backdrop-blur z-index-top">
          <div className="delete-confirm-modal-box">
            <FiAlertTriangle className="delete-modal-warning-icon" size={48} />
            <h3>Xác nhận xóa lớp học</h3>
            <p className="delete-warning-text">
              Bạn có chắc chắn muốn xóa lớp học <strong>{deletingClass.name}</strong> không?
              Nếu xóa lớp học này, tất cả những thông tin liên quan đến lớp (học viên ghi danh, buổi học, bài nộp) sẽ bị xóa hoàn toàn.
            </p>
            <div className="delete-modal-actions">
              <button className="delete-btn-cancel" onClick={() => setDeletingClass(null)}>Hủy</button>
              <button className="delete-btn-confirm" onClick={() => deleteClass(deletingClass.id)}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}