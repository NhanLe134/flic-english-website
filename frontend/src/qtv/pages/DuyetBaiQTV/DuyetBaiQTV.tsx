import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./DuyetBaiQTV.module.css";
import { FiSearch } from "react-icons/fi";
import ChiTietBaiTap from "../../../sinhvien/pages/AssignmentDetail/KhungHienThi/ChiTietBaiTap";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return API + "/" + url.replace(/^\//, "");
};

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return "";
  let videoId = "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

const getGoogleDriveEmbedUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("drive.google.com")) {
    return url.replace(/\/view(\?.*)?$/, "/preview");
  }
  return url;
};

const unescapeMarkdown = (str: string) => {
  if (!str) return "";
  let s = str
    .replace(/^#\s+(#{1,6}\s)/gm, "$1")
    .replace(/^#\s+(?!#)/gm, "")
    .replace(/^\\(#{1,6})/gm, "$1")
    .replace(/^\\-/gm, "-")
    .replace(/\\\|/g, "|")
    .replace(/\\>/g, ">")
    .replace(/\\\*/g, "*")
    .replace(/\\_/g, "_")
    .replace(/\\\./g, ".")
    .replace(/\\!/g, "!")
    .replace(/\n{3,}/g, "\n\n");

  const lines = s.split("\n");
  const out: string[] = [];

  const isListOrTable = (l: string) =>
    /^\s*[-*+] /.test(l) ||
    /^\s*\d+\./.test(l) ||
    /^\|/.test(l.trim());

  for (let i = 0; i < lines.length; i++) {
    const prev = out[out.length - 1] ?? "";
    const cur = lines[i];
    const next = lines[i + 1] ?? "";

    if (cur.trim() === "" && isListOrTable(prev) && isListOrTable(next)) {
      continue;
    }
    if (cur.trim() === "" && !isListOrTable(prev) && prev.trim() !== "" && isListOrTable(next)) {
      continue;
    }

    out.push(cur);
  }

  return out.join("\n");
};

const markdownComponents = {
  ul: ({ children }: any) => (
    <ul style={{ paddingLeft: 24, margin: "4px 0" }}>{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol style={{ paddingLeft: 24, margin: "4px 0" }}>{children}</ol>
  ),
  li: ({ children }: any) => {
    const unwrapped = React.Children.map(children, (child: any) => {
      if (child?.type === "p") return child.props.children;
      return child;
    });
    return (
      <li style={{ margin: "2px 0", padding: 0, lineHeight: 1.6 }}>
        {unwrapped}
      </li>
    );
  },
  p: ({ children }: any) => (
    <p style={{ margin: "6px 0", padding: 0 }}>{children}</p>
  ),
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
  const [showPreview, setShowPreview] = useState(false);
  
  const [baiGiangData, setBaiGiangData] = useState<BaiGiangItem[]>([]);
  const [baiTapData, setBaiTapData] = useState<any[]>([]);
  const [dethiData, setDethiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [lessonDetail, setLessonDetail] = useState<any>(null);
  const [minitestData, setMinitestData] = useState<any>(null);
  const [minitestQuestions, setMinitestQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (selectedItem && activeTab === "baigiang" && selectedItem.MaBaiHoc) {
      fetch(`${API}/baigiang/detail/${selectedItem.MaBaiHoc}`)
        .then(r => r.json())
        .then(data => setLessonDetail(data))
        .catch(err => console.log(err));

      fetch(`${API}/minitest/baigiang/${selectedItem.MaBaiHoc}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.MaMinitest) {
            setMinitestData(data);
            try {
              if (data.CauHoi) setMinitestQuestions(JSON.parse(data.CauHoi));
              else setMinitestQuestions([]);
            } catch (e) {
              setMinitestQuestions([]);
            }
          } else {
            setMinitestData(null);
            setMinitestQuestions([]);
          }
        })
        .catch(() => {
          setMinitestData(null);
          setMinitestQuestions([]);
        });
    } else {
      setLessonDetail(null);
      setMinitestData(null);
      setMinitestQuestions([]);
    }
  }, [selectedItem, activeTab]);

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
        statusVal = "Đã duyệt";
      } else {
        statusVal = "Từ chối";
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

  const sortedData = [...filteredData].sort((a, b) => {
    const aStatus = getStatusLabel(a.TrangThaiDuyet || a.TrangThai);
    const bStatus = getStatusLabel(b.TrangThaiDuyet || b.TrangThai);

    if (aStatus === "Chờ duyệt" && bStatus !== "Chờ duyệt") return -1;
    if (aStatus !== "Chờ duyệt" && bStatus === "Chờ duyệt") return 1;

    const aDateStr = a.NgayGui || a.NgayTao || a.NgayCapNhat || a.CreatedDate || "";
    const bDateStr = b.NgayGui || b.NgayTao || b.NgayCapNhat || b.CreatedDate || "";

    const aTime = aDateStr ? new Date(aDateStr).getTime() : 0;
    const bTime = bDateStr ? new Date(bDateStr).getTime() : 0;

    return bTime - aTime;
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

        {/* Search bar & Tab Filters */}
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, người tạo..."
            />
            <button className={styles.searchBtn}>
              <FiSearch />
            </button>
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
        </div>

        {/* Table Card */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div>
              <h3>Danh sách nội dung chờ duyệt</h3>
              <p>Kiểm tra và phê duyệt bài đăng, khóa học do người tạo gửi</p>
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
                  <th>NGƯỜI TẠO</th>
                  <th>LOẠI</th>
                  <th>TRẠNG THÁI DUYỆT</th>
                  <th>NGÀY GỬI</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyCell}>
                      Không tìm thấy nội dung nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  sortedData.map((item: any, idx) => (
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
              {activeTab !== "baigiang" && activeTab !== "baitap" && (
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
                        activeTab === "dethi" ? "Đề thi thử" :
                        "Tài liệu học tập"
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "baitap" ? (
                <div style={{ marginTop: "4px", boxSizing: "border-box", zoom: 0.85 }}>
                  <ChiTietBaiTap
                    overrideExerciseId={(() => {
                      const rawId = selectedItem.MaBaiTap;
                      if (typeof rawId === "number") return rawId;
                      if (typeof rawId === "string") {
                        const match = rawId.match(/^(baitap|exam)-(\d+)$/);
                        return match ? parseInt(match[2], 10) : parseInt(rawId, 10) || undefined;
                      }
                      return undefined;
                    })()}
                    isModal={true}
                    isPreview={true}
                    showAnswers={true}
                  />
                </div>
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
              ) : activeTab === "baigiang" ? (
                <div style={{ marginTop: "8px", boxSizing: "border-box", textAlign: "left" }}>
                  {(() => {
                    const currentLesson = lessonDetail || selectedItem;
                    const noiDung = currentLesson.NoiDung || "";
                    const rawFileUrl = currentLesson.FileUrl || "";
                    const fileUrl = rawFileUrl ? getMediaUrl(rawFileUrl) : "";
                    
                    const isYoutube = fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be");
                    const isGoogleDrive = fileUrl.includes("drive.google.com");
                    const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(fileUrl);
                    const isPdf = /\.pdf$/i.test(fileUrl);
                    const isVideo = /\.(mp4|webm|ogg)$/i.test(fileUrl);
                    const isAudio = /\.(mp3|wav|m4a)$/i.test(fileUrl);

                    return (
                      <div>
                        {/* Content text formatted like LessonDetail */}
                        {noiDung && (
                          <div style={{ marginBottom: "20px", padding: "14px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                            {noiDung.trimStart().startsWith("<") ? (
                              <div
                                className="html-content"
                                dangerouslySetInnerHTML={{ __html: noiDung }}
                              />
                            ) : (
                              <div className="text-content" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "#1e293b" }}>
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={markdownComponents}
                                >
                                  {unescapeMarkdown(noiDung).trim()}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Media Player */}
                        {isImage && (
                          <div style={{ marginBottom: "20px" }}>
                            <img src={fileUrl} alt="lesson" style={{ width: "100%", borderRadius: "8px" }} />
                          </div>
                        )}

                        {isPdf && (
                          <div style={{ marginBottom: "20px" }}>
                            <iframe
                              src={fileUrl}
                              width="100%"
                              height="450px"
                              title="PDF viewer"
                              style={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
                            />
                          </div>
                        )}

                        {isVideo && (
                          <div style={{ marginBottom: "20px" }}>
                            <video controls width="100%" style={{ borderRadius: "8px", maxHeight: "360px", display: "block", margin: "0 auto" }}>
                              <source src={fileUrl} />
                              Trình duyệt không hỗ trợ video.
                            </video>
                          </div>
                        )}

                        {isAudio && (
                          <div style={{ marginBottom: "20px" }}>
                            <audio controls style={{ width: "100%" }}>
                              <source src={fileUrl} />
                              Trình duyệt không hỗ trợ audio.
                            </audio>
                          </div>
                        )}

                        {isYoutube && (
                          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "8px", marginBottom: "20px" }}>
                            <iframe
                              src={getYoutubeEmbedUrl(fileUrl)}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: "8px", border: "none" }}
                            />
                          </div>
                        )}

                        {isGoogleDrive && (
                          <div style={{ marginBottom: "20px" }}>
                            <iframe
                              src={getGoogleDriveEmbedUrl(fileUrl)}
                              width="100%"
                              height="400px"
                              title="Google Drive player"
                              style={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
                              allow="autoplay"
                            />
                          </div>
                        )}

                        {fileUrl && !isImage && !isPdf && !isVideo && !isAudio && !isYoutube && !isGoogleDrive && (
                          <div style={{ marginBottom: "20px" }}>
                            <a href={fileUrl} target="_blank" rel="noreferrer" style={{ color: "#F95800", fontWeight: 600, fontSize: "13px" }}>
                              📁 Tải xuống file đính kèm ({fileUrl.split("/").pop()})
                            </a>
                          </div>
                        )}

                        {/* MiniTest */}
                        {minitestData && minitestQuestions.length > 0 && (
                          <div style={{ marginTop: "20px", padding: "14px 16px", border: "1px solid #fed7aa", background: "#fff7ed", borderRadius: "8px" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#c2410c", margin: "0 0 12px 0" }}>
                              ⚡ MiniTest đính kèm ({minitestQuestions.length} câu hỏi)
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {minitestQuestions.map((q: any, qIdx: number) => (
                                <div key={qIdx} style={{ padding: "10px", background: "#ffffff", borderRadius: "6px", border: "1px solid #ffedd5" }}>
                                  <p style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b", margin: "0 0 6px 0" }}>
                                    Câu {qIdx + 1}: {q.question}
                                  </p>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                    {q.answers?.map((text: string, aIdx: number) => {
                                      const label = ["A", "B", "C", "D"][aIdx];
                                      const isCorrect = label === q.correct;
                                      return (
                                        <div
                                          key={label}
                                          style={{
                                            padding: "6px 8px",
                                            borderRadius: 4,
                                            border: `1px solid ${isCorrect ? "#bbf7d0" : "#e2e8f0"}`,
                                            background: isCorrect ? "#f0fdf4" : "#ffffff",
                                            color: isCorrect ? "#15803d" : "#475569",
                                            fontSize: "12px",
                                            fontWeight: isCorrect ? 600 : 400,
                                            display: "flex",
                                            alignItems: "center"
                                          }}
                                        >
                                          <span style={{ fontWeight: 700, marginRight: "4px" }}>{label}.</span>
                                          <span style={{ flex: 1 }}>{text}</span>
                                          {isCorrect && <span style={{ marginLeft: "4px" }}>✅</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className={styles.formGroupFull}>
                  <label>Mô tả / Nội dung chi tiết</label>
                  <textarea
                    disabled
                    rows={4}
                    value={selectedItem.MoTa || "Chưa có mô tả tài liệu."}
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
              ) : activeTab === "baigiang" || activeTab === "baitap" ? null : (
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

      {/* ════ POPUP XEM TRƯỚC BÀI TẬP ════ */}
      {showPreview && selectedItem && (
        <div className={styles.previewModalBackdrop} onClick={() => setShowPreview(false)}>
          <div className={styles.previewModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.previewModalCloseBtn} onClick={() => setShowPreview(false)} title="Đóng">
              &times;
            </button>
            <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
              <ChiTietBaiTap
                overrideExerciseId={(() => {
                  const match = selectedItem.MaBaiTap?.match(/^(baitap|exam)-(\d+)$/);
                  return match ? parseInt(match[2], 10) : undefined;
                })()}
                isModal={true}
                isPreview={true}
                onClose={() => setShowPreview(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <div className={styles.toast}>✓ {toast}</div>}
    </div>
  );
}

