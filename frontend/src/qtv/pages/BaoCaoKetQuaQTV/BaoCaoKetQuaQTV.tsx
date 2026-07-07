import { useState, useEffect, useMemo, Fragment } from "react"
import styles from "./BaoCaoKetQuaQTV.module.css"
import { FiSearch, FiUsers, FiAward, FiAlertCircle } from "react-icons/fi"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import ChiTietBaiTap from "../../../sinhvien/pages/AssignmentDetail/KhungHienThi/ChiTietBaiTap"

const API = 'http://14.225.192.252:5000'

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
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedReview, setSelectedReview] = useState<{
    studentId: number
    exerciseId: number
    classId: number
  } | null>(null)

  const handleOpenReview = (studentId: number, exerciseId: number, className: string) => {
    const foundLesson = allLessons.find(l => l.TenLop === className && l.MaLopHoc);
    const classId = foundLesson ? foundLesson.MaLopHoc || 0 : 0;
    setSelectedReview({ studentId, exerciseId, classId })
  }

  const handleCloseReview = () => {
    setSelectedReview(null)
  }

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
  const chuaHoanThanh = filtered.filter(h => {
    const classExs = activeHeaders.filter(ex => ex.TenLop === h.lopKhoaHoc)
    if (classExs.length === 0) return false
    return classExs.some(ex => {
      const score = h.rawScores[ex.MaBaiTap];
      return score === null || score === undefined || score === "Chưa nộp";
    });
  }).length
  const diemTBs   = filtered.filter(h => h.diemTB !== null).map(h => h.diemTB as number)
  const diemTBchung = diemTBs.length > 0
    ? (diemTBs.reduce((a, b) => a + b, 0) / diemTBs.length).toFixed(2)
    : "—"

  const isAnyExpanded = expandedStudents.size > 0;
  const buoiColWidth = isAnyExpanded ? '240px' : '120px';

  const handleExportExcel = (mode: "summary" | "detail") => {
    if (filtered.length === 0) {
      alert("Không có học viên nào để xuất!");
      return;
    }

    let headers: string[] = [];
    let rows: Record<string, any>[] = [];

    if (mode === "summary") {
      headers = [
        "Mã học viên",
        "Họ tên",
        "Lớp/khóa",
        "Khóa học",
        "Trạng thái",
        ...uniqueBuois.map(b => `Buổi ${b}`),
        "Điểm trung bình"
      ];

      rows = filtered.map(h => {
        const rowData: Record<string, any> = {
          "Mã học viên": h.maHV,
          "Họ tên": h.hoTen,
          "Lớp/khóa": h.lopKhoaHoc || "—",
          "Khóa học": h.tenKhoa || "—",
          "Trạng thái": h.trangThai || "—",
        };
        uniqueBuois.forEach(b => {
          const res = getBuoiStatusOrAvg(h, b);
          rowData[`Buổi ${b}`] = res.status === "graded" ? res.val : res.status === "pending" ? "Cần chấm" : "Chưa nộp";
        });
        rowData["Điểm trung bình"] = h.diemTB !== null ? h.diemTB : "—";
        return rowData;
      });
    } else {
      // mode === "detail"
      headers = [
        "Mã học viên",
        "Họ tên",
        "Lớp/khóa",
        "Khóa học",
        "Trạng thái"
      ];

      const courseName = filtered[0]?.tenKhoa || "";
      uniqueBuois.forEach(b => {
        const exsInBuoi = exercisesByBuoi[b] || [];
        exsInBuoi.forEach(ex => {
          headers.push(`${ex.TenBai}\n${courseName}`);
        });
        headers.push(`Buổi ${b}`);
      });

      headers.push("Điểm trung bình");

      rows = filtered.map(h => {
        const rowData: Record<string, any> = {
          "Mã học viên": h.maHV,
          "Họ tên": h.hoTen,
          "Lớp/khóa": h.lopKhoaHoc || "—",
          "Khóa học": h.tenKhoa || "—",
          "Trạng thái": h.trangThai || "—",
        };

        uniqueBuois.forEach(b => {
          const exsInBuoi = exercisesByBuoi[b] || [];
          exsInBuoi.forEach(ex => {
            const colHeader = `${ex.TenBai}\n${h.tenKhoa || ""}`;
            const scoreVal = h.rawScores[ex.MaBaiTap];
            if (scoreVal !== null && typeof scoreVal === 'number') {
              rowData[colHeader] = scoreVal;
            } else if (scoreVal === 'Cần chấm') {
              rowData[colHeader] = "Cần chấm";
            } else {
              rowData[colHeader] = "Chưa nộp";
            }
          });

          const res = getBuoiStatusOrAvg(h, b);
          rowData[`Buổi ${b}`] = res.status === "graded" ? res.val : res.status === "pending" ? "Cần chấm" : "Chưa nộp";
        });

        rowData["Điểm trung bình"] = h.diemTB !== null ? h.diemTB : "—";
        return rowData;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bảng điểm");

    // Dynamic column widths
    const colWidths: { wch: number }[] = [];
    if (mode === "summary") {
      colWidths.push(
        { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 15 },
        ...uniqueBuois.map(() => ({ wch: 15 })),
        { wch: 18 }
      );
    } else {
      colWidths.push(
        { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 15 }
      );
      uniqueBuois.forEach(b => {
        const exsInBuoi = exercisesByBuoi[b] || [];
        exsInBuoi.forEach(() => {
          colWidths.push({ wch: 30 });
        });
        colWidths.push({ wch: 15 });
      });
      colWidths.push({ wch: 18 });
    }
    worksheet["!cols"] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    
    const filePrefix = mode === "summary" ? "BangDiem_TongQuan" : "BangDiem_ChiTiet";
    saveAs(blob, `${filePrefix}_${filterLop || "Lop"}_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "-")}.xlsx`);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className={styles.page}>

      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Báo cáo kết quả học tập</h1>
          <p className={styles.subtitle}>Xem và xuất điểm bài tập của từng học viên theo lớp học</p>
        </div>
        {showCsvButton && (
          <button className={styles.exportBtn} onClick={() => setShowExportModal(true)}>
            ⬇ Xuất Excel
          </button>
        )}
      </div>

      <div className={styles.content}>
        {/* STATS */}
        <div className={styles.stats}>
          <div className={`${styles.card} ${styles.cardUsers}`}>
            <div className={styles.cardIconContainer}>
              <FiUsers size={18} />
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Tổng học viên</span>
              <h2 className={styles.cardValue}>{tongHV}</h2>
              <small className={styles.cardSubtext}>Học viên được hiển thị</small>
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardCompleted}`} style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <div className={styles.cardIconContainer} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>
              <FiAlertCircle size={18} />
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Chưa hoàn thành</span>
              <h2 className={styles.cardValue}>{chuaHoanThanh}</h2>
              <small className={styles.cardSubtext}>Học viên chưa hoàn thành</small>
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardAverage}`}>
            <div className={styles.cardIconContainer}>
              <FiAward size={18} />
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
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <select className={styles.select} value={filterLop} onChange={e => setFilterLop(e.target.value)}>
              {lopList.map(l => <option key={l}>{l}</option>)}
            </select>
            <select className={styles.select} value={filterTT} onChange={e => setFilterTT(e.target.value)}>
              {ttList.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrap}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Đang tải dữ liệu...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '40px', minWidth: '40px', maxWidth: '40px', padding: '0 8px', textAlign: 'center', boxSizing: 'border-box' }}></th>
                  <th style={{ width: '120px', minWidth: '120px', maxWidth: '120px', boxSizing: 'border-box' }}>MÃ SINH VIÊN</th>
                  <th style={{ width: '160px', minWidth: '160px', maxWidth: '160px', boxSizing: 'border-box' }}>HỌ TÊN</th>
                  <th style={{ width: '110px', minWidth: '110px', maxWidth: '110px', boxSizing: 'border-box' }}>TRẠNG THÁI</th>
                  {uniqueBuois.map(b => {
                    return (
                      <th key={b} style={{ width: buoiColWidth, minWidth: buoiColWidth, maxWidth: buoiColWidth, boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                          <span>BUỔI {b}</span>
                        </div>
                      </th>
                    )
                  })}
                  <th style={{ width: '90px', minWidth: '90px', maxWidth: '90px', boxSizing: 'border-box' }}>ĐIỂM TB</th>
                  <th></th> {/* Dummy column to absorb extra space and prevent column stretching */}
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
                          <td style={{ width: '40px', minWidth: '40px', maxWidth: '40px', padding: '0 8px', textAlign: 'center', boxSizing: 'border-box' }}>
                            <span style={{ fontSize: '10px', color: '#666', display: 'inline-block', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
                              ▶
                            </span>
                          </td>
                          <td className={styles.maHV} style={{ width: '120px', minWidth: '120px', maxWidth: '120px', boxSizing: 'border-box' }}>{hv.maHV}</td>
                          <td style={{ width: '160px', minWidth: '160px', maxWidth: '160px', boxSizing: 'border-box' }}>
                            <p className={styles.tenHV} style={{ margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{hv.hoTen}</p>
                          </td>
                          <td style={{ width: '110px', minWidth: '110px', maxWidth: '110px', boxSizing: 'border-box' }}>
                            <span className={`${styles.trangThai} ${trangThaiColor[hv.trangThai] || ''}`}>
                              {hv.trangThai}
                            </span>
                          </td>
                          {uniqueBuois.map(b => {
                            const hvActiveLesson = classLessons.find(l => l.MaBuoiHoc === classLessons[0]?.ActiveBuoiHocId)
                            const hvActiveThuTu = hvActiveLesson ? hvActiveLesson.ThuTu : Math.max(...classLessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number), 0)

                            if (hvActiveThuTu === null || b > hvActiveThuTu) {
                              return <td key={b} className={styles.emptyVal} style={{ width: buoiColWidth, minWidth: buoiColWidth, maxWidth: buoiColWidth, boxSizing: 'border-box' }}>—</td>
                            }

                            const res = getBuoiStatusOrAvg(hv, b)
                            const hasExs = activeHeaders.some(h => h.ThuTu === b && h.TenLop === hv.lopKhoaHoc)
                            if (!hasExs) {
                              return <td key={b} className={styles.emptyVal} style={{ width: buoiColWidth, minWidth: buoiColWidth, maxWidth: buoiColWidth, boxSizing: 'border-box' }}>—</td>
                            }
                            return (
                              <td key={b} style={{ width: buoiColWidth, minWidth: buoiColWidth, maxWidth: buoiColWidth, boxSizing: 'border-box' }}>
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
                          <td style={{ width: '90px', minWidth: '90px', maxWidth: '90px', boxSizing: 'border-box' }}>
                            {hv.diemTB !== null ? (
                              <span className={`${styles.diemBadge} ${diemColor(hv.diemTB)}`} style={{ fontWeight: 700 }}>
                                {hv.diemTB}
                              </span>
                            ) : (
                              <span className={styles.chuaNop}>—</span>
                            )}
                          </td>
                          <td></td> {/* Dummy column */}
                        </tr>
                        {isExpanded && (
                          maxExCount > 0 ? (
                            Array.from({ length: maxExCount }).map((_, i) => (
                              <tr key={`sub-${hv.id}-${i}`} style={{ background: '#fbfbfb' }}>
                                <td colSpan={4}></td>
                                {uniqueBuois.map(b => {
                                  const exList = exercisesByBuoi[b] || []
                                  const ex = exList[i]
                                  if (!ex) return <td key={b} style={{ width: buoiColWidth, minWidth: buoiColWidth, maxWidth: buoiColWidth, boxSizing: 'border-box' }}></td>

                                  const scoreVal = hv.rawScores[ex.MaBaiTap]
                                  const wasSubmitted = scoreVal !== null && scoreVal !== undefined;
                                  return (
                                    <td 
                                      key={b} 
                                      onClick={() => {
                                        if (wasSubmitted) {
                                          handleOpenReview(hv.id, ex.MaBaiTap, hv.lopKhoaHoc);
                                        }
                                      }}
                                      style={{ 
                                        padding: '6px 8px', 
                                        borderBottom: '1px solid #f3f4f6', 
                                        width: buoiColWidth, 
                                        minWidth: buoiColWidth, 
                                        maxWidth: buoiColWidth, 
                                        boxSizing: 'border-box',
                                        cursor: wasSubmitted ? 'pointer' : 'default'
                                      }}
                                      className={wasSubmitted ? styles.subRowCell : undefined}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px', width: '100%', overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, flex: 1 }}>
                                          <span style={{ fontWeight: 600, fontSize: '12px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }} title={ex.TenBai}>{ex.TenBai}</span>
                                        </div>
                                        <div style={{ flexShrink: 0 }}>
                                          {scoreVal !== null && typeof scoreVal === 'number' ? (
                                            <span className={`${styles.diemBadgeMini} ${diemColor(scoreVal)}`}>{scoreVal}</span>
                                          ) : scoreVal === 'Cần chấm' ? (
                                            <span className={styles.diemBadgeMini} style={{ background: '#ffe6cc', color: '#d35400', fontSize: '11px', fontWeight: 600 }}>Cần chấm</span>
                                          ) : (
                                            <span className={styles.chuaNopMini}>Chưa</span>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  )
                                })}
                                <td style={{ width: '90px', minWidth: '90px', maxWidth: '90px', boxSizing: 'border-box' }}></td>
                                <td></td> {/* Dummy column */}
                              </tr>
                            ))
                          ) : (
                            <tr style={{ background: '#fbfbfb' }}>
                              <td colSpan={4}></td>
                              <td colSpan={uniqueBuois.length + 2} style={{ textAlign: 'center', color: '#bbb', fontSize: '12.5px', padding: '12px' }}>
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

      {showExportModal && (
        <div className={styles.modalOverlay} onClick={() => setShowExportModal(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader} style={{ padding: '16px 20px' }}>
              <h2>Chọn chế độ xuất Excel</h2>
              <button className={styles.modalClose} onClick={() => setShowExportModal(false)}>&times;</button>
            </div>
            <div className={styles.modalBody} style={{ padding: '20px' }}>
              <div className={styles.exportOptions} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  className={styles.exportOptionBtn}
                  onClick={() => {
                    setShowExportModal(false);
                    handleExportExcel("summary");
                  }}
                >
                  Chế độ 1: Xuất tổng quan
                </button>
                <button 
                  className={`${styles.exportOptionBtn} ${styles.highlight}`}
                  onClick={() => {
                    setShowExportModal(false);
                    handleExportExcel("detail");
                  }}
                >
                  Chế độ 2: Xuất chi tiết toàn bộ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0, 0, 0, 0.4)", display: "flex", justifyContent: "center",
          alignItems: "center", zIndex: 1100
        }}>
          <div style={{
            background: "white", padding: "40px 60px", borderRadius: "16px",
            textAlign: "center", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
          }}>
            <div style={{
              width: "60px", height: "60px", borderRadius: "50%",
              border: "3px solid #2ecc71", display: "flex", justifyContent: "center",
              alignItems: "center", margin: "0 auto 15px"
            }}>
              <span style={{ fontSize: 28, color: "#2ecc71" }}>✔</span>
            </div>
            <p style={{ margin: 0, fontWeight: 600, color: "#333" }}>Tải file báo cáo thành công</p>
          </div>
        </div>
      )}

      {selectedReview && (
        <div className={styles.reviewModalBackdrop} onClick={handleCloseReview}>
          <div className={styles.reviewModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.reviewModalCloseBtn} onClick={handleCloseReview} title="Đóng">
              &times;
            </button>
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
              <ChiTietBaiTap 
                overrideExerciseId={selectedReview.exerciseId}
                overrideStudentId={selectedReview.studentId}
                overrideClassId={selectedReview.classId}
                isModal={true}
                onClose={handleCloseReview}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BaoCaoKetQuaQTV
