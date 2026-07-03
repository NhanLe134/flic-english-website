import { useState, useEffect } from "react";
import styles from "./DuyetBaiQTV.module.css";
import { FiSearch } from "react-icons/fi";

const API = "http://14.225.192.252:5000";

const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return API + "/" + url.replace(/^\//, "");
};

type ContentType = "baigiang" | "baitap" | "dethi";
type ApprovalStatus = "Chờ duyệt" | "Đã duyệt" | "Từ chối";

interface BaiGiangItem {
  id: number;
  MaBaiHoc: number;
  TieuDe: string;
  LoaiBaiHoc: string;
  ThoiLuong: string;
  TrangThai: string;
  NoiDung: string;
  FileUrl: string;
  MaKhoaHoc: number;
  MaGiangVien: number;
  MaBuoiHoc: number;
  TenGiangVien: string;
  TenKhoaHoc: string;
  CapDo: string;
  NgayGui: string;
}

export default function DuyetBaiQTV() {
  const [activeTab, setActiveTab] = useState<ContentType>("baigiang");
  const [filterStatus, setFilterStatus] = useState<string>("Tất cả");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [baiGiangData, setBaiGiangData] = useState<BaiGiangItem[]>([]);
  const [baiTapData, setBaiTapData] = useState<any[]>([]);
  const [dethiData, setDethiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/qtv/baigiang`).then((r) => r.json()),
      fetch(`${API}/qtv/baitap`).then((r) => r.json()),
      fetch(`${API}/qtv/dethi`).then((r) => r.json()),
    ])
      .then(([bg, bt, dt]) => {
        setBaiGiangData(Array.isArray(bg) ? bg : []);
        setBaiTapData(Array.isArray(bt) ? bt : []);
        setDethiData(Array.isArray(dt) ? dt : []);
      })
      .catch((err) => console.error("Error loading data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper mapping status to standard labels
  const getStatusLabel = (s: string): ApprovalStatus => {
    const statusLower = (s || "").toLowerCase();
    if (statusLower === "published" || statusLower === "hoạt động" || statusLower === "đã duyệt") {
      return "Đã duyệt";
    }
    if (statusLower === "từ chối" || statusLower === "ẩn" || statusLower === "rejected") {
      return "Từ chối";
    }
    return "Chờ duyệt";
  };

  const getStatusClass = (s: string) => {
    const label = getStatusLabel(s);
    if (label === "Đã duyệt") return styles.statusApproved;
    if (label === "Từ chối") return styles.statusRejected;
    return styles.statusPending;
  };

  // Approval handler
  const handleApproveStatus = async (item: any, status: ApprovalStatus) => {
    if (!item) return;
    try {
      let endpoint = "";
      if (activeTab === "baigiang") {
        endpoint = `${API}/baigiang/${item.MaBaiHoc}/status`;
      } else if (activeTab === "baitap") {
        endpoint = `${API}/baitap/${item.MaBaiTap}/status`;
      } else if (activeTab === "dethi") {
        endpoint = `${API}/dethi/${item.MaDeThi}/status`;
      }

      // Status values mapped for backend
      let statusVal = "";
      if (status === "Đã duyệt") {
        statusVal = "published";
      } else {
        statusVal = "rejected";
      }

      const currentUser = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
      const maNguoiDuyet = currentUser.MaNguoiDung;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TrangThai: statusVal, MaNguoiDuyet: maNguoiDuyet }),
      });

      if (res.ok) {
        showToast(status === "Đã duyệt" ? "Phê duyệt nội dung thành công! 🎉" : "Đã từ chối phê duyệt nội dung!");
        setSelectedItem(null);
        loadData();
      } else {
        alert("Lỗi cập nhật trạng thái");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ");
    }
  };

  // Stats calculation
  const allItems = [
    ...baiGiangData.map((d) => ({ ...d, type: "baigiang" })),
    ...baiTapData.map((d) => ({ ...d, type: "baitap" })),
    ...dethiData.map((d) => ({ ...d, type: "dethi" })),
  ];

  const totalCount = allItems.length;
  const pendingCount = allItems.filter((i) => getStatusLabel(i.TrangThaiDuyet || i.TrangThai) === "Chờ duyệt").length;
  const approvedCount = allItems.filter((i) => getStatusLabel(i.TrangThaiDuyet || i.TrangThai) === "Đã duyệt").length;
  const rejectedCount = allItems.filter((i) => getStatusLabel(i.TrangThaiDuyet || i.TrangThai) === "Từ chối").length;

  // Filter current tab data
  const currentData =
    activeTab === "baigiang" ? baiGiangData :
    activeTab === "baitap" ? baiTapData :
    dethiData;

  const filteredData = currentData.filter((item: any) => {
    const statusLabel = getStatusLabel(item.TrangThaiDuyet || item.TrangThai);
    const matchStatus = filterStatus === "Tất cả" || statusLabel === filterStatus;
    const itemTitle = item.TieuDe || item.Title || "";
    const itemAuthor = item.TenGiangVien || item.TenNguoiTao || "";
    const itemCourse = item.TenKhoaHoc || "";
    
    const matchSearch =
      itemTitle.toLowerCase().includes(search.toLowerCase()) ||
      itemAuthor.toLowerCase().includes(search.toLowerCase()) ||
      itemCourse.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getTabPillCount = (status: string) => {
    return currentData.filter((i: any) => {
      const label = getStatusLabel(i.TrangThaiDuyet || i.TrangThai);
      if (status === "Tất cả") return true;
      return label === status;
    }).length;
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Duyệt bài</h1>
        <p className={styles.subtitle}>Xem và phê duyệt các nội dung của giảng viên gửi lên</p>
      </div>

      <div className={styles.content}>
        {/* Stats Row */}
        <div className={styles.statRow}>
          <div className={`${styles.statCard} ${styles.statMint}`}>
            <div className={styles.statLabel}>Tổng bài kiểm duyệt</div>
            <div className={styles.statValue}>{totalCount}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statYellow}`}>
            <div className={styles.statLabel}>Chờ duyệt</div>
            <div className={styles.statValue}>{pendingCount}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <div className={styles.statLabel}>Đã duyệt</div>
            <div className={styles.statValue}>{approvedCount}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statRed}`}>
            <div className={styles.statLabel}>Từ chối</div>
            <div className={styles.statValue}>{rejectedCount}</div>
          </div>
        </div>

        {/* Search bar */}
        <div className={styles.searchWrap}>
          <div className={styles.searchBox}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, giáo viên..."
            />
            <button className={styles.searchBtn}>
              <FiSearch />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabBtn} ${activeTab === "baigiang" ? styles.tabBtnActive : ""}`}
            onClick={() => {
              setActiveTab("baigiang");
              setFilterStatus("Tất cả");
            }}
          >
            Bài giảng
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "baitap" ? styles.tabBtnActive : ""}`}
            onClick={() => {
              setActiveTab("baitap");
              setFilterStatus("Tất cả");
            }}
          >
            Bài tập / Bài kiểm tra
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "dethi" ? styles.tabBtnActive : ""}`}
            onClick={() => {
              setActiveTab("dethi");
              setFilterStatus("Tất cả");
            }}
          >
            Đề thi thử
          </button>
        </div>

        {/* Table Card */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div>
              <h3>Danh sách nội dung chờ duyệt</h3>
              <p>Kiểm tra và phê duyệt bài đăng, khóa học do giáo viên gửi</p>
            </div>
            
            {/* Filter pills */}
            <div className={styles.pillsContainer}>
              {["Tất cả", "Chờ duyệt", "Đã duyệt", "Từ chối"].map((st) => (
                <button
                  key={st}
                  className={`${styles.pillBtn} ${filterStatus === st ? styles.pillBtnActive : ""}`}
                  onClick={() => setFilterStatus(st)}
                >
                  {st === "Tất cả" ? "Tất cả" : st}
                  <span className={styles.pillBadge}>{getTabPillCount(st)}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingText}>Đang tải dữ liệu...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>TIÊU ĐỀ</th>
                  <th>GIÁO VIÊN</th>
                  <th>LOẠI</th>
                  <th>TRẠNG THÁI DUYỆT</th>
                  <th>CẤP ĐỘ</th>
                  <th>NGÀY GỬI</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyCell}>
                      Không tìm thấy nội dung nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item: any, idx) => (
                    <tr
                      key={idx}
                      className={styles.clickableRow}
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className={styles.itemTitle}>
                        <b>{item.TieuDe || item.Title}</b>
                        {(activeTab === "baigiang" || activeTab === "baitap") && item.TenKhoaHoc && (
                          <span className={styles.courseSubtitleText}> ({item.TenKhoaHoc})</span>
                        )}
                      </td>
                      <td>{item.TenGiangVien || item.TenNguoiTao || "—"}</td>
                      <td>
                        {activeTab === "baigiang" ? `Bài giảng (${item.LoaiBaiHoc || "Lý thuyết"})` :
                         activeTab === "baitap" ? `${item.Type}` :
                         activeTab === "dethi" ? `Đề thi thử (${item.LoaiBai || "VSTEP"})` :
                         "Tài liệu"}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(item.TrangThaiDuyet || item.TrangThai)}`}>
                          {getStatusLabel(item.TrangThaiDuyet || item.TrangThai)}
                        </span>
                      </td>
                      <td>{item.CapDo || "—"}</td>
                      <td>
                        {item.NgayGui || item.NgayTao || item.NgayCapNhat || item.CreatedDate
                          ? new Date(item.NgayGui || item.NgayTao || item.NgayCapNhat || item.CreatedDate).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ════ MODAL KIỂM DUYỆT ════ */}
      {selectedItem && (
        <div className={styles.overlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>{selectedItem.TieuDe || selectedItem.Title}</h2>
                <p className={styles.modalSubtitle}>Chi tiết nội dung yêu cầu phê duyệt</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Giảng viên / Người đăng</label>
                  <input
                    type="text"
                    disabled
                    value={selectedItem.TenGiangVien || selectedItem.TenNguoiTao || "Hệ thống"}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Loại nội dung</label>
                  <input
                    type="text"
                    disabled
                    value={
                      activeTab === "baigiang" ? "Bài giảng" :
                      activeTab === "baitap" ? "Bài tập / Bài kiểm tra" :
                      activeTab === "dethi" ? "Đề thi thử" :
                      "Tài liệu học tập"
                    }
                  />
                </div>
              </div>

              {activeTab === "baitap" ? (
                <>
                  <div className={styles.formRowThree}>
                    <div className={styles.formGroup}>
                      <label>Kỹ năng</label>
                      <input type="text" disabled value={selectedItem.KyNang || "—"} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Dạng bài</label>
                      <input type="text" disabled value={selectedItem.DangBai || "—"} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Định dạng</label>
                      <input type="text" disabled value={selectedItem.Type || "—"} />
                    </div>
                  </div>
                  <div className={styles.formGroupFull}>
                    <label>Đề bài / Nội dung</label>
                    <textarea
                      disabled
                      rows={3}
                      value={selectedItem.Content || "Không có nội dung đề bài."}
                    />
                  </div>
                  {selectedItem.Questions && (
                    <div className={styles.formGroupFull}>
                      <label>Câu hỏi / Đáp án</label>
                      <textarea
                        disabled
                        rows={4}
                        value={selectedItem.Questions}
                      />
                    </div>
                  )}
                  {selectedItem.Vocabulary && (
                    <div className={styles.formGroupFull}>
                      <label>Từ vựng đi kèm</label>
                      <input type="text" disabled value={selectedItem.Vocabulary} />
                    </div>
                  )}
                </>
              ) : activeTab === "dethi" ? (
                <>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Thời gian làm bài</label>
                      <input type="text" disabled value={`${selectedItem.ThoiGian || 120} phút`} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Loại đề thi</label>
                      <input type="text" disabled value={selectedItem.LoaiBai || "—"} />
                    </div>
                  </div>
                  <div className={styles.formGroupFull}>
                    <label>Mô tả đề thi</label>
                    <textarea
                      disabled
                      rows={2}
                      value={selectedItem.MoTa || "Không có mô tả đề thi."}
                    />
                  </div>
                  <div className={styles.formGroupFull}>
                    <label>Cấu hình các kỹ năng</label>
                    <input
                      type="text"
                      disabled
                      value={(() => {
                        try {
                          const skills = typeof selectedItem.NoiDungDeThi === "string" 
                            ? JSON.parse(selectedItem.NoiDungDeThi) 
                            : selectedItem.NoiDungDeThi;
                          if (!skills) return "Chưa thiết lập kỹ năng.";
                          const info = [];
                          if (skills.listening?.parts) info.push(`Nghe: ${skills.listening.parts.length} phần`);
                          if (skills.reading?.parts) info.push(`Đọc: ${skills.reading.parts.length} phần`);
                          if (skills.writing?.parts) info.push(`Viết: ${skills.writing.parts.length} phần`);
                          if (skills.speaking?.parts) info.push(`Nói: ${skills.speaking.parts.length} phần`);
                          return info.join(" - ") || "Chưa thiết lập kỹ năng.";
                        } catch(e) {
                          return "Không thể đọc dữ liệu cấu hình.";
                        }
                      })()}
                    />
                  </div>
                  
                  {(() => {
                    let parsedKyNang: any = null;
                    try {
                      parsedKyNang = typeof selectedItem.NoiDungDeThi === "string"
                        ? JSON.parse(selectedItem.NoiDungDeThi)
                        : selectedItem.NoiDungDeThi;
                    } catch (e) {
                      console.error("Error parsing exam content:", e);
                    }
                    if (!parsedKyNang) return null;

                    return (
                      <div style={{ marginTop: "16px", borderTop: "1px solid #cbd5e1", paddingTop: "16px", boxSizing: "border-box", textAlign: "left" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "14px" }}>
                          Xem trước nội dung đề thi chi tiết
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                          {/* 1. Listening Section */}
                          <div>
                            <h4 style={{ color: "#F95800", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", margin: "0 0 10px 0", fontSize: "13px", fontWeight: 700 }}>1. Kỹ năng Nghe (Listening)</h4>
                            {(!parsedKyNang.listening?.parts || parsedKyNang.listening.parts.length === 0) ? (
                              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Chưa có phần nghe nào.</p>
                            ) : (
                              parsedKyNang.listening.parts.map((p: any, pIdx: number) => (
                                <div key={pIdx} style={{ margin: "12px 0", paddingLeft: "10px", borderLeft: "2px solid #cbd5e1" }}>
                                  <h5 style={{ margin: "0 0 4px 0", fontSize: "12.5px", fontWeight: 600 }}>Phần {p.soPhan}: {p.tieuDe}</h5>
                                  <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0" }} dangerouslySetInnerHTML={{ __html: p.huongDan }} />
                                  {p.audioUrl && (
                                    <div style={{ margin: "8px 0" }}>
                                      <audio src={getMediaUrl(p.audioUrl)} controls style={{ height: "24px", maxWidth: "100%" }} />
                                    </div>
                                  )}

                                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                                    {p.cauHois?.map((q: any, qIdx: number) => (
                                      <div key={qIdx} style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                                        <div style={{ fontWeight: 600, fontSize: "12px" }} dangerouslySetInnerHTML={{ __html: `Câu ${q.id}: ${q.noiDung}` }} />
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" }}>
                                          {q.luaChon?.map((choice: string, cIdx: number) => (
                                            <div key={cIdx} style={{ fontSize: "11.5px", color: q.dapAn === ["A", "B", "C", "D"][cIdx] ? "#107544" : "#475569", fontWeight: q.dapAn === ["A", "B", "C", "D"][cIdx] ? 600 : 400 }}>
                                              {choice}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* 2. Reading Section */}
                          <div>
                            <h4 style={{ color: "#F95800", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", margin: "0 0 10px 0", fontSize: "13px", fontWeight: 700 }}>2. Kỹ năng Đọc (Reading)</h4>
                            {(!parsedKyNang.reading?.parts || parsedKyNang.reading.parts.length === 0) ? (
                              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Chưa có phần đọc nào.</p>
                            ) : (
                              parsedKyNang.reading.parts.map((p: any, pIdx: number) => (
                                <div key={pIdx} style={{ margin: "12px 0", paddingLeft: "10px", borderLeft: "2px solid #cbd5e1" }}>
                                  <h5 style={{ margin: "0 0 4px 0", fontSize: "12.5px", fontWeight: 600 }}>Phần {p.soPhan}: {p.tieuDe}</h5>
                                  <p style={{ fontSize: "12px", color: "#475569", fontStyle: "italic", background: "#f1f5f9", padding: "10px", borderRadius: "6px", margin: "6px 0 10px 0", border: "1px solid #cbd5e1" }} dangerouslySetInnerHTML={{ __html: p.doanVan }} />

                                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                                    {p.cauHois?.map((q: any, qIdx: number) => (
                                      <div key={qIdx} style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                                        <div style={{ fontWeight: 600, fontSize: "12px" }} dangerouslySetInnerHTML={{ __html: `Câu ${q.id}: ${q.noiDung}` }} />
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" }}>
                                          {q.luaChon?.map((choice: string, cIdx: number) => (
                                            <div key={cIdx} style={{ fontSize: "11.5px", color: q.dapAn === ["A", "B", "C", "D"][cIdx] ? "#107544" : "#475569", fontWeight: q.dapAn === ["A", "B", "C", "D"][cIdx] ? 600 : 400 }}>
                                              {choice}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* 3. Writing Section */}
                          <div>
                            <h4 style={{ color: "#F95800", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", margin: "0 0 10px 0", fontSize: "13px", fontWeight: 700 }}>3. Kỹ năng Viết (Writing)</h4>
                            {(!parsedKyNang.writing?.parts || parsedKyNang.writing.parts.length === 0) ? (
                              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Chưa có phần viết nào.</p>
                            ) : (
                              parsedKyNang.writing.parts.map((p: any, pIdx: number) => (
                                <div key={pIdx} style={{ margin: "12px 0", paddingLeft: "10px", borderLeft: "2px solid #cbd5e1" }}>
                                  <h5 style={{ margin: "0 0 4px 0", fontSize: "12.5px", fontWeight: 700 }}>Phần {p.soPhan}: {p.tieuDe} ({p.loaiBai || (p.yeuCau && p.yeuCau.toLowerCase().includes("letter") ? "Letter" : "Email")})</h5>
                                  <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px 0" }}>Số từ tối thiểu: {p.soTuToiThieu} từ</p>
                                  <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0" }} dangerouslySetInnerHTML={{ __html: `Hướng dẫn: ${p.huongDan}` }} />
                                  {p.goiY && (
                                    <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0" }} dangerouslySetInnerHTML={{ __html: `Gợi ý: ${p.goiY}` }} />
                                  )}
                                  <p style={{ fontSize: "12.5px", color: "#1e293b", background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} dangerouslySetInnerHTML={{ __html: p.noiDung || "(Chưa nhập đề bài)" }} />
                                </div>
                              ))
                            )}
                          </div>

                          {/* 4. Speaking Section */}
                          <div>
                            <h4 style={{ color: "#F95800", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", margin: "0 0 10px 0", fontSize: "13px", fontWeight: 700 }}>4. Kỹ năng Nói (Speaking)</h4>
                            {(!parsedKyNang.speaking?.parts || parsedKyNang.speaking.parts.length === 0) ? (
                              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Chưa có phần nói nào.</p>
                            ) : (
                              parsedKyNang.speaking.parts.map((p: any, pIdx: number) => (
                                <div key={pIdx} style={{ margin: "12px 0", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                  <h5 style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: 700 }}>Phần {p.soPhan}</h5>
                                  <p style={{ fontSize: "12.5px", color: "#1e293b", fontWeight: 600, marginBottom: "8px" }} dangerouslySetInnerHTML={{ __html: `Đề bài: ${p.noiDung || "(Chưa nhập câu hỏi)"}` }} />
                                  {p.imageUrl && (
                                    <div style={{ margin: "10px 0", textAlign: "left" }}>
                                      <img src={getMediaUrl(p.imageUrl)} alt="Speaking Visual Prompt" style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                                    </div>
                                  )}
                                  {p.audioUrl && (
                                    <div style={{ margin: "8px 0" }}>
                                      <audio src={getMediaUrl(p.audioUrl)} controls style={{ height: "24px", maxWidth: "100%" }} />
                                    </div>
                                  )}
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11.5px", color: "#475569" }}>
                                    <div>Thời gian chuẩn bị: <strong>{p.thoiGianChuanBi || 0} giây</strong></div>
                                    <div>Thời gian trả lời: <strong>{p.thoiGianNoi || 0} giây</strong></div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className={styles.formGroupFull}>
                  <label>Mô tả / Nội dung chi tiết</label>
                  <textarea
                    disabled
                    rows={4}
                    value={
                      activeTab === "baigiang" ? selectedItem.NoiDung || "Chưa có nội dung chi tiết." :
                      selectedItem.MoTa || "Chưa có mô tả tài liệu."
                    }
                  />
                </div>
              )}

              {activeTab === "dethi" ? (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Trạng thái duyệt</label>
                    <input type="text" disabled value={selectedItem.TrangThaiDuyet || "Chờ duyệt"} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ngày gửi</label>
                    <input
                      type="text"
                      disabled
                      value={
                        selectedItem.NgayGui || selectedItem.NgayTao || selectedItem.NgayCapNhat || selectedItem.CreatedDate
                          ? new Date(selectedItem.NgayGui || selectedItem.NgayTao || selectedItem.NgayCapNhat || selectedItem.CreatedDate).toLocaleDateString("vi-VN")
                          : "—"
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.formRowThree}>
                  <div className={styles.formGroup}>
                    <label>Lớp học</label>
                    <input type="text" disabled value={selectedItem.TenLop || "—"} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ngày gửi</label>
                    <input
                      type="text"
                      disabled
                      value={
                        selectedItem.NgayGui || selectedItem.NgayTao || selectedItem.NgayCapNhat || selectedItem.CreatedDate
                          ? new Date(selectedItem.NgayGui || selectedItem.NgayTao || selectedItem.NgayCapNhat || selectedItem.CreatedDate).toLocaleDateString("vi-VN")
                          : "—"
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Trình độ khóa học</label>
                    <input
                      type="text"
                      disabled
                      value={selectedItem.CapDo || "Beginner"}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              {getStatusLabel(selectedItem.TrangThaiDuyet || selectedItem.TrangThai) === "Đã duyệt" ? (
                <span className={`${styles.statusBadge} ${styles.statusApproved}`} style={{ fontSize: "14px", padding: "8px 16px" }}>
                  Đã duyệt
                </span>
              ) : getStatusLabel(selectedItem.TrangThaiDuyet || selectedItem.TrangThai) === "Từ chối" ? (
                <span className={`${styles.statusBadge} ${styles.statusRejected}`} style={{ fontSize: "14px", padding: "8px 16px" }}>
                  Từ chối
                </span>
              ) : (
                <>
                  <button
                    className={styles.approveBtn}
                    onClick={() => handleApproveStatus(selectedItem, "Đã duyệt")}
                  >
                    Phê duyệt
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleApproveStatus(selectedItem, "Từ chối")}
                  >
                    Từ chối
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <div className={styles.toast}>✓ {toast}</div>}
    </div>
  );
}

