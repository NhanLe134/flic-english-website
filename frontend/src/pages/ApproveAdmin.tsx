import "./approveAdmin.css";
import { useState, useEffect } from "react";


const API = "http://localhost:5000";
type ContentType = "khoahoc" | "baihocmo";


// Tóm tắt nhanh nội dung bài học để admin biết bài làm gì
function summarizeBaiHoc(item: any) {
  const ky = item.KyNang || ""
  let parsed: any = {}
  try { parsed = JSON.parse(item.NoiDung || "{}") } catch {}


  const map: Record<string, { icon: string; summary: string; detail: string }> = {
    Writing: {
      icon: "✍️",
      summary: parsed.prompt || "Luyện viết đoạn văn",
      detail: [
        Array.isArray(parsed.sentences) ? `${parsed.sentences.filter((s: string) => s.trim()).length} câu sắp xếp` : null,
        parsed.samples && Object.values(parsed.samples).some(v => v) ? `Bài mẫu CEFR ${Object.entries(parsed.samples).filter(([, v]) => v).map(([k]) => k).join("/")}` : null,
      ].filter(Boolean).join(" · ") || "—",
    },
    Reading: {
      icon: "📖",
      summary: parsed.passage ? parsed.passage.slice(0, 80) + (parsed.passage.length > 80 ? "…" : "") : "Đọc hiểu đoạn văn",
      detail: [
        Array.isArray(parsed.questions) && parsed.questions.length ? `${parsed.questions.length} câu hỏi` : null,
        Array.isArray(parsed.vocab) && parsed.vocab.length ? `${parsed.vocab.length} từ vựng` : null,
      ].filter(Boolean).join(" · ") || "—",
    },
    Listening: {
      icon: "🎧",
      summary: Array.isArray(parsed.objectives) && parsed.objectives[0]?.trim() ? parsed.objectives[0] : "Luyện nghe hội thoại",
      detail: [
        item.FileUrl ? "Có file âm thanh" : "Chưa có file âm thanh",
        Array.isArray(parsed.questions) && parsed.questions.length ? `${parsed.questions.length} câu hỏi` : null,
      ].filter(Boolean).join(" · ") || "—",
    },
    Speaking: {
      icon: "🎤",
      summary: parsed.topics ? `Chủ đề: ${parsed.topics}` : "Luyện nói hội thoại",
      detail: [
        parsed.level ? `Mức: ${parsed.level === "Easy" ? "Dễ" : parsed.level === "Medium" ? "Trung bình" : "Khó"}` : null,
        Array.isArray(parsed.phrases) ? `${parsed.phrases.filter((p: any) => p.text).length} câu luyện nói` : null,
      ].filter(Boolean).join(" · ") || "—",
    },
    Grammar: {
      icon: "📐",
      summary: parsed.subtitle || "Luyện ngữ pháp",
      detail: [
        parsed.explanation ? "Có lý thuyết" : null,
        parsed.exercises ? `${parsed.exercises.split("\n").filter((l: string) => l.trim()).length} câu bài tập` : null,
      ].filter(Boolean).join(" · ") || "—",
    },
    Vocabulary: {
      icon: "📚",
      summary: parsed.theme ? `Chủ đề: ${parsed.theme}` : "Học từ vựng",
      detail: Array.isArray(parsed.vocabList)
        ? `${parsed.vocabList.filter((v: any) => v.word && v.meaning).length} từ vựng · Quiz trắc nghiệm`
        : "—",
    },
  }


  return map[ky] ?? { icon: "📄", summary: item.MoTa || "Bài học kỹ năng", detail: "—" }
}


export default function ApproveAdmin() {
  const [contentType, setContentType]   = useState<ContentType>("khoahoc")
  const [activeTab, setActiveTab]       = useState("Tất cả")
  const [search, setSearch]             = useState("")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [khoaHocData, setKhoaHocData]   = useState<any[]>([])
  const [baiHocMoData, setBaiHocMoData] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)


  const loadData = () => {
    setLoading(true)
    Promise.all([
      fetch(`${API}/admin/khoahoc`).then(r => r.json()),
      fetch(`${API}/baihocmo`).then(r => r.json()),
    ])
      .then(([kh, bhm]) => {
        setKhoaHocData(Array.isArray(kh) ? kh : [])
        setBaiHocMoData(Array.isArray(bhm) ? bhm : [])
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadData() }, [])


  const updateStatus = async (status: string) => {
    if (!selectedItem) return
    try {
      if (contentType === "khoahoc") {
        await fetch(`${API}/admin/khoahoc/${selectedItem.MaKhoaHoc}/duyet`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ TrangThai: status })
        })
        setKhoaHocData(prev => prev.map(i => i.MaKhoaHoc === selectedItem.MaKhoaHoc ? { ...i, TrangThai: status } : i))
      } else {
        await fetch(`${API}/baihocmo/${selectedItem.MaBaiHocMo}/duyet`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ TrangThai: status })
        })
        setBaiHocMoData(prev => prev.map(i => i.MaBaiHocMo === selectedItem.MaBaiHocMo ? { ...i, TrangThai: status } : i))
      }
      setSelectedItem((prev: any) => prev ? { ...prev, TrangThai: status } : null)
    } catch { alert("Lỗi khi cập nhật") }
  }


  const currentData  = contentType === "khoahoc" ? khoaHocData : baiHocMoData
  const filteredData = currentData.filter(item => {
    const tt = item.TrangThai
    const matchTab =
      activeTab === "Tất cả" ||
      (activeTab === "Chờ duyệt" && (tt === "Pending"  || tt === "Chờ duyệt")) ||
      (activeTab === "Đã duyệt"  && (tt === "Đã duyệt" || tt === "Hoạt động")) ||
      (activeTab === "Từ chối"   && (tt === "Từ chối"  || tt === "Ẩn"))
    const matchSearch =
      item.TenKhoaHoc?.toLowerCase().includes(search.toLowerCase()) ||
      item.TieuDe?.toLowerCase().includes(search.toLowerCase())     ||
      item.HoTen?.toLowerCase().includes(search.toLowerCase())      ||
      item.TenNguoiTao?.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })


  const getStatusClass = (s: string) =>
    s === "Đã duyệt" || s === "Hoạt động" ? "approved" :
    s === "Từ chối"  || s === "Ẩn"        ? "rejected" : "pending"


  const getStatusLabel = (s: string) =>
    s === "Đã duyệt" || s === "Hoạt động" ? "Đã duyệt" :
    s === "Từ chối"  || s === "Ẩn"        ? "Từ chối"  : "Chờ duyệt"


  const countTab = (tab: string) => currentData.filter(item => {
    const tt = item.TrangThai
    if (tab === "Chờ duyệt") return tt === "Pending"  || tt === "Chờ duyệt"
    if (tab === "Đã duyệt")  return tt === "Đã duyệt" || tt === "Hoạt động"
    if (tab === "Từ chối")   return tt === "Từ chối"  || tt === "Ẩn"
    return true
  }).length


  const skillColor: Record<string, string> = {
    Reading: '#3b82f6', Listening: '#8b5cf6', Speaking: '#10b981',
    Writing: '#f59e0b', Grammar: '#ef4444', Vocabulary: '#e87722',
  }


  // Styles dùng chung trong modal
  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
      <span style={{ minWidth: 130, color: '#888', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#222' }}>{value || '—'}</span>
    </div>
  )


  return (
    <div className="approve-page">
      <h1>FLIC Admin</h1>
      <p style={{ color: "#888", marginBottom: 20, fontSize: 14 }}>
        Duyệt nội dung do quản trị viên nội dung gửi lên
      </p>


      {/* ── Chọn loại ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {([
          { key: "khoahoc",  label: "📚 Khóa học",   count: khoaHocData.filter(k => k.TrangThai === "Pending" || k.TrangThai === "Chờ duyệt").length },
          { key: "baihocmo", label: "🎯 Bài học mở", count: baiHocMoData.filter(b => b.TrangThai === "Chờ duyệt").length },
        ] as const).map(({ key, label, count }) => (
          <button key={key}
            onClick={() => { setContentType(key as ContentType); setActiveTab("Tất cả") }}
            style={{ padding: "10px 24px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", border: "none", transition: "all .2s", background: contentType === key ? "#e87722" : "#f0f0f0", color: contentType === key ? "#fff" : "#555" }}>
            {label} ({count} chờ)
          </button>
        ))}
      </div>


      <input className="search"
        placeholder={contentType === "khoahoc" ? "Tìm tên khóa học, giáo viên..." : "Tìm tên bài học, người tạo..."}
        value={search} onChange={e => setSearch(e.target.value)} />


      <div className="table-box">
        <div className="table-header">
          <h3>{contentType === "khoahoc" ? "Danh sách khóa học chờ duyệt" : "Danh sách bài học mở chờ duyệt"}</h3>
          <p>{contentType === "khoahoc" ? "Kiểm tra và phê duyệt khóa học do quản lý nội dung gửi" : "Kiểm tra và phê duyệt bài học mở miễn phí cho sinh viên"}</p>
          <div className="tabs">
            {["Tất cả", "Chờ duyệt", "Đã duyệt", "Từ chối"].map(tab => (
              <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
                {tab}
                <span style={{ marginLeft: 6, fontSize: 11, background: activeTab === tab ? "rgba(255,255,255,0.3)" : "#e0e0e0", color: activeTab === tab ? "#fff" : "#666", padding: "1px 6px", borderRadius: 10 }}>
                  {countTab(tab)}
                </span>
              </button>
            ))}
          </div>
        </div>


        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Đang tải...</div>
        ) : (
          <table>
            <thead>
              {contentType === "khoahoc" ? (
                <tr><th>Tên khóa học</th><th>Giáo viên</th><th>Trình độ</th><th>Trạng thái</th><th>Ngày tạo</th><th /></tr>
              ) : (
                <tr><th>Tiêu đề bài học</th><th>Kỹ năng</th><th>Cấp độ</th><th>Người tạo</th><th>Trạng thái</th><th>Ngày tạo</th><th /></tr>
              )}
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#999" }}>Không có dữ liệu</td></tr>
              ) : contentType === "khoahoc" ? (
                filteredData.map((item, idx) => (
                  <tr key={idx}>
                    <td><b>{item.TenKhoaHoc}</b></td>
                    <td>{item.HoTen || "—"}</td>
                    <td>{item.TrinhDo}</td>
                    <td><span className={`status ${getStatusClass(item.TrangThai)}`}>{getStatusLabel(item.TrangThai)}</span></td>
                    <td>{item.NgayTao ? new Date(item.NgayTao).toLocaleDateString("vi-VN") : "—"}</td>
                    <td><button className="view-btn" onClick={() => setSelectedItem(item)}>Xem</button></td>
                  </tr>
                ))
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <b>{item.TieuDe}</b>
                      {item.MoTa && <><br /><span style={{ fontSize: 12, color: "#888" }}>{item.MoTa.slice(0, 55)}{item.MoTa.length > 55 ? "..." : ""}</span></>}
                    </td>
                    <td>
                      <span style={{ background: (skillColor[item.KyNang] || '#e87722') + '18', color: skillColor[item.KyNang] || '#e87722', padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                        {item.KyNang}
                      </span>
                    </td>
                    <td>{item.CapDo}</td>
                    <td>{item.TenNguoiTao || "—"}</td>
                    <td><span className={`status ${getStatusClass(item.TrangThai)}`}>{getStatusLabel(item.TrangThai)}</span></td>
                    <td>{item.NgayTao ? new Date(item.NgayTao).toLocaleDateString("vi-VN") : "—"}</td>
                    <td><button className="view-btn" onClick={() => setSelectedItem(item)}>Xem</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>


      {/* ── MODAL ─────────────────────────────────────────────────────────── */}
      {selectedItem && (
        <div className="admin-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: '95vw' }}>


            {/* Header */}
            <div className="modal-header">
              <h2 style={{ margin: 0, fontSize: 16 }}>{selectedItem.TenKhoaHoc || selectedItem.TieuDe}</h2>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>✕</button>
            </div>


            <p className="modal-sub">
              {contentType === "khoahoc" ? "Khóa học" : `Bài học mở · ${selectedItem.KyNang}`}
              {" – "}
              <span style={{
                fontWeight: 600,
                color: getStatusClass(selectedItem.TrangThai) === 'approved' ? '#16a34a' : getStatusClass(selectedItem.TrangThai) === 'rejected' ? '#dc2626' : '#d97706'
              }}>
                {getStatusLabel(selectedItem.TrangThai)}
              </span>
            </p>


            {/* Nội dung modal theo loại */}
            <div className="modal-box" style={{ padding: '4px 0' }}>
              {contentType === "khoahoc" ? (
                // ── KHÓA HỌC: số lớp, giáo viên, sĩ số ──────────────────
                <>
                  {row("Giáo viên phụ trách", <strong>{selectedItem.HoTen || "Chưa phân công"}</strong>)}
                  {row("Trình độ", selectedItem.TrinhDo)}
                  {row("Số lớp học", selectedItem.SoLop != null ? <strong>{selectedItem.SoLop} lớp</strong> : "Chưa có thông tin")}
                  {row("Sĩ số học viên", selectedItem.SiSo != null ? <strong>{selectedItem.SiSo} học viên</strong> : "Chưa có thông tin")}
                  {row("Mô tả", selectedItem.MoTa || "Chưa có mô tả")}
                  {row("Ngày tạo", selectedItem.NgayTao ? new Date(selectedItem.NgayTao).toLocaleDateString("vi-VN") : "—")}
                </>
              ) : (
                // ── BÀI HỌC MỞ: tóm tắt mục đích bài ───────────────────
                (() => {
                  const { icon, summary, detail } = summarizeBaiHoc(selectedItem)
                  return (
                    <>
                      {row("Kỹ năng", (
                        <span style={{ background: (skillColor[selectedItem.KyNang] || '#e87722') + '18', color: skillColor[selectedItem.KyNang] || '#e87722', padding: '2px 10px', borderRadius: 10, fontWeight: 700, fontSize: 12 }}>
                          {selectedItem.KyNang}
                        </span>
                      ))}
                      {row("Cấp độ", selectedItem.CapDo)}
                      {row("Người tạo", selectedItem.TenNguoiTao)}
                      {row("Mô tả bài học", selectedItem.MoTa || "—")}
                      {row("Nội dung chính", (
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 3 }}>{icon} {summary}</div>
                          <div style={{ fontSize: 12, color: '#888' }}>{detail}</div>
                        </div>
                      ))}
                      {selectedItem.LinkUrl && row("Link tài liệu", (
                        <a href={selectedItem.LinkUrl} target="_blank" rel="noreferrer" style={{ color: '#e87722' }}>
                          {selectedItem.LinkUrl}
                        </a>
                      ))}
                      {row("Ngày tạo", selectedItem.NgayTao ? new Date(selectedItem.NgayTao).toLocaleDateString("vi-VN") : "—")}
                    </>
                  )
                })()
              )}
            </div>


            {/* Actions */}
            <div className="modal-actions">
              {getStatusLabel(selectedItem.TrangThai) !== "Đã duyệt" && (
                <button className="approve-btn" onClick={() => updateStatus(contentType === "khoahoc" ? "Đã duyệt" : "Hoạt động")}>
                  ✓ Duyệt
                </button>
              )}
              {getStatusLabel(selectedItem.TrangThai) !== "Từ chối" && (
                <button className="reject-btn" onClick={() => updateStatus(contentType === "khoahoc" ? "Từ chối" : "Ẩn")}>
                  ✗ Từ chối
                </button>
              )}
              <button className="close-main" onClick={() => setSelectedItem(null)}>Đóng</button>
            </div>


          </div>
        </div>
      )}
    </div>
  )
}