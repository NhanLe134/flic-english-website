import { useState, useEffect } from "react";
import styles from "./duyetBaiQTV.module.css";
import { FiSearch } from "react-icons/fi";

const API = "http://localhost:5000";

type ContentType = "baigiang" | "baihocmo";
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
  MaLesson: number;
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
    ])
      .then(([bg, bhm]) => {
        setBaiGiangData(Array.isArray(bg) ? bg : []);
        setBaiHocMoData(Array.isArray(bhm) ? bhm : []);
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
      const endpoint =
        activeTab === "baigiang"
          ? `${API}/baigiang/${item.MaBaiHoc}/status`
          : `${API}/baihocmo/${item.MaBaiHocMo}/duyet`;

      // Status values mapped for backend
      let statusVal = "";
      if (status === "Đã duyệt") {
        statusVal = activeTab === "baigiang" ? "published" : "Hoạt động";
      } else {
        statusVal = activeTab === "baigiang" ? "rejected" : "Từ chối";
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
    ...baiHocMoData.map((d) => ({ ...d, type: "baihocmo" })),
  ];

  const totalCount = allItems.length;
  const pendingCount = allItems.filter((i) => getStatusLabel(i.TrangThai) === "Chờ duyệt").length;
  const approvedCount = allItems.filter((i) => getStatusLabel(i.TrangThai) === "Đã duyệt").length;
  const rejectedCount = allItems.filter((i) => getStatusLabel(i.TrangThai) === "Từ chối").length;

  // Filter current tab data
  const currentData = activeTab === "baigiang" ? baiGiangData : baiHocMoData;

  const filteredData = currentData.filter((item: any) => {
    const statusLabel = getStatusLabel(item.TrangThai);
    const matchStatus = filterStatus === "Tất cả" || statusLabel === filterStatus;
    const matchSearch =
      (item.TieuDe || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.TenGiangVien || item.TenNguoiTao || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.TenKhoaHoc || "").toLowerCase().includes(search.toLowerCase());
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
        <p>Kiểm tra và phê duyệt bài giảng, khóa học và các bài đăng kỹ năng do giáo viên gửi lên hệ thống.</p>
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
            className={`${styles.tabBtn} ${activeTab === "baihocmo" ? styles.tabBtnActive : ""}`}
            onClick={() => {
              setActiveTab("baihocmo");
              setFilterStatus("Tất cả");
            }}
          >
            Bài học kỹ năng
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
                        <b>{item.TieuDe}</b>
                        {activeTab === "baigiang" && item.TenKhoaHoc && (
                          <span className={styles.courseSubtitleText}>({item.TenKhoaHoc})</span>
                        )}
                      </td>
                      <td>{item.TenGiangVien || item.TenNguoiTao || "—"}</td>
                      <td>
                        {activeTab === "baigiang"
                          ? `Bài giảng (${item.LoaiBaiHoc || "Lý thuyết"})`
                          : "Bài đăng"}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(item.TrangThai)}`}>
                          {getStatusLabel(item.TrangThai)}
                        </span>
                      </td>
                      <td>{item.CapDo || "—"}</td>
                      <td>
                        {item.NgayGui || item.NgayTao
                          ? new Date(item.NgayGui || item.NgayTao).toLocaleDateString("vi-VN")
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
                <h2>{selectedItem.TieuDe}</h2>
                <p className={styles.modalSubtitle}>Chi tiết khóa học</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Giảng viên</label>
                  <input
                    type="text"
                    disabled
                    value={selectedItem.TenGiangVien || selectedItem.TenNguoiTao || ""}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Loại</label>
                  <input
                    type="text"
                    disabled
                    value={activeTab === "baigiang" ? "Bài giảng" : "Bài đăng"}
                  />
                </div>
              </div>

              <div className={styles.formGroupFull}>
                <label>Mô tả</label>
                <textarea
                  disabled
                  rows={4}
                  value={
                    activeTab === "baigiang"
                      ? selectedItem.NoiDung || "Chưa có nội dung chi tiết."
                      : selectedItem.MoTa || "Chưa có mô tả."
                  }
                />
              </div>

              <div className={styles.formRowThree}>
                <div className={styles.formGroup}>
                  <label>Cấp độ</label>
                  <input type="text" disabled value={selectedItem.CapDo || "TOEIC"} />
                </div>
                <div className={styles.formGroup}>
                  <label>Ngày gửi</label>
                  <input
                    type="text"
                    disabled
                    value={
                      selectedItem.NgayGui || selectedItem.NgayTao
                        ? new Date(selectedItem.NgayGui || selectedItem.NgayTao).toLocaleDateString("vi-VN")
                        : "12/06/2026"
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Mức độ</label>
                  <input
                    type="text"
                    disabled
                    value={
                      activeTab === "baigiang"
                        ? selectedItem.CapDo || "Beginner"
                        : selectedItem.CapDo || "Beginner"
                    }
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
