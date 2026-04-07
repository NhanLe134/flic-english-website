import styles from "./Baocaoketquaqtv.module.css"
import { useState, useEffect } from "react"

const API = 'http://localhost:5000'

interface BaiTap {
  ten: string
  diem: number | null
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
  baiTaps: BaiTap[]
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
  const [baiTapHeaders, setBaiTapHeaders] = useState<string[]>([])

  useEffect(() => {
    setLoading(true)

    // Lấy danh sách sinh viên + kết quả
    Promise.all([
      fetch(`${API}/baocao/hocvien`).then(r => r.json()),
      fetch(`${API}/baocao/baitap-headers`).then(r => r.json()),
    ])
      .then(([svData, headers]) => {
        setBaiTapHeaders(Array.isArray(headers) ? headers.map((h: any) => h.TenBai) : [])
        const mapped: HocVien[] = svData.map((sv: any) => {
          const baiTaps: BaiTap[] = (Array.isArray(headers) ? headers : []).map((h: any) => ({
            ten: h.TenBai,
            diem: sv.baiTaps?.[h.MaExercise] ?? null,
          }))
          const diems = baiTaps.filter(b => b.diem !== null).map(b => b.diem as number)
          const diemTB = diems.length > 0
            ? Math.round((diems.reduce((a, b) => a + b, 0) / diems.length) * 100) / 100
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
            baiTaps,
            diemTB,
          }
        })
        setData(mapped)
      })
      .catch(() => {
        // fallback nếu chưa có route
        setData([])
      })
      .finally(() => setLoading(false))
  }, [])

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
    const headers = ["Mã HV", "Họ và tên", "Giới tính", "Lớp/Khóa học", "Trạng thái", ...baiTapHeaders, "Điểm TB"]
    const rows = filtered.map(h => [
      h.maHV, h.hoTen, h.gioiTinh, `${h.lopKhoaHoc} - ${h.tenKhoa}`, h.trangThai,
      ...h.baiTaps.map(b => b.diem !== null ? b.diem : "Chưa nộp"),
      h.diemTB !== null ? h.diemTB : "—",
    ])
    const csv  = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a"); a.href = url; a.download = "baocao_ketqua.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Báo cáo kết quả học tập</h1>
          <p className={styles.subtitle}>Xem và xuất điểm bài tập của từng học viên theo lớp, khóa học</p>
        </div>
        <button className={styles.exportBtn} onClick={handleExportCSV}>
          ⬇ Xuất CSV
        </button>
      </div>

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
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Tìm tên hoặc mã học viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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
                <th>Mã HV</th>
                <th>Họ và Tên</th>
                <th>Lớp / Khóa học</th>
                <th>Trạng thái</th>
                {baiTapHeaders.map(h => <th key={h}>{h}</th>)}
                <th>Điểm TB</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6 + baiTapHeaders.length} className={styles.empty}>Không có dữ liệu.</td></tr>
              ) : filtered.map(hv => (
                <>
                  <tr
                    key={hv.id}
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
                    {hv.baiTaps.map((b, i) => (
                      <td key={i}>
                        {b.diem !== null
                          ? <span className={`${styles.diemBadge} ${diemColor(b.diem)}`}>{b.diem}</span>
                          : <span className={styles.chuaNop}>Chưa nộp</span>
                        }
                      </td>
                    ))}
                    <td>
                      {hv.diemTB !== null
                        ? <span className={`${styles.diemBadge} ${diemColor(hv.diemTB)}`}>{hv.diemTB}</span>
                        : <span className={styles.chuaNop}>—</span>
                      }
                    </td>
                  </tr>

                  {expandedId === hv.id && (
                    <tr key={`expand-${hv.id}`} className={styles.expandRow}>
                      <td colSpan={6 + baiTapHeaders.length}>
                        <div className={styles.expandContent}>
                          <p className={styles.expandTitle}>📊 Chi tiết kết quả – {hv.hoTen}</p>
                          <div className={styles.expandGrid}>
                            {hv.baiTaps.map((b, i) => (
                              <div key={i} className={styles.expandCard}>
                                <p className={styles.expandBaiTen}>{b.ten}</p>
                                {b.diem !== null
                                  ? <span className={`${styles.diemBadge} ${diemColor(b.diem)}`}>{b.diem}</span>
                                  : <span className={styles.chuaNop}>Chưa nộp</span>
                                }
                              </div>
                            ))}
                            <div className={`${styles.expandCard} ${styles.expandTB}`}>
                              <p className={styles.expandBaiTen}>Điểm trung bình</p>
                              {hv.diemTB !== null
                                ? <span className={`${styles.diemBadge} ${diemColor(hv.diemTB)}`}>{hv.diemTB}</span>
                                : <span className={styles.chuaNop}>—</span>
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}

export default BaoCaoKetQuaQTV