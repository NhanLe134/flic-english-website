import { useState, useEffect, useMemo } from 'react'
import styles from './baoCaoKetQua.module.css'

const API = 'http://localhost:5000'

type FilterStatus = 'all' | 'Đang học' | 'Hoàn thành' | 'Đã hủy'

interface ExerciseScore {
  exerciseId: number
  exerciseName: string
  lessonName: string
  score: number | null
  maxScore: number
  submittedAt: string | null
}

interface StudentResult {
  studentId: string
  studentName: string
  gender: string
  className: string
  courseName: string
  enrollDate: string
  status: string
  exerciseScores: ExerciseScore[]
  avgScore: number | null
}

function ScorePill({ score, max }: { score: number | null; max: number }) {
  if (score === null) return <span className={`${styles.pill} ${styles.pillGray}`}>Chưa nộp</span>
  const pct = (score / max) * 100
  const cls = pct >= 80 ? styles.pillGreen : pct >= 60 ? styles.pillYellow : styles.pillRed
  return <span className={`${styles.pill} ${cls}`}>{score.toFixed(1)}</span>
}

export default function BaoCaoKetQua() {
  const [allData, setAllData]           = useState<StudentResult[]>([])
  const [exercises, setExercises]       = useState<{ id: number; name: string; lessonName: string }[]>([])
  const [loading, setLoading]           = useState(true)
  const [searchText, setSearchText]     = useState('')
  const [filterClass, setFilterClass]   = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [expandedId, setExpandedId]     = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API}/baocao/hocvien`).then(r => r.json()),
      fetch(`${API}/baocao/baitap-headers`).then(r => r.json()),
      fetch(`${API}/baocao/diem-all`).then(r => r.json()),
    ])
      .then(([svData, exHeaders, diemData]) => {
        // Map exercise headers
        const exList = Array.isArray(exHeaders) ? exHeaders.map((e: any) => ({
          id: e.MaExercise,
          name: e.TenBai,
          lessonName: e.TenLesson || '—'
        })) : []
        setExercises(exList)

        // Map diem theo MaSinhVien → MaExercise
        const diemMap: Record<number, Record<number, { diem: number; ngayNop: string }>> = {}
        if (Array.isArray(diemData)) {
          for (const d of diemData) {
            if (!diemMap[d.MaSinhVien]) diemMap[d.MaSinhVien] = {}
            diemMap[d.MaSinhVien][d.MaExercise] = { diem: d.Diem, ngayNop: d.NgayNop }
          }
        }

        // Build StudentResult list
        const mapped: StudentResult[] = (Array.isArray(svData) ? svData : []).map((sv: any) => {
          const svDiem = diemMap[sv.MaSinhVien] || {}
          const exerciseScores: ExerciseScore[] = exList.map(ex => ({
            exerciseId: ex.id,
            exerciseName: ex.name,
            lessonName: ex.lessonName,
            score: svDiem[ex.id]?.diem ?? null,
            maxScore: 10,
            submittedAt: svDiem[ex.id]?.ngayNop
              ? new Date(svDiem[ex.id].ngayNop).toLocaleDateString('vi-VN')
              : null,
          }))
          const diems = exerciseScores.filter(e => e.score !== null).map(e => e.score as number)
          const avgScore = diems.length > 0
            ? Math.round((diems.reduce((a, b) => a + b, 0) / diems.length) * 100) / 100
            : null
          return {
            studentId: sv.MaSinhVien,
            studentName: sv.HoTen,
            gender: sv.GioiTinh || '—',
            className: sv.TenLop || '—',
            courseName: sv.TenKhoaHoc || '—',
            enrollDate: sv.NgayGhiDanh
              ? new Date(sv.NgayGhiDanh).toLocaleDateString('vi-VN')
              : '—',
            status: sv.TrangThai || 'Đang học',
            exerciseScores,
            avgScore,
          }
        })
        setAllData(mapped)
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false))
  }, [])

  const classOptions  = [...new Set(allData.map(s => s.className))].sort()
  const courseOptions = [...new Set(allData.map(s => s.courseName))].sort()

  const filtered = useMemo(() => allData.filter(s => {
    const matchSearch  = !searchText || s.studentName.toLowerCase().includes(searchText.toLowerCase()) || s.studentId.toLowerCase().includes(searchText.toLowerCase())
    const matchClass   = !filterClass  || s.className  === filterClass
    const matchCourse  = !filterCourse || s.courseName === filterCourse
    const matchStatus  = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchClass && matchCourse && matchStatus
  }), [allData, searchText, filterClass, filterCourse, filterStatus])

  const allExercises = exercises.map(e => e.name)

  const avgAll      = filtered.filter(s => s.avgScore !== null)
  const avgAllScore = avgAll.length
    ? avgAll.reduce((a, s) => a + (s.avgScore ?? 0), 0) / avgAll.length
    : null

  const downloadCSV = () => {
    const headers = ['Mã HV','Họ và tên','Giới tính','Lớp','Khóa học','Ngày GD','Trạng thái',...allExercises,'TB']
    const rows = filtered.map(s => {
      const map: Record<string, string> = {}
      s.exerciseScores.forEach(e => { map[e.exerciseName] = e.score !== null ? e.score.toFixed(1) : 'Chưa nộp' })
      return [
        s.studentId, s.studentName, s.gender, s.className, s.courseName,
        s.enrollDate, s.status,
        ...allExercises.map(ex => map[ex] ?? '—'),
        s.avgScore !== null ? s.avgScore.toFixed(2) : '—'
      ]
    })
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
      <div className={styles.statRow}>
        <div className={`${styles.statCard} ${styles.statMint}`}><div className={styles.statLbl}>Tổng học viên</div><div className={styles.statVal}>{filtered.length}</div></div>
        <div className={`${styles.statCard} ${styles.statGreen}`}><div className={styles.statLbl}>Đang học</div><div className={styles.statVal}>{filtered.filter(s => s.status === 'Đang học').length}</div></div>
        <div className={`${styles.statCard} ${styles.statBlue}`}><div className={styles.statLbl}>Hoàn thành</div><div className={styles.statVal}>{filtered.filter(s => s.status === 'Hoàn thành').length}</div></div>
        <div className={`${styles.statCard} ${styles.statYellow}`}><div className={styles.statLbl}>Điểm TB chung</div><div className={styles.statVal}>{avgAllScore !== null ? avgAllScore.toFixed(2) : '—'}</div></div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Tìm tên hoặc mã học viên..." />
        </div>
        <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setFilterClass('') }}>
          <option value="">Tất cả khóa học</option>
          {courseOptions.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">Tất cả lớp</option>
          {classOptions.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="Đang học">Đang học</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Đã hủy">Đã hủy</option>
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
                <th style={{ width: 30 }}></th>
                <th>Mã HV</th>
                <th>Họ và tên</th>
                <th>Lớp / Khóa học</th>
                <th>Trạng thái</th>
                {allExercises.map(ex => (
                  <th key={ex} className={styles.exCol} title={ex}>
                    {ex.length > 22 ? ex.slice(0, 20) + '…' : ex}
                  </th>
                ))}
                <th className={styles.avgCol}>Điểm TB</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const isOpen = expandedId === s.studentId
                const scoreMap: Record<string, ExerciseScore> = {}
                s.exerciseScores.forEach(e => { scoreMap[e.exerciseName] = e })
                return (
                  <>
                    <tr
                      key={s.studentId}
                      className={`${styles.dataRow} ${isOpen ? styles.dataRowOpen : ''}`}
                      onClick={() => setExpandedId(isOpen ? null : s.studentId)}
                    >
                      <td><span className={styles.expandIcon}>{isOpen ? '▾' : '▸'}</span></td>
                      <td className={styles.monoText}>{s.studentId}</td>
                      <td>
                        <div className={styles.boldText}>{s.studentName}</div>
                        <div className={styles.dimText}>{s.gender} · GD: {s.enrollDate}</div>
                      </td>
                      <td>
                        <div className={styles.boldText}>{s.className}</div>
                        <div className={styles.dimText}>{s.courseName}</div>
                      </td>
                      <td>
                        <span className={`${styles.pill} ${s.status === 'Đang học' ? styles.pillGreen : s.status === 'Hoàn thành' ? styles.pillBlue : styles.pillRed}`}>
                          {s.status}
                        </span>
                      </td>
                      {allExercises.map(ex => (
                        <td key={ex} className={styles.scoreCell}>
                          <ScorePill score={scoreMap[ex]?.score ?? null} max={scoreMap[ex]?.maxScore ?? 10} />
                        </td>
                      ))}
                      <td className={styles.avgCell}>
                        {s.avgScore !== null
                          ? <span className={`${styles.avgBadge} ${s.avgScore >= 8 ? styles.avgGood : s.avgScore >= 6 ? styles.avgOk : styles.avgBad}`}>{s.avgScore.toFixed(2)}</span>
                          : <span className={styles.dimText}>—</span>
                        }
                      </td>
                    </tr>

                    {isOpen && (
                      <tr key={`${s.studentId}-detail`}>
                        <td colSpan={5 + allExercises.length + 1} className={styles.detailTd}>
                          <div className={styles.detailInner}>
                            <div className={styles.detailTitle}>Chi tiết bài tập của {s.studentName}</div>
                            <div className={styles.detailGrid}>
                              {s.exerciseScores.filter(e => e.score !== null).length === 0
                                ? <span className={styles.dimText}>Chưa nộp bài tập nào.</span>
                                : s.exerciseScores.map(e => (
                                  <div key={e.exerciseId} className={styles.detailCard}>
                                    <div className={styles.detailLesson}>{e.lessonName}</div>
                                    <div className={styles.detailExName}>{e.exerciseName}</div>
                                    <div className={styles.detailScoreRow}>
                                      {e.score !== null ? (
                                        <>
                                          <span className={`${styles.bigScore} ${(e.score/e.maxScore)>=.8?styles.scoreGood:(e.score/e.maxScore)>=.6?styles.scoreOk:styles.scoreBad}`}>
                                            {e.score.toFixed(1)}/{e.maxScore}
                                          </span>
                                          <span className={styles.dimText}>📅 {e.submittedAt}</span>
                                        </>
                                      ) : (
                                        <span className={styles.notSubmitted}>Chưa nộp bài</span>
                                      )}
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.footerNote}>
        Hiển thị {filtered.length}/{allData.length} học viên · Nhấn vào hàng để xem chi tiết bài tập
      </div>
    </div>
  )
}