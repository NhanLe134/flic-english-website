import { useState, useEffect, useMemo } from 'react';
import './BaoCaoKetQua.css';
import type { StudentResult, LessonInfo, ExerciseHeader } from './kieuDuLieu';

// Import subcomponents
import BaoCaoTheoLopHoc from './components/BaoCaoTheoLopHoc';
import BaoCaoTheoGiangVien from './components/BaoCaoTheoGiangVien';
import BaoCaoTongHopHeThong from './components/BaoCaoTongHopHeThong';

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + '';

const pillColor = (d: number | null) => {
  if (d === null) return '';
  if (d >= 8) return 'pillGreen';
  if (d >= 6) return 'pillYellow';
  return 'pillRed';
};

export default function BaoCaoKetQua() {
  const [allData, setAllData] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterCourse, setFilterCourse] = useState('Tất cả khóa học');
  const [rawHeaders, setRawHeaders] = useState<ExerciseHeader[]>([]);
  const [allLessons, setAllLessons] = useState<LessonInfo[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const [viewMode, setViewMode] = useState<'class' | 'lecturer' | 'summary'>('class');
  const [classLecturers, setClassLecturers] = useState<{ MaLopHoc: number, TenGiangVien: string }[]>([]);
  const [filterLecturer, setFilterLecturer] = useState<string>('');

  const currentClassId = useMemo(() => {
    if (!filterClass) return null;
    const student = allData.find(s => s.className === filterClass);
    if (student && student.classId) return student.classId;
    const lesson = allLessons.find(l => l.TenLop === filterClass);
    return lesson ? lesson.MaLopHoc : null;
  }, [filterClass, allData, allLessons]);

  useEffect(() => {
    if (!currentClassId) {
      setTeachers([]);
      return;
    }
    setLoadingTeachers(true);
    fetch(`${API}/qtv/lophoc/${currentClassId}/giangvien`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTeachers(data.map(t => t.HoTen));
        } else {
          setTeachers([]);
        }
      })
      .catch(() => setTeachers([]))
      .finally(() => setLoadingTeachers(false));
  }, [currentClassId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/baocao/hocvien`).then(r => r.json()),
      fetch(`${API}/baocao/baitap-headers`).then(r => r.json()),
      fetch(`${API}/baocao/buoihoc`).then(r => r.json()),
      fetch(`${API}/baocao/giangvien-all`).then(r => r.json()).catch(() => []),
      fetch(`${API}/admin/khoahoc`).then(r => r.json()).catch(() => []),
    ])
      .then(([svData, headers, lessonsData, gvData, coursesData]) => {
        setClassLecturers(Array.isArray(gvData) ? gvData : []);
        const headerList = Array.isArray(headers) ? headers : [];
        setRawHeaders(headerList);
        setAllLessons(Array.isArray(lessonsData) ? lessonsData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);

        const mapped: StudentResult[] = (Array.isArray(svData) ? svData : []).map((sv: any) => {
          const rawScores: Record<number, number | null> = {};
          headerList.forEach((h: any) => {
            rawScores[h.MaBaiTap] = sv.baiTaps?.[h.MaBaiTap] ?? null;
          });

          const submittedScores = Object.values(rawScores).filter((d): d is number => d !== null);
          const diemTB = submittedScores.length > 0
            ? Math.round((submittedScores.reduce((a, b) => a + b, 0) / submittedScores.length) * 100) / 100
            : null;

          return {
            id: sv.MaNguoiDung,
            studentId: sv.MaSinhVien,
            mssv: sv.MSSV || null,
            studentName: sv.HoTen,
            gender: sv.GioiTinh || '—',
            className: sv.TenLop || '—',
            courseName: sv.TenKhoaHoc || '—',
            enrollDate: sv.NgaySinh ? new Date(sv.NgaySinh).toLocaleDateString('vi-VN') : '—',
            status: sv.TrangThai || 'Đang học',
            rawScores,
            diemTB,
            classId: sv.MaLopHoc || null,
          };
        });
        setAllData(mapped);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const lecturerOptions = useMemo(() => {
    return Array.from(new Set(classLecturers.map(item => item.TenGiangVien))).filter(Boolean);
  }, [classLecturers]);

  useEffect(() => {
    if (lecturerOptions.length > 0 && !filterLecturer) {
      setFilterLecturer(lecturerOptions[0]);
    }
  }, [lecturerOptions, filterLecturer]);

  const lecturerClassIds = useMemo(() => {
    if (!filterLecturer) return [];
    return classLecturers
      .filter(item => item.TenGiangVien === filterLecturer)
      .map(item => item.MaLopHoc);
  }, [filterLecturer, classLecturers]);

  const lecturerClassNames = useMemo(() => {
    if (lecturerClassIds.length === 0) return [];
    const names = new Set<string>();
    allLessons.forEach(l => {
      if (l.MaLopHoc && lecturerClassIds.includes(l.MaLopHoc) && l.TenLop) {
        names.add(l.TenLop);
      }
    });
    allData.forEach(s => {
      if (s.classId && lecturerClassIds.includes(s.classId) && s.className) {
        names.add(s.className);
      }
    });
    return Array.from(names);
  }, [lecturerClassIds, allLessons, allData]);

  const activeHeaders = useMemo(() => {
    if (viewMode === 'class') {
      if (!filterClass) return [];
      return rawHeaders.filter(h => h.TenLop === filterClass);
    } else if (viewMode === 'lecturer') {
      if (lecturerClassNames.length === 0) return [];
      return rawHeaders.filter(h => h.TenLop && lecturerClassNames.includes(h.TenLop));
    }
    return rawHeaders;
  }, [rawHeaders, filterClass, viewMode, lecturerClassNames]);

  const uniqueBuois = useMemo(() => {
    if (viewMode === 'class') {
      if (!filterClass) return [];
      const classLessons = allLessons.filter(l => l.TenLop === filterClass);
      if (classLessons.length === 0) return [];

      const activeLesson = classLessons.find(l => l.MaBuoiHoc === classLessons[0]?.ActiveBuoiHocId);
      const activeThuTu = activeLesson ? activeLesson.ThuTu : Math.max(...classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number), 0);

      if (activeThuTu === 0 || activeThuTu === -Infinity) return [];

      return Array.from(new Set(classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number)))
        .sort((a, b) => b - a)
        .filter(b => activeThuTu !== null && b <= activeThuTu);
    } else if (viewMode === 'lecturer') {
      if (lecturerClassNames.length === 0) return [];
      const validBuois = new Set<number>();
      lecturerClassNames.forEach(className => {
        const classLessons = allLessons.filter(l => l.TenLop === className);
        if (classLessons.length > 0) {
          const activeLesson = classLessons.find(l => l.MaBuoiHoc === classLessons[0]?.ActiveBuoiHocId);
          const activeThuTu = activeLesson ? activeLesson.ThuTu : Math.max(...classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number), 0);

          if (activeThuTu !== null && activeThuTu > 0) {
            classLessons.forEach(l => {
              if (l.ThuTu !== null && l.ThuTu <= activeThuTu) {
                validBuois.add(l.ThuTu);
              }
            });
          }
        }
      });
      return Array.from(validBuois).sort((a, b) => b - a);
    }
    return [];
  }, [allLessons, filterClass, viewMode, lecturerClassNames]);

  const getBuoiAvg = (hv: StudentResult, buoiNum: number) => {
    const buoiExs = activeHeaders.filter(h => h.ThuTu === buoiNum && h.TenLop === hv.className);
    if (buoiExs.length === 0) return null;

    const scores = buoiExs
      .map(ex => hv.rawScores[ex.MaBaiTap])
      .filter((s): s is number => s !== null);

    if (scores.length === 0) return null;

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg * 10) / 10;
  };

  const courseOptions = useMemo(() => {
    const fromCourses = courses.map(c => c.TenKhoaHoc);
    const fromData = allData.map(h => h.courseName);
    return ["Tất cả khóa học", ...Array.from(new Set([...fromCourses, ...fromData])).filter(Boolean)];
  }, [courses, allData]);

  const classOptions = useMemo(() => {
    const classIdMap: Record<string, number> = {};
    allLessons.forEach((l: any) => {
      if (l.TenLop && l.MaLopHoc) {
        classIdMap[l.TenLop] = Math.max(classIdMap[l.TenLop] || 0, l.MaLopHoc);
      }
    });
    return Array.from(new Set(allData.map(h => h.className).filter(x => x && x !== '—')))
      .sort((a, b) => (classIdMap[b] || 0) - (classIdMap[a] || 0));
  }, [allData, allLessons]);

  useEffect(() => {
    if (classOptions.length > 0 && !classOptions.includes(filterClass)) {
      setFilterClass(classOptions[0]);
    }
  }, [classOptions, filterClass]);

  const filtered = useMemo(() => {
    return allData.filter(s => {
      const matchSearch = !searchText || s.studentName.toLowerCase().includes(searchText.toLowerCase()) || s.studentId.toLowerCase().includes(searchText.toLowerCase());

      let matchContext = true;
      if (viewMode === 'class') {
        matchContext = s.className === filterClass;
      } else if (viewMode === 'lecturer') {
        matchContext = s.classId !== null && lecturerClassIds.includes(s.classId);
      }

      const matchCourse = filterCourse === "Tất cả khóa học" || s.courseName === filterCourse;
      return matchSearch && matchContext && matchCourse;
    });
  }, [allData, searchText, filterClass, filterCourse, viewMode, lecturerClassIds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterClass, filterCourse, viewMode, filterLecturer]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * 15;
    return filtered.slice(startIndex, startIndex + 15);
  }, [filtered, currentPage]);

  const getStats = (students: StudentResult[]) => {
    const graded = students.filter(s => s.diemTB !== null);
    const avg = graded.length > 0 ? graded.reduce((sum, s) => sum + (s.diemTB as number), 0) / graded.length : 0;
    const total = graded.length;
    let gioi = 0, kha = 0, tb = 0;
    graded.forEach(s => {
      if ((s.diemTB as number) < 5) tb++;
      else if ((s.diemTB as number) < 8) kha++;
      else gioi++;
    });
    return {
      value: Math.round(avg * 100) / 100,
      gioiPercent: total > 0 ? Math.round((gioi / total) * 100) : 0,
      khaPercent: total > 0 ? Math.round((kha / total) * 100) : 0,
      trungBinhPercent: total > 0 ? Math.round((tb / total) * 100) : 0,
    };
  };

  const summaryLecturerData = useMemo(() => {
    return lecturerOptions.map(lecturerName => {
      const classIds = classLecturers.filter(i => i.TenGiangVien === lecturerName).map(i => i.MaLopHoc);
      const students = allData.filter(s => s.classId !== null && classIds.includes(s.classId));
      return { name: lecturerName, ...getStats(students) };
    }).sort((a, b) => b.value - a.value);
  }, [lecturerOptions, classLecturers, allData]);

  const summaryClassData = useMemo(() => {
    const classes = Array.from(new Set(allData.map(s => s.className).filter(name => name && name !== '—')));
    return classes.map(className => {
      const students = allData.filter(s => s.className === className);
      return { name: className, ...getStats(students) };
    }).sort((a, b) => b.value - a.value);
  }, [allData]);

  const downloadCSV = () => {
    const headers = ['Họ và tên', 'Mã học viên', 'MSSV (Trường)', 'Trạng thái', ...uniqueBuois.map(b => `Buổi ${b}`)];
    const rows = filtered.map(h => [
      h.studentName, h.studentId, h.mssv || '—', h.status,
      ...uniqueBuois.map(b => {
        const avg = getBuoiAvg(h, b);
        return avg !== null ? avg : 'Chưa nộp';
      })
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bao-cao-ket-qua.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const numLecturers = summaryLecturerData.length;
  const numClasses = summaryClassData.length;
  const shouldStack = numLecturers > 5 || numClasses > 5;

  return (
    <div className="bc-kq-container page">
      <div className="pageHeader">
        <div>
          <h1>Báo cáo kết quả học tập và giảng dạy</h1>
          <p>Xem và xuất điểm bài tập của từng học viên theo lớp, khóa học</p>
        </div>
        <button className="exportBtn" onClick={downloadCSV}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Xuất CSV
        </button>
      </div>

      <div className="modeTabs">
        <button className={`tabBtn ${viewMode === 'class' ? 'activeTab' : ''}`} onClick={() => setViewMode('class')}>Theo Lớp học</button>
        <button className={`tabBtn ${viewMode === 'lecturer' ? 'activeTab' : ''}`} onClick={() => setViewMode('lecturer')}>Theo Giảng viên</button>
        <button className={`tabBtn ${viewMode === 'summary' ? 'activeTab' : ''}`} onClick={() => setViewMode('summary')}>Tổng hợp hệ thống</button>
      </div>

      {loading ? (
        <div className="empty">Đang tải dữ liệu báo cáo...</div>
      ) : (
        <>
          {viewMode === 'class' && (
            <BaoCaoTheoLopHoc
              filtered={filtered} paginatedData={paginatedData} allLessons={allLessons} activeHeaders={activeHeaders} uniqueBuois={uniqueBuois}
              courseOptions={courseOptions} classOptions={classOptions} teachers={teachers} loadingTeachers={loadingTeachers}
              filterCourse={filterCourse} setFilterCourse={setFilterCourse} filterClass={filterClass} setFilterClass={setFilterClass}
              searchText={searchText} setSearchText={setSearchText} currentPage={currentPage} setCurrentPage={setCurrentPage}
              getBuoiAvg={getBuoiAvg} pillColor={pillColor}
            />
          )}

          {viewMode === 'lecturer' && (
            <BaoCaoTheoGiangVien
              filtered={filtered} paginatedData={paginatedData} allLessons={allLessons} activeHeaders={activeHeaders} uniqueBuois={uniqueBuois}
              lecturerOptions={lecturerOptions} filterLecturer={filterLecturer} setFilterLecturer={setFilterLecturer}
              lecturerClassNames={lecturerClassNames} searchText={searchText} setSearchText={setSearchText}
              currentPage={currentPage} setCurrentPage={setCurrentPage} getBuoiAvg={getBuoiAvg} pillColor={pillColor}
            />
          )}

          {viewMode === 'summary' && (
            <BaoCaoTongHopHeThong
              summaryLecturerData={summaryLecturerData} summaryClassData={summaryClassData} shouldStack={shouldStack}
            />
          )}
        </>
      )}
    </div>
  );
}
