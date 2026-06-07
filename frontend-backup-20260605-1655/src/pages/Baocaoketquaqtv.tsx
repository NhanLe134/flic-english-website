import React, { useState, useEffect, useMemo } from "react"
import styles from "./Baocaoketquaqtv.module.css"
import { FiSearch } from "react-icons/fi"

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
  const [filterLop, setFilterLop]   = useState("Tất cả lớp")
  const [filterTT, setFilterTT]     = useState("Tất cả trạng thái")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [rawHeaders, setRawHeaders] = useState<ExerciseHeader[]>([])
  const [allLessons, setAllLessons] = useState<LessonInfo[]>([])

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
    if (filterLop !== "Tất cả lớp") {
      const classLessons = allLessons.filter(l => l.TenLop === filterLop)
      if (classLessons.length === 0) return []

      const activeLesson = classLessons.find(l => l.MaLesson === classLessons[0]?.ActiveLessonId)
      const activeThuTu = activeLesson ? activeLesson.ThuTu : null

      if (activeThuTu === null) return [] // Chưa đánh dấu thì không hiện buổi học nào

      return Array.from(new Set(classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number)))
        .sort((a, b) => a - b)
        .filter(b => b <= activeThuTu)
    } else {
      // Khi chọn "Tất cả lớp":
      // Tìm buổi học đang học lớn nhất (maxActiveThuTu) trong số tất cả các lớp
      const classActiveThuTus = Array.from(new Set(allLessons.map(l => l.MaLopHoc))).map(lopId => {
        const classLessons = allLessons.filter(l => l.MaLopHoc === lopId)
        const activeLesson = classLessons.find(l => l.MaLesson === classLessons[0]?.ActiveLessonId)
        return activeLesson ? activeLesson.ThuTu : null
      }).filter((t): t is number => t !== null)

      if (classActiveThuTus.length === 0) return [] // Chưa lớp nào đánh dấu thì không hiện buổi nào

      const maxActiveThuTu = Math.max(...classActiveThuTus)
      
      return Array.from(new Set(allLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number)))
        .sort((a, b) => a - b)
        .filter(b => b <= maxActiveThuTu)
    }
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
  const lopList  = ["Tất cả lớp",      ...Array.from(new Set(data.map(h => h.lopKhoaHoc)))]
  const ttList   = ["Tất cả trạng thái", "Đang học", "Hoàn thành", "Tạm dừng"]

  const filtered = data.filter(h => {
    const ms  = h.hoTen.toLowerCase().includes(search.toLowerCase()) || h.maHV.toLowerCase().includes(search.toLowerCase())
    const mk  = filterKhoa === "Tất cả khóa học" || h.tenKhoa === filterKhoa
    const ml  = filterLop  === "Tất cả lớp"      || h.lopKhoaHoc === filterLop
    const mtt = filterTT   === "Tất cả trạng thái" || h.trangThai === filterTT
    return ms && mk && ml && mtt
  })

  const tongHV    = filtered.length
  const dangHoc   = filtered.filter(h => h.trangThai === "Đang học").length
  const hoanThanh = filtered.filter(h => h.trangThai === "Hoàn thành").length
  const diemTBs   = filtered.filter(h => h.diemTB !== null).map(h => h.diemTB as number)
  const diemTBchung = diemTBs.length > 0
    ? (diemTBs.reduce((a, b) => a + b, 0) / diemTBs.length).toFixed(2)
    : "—"

  const handleExportCSV = () => {
    const headers = ["Mã HV", "Họ và tên", "Giới tính", "Lớp/Khóa học", "Trạng thái", ...uniqueBuois.map(b => `Buổi ${b}`), "Điểm TB"]
    const rows = filtered.map(h => [
      h.maHV, h.hoTen, h.gioiTinh, `${h.lopKhoaHoc} - ${h.tenKhoa}`, h.trangThai,
      ...uniqueBuois.map(b => {
        const avg = getBuoiAvg(h, b)
        return avg !== null ? avg : "Chưa nộp"
      }),
      h.diemTB !== null ? h.diemTB : "—",
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
          <div className={`${styles.statBox} ${styles.s1}`}><p>Tổng học viên</p><h2>{tongHV}</h2></div>
          <div className={`${styles.statBox} ${styles.s2}`}><p>Đang học</p><h2>{dangHoc}</h2></div>
          <div className={`${styles.statBox} ${styles.s3}`}><p>Hoàn thành</p><h2>{hoanThanh}</h2></div>
          <div className={`${styles.statBox} ${styles.s4}`}><p>Điểm TB chung</p><h2>{diemTBchung}</h2></div>
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
                  <th className={styles.thArrow}></th>
                  <th>MÃ HV</th>
                  <th>HỌ VÀ TÊN</th>
                  <th>LỚP / KHÓA HỌC</th>
                  <th>TRẠNG THÁI</th>
                  {uniqueBuois.map(b => (
                    <th key={b}>BUỔI {b}</th>
                  ))}
                  <th>ĐIỂM TB</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6 + uniqueBuois.length} className={styles.empty}>Không có dữ liệu.</td></tr>
                ) : filtered.map(hv => (
                  <React.Fragment key={hv.id}>
                    <tr
                      className={styles.row}
                      onClick={() => setExpandedId(expandedId === hv.id ? null : hv.id)}
                    >
                      <td className={styles.arrowCell}>
                        <span className={`${styles.arrow} ${expandedId === hv.id ? styles.arrowDown : ""}`}>▶</span>
                      </td>
                      <td className={styles.maHV}>{hv.maHV}</td>
                      <td>
                        <p className={styles.tenHV}>{hv.hoTen}</p>
                        <p className={styles.subInfo}>{hv.gioiTinh} · {hv.ngaySinh}</p>
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
                        const hvLessons = allLessons.filter(l => l.TenLop === hv.lopKhoaHoc)
                        const hvActiveLesson = hvLessons.find(l => l.MaLesson === hvLessons[0]?.ActiveLessonId)
                        const hvActiveThuTu = hvActiveLesson ? hvActiveLesson.ThuTu : null

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
                      <td>
                        {hv.diemTB !== null
                          ? <span className={`${styles.diemBadge} ${diemColor(hv.diemTB)}`}>{hv.diemTB}</span>
                          : <span className={styles.chuaNop}>—</span>
                        }
                      </td>
                    </tr>

                    {expandedId === hv.id && (
                      <tr className={styles.expandRow}>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        {uniqueBuois.map(b => {
                          const hvLessons = allLessons.filter(l => l.TenLop === hv.lopKhoaHoc)
                          const hvActiveLesson = hvLessons.find(l => l.MaLesson === hvLessons[0]?.ActiveLessonId)
                          const hvActiveThuTu = hvActiveLesson ? hvActiveLesson.ThuTu : null

                          // Nếu lớp của học viên này chưa học đến buổi b, hiển thị —
                          if (hvActiveThuTu === null || b > hvActiveThuTu) {
                            return <td key={b} style={{ verticalAlign: 'top', padding: '12px 14px' }} className={styles.emptyVal}>—</td>
                          }

                          const buoiExs = activeHeaders.filter(h => h.ThuTu === b && h.TenLop === hv.lopKhoaHoc)
                          return (
                            <td key={b} style={{ verticalAlign: 'top', padding: '12px 14px' }}>
                              <div className={styles.buoiExList}>
                                {buoiExs.map(ex => {
                                  const score = hv.rawScores[ex.MaExercise] ?? null
                                  return (
                                    <div key={ex.MaExercise} className={styles.exCard}>
                                      <div className={styles.exCardContent}>
                                        <div className={styles.exCardTitle} title={ex.TenBai}>{ex.TenBai}</div>
                                        <div className={styles.exCardSub}>{hv.tenKhoa}</div>
                                      </div>
                                      <div className={styles.exCardBadge}>
                                        {score !== null
                                          ? <span className={`${styles.diemBadgeMini} ${diemColor(score)}`}>{score}</span>
                                          : <span className={styles.chuaNopMini}>Chưa nộp</span>
                                        }
                                      </div>
                                    </div>
                                  )
                                })}
                                {buoiExs.length === 0 && <span className={styles.chuaNop}>—</span>}
                              </div>
                            </td>
                          )
                        })}
                        <td></td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}

export default BaoCaoKetQuaQTV