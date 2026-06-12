import { useState, useEffect, useMemo } from 'react'
import styles from './baoCaoKetQua.module.css'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell
} from 'recharts'

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#1e293b', fontSize: '13px' }}>{data.name}</p>
        <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#64748b' }}>
          ĐTB chung: <strong style={{ color: '#f58220', fontSize: '13.5px' }}>{data.value.toFixed(2)}</strong>
        </p>
        <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 0 8px 0' }} />
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#10b981', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <span>Giỏi (≥8):</span> <strong>{data.gioiPercent}%</strong>
        </p>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#f59e0b', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <span>Khá (5-8):</span> <strong>{data.khaPercent}%</strong>
        </p>
        <p style={{ margin: '0', fontSize: '12px', color: '#ef4444', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <span>Trung bình (&lt;5):</span> <strong>{data.trungBinhPercent}%</strong>
        </p>
      </div>
    )
  }
  return null
}



const API = 'http://localhost:5000'

interface ExerciseHeader {
  MaExercise: number
  TenBai: string
  TenLesson: string | null
  ThuTu: number | null
  MaLesson: number | null
  MaLopHoc: number | null
  TenLop: string | null
}

interface LessonInfo {
  MaLesson: number
  TenLesson: string | null
  ThuTu: number | null
  MaLopHoc: number | null
  TenLop: string | null
  ActiveLessonId: number | null
}

interface StudentResult {
  id: number
  studentId: string
  studentName: string
  gender: string
  className: string
  courseName: string
  enrollDate: string
  status: string
  rawScores: Record<number, number | null>
  diemTB: number | null
  classId: number | null
}

const pillColor = (d: number | null) => {
  if (d === null) return ''
  if (d >= 8) return styles.pillGreen
  if (d >= 6) return styles.pillYellow
  return styles.pillRed
}

export default function BaoCaoKetQua() {
  const [allData, setAllData]           = useState<StudentResult[]>([])
  const [loading, setLoading]           = useState(true)
  const [searchText, setSearchText]     = useState('')
  const [filterClass, setFilterClass]   = useState('')
  const [filterCourse, setFilterCourse] = useState('Tất cả khóa học')
  const [rawHeaders, setRawHeaders]     = useState<ExerciseHeader[]>([])
  const [allLessons, setAllLessons]     = useState<LessonInfo[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [teachers, setTeachers] = useState<string[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)

  const [viewMode, setViewMode] = useState<'class' | 'lecturer' | 'summary'>('class')
  const [classLecturers, setClassLecturers] = useState<{ MaLopHoc: number, TenGiangVien: string }[]>([])
  const [filterLecturer, setFilterLecturer] = useState<string>('')

  const currentClassId = useMemo(() => {
    if (!filterClass) return null
    const student = allData.find(s => s.className === filterClass)
    if (student && student.classId) return student.classId
    const lesson = allLessons.find(l => l.TenLop === filterClass)
    return lesson ? lesson.MaLopHoc : null
  }, [filterClass, allData, allLessons])

  useEffect(() => {
    if (!currentClassId) {
      setTeachers([])
      return
    }
    setLoadingTeachers(true)
    fetch(`${API}/qtv/lophoc/${currentClassId}/giangvien`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const names = Array.from(new Set(data.map((item: any) => item.TenGiangVien)))
          setTeachers(names as string[])
        } else {
          setTeachers([])
        }
      })
      .catch(err => {
        console.error("Error fetching teachers:", err)
        setTeachers([])
      })
      .finally(() => setLoadingTeachers(false))
  }, [currentClassId])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API}/baocao/hocvien`).then(r => r.json()),
      fetch(`${API}/baocao/baitap-headers`).then(r => r.json()),
      fetch(`${API}/baocao/lessons`).then(r => r.json()),
      fetch(`${API}/baocao/giangvien-all`).then(r => r.json()).catch(() => []),
    ])
      .then(([svData, headers, lessonsData, gvData]) => {
        setClassLecturers(Array.isArray(gvData) ? gvData : [])
        const headerList: ExerciseHeader[] = Array.isArray(headers) ? headers : []
        setRawHeaders(headerList)
        setAllLessons(Array.isArray(lessonsData) ? lessonsData : [])

        const mapped: StudentResult[] = (Array.isArray(svData) ? svData : []).map((sv: any) => {
          const rawScores: Record<number, number | null> = {}
          headerList.forEach((h: any) => {
            rawScores[h.MaExercise] = sv.baiTaps?.[h.MaExercise] ?? null
          })

          const submittedScores = Object.values(rawScores).filter((d): d is number => d !== null)
          const diemTB = submittedScores.length > 0
            ? Math.round((submittedScores.reduce((a, b) => a + b, 0) / submittedScores.length) * 100) / 100
            : null

          return {
            id: sv.MaNguoiDung,
            studentId: sv.MaSinhVien,
            studentName: sv.HoTen,
            gender: sv.GioiTinh || '—',
            className: sv.TenLop || '—',
            courseName: sv.TenKhoaHoc || '—',
            enrollDate: sv.NgaySinh ? new Date(sv.NgaySinh).toLocaleDateString('vi-VN') : '—',
            status: sv.TrangThai || 'Đang học',
            rawScores,
            diemTB,
            classId: sv.MaLopHoc || null,
          }
        })
        setAllData(mapped)
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false))
  }, [])

  const lecturerOptions = useMemo(() => {
    return Array.from(new Set(classLecturers.map(item => item.TenGiangVien))).filter(Boolean)
  }, [classLecturers])

  useEffect(() => {
    if (lecturerOptions.length > 0 && !filterLecturer) {
      setFilterLecturer(lecturerOptions[0])
    }
  }, [lecturerOptions, filterLecturer])

  const lecturerClassIds = useMemo(() => {
    if (!filterLecturer) return []
    return classLecturers
      .filter(item => item.TenGiangVien === filterLecturer)
      .map(item => item.MaLopHoc)
  }, [filterLecturer, classLecturers])

  const lecturerClassNames = useMemo(() => {
    if (lecturerClassIds.length === 0) return []
    const names = new Set<string>()
    allLessons.forEach(l => {
      if (l.MaLopHoc && lecturerClassIds.includes(l.MaLopHoc) && l.TenLop) {
        names.add(l.TenLop)
      }
    })
    allData.forEach(s => {
      if (s.classId && lecturerClassIds.includes(s.classId) && s.className) {
        names.add(s.className)
      }
    })
    return Array.from(names)
  }, [lecturerClassIds, allLessons, allData])

  const activeHeaders = useMemo(() => {
    if (viewMode === 'class') {
      if (!filterClass) return [];
      return rawHeaders.filter(h => h.TenLop === filterClass);
    } else if (viewMode === 'lecturer') {
      if (lecturerClassNames.length === 0) return [];
      return rawHeaders.filter(h => h.TenLop && lecturerClassNames.includes(h.TenLop));
    }
    return rawHeaders;
  }, [rawHeaders, filterClass, viewMode, lecturerClassNames])

  const uniqueBuois = useMemo(() => {
    if (viewMode === 'class') {
      if (!filterClass) return []
      const classLessons = allLessons.filter(l => l.TenLop === filterClass)
      if (classLessons.length === 0) return []

      const activeLesson = classLessons.find(l => l.MaLesson === classLessons[0]?.ActiveLessonId)
      const activeThuTu = activeLesson ? activeLesson.ThuTu : Math.max(...classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number), 0)

      if (activeThuTu === 0 || activeThuTu === -Infinity) return [] // Chưa đánh dấu thì không hiện buổi học nào

      return Array.from(new Set(classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number)))
        .sort((a, b) => b - a)
        .filter(b => activeThuTu !== null && b <= activeThuTu)
    } else if (viewMode === 'lecturer') {
      if (lecturerClassNames.length === 0) return []
      const validBuois = new Set<number>()
      lecturerClassNames.forEach(className => {
        const classLessons = allLessons.filter(l => l.TenLop === className)
        if (classLessons.length > 0) {
          const activeLesson = classLessons.find(l => l.MaLesson === classLessons[0]?.ActiveLessonId)
          const activeThuTu = activeLesson ? activeLesson.ThuTu : Math.max(...classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number), 0)
          
          if (activeThuTu !== null && activeThuTu > 0) {
            classLessons.forEach(l => {
              if (l.ThuTu !== null && l.ThuTu <= activeThuTu) {
                validBuois.add(l.ThuTu)
              }
            })
          }
        }
      })
      return Array.from(validBuois).sort((a, b) => b - a)
    }
    return []
  }, [allLessons, filterClass, viewMode, lecturerClassNames])

  const getBuoiAvg = (hv: StudentResult, buoiNum: number) => {
    const buoiExs = activeHeaders.filter(h => h.ThuTu === buoiNum && h.TenLop === hv.className)
    if (buoiExs.length === 0) return null

    const scores = buoiExs
      .map(ex => hv.rawScores[ex.MaExercise])
      .filter((s): s is number => s !== null)

    if (scores.length === 0) return null

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    return Math.round(avg * 10) / 10
  }

  const courseOptions = useMemo(() => {
    return ["Tất cả khóa học", ...Array.from(new Set(allData.map(h => h.courseName).filter(x => x && x !== '—')))]
  }, [allData])

  const classOptions = useMemo(() => {
    const classIdMap: Record<string, number> = {}
    allLessons.forEach((l: any) => {
      if (l.TenLop && l.MaLopHoc) {
        classIdMap[l.TenLop] = Math.max(classIdMap[l.TenLop] || 0, l.MaLopHoc)
      }
    })
    return Array.from(new Set(allData.map(h => h.className).filter(x => x && x !== '—')))
      .sort((a, b) => (classIdMap[b] || 0) - (classIdMap[a] || 0))
  }, [allData, allLessons])

  useEffect(() => {
    if (classOptions.length > 0 && !classOptions.includes(filterClass)) {
      setFilterClass(classOptions[0])
    }
  }, [classOptions, filterClass])

  const filtered = useMemo(() => {
    return allData.filter(s => {
      const matchSearch  = !searchText || s.studentName.toLowerCase().includes(searchText.toLowerCase()) || s.studentId.toLowerCase().includes(searchText.toLowerCase())
      
      let matchContext = true
      if (viewMode === 'class') {
        matchContext = s.className === filterClass
      } else if (viewMode === 'lecturer') {
        matchContext = s.classId !== null && lecturerClassIds.includes(s.classId)
      }
      
      const matchCourse  = filterCourse === "Tất cả khóa học" || s.courseName === filterCourse
      return matchSearch && matchContext && matchCourse
    })
  }, [allData, searchText, filterClass, filterCourse, viewMode, lecturerClassIds])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchText, filterClass, filterCourse, viewMode, filterLecturer])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * 15
    return filtered.slice(startIndex, startIndex + 15)
  }, [filtered, currentPage])

  const tongHV = filtered.length
  const dangHoc = filtered.filter(s => s.status === 'Đang học').length
  const hoanThanh = filtered.filter(s => s.status === 'Hoàn thành').length
  const diemTBs = filtered.filter(s => s.diemTB !== null).map(s => s.diemTB as number)
  const diemTBchung = diemTBs.length > 0
    ? (diemTBs.reduce((a, b) => a + b, 0) / diemTBs.length).toFixed(2)
    : '—'



  const chartData = useMemo(() => {
    let trungBinhCount = 0
    let khaCount = 0
    let gioiCount = 0

    filtered.forEach(s => {
      if (s.diemTB !== null) {
        if (s.diemTB < 5) trungBinhCount++
        else if (s.diemTB < 8) khaCount++
        else gioiCount++
      }
    })

    const total = filtered.length
    return [
      { name: 'Trung bình (<5)', value: trungBinhCount, color: '#ef4444', percent: total ? Math.round(trungBinhCount/total*100) : 0 },
      { name: 'Khá (5-8)', value: khaCount, color: '#f59e0b', percent: total ? Math.round(khaCount/total*100) : 0 },
      { name: 'Giỏi (≥8)', value: gioiCount, color: '#10b981', percent: total ? Math.round(gioiCount/total*100) : 0 }
    ]
  }, [filtered])

  const getStats = (students: StudentResult[]) => {
    const graded = students.filter(s => s.diemTB !== null)
    const avg = graded.length > 0 ? graded.reduce((sum, s) => sum + (s.diemTB as number), 0) / graded.length : 0
    const total = graded.length
    let gioi = 0, kha = 0, tb = 0
    graded.forEach(s => {
      if ((s.diemTB as number) < 5) tb++
      else if ((s.diemTB as number) < 8) kha++
      else gioi++
    })
    return {
      value: Math.round(avg * 100) / 100,
      gioiPercent: total > 0 ? Math.round((gioi / total) * 100) : 0,
      khaPercent: total > 0 ? Math.round((kha / total) * 100) : 0,
      trungBinhPercent: total > 0 ? Math.round((tb / total) * 100) : 0,
    }
  }

  const summaryLecturerData = useMemo(() => {
    return lecturerOptions.map(lecturerName => {
      const classIds = classLecturers.filter(i => i.TenGiangVien === lecturerName).map(i => i.MaLopHoc)
      const students = allData.filter(s => s.classId !== null && classIds.includes(s.classId))
      return { name: lecturerName, ...getStats(students) }
    }).sort((a, b) => b.value - a.value)
  }, [lecturerOptions, classLecturers, allData])

  const summaryClassData = useMemo(() => {
    const classes = Array.from(new Set(allData.map(s => s.className).filter(name => name && name !== '—')))
    return classes.map(className => {
      const students = allData.filter(s => s.className === className)
      return { name: className, ...getStats(students) }
    }).sort((a, b) => b.value - a.value)
  }, [allData])

  const downloadCSV = () => {
    const headers = ['Họ và tên', 'Mã học viên', 'Trạng thái', ...uniqueBuois.map(b => `Buổi ${b}`)]
    const rows = filtered.map(h => [
      h.studentName, h.studentId, h.status,
      ...uniqueBuois.map(b => {
        const avg = getBuoiAvg(h, b)
        return avg !== null ? avg : 'Chưa nộp'
      })
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'bao-cao-ket-qua.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Báo cáo kết quả học tập</h1>
          <p>Xem và xuất điểm bài tập của từng học viên theo lớp, khóa học</p>
        </div>
        <button className={styles.exportBtn} onClick={downloadCSV}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Xuất CSV
        </button>
      </div>

      <div className={styles.modeTabs}>
        <button className={`${styles.tabBtn} ${viewMode === 'class' ? styles.activeTab : ''}`} onClick={() => setViewMode('class')}>Theo Lớp học</button>
        <button className={`${styles.tabBtn} ${viewMode === 'lecturer' ? styles.activeTab : ''}`} onClick={() => setViewMode('lecturer')}>Theo Giảng viên</button>
        <button className={`${styles.tabBtn} ${viewMode === 'summary' ? styles.activeTab : ''}`} onClick={() => setViewMode('summary')}>Tổng hợp hệ thống</button>
      </div>

      {viewMode === 'summary' ? (
        <div className={styles.summaryCharts}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>So sánh Điểm trung bình giữa các Giảng viên</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={summaryLecturerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={35} fill="#f58220" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>So sánh Điểm trung bình giữa các Lớp học</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={summaryClassData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={35} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.chartSection}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              {viewMode === 'class' ? `Phân phối Điểm trung bình - Lớp: ${filterClass || '—'}` : `Phân phối Điểm trung bình - Giảng viên: ${filterLecturer || '—'}`}
            </h3>
            <div className={styles.chartWrapper}>
              {filtered.filter(s => s.diemTB !== null).length === 0 ? (
                <div className={styles.emptyChart}>Chưa có dữ liệu điểm học viên trong nhóm này</div>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(245, 130, 32, 0.05)' }} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className={styles.infoCard}>
            {viewMode === 'class' ? (
              <div>
                <h3 className={styles.infoTitle}>Thông tin lớp học</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>Lớp học:</span><span className={styles.infoValue}>{filterClass || '—'}</span></div>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>Khóa học:</span><span className={styles.infoValue}>{filtered[0]?.courseName || '—'}</span></div>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>Giảng viên:</span><span className={styles.infoValue}>{loadingTeachers ? 'Đang tải...' : (teachers.length > 0 ? teachers.join(', ') : 'Chưa phân công')}</span></div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className={styles.infoTitle}>Thông tin giảng viên</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Giảng viên:</span>
                    <span className={styles.infoValue}>{filterLecturer || '—'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Lớp phụ trách:</span>
                    <div className={styles.classScrollList}>
                      {lecturerClassNames.length > 0 ? (
                        lecturerClassNames.map(name => (
                          <div key={name} className={styles.classScrollItem}>{name}</div>
                        ))
                      ) : (
                        <div className={styles.classScrollEmpty}>Chưa có lớp</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className={styles.infoStatsDivider}></div>
            <div className={styles.infoStats}>
              <div className={styles.infoStatMini}><span className={styles.statMiniLabel}>Tổng sỹ số</span><span className={styles.statMiniVal}>{tongHV}</span></div>
              <div className={styles.infoStatMini}><span className={styles.statMiniLabel}>Đang học</span><span className={styles.statMiniVal}>{dangHoc}</span></div>
              <div className={styles.infoStatMini}><span className={styles.statMiniLabel}>Hoàn thành</span><span className={styles.statMiniVal}>{hoanThanh}</span></div>
              <div className={styles.infoStatMini}><span className={styles.statMiniLabel}>ĐTB chung</span><span className={`${styles.statMiniVal} ${styles.primaryColor}`}>{diemTBchung}</span></div>
            </div>
          </div>
        </div>
      )}

      {viewMode !== 'summary' && (
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Tìm tên hoặc mã học viên..." />
          </div>

          {viewMode === 'class' && (
            <>
              <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
                {courseOptions.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                {classOptions.map(c => <option key={c}>{c}</option>)}
              </select>
            </>
          )}

          {viewMode === 'lecturer' && (
            <select value={filterLecturer} onChange={e => setFilterLecturer(e.target.value)}>
              {lecturerOptions.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          )}
        </div>
      )}

      {viewMode !== 'summary' && (
        <>
          <div className={styles.tableWrap}>
            {loading ? (
              <div className={styles.empty}>Đang tải dữ liệu...</div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>Không tìm thấy học viên nào phù hợp.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>HỌ VÀ TÊN</th>
                    <th>MÃ HỌC VIÊN</th>
                    <th>TRẠNG THÁI</th>
                    {uniqueBuois.map(b => (
                      <th key={b} style={{ textAlign: 'center' }}>ĐIỂM TB BUỔI {b}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(s => (
                    <tr key={s.studentId} className={styles.dataRow}>
                      <td>
                        <div className={styles.boldText}>{s.studentName}</div>
                      </td>
                      <td className={styles.boldText}>{s.studentId}</td>
                      <td>
                        <span className={`${styles.pill} ${s.status === 'Đang học' ? styles.pillGreen :
                            s.status === 'Hoàn thành' ? styles.pillBlue :
                              s.status === 'Tạm dừng' ? styles.pillYellow :
                                styles.pillRed
                          }`}>
                          {s.status}
                        </span>
                      </td>
                      {uniqueBuois.map(b => {
                        const hvLessons = allLessons.filter(l => l.TenLop === s.className)
                        const hvActiveLesson = hvLessons.find(l => l.MaLesson === hvLessons[0]?.ActiveLessonId)
                        const hvActiveThuTu = hvActiveLesson ? hvActiveLesson.ThuTu : Math.max(...hvLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number), 0)

                        if (hvActiveThuTu === null || b > hvActiveThuTu) {
                          return <td key={b} className={styles.emptyVal}>—</td>
                        }

                        const avg = getBuoiAvg(s, b)
                        const hasExs = activeHeaders.some(h => h.ThuTu === b && h.TenLop === s.className)
                        if (!hasExs) {
                          return <td key={b} className={styles.emptyVal}>—</td>
                        }

                        return (
                          <td 
                            key={b} 
                            className={styles.scoreCell}
                          >
                            {avg !== null ? (
                              <span className={`${styles.avgBadge} ${pillColor(avg)}`}>{avg.toFixed(1)}</span>
                            ) : (
                              <span className={styles.dimText}>Chưa nộp</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filtered.length > 15 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ◀
              </button>
              <span className={styles.pageInfo}>
                Trang <strong>{currentPage}</strong> / {Math.ceil(filtered.length / 15)}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filtered.length / 15)))}
                disabled={currentPage === Math.ceil(filtered.length / 15)}
              >
                ▶
              </button>
            </div>
          )}
        </>
      )}

    </div>
  )
}