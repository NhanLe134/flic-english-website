import React, { useState, useEffect, useMemo } from "react"
import styles from "./Baocaoketquaqtv.module.css"
import { FiSearch, FiUsers, FiCheckCircle, FiAward } from "react-icons/fi"

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

interface HocVien {
  id: number
  maHV: string
  hoTen: string
  gioiTinh: string
  ngaySinh: string
  lopKhoaHoc: string
  tenKhoa: string
  trangThai: "Đang học" | "Hoàn thành" | "Tạm dừng"
  rawScores: Record<number, number | null> // MaExercise -> Diem
  diemTB: number | null
}

const diemColor = (d: number | null) => {
  if (d === null) return ""
  if (d >= 8) return styles.diemXanh
  if (d >= 6) return styles.diemVang
  return styles.diemDo
}

const trangThaiColor: Record<string, string> = {
  "Đang học":   styles.ttDangHoc,
  "Hoàn thành": styles.ttHoanThanh,
  "Tạm dừng":   styles.ttTamDung,
}

const BaoCaoKetQuaQTV = () => {
  const [data, setData]             = useState<HocVien[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [filterKhoa, setFilterKhoa] = useState("Tất cả khóa học")
  const [filterLop, setFilterLop]   = useState("")
  const [filterTT, setFilterTT]     = useState("Tất cả trạng thái")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [rawHeaders, setRawHeaders] = useState<ExerciseHeader[]>([])
  const [allLessons, setAllLessons] = useState<LessonInfo[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setLoading(true)

    // Lấy danh sách sinh viên + bài tập + lessons
    Promise.all([
      fetch(`${API}/baocao/hocvien`).then(r => r.json()),
      fetch(`${API}/baocao/baitap-headers`).then(r => r.json()),
      fetch(`${API}/baocao/lessons`).then(r => r.json()),
    ])
      .then(([svData, headers, lessonsData]) => {
        const headerList: ExerciseHeader[] = Array.isArray(headers) ? headers : []
        setRawHeaders(headerList)
        setAllLessons(Array.isArray(lessonsData) ? lessonsData : [])
        
        const mapped: HocVien[] = (Array.isArray(svData) ? svData : []).map((sv: any) => {
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
            maHV: sv.MaSinhVien,
            hoTen: sv.HoTen,
            gioiTinh: sv.GioiTinh || '—',
            ngaySinh: sv.NgaySinh ? new Date(sv.NgaySinh).toLocaleDateString('vi-VN') : '—',
            lopKhoaHoc: sv.TenLop || '—',
            tenKhoa: sv.TenKhoaHoc || '—',
            trangThai: (sv.TrangThai || 'Đang học') as HocVien['trangThai'],
            rawScores,
            diemTB,
          }
        })
        setData(mapped)
      })
      .catch((err) => {
        console.error("Lỗi lấy dữ liệu báo cáo:", err)
        setData([])
      })
      .finally(() => setLoading(false))
  }, [])

  // Lọc bài tập thuộc về lớp học đang chọn
  const activeHeaders = useMemo(() => {
    if (filterLop === "Tất cả lớp") return rawHeaders
    return rawHeaders.filter(h => h.TenLop === filterLop)
  }, [rawHeaders, filterLop])

  // Lấy danh sách các buổi học động
  // Chỉ hiển thị cột buổi học từ tiến độ thực tế (buổi đang học) trở về trước.
  // Khi chọn 'Tất cả lớp', lấy buổi học đang học lớn nhất trong số tất cả các lớp.
  const uniqueBuois = useMemo(() => {
    if (!filterLop) return []
    const classLessons = allLessons.filter(l => l.TenLop === filterLop)
    if (classLessons.length === 0) return []

    const activeLesson = classLessons.find(l => l.MaLesson === classLessons[0]?.ActiveLessonId)
    const activeThuTu = activeLesson ? activeLesson.ThuTu : Math.max(...classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number), 0)

    if (activeThuTu === 0 || activeThuTu === -Infinity) return []

    return Array.from(new Set(classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number)))
      .sort((a, b) => b - a)
      .filter(b => b <= activeThuTu)
  }, [allLessons, filterLop])

  const getBuoiAvg = (hv: HocVien, buoiNum: number) => {
    const buoiExs = activeHeaders.filter(h => h.ThuTu === buoiNum)
    if (buoiExs.length === 0) return null

    const scores = buoiExs
      .map(ex => hv.rawScores[ex.MaExercise])
      .filter((s): s is number => s !== null)

    if (scores.length === 0) return null

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    return Math.round(avg * 10) / 10
  }

  const khoaList = ["Tất cả khóa học", ...Array.from(new Set(data.map(h => h.tenKhoa)))]
  const lopList = useMemo(() => {
    const classIdMap: Record<string, number> = {}
    allLessons.forEach((l: any) => {
      if (l.TenLop && l.MaLopHoc) {
        classIdMap[l.TenLop] = Math.max(classIdMap[l.TenLop] || 0, l.MaLopHoc)
      }
    })
    return Array.from(new Set(data.map(h => h.lopKhoaHoc).filter(x => x && x !== '—')))
      .sort((a, b) => (classIdMap[b] || 0) - (classIdMap[a] || 0))
  }, [data, allLessons])

  useEffect(() => {
    if (lopList.length > 0 && !lopList.includes(filterLop)) {
      setFilterLop(lopList[0])
    }
  }, [lopList, filterLop])

  const ttList   = ["Tất cả trạng thái", "Đang học", "Hoàn thành", "Tạm dừng"]

  const filtered = data.filter(h => {
    const ms  = h.hoTen.toLowerCase().includes(search.toLowerCase()) || h.maHV.toLowerCase().includes(search.toLowerCase())
    const mk  = filterKhoa === "Tất cả khóa học" || h.tenKhoa === filterKhoa
    const ml  = h.lopKhoaHoc === filterLop
    const mtt = filterTT   === "Tất cả trạng thái" || h.trangThai === filterTT
    return ms && mk && ml && mtt
  })

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterKhoa, filterLop, filterTT])

  // Lấy dữ liệu phân trang
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * 15
    return filtered.slice(startIndex, startIndex + 15)
  }, [filtered, currentPage])

  const tongHV    = filtered.length
  const dangHoc   = filtered.filter(h => h.trangThai === "Đang học").length
  const hoanThanh = filtered.filter(h => h.trangThai === "Hoàn thành").length
  const diemTBs   = filtered.filter(h => h.diemTB !== null).map(h => h.diemTB as number)
  const diemTBchung = diemTBs.length > 0
    ? (diemTBs.reduce((a, b) => a + b, 0) / diemTBs.length).toFixed(2)
    : "—"

  const handleExportCSV = () => {
    const headers = ["Họ và tên", "Mã HV", "Trạng thái", ...uniqueBuois.map(b => `Buổi ${b}`)]
    const rows = filtered.map(h => [
      h.hoTen, h.maHV, h.trangThai,
      ...uniqueBuois.map(b => {
        const avg = getBuoiAvg(h, b)
        return avg !== null ? avg : "Chưa nộp"
      })
    ])
    const csv  = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a"); a.href = url; a.download = "baocao_ketqua.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.page}>

      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Báo cáo kết quả học tập</h1>
          <p className={styles.subtitle}>Xem và xuất điểm bài tập của từng học viên theo lớp, khóa học</p>
        </div>
        <button className={styles.exportBtn} onClick={handleExportCSV}>
          ⬇ Xuất CSV
        </button>
      </div>

      <div className={styles.content}>
        {/* STATS */}
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

        {/* FILTERS */}
        <div className={styles.filterBar}>
          <div className={styles.searchWrap}>
            <div className={styles.searchBox}>
              <input
                placeholder="Tìm tên hoặc mã học viên..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className={styles.searchBtn}>
                <FiSearch />
              </button>
            </div>
          </div>
          <select className={styles.select} value={filterKhoa} onChange={e => setFilterKhoa(e.target.value)}>
            {khoaList.map(k => <option key={k}>{k}</option>)}
          </select>
          <select className={styles.select} value={filterLop} onChange={e => setFilterLop(e.target.value)}>
            {lopList.map(l => <option key={l}>{l}</option>)}
          </select>
          <select className={styles.select} value={filterTT} onChange={e => setFilterTT(e.target.value)}>
            {ttList.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrap}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Đang tải dữ liệu...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>HỌ VÀ TÊN</th>
                  <th>MÃ HV</th>
                  <th>TRẠNG THÁI</th>
                  {uniqueBuois.map(b => (
                    <th key={b}>ĐIỂM TB BUỔI {b}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={3 + uniqueBuois.length} className={styles.empty}>Không có dữ liệu.</td></tr>
                ) : paginatedData.map(hv => (
                  <tr key={hv.id} className={styles.row}>
                    <td>
                      <p className={styles.tenHV}>{hv.hoTen}</p>
                    </td>
                    <td className={styles.maHV}>{hv.maHV}</td>
                    <td>
                      <span className={`${styles.trangThai} ${trangThaiColor[hv.trangThai] || ''}`}>
                        {hv.trangThai}
                      </span>
                    </td>
                    {uniqueBuois.map(b => {
                      const hvLessons = allLessons.filter(l => l.TenLop === hv.lopKhoaHoc)
                      const hvActiveLesson = hvLessons.find(l => l.MaLesson === hvLessons[0]?.ActiveLessonId)
                      const hvActiveThuTu = hvActiveLesson ? hvActiveLesson.ThuTu : Math.max(...hvLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number), 0)

                      // Nếu lớp của học viên này chưa học đến buổi b, hiển thị —
                      if (hvActiveThuTu === null || b > hvActiveThuTu) {
                        return <td key={b} className={styles.emptyVal}>—</td>
                      }

                      const avg = getBuoiAvg(hv, b)
                      const hasExs = activeHeaders.some(h => h.ThuTu === b && h.TenLop === hv.lopKhoaHoc)
                      if (!hasExs) {
                        return <td key={b} className={styles.emptyVal}>—</td>
                      }
                      return (
                        <td key={b}>
                          {avg !== null
                            ? <span className={`${styles.diemBadge} ${diemColor(avg)}`}>{avg}</span>
                            : <span className={styles.chuaNop}>Chưa nộp</span>
                          }
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
      </div>

    </div>
  )
}

export default BaoCaoKetQuaQTV