// CoursePageQTV.tsx – Cấu trúc UI cũ + Kết nối DB + Phân công nhiều GV
import React, { useState, useEffect, useMemo } from 'react'
import styles from './coursePageQTV.module.css'
import { FiSearch, FiFileText, FiChevronDown } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:5000'
const LEVELS    = ['Beginner','Elementary','Intermediate','Advanced','IELTS','TOEIC','VSTEP','General','A1','A2','B1','B2']
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

interface PendingReg {
  id: number; studentId: string; name: string; phone: string
  courseId: number; courseName: string; regDate: string
  status: 'Chờ ghi danh' | 'Đã ghi danh' | 'Từ chối'
}

interface ClassInForm {
  name: string; schedule: string; maxStudents: number
  maGiangVien: string
  teachers?: Record<number, number>
  lessons: { title: string; desc: string; startDate: string; endDate: string; order: number }[]
}

type DetailTab = 'students' | 'roadmap'

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t) }, [])
  return <div className={styles.toast}>✓ {msg}</div>
}



export default function CoursePageQTV() {
  const navigate = useNavigate()
  const [courses, setCourses]     = useState<Course[]>([])
  const [giaoViens, setGiaoViens] = useState<GiaoVien[]>([])
  const [search, setSearch]       = useState('')
  const [levelFilter, setLevel]   = useState('')
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState('')
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [expandedClass, setExpandedClass]   = useState<number | null>(null)

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
  const [detailTab, setDetailTab]         = useState<DetailTab>('students')
  const [showDetail, setShowDetail]       = useState(false)

  // Ghi danh
  const [allStudents, setAllStudents]           = useState<Student[]>([])
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([])
  const [showEnroll, setShowEnroll]             = useState(false)
  const [enrollSearch, setEnrollSearch]         = useState('')
  const [selectedIds, setSelectedIds]           = useState<Set<string>>(new Set())
  const [loadingEnrolled, setLoadingEnrolled]   = useState(false)

  // Lộ trình
  const [lessons, setLessons]               = useState<Lesson[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [showAddLesson, setShowAddLesson]   = useState(false)
  const [lessonForm, setLessonForm]         = useState({ title: '', desc: '', startDate: '', endDate: '', order: 1 })

  // Roadmap assets states
  const [lessonAssets, setLessonAssets] = useState<Record<number, { lectures: any[], exercises: any[], documents: any[] }>>({})
  const [activeLessonIdForAsset, setActiveLessonIdForAsset] = useState<number | null>(null)

  // Lecture Modal
  const [showAddLectureModal, setShowAddLectureModal] = useState(false)
  const [bgTab, setBgTab] = useState<'create' | 'reuse'>('create')
  const [bgForm, setBgForm] = useState({ title: '', content: '', fileUrl: '', type: 'Video', duration: '30 phút', order: 1 })
  const [allExistingBg, setAllExistingBg] = useState<any[]>([])



  // Document Modal
  const [showAddDocModal, setShowAddDocModal] = useState(false)
  const [docTab, setDocTab] = useState<'create' | 'reuse'>('create')
  const [docForm, setDocForm] = useState({ title: '', desc: '', content: '', fileUrl: '' })
  const [allExistingDoc, setAllExistingDoc] = useState<any[]>([])

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

  const openAddLecture = (lessonId: number) => {
    setActiveLessonIdForAsset(lessonId)
    setBgForm({ title: '', content: '', fileUrl: '', type: 'Video', duration: '30 phút', order: (lessonAssets[lessonId]?.lectures?.length || 0) + 1 })
    setBgTab('create')
    setShowAddLectureModal(true)
    fetch(`${API}/baigiang/list/all`)
      .then(r => r.json())
      .then(data => setAllExistingBg(data))
      .catch(() => setAllExistingBg([]))
  }

  const openAddExercise = (lessonId: number) => {
    navigate(`/QTV/create-exercise/${lessonId}`);
  }

  const openAddDoc = (lessonId: number) => {
    setActiveLessonIdForAsset(lessonId)
    setDocForm({ title: '', desc: '', content: '', fileUrl: '' })
    setDocTab('create')
    setShowAddDocModal(true)
    fetch(`${API}/tailieu/list/all`)
      .then(r => r.json())
      .then(data => setAllExistingDoc(data))
      .catch(() => setAllExistingDoc([]))
  }

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
          ThuTu: bgForm.order,
          MaKhoaHoc: detailCourse?.id,
          MaGiangVien: user.MaNguoiDung || 1,
          MaLesson: activeLessonIdForAsset
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
          MaLesson: activeLessonIdForAsset
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
        body: JSON.stringify({ MaLesson: activeLessonIdForAsset })
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
        body: JSON.stringify({ MaLesson: activeLessonIdForAsset })
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

  const deleteRoadmapLecture = (bgId: number, lessonId: number) => {
    confirmAction('Bạn có chắc chắn muốn xóa bài giảng này?', async () => {
      try {
        await fetch(`${API}/baigiang/${bgId}`, { method: 'DELETE' });
        setToast('Đã xóa bài giảng!');
        fetchLessonAssets(lessonId);
      } catch {
        alert('Lỗi khi xóa bài giảng');
      }
    });
  }

  const deleteRoadmapExercise = (exId: number, lessonId: number) => {
    confirmAction('Bạn có chắc chắn muốn xóa bài tập này?', async () => {
      try {
        await fetch(`${API}/exercises/${exId}`, { method: 'DELETE' });
        setToast('Đã xóa bài tập!');
        fetchLessonAssets(lessonId);
      } catch {
        alert('Lỗi khi xóa bài tập');
      }
    });
  }

  const deleteRoadmapDoc = (docId: number, lessonId: number) => {
    confirmAction('Bạn có chắc chắn muốn xóa tài liệu này?', async () => {
      try {
        await fetch(`${API}/tailieu/${docId}`, { method: 'DELETE' });
        setToast('Đã xóa tài liệu!');
        fetchLessonAssets(lessonId);
      } catch {
        alert('Lỗi khi xóa tài liệu');
      }
    });
  }

  // Modal tạo lớp học
  const [showAddClass, setShowAddClass]       = useState(false)
  const [addingToCourse, setAddingToCourse]   = useState<Course | null>(null)
  const [lForm, setLForm] = useState({
    name: '',
    schedule: 'Thứ 2 & 4',
    maxStudents: 30,
    maGiangVien: '',
    teachers: {} as Record<number, number>,
    copyFromClassId: ''
  })

  // Pending registrations
  const [pendingRegs, setPendingRegs]               = useState<PendingReg[]>([])
  const [showRegModal, setShowRegModal]             = useState(false)
  const [regCourseFilter, setRegCourseFilter]       = useState<number | 'all'>('all')
  const [selectedReg, setSelectedReg]               = useState<PendingReg | null>(null)
  const [showAssignClassModal, setShowAssignClassModal] = useState(false)
  const [assignClassId, setAssignClassId]           = useState<number | ''>('')

  // ── DELETE MODAL STATE ──────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteMessage, setDeleteMessage]     = useState('')
  const [deleteAction, setDeleteAction]       = useState<(() => Promise<void>) | null>(null)

  // Helper: mở modal xác nhận xóa
  const confirmAction = (msg: string, action: () => Promise<void>) => {
    setDeleteMessage(msg)
    setDeleteAction(() => action)
    setShowDeleteModal(true)
  }

  // ── Helpers lớp trong form ──────────────────────────────────────────────────
  const addClassToForm = () => {
    setClassesInForm(prev => [...prev, {
      name: '', schedule: 'Thứ 2 & 4', maxStudents: 30,
      maGiangVien: '',
      teachers: {},
      lessons: []
    }])
  }

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
      .then(data => setCourses(data.map((c: any) => ({
        id: c.MaKhoaHoc, title: c.TenKhoaHoc, desc: c.MoTa || '',
        level: c.TrinhDo || '', status: c.TrangThai || 'Pending',
        created: c.NgayTao ? new Date(c.NgayTao).toLocaleDateString('vi-VN') : '—',
        category: c.DanhMuc || 'Luyện thi',
        listening: !!c.Listening,
        reading: !!c.Reading,
        speaking: !!c.Speaking,
        writing: !!c.Writing,
        classCount: c.SoLop || 0
      }))))
      .catch(() => setToast('Lỗi tải danh sách khóa học'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCourses()
    fetch(`${API}/qtv/giangvien`).then(r => r.json()).then(setGiaoViens).catch(() => {})
    fetch(`${API}/students`)
      .then(r => r.json())
      .then(data => setAllStudents(data.map((s: any) => ({
        id: s.MaSinhVien, name: s.HoTen,
        gender: s.GioiTinh || '—', phone: s.Lop || '—'
      }))))
      .catch(err => console.error('Error loading students:', err))
    fetch(`${API}/dangky/pending?t=${Date.now()}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPendingRegs(data.map((r: any) => ({
            id: r.MaDangKy, studentId: r.MaSinhVien, name: r.HoTen,
            phone: '—', courseId: r.MaKhoaHoc, courseName: r.TenKhoaHoc,
            regDate: new Date(r.NgayDangKy).toLocaleDateString('vi-VN'),
            status: (r.TrangThai === 'Đã ghi danh' ? 'Đã ghi danh' : r.TrangThai === 'Từ chối' ? 'Từ chối' : 'Chờ ghi danh') as 'Chờ ghi danh' | 'Đã ghi danh' | 'Từ chối'
          })))
        }
      })
      .catch(() => {})
  }, [])

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
              lessonCount: c.SoBuoiHoc || 0
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
              await fetch(`${API}/qtv/lesson`, {
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
      await fetch(`${API}/qtv/khoahoc/${id}`, { method: 'DELETE' })
      setToast('Đã xóa!')
      loadCourses()
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
      await fetch(`${API}/qtv/lophoc/${classId}`, { method: 'DELETE' })
      setClassesMap(prev => ({ ...prev, [courseId]: (prev[courseId] || []).filter(cl => cl.id !== classId) }))
      setToast('Đã xóa lớp học!')
    })
  }

  const saveClass = async () => {
    if (!lForm.name.trim()) { alert('Vui lòng nhập tên lớp!'); return }
    if (!addingToCourse) return
    try {
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
          LichHoc: lForm.schedule,
          SoLuongHocVien: null,
          CopyFromClassId: lForm.copyFromClassId ? Number(lForm.copyFromClassId) : null,
          teachers: lForm.teachers // Pass the teachers object!
        })
      })
      await classResponse.json()
      setToast('Đã tạo lớp học!'); setShowAddClass(false)
      setLForm({ name: '', schedule: 'Thứ 2 & 4', maxStudents: 30, maGiangVien: '', teachers: {}, copyFromClassId: '' })
      setClassesMap(prev => { const n = { ...prev }; delete n[addingToCourse.id]; return n })
      loadClassesForCourse(addingToCourse.id)
    } catch { alert('Lỗi khi tạo lớp học') }
  }

  // ── Detail modal ──────────────────────────────────────────────────────────────
  const openDetail = (course: Course, cls: LopHoc) => {
    setDetailCourse(course); setDetailClass(cls); setDetailTab('students')
    setShowDetail(true); setShowEnroll(false); setShowAddLesson(false)
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

  // ── Ghi danh ─────────────────────────────────────────────────────────────────
  const enrolledIds = new Set(enrolledStudents.map(s => s.studentId))
  const availableStudents = allStudents.filter(s =>
    !enrolledIds.has(s.id) &&
    (!enrollSearch || s.name.toLowerCase().includes(enrollSearch.toLowerCase()) || s.id.toLowerCase().includes(enrollSearch.toLowerCase()))
  )

  const confirmEnroll = async () => {
    if (!detailClass || selectedIds.size === 0) return
    try {
      for (const studentId of selectedIds) {
        await fetch(`${API}/qtv/lophoc/${detailClass.id}/ghidanh`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ MaSinhVien: studentId })
        }).catch(() => {})
      }
      const today = new Date().toLocaleDateString('vi-VN')
      const newStudents = allStudents.filter(s => selectedIds.has(s.id)).map(s => ({
        studentId: s.id, name: s.name, gender: s.gender, phone: s.phone,
        enrollDate: today, status: 'Đang học'
      }))
      setEnrolledStudents(prev => [...prev, ...newStudents])
      setShowEnroll(false); setSelectedIds(new Set()); setEnrollSearch('')
      setToast(`Đã ghi danh ${newStudents.length} sinh viên!`)
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
      await fetch(`${API}/qtv/lesson`, {
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

  const deleteLesson = (buoiHocId: number) => {
    confirmAction('Bạn có chắc chắn muốn xóa buổi học này?', async () => {
      await fetch(`${API}/qtv/lesson/${buoiHocId}`, { method: 'DELETE' })
      setLessons(prev => prev.filter(l => l.id !== buoiHocId))
      setToast('Đã xóa buổi học!')
    })
  }

  // ── Pending regs ──────────────────────────────────────────────────────────────
  const confirmAssign = async () => {
    if (!selectedReg || !assignClassId) { alert('Vui lòng chọn lớp!'); return }
    try {
      await fetch(`${API}/qtv/lophoc/${assignClassId}/ghidanh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MaSinhVien: selectedReg.studentId })
      })
      setPendingRegs(prev => prev.map(r => r.id === selectedReg.id ? { ...r, status: 'Đã ghi danh' as const } : r))
      setShowAssignClassModal(false); setSelectedReg(null); setAssignClassId('')
      setToast(`Đã ghi danh ${selectedReg.name}!`)
    } catch { alert('Lỗi khi ghi danh') }
  }

  const rejectReg = (id: number) => {
    confirmAction('Bạn có chắc chắn muốn từ chối đăng ký này?', async () => {
      try {
        await fetch(`${API}/dangky/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ TrangThai: 'Từ chối' })
        })
        setPendingRegs(prev => prev.map(r => r.id === id ? { ...r, status: 'Từ chối' as const } : r))
        setToast('Đã từ chối!')
      } catch {
        alert('Lỗi khi từ chối đăng ký')
      }
    })
  }

  // Trích xuất các cấp độ duy nhất từ danh sách khóa học thực tế (tách theo dấu phẩy)
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

  const filtered = courses.filter(c =>
    (!search || c.title.toLowerCase().includes(search.toLowerCase())) &&
    (!levelFilter || (c.level && c.level.split(',').map(s => s.trim()).includes(levelFilter)))
  )

  const totalCls = courses.reduce((s, c) => s + (c.classCount || 0), 0)



  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Quản lý toàn bộ khóa học</h1>
        <p>Thêm mới, sửa, xóa khóa học · Phân công giáo viên · Ghi danh sinh viên · Lộ trình học</p>
      </div>

      <div className={styles.content}>
        {/* Stats */}
        <div className={styles.statRow}>
          <div className={`${styles.statCard} ${styles.statMint}`}><div className={styles.statLabel}>Tổng khóa học</div><div className={styles.statValue}>{courses.length}</div></div>
          <div className={`${styles.statCard} ${styles.statBlue}`}><div className={styles.statLabel}>Tổng lớp học</div><div className={styles.statValue}>{totalCls}</div></div>
          <div className={`${styles.statCard} ${styles.statOrange}`} style={{ cursor:'pointer' }} onClick={() => setShowRegModal(true)}>
            <div className={styles.statLabel}>Đăng ký ghi danh</div>
            <div className={styles.statValue}>{pendingRegs.filter(r => r.status === 'Chờ ghi danh').length}</div>
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
            <div className={styles.tableToolbar}>
              <select value={levelFilter} onChange={e => setLevel(e.target.value)}>
                <option value="">Tất cả cấp độ</option>
                {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button className={styles.btnRegList} onClick={() => setShowRegModal(true)}>
                <FiFileText style={{ marginRight: 6 }} /> Đăng ký ({pendingRegs.filter(r => r.status === 'Chờ ghi danh').length})
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding:40, textAlign:'center', color:'#999' }}>Đang tải dữ liệu...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>TÊN KHÓA HỌC</th>
                  <th>CẤP ĐỘ</th>
                  <th>LỚP HỌC</th>
                  <th>NGÀY TẠO</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className={styles.empty}>Không có khóa học nào</td></tr>
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
                      <td>
                        <div className={styles.actionBtns}>
                          <button 
                            className={styles.btnPrimary} 
                            onClick={() => { 
                              setAddingToCourse(c); 
                              setLForm({ name: '', schedule: 'Thứ 2 & 4', maxStudents: 30, maGiangVien: '', teachers: {}, copyFromClassId: '' }); 
                              setShowAddClass(true); 
                            }}
                          >
                            Thêm lớp học
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedCourse === c.id && (
                      <tr>
                        <td colSpan={5} className={styles.expandedCell}>
                          {(classesMap[c.id] || []).length === 0 ? (
                            <div className={styles.expandEmpty}>Chưa có lớp học nào.</div>
                          ) : (
                            (classesMap[c.id] || []).map(cl => (
                              <div key={cl.id} className={styles.classBlock}>
                                <div className={styles.classBlockHeader} onClick={() => setExpandedClass(expandedClass === cl.id ? null : cl.id)} style={{ cursor:'pointer' }}>
                                  <span className={styles.classExpandChevron}>{expandedClass === cl.id ? '▲' : '▼'}</span>
                                  <div className={styles.classBlockInfo}>
                                    <span className={styles.classBlockName}>{cl.name}</span>
                                    <span className={styles.classBlockMeta}>{cl.schedule}{cl.tenGiangVien && cl.tenGiangVien !== '—' ? ` · ${cl.tenGiangVien}` : ''}</span>
                                  </div>
                                  <span className={styles.classBlockCount}>{cl.lessonCount} buổi</span>

                                  <div onClick={e => e.stopPropagation()} style={{ marginLeft: 8, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 260 }}>
                                    {['Listening', 'Reading', 'Speaking', 'Writing'].map(skill => {
                                      const isRequired = c[skill.toLowerCase() as 'listening' | 'reading' | 'speaking' | 'writing'];
                                      if (!isRequired) return null;
                                      const skillId = getSkillId(skill);
                                      const assigned = classTeachersMap[cl.id]?.[skillId];
                                      return (
                                        <div key={skill} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#f8fafc', padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                                          <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{skill}:</span>
                                          {assigned && assigned.maGiangVien ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                              <span style={{ fontSize: 11, fontWeight: 500, color: '#1e293b' }}>{assigned.tenGiangVien}</span>
                                              <button 
                                                className={styles.btnOutline} 
                                                style={{ fontSize: 10, padding: '1px 4px', height: 'auto', border: '1px solid #e87722', color: '#e87722' }}
                                                onClick={() => assignTeacherForSkill(cl.id, skillId, 0)}
                                              >
                                                Xóa
                                              </button>
                                            </div>
                                          ) : (
                                            <select 
                                              value="" 
                                              style={{ fontSize: 11, padding: '2px 20px 2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 120, height: 'auto' }}
                                              onChange={e => { if (e.target.value) assignTeacherForSkill(cl.id, skillId, Number(e.target.value)) }}
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
                                    })}
                                  </div>

                                  <div className={styles.actionBtns} onClick={e => e.stopPropagation()}>
                                    <button className={styles.btnPrimary} onClick={() => openDetail(c, cl)}>Chi tiết</button>
                                    <button className={styles.btnDanger} onClick={() => deleteClass(c.id, cl.id)}>Xóa</button>
                                  </div>
                                </div>

                                {expandedClass === cl.id && (
                                  <div className={styles.buoiHocList}>
                                    <div className={styles.expandEmpty}>Bấm "Chi tiết" để xem và quản lý buổi học.</div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                          <div style={{ padding:'8px 0' }}>
                            <button className={styles.btnPrimary} style={{ fontSize:12 }}
                              onClick={() => { setAddingToCourse(c); setLForm({ name:'', schedule:'Thứ 2 & 4', maxStudents:30, maGiangVien:'', teachers:{}, copyFromClassId:'' }); setShowAddClass(true) }}>
                              + Tạo lớp học mới
                            </button>
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
              <button className={styles.modalClose} onClick={() => { setShowCourseModal(false); setEditCourse(null) }}>×</button>
            </div>
            <p className={styles.modalSub}>Điền đầy đủ thông tin và phân công giáo viên</p>

            <div className={styles.sectionLabel}>Thông tin khoá học</div>
            <div className={styles.formGroup}>
              <label>Tên khoá học <span className={styles.req}>*</span></label>
              <input value={cForm.title} onChange={e => setCForm(p => ({...p, title: e.target.value}))} placeholder="VD: TOEIC 650+ Intensive" />
            </div>
            <div className={styles.twoCols}>
              <div className={styles.formGroup}><label>Cấp độ</label>
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
                          <div className={styles.twoCols}>
                            <div className={styles.formGroup}>
                              <label>Ngày bắt đầu</label>
                              <input type="date" value={lesson.startDate}
                                onChange={e => updateLessonInClass(classIdx, buoiHocIdx, 'startDate', e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                              <label>Ngày kết thúc</label>
                              <input type="date" value={lesson.endDate}
                                onChange={e => updateLessonInClass(classIdx, buoiHocIdx, 'endDate', e.target.value)} />
                            </div>
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

                <button className={styles.btnOutline} style={{ width: '100%', marginBottom: 16 }}
                  onClick={addClassToForm}>
                  + Thêm lớp học
                </button>
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
              <button className={styles.modalClose} onClick={() => setShowAddClass(false)}>×</button>
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
            <div className={styles.twoCols}>
              <div className={styles.formGroup}><label>Lịch học</label>
                <div className={styles.weekdaySelector}>
                  {DAYS_OF_WEEK.map(d => {
                    const isSelected = getSelectedDaysFromSchedule(lForm.schedule).includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        className={`${styles.weekdayBtn} ${isSelected ? styles.weekdayBtnActive : ''}`}
                        onClick={() => {
                          const newSchedule = toggleDayInSchedule(d.value, lForm.schedule);
                          setLForm(p => ({ ...p, schedule: newSchedule }));
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

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
                <div className={styles.modalSub}>{detailCourse.title} · {detailClass.schedule}{detailClass.tenGiangVien && detailClass.tenGiangVien !== '—' ? ` · GV: ${detailClass.tenGiangVien}` : ''}</div>
              </div>
              <button className={styles.modalClose} onClick={() => setShowDetail(false)}>×</button>
            </div>

            <div className={styles.detailStats}>
              <div className={styles.detailStatItem}><div className={styles.detailStatVal}>{enrolledStudents.length}</div><div className={styles.detailStatLbl}>Học viên</div></div>

              <div className={styles.detailStatItem}><div className={styles.detailStatVal}>{lessons.length}</div><div className={styles.detailStatLbl}>Buổi học</div></div>
              <div className={styles.detailStatItem}><div className={styles.detailStatVal}>{detailClass.progress}%</div><div className={styles.detailStatLbl}>Tiến độ</div></div>
            </div>

            <div className={styles.tabs}>
              <button className={`${styles.tab} ${detailTab === 'students' ? styles.tabActive : ''}`} onClick={() => setDetailTab('students')}>
                👥 Học viên ({enrolledStudents.length})
              </button>
              <button className={`${styles.tab} ${detailTab === 'roadmap' ? styles.tabActive : ''}`} onClick={() => setDetailTab('roadmap')}>
                📚 Lộ trình ({lessons.length})
              </button>
            </div>

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
                    <label className={styles.detailImportBtn}>
                      📂 Import file
                      <input type="file" accept=".csv" hidden onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file || !detailClass) return
                        const text = await file.text()
                        const lines = text.split('\n').filter(l => l.trim())
                        const dataLines = lines[0].toLowerCase().includes('mã') || lines[0].toLowerCase().includes('id') ? lines.slice(1) : lines
                        const studentIds: string[] = []
                        for (const line of dataLines) {
                          const cols = line.split(',').map(c => c.replace(/"/g,'').trim())
                          if (cols[0]) studentIds.push(cols[0])
                        }
                        if (studentIds.length === 0) { alert('Không tìm thấy mã sinh viên trong file!'); return }
                        let success = 0
                        for (const studentId of studentIds) {
                          try {
                            await fetch(`${API}/qtv/lophoc/${detailClass.id}/ghidanh`, {
                              method: 'POST', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ MaSinhVien: studentId })
                            }); success++
                          } catch {}
                        }
                        const res = await fetch(`${API}/lophoc/${detailClass.id}/sinhvien`)
                        const data = await res.json()
                        setEnrolledStudents(data.map((s: any) => ({
                          studentId: s.MaSinhVien, name: s.HoTen, gender: s.GioiTinh || '—',
                          phone: s.SoDienThoai || '—', enrollDate: s.NgayGhiDanh || '—', status: s.TrangThai || 'Đang học'
                        })))
                        setToast(`Đã import ${success}/${studentIds.length} sinh viên!`)
                        e.target.value = ''
                      }} />
                    </label>
                    <button className={styles.detailBtnPrimary} onClick={() => { setShowEnroll(true); setEnrollSearch(''); setSelectedIds(new Set()) }}>
                      + Ghi danh sinh viên
                    </button>
                  </div>
                </div>
                {loadingEnrolled ? (
                  <div style={{ padding:20, textAlign:'center', color:'#999' }}>Đang tải...</div>
                ) : enrolledStudents.length === 0 ? (
                  <div className={styles.emptyTab}>Chưa có học viên nào.</div>
                ) : (
                  <table className={styles.table}>
                    <thead><tr><th>Mã HV</th><th>Họ và tên</th><th>Giới tính</th><th>SĐT</th><th>Ngày GD</th><th>Trạng thái</th><th></th></tr></thead>
                    <tbody>
                      {enrolledStudents.map(s => (
                        <tr key={s.studentId}>
                          <td className={styles.monoText}>{s.studentId}</td>
                          <td className={styles.boldText}>{s.name}</td>
                          <td>{s.gender}</td><td>{s.phone}</td><td>{s.enrollDate}</td>
                          <td><span className={`${styles.badge} ${s.status === 'Đang học' ? styles.badgeGreen : styles.badgeGray}`}>{s.status}</span></td>
                          <td><button className={styles.detailBtnDanger} onClick={() => removeEnrolled(s.studentId)}>Hủy GD</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab Lộ trình */}
            {detailTab === 'roadmap' && (
              <div className={styles.tabContent}>
                <div className={styles.tabToolbar}>
                  <span className={styles.tabInfo}>{lessons.length} buổi học trong lộ trình</span>
                  <button className={styles.detailBtnPrimary} onClick={() => {
                    setLessonForm({ title:'', desc:'', startDate:'', endDate:'', order: lessons.length + 1 })
                    setShowAddLesson(true)
                  }}>+ Thêm buổi học</button>
                </div>
                {loadingLessons ? (
                  <div style={{ padding:20, textAlign:'center', color:'#999' }}>Đang tải...</div>
                ) : lessons.length === 0 ? (
                  <div className={styles.emptyTab}>Chưa có lộ trình. Nhấn "Thêm buổi học" để xây dựng.</div>
                ) : (
                  <div className={styles.roadmapList}>
                    {lessons.map((l, idx) => {
                      const assets = lessonAssets[l.id] || { lectures: [], exercises: [], documents: [] };
                      return (
                        <div key={l.id} className={styles.roadmapItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                              <div className={styles.roadmapNum}>{idx + 1}</div>
                              <div className={styles.roadmapInfo}>
                                <div className={styles.roadmapTitle}>{l.title}</div>
                                {l.desc && <div className={styles.roadmapDesc}>{l.desc}</div>}
                                <div className={styles.roadmapMeta}>
                                  {l.startDate && <span className={styles.durationText}>📅 {new Date(l.startDate).toLocaleDateString('vi-VN')}</span>}
                                  {l.endDate && <span className={styles.durationText}> → {new Date(l.endDate).toLocaleDateString('vi-VN')}</span>}
                                </div>
                              </div>
                            </div>
                            <div className={styles.actionBtns}>
                              <button className={styles.btnDanger} onClick={() => deleteLesson(l.id)}>Xóa buổi</button>
                            </div>
                          </div>

                          {/* Assets container */}
                          <div style={{ marginTop: '12px', paddingLeft: '48px', borderLeft: '2px dashed #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {/* Lectures list */}
                            {assets.lectures.length > 0 && (
                              <div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#f58220' }}>🎥 Bài giảng:</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                  {assets.lectures.map((bg: any) => (
                                    <div key={bg.MaBaiHoc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                      <span style={{ fontSize: '13px', color: '#334155' }}>{bg.TieuDe} <span style={{ fontSize: '11px', color: '#64748b' }}>({bg.LoaiBaiHoc} · {bg.ThoiLuong})</span></span>
                                      <button className={styles.detailBtnDanger} style={{ fontSize: '11px', padding: '2px 6px', height: 'auto', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444' }} onClick={() => deleteRoadmapLecture(bg.MaBaiHoc, l.id)}>Xóa</button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Exercises list */}
                            {assets.exercises.length > 0 && (
                              <div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7' }}>📝 Bài tập & Kiểm tra:</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                  {assets.exercises.map((ex: any) => (
                                    <div key={ex.MaExercise} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f9ff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                                      <span style={{ fontSize: '13px', color: '#0369a1' }}>{ex.Title} <span style={{ fontSize: '11px', color: '#0284c7' }}>({ex.Type})</span></span>
                                      <button className={styles.detailBtnDanger} style={{ fontSize: '11px', padding: '2px 6px', height: 'auto', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444' }} onClick={() => deleteRoadmapExercise(ex.MaExercise, l.id)}>Xóa</button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Documents list */}
                            {assets.documents.length > 0 && (
                              <div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>📂 Tài liệu:</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                  {assets.documents.map((doc: any) => (
                                    <div key={doc.MaTaiLieu} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                                      <span style={{ fontSize: '13px', color: '#15803d' }}>{doc.TieuDe}</span>
                                      <button className={styles.detailBtnDanger} style={{ fontSize: '11px', padding: '2px 6px', height: 'auto', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444' }} onClick={() => deleteRoadmapDoc(doc.MaTaiLieu, l.id)}>Xóa</button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Add Buttons */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                              <button className={styles.detailBtnOutline} style={{ fontSize: '11px', padding: '4px 10px', borderColor: '#f58220', color: '#f58220', cursor: 'pointer', background: 'white' }} onClick={() => openAddLecture(l.id)}>+ Bài giảng</button>
                              <button className={styles.detailBtnOutline} style={{ fontSize: '11px', padding: '4px 10px', borderColor: '#0284c7', color: '#0284c7', cursor: 'pointer', background: 'white' }} onClick={() => openAddExercise(l.id)}>+ Bài tập</button>
                              <button className={styles.detailBtnOutline} style={{ fontSize: '11px', padding: '4px 10px', borderColor: '#16a34a', color: '#16a34a', cursor: 'pointer', background: 'white' }} onClick={() => openAddDoc(l.id)}>+ Tài liệu</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className={styles.modalFooter}>
              <button className={styles.detailBtnOutline} onClick={() => setShowDetail(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: GHI DANH SINH VIÊN ════ */}
      {showDetail && showEnroll && detailClass && (
        <div className={styles.overlay}>
          <div className={styles.enrollModal}>
            <div className={styles.modalTop}>
              <div><h3>Ghi danh sinh viên</h3><div className={styles.modalSub}>Lớp: {detailClass.name} · {detailCourse?.title}</div></div>
              <button className={styles.modalClose} onClick={() => { setShowEnroll(false); setSelectedIds(new Set()) }}>×</button>
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
              <button className={styles.modalClose} onClick={() => setShowAddLesson(false)}>×</button>
            </div>
            <p className={styles.modalSub}>Lớp: {detailClass.name} · {detailCourse?.title}</p>
            <div className={styles.formGroup}><label>Tên buổi học <span className={styles.req}>*</span></label>
              <input value={lessonForm.title} onChange={e => setLessonForm(p => ({...p, title: e.target.value}))} placeholder="VD: Buổi 1: Ngữ pháp cơ bản" />
            </div>
            <div className={styles.formGroup}><label>Mô tả</label>
              <textarea value={lessonForm.desc} onChange={e => setLessonForm(p => ({...p, desc: e.target.value}))} placeholder="Nội dung buổi học..." rows={3} />
            </div>
            <div className={styles.twoCols}>
              <div className={styles.formGroup}><label>📅 Ngày bắt đầu</label>
                <input type="date" value={lessonForm.startDate} onChange={e => setLessonForm(p => ({...p, startDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}><label>📅 Ngày kết thúc</label>
                <input type="date" value={lessonForm.endDate} onChange={e => setLessonForm(p => ({...p, endDate: e.target.value}))} />
              </div>
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
              <button className={styles.modalClose} onClick={() => setShowAddLectureModal(false)}>×</button>
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
                  <label>Nội dung (Markdown hoặc HTML)</label>
                  <textarea value={bgForm.content} onChange={e => setBgForm(p => ({...p, content: e.target.value}))} placeholder="Nội dung bài học..." rows={5} />
                </div>
                <div className={styles.formGroup}>
                  <label>Link tài liệu / Video URL (nếu có)</label>
                  <input value={bgForm.fileUrl} onChange={e => setBgForm(p => ({...p, fileUrl: e.target.value}))} placeholder="http://..." />
                </div>
                <div className={styles.twoCols}>
                  <div className={styles.formGroup}>
                    <label>Loại bài học</label>
                    <select value={bgForm.type} onChange={e => setBgForm(p => ({...p, type: e.target.value}))}>
                      <option value="Video">Video</option>
                      <option value="PDF">PDF</option>
                      <option value="Writing">Writing</option>
                      <option value="Document">Tài liệu khác</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Thời lượng</label>
                    <input value={bgForm.duration} onChange={e => setBgForm(p => ({...p, duration: e.target.value}))} placeholder="VD: 45 phút" />
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
              <button className={styles.modalClose} onClick={() => setShowAddDocModal(false)}>×</button>
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
                  <input value={docForm.fileUrl} onChange={e => setDocForm(p => ({...p, fileUrl: e.target.value}))} placeholder="http://..." />
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

      {/* ════ MODAL: DANH SÁCH ĐĂNG KÝ ════ */}
      {showRegModal && !showAssignClassModal && (
        <div className={styles.overlay}>
          <div className={styles.regModal}>
            <div className={styles.modalTop}>
              <div><h3>Danh sách đăng ký khóa học</h3><div className={styles.modalSub}>Sinh viên đã đăng ký – chờ ghi danh vào lớp</div></div>
              <button className={styles.modalClose} onClick={() => setShowRegModal(false)}>×</button>
            </div>
            <div className={styles.regFilterRow}>
              <select value={regCourseFilter} onChange={e => setRegCourseFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className={styles.regSelect}>
                <option value="all">Tất cả khóa học</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <div className={styles.regStats}>
                <span className={styles.regStatPill} style={{ background:'#fef3c7', color:'#d97706' }}>Chờ: {pendingRegs.filter(r => r.status === 'Chờ ghi danh').length}</span>
                <span className={styles.regStatPill} style={{ background:'#c8eacc', color:'#1e6b30' }}>Đã GD: {pendingRegs.filter(r => r.status === 'Đã ghi danh').length}</span>
              </div>
            </div>
            <div className={styles.regTableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Mã SV</th><th>Họ và tên</th><th>SĐT</th><th>Khóa học</th><th>Ngày ĐK</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {pendingRegs.filter(r => regCourseFilter === 'all' || r.courseId === regCourseFilter).map(r => (
                    <tr key={r.id}>
                      <td className={styles.monoText}>{r.studentId}</td>
                      <td className={styles.boldText}>{r.name}</td>
                      <td>{r.phone}</td><td>{r.courseName}</td><td>{r.regDate}</td>
                      <td><span className={`${styles.badge} ${r.status === 'Chờ ghi danh' ? styles.badgeYellow : r.status === 'Đã ghi danh' ? styles.badgeGreen : styles.badgeRed}`}>{r.status}</span></td>
                      <td>
                        <div className={styles.actionBtns}>
                          {r.status === 'Chờ ghi danh' && (
                            <>
                              <button className={styles.btnPrimary} style={{ fontSize:12, padding:'5px 12px' }}
                                onClick={() => { setSelectedReg(r); setAssignClassId(''); setShowAssignClassModal(true) }}>
                                GD vào lớp
                              </button>
                              <button className={styles.btnDanger} style={{ fontSize:12 }} onClick={() => rejectReg(r.id)}>Từ chối</button>
                            </>
                          )}
                          {r.status !== 'Chờ ghi danh' && <span style={{ fontSize:12, color:'#aaa' }}>—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnOutline} onClick={() => setShowRegModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: GHI DANH VÀO LỚP ════ */}
      {showAssignClassModal && selectedReg && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalTop}>
              <div><h3>Ghi danh vào lớp học</h3><div className={styles.modalSub}>Chọn lớp phù hợp</div></div>
              <button className={styles.modalClose} onClick={() => { setShowAssignClassModal(false); setSelectedReg(null) }}>×</button>
            </div>
            <div className={styles.assignStudentInfo}>
              <div className={styles.assignRow}><span className={styles.assignLabel}>Họ và tên</span><span className={styles.boldText}>{selectedReg.name}</span></div>
              <div className={styles.assignRow}><span className={styles.assignLabel}>Mã SV</span><span className={styles.monoText}>{selectedReg.studentId}</span></div>
              <div className={styles.assignRow}><span className={styles.assignLabel}>Khóa học</span><span className={styles.boldText}>{selectedReg.courseName}</span></div>
            </div>
            <div className={styles.formGroup} style={{ marginTop:16 }}>
              <label>Chọn lớp học <span className={styles.req}>*</span></label>
              <select value={assignClassId} onChange={e => setAssignClassId(Number(e.target.value))}>
                <option value="">-- Chọn lớp --</option>
                {(classesMap[selectedReg.courseId] || []).map(cl => (
                  <option key={cl.id} value={cl.id}>{cl.name} — {cl.schedule} — {cl.students} học viên</option>
                ))}
              </select>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnOutline} onClick={() => { setShowAssignClassModal(false); setSelectedReg(null) }}>Hủy</button>
              <button className={styles.btnPrimary} onClick={confirmAssign} disabled={!assignClassId} style={{ opacity: assignClassId ? 1 : 0.5 }}>
                Xác nhận ghi danh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: XÁC NHẬN XÓA ════ */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
          }}
          onClick={() => { setShowDeleteModal(false); setDeleteAction(null) }}
        >
          <div
            style={{
              background: '#fff', borderRadius: 16, padding: '36px 32px',
              minWidth: 340, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Icon ! */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              border: '2px solid #e57373', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', color: '#e57373', fontSize: 24, fontWeight: 700
            }}>!</div>
            <h3 style={{ marginBottom: 8, fontSize: 18, fontWeight: 700, color: '#222' }}>
              Xác nhận Xóa
            </h3>
            <p style={{ color: '#777', marginBottom: 24, fontSize: 14 }}>
              {deleteMessage}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={async () => {
                  if (deleteAction) {
                    try { await deleteAction() } catch { setToast('Lỗi khi thực hiện!') }
                  }
                  setShowDeleteModal(false)
                  setDeleteAction(null)
                }}
                style={{
                  padding: '12px', borderRadius: 8, border: 'none',
                  background: '#ef9a9a', color: '#fff',
                  cursor: 'pointer', fontWeight: 600, fontSize: 15
                }}
              >
                Xác nhận
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteAction(null) }}
                style={{
                  padding: '12px', borderRadius: 8, border: 'none',
                  background: '#f5f5f5', color: '#555',
                  cursor: 'pointer', fontWeight: 500, fontSize: 15
                }}
              >
                Không
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  )
}