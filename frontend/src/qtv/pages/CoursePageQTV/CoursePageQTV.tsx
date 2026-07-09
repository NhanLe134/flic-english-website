// CoursePageQTV.tsx – Cấu trúc UI cũ + Kết nối DB + Phân công nhiều GV
import React, { useState, useEffect } from 'react'
import { formatScheduleOnlyDays } from '../../../utils/schedule'
import styles from './CoursePageQTV.module.css'
import { FiSearch, FiChevronDown, FiChevronRight, FiPackage, FiUsers, FiX, FiPlus } from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'

const API = 'http://14.225.192.252:5000'
const LEVELS    = ['Beginner','Elementary','Intermediate','Advanced','IELTS','TOEIC','VSTEP','General','A1','A2','B1','B2']

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

/*
const parseSchedule = (schedule: string) => {
  const daySchedules: Record<string, { startTime: string; endTime: string }> = {};
  const selectedDays: string[] = [];

  if (!schedule || schedule === '—') {
    return { days: '', daySchedules };
  }

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
        const day = match[1].trim();
        const timeStr = match[2].trim();
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
*/

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

const CATS      = ['Cơ bản','Luyện thi','Giao tiếp','Ngữ pháp','Từ vựng','Kỹ năng']

interface GiaoVien     { MaGiangVien: number; MaNguoiDung: number; HoTen: string }
interface GiaoVienKhoa { MaGiangVien: number; HoTen: string }

const getSkillId = (skillName: string): number => {
  switch (skillName.toLowerCase()) {
    case 'listening': return 1;
    case 'speaking': return 2;
    case 'reading': return 3;
    case 'writing': return 4;
    default: return 0;
  }
};

interface Course {
  id: number; title: string; desc: string; level: string
  status: string; created: string; category: string
  listening?: boolean;
  reading?: boolean;
  speaking?: boolean;
  writing?: boolean;
  classCount?: number;
}

interface LopHoc {
  id: number; name: string; schedule: string
  students: number; progress: number
  maGiangVien: number | null; tenGiangVien: string
  lessonCount: number
  status: string
  levelName: string
}

interface Lesson {
  id: number; title: string; desc: string
  startDate: string; endDate: string; order: number
}

interface Student {
  id: string; name: string; gender: string; phone: string
}

interface EnrolledStudent {
  studentId: string; name: string; gender: string
  phone: string; enrollDate: string; status: string
}



interface ClassInForm {
  name: string; schedule: string; maxStudents: number
  maGiangVien: string
  teachers?: Record<number, number>
  lessons: { title: string; desc: string; startDate: string; endDate: string; order: number }[]
}

type DetailTab = 'info' | 'students'

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t) }, [])
  return <div className={styles.toast}>✓ {msg}</div>
}



// const cleanLessonTitle = (title: string) => {
//   if (!title) return '';
//   let cleaned = title.replace(/^Buổi\s+\d+\s*[:-]\s*/i, '');
//   cleaned = cleaned.split(/\s*-\s*Lớp\s+\d+/i)[0];
//   return cleaned.trim();
// };

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === '—') return '—';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export default function CoursePageQTV() {
  const navigate = useNavigate()
  const location = useLocation()
  const [courses, setCourses]     = useState<Course[]>([])
  const [giaoViens, setGiaoViens] = useState<GiaoVien[]>([])
  const [search, setSearch]       = useState('')
  const [levelFilter]   = useState('')
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState('')
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)

  const [classesMap, setClassesMap]   = useState<Record<number, LopHoc[]>>({})
  const [_gvKhoaMap, _setGvKhoaMap]     = useState<Record<number, GiaoVienKhoa[]>>({})
  const [classTeachersMap, setClassTeachersMap] = useState<Record<number, Record<number, { maGiangVien: number; tenGiangVien: string }>>>({})

  // Modal tạo/sửa khóa học
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editCourse, setEditCourse]           = useState<Course | null>(null)
  const [cForm, setCForm] = useState({
    title: '',
    desc: '',
    level: 'TOEIC',
    category: 'Luyện thi',
    listening: false,
    reading: false,
    speaking: false,
    writing: false
  })
  const [selectedGVsForCourse, setSelectedGVsForCourse] = useState<GiaoVienKhoa[]>([])
  const [addGVSelect, setAddGVSelect] = useState('')

  // Lớp + buổi trong form tạo khóa
  const [classesInForm, setClassesInForm] = useState<ClassInForm[]>([])

  // Modal chi tiết
  const [detailCourse, setDetailCourse]   = useState<Course | null>(null)
  const [detailClass, setDetailClass]     = useState<LopHoc | null>(null)
  const [detailTab, setDetailTab]         = useState<DetailTab>('info')
  const [showDetail, setShowDetail]       = useState(false)

  // Ghi danh
  const [allStudents, setAllStudents]           = useState<Student[]>([])
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([])
  const [showEnroll, setShowEnroll]             = useState(false)
  const [enrollSearch, setEnrollSearch]         = useState('')
  const [selectedIds, setSelectedIds]           = useState<Set<string>>(new Set())
  const [loadingEnrolled, setLoadingEnrolled]   = useState(false)
  const [loadingLessons, setLoadingLessons]     = useState(false)

  // Lộ trình
  const [lessons, setLessons]               = useState<Lesson[]>([])
  const [showAddLesson, setShowAddLesson]   = useState(false)
  const [lessonForm, setLessonForm]         = useState({ title: '', desc: '', startDate: '', endDate: '', order: 1 })

  // Roadmap assets states
  const [lessonAssets, setLessonAssets] = useState<Record<number, { lectures: any[], exercises: any[], documents: any[] }>>({})
  const [activeLessonIdForAsset, setActiveLessonIdForAsset] = useState<number | null>(null)

  // Lecture Modal
  const [showAddLectureModal, setShowAddLectureModal] = useState(false)
  const [bgTab, setBgTab] = useState<'create' | 'reuse'>('create')
  const [bgForm, setBgForm] = useState({ title: '', content: '', fileUrl: '', type: 'Video', duration: '0 phút', order: 1 })
  const [allExistingBg, setAllExistingBg] = useState<any[]>([])



  // Document Modal
  const [showAddDocModal, setShowAddDocModal] = useState(false)
  const [docTab, setDocTab] = useState<'create' | 'reuse'>('create')
  const [docForm, setDocForm] = useState({ title: '', desc: '', content: '', fileUrl: '' })
  const [allExistingDoc, setAllExistingDoc] = useState<any[]>([])

  // Silence TypeScript TS6133 warnings
  if (false as boolean) {
    console.log(lessonAssets);
    console.log(setActiveLessonIdForAsset);
    console.log(setAllExistingBg);
    console.log(setAllExistingDoc);
    console.log(loadingLessons);
  }

  const fetchLessonAssets = async (lessonId: number) => {
    try {
      const [bgRes, exRes, tlRes] = await Promise.all([
        fetch(`${API}/baigiang/${lessonId}`).then(r => r.json()),
        fetch(`${API}/exercises/${lessonId}`).then(r => r.json()),
        fetch(`${API}/tailieu/${lessonId}`).then(r => r.json())
      ]);
      setLessonAssets(prev => ({
        ...prev,
        [lessonId]: {
          lectures: bgRes || [],
          exercises: exRes || [],
          documents: tlRes || []
        }
      }));
    } catch (err) {
      console.error("Error fetching lesson assets:", err);
    }
  };

  useEffect(() => {
    if (lessons.length > 0) {
      lessons.forEach(l => {
        fetchLessonAssets(l.id);
      });
    }
  }, [lessons]);



  const saveNewLecture = async () => {
    if (!bgForm.title.trim()) { alert('Vui lòng nhập tiêu đề!'); return }
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
      await fetch(`${API}/baigiang`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TieuDe: bgForm.title,
          NoiDung: bgForm.content,
          FileUrl: bgForm.fileUrl,
          LoaiBaiHoc: bgForm.type,
          ThoiLuong: bgForm.duration,
          TrangThai: 'published',
          TrangThaiDuyet: 'Đã duyệt',
          ThuTu: bgForm.order,
          MaKhoaHoc: detailCourse?.id,
          MaGiangVien: user.MaNguoiDung || 1,
          MaBuoiHoc: activeLessonIdForAsset
        })
      });
      setToast('Đã thêm bài giảng mới!');
      setShowAddLectureModal(false);
      if (activeLessonIdForAsset) fetchLessonAssets(activeLessonIdForAsset);
    } catch {
      alert('Lỗi khi lưu bài giảng');
    }
  }


  const saveNewDoc = async () => {
    if (!docForm.title.trim()) { alert('Vui lòng nhập tiêu đề!'); return }
    try {
      await fetch(`${API}/tailieu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TieuDe: docForm.title,
          MoTa: docForm.desc,
          NoiDung: docForm.content,
          FileUrl: docForm.fileUrl,
          MaBuoiHoc: activeLessonIdForAsset,
          TrangThai: 'Đã duyệt'
        })
      });
      setToast('Đã thêm tài liệu mới!');
      setShowAddDocModal(false);
      if (activeLessonIdForAsset) fetchLessonAssets(activeLessonIdForAsset);
    } catch {
      alert('Lỗi khi lưu tài liệu');
    }
  }

  const cloneLecture = async (originalBgId: number) => {
    try {
      const res = await fetch(`${API}/baigiang/${originalBgId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MaBuoiHoc: activeLessonIdForAsset })
      });
      const data = await res.json();
      if (res.ok) {
        setToast('Đã sao chép bài giảng!');
        setShowAddLectureModal(false);
        if (activeLessonIdForAsset) fetchLessonAssets(activeLessonIdForAsset);
      } else {
        alert(data.message || 'Lỗi khi sao chép');
      }
    } catch {
      alert('Lỗi kết nối');
    }
  }


  const cloneDoc = async (originalDocId: number) => {
    try {
      const res = await fetch(`${API}/tailieu/${originalDocId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MaBuoiHoc: activeLessonIdForAsset })
      });
      const data = await res.json();
      if (res.ok) {
        setToast('Đã sao chép tài liệu!');
        setShowAddDocModal(false);
        if (activeLessonIdForAsset) fetchLessonAssets(activeLessonIdForAsset);
      } else {
        alert(data.message || 'Lỗi khi sao chép');
      }
    } catch {
      alert('Lỗi kết nối');
    }
  }



  // Modal tạo lớp học
  const [showAddClass, setShowAddClass]       = useState(false)
  const [isEditingClass, setIsEditingClass]   = useState(false)
  const [editClassName, setEditClassName]     = useState('')
  const [editClassSchedule, setEditClassSchedule] = useState('')
  const [editClassStatus, setEditClassStatus] = useState('')
  const [addingToCourse, setAddingToCourse]   = useState<Course | null>(null)
  const [lForm, setLForm] = useState({
    name: '',
    schedule: '',
    days: '',
    daySchedules: {} as Record<string, { startTime: string; endTime: string }>,
    maxStudents: 30,
    maGiangVien: '',
    teachers: {} as Record<number, number>,
    copyFromClassId: ''
  })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteMessage, setDeleteMessage]     = useState<React.ReactNode>('')
  const [deleteAction, setDeleteAction]       = useState<(() => Promise<void>) | null>(null)

  // Helper: mở modal xác nhận xóa
  const confirmAction = (msg: React.ReactNode, action: () => Promise<void>) => {
    setDeleteMessage(msg)
    setDeleteAction(() => action)
    setShowDeleteModal(true)
  }

  // ── Helpers lớp trong form ──────────────────────────────────────────────────
  // const addClassToForm = () => {
  //   setClassesInForm(prev => [...prev, {
  //     name: '', schedule: 'Thứ 2 & 4', maxStudents: 30,
  //     maGiangVien: '',
  //     teachers: {},
  //     lessons: []
  //   }])
  // }

  const removeClassFromForm = (idx: number) => {
    setClassesInForm(prev => prev.filter((_, i) => i !== idx))
  }

  const updateClassInForm = (idx: number, field: string, value: any) => {
    setClassesInForm(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  }

  const addLessonToClass = (classIdx: number) => {
    setClassesInForm(prev => prev.map((c, i) => i === classIdx
      ? { ...c, lessons: [...c.lessons, { title: '', desc: '', startDate: '', endDate: '', order: c.lessons.length + 1 }] }
      : c
    ))
  }

  const removeLessonFromClass = (classIdx: number, buoiHocIdx: number) => {
    setClassesInForm(prev => prev.map((c, i) => i === classIdx
      ? { ...c, lessons: c.lessons.filter((_, j) => j !== buoiHocIdx) }
      : c
    ))
  }

  const updateLessonInClass = (classIdx: number, buoiHocIdx: number, field: string, value: any) => {
    setClassesInForm(prev => prev.map((c, i) => i === classIdx
      ? { ...c, lessons: c.lessons.map((l, j) => j === buoiHocIdx ? { ...l, [field]: value } : l) }
      : c
    ))
  }

  // ── Load dữ liệu ──────────────────────────────────────────────────────────────
  const loadCourses = () => {
    setLoading(true)
    fetch(`${API}/admin/khoahoc`)
      .then(r => r.json())
      .then(data => {
        const visibleData = Array.isArray(data) ? data.filter((c: any) => c.TrangThai === 'Hiển thị') : [];
        setCourses(visibleData.map((c: any) => ({
          id: c.MaKhoaHoc, title: c.TenKhoaHoc, desc: c.MoTa || '',
          level: c.TrinhDo || '', status: c.TrangThai || 'Pending',
          created: c.NgayTao ? new Date(c.NgayTao).toLocaleDateString('vi-VN') : '—',
          category: c.DanhMuc || 'Luyện thi',
          listening: !!c.Listening,
          reading: !!c.Reading,
          speaking: !!c.Speaking,
          writing: !!c.Writing,
          classCount: c.SoLop || 0
        })));
      })
      .catch(() => setToast('Lỗi tải danh sách khóa học'))
      .finally(() => setLoading(false))
  }


  useEffect(() => {
    loadCourses()
    fetch(`${API}/qtv/giangvien`).then(r => r.json()).then(setGiaoViens).catch(() => {})
  }, [])

  // Load học viên có yêu cầu chờ ghi danh vào lớp cụ thể khi mở modal ghi danh
  useEffect(() => {
    if (showEnroll && detailClass?.id) {
      setAllStudents([])
      fetch(`${API}/students/pending-enroll/${detailClass.id}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAllStudents(data.map((s: any) => ({
              id: s.MaSinhVien, name: s.HoTen,
              gender: s.GioiTinh || '—', phone: s.Lop || '—'
            })))
          }
        })
        .catch(err => console.error('Error loading pending students:', err))
    }
  }, [showEnroll, detailClass?.id])

  useEffect(() => {
    if (location.state && location.state.openClassId && location.state.openCourseId && courses.length > 0) {
      const { openClassId, openCourseId, activeTab } = location.state;
      const course = courses.find((c: any) => c.id === openCourseId);
      if (course) {
        setExpandedCourse(openCourseId);
        fetch(`${API}/course-detail/${openCourseId}/classes`)
          .then(r => r.json())
          .then(async (data) => {
            const uniqueClasses: Record<number, LopHoc> = {};
            data.forEach((c: any) => {
              if (!uniqueClasses[c.MaLopHoc]) {
                uniqueClasses[c.MaLopHoc] = {
                  id: c.MaLopHoc,
                  name: c.TenLop,
                  schedule: c.LichHoc || '—',
                  students: c.SoLuongHocVien || 0,
                  progress: c.TienDo || 0,
                  maGiangVien: null,
                  tenGiangVien: '—',
                  lessonCount: c.SoBuoiHoc || 0,
                  status: c.TrangThai || 'Chưa bắt đầu',
                  levelName: c.TenTrinhDo || '—'
                };
              }
            });
            const mapped = Object.values(uniqueClasses);
            setClassesMap(prev => ({ ...prev, [openCourseId]: mapped }));

            for (const cl of mapped) {
              try {
                const r = await fetch(`${API}/qtv/lophoc/${cl.id}/giangvien`);
                const gvs = await r.json();
                const tMap: Record<number, { maGiangVien: number; tenGiangVien: string }> = {};
                if (Array.isArray(gvs)) {
                  gvs.forEach((item: any) => {
                    tMap[item.MaKyNang] = { maGiangVien: item.MaGiangVien, tenGiangVien: item.TenGiangVien };
                  });
                }
                setClassTeachersMap(prev => ({ ...prev, [cl.id]: tMap }));
              } catch (e) {
                console.error(e);
              }
            }

            const cls = mapped.find(c => c.id === openClassId);
            if (cls) {
              openDetail(course, cls);
              if (activeTab) {
                setDetailTab(activeTab);
              }
            }
          })
          .catch(err => console.error(err));
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, courses]);

  const loadClassesForCourse = (courseId: number) => {
    if (classesMap[courseId]) return
    fetch(`${API}/course-detail/${courseId}/classes`)
      .then(r => r.json())
      .then(async (data) => {
        const uniqueClasses: Record<number, LopHoc> = {}
        data.forEach((c: any) => {
          if (!uniqueClasses[c.MaLopHoc]) {
            uniqueClasses[c.MaLopHoc] = {
              id: c.MaLopHoc, name: c.TenLop, schedule: c.LichHoc || '—',
              students: c.SoLuongHocVien || 0, progress: c.TienDo || 0,
              maGiangVien: null, tenGiangVien: '—',
              lessonCount: c.SoBuoiHoc || 0,
              status: c.TrangThai || 'Chưa bắt đầu',
              levelName: c.TenTrinhDo || '—'
            }
          }
        })
        const mapped = Object.values(uniqueClasses)
        setClassesMap(prev => ({ ...prev, [courseId]: mapped }))

        // Fetch teachers for each class
        for (const cl of mapped) {
          try {
            const r = await fetch(`${API}/qtv/lophoc/${cl.id}/giangvien`)
            const gvs = await r.json()
            const tMap: Record<number, { maGiangVien: number; tenGiangVien: string }> = {}
            if (Array.isArray(gvs)) {
              gvs.forEach((item: any) => {
                tMap[item.MaKyNang] = { maGiangVien: item.MaGiangVien, tenGiangVien: item.TenGiangVien }
              })
            }
            setClassTeachersMap(prev => ({ ...prev, [cl.id]: tMap }))
          } catch (e) {
            console.error(e)
          }
        }
      })
      .catch(() => {})
  }

  const toggleExpandCourse = (courseId: number) => {
    if (expandedCourse === courseId) { setExpandedCourse(null); return }
    setExpandedCourse(courseId)
    loadClassesForCourse(courseId)
  }

  // ── CRUD khóa học ─────────────────────────────────────────────────────────────


  const saveCourse = async () => {
    if (!cForm.title.trim()) { alert('Vui lòng nhập tên khóa học!'); return }
    if (!cForm.listening && !cForm.reading && !cForm.speaking && !cForm.writing) {
      alert('Vui lòng chọn ít nhất một kỹ năng!');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    try {
      let courseId = editCourse?.id

      if (editCourse) {
        await fetch(`${API}/admin/khoahoc/${editCourse.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            TenKhoaHoc: cForm.title,
            MoTa: cForm.desc,
            TrinhDo: cForm.level,
            Listening: cForm.listening ? 1 : 0,
            Reading: cForm.reading ? 1 : 0,
            Speaking: cForm.speaking ? 1 : 0,
            Writing: cForm.writing ? 1 : 0
          })
        })
        setToast('Đã lưu khóa học!')
      } else {
        const res = await fetch(`${API}/qtv/khoahoc`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            TenKhoaHoc: cForm.title,
            MoTa: cForm.desc,
            TrinhDo: cForm.level,
            MaNguoiDung: user.MaNguoiDung || 6,
            Listening: cForm.listening ? 1 : 0,
            Reading: cForm.reading ? 1 : 0,
            Speaking: cForm.speaking ? 1 : 0,
            Writing: cForm.writing ? 1 : 0
          })
        })
        const data = await res.json()
        courseId = data.MaKhoaHoc

        const kcRes = await fetch(`${API}/qtv/khoahocchitiet`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ TenLop: cForm.title, MoTa: cForm.desc, MaKhoaHoc: courseId })
        })
        const kcData = await kcRes.json()
        const maLop = kcData.MaLop

        for (const cls of classesInForm) {
          if (!cls.name.trim()) continue

          await fetch(`${API}/qtv/lophoc`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              TenLop: cls.name,
              MaLop: maLop,
              LichHoc: cls.schedule,
              SoLuongHocVien: null,
              teachers: cls.teachers // Pass the teachers object!
            })
          })

          const clsRes = await fetch(`${API}/course-detail/${courseId}/classes`)
          const clsData = await clsRes.json()
          const newCls = clsData[clsData.length - 1]

          if (newCls && cls.lessons.length > 0) {
            for (const lesson of cls.lessons) {
              if (!lesson.title.trim()) continue
              await fetch(`${API}/qtv/buoihoc`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  TenBuoiHoc: lesson.title, MaLopHoc: newCls.MaLopHoc,
                  MoTa: lesson.desc, NgayBatDau: lesson.startDate || null,
                  NgayKetThuc: lesson.endDate || null, ThuTu: lesson.order
                })
              })
            }
          }
        }

        setToast('Đã tạo khóa học!')
      }

      if (courseId) {
        for (const gv of selectedGVsForCourse) {
          await fetch(`${API}/qtv/khoahoc/${courseId}/giangvien`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ MaGiangVien: gv.MaGiangVien })
          }).catch(() => {})
        }
      }

      setShowCourseModal(false); setEditCourse(null); setClassesInForm([])
      loadCourses()
      setClassesMap(prev => { const n = { ...prev }; if (courseId) delete n[courseId]; return n })
    } catch { alert('Lỗi khi lưu khóa học') }
  }

  const deleteCourse = (id: number) => {
    confirmAction('Bạn có chắc chắn muốn xóa khóa học này?', async () => {
      try {
        const res = await fetch(`${API}/qtv/khoahoc/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setToast('Đã xóa khóa học!')
          loadCourses()
        } else {
          const errText = await res.text()
          alert('Lỗi khi xóa khóa học: ' + errText)
        }
      } catch (err: any) {
        console.error(err)
        alert('Lỗi kết nối khi xóa khóa học: ' + err.message)
      }
    })
  }

  const gvNotSelected = giaoViens.filter(gv => !selectedGVsForCourse.some(s => s.MaGiangVien === gv.MaNguoiDung))

  const addGVToCourseForm = () => {
    if (!addGVSelect) return
    const gv = giaoViens.find(g => g.MaNguoiDung === Number(addGVSelect))
    if (gv) {
      setSelectedGVsForCourse(prev => [...prev, { MaGiangVien: gv.MaNguoiDung, HoTen: gv.HoTen }])
      setAddGVSelect('')
    }
  }

  // ── Kỹ năng ───────────────────────────────────────────────────────────────────
  const assignTeacherForSkill = async (classId: number, skillId: number, teacherId: number) => {
    try {
      const currentTeachers = classTeachersMap[classId] || {};
      const newTeachersObj: Record<number, number> = {};
      Object.keys(currentTeachers).forEach(k => {
        const sId = Number(k);
        if (currentTeachers[sId]?.maGiangVien) {
          newTeachersObj[sId] = currentTeachers[sId].maGiangVien;
        }
      });
      if (teacherId > 0) {
        newTeachersObj[skillId] = teacherId;
      } else {
        delete newTeachersObj[skillId];
      }
      await fetch(`${API}/qtv/lophoc/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teachers: newTeachersObj })
      });
      const r = await fetch(`${API}/qtv/lophoc/${classId}/giangvien`)
      const gvs = await r.json()
      const tMap: Record<number, { maGiangVien: number; tenGiangVien: string }> = {}
      if (Array.isArray(gvs)) {
        gvs.forEach((item: any) => {
          tMap[item.MaKyNang] = { maGiangVien: item.MaGiangVien, tenGiangVien: item.TenGiangVien }
        })
      }
      setClassTeachersMap(prev => ({ ...prev, [classId]: tMap }))
      setToast('Đã phân công giáo viên!');
    } catch { alert('Lỗi khi phân công giáo viên') }
  }

  const deleteClass = (courseId: number, classId: number) => {
    confirmAction('Bạn có chắc chắn muốn xóa lớp học này?', async () => {
      try {
        const res = await fetch(`${API}/qtv/lophoc/${classId}`, { method: 'DELETE' })
        if (res.ok) {
          setClassesMap(prev => ({ ...prev, [courseId]: (prev[courseId] || []).filter(cl => cl.id !== classId) }))
          setToast('Đã xóa lớp học!')
          closeDetail()
        } else {
          const errText = await res.text()
          alert('Lỗi khi xóa lớp học: ' + errText)
        }
      } catch (err: any) {
        console.error(err)
        alert('Lỗi kết nối khi xóa lớp học: ' + err.message)
      }
    })
  }

  const saveClass = async () => {
    if (!lForm.name.trim()) { alert('Vui lòng nhập tên lớp!'); return }
    if (!lForm.days) { alert('Vui lòng chọn lịch học (ngày học)!'); return }
    if (!addingToCourse) return
    try {
      const finalSchedule = serializeSchedule(lForm.days, lForm.daySchedules)
      const res = await fetch(`${API}/courses/${addingToCourse.id}/details`)
      const details = await res.json()
      let maLop = details[0]?.MaLop
      if (!maLop) {
        const r = await fetch(`${API}/qtv/khoahocchitiet`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ TenLop: addingToCourse.title, MoTa: addingToCourse.desc, MaKhoaHoc: addingToCourse.id })
        })
        const d = await r.json(); maLop = d.MaLop
      }
      const classResponse = await fetch(`${API}/qtv/lophoc`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenLop: lForm.name,
          MaLop: maLop,
          LichHoc: finalSchedule,
          SoLuongHocVien: null,
          CopyFromClassId: lForm.copyFromClassId ? Number(lForm.copyFromClassId) : null,
          teachers: lForm.teachers // Pass the teachers object!
        })
      })
      await classResponse.json()
      setToast('Đã tạo lớp học!'); setShowAddClass(false)
      setLForm({ name: '', schedule: '', days: '', daySchedules: {}, maxStudents: 30, maGiangVien: '', teachers: {}, copyFromClassId: '' })
      setClassesMap(prev => { const n = { ...prev }; delete n[addingToCourse.id]; return n })
      loadClassesForCourse(addingToCourse.id)
    } catch { alert('Lỗi khi tạo lớp học') }
  }

  // ── Detail modal ──────────────────────────────────────────────────────────────
  const closeDetail = () => {
    setShowDetail(false)
    sessionStorage.removeItem('lastOpenClassId')
    sessionStorage.removeItem('lastOpenCourseId')
    sessionStorage.removeItem('lastOpenTab')
  }

  const openDetail = (course: Course, cls: LopHoc) => {
    setDetailCourse(course); setDetailClass(cls); setDetailTab('info')
    setEditClassName(cls.name)
    setEditClassSchedule(cls.schedule)
    setEditClassStatus(cls.status)
    setIsEditingClass(false)
    setShowDetail(true); setShowEnroll(false); setShowAddLesson(false)
    sessionStorage.setItem('lastOpenClassId', String(cls.id));
    sessionStorage.setItem('lastOpenCourseId', String(course.id));
    sessionStorage.setItem('lastOpenTab', 'info');
    setLoadingEnrolled(true)
    fetch(`${API}/lophoc/${cls.id}/sinhvien`).then(r => r.json())
      .then(data => setEnrolledStudents(data.map((s: any) => ({
        studentId: s.MaSinhVien, name: s.HoTen, gender: s.GioiTinh || '—',
        phone: s.SoDienThoai || '—', enrollDate: s.NgayGhiDanh || '—', status: s.TrangThai || 'Đang học'
      }))))
      .catch(() => setEnrolledStudents([]))
      .finally(() => setLoadingEnrolled(false))
    setLoadingLessons(true)
    fetch(`${API}/classes/${cls.id}/buoihoc`).then(r => r.json())
      .then(data => setLessons(data.map((l: any) => ({
        id: l.MaBuoiHoc, title: l.TenBuoiHoc, desc: l.MoTa || '',
        startDate: l.NgayBatDau || '', endDate: l.NgayKetThuc || '', order: l.ThuTu || 0
      })).sort((a: Lesson, b: Lesson) => a.order - b.order)))
      .catch(() => setLessons([]))
      .finally(() => setLoadingLessons(false))
  }

  const handleSaveClassEdit = async () => {
    if (!editClassName.trim()) { alert('Vui lòng nhập tên lớp!'); return }
    if (!detailClass || !detailCourse) return
    try {
      const res = await fetch(`${API}/qtv/lophoc/${detailClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenLop: editClassName,
          LichHoc: editClassSchedule,
          TrangThai: editClassStatus
        })
      })
      if (res.ok) {
        setToast('Đã cập nhật thông tin lớp học!')
        const updatedClass = {
          ...detailClass,
          name: editClassName,
          schedule: editClassSchedule,
          status: editClassStatus
        }
        setDetailClass(updatedClass)
        setIsEditingClass(false)
        setClassesMap(prev => {
          const n = { ...prev }
          if (n[detailCourse.id]) {
            n[detailCourse.id] = n[detailCourse.id].map(cl => cl.id === detailClass.id ? updatedClass : cl)
          }
          return n
        })
      } else {
        const txt = await res.text()
        alert('Lỗi khi cập nhật lớp học: ' + txt)
      }
    } catch (err: any) {
      console.error(err)
      alert('Lỗi kết nối: ' + err.message)
    }
  }

  // ── Ghi danh ─────────────────────────────────────────────────────────────────
  const enrolledIds = new Set(enrolledStudents.map(s => s.studentId))
  const availableStudents = allStudents.filter(s =>
    !enrolledIds.has(s.id) &&
    (!enrollSearch || s.name.toLowerCase().includes(enrollSearch.toLowerCase()) || s.id.toLowerCase().includes(enrollSearch.toLowerCase()))
  )

  const confirmEnroll = async () => {
    if (!detailClass || selectedIds.size === 0) return
    try {
      const addedStudents: any[] = []
      const errorMessages: string[] = []
      for (const studentId of selectedIds) {
        try {
          const res = await fetch(`${API}/qtv/lophoc/${detailClass.id}/ghidanh`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ MaSinhVien: studentId })
          })
          const data = await res.json()
          if (res.ok && data.message && data.message.includes("thành công")) {
            const s = allStudents.find(st => st.id === studentId)
            if (s) {
              addedStudents.push({
                studentId: s.id, name: s.name, gender: s.gender, phone: s.phone,
                enrollDate: new Date().toLocaleDateString('vi-VN'), status: 'Đang học'
              })
            }
          } else {
            errorMessages.push(`${studentId}: ${data.message || 'Lỗi khi ghi danh'}`)
          }
        } catch {
          errorMessages.push(`${studentId}: Lỗi kết nối`)
        }
      }
      if (addedStudents.length > 0) {
        setEnrolledStudents(prev => [...prev, ...addedStudents])
        setToast(`Đã ghi danh ${addedStudents.length} sinh viên!`)
      }
      if (errorMessages.length > 0) {
        alert(`Lỗi ghi danh:\n${errorMessages.join('\n')}`)
      }
      setShowEnroll(false); setSelectedIds(new Set()); setEnrollSearch('')
    } catch { alert('Lỗi khi ghi danh') }
  }

  const removeEnrolled = (studentId: string) => {
    if (!detailClass) return
    confirmAction('Bạn có chắc chắn muốn hủy ghi danh sinh viên này?', async () => {
      await fetch(`${API}/qtv/lophoc/${detailClass.id}/ghidanh/${studentId}`, { method: 'DELETE' })
      setEnrolledStudents(prev => prev.filter(s => s.studentId !== studentId))
      setToast('Đã hủy ghi danh!')
    })
  }

  // ── Lộ trình ──────────────────────────────────────────────────────────────────
  const saveLesson = async () => {
    if (!lessonForm.title.trim()) { alert('Vui lòng nhập tên buổi học!'); return }
    if (!detailClass) return
    try {
      await fetch(`${API}/qtv/buoihoc`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenBuoiHoc: lessonForm.title, MaLopHoc: detailClass.id, MoTa: lessonForm.desc,
          NgayBatDau: lessonForm.startDate || null, NgayKetThuc: lessonForm.endDate || null, ThuTu: lessonForm.order
        })
      })
      setToast('Đã thêm buổi học!'); setShowAddLesson(false)
      if (detailCourse) {
        setClassesMap(prev => ({
          ...prev,
          [detailCourse.id]: (prev[detailCourse.id] || []).map(cl =>
            cl.id === detailClass.id ? { ...cl, lessonCount: cl.lessonCount + 1 } : cl
          )
        }))
      }
      fetch(`${API}/classes/${detailClass.id}/buoihoc`).then(r => r.json())
        .then(data => setLessons(data.map((l: any) => ({
          id: l.MaBuoiHoc, title: l.TenBuoiHoc, desc: l.MoTa || '',
          startDate: l.NgayBatDau || '', endDate: l.NgayKetThuc || '', order: l.ThuTu || 0
        })).sort((a: Lesson, b: Lesson) => a.order - b.order)))
    } catch { alert('Lỗi khi thêm buổi học') }
  }



  // ── Pending regs ──────────────────────────────────────────────────────────────


  // Trích xuất các cấp độ duy nhất từ danh sách khóa học thực tế (tách theo dấu phẩy)
  /*
  const uniqueLevels = useMemo(() => {
    const levelsSet = new Set<string>();
    courses.forEach(c => {
      if (c.level) {
        c.level.split(',').forEach(l => {
          const trimmed = l.trim();
          if (trimmed) {
            levelsSet.add(trimmed);
          }
        });
      }
    });
    return Array.from(levelsSet).sort((a, b) => a.localeCompare(b));
  }, [courses]);
  */

  const filtered = courses.filter(c =>
    (!search || c.title.toLowerCase().includes(search.toLowerCase())) &&
    (!levelFilter || (c.level && c.level.split(',').map(s => s.trim()).includes(levelFilter)))
  )





  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Quản lý toàn bộ khóa học</h1>
        <p>Thêm mới, sửa, xóa lớp học · Phân công giáo viên · Ghi danh sinh viên · Lộ trình học</p>
      </div>

      <div className={styles.content}>
        {/* Stats */}
        <div className={styles.statRow}>
          <div className={`${styles.statCard} ${styles.statMint} ${styles.statCardClickable}`} onClick={() => navigate("/QTV/kho-hoc-lieu")}>
            <div className={styles.statLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPackage style={{ color: '#000080' }} /> Kho học liệu <FiChevronRight /></div>
            <div className={styles.statValue} style={{ fontSize: '13px', fontWeight: 'normal', color: '#64748b', marginTop: '6px' }}>Quản lý bài giảng / bài tập / tài liệu</div>
          </div>
        </div>

        {/* Search bar below stats */}
        <div className={styles.searchWrap}>
          <div className={styles.searchBox}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm khóa học..." />
            <button className={styles.searchBtn}><FiSearch /></button>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div><h3>Danh sách khóa học</h3><p>Bấm vào số lớp để xem · Bấm "Chi tiết" để ghi danh và lộ trình</p></div>
          </div>

          {loading ? (
            <div style={{ padding:40, textAlign:'center', color:'#999' }}>Đang tải dữ liệu...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>TÊN KHÓA HỌC</th>
                  <th>TRÌNH ĐỘ</th>
                  <th>LỚP HỌC</th>
                  <th>NGÀY TẠO</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className={styles.empty}>Không có khóa học nào</td></tr>
                ) : filtered.map(c => (
                  <React.Fragment key={c.id}>
                    <tr>
                      <td>
                        <div className={styles.courseTitle}>{c.title}</div>
                        <div className={styles.courseCat}>{c.category} · {c.desc.slice(0,50)}{c.desc.length > 50 ? '...' : ''}</div>
                      </td>
                      <td><span className={styles.levelText}>{c.level}</span></td>
                      <td>
                        <button className={styles.classBadgeBtn} onClick={() => toggleExpandCourse(c.id)}>
                          <FiChevronDown style={{ marginRight: 4, transform: expandedCourse === c.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                          {classesMap[c.id] ? classesMap[c.id].length : c.classCount} lớp
                        </button>
                      </td>
                      <td>{c.created}</td>

                    </tr>
                    {expandedCourse === c.id && (
                      <tr>
                        <td colSpan={4} className={styles.expandedCell}>
                          <div style={{ padding: '20px 24px', border: '1.5px solid #cbd5e1', borderRadius: '12px', background: '#ffffff', margin: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#000080', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DANH SÁCH LỚP HỌC</h4>
                              <button 
                                style={{
                                  background: '#F95800',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                onClick={() => {
                                  setAddingToCourse(c);
                                  setLForm({ name: '', schedule: 'Thứ 2 & 4', days: '', daySchedules: {}, maxStudents: 30, maGiangVien: '', teachers: {}, copyFromClassId: '' });
                                  setShowAddClass(true);
                                }}
                              >
                                <FiPlus size={16} /> Thêm lớp mới
                              </button>
                            </div>

                            {(classesMap[c.id] || []).length === 0 ? (
                              <div className={styles.expandEmpty}>Chưa có lớp học nào.</div>
                            ) : (
                              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                                <style>{`
                                  .qtv-subclass-table th {
                                    background: #e0f2fe !important;
                                    color: #1e3a8a !important;
                                    border-bottom: 1.5px solid #cbd5e1 !important;
                                  }
                                `}</style>
                                <table className="qtv-subclass-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                  <thead>
                                    <tr style={{ background: '#e0f2fe', borderBottom: '1.5px solid #cbd5e1' }}>
                                      <th style={{ padding: '12px 18px', fontWeight: 700, color: '#1e3a8a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', width: '22%', background: '#e0f2fe' }}>Tên lớp học</th>
                                      <th style={{ padding: '12px 18px', fontWeight: 700, color: '#1e3a8a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', width: '12%', background: '#e0f2fe' }}>Mã lớp học</th>
                                      <th style={{ padding: '12px 18px', fontWeight: 700, color: '#1e3a8a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', width: '25%', background: '#e0f2fe' }}>Trình độ</th>
                                      <th style={{ padding: '12px 18px', fontWeight: 700, color: '#1e3a8a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', width: '18%', background: '#e0f2fe' }}>Lịch học</th>
                                      <th style={{ padding: '12px 18px', fontWeight: 700, color: '#1e3a8a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', width: '10%', background: '#e0f2fe' }}>Sĩ số</th>
                                      <th style={{ padding: '12px 18px', fontWeight: 700, color: '#1e3a8a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', width: '13%', textAlign: 'right', background: '#e0f2fe' }}>Trạng thái</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(classesMap[c.id] || []).map(cl => (
                                      <tr 
                                        key={cl.id} 
                                        onClick={() => openDetail(c, cl)}
                                        style={{ 
                                          background: '#ffffff',
                                          borderBottom: '1px solid #cbd5e1', 
                                          cursor: 'pointer',
                                          transition: 'background 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
                                      >
                                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a', fontSize: '14px', verticalAlign: 'middle' }}>{cl.name}</td>
                                        <td style={{ padding: '14px 18px', color: '#f95800', fontWeight: 600, fontSize: '13.5px', verticalAlign: 'middle' }}>{cl.id}</td>
                                        <td style={{ padding: '14px 18px', color: '#475569', fontSize: '13px', verticalAlign: 'middle' }}>{cl.levelName}</td>
                                        <td style={{ padding: '14px 18px', color: '#475569', fontSize: '13px', verticalAlign: 'middle' }}>{formatScheduleOnlyDays(cl.schedule)}</td>
                                        <td style={{ padding: '14px 18px', color: '#475569', fontSize: '13px', verticalAlign: 'middle' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FiUsers size={16} style={{ color: '#64748b' }} /> {cl.students}
                                          </div>
                                        </td>
                                        <td style={{ padding: '14px 18px', textAlign: 'right', verticalAlign: 'middle' }}>
                                          <span style={{ 
                                            fontWeight: 600, 
                                            fontSize: '13px',
                                            color: cl.status === 'Đã hoàn thành' ? '#22c55e' : cl.status === 'Đang diễn ra' ? '#0284c7' : '#f97316' 
                                          }}>
                                            {cl.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ════ MODAL: TẠO / SỬA KHÓA HỌC ════ */}
      {showCourseModal && (
        <div className={styles.overlay}>
          <div className={styles.modalXL}>
            <div className={styles.modalTop}>
              <div><h3>{editCourse ? 'Sửa thông tin khóa học' : 'Tạo khóa học mới'}</h3></div>
              <button className={styles.modalClose} onClick={() => { setShowCourseModal(false); setEditCourse(null) }}><FiX size={20} /></button>
            </div>
            <p className={styles.modalSub}>Điền đầy đủ thông tin và phân công giáo viên</p>

            <div className={styles.sectionLabel}>Thông tin khoá học</div>
            <div className={styles.formGroup}>
              <label>Tên khoá học <span className={styles.req}>*</span></label>
              <input value={cForm.title} onChange={e => setCForm(p => ({...p, title: e.target.value}))} placeholder="VD: TOEIC 650+ Intensive" />
            </div>
            <div className={styles.twoCols}>
              <div className={styles.formGroup}><label>Trình độ</label>
                <select value={cForm.level} onChange={e => setCForm(p => ({...p, level: e.target.value}))}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}><label>Danh mục</label>
                <select value={cForm.category} onChange={e => setCForm(p => ({...p, category: e.target.value}))}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Kỹ năng <span className={styles.req}>*</span></label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '6px', marginBottom: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#333' }}>
                  <input
                    type="checkbox"
                    checked={cForm.listening}
                    disabled={!!(editCourse && ((editCourse.classCount && editCourse.classCount > 0) || (classesMap[editCourse.id] && classesMap[editCourse.id].length > 0)))}
                    onChange={e => setCForm(p => ({ ...p, listening: e.target.checked }))}
                  />
                  Listening
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#333' }}>
                  <input
                    type="checkbox"
                    checked={cForm.reading}
                    disabled={!!(editCourse && ((editCourse.classCount && editCourse.classCount > 0) || (classesMap[editCourse.id] && classesMap[editCourse.id].length > 0)))}
                    onChange={e => setCForm(p => ({ ...p, reading: e.target.checked }))}
                  />
                  Reading
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#333' }}>
                  <input
                    type="checkbox"
                    checked={cForm.speaking}
                    disabled={!!(editCourse && ((editCourse.classCount && editCourse.classCount > 0) || (classesMap[editCourse.id] && classesMap[editCourse.id].length > 0)))}
                    onChange={e => setCForm(p => ({ ...p, speaking: e.target.checked }))}
                  />
                  Speaking
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#333' }}>
                  <input
                    type="checkbox"
                    checked={cForm.writing}
                    disabled={!!(editCourse && ((editCourse.classCount && editCourse.classCount > 0) || (classesMap[editCourse.id] && classesMap[editCourse.id].length > 0)))}
                    onChange={e => setCForm(p => ({ ...p, writing: e.target.checked }))}
                  />
                  Writing
                </label>
              </div>
              {editCourse && ((editCourse.classCount && editCourse.classCount > 0) || (classesMap[editCourse.id] && classesMap[editCourse.id].length > 0)) ? (
                <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                  ⚠ Không thể thay đổi kỹ năng của khóa khi đã có lớp trong khóa!
                </div>
              ) : null}
            </div>
            <div className={styles.formGroup}>
              <label>Mô tả</label>
              <textarea value={cForm.desc} onChange={e => setCForm(p => ({...p, desc: e.target.value}))} placeholder="Mô tả ngắn về nội dung khóa học..." rows={3} />
            </div>

            {/* Phân công GV */}
            <div className={styles.sectionLabel}>Phân công giáo viên</div>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <select value={addGVSelect} onChange={e => setAddGVSelect(e.target.value)}
                style={{ flex:1, fontSize:13, padding:'6px 10px', borderRadius:6, border:'1px solid #ddd' }}>
                <option value="">— Chọn giáo viên để thêm —</option>
                {gvNotSelected.map(gv => <option key={gv.MaNguoiDung} value={gv.MaNguoiDung}>{gv.HoTen}</option>)}
              </select>
              <button className={styles.btnPrimary} onClick={addGVToCourseForm} disabled={!addGVSelect} style={{ opacity: addGVSelect ? 1 : 0.5 }}>
                + Thêm
              </button>
            </div>
            {selectedGVsForCourse.length === 0 ? (
              <div className={styles.draftEmpty}>Chưa có giáo viên nào được phân công.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
                {selectedGVsForCourse.map((gv, idx) => (
                  <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'#f8f9fa', borderRadius:8, border:'1px solid #e9ecef' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontWeight:500, fontSize:14 }}>{gv.HoTen}</span>
                    </div>
                    <button className={styles.btnDanger} style={{ fontSize:12, padding:'3px 8px' }}
                      onClick={() => setSelectedGVsForCourse(prev => prev.filter((_, i) => i !== idx))}>Xóa</button>
                  </div>
                ))}
              </div>
            )}

            {/* Lớp học + Buổi học — chỉ hiện khi tạo mới */}
            {!editCourse && (
              <>
                <div className={styles.sectionLabel}>Lớp học & Lộ trình</div>
                <p className={styles.modalSub} style={{ marginBottom: 10 }}>
                  Tạo sẵn lớp học và các buổi học ngay khi tạo khóa.
                </p>

                {classesInForm.map((cls, classIdx) => (
                  <div key={classIdx} style={{ background: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid #e9ecef' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <strong style={{ fontSize: 14 }}>Lớp {classIdx + 1}</strong>
                      <button className={styles.btnDanger} style={{ fontSize: 12, padding: '3px 8px' }}
                        onClick={() => removeClassFromForm(classIdx)}>✕ Xóa lớp</button>
                    </div>

                    <div className={styles.twoCols}>
                      <div className={styles.formGroup}>
                        <label>Tên lớp *</label>
                        <input value={cls.name}
                          onChange={e => updateClassInForm(classIdx, 'name', e.target.value)}
                          placeholder="VD: Lớp TOEIC-01" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Lịch học</label>
                        <div className={styles.weekdaySelector}>
                          {DAYS_OF_WEEK.map(d => {
                            const isSelected = getSelectedDaysFromSchedule(cls.schedule).includes(d.value);
                            return (
                              <button
                                key={d.value}
                                type="button"
                                className={`${styles.weekdayBtn} ${isSelected ? styles.weekdayBtnActive : ''}`}
                                onClick={() => {
                                  const newSchedule = toggleDayInSchedule(d.value, cls.schedule);
                                  updateClassInForm(classIdx, 'schedule', newSchedule);
                                }}
                              >
                                {d.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>

                      <div className={styles.formGroup}>
                        <label style={{ marginBottom: 6, display: 'block' }}>Phân công giảng viên theo kỹ năng</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                          {['Listening', 'Reading', 'Speaking', 'Writing'].map(skill => {
                            const isChecked = cForm[skill.toLowerCase() as 'listening' | 'reading' | 'speaking' | 'writing'];
                            if (!isChecked) return null;
                            const skillId = getSkillId(skill);
                            return (
                              <div key={skill} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#555', minWidth: '80px' }}>{skill}:</span>
                                <select
                                  value={cls.teachers?.[skillId] || ''}
                                  onChange={e => {
                                    const val = e.target.value ? Number(e.target.value) : 0;
                                    const updatedTeachers = { ...(cls.teachers || {}), [skillId]: val };
                                    updateClassInForm(classIdx, 'teachers', updatedTeachers);
                                  }}
                                  style={{ flex: 1, padding: '4px 24px 4px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                                >
                                  <option value="">Chưa phân công</option>
                                  {giaoViens.map(gv => (
                                    <option key={gv.MaGiangVien} value={gv.MaGiangVien}>{gv.HoTen}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Buổi học */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>📚 Buổi học ({cls.lessons.length})</span>
                        <button className={styles.btnPrimary} style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={() => addLessonToClass(classIdx)}>+ Thêm buổi</button>
                      </div>

                      {cls.lessons.map((lesson, buoiHocIdx) => (
                        <div key={buoiHocIdx} style={{ background: 'white', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #e0e0e0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: '#f58220', fontWeight: 600 }}>Buổi {buoiHocIdx + 1}</span>
                            <button className={styles.btnDanger} style={{ fontSize: 11, padding: '2px 6px' }}
                              onClick={() => removeLessonFromClass(classIdx, buoiHocIdx)}>✕</button>
                          </div>
                          <div className={styles.formGroup}>
                            <label>Tên buổi học *</label>
                            <input value={lesson.title}
                              onChange={e => updateLessonInClass(classIdx, buoiHocIdx, 'title', e.target.value)}
                              placeholder="VD: Buổi 1: Từ vựng nền tảng" />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Mô tả</label>
                            <input value={lesson.desc}
                              onChange={e => updateLessonInClass(classIdx, buoiHocIdx, 'desc', e.target.value)}
                              placeholder="Nội dung buổi học..." />
                          </div>

                        </div>
                      ))}

                      {cls.lessons.length === 0 && (
                        <div style={{ fontSize: 12, color: '#aaa', textAlign: 'center', padding: '8px 0' }}>
                          Chưa có buổi học nào. Nhấn "+ Thêm buổi" để thêm.
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {editCourse && (
                  <button
                    className={styles.btnPrimary}
                    style={{ marginTop: '12px', fontSize: '13px' }}
                    onClick={() => {
                      setAddingToCourse(editCourse);
                      setLForm({
                        name: '',
                        schedule: '',
                        days: '',
                        daySchedules: {},
                        maxStudents: 30,
                        maGiangVien: '',
                        teachers: {},
                        copyFromClassId: ''
                      });
                      setShowAddClass(true);
                    }}
                  >
                    + Thêm lớp học
                  </button>
                )}
              </>
            )}

            <div className={styles.modalFooter}>
              <button className={styles.btnOutline} onClick={() => { setShowCourseModal(false); setEditCourse(null) }}>Hủy</button>
              {editCourse && <button className={styles.btnDanger} onClick={() => { deleteCourse(editCourse.id); setShowCourseModal(false) }}>Xóa khóa học</button>}
              <button className={styles.btnPrimary} onClick={saveCourse}>{editCourse ? 'Lưu thay đổi' : 'Tạo khóa học'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: TẠO LỚP HỌC ════ */}
      {showAddClass && addingToCourse && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalTop}>
              <div><h3>Tạo lớp học mới</h3><div className={styles.modalSub}>{addingToCourse.title}</div></div>
              <button className={styles.modalClose} onClick={() => setShowAddClass(false)}><FiX size={20} /></button>
            </div>
            <div className={styles.formGroup}>
              <label>Tên lớp <span className={styles.req}>*</span></label>
              <input value={lForm.name} onChange={e => setLForm(p => ({...p, name: e.target.value}))} placeholder="VD: Lớp TOEIC-01" />
            </div>
            <div className={styles.formGroup}>
              <label style={{ marginBottom: 6, display: 'block' }}>Phân công giảng viên theo kỹ năng</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8f9fa', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                {['Listening', 'Reading', 'Speaking', 'Writing'].map(skill => {
                  const isRequired = addingToCourse[skill.toLowerCase() as 'listening' | 'reading' | 'speaking' | 'writing'];
                  if (!isRequired) return null;
                  const skillId = getSkillId(skill);
                  return (
                    <div key={skill} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#555', minWidth: '80px' }}>{skill}:</span>
                      <select
                        value={lForm.teachers?.[skillId] || ''}
                        onChange={e => {
                          const val = e.target.value ? Number(e.target.value) : 0;
                          setLForm(prev => ({
                            ...prev,
                            teachers: {
                              ...prev.teachers,
                              [skillId]: val
                            }
                          }));
                        }}
                        style={{ flex: 1, padding: '6px 24px 6px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                      >
                        <option value="">Chưa phân công</option>
                        {giaoViens.map(gv => (
                          <option key={gv.MaGiangVien} value={gv.MaGiangVien}>{gv.HoTen}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
              {!giaoViens.length && (
                <div style={{ fontSize:12, color:'#f57c00', marginTop:4 }}>⚠ Hệ thống chưa có giáo viên nào.</div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Sao chép lộ trình từ lớp cũ</label>
              <select value={lForm.copyFromClassId} onChange={e => setLForm(p => ({...p, copyFromClassId: e.target.value}))}>
                <option value="">— Không sao chép (Lớp lộ trình trống) —</option>
                {(classesMap[addingToCourse.id] || []).map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginTop: '16px' }}>
              <label style={{ marginBottom: '8px', display: 'block', fontWeight: 600 }}>Lịch học</label>
              <div className={styles.weekdaySelector} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {DAYS_OF_WEEK.map(d => {
                  const isSelected = lForm.days.split(',').map(x => x.trim()).filter(Boolean).includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      className={`${styles.weekdayBtn} ${isSelected ? styles.weekdayBtnActive : ''}`}
                      onClick={() => {
                        const newDays = lForm.days.split(',').map(x => x.trim()).filter(Boolean);
                        const newDaySchedules = { ...lForm.daySchedules };
                        if (newDays.includes(d.value)) {
                          const filteredDays = newDays.filter(day => day !== d.value);
                          delete newDaySchedules[d.value];
                          setLForm(p => ({ ...p, days: filteredDays.join(', '), daySchedules: newDaySchedules }));
                        } else {
                          newDays.push(d.value);
                          newDaySchedules[d.value] = { startTime: '07:00', endTime: '08:30' };
                          setLForm(p => ({ ...p, days: newDays.join(', '), daySchedules: newDaySchedules }));
                        }
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>

              {lForm.days.split(',').map(x => x.trim()).filter(Boolean).map(day => {
                const sched = lForm.daySchedules[day] || { startTime: '07:00', endTime: '08:30' };
                return (
                  <div key={day} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ minWidth: '70px', fontWeight: 600, fontSize: '13px', color: '#555' }}>{day}:</span>
                    <select
                      value={sched.startTime}
                      onChange={e => {
                        const val = e.target.value;
                        setLForm(p => ({
                          ...p,
                          daySchedules: {
                            ...p.daySchedules,
                            [day]: { ...sched, startTime: val }
                          }
                        }));
                      }}
                      style={{ padding: '6px 24px 6px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                    >
                      {START_TIME_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: '13px', color: '#888' }}>đến</span>
                    <select
                      value={sched.endTime}
                      onChange={e => {
                        const val = e.target.value;
                        setLForm(p => ({
                          ...p,
                          daySchedules: {
                            ...p.daySchedules,
                            [day]: { ...sched, endTime: val }
                          }
                        }));
                      }}
                      style={{ padding: '6px 24px 6px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                    >
                      {END_TIME_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                );
              })}

              {lForm.days && (
                <div style={{ fontSize: '12px', color: '#f58220', marginTop: '8px', fontWeight: 500 }}>
                  Đã chọn: {serializeSchedule(lForm.days, lForm.daySchedules)}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnOutline} onClick={() => setShowAddClass(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={saveClass}>Tạo lớp học</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: CHI TIẾT ════ */}
      {showDetail && detailClass && detailCourse && !showEnroll && !showAddLesson && (
        <div className={styles.overlay}>
          <div className={styles.detailModal}>
            <div className={styles.modalTop}>
              <div>
                <h3>{detailClass.name}</h3>
                <div className={styles.modalSub}>{detailCourse.title} · {formatScheduleOnlyDays(detailClass.schedule)}{detailClass.tenGiangVien && detailClass.tenGiangVien !== '—' ? ` · GV: ${detailClass.tenGiangVien}` : ''}</div>
              </div>
              <button className={styles.modalClose} onClick={closeDetail}><FiX size={20} /></button>
            </div>


            <div className={styles.tabs}>
              <button className={`${styles.tab} ${detailTab === 'info' ? styles.tabActive : ''}`} onClick={() => { setDetailTab('info'); sessionStorage.setItem('lastOpenTab', 'info'); }}>
                Thông tin
              </button>
              <button className={`${styles.tab} ${detailTab === 'students' ? styles.tabActive : ''}`} onClick={() => { setDetailTab('students'); sessionStorage.setItem('lastOpenTab', 'students'); }}>
                Học viên ({enrolledStudents.length})
              </button>
            </div>

            <div className={styles.modalScrollableBody}>
              {/* Tab Thông tin */}
              {detailTab === 'info' && (
                <div className={styles.tabContent}>
                  <div className={styles.infoTabGrid}>
                    <div className={styles.infoGroup}>
                      <label className={styles.infoLabel}>Tên lớp học</label>
                      {isEditingClass ? (
                        <input 
                          value={editClassName} 
                          onChange={e => setEditClassName(e.target.value)}
                          className={styles.infoInput}
                        />
                      ) : (
                        <div className={styles.infoValue}>{detailClass.name}</div>
                      )}
                    </div>
                    <div className={styles.infoGroup}>
                      <label className={styles.infoLabel}>Khóa học</label>
                      <div className={styles.infoValue}>{detailCourse.title}</div>
                    </div>
                    <div className={styles.infoGroup}>
                      <label className={styles.infoLabel}>Lịch học</label>
                      {isEditingClass ? (
                        <input 
                          value={editClassSchedule} 
                          onChange={e => setEditClassSchedule(e.target.value)}
                          className={styles.infoInput}
                        />
                      ) : (
                        <div className={styles.infoValue}>{formatScheduleOnlyDays(detailClass.schedule)}</div>
                      )}
                    </div>
                    <div className={styles.infoGroup}>
                      <label className={styles.infoLabel}>Trạng thái</label>
                      {isEditingClass ? (
                        <select 
                          value={editClassStatus} 
                          onChange={e => setEditClassStatus(e.target.value)}
                          className={styles.infoInput}
                        >
                          <option value="Chờ bắt đầu">Chờ bắt đầu</option>
                          <option value="Đang diễn ra">Đang diễn ra</option>
                          <option value="Đã hoàn thành">Đã hoàn thành</option>
                        </select>
                      ) : (
                        <div className={styles.infoValue}>{detailClass.status}</div>
                      )}
                    </div>
                    <div className={styles.infoGroup}>
                      <label className={styles.infoLabel}>Số buổi học</label>
                      <div className={styles.infoValue}>{lessons.length} buổi học</div>
                    </div>
                    <div className={styles.infoGroup}>
                      <label className={styles.infoLabel}>Sĩ số học viên</label>
                      <div className={styles.infoValue}>{enrolledStudents.length} học viên</div>
                    </div>
                    <div className={styles.infoGroup} style={{ gridColumn: 'span 2' }}>
                      <label className={styles.infoLabel} style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '8px' }}>Phân công giáo viên theo kỹ năng</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {['Listening', 'Reading', 'Speaking', 'Writing'].map(skill => {
                          const isRequired = detailCourse[skill.toLowerCase() as 'listening' | 'reading' | 'speaking' | 'writing'];
                          if (!isRequired) return null;
                          const skillId = getSkillId(skill);
                          const assigned = classTeachersMap[detailClass.id]?.[skillId];
                          
                          if (isEditingClass) {
                            return (
                              <div key={skill} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#ffffff', padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{skill}:</span>
                                {assigned && assigned.maGiangVien ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{assigned.tenGiangVien}</span>
                                    <button 
                                      className={styles.btnOutline} 
                                      style={{ fontSize: 13, padding: '2px 6px', height: 'auto', border: '1px solid #e87722', color: '#e87722', cursor: 'pointer' }}
                                      onClick={() => assignTeacherForSkill(detailClass.id, skillId, 0)}
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                ) : (
                                  <select 
                                    value="" 
                                    style={{ fontSize: 14, padding: '4px 24px 4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 140, height: 'auto', cursor: 'pointer' }}
                                    onChange={e => { if (e.target.value) assignTeacherForSkill(detailClass.id, skillId, Number(e.target.value)) }}
                                    disabled={!giaoViens.length}
                                  >
                                    <option value="">{giaoViens.length ? '— Chọn GV —' : 'Không có GV'}</option>
                                    {giaoViens.map(gv => (
                                      <option key={gv.MaGiangVien} value={gv.MaGiangVien}>{gv.HoTen}</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            );
                          }

                          return (
                            <div key={skill} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#f8fafc', padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{skill}:</span>
                              <span style={{ fontSize: 14, fontWeight: 500, color: assigned && assigned.maGiangVien ? '#1e293b' : '#94a3b8' }}>
                                {assigned && assigned.maGiangVien ? assigned.tenGiangVien : 'Chưa phân công'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Học viên */}
              {detailTab === 'students' && (
                <div className={styles.tabContent}>
                  <div className={styles.tabToolbar}>
                    <span className={styles.tabInfo}>{enrolledStudents.length}/{detailClass.students} đã ghi danh</span>
                    <div className={styles.tabToolbarBtns}>
                      <button className={styles.detailBtnOutline} onClick={() => {
                        if (enrolledStudents.length === 0) { alert('Chưa có học viên nào để xuất!'); return }
                        const headers = ['Mã HV','Họ và tên','Giới tính','SĐT','Ngày ghi danh','Trạng thái']
                        const rows = enrolledStudents.map(s => [s.studentId, s.name, s.gender, s.phone, s.enrollDate, s.status])
                        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
                        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url; a.download = `danhsach_${detailClass?.name.replace(/\s+/g,'_')}.csv`
                        a.click(); URL.revokeObjectURL(url)
                        setToast(`Đã xuất ${enrolledStudents.length} học viên!`)
                      }}>⬇ Xuất danh sách</button>
                    </div>
                  </div>
                  {loadingEnrolled ? (
                    <div style={{ padding:20, textAlign:'center', color:'#999' }}>Đang tải...</div>
                  ) : enrolledStudents.length === 0 ? (
                    <div className={styles.emptyTab}>Chưa có học viên nào.</div>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ width: '100px' }}>Mã HV</th>
                          <th>Họ và tên</th>
                          <th style={{ width: '100px' }}>Giới tính</th>
                          <th style={{ width: '130px' }}>Ngày GD</th>
                          <th style={{ width: '130px' }}>Trạng thái</th>
                          <th style={{ width: '90px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map(s => (
                          <tr key={s.studentId}>
                            <td>{s.studentId}</td>
                            <td>{s.name}</td>
                            <td>{s.gender}</td>
                            <td>{formatDate(s.enrollDate)}</td>
                            <td><span className={`${styles.badge} ${s.status === 'Đang học' ? styles.badgeGreen : styles.badgeGray}`}>{s.status}</span></td>
                            <td><button className={styles.detailBtnDanger} onClick={() => removeEnrolled(s.studentId)}>Hủy GD</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}


            </div>

            {detailTab === 'info' && (
              <div className={styles.modalFooter} style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                {isEditingClass ? (
                  <>
                    <button 
                      className={styles.detailBtnOutline} 
                      onClick={() => { setIsEditingClass(false); setEditClassName(detailClass.name); setEditClassSchedule(detailClass.schedule); setEditClassStatus(detailClass.status); }}
                      style={{ minWidth: '120px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      Hủy
                    </button>
                    <button 
                      className={styles.detailBtnPrimary} 
                      onClick={handleSaveClassEdit} 
                      style={{ minWidth: '120px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000080', borderColor: '#000080', color: 'white', cursor: 'pointer' }}
                    >
                      Lưu
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className={styles.detailBtnDanger} 
                      onClick={() => {
                        deleteClass(detailCourse.id, detailClass.id);
                      }}
                      style={{ minWidth: '120px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444', color: 'white', cursor: 'pointer' }}
                    >
                      Xóa lớp
                    </button>
                    <button 
                      className={styles.detailBtnPrimary} 
                      onClick={() => setIsEditingClass(true)} 
                      style={{ minWidth: '120px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000080', borderColor: '#000080', color: 'white', cursor: 'pointer' }}
                    >
                      Chỉnh sửa
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════ MODAL: GHI DANH SINH VIÊN ════ */}
      {showDetail && showEnroll && detailClass && (
        <div className={styles.overlay}>
          <div className={styles.enrollModal}>
            <div className={styles.modalTop}>
              <div><h3>Ghi danh sinh viên</h3><div className={styles.modalSub}>Lớp: {detailClass.name} · {detailCourse?.title}</div></div>
              <button className={styles.modalClose} onClick={() => { setShowEnroll(false); setSelectedIds(new Set()) }}><FiX size={20} /></button>
            </div>
            <div className={styles.enrollSearchRow}>
              <input value={enrollSearch} onChange={e => setEnrollSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã sinh viên..." className={styles.enrollSearchInput} />
              {selectedIds.size > 0 && <span className={styles.selectedBadge}>{selectedIds.size} đã chọn</span>}
            </div>
            <div className={styles.enrollTableWrap}>
              {availableStudents.length === 0 ? (
                <div className={styles.emptyTab}>{enrollSearch ? 'Không tìm thấy.' : 'Tất cả sinh viên đã ghi danh.'}</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width:36 }}>
                        <input type="checkbox"
                          checked={availableStudents.every(s => selectedIds.has(s.id))}
                          onChange={e => setSelectedIds(e.target.checked ? new Set(availableStudents.map(s => s.id)) : new Set())} />
                      </th>
                      <th>Mã SV</th><th>Họ và tên</th><th>Giới tính</th><th>SĐT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableStudents.map(s => (
                      <tr key={s.id} style={{ cursor:'pointer' }} onClick={() => setSelectedIds(prev => { const n = new Set(prev); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n })}>
                        <td><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => {}} onClick={e => e.stopPropagation()} /></td>
                        <td className={styles.monoText}>{s.id}</td>
                        <td className={styles.boldText}>{s.name}</td>
                        <td>{s.gender}</td><td>{s.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.detailBtnOutline} onClick={() => { setShowEnroll(false); setSelectedIds(new Set()) }}>Hủy</button>
              <button className={styles.detailBtnPrimary} onClick={confirmEnroll} disabled={selectedIds.size === 0} style={{ opacity: selectedIds.size === 0 ? 0.5 : 1 }}>
                Ghi danh{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: THÊM BUỔI HỌC ════ */}
      {showDetail && showAddLesson && detailClass && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalTop}>
              <h3>Thêm buổi học vào lộ trình</h3>
              <button className={styles.modalClose} onClick={() => setShowAddLesson(false)}><FiX size={20} /></button>
            </div>
            <p className={styles.modalSub}>Lớp: {detailClass.name} · {detailCourse?.title}</p>
            <div className={styles.formGroup}><label>Tên buổi học <span className={styles.req}>*</span></label>
              <input value={lessonForm.title} onChange={e => setLessonForm(p => ({...p, title: e.target.value}))} placeholder="VD: Buổi 1: Ngữ pháp cơ bản" />
            </div>
            <div className={styles.formGroup}><label>Mô tả</label>
              <textarea value={lessonForm.desc} onChange={e => setLessonForm(p => ({...p, desc: e.target.value}))} placeholder="Nội dung buổi học..." rows={3} />
            </div>

            <div className={styles.formGroup}><label>Thứ tự</label>
              <input type="number" min={1} value={lessonForm.order} onChange={e => setLessonForm(p => ({...p, order: Number(e.target.value)}))} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.detailBtnOutline} onClick={() => setShowAddLesson(false)}>Hủy</button>
              <button className={styles.detailBtnPrimary} onClick={saveLesson}>Thêm buổi</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: THÊM BÀI GIẢNG ════ */}
      {showDetail && showAddLectureModal && (
        <div className={styles.overlay}>
          <div className={styles.modal} style={{ maxWidth: '600px' }}>
            <div className={styles.modalTop}>
              <h3>Thêm bài giảng</h3>
              <button className={styles.modalClose} onClick={() => setShowAddLectureModal(false)}><FiX size={20} /></button>
            </div>
            
            <div className={styles.tabs} style={{ marginBottom: '16px' }}>
              <button className={`${styles.tab} ${bgTab === 'create' ? styles.tabActive : ''}`} onClick={() => setBgTab('create')}>Tạo mới</button>
              <button className={`${styles.tab} ${bgTab === 'reuse' ? styles.tabActive : ''}`} onClick={() => setBgTab('reuse')}>Chọn từ danh sách</button>
            </div>

            {bgTab === 'create' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className={styles.formGroup}>
                  <label>Tiêu đề bài giảng *</label>
                  <input value={bgForm.title} onChange={e => setBgForm(p => ({...p, title: e.target.value}))} placeholder="VD: Lesson 1: Grammar basics" />
                </div>
                <div className={styles.formGroup}>
                  <label>Mô tả nội dung</label>
                  <textarea value={bgForm.content} onChange={e => setBgForm(p => ({...p, content: e.target.value}))} placeholder="Nhập mô tả hoặc nội dung bài học..." rows={5} />
                </div>
                <div className={styles.formGroup}>
                  <label>Link tài liệu / Video URL (nếu có)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input style={{ flex: 1 }} value={bgForm.fileUrl} onChange={e => setBgForm(p => ({...p, fileUrl: e.target.value}))} placeholder="http://..." />
                    <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#1e293b', padding: '0 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, border: '1px solid #cbd5e1', height: '38px', margin: 0 }}>
                      Tải file
                      <input type="file" style={{ display: 'none' }} onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await fetch("http://14.225.192.252:5000/upload", {
                            method: "POST",
                            body: formData
                          });
                          if (!res.ok) throw new Error("Upload failed");
                          const data = await res.json();
                          setBgForm(p => ({ ...p, fileUrl: data.url }));
                          alert("Tải lên file thành công!");
                        } catch (err) {
                          alert("Lỗi tải lên file: " + (err as Error).message);
                        }
                      }} />
                    </label>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.detailBtnOutline} onClick={() => setShowAddLectureModal(false)}>Hủy</button>
                  <button className={styles.detailBtnPrimary} onClick={saveNewLecture}>Tạo mới</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                  {allExistingBg.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Không tìm thấy bài giảng nào.</div>
                  ) : (
                    allExistingBg.map((bg: any) => (
                      <div key={bg.MaBaiHoc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ flex: 1, paddingRight: '8px' }}>
                          <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block' }}>{bg.TieuDe}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {bg.LoaiBaiHoc} · {bg.ThoiLuong} · Nguồn: Lớp {bg.TenLop} ({bg.TenLesson})
                          </div>
                        </div>
                        <button className={styles.detailBtnPrimary} style={{ fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }} onClick={() => cloneLecture(bg.MaBaiHoc)}>Chọn</button>
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.modalFooter} style={{ marginTop: '16px' }}>
                  <button className={styles.detailBtnOutline} onClick={() => setShowAddLectureModal(false)}>Đóng</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ════ MODAL: THÊM TÀI LIỆU ════ */}
      {showDetail && showAddDocModal && (
        <div className={styles.overlay}>
          <div className={styles.modal} style={{ maxWidth: '600px' }}>
            <div className={styles.modalTop}>
              <h3>Thêm tài liệu</h3>
              <button className={styles.modalClose} onClick={() => setShowAddDocModal(false)}><FiX size={20} /></button>
            </div>
            
            <div className={styles.tabs} style={{ marginBottom: '16px' }}>
              <button className={`${styles.tab} ${docTab === 'create' ? styles.tabActive : ''}`} onClick={() => setDocTab('create')}>Tạo mới</button>
              <button className={`${styles.tab} ${docTab === 'reuse' ? styles.tabActive : ''}`} onClick={() => setDocTab('reuse')}>Chọn từ danh sách</button>
            </div>

            {docTab === 'create' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className={styles.formGroup}>
                  <label>Tiêu đề tài liệu *</label>
                  <input value={docForm.title} onChange={e => setDocForm(p => ({...p, title: e.target.value}))} placeholder="VD: Slide bài học Unit 1" />
                </div>
                <div className={styles.formGroup}>
                  <label>Mô tả ngắn</label>
                  <input value={docForm.desc} onChange={e => setDocForm(p => ({...p, desc: e.target.value}))} placeholder="Slide tóm tắt lý thuyết..." />
                </div>
                <div className={styles.formGroup}>
                  <label>Nội dung tài liệu (Markdown hoặc Text)</label>
                  <textarea value={docForm.content} onChange={e => setDocForm(p => ({...p, content: e.target.value}))} placeholder="Nội dung tóm tắt..." rows={4} />
                </div>
                <div className={styles.formGroup}>
                  <label>File đính kèm (URL)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input style={{ flex: 1 }} value={docForm.fileUrl} onChange={e => setDocForm(p => ({...p, fileUrl: e.target.value}))} placeholder="http://..." />
                    <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#1e293b', padding: '0 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, border: '1px solid #cbd5e1', height: '38px', margin: 0 }}>
                      Tải file
                      <input type="file" style={{ display: 'none' }} onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await fetch("http://14.225.192.252:5000/upload", {
                            method: "POST",
                            body: formData
                          });
                          if (!res.ok) throw new Error("Upload failed");
                          const data = await res.json();
                          setDocForm(p => ({ ...p, fileUrl: data.url }));
                          alert("Tải lên file thành công!");
                        } catch (err) {
                          alert("Lỗi tải lên file: " + (err as Error).message);
                        }
                      }} />
                    </label>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.detailBtnOutline} onClick={() => setShowAddDocModal(false)}>Hủy</button>
                  <button className={styles.detailBtnPrimary} onClick={saveNewDoc}>Tạo mới</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                  {allExistingDoc.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Không tìm thấy tài liệu nào.</div>
                  ) : (
                    allExistingDoc.map((doc: any) => (
                      <div key={doc.MaTaiLieu} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        <div style={{ flex: 1, paddingRight: '8px' }}>
                          <strong style={{ fontSize: '14px', color: '#15803d', display: 'block' }}>{doc.TieuDe}</strong>
                          <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>
                            {doc.MoTa || 'Không có mô tả'} · Nguồn: Lớp {doc.TenLop} ({doc.TenLesson})
                          </div>
                        </div>
                        <button className={styles.detailBtnPrimary} style={{ fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }} onClick={() => cloneDoc(doc.MaTaiLieu)}>Chọn</button>
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.modalFooter} style={{ marginTop: '16px' }}>
                  <button className={styles.detailBtnOutline} onClick={() => setShowAddDocModal(false)}>Đóng</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}



      {/* ════ MODAL: XÁC NHẬN XÓA ════ */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}
          onClick={() => { setShowDeleteModal(false); setDeleteAction(null) }}
        >
          <div
            style={{
              background: 'white', borderRadius: '12px', width: '450px', maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0', overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Xác nhận xóa</span>
              <button type="button" onClick={() => { setShowDeleteModal(false); setDeleteAction(null) }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b", padding: 0, display: "flex", alignItems: "center" }}>&times;</button>
            </div>
            <div style={{ padding: "20px 24px", textAlign: "left" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#1e293b", lineHeight: "1.6" }}>
                {deleteMessage}
              </p>
              <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#475569" }}>
                <strong>Lưu ý:</strong> Xóa xong không thể khôi phục lại được
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setDeleteAction(null) }}
                  style={{
                    padding: "8px 16px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1",
                    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (deleteAction) {
                      try { await deleteAction() } catch { setToast('Lỗi khi thực hiện!') }
                    }
                    setShowDeleteModal(false)
                    setDeleteAction(null)
                  }}
                  style={{
                    padding: "8px 16px", background: "#c20e0e", color: "white", border: "none",
                    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 700
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  )
}
