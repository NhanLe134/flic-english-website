import { useState, useEffect, useMemo, Fragment } from "react"
import styles from "./BaoCaoKetQuaQTV.module.css"
import { FiSearch, FiUsers, FiCheckCircle, FiAward } from "react-icons/fi"

const API = 'http://localhost:5000'

interface ExerciseHeader {
  MaBaiTap: number
  TenBai: string
  TenBuoiHoc: string | null
  ThuTu: number | null
  MaBuoiHoc: number | null
  MaLopHoc: number | null
  TenLop: string | null
}

interface LessonInfo {
  MaBuoiHoc: number
  TenBuoiHoc: string | null
  ThuTu: number | null
  MaLopHoc: number | null
  TenLop: string | null
  ActiveBuoiHocId: number | null
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
  rawScores: Record<number, number | string | null> // MaBaiTap -> Diem / Status
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

interface Props {
  showCsvButton?: boolean
}

const BaoCaoKetQuaQTV = ({ showCsvButton = true }: Props) => {
  const [data, setData]             = useState<HocVien[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [filterKhoa, setFilterKhoa] = useState("Tất cả khóa học")
  const [filterLop, setFilterLop]   = useState("")
  const [filterTT, setFilterTT]     = useState("Tất cả trạng thái")
  const [rawHeaders, setRawHeaders] = useState<ExerciseHeader[]>([])
  const [allLessons, setAllLessons] = useState<LessonInfo[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set())

  const toggleExpandStudent = (id: number) => {
    setExpandedStudents(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  useEffect(() => {
    setLoading(true)

    // Lấy danh sách sinh viên + bài tập + lessons
    Promise.all([
      fetch(`${API}/baocao/hocvien`).then(r => r.json()),
      fetch(`${API}/baocao/baitap-headers`).then(r => r.json()),
      fetch(`${API}/baocao/buoihoc`).then(r => r.json()),
    ])
      .then(([svData, headers, lessonsData]) => {
        const headerList: ExerciseHeader[] = Array.isArray(headers) ? headers : []
        setRawHeaders(headerList)
        setAllLessons(Array.isArray(lessonsData) ? lessonsData : [])
        
        const mapped: HocVien[] = (Array.isArray(svData) ? svData : []).map((sv: any) => {
          const rawScores: Record<number, number | string | null> = {}
          headerList.forEach((h: any) => {
            rawScores[h.MaBaiTap] = sv.baiTaps?.[h.MaBaiTap] ?? null
          })

          const submittedScores = Object.values(rawScores).filter((d): d is number => typeof d === 'number')
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

    const activeLesson = classLessons.find(l => l.MaBuoiHoc === classLessons[0]?.ActiveBuoiHocId)
    const activeThuTu = activeLesson ? activeLesson.ThuTu : null

    const allBuoiNumbers = Array.from(new Set(classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number)))
      .sort((a, b) => b - a);

    if (activeThuTu !== null && activeThuTu !== 0) {
      return allBuoiNumbers.filter(b => b <= activeThuTu);
    }
    return allBuoiNumbers;
  }, [allLessons, filterLop])

  const getBuoiAvg = (hv: HocVien, buoiNum: number) => {
    const buoiExs = activeHeaders.filter(h => h.ThuTu === buoiNum && h.TenLop === hv.lopKhoaHoc)
    if (buoiExs.length === 0) return null

    const scores = buoiExs
      .map(ex => hv.rawScores[ex.MaBaiTap])
      .filter((s): s is number => s !== null && typeof s === 'number')

    if (scores.length === 0) return null

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    return Math.round(avg * 10) / 10
  }

  const getBuoiStatusOrAvg = (hv: HocVien, buoiNum: number) => {
    const buoiExs = activeHeaders.filter(h => h.ThuTu === buoiNum && h.TenLop === hv.lopKhoaHoc)
    if (buoiExs.length === 0) return { status: "none", val: null }

    const scores = buoiExs
      .map(ex => hv.rawScores[ex.MaBaiTap])
      .filter((s): s is number => s !== null && typeof s === 'number')

    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      return { status: "graded", val: Math.round(avg * 10) / 10 }
    }

    const hasPending = buoiExs.some(ex => hv.rawScores[ex.MaBaiTap] === "Cần chấm")
    if (hasPending) {
      return { status: "pending", val: "Cần chấm" }
    }

    return { status: "chuanop", val: "Chưa nộp" }
  }

  const exercisesByBuoi = useMemo(() => {
    const groups: Record<number, ExerciseHeader[]> = {}
    activeHeaders.forEach(ex => {
      if (ex.ThuTu !== null) {
        if (!groups[ex.ThuTu]) groups[ex.ThuTu] = []
        groups[ex.ThuTu].push(ex)
      }
    })
    return groups
  }, [activeHeaders])

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
        {showCsvButton && (
          <button className={styles.exportBtn} onClick={handleExportCSV}>
            ⬇ Xuất CSV
          </button>
        )}
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
                  <th style={{ width: '40px', padding: '0 8px', textAlign: 'center' }}></th>
                  <th>MÃ SINH VIÊN</th>
                  <th>HỌ TÊN</th>
                  <th>LỚP/KHÓA</th>
                  <th>TRẠNG THÁI</th>
                  {uniqueBuois.map(b => {
                    const classLessons = allLessons.filter(l => l.TenLop === filterLop)
                    const lessonForBuoi = classLessons.find(l => l.ThuTu === b)
                    const isActive = lessonForBuoi && classLessons[0]?.ActiveBuoiHocId === lessonForBuoi.MaBuoiHoc
                    return (
                      <th key={b}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                          <span>BUỔI {b}</span>
                          {isActive && (
                            <span className={styles.activeBadgeHeader}>Đang học</span>
                          )}
                        </div>
                      </th>
                    )
                  })}
                  <th>ĐIỂM TB</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6 + uniqueBuois.length} className={styles.empty}>
                      Không có dữ liệu.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(hv => {
                    const isExpanded = expandedStudents.has(hv.id)
                    const classLessons = allLessons.filter(l => l.TenLop === hv.lopKhoaHoc)
                    const maxExCount = Math.max(...uniqueBuois.map(b => exercisesByBuoi[b]?.length || 0), 0)
                    return (
                      <Fragment key={hv.id}>
                        <tr 
                          className={styles.row}
                          onClick={() => toggleExpandStudent(hv.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td style={{ width: '40px', padding: '0 8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '10px', color: '#666', display: 'inline-block', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
                              ▶
                            </span>
                          </td>
                          <td className={styles.maHV}>{hv.maHV}</td>
                          <td>
                            <p className={styles.tenHV}>{hv.hoTen}</p>
                          </td>
                          <td>
                            <p className={styles.tenLop}>{hv.lopKhoaHoc}</p>
                            <p className={styles.subInfo}>{hv.tenKhoa}</p>
                          </td>
                          <td>
                            <span className={`${styles.trangThai} ${trangThaiColor[hv.trangThai] || ''}`}>
                              {hv.trangThai}
                            </span>
                          </td>
                          {uniqueBuois.map(b => {
                            const hvActiveLesson = classLessons.find(l => l.MaBuoiHoc === classLessons[0]?.ActiveBuoiHocId)
                            const hvActiveThuTu = hvActiveLesson ? hvActiveLesson.ThuTu : Math.max(...classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number), 0)

                            if (hvActiveThuTu === null || b > hvActiveThuTu) {
                              return <td key={b} className={styles.emptyVal}>—</td>
                            }

                            const res = getBuoiStatusOrAvg(hv, b)
                            const hasExs = activeHeaders.some(h => h.ThuTu === b && h.TenLop === hv.lopKhoaHoc)
                            if (!hasExs) {
                              return <td key={b} className={styles.emptyVal}>—</td>
                            }
                            return (
                              <td key={b}>
                                {res.status === "graded" ? (
                                  <span className={`${styles.diemBadge} ${diemColor(res.val as number)}`}>{res.val}</span>
                                ) : res.status === "pending" ? (
                                  <span className={styles.diemBadge} style={{ background: '#ffe6cc', color: '#d35400', fontSize: '11px', fontWeight: 600 }}>Cần chấm</span>
                                ) : (
                                  <span className={styles.chuaNop}>Chưa nộp</span>
                                )}
                              </td>
                            )
                          })}
                          <td>
                            {hv.diemTB !== null ? (
                              <span className={`${styles.diemBadge} ${diemColor(hv.diemTB)}`} style={{ fontWeight: 700 }}>
                                {hv.diemTB}
                              </span>
                            ) : (
                              <span className={styles.chuaNop}>—</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          maxExCount > 0 ? (
                            Array.from({ length: maxExCount }).map((_, i) => (
                              <tr key={`sub-${hv.id}-${i}`} style={{ background: '#fbfbfb' }}>
                                <td colSpan={5}></td>
                                {uniqueBuois.map(b => {
                                  const exList = exercisesByBuoi[b] || []
                                  const ex = exList[i]
                                  if (!ex) return <td key={b}></td>

                                  const scoreVal = hv.rawScores[ex.MaBaiTap]
                                  return (
                                    <td key={b} style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                          <span style={{ fontWeight: 600, fontSize: '12.5px', color: '#1e293b' }}>{ex.TenBai}</span>
                                          <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>{hv.tenKhoa}</span>
                                        </div>
                                        <div>
                                          {scoreVal !== null && typeof scoreVal === 'number' ? (
                                            <span className={`${styles.diemBadgeMini} ${diemColor(scoreVal)}`}>{scoreVal}</span>
                                          ) : scoreVal === 'Cần chấm' ? (
                                            <span className={styles.diemBadgeMini} style={{ background: '#ffe6cc', color: '#d35400', fontSize: '11px', fontWeight: 600 }}>Cần chấm</span>
                                          ) : (
                                            <span className={styles.chuaNopMini}>Chưa nộp</span>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  )
                                })}
                                <td></td>
                              </tr>
                            ))
                          ) : (
                            <tr style={{ background: '#fbfbfb' }}>
                              <td colSpan={5}></td>
                              <td colSpan={uniqueBuois.length + 1} style={{ textAlign: 'center', color: '#bbb', fontSize: '12.5px', padding: '12px' }}>
                                Không có bài tập nào.
                              </td>
                            </tr>
                          )
                        )}
                      </Fragment>
                    )
                  })
                )}
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
