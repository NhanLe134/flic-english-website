import React, { useState, useEffect, useMemo } from 'react'
import styles from './baoCaoKetQua.module.css'
import { FiUsers, FiCheckCircle, FiAward } from 'react-icons/fi'


const API = 'http://localhost:5000'

type FilterStatus = 'all' | 'Đang học' | 'Hoàn thành' | 'Đã hủy' | 'Tạm dừng'

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
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [expandedId, setExpandedId]     = useState<string | null>(null)
  const [rawHeaders, setRawHeaders]     = useState<ExerciseHeader[]>([])
  const [allLessons, setAllLessons]     = useState<LessonInfo[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API}/baocao/hocvien`).then(r => r.json()),
      fetch(`${API}/baocao/baitap-headers`).then(r => r.json()),
      fetch(`${API}/baocao/lessons`).then(r => r.json()),
    ])
      .then(([svData, headers, lessonsData]) => {
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
          }
        })
        setAllData(mapped)
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false))
  }, [])

  // Lọc bài tập thuộc về lớp học đang chọn
  const activeHeaders = useMemo(() => {
    if (!filterClass) return rawHeaders
    return rawHeaders.filter(h => h.TenLop === filterClass)
  }, [rawHeaders, filterClass])

  // Lấy danh sách các buổi học động, sắp xếp giảm dần, có fallback
  const uniqueBuois = useMemo(() => {
    if (!filterClass) return []
    const classLessons = allLessons.filter(l => l.TenLop === filterClass)
    if (classLessons.length === 0) return []

    const activeLesson = classLessons.find(l => l.MaLesson === classLessons[0]?.ActiveLessonId)
    const activeThuTu = activeLesson ? activeLesson.ThuTu : Math.max(...classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number), 0)

    if (activeThuTu === 0 || activeThuTu === -Infinity) return []

    return Array.from(new Set(classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number)))
      .sort((a, b) => b - a)
      .filter(b => b <= activeThuTu)
  }, [allLessons, filterClass])

  // Tính điểm trung bình của buổi học
  const getBuoiAvg = (hv: StudentResult, buoiNum: number) => {
    const buoiExs = activeHeaders.filter(h => h.ThuTu === buoiNum)
    if (buoiExs.length === 0) return null

    const scores = buoiExs
      .map(ex => hv.rawScores[ex.MaExercise])
      .filter((s): s is number => s !== null)

    if (scores.length === 0) return null

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    return Math.round(avg * 10) / 10
  }

  // Danh sách khóa học để lọc
  const courseOptions = useMemo(() => {
    return ["Tất cả khóa học", ...Array.from(new Set(allData.map(h => h.courseName).filter(x => x && x !== '—')))]
  }, [allData])

  // Danh sách lớp học để lọc, xếp theo MaLopHoc giảm dần (mới nhất lên trước)
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

  // Tự động chọn lớp mới nhất nếu lớp hiện tại không hợp lệ hoặc chưa được chọn
  useEffect(() => {
    if (classOptions.length > 0 && !classOptions.includes(filterClass)) {
      setFilterClass(classOptions[0])
    }
  }, [classOptions, filterClass])

  const filtered = useMemo(() => {
    return allData.filter(s => {
      const matchSearch  = !searchText || s.studentName.toLowerCase().includes(searchText.toLowerCase()) || s.studentId.toLowerCase().includes(searchText.toLowerCase())
      const matchClass   = s.className  === filterClass
      const matchCourse  = filterCourse === "Tất cả khóa học" || s.courseName === filterCourse
      const matchStatus  = filterStatus === 'all' || s.status === filterStatus
      return matchSearch && matchClass && matchCourse && matchStatus
    })
  }, [allData, searchText, filterClass, filterCourse, filterStatus])

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1)
  }, [searchText, filterClass, filterCourse, filterStatus])

  // Lấy dữ liệu phân trang
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * 15
    return filtered.slice(startIndex, startIndex + 15)
  }, [filtered, currentPage])

  // Tính toán số liệu thống kê ở đầu trang
  const tongHV = filtered.length
  const dangHoc = filtered.filter(s => s.status === 'Đang học').length
  const hoanThanh = filtered.filter(s => s.status === 'Hoàn thành').length
  const diemTBs = filtered.filter(s => s.diemTB !== null).map(s => s.diemTB as number)
  const diemTBchung = diemTBs.length > 0
    ? (diemTBs.reduce((a, b) => a + b, 0) / diemTBs.length).toFixed(2)
    : '—'

  // Xuất file CSV
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
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Báo cáo kết quả học tập</h1>
          <p>Xem và xuất điểm bài tập của từng học viên theo lớp, khóa học</p>
        </div>
        <button className={styles.exportBtn} onClick={downloadCSV}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Xuất CSV
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={`${styles.card} ${styles.cardUsers}`}>
          <div className={styles.cardIconContainer}>
            <FiUsers size={22} />
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Tổng học viên</span>
            <h2 className={styles.cardValue}>{tongHV}</h2>
            <small className={styles.cardSubtext}>Học viên được hiển thị</small>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardActive}`}>
          <div className={styles.cardIconContainer}>
            <FiUsers size={22} />
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Đang học</span>
            <h2 className={styles.cardValue}>{dangHoc}</h2>
            <small className={styles.cardSubtext}>Học viên đang học</small>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardCompleted}`}>
          <div className={styles.cardIconContainer}>
            <FiCheckCircle size={22} />
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Hoàn thành</span>
            <h2 className={styles.cardValue}>{hoanThanh}</h2>
            <small className={styles.cardSubtext}>Học viên hoàn thành</small>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardAverage}`}>
          <div className={styles.cardIconContainer}>
            <FiAward size={22} />
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Điểm TB chung</span>
            <h2 className={styles.cardValue}>{diemTBchung}</h2>
            <small className={styles.cardSubtext}>Điểm trung bình các buổi</small>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Tìm tên hoặc mã học viên..." />
        </div>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          {courseOptions.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          {classOptions.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="Đang học">Đang học</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Đã hủy">Đã hủy</option>
          <option value="Tạm dừng">Tạm dừng</option>
        </select>
      </div>

      {/* Table */}
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
                  <td className={styles.monoText}>{s.studentId}</td>
                  <td>
                    <span className={`${styles.pill} ${
                      s.status === 'Đang học' ? styles.pillGreen :
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
                      <td key={b} className={styles.scoreCell}>
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

      <div className={styles.footerNote}>
        Hiển thị {filtered.length}/{allData.length} học viên
      </div>
    </div>
  )
}