import "./ApproveAdmin.css";
import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiAlertTriangle, FiUsers } from "react-icons/fi";
import { formatScheduleOnlyDays } from "../../../utils/schedule";
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

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5004`
    : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";


const DAYS_OF_WEEK = [
  { label: 'T2', value: 'Thứ 2' },
  { label: 'T3', value: 'Thứ 3' },
  { label: 'T4', value: 'Thứ 4' },
  { label: 'T5', value: 'Thứ 5' },
  { label: 'T6', value: 'Thứ 6' },
  { label: 'T7', value: 'Thứ 7' },
  { label: 'CN', value: 'Chủ nhật' },
];

const START_TIME_OPTIONS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
];

const END_TIME_OPTIONS = [
  "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
];

const parseSchedule = (schedule: string) => {
  const daySchedules: Record<string, { startTime: string; endTime: string }> = {};
  const selectedDays: string[] = [];

  if (!schedule || schedule === '—') {
    return { days: '', daySchedules };
  }

  // Thử parse theo định dạng mới trước: các ngày riêng biệt có dấu ngoặc ()
  // Ví dụ: "Thứ 3 (07:00-08:30) · Thứ 5 (19:00-20:30)"
  const parts = schedule.split('·').map(p => p.trim());
  let isNewFormat = true;
  
  if (parts.length === 0 || parts[0] === '') {
    isNewFormat = false;
  } else {
    for (const part of parts) {
      const match = part.match(/^(.+?)\s*\(([^)]+)\)$/);
      if (!match) {
        isNewFormat = false;
        break;
      }
    }
  }

  if (isNewFormat) {
    parts.forEach(part => {
      const match = part.match(/^(.+?)\s*\(([^)]+)\)$/);
      if (match) {
        const day = match[1].trim(); // ví dụ: "Thứ 3"
        const timeStr = match[2].trim(); // ví dụ: "07:00-08:30"
        const times = timeStr.split('-');
        const startTime = times[0] ? times[0].trim() : '07:00';
        const endTime = times[1] ? times[1].trim() : '08:30';
        
        const matchedDay = DAYS_OF_WEEK.find(d => d.value.toLowerCase() === day.toLowerCase());
        if (matchedDay) {
          if (!selectedDays.includes(matchedDay.value)) {
            selectedDays.push(matchedDay.value);
          }
          daySchedules[matchedDay.value] = { startTime, endTime };
        }
      }
    });
  } else {
    // Định dạng cũ: "Thứ 2, Thứ 4 · 09:00-10:30" hoặc "Thứ 2, 4, 6 · 09:00-10:30"
    let daysPart = '';
    let timePart = '';
    
    if (schedule.includes('·')) {
      const partsOld = schedule.split('·');
      daysPart = partsOld[0].trim();
      timePart = partsOld[1] ? partsOld[1].trim() : '';
    } else if (schedule.includes('-') && (schedule.includes(':') || /^\d{2}/.test(schedule))) {
      timePart = schedule.trim();
    } else {
      daysPart = schedule.trim();
    }

    let commonStartTime = '07:00';
    let commonEndTime = '08:30';
    if (timePart) {
      const times = timePart.split('-');
      if (times[0]) commonStartTime = times[0].trim();
      if (times[1]) commonEndTime = times[1].trim();
    }

    const extractedDays: string[] = [];
    
    if (daysPart.toLowerCase().includes('chủ nhật')) {
      extractedDays.push('Chủ nhật');
    }
    
    const thuMatch = daysPart.match(/Thứ\s+([^&·\(\)]+)/i);
    if (thuMatch) {
      const cleanParts = thuMatch[1].replace(/Thứ/gi, '').split(',').map(s => s.trim());
      cleanParts.forEach(p => {
        if (p.includes('&')) {
          p.split('&').forEach(sp => {
            const cleanSp = sp.trim();
            if (cleanSp && !isNaN(Number(cleanSp))) {
              extractedDays.push(`Thứ ${cleanSp}`);
            }
          });
        } else {
          if (p && !isNaN(Number(p))) {
            extractedDays.push(`Thứ ${p}`);
          }
        }
      });
    }
    
    const ampMatch = daysPart.match(/&\s*(\d+)/);
    if (ampMatch) {
      const num = ampMatch[1];
      const dayStr = `Thứ ${num}`;
      if (!extractedDays.includes(dayStr)) {
        extractedDays.push(dayStr);
      }
    }

    DAYS_OF_WEEK.forEach(d => {
      if (daysPart.toLowerCase().includes(d.value.toLowerCase()) && !extractedDays.includes(d.value)) {
        extractedDays.push(d.value);
      }
    });

    extractedDays.forEach(day => {
      const matchedDay = DAYS_OF_WEEK.find(d => d.value.toLowerCase() === day.toLowerCase());
      if (matchedDay) {
        if (!selectedDays.includes(matchedDay.value)) {
          selectedDays.push(matchedDay.value);
        }
        daySchedules[matchedDay.value] = { startTime: commonStartTime, endTime: commonEndTime };
      }
    });
  }

  selectedDays.sort((a, b) => {
    const idxA = DAYS_OF_WEEK.findIndex(d => d.value === a);
    const idxB = DAYS_OF_WEEK.findIndex(d => d.value === b);
    return idxA - idxB;
  });

  return {
    days: selectedDays.join(', '),
    daySchedules
  };
};

const serializeSchedule = (
  selectedDaysStr: string,
  daySchedules: Record<string, { startTime: string; endTime: string }>
) => {
  if (!selectedDaysStr) return '—';
  
  const days = selectedDaysStr.split(',').map(d => d.trim()).filter(Boolean);
  
  days.sort((a, b) => {
    const idxA = DAYS_OF_WEEK.findIndex(d => d.value === a);
    const idxB = DAYS_OF_WEEK.findIndex(d => d.value === b);
    return idxA - idxB;
  });

  if (days.length === 0) return '—';

  const scheduleParts = days.map(day => {
    const sched = daySchedules[day] || { startTime: '07:00', endTime: '08:30' };
    return `${day} (${sched.startTime}-${sched.endTime})`;
  });

  return scheduleParts.join(' · ');
};
const getSkillId = (skillName: string): number => {
  switch (skillName.toLowerCase()) {
    case 'listening': return 1;
    case 'reading': return 2;
    case 'speaking': return 3;
    case 'writing': return 4;
    default: return 0;
  }
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
  Listening: boolean;
  Reading: boolean;
  Speaking: boolean;
  Writing: boolean;
  HinhAnh?: string;
}

interface LopHoc {
  id: number;
  name: string;
  schedule: string;
  students: number;
  maxStudents: number;
  progress: number;
  lessonCount: number;
  completed: boolean;
  status: string;
  maLop?: number;
}

interface Teacher {
  MaGiangVien: number;
  MaNguoiDung: number;
  HoTen: string;
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
  const [cForm, setCForm] = useState({ title: '', desc: '', level: 'TOEIC', category: 'Luyện thi', image: '' });
  const [formLevels, setFormLevels] = useState<string[]>([]);
  const [formNewLevelInput, setFormNewLevelInput] = useState("");
  const [courseFormErrors, setCourseFormErrors] = useState({ title: '', levels: '', levelInput: '', skills: '', image: '' });

  // Bản đồ lưu danh sách trình độ theo MaKhoaHoc
  const [courseDetailsMap, setCourseDetailsMap] = useState<Record<number, Array<{ MaLop: number; TenLop: string }>>>({});

  // Kỹ năng của khóa học trong modal
  const [courseSkills, setCourseSkills] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [cForm.desc, showCourseModal]);

  // Danh sách giảng viên từ cơ sở dữ liệu
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);

  // Modal Thêm lớp học mới từ danh sách mở rộng
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassForm, setNewClassForm] = useState({
    name: '',
    schedule: '',
    days: '',
    daySchedules: {} as Record<string, { startTime: string; endTime: string }>,
    maxStudents: 30,
    maLop: 0,
    teachers: {} as Record<number, number>
  });
  const [addClassErrors, setAddClassErrors] = useState({ name: '', maLop: '', maxStudents: '' });

  // State chỉnh sửa trình độ inline của từng khóa học
  const [editingLevelIndex, setEditingLevelIndex] = useState<number | null>(null);
  const [editingLevelValue, setEditingLevelValue] = useState("");
  const [newLevelInput, setNewLevelInput] = useState("");
  const [addLevelError, setAddLevelError] = useState("");
  const editLevelWrapperRef = useRef<HTMLDivElement>(null);

  // Modal Chỉnh sửa lớp học trực tiếp
  const [showClassEditModal, setShowClassEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<LopHoc | null>(null);
  const [classEditForm, setClassEditForm] = useState({
    name: '',
    schedule: '',
    days: '',
    daySchedules: {} as Record<string, { startTime: string; endTime: string }>,
    maxStudents: 30,
    status: 'Chưa bắt đầu',
    maLop: 0,
    teachers: {} as Record<number, number>
  });
  const [editClassErrors, setEditClassErrors] = useState({ name: '', maLop: '', maxStudents: '' });

  // Modal Chi tiết lớp học
  const [showClassDetailModal, setShowClassDetailModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<LopHoc | null>(null);
  const [selectedClassAssignments, setSelectedClassAssignments] = useState<any[]>([]);

  // Modal Xác nhận xóa lớp học
  const [deletingClass, setDeletingClass] = useState<LopHoc | null>(null);

  // Modal Xác nhận xóa trình độ
  const [deletingLevelInfo, setDeletingLevelInfo] = useState<{ course: Course; levelName: string; index: number; maLop: number } | null>(null);

  // Modal Xác nhận xóa đếm ngược
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadCourses = () => {
    setLoading(true);
    fetch(`${API}/admin/khoahoc?all=true`)
      .then(r => r.json())
      .then(data => {
        setCourses(data.map((c: any) => ({
          id: c.MaKhoaHoc,
          title: c.TenKhoaHoc,
          desc: c.MoTa || '',
          level: c.TrinhDo || '',
          status: c.TrangThai || 'Ẩn',
          created: c.NgayTao ? new Date(c.NgayTao).toLocaleDateString('vi-VN') : '—',
          category: c.DanhMuc || 'Luyện thi',
          classCount: c.SoLop || 0,
          Listening: !!c.Listening,
          Reading: !!c.Reading,
          Speaking: !!c.Speaking,
          Writing: !!c.Writing,
          HinhAnh: c.HinhAnh || ''
        })));
      })
      .catch(() => setToast('Lỗi tải danh sách khóa học'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
    // Tải danh sách giảng viên
    fetch(`${API}/qtv/giangvien`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTeachersList(data);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetch(`${API}/qtv/lophoc/${selectedClass.id}/giangvien`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSelectedClassAssignments(data);
          } else {
            setSelectedClassAssignments([]);
          }
        })
        .catch(() => setSelectedClassAssignments([]));
    } else {
      setSelectedClassAssignments([]);
    }
  }, [selectedClass]);

  const loadClassesForCourse = (courseId: number) => {
    fetch(`${API}/course-detail/${courseId}/classes`)
      .then(r => r.json())
      .then(data => {
        const mapped: LopHoc[] = data.map((c: any) => ({
          id: c.MaLopHoc,
          name: c.TenLop,
          schedule: c.LichHoc || '—',
          students: c.SoLuongHocVien || 0,
          maxStudents: c.SiSoToiDa,
          progress: c.TienDo || 0,
          lessonCount: c.SoBuoiHoc || 0,
          completed: c.TrangThai === "Đã hoàn thành",
          status: c.TrangThai || 'Chưa bắt đầu',
          maLop: c.MaLop
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
        if (data && Array.isArray(data)) {
          setCourseDetailsMap(prev => ({ ...prev, [courseId]: data }));
        }
      })
      .catch(() => { });
  };

  const toggleExpandCourse = (courseId: number) => {
    setAddLevelError("");
    setNewLevelInput("");
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      setEditingLevelIndex(null); // Reset inline edit when collapsing
      return;
    }
    setExpandedCourse(courseId);
    setEditingLevelIndex(null);
    loadClassesForCourse(courseId);
    loadCourseDetails(courseId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingLevelIndex !== null && editLevelWrapperRef.current && !editLevelWrapperRef.current.contains(event.target as Node)) {
        setEditingLevelIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingLevelIndex]);

  // ── Thao tác Form Thêm/Sửa khóa học ──
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

    fetch(`${API}/upload`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setCForm((prev) => ({ ...prev, image: data.url }));
          setCourseFormErrors((prev) => ({ ...prev, image: "" }));
        }
      })
      .catch((err) => {
        console.error("Lỗi upload ảnh:", err);
        setToast("Lỗi tải ảnh lên hệ thống!");
      });
  };

  const saveCourse = async () => {
    const errors = { title: '', levels: '', levelInput: '', skills: '', image: '' };
    if (!cForm.title.trim()) {
      errors.title = 'Vui lòng nhập tên khóa học!';
    }
    if (formLevels.length === 0) {
      errors.levels = 'Vui lòng thêm ít nhất một trình độ!';
    }
    if (courseSkills.length === 0) {
      errors.skills = 'Vui lòng chọn ít nhất một kỹ năng!';
    }
    if (!cForm.image) {
      errors.image = 'Vui lòng tải lên ảnh khóa học!';
    }
    if (errors.title || errors.levels || errors.skills || errors.image) {
      setCourseFormErrors(errors);
      return;
    }
    setCourseFormErrors({ title: '', levels: '', levelInput: '', skills: '', image: '' });

    const finalLevel = formLevels.join(', ');
    const listeningVal = courseSkills.includes('Listening') ? 1 : 0;
    const readingVal = courseSkills.includes('Reading') ? 1 : 0;
    const speakingVal = courseSkills.includes('Speaking') ? 1 : 0;
    const writingVal = courseSkills.includes('Writing') ? 1 : 0;
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');

    try {
      let courseId = editCourse?.id;

      if (editCourse) {
        await fetch(`${API}/admin/khoahoc/${editCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            TenKhoaHoc: cForm.title,
            MoTa: cForm.desc,
            TrinhDo: finalLevel,
            Listening: listeningVal,
            Reading: readingVal,
            Speaking: speakingVal,
            Writing: writingVal,
            HinhAnh: cForm.image
          })
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
            MaNguoiDung: user.MaNguoiDung || 6,
            Listening: listeningVal,
            Reading: readingVal,
            Speaking: speakingVal,
            Writing: writingVal,
            HinhAnh: cForm.image
          })
        });
        const data = await res.json();
        courseId = data.MaKhoaHoc;

        // Tạo các trình độ chi tiết cho khóa học
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
    const isVisible = currentStatus === 'Hiển thị' || currentStatus === 'Đã duyệt' || currentStatus === 'Hoạt động';
    const newStatus = isVisible ? 'Ẩn' : 'Hiển thị';
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

    const { days, daySchedules } = parseSchedule(cls.schedule);

    setClassEditForm({
      name: cls.name,
      schedule: cls.schedule,
      days: days,
      daySchedules: daySchedules,
      maxStudents: cls.maxStudents,
      status: cls.status,
      maLop: cls.maLop || 0,
      teachers: {}
    });

    // Tải thông tin phân công giáo viên
    fetch(`${API}/qtv/lophoc/${cls.id}/giangvien`)
      .then(r => r.json())
      .then(data => {
        const teacherMap: Record<number, number> = {};
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            teacherMap[item.MaKyNang] = item.MaGiangVien;
          });
        }
        setClassEditForm(p => ({
          ...p,
          teachers: teacherMap
        }));
      })
      .catch(() => { });

    setEditClassErrors({ name: '', maLop: '', maxStudents: '' });
    setShowClassEditModal(true);
  };

  const saveEditedClass = async () => {
    if (!editingClass) return;

    let hasError = false;
    const errors = { name: '', maLop: '', maxStudents: '' };

    if (!classEditForm.name.trim()) {
      errors.name = "Vui lòng nhập tên lớp học!";
      hasError = true;
    }

    if (!classEditForm.maLop) {
      errors.maLop = "Vui lòng chọn trình độ lớp học";
      hasError = true;
    }

    if (hasError) {
      setEditClassErrors(errors);
      return;
    }
    setEditClassErrors({ name: '', maLop: '', maxStudents: '' });
    try {
      const finalSchedule = serializeSchedule(classEditForm.days, classEditForm.daySchedules);

      await fetch(`${API}/qtv/lophoc/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenLop: classEditForm.name,
          LichHoc: finalSchedule,
          SoLuongHocVien: null,
          TrangThai: classEditForm.status,
          MaLop: classEditForm.maLop,
          teachers: classEditForm.teachers
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
  const saveCourseLevel = async (course: Course, newLevelName: string, maLop: number) => {
    if (!newLevelName.trim()) {
      alert("Vui lòng nhập tên trình độ!");
      return;
    }
    try {
      await fetch(`${API}/qtv/khoahocchitiet/${maLop}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenLop: newLevelName
        })
      });
      setToast("Đã cập nhật trình độ khóa học thành công!");
      setEditingLevelIndex(null);
      loadCourseDetails(course.id);
      loadCourses();
    } catch {
      alert("Lỗi khi cập nhật trình độ");
    }
  };

  // ── Thêm trình độ khóa học inline ──
  const addCourseLevel = async (course: Course, levelName: string) => {
    try {
      await fetch(`${API}/qtv/khoahocchitiet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenLop: levelName,
          MoTa: course.desc,
          MaKhoaHoc: course.id
        })
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

  // ── Lưu lớp học mới ──
  const saveNewClass = async () => {
    let hasError = false;
    const errors = { name: '', maLop: '', maxStudents: '' };

    if (!newClassForm.name.trim()) {
      errors.name = "Vui lòng nhập tên lớp học!";
      hasError = true;
    }

    if (!newClassForm.maLop) {
      errors.maLop = "Vui lòng chọn trình độ lớp học";
      hasError = true;
    }

    if (hasError) {
      setAddClassErrors(errors);
      return;
    }
    setAddClassErrors({ name: '', maLop: '', maxStudents: '' });
    try {
      const finalSchedule = serializeSchedule(newClassForm.days, newClassForm.daySchedules);

      await fetch(`${API}/qtv/lophoc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenLop: newClassForm.name,
          MaLop: newClassForm.maLop,
          LichHoc: finalSchedule,
          SoLuongHocVien: null,
          teachers: newClassForm.teachers
        })
      });
      setToast("Đã tạo lớp học mới thành công!");
      setShowAddClassModal(false);
      setNewClassForm({
        name: '',
        schedule: '',
        days: '',
        daySchedules: {},
        maxStudents: 30,
        maLop: 0,
        teachers: {}
      });
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
          <FiPlus size={16} className="mr-6" /> Thêm khóa học mới
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
                  <td colSpan={5} className="table-empty-message">
                    Không tìm thấy khóa học nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course, index) => {
                  const isExpanded = expandedCourse === course.id;
                  const classes = classesMap[course.id] || [];
                  const isVisible = course.status === 'Hiển thị' || course.status === 'Đã duyệt' || course.status === 'Hoạt động';

                  return (
                    <React.Fragment key={course.id}>
                      <tr className={`course-row ${index % 2 === 0 ? "even-row" : "odd-row"}`} onClick={() => toggleExpandCourse(course.id)}>
                        <td>
                          <div className="course-title-flex-row">
                            <span className="course-title-cell">{course.title}</span>
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
                                    const currentLevels = courseDetailsMap[course.id] || [];
                                    if (currentLevels.length === 0) {
                                      return <p className="no-levels-text">Chưa có trình độ nào được thiết lập.</p>;
                                    }
                                    return (
                                      <div className="levels-items-container">
                                        {currentLevels.map((lvl, index) => {
                                          const isEditingThis = editingLevelIndex === index;
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
                                                        setEditingLevelIndex(index);
                                                        setEditingLevelValue(lvl.TenLop);
                                                      }}
                                                      className="level-action-btn-edit"
                                                      title="Sửa tên trình độ"
                                                    >
                                                      <FiEdit2 size={13} />
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        setDeletingLevelInfo({ course, levelName: lvl.TenLop, index, maLop: lvl.MaLop });
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
                        value={formNewLevelInput}
                        onChange={(e) => {
                          setFormNewLevelInput(e.target.value);
                          setCourseFormErrors(p => ({ ...p, levelInput: '' }));
                        }}
                        placeholder="Nhập tên trình độ mới (VD: IELTS 5.5, Beginner, ...)"
                        className={`level-input-small-inline ${courseFormErrors.levelInput ? 'has-error' : ''}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = formNewLevelInput.trim();
                            if (!trimmed) {
                              setCourseFormErrors(p => ({ ...p, levelInput: 'Vui lòng nhập tên trình độ!' }));
                              return;
                            }
                            if (formLevels.includes(trimmed)) {
                              setCourseFormErrors(p => ({ ...p, levelInput: 'Trình độ này đã tồn tại!' }));
                              return;
                            }
                            setFormLevels(prev => {
                              const next = [...prev, trimmed];
                              setCourseFormErrors(p => ({ ...p, levels: '', levelInput: '' }));
                              return next;
                            });
                            setFormNewLevelInput("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="add-custom-level-btn"
                        onClick={() => {
                          const trimmed = formNewLevelInput.trim();
                          if (!trimmed) {
                            setCourseFormErrors(p => ({ ...p, levelInput: 'Vui lòng nhập tên trình độ!' }));
                            return;
                          }
                          if (formLevels.includes(trimmed)) {
                            setCourseFormErrors(p => ({ ...p, levelInput: 'Trình độ này đã tồn tại!' }));
                            return;
                          }
                          setFormLevels(prev => {
                            const next = [...prev, trimmed];
                            setCourseFormErrors(p => ({ ...p, levels: '', levelInput: '' }));
                            return next;
                          });
                          setFormNewLevelInput("");
                        }}
                      >
                        Thêm
                      </button>
                    </div>
                    {courseFormErrors.levelInput && (
                      <span className="form-field-error-text mt-4">{courseFormErrors.levelInput}</span>
                    )}
                    {courseFormErrors.levels && (
                      <span className="form-field-error-text mt-4">{courseFormErrors.levels}</span>
                    )}
                  </>
                )}
              </div>

              <div className="form-field-group">
                <label>Kỹ năng <span className="required-star">*</span></label>
                <div className="skills-checkbox-row">
                  {['Listening', 'Reading', 'Speaking', 'Writing'].map(skill => {
                    const checked = courseSkills.includes(skill);
                    const isSkillsDisabled = editCourse ? (editCourse.classCount > 0) : false;
                    return (
                      <label key={skill} className="skill-checkbox-label" style={{ cursor: isSkillsDisabled ? 'not-allowed' : 'pointer', opacity: isSkillsDisabled ? 0.7 : 1 }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isSkillsDisabled}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCourseSkills(prev => [...prev, skill]);
                              setCourseFormErrors(p => ({ ...p, skills: '' }));
                            } else {
                              const updated = courseSkills.filter(s => s !== skill);
                              setCourseSkills(updated);
                              if (updated.length === 0) {
                                setCourseFormErrors(p => ({ ...p, skills: 'Vui lòng chọn ít nhất một kỹ năng!' }));
                              }
                            }
                          }}
                          className="skill-checkbox-input"
                        />
                        <span>{skill}</span>
                      </label>
                    );
                  })}
                </div>
                {courseFormErrors.skills && (
                  <span className="form-field-error-text mt-4">
                    {courseFormErrors.skills}
                  </span>
                )}
                {editCourse && editCourse.classCount > 0 && (
                  <span className="skills-disabled-warning">
                    Không thể thay đổi kỹ năng của khóa học khi đã có lớp học trong khóa.
                  </span>
                )}
              </div>

              <div className="form-field-group">
                <label>Ảnh khóa học <span className="required-star">*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  id="course-image-upload-input"
                />
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "4px" }}>
                  <label
                    htmlFor="course-image-upload-input"
                    className="course-image-upload-btn"
                  >
                    Tải ảnh lên...
                  </label>
                  {cForm.image ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img
                        src={`${API}${cForm.image}`}
                        alt="Preview"
                        style={{ width: "60px", height: "45px", objectFit: "cover", borderRadius: "4px", border: "1px solid #ddd" }}
                      />
                      <button
                        type="button"
                        onClick={() => setCForm((p) => ({ ...p, image: "" }))}
                        style={{ border: "none", background: "none", cursor: "pointer", fontSize: "16px", color: "#dc2626" }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: "13px", color: "#888" }}>Chưa chọn ảnh nào</span>
                  )}
                </div>
                {courseFormErrors.image && (
                  <span className="form-field-error-text mt-4">{courseFormErrors.image}</span>
                )}
              </div>

              <div className="form-field-group">
                <label>Mô tả chi tiết</label>
                <div style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff" }}>
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
              <button className="footer-cancel-btn" onClick={() => { setShowCourseModal(false); setEditCourse(null); }}>Hủy bỏ</button>
              <button className="footer-save-btn" onClick={saveCourse}>Lưu dữ liệu</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: THÊM LỚP HỌC MỚI ── */}
      {showAddClassModal && (() => {
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
                <h3>Thêm lớp học mới</h3>
                <button className="modal-close-icon-btn" onClick={() => setShowAddClassModal(false)}>
                  <FiX size={20} />
                </button>
              </div>

              <div className="modal-scrollable-body max-h-70">
                <div className="form-field-group">
                  <label>Tên lớp học <span className="required-star">*</span></label>
                  <input
                    className={addClassErrors.name ? "has-error" : ""}
                    value={newClassForm.name}
                    onChange={e => {
                      setNewClassForm(p => ({ ...p, name: e.target.value }));
                      setAddClassErrors(p => ({ ...p, name: '' }));
                    }}
                    placeholder="VD: Lớp IELTS-01"
                  />
                  {addClassErrors.name && (
                    <span className="form-field-error-text">{addClassErrors.name}</span>
                  )}
                </div>

                <div className="form-field-group">
                  <label>Trình độ <span className="required-star">*</span></label>
                  <select
                    className={addClassErrors.maLop ? "has-error" : ""}
                    value={newClassForm.maLop || ''}
                    onChange={e => {
                      setNewClassForm(p => ({ ...p, maLop: Number(e.target.value) }));
                      setAddClassErrors(p => ({ ...p, maLop: '' }));
                    }}
                  >
                    <option value="">-- Chọn trình độ --</option>
                    {(courseDetailsMap[expandedCourse || 0] || []).map(d => (
                      <option key={d.MaLop} value={d.MaLop}>
                        {d.TenLop}
                      </option>
                    ))}
                  </select>
                  {addClassErrors.maLop && (
                    <span className="form-field-error-text">{addClassErrors.maLop}</span>
                  )}
                </div>


                <div className="form-field-group">
                  <label>Lịch học (Chọn các ngày học trong tuần):</label>
                  <div className="weekday-selection-row">
                    {DAYS_OF_WEEK.map(d => {
                      const isSelected = newClassForm.days.split(',').map(x => x.trim()).filter(Boolean).includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          className={`weekday-btn-choice ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            const daysList = newClassForm.days.split(',').map(x => x.trim()).filter(Boolean);
                            let newDaysList = [];
                            const newDaySchedules = { ...newClassForm.daySchedules };

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

                            setNewClassForm(p => ({
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

                {newClassForm.days.split(',').map(x => x.trim()).filter(Boolean).map(day => {
                  const sched = newClassForm.daySchedules[day] || { startTime: '07:00', endTime: '08:30' };
                  return (
                    <div key={day} className="day-schedule-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ minWidth: '70px', fontWeight: 'bold' }}>{day}:</div>
                      <div className="form-field-group" style={{ flex: 1, marginBottom: 0 }}>
                        <select
                          value={sched.startTime}
                          onChange={e => {
                            const val = e.target.value;
                            setNewClassForm(p => ({
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
                            setNewClassForm(p => ({
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

                {newClassForm.days && (
                  <div className="modal-skills-info">
                    Đã chọn: {serializeSchedule(newClassForm.days, newClassForm.daySchedules)}
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
                            value={newClassForm.teachers[skillId] || ''}
                            onChange={e => {
                              const val = e.target.value ? Number(e.target.value) : 0;
                              setNewClassForm(prev => ({
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
                <button className="footer-cancel-btn" onClick={() => setShowAddClassModal(false)}>Hủy bỏ</button>
                <button className="footer-save-btn" onClick={saveNewClass}>Lưu lớp học</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── MODAL: CHỈNH SỬA LỚP HỌC TRỰC TIẾP ── */}
      {showClassEditModal && editingClass && (() => {
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
                <h3>Chỉnh sửa lớp học trực tiếp</h3>
                <button className="modal-close-icon-btn" onClick={() => { setShowClassEditModal(false); setEditingClass(null); }}>
                  <FiX size={20} />
                </button>
              </div>

              <div className="modal-scrollable-body max-h-60">
                <div className="form-field-group">
                  <label>Tên lớp học <span className="required-star">*</span></label>
                  <input
                    className={editClassErrors.name ? "has-error" : ""}
                    value={classEditForm.name}
                    onChange={e => {
                      setClassEditForm(p => ({ ...p, name: e.target.value }));
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
                      setClassEditForm(p => ({ ...p, maLop: Number(e.target.value) }));
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

                            setClassEditForm(p => ({
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
                            setClassEditForm(p => ({
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
                            setClassEditForm(p => ({
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
                  <label>Trạng thái lớp học</label>
                  <select
                    value={classEditForm.status}
                    onChange={e => setClassEditForm(p => ({ ...p, status: e.target.value }))}
                  >
                    <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                    <option value="Đang diễn ra">Đang diễn ra</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>

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
                              setClassEditForm(prev => ({
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
                <button className="footer-cancel-btn" onClick={() => { setShowClassEditModal(false); setEditingClass(null); }}>Hủy bỏ</button>
                <button className="footer-save-btn" onClick={saveEditedClass}>Lưu thay đổi</button>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* ── MODAL: CHI TIẾT LỚP HỌC ── */}
      {showClassDetailModal && selectedClass && (() => {
        const expandedCourseObj = courses.find(c => c.id === expandedCourse);
        const courseSkillsList = [];
        if (expandedCourseObj?.Listening) courseSkillsList.push('Listening');
        if (expandedCourseObj?.Reading) courseSkillsList.push('Reading');
        if (expandedCourseObj?.Speaking) courseSkillsList.push('Speaking');
        if (expandedCourseObj?.Writing) courseSkillsList.push('Writing');
        const classLevelObj = (courseDetailsMap[expandedCourse || 0] || []).find(d => d.MaLop === selectedClass.maLop);
        const levelName = classLevelObj ? classLevelObj.TenLop : '';

        return (
          <div className="modal-backdrop-blur z-index-top">
            <div className="course-form-modal w-480">
              <div className="modal-header-section">
                <h3>Chi tiết lớp học</h3>
                <button className="modal-close-icon-btn" onClick={() => { setShowClassDetailModal(false); setSelectedClass(null); }}>
                  <FiX size={20} />
                </button>
              </div>

              <div className="modal-scrollable-body max-h-60">
                <div className="class-detail-field-item">
                  <span className="class-detail-label">Tên lớp học</span>
                  <div className="class-detail-value">{selectedClass.name}</div>
                </div>
                {levelName && (
                  <div className="class-detail-field-item">
                    <span className="class-detail-label">Trình độ</span>
                    <div className="class-detail-value">{levelName}</div>
                  </div>
                )}
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
                    <span className={`status-badge-detail ${selectedClass.status === "Đã hoàn thành" ? "completed" :
                      selectedClass.status === "Đang diễn ra" ? "active" : "not-started"
                      }`}>
                      {selectedClass.status}
                    </span>
                  </div>
                </div>

                <div className="class-detail-field-item">
                  <span className="class-detail-label">Phân công giảng viên</span>
                  <div className="class-detail-skills-list">
                    {courseSkillsList.map(skill => {
                      const skillId = getSkillId(skill);
                      const assignment: any = selectedClassAssignments.find((a: any) => a.MaKyNang === skillId);
                      return (
                        <div key={skill} className="class-detail-skill-row">
                          <span className="class-detail-skill-name">{skill}</span>
                          <span style={{ color: assignment ? '#0f172a' : '#94a3b8', fontStyle: assignment ? 'normal' : 'italic' }}>
                            {assignment ? (assignment.TenGiangVien || assignment.HoTen) : 'Chưa phân công'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer-section">
                <button
                  className="delete-btn-confirm delete-class-detail-btn"
                  onClick={() => {
                    setDeletingClass(selectedClass);
                    setShowClassDetailModal(false);
                  }}
                >
                  Xóa
                </button>
                <button
                  className="footer-save-btn"
                  onClick={() => {
                    openEditClass(selectedClass);
                    setShowClassDetailModal(false);
                  }}
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* ── POPUP: XÓA TRÌNH ĐỘ ── */}
      {deletingLevelInfo && (
        <div className="modal-backdrop-blur z-index-top">
          <div className="delete-confirm-modal-box">
            <FiAlertTriangle className="delete-modal-warning-icon" size={48} />
            <h3>Xác nhận xóa trình độ</h3>
            <p className="delete-warning-text">
              Bạn có chắc chắn muốn xóa trình độ <strong>{deletingLevelInfo.levelName}</strong> của khóa học <strong>{deletingLevelInfo.course.title}</strong> không?
              <br />
              <span style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '6px', display: 'inline-block' }}>
                Lưu ý: Chỉ có thể xóa trình độ khi không có lớp học nào đang thuộc trình độ này.
              </span>
            </p>
            <div className="delete-modal-actions">
              <button className="delete-btn-cancel" onClick={() => setDeletingLevelInfo(null)}>Hủy</button>
              <button
                className="delete-btn-confirm"
                onClick={async () => {
                  try {
                    const res = await fetch(`${API}/qtv/khoahocchitiet/${deletingLevelInfo.maLop}`, {
                      method: 'DELETE'
                    });
                    if (!res.ok) {
                      const errData = await res.json();
                      alert(errData.message || "Không thể xóa trình độ này");
                    } else {
                      setToast("Đã xóa trình độ thành công!");
                      loadCourseDetails(deletingLevelInfo.course.id);
                      loadCourses();
                    }
                  } catch (err) {
                    alert("Gặp lỗi khi xóa trình độ");
                  }
                  setDeletingLevelInfo(null);
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
