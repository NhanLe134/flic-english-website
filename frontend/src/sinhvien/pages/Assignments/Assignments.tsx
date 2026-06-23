import "./Assignments.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

const statusClass: Record<string, string> = {
  "Chưa làm": "asgn-badge-pending",
  "Đang làm": "asgn-badge-inprogress",
  "Đã nộp":   "asgn-badge-submitted",
  "Đã chấm":  "asgn-badge-submitted",
}

const barColor: Record<string, string> = {
  "Chưa làm": "#f97316",
  "Đang làm": "#f97316",
  "Đã nộp":   "#22c55e",
  "Đã chấm":  "#22c55e",
}

function Assignments() {
  const navigate = useNavigate()
  const user = JSON.parse(sessionStorage.getItem("user") || "{}")
  const maNguoiDung = user.MaNguoiDung

  const [exercises, setExercises] = useState<any[]>([])
  const [baiNops,   setBaiNops]   = useState<any[]>([])
  const [classes,   setClasses]   = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState("")
  const [filterStatus, setFilterStatus] = useState("Tất cả")

  useEffect(() => {
    if (!maNguoiDung) return
    Promise.all([
      fetch(`${API}/student/my-classes/${maNguoiDung}`).then(r => r.json()),
      fetch(`${API}/student/bainop/${maNguoiDung}`).then(r => r.json()),
    ])
      .then(async ([classData, nopData]) => {
        const classList = Array.isArray(classData) ? classData : []
        const nopList   = Array.isArray(nopData)   ? nopData   : []
        setClasses(classList)
        setBaiNops(nopList)

        // Lấy bài tập từ tất cả các lớp
        const allExercises: any[] = []
        for (const cls of classList) {
          try {
            const res  = await fetch(`${API}/classes/${cls.MaLopHoc}/baitap`)
            const data = await res.json()
            if (Array.isArray(data)) {
              data.forEach(e => allExercises.push({ ...e, TenLop: cls.TenLop, TenKhoaHoc: cls.TenKhoaHoc, MaLopHoc: cls.MaLopHoc }))
            }
          } catch {}
        }
        setExercises(allExercises)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [maNguoiDung])

  // Map bài nộp theo MaBaiTap
  const nopMap: Record<number, any> = {}
  baiNops.forEach(b => { nopMap[b.MaBaiTap] = b })

  // Build assignment list
  const assignments = exercises.map(e => {
    const nop     = nopMap[e.MaBaiTap]
    const daNop   = !!nop
    const daCham  = nop?.TrangThai === "Đã chấm"
    const status  = daNop ? (daCham ? "Đã chấm" : "Đã nộp") : "Chưa làm"
    const progress= daNop ? 100 : 0

    const parsedContent = (() => {
      if (!e.Content) return {};
      try {
        if (e.Content.trim().startsWith("{")) {
          return JSON.parse(e.Content);
        }
      } catch (err) {}
      return {};
    })();

    const isExam = !!parsedContent.isExam || e.Type === "exam";
    const deadline = parsedContent.deadline || null;
    const startTime = parsedContent.startTime || null;
    const duration = parsedContent.duration || 50;

    let buttonDisabled = false;
    let label = daNop ? "Xem kết quả" : "Làm bài tập";
    let subInfo = "";

    const now = new Date().getTime();

    if (isExam && parsedContent.openingMode === "manual") {
      const isOpened = !!parsedContent.isOpened;
      if (!isOpened) {
        if (!daNop) {
          buttonDisabled = true;
          label = "Chưa mở";
        }
        subInfo = "Bài kiểm tra hiện tại đang đóng";
      } else {
        if (deadline) {
          const deadlineMs = new Date(deadline).getTime();
          if (now > deadlineMs) {
            if (!daNop) {
              buttonDisabled = true;
              label = "Quá hạn";
            }
            subInfo = `Hạn chót: ${new Date(deadline).toLocaleString()} (Quá hạn)`;
          } else {
            if (!daNop) {
              label = "Làm bài Thi ⏱️";
            }
            subInfo = `Hạn chót: ${new Date(deadline).toLocaleString()}`;
          }
        } else {
          if (!daNop) {
            label = "Làm bài Thi ⏱️";
          }
          subInfo = "Bài kiểm tra đang mở";
        }
      }
    } else if (isExam && startTime) {
      const startMs = new Date(startTime).getTime();
      const endMs = startMs + duration * 60 * 1000;
      if (now < startMs) {
        buttonDisabled = true;
        label = "Chưa mở";
        subInfo = `Mở lúc: ${new Date(startTime).toLocaleString()}`;
      } else if (now > endMs) {
        if (!daNop) {
          buttonDisabled = true;
          label = "Đã đóng";
        }
        subInfo = "Bài kiểm tra đã kết thúc";
      } else {
        if (!daNop) {
          label = "Làm bài Thi ⏱️";
        }
        subInfo = `Kết thúc lúc: ${new Date(endMs).toLocaleTimeString()}`;
      }
    } else if (deadline) {
      const deadlineMs = new Date(deadline).getTime();
      if (now > deadlineMs) {
        if (!daNop) {
          buttonDisabled = true;
          label = "Quá hạn";
        }
        subInfo = `Hạn chót: ${new Date(deadline).toLocaleString()} (Quá hạn)`;
      } else {
        subInfo = `Hạn chót: ${new Date(deadline).toLocaleString()}`;
      }
    }

    return {
      MaBaiTap:   e.MaBaiTap,
      title:        e.Title,
      type:         isExam ? "Exam (Bài kiểm tra)" : (e.Type || "Bài tập"),
      status,
      progress,
      diem:         nop?.Diem ?? null,
      TenLop:       e.TenLop,
      TenKhoaHoc:   e.TenKhoaHoc,
      MaLopHoc:     e.MaLopHoc,
      btnLabel:     label,
      buttonDisabled,
      subInfo,
      isExam
    }
  })

  const filtered = assignments.filter(a => {
    const ms = a.title?.toLowerCase().includes(search.toLowerCase()) ||
               a.TenLop?.toLowerCase().includes(search.toLowerCase())
    const mf = filterStatus === "Tất cả" || a.status === filterStatus
    return ms && mf
  })

  const totalBai    = assignments.length
  const daNopCount  = assignments.filter(a => a.status === "Đã nộp" || a.status === "Đã chấm").length
  const diemList    = baiNops.filter(b => b.Diem !== null && b.Diem !== undefined)
  const diemTB      = diemList.length > 0
    ? Math.round(diemList.reduce((s: number, b: any) => s + b.Diem, 0) / diemList.length * 10) / 10
    : null
  const tenLop      = classes[0]?.TenLop || "—"

  return (
        <div className="asgn-content">
          <h1 className="asgn-title">Bài tập</h1>

          {/* Filter row */}
          <div className="asgn-filter-row">
            <div className="asgn-search-wrap">
              <span>🔍</span>
              <input
                placeholder="Tìm kiếm bài tập..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {["Tất cả", "Chưa làm", "Đã nộp", "Đã chấm"].map(s => (
                <button key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding:"7px 14px", borderRadius:20, fontSize:13, cursor:"pointer", fontFamily:"inherit",
                    border: filterStatus === s ? "none" : "1.5px solid #e0d8cc",
                    background: filterStatus === s ? "#e87722" : "#fff",
                    color: filterStatus === s ? "#fff" : "#666",
                    fontWeight: filterStatus === s ? 600 : 400,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="asgn-stats">
            <div className="asgn-stat">
              <p>Tổng số bài</p>
              <h3>{totalBai}</h3>
            </div>
            <div className="asgn-stat">
              <p>Đã nộp</p>
              <h3 className="asgn-stat-green">{daNopCount}/{totalBai}</h3>
            </div>
            <div className="asgn-stat">
              <p>Điểm trung bình</p>
              <h3 className="asgn-stat-green">{diemTB ?? "—"}</h3>
            </div>
            <div className="asgn-stat">
              <p>Lớp hiện tại</p>
              <h3 className="asgn-stat-bold" style={{ fontSize:13 }}>{tenLop}</h3>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
          ) : (
            <div className="asgn-grid">
              {filtered.length === 0 ? (
                <p className="asgn-empty">
                  {assignments.length === 0
                    ? "Bạn chưa có bài tập nào."
                    : "Không tìm thấy bài tập nào."}
                </p>
              ) : filtered.map(a => (
                <div className="asgn-card" key={a.MaBaiTap}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                    <p className="asgn-card-type">{a.type}</p>
                    {a.TenLop && (
                      <span style={{ fontSize:11, color:"#aaa", background:"#f5f5f5", padding:"2px 8px", borderRadius:10, marginLeft:"auto" }}>
                        {a.TenLop}
                      </span>
                    )}
                  </div>
                  <p className="asgn-card-title">{a.title}</p>

                  <div className="asgn-card-row">
                    <span className={`asgn-badge ${statusClass[a.status] || "asgn-badge-pending"}`}>
                      {a.status}
                    </span>
                    {a.diem !== null && a.diem !== undefined
                      ? <span className="asgn-pct" style={{ color:"#22c55e", fontWeight:700 }}>{a.diem}/10</span>
                      : <span className="asgn-pct">{a.progress}%</span>
                    }
                  </div>

                  <div className="asgn-bar">
                    <div style={{ width:`${a.progress}%`, background: barColor[a.status] || "#f97316" }} />
                  </div>

                  {a.subInfo && (
                    <p style={{ margin: "8px 0 4px", fontSize: 12, color: a.subInfo.includes("Quá hạn") || a.subInfo.includes("kết thúc") ? "#dc2626" : "#666", fontStyle: "italic" }}>
                      {a.subInfo}
                    </p>
                  )}

                  <button
                    className={`asgn-btn ${a.buttonDisabled ? "asgn-btn-disabled" : a.status !== "Chưa làm" ? "asgn-btn-outline" : "asgn-btn-fill"}`}
                    disabled={a.buttonDisabled}
                    onClick={() => !a.buttonDisabled && navigate(`/baitap/${a.MaBaiTap}`, {
                      state: { maLopHoc: a.MaLopHoc }
                    })}
                    style={a.buttonDisabled ? { background: "#d1d5db", color: "#9ca3af", borderColor: "#d1d5db", cursor: "default", boxShadow: "none" } : undefined}
                  >
                    {a.btnLabel}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
  )
}

export default Assignments;
