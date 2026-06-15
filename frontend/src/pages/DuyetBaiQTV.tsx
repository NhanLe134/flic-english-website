import { useState, useEffect } from "react";
import styles from "./duyetBaiQTV.module.css";
import { FiSearch } from "react-icons/fi";

const API = "http://localhost:5000";

type ContentType = "baigiang" | "baihocmo" | "baitap";
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

interface BaiHocMoItem {
  id: number;
  MaBaiHocMo: number;
  TieuDe: string;
  MoTa: string;
  KyNang: string;
  CapDo: string;
  LoaiBaiHoc: string;
  NoiDung: string;
  FileUrl: string;
  LinkUrl: string;
  TrangThai: string;
  TenNguoiTao: string;
  NgayTao: string;
}

export default function DuyetBaiQTV() {
  const [activeTab, setActiveTab] = useState<ContentType>("baigiang");
  const [filterStatus, setFilterStatus] = useState<string>("Tất cả");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [baiGiangData, setBaiGiangData] = useState<BaiGiangItem[]>([]);
  const [baiHocMoData, setBaiHocMoData] = useState<BaiHocMoItem[]>([]);
  const [baiTapData, setBaiTapData] = useState<any[]>([]);
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
      fetch(`${API}/baihocmo`).then((r) => r.json()),
      fetch(`${API}/qtv/baitap`).then((r) => r.json()),
    ])
      .then(([bg, bhm, bt]) => {
        setBaiGiangData(Array.isArray(bg) ? bg : []);
        setBaiHocMoData(Array.isArray(bhm) ? bhm : []);
        setBaiTapData(Array.isArray(bt) ? bt : []);
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
      } else if (activeTab === "baihocmo") {
        endpoint = `${API}/baihocmo/${item.MaBaiHocMo}/duyet`;
      } else if (activeTab === "baitap") {
        endpoint = `${API}/baitap/${item.MaBaiTap}/status`;
      } else if (activeTab === "tailieu") {
        endpoint = `${API}/tailieu/${item.MaTaiLieu}/status`;
      }

      // Status values mapped for backend
      let statusVal = "";
      if (status === "Đã duyệt") {
        statusVal = (activeTab === "baigiang" || activeTab === "baitap") ? "published" : "Hoạt động";
      } else {
        statusVal = (activeTab === "baigiang" || activeTab === "baitap") ? "rejected" : "Từ chối";
      }

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TrangThai: statusVal }),
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
  ];

  const totalCount = allItems.length;
  const pendingCount = allItems.filter((i) => getStatusLabel(i.TrangThai) === "Chờ duyệt").length;
  const approvedCount = allItems.filter((i) => getStatusLabel(i.TrangThai) === "Đã duyệt").length;
  const rejectedCount = allItems.filter((i) => getStatusLabel(i.TrangThai) === "Từ chối").length;

  // Filter current tab data
  const currentData =
    activeTab === "baigiang" ? baiGiangData :
    activeTab === "baihocmo" ? baiHocMoData :
    baiTapData;

  const filteredData = currentData.filter((item: any) => {
    const statusLabel = getStatusLabel(item.TrangThai);
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
      const label = getStatusLabel(i.TrangThai);
      if (status === "Tất cả") return true;
      return label === status;
    }).length;
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Duyệt bài</h1>
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
                         activeTab === "baihocmo" ? "Bài học kỹ năng" :
                         activeTab === "baitap" ? `Bài tập (${item.Type})` :
                         "Tài liệu"}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(item.TrangThai)}`}>
                          {getStatusLabel(item.TrangThai)}
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
                      activeTab === "baihocmo" ? "Bài học kỹ năng" :
                      activeTab === "baitap" ? "Bài tập / Bài kiểm tra" :
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
              ) : (
                <div className={styles.formGroupFull}>
                  <label>Mô tả / Nội dung chi tiết</label>
                  <textarea
                    disabled
                    rows={4}
                    value={
                      activeTab === "baigiang" ? selectedItem.NoiDung || "Chưa có nội dung chi tiết." :
                      activeTab === "baihocmo" ? selectedItem.MoTa || "Chưa có mô tả." :
                      selectedItem.MoTa || "Chưa có mô tả tài liệu."
                    }
                  />
                </div>
              )}

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
            </div>

            <div className={styles.modalFooter}>
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
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <div className={styles.toast}>✓ {toast}</div>}
    </div>
  );
}
