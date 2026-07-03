import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./KhoHocLieu.module.css";
import { FiSearch, FiEye, FiTrash2, FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

const API = "http://14.225.192.252:5000";

type ActiveTab = "baigiang" | "baitap" | "tailieu";

interface Lecture {
  MaBaiHoc: number;
  TieuDe: string;
  LoaiBaiHoc: string;
  ThoiLuong: string;
  TenLop: string;
  TenBuoiHoc: string;
}

interface Exercise {
  MaBaiTap: number;
  Title: string;
  Type: string;
  IsExam: number;
  CreatedDate: string;
  TenLop: string;
  TenBuoiHoc: string;
}

interface Document {
  MaTaiLieu: number;
  TieuDe: string;
  MoTa: string;
  NgayCapNhat: string;
  TenLop: string;
  TenBuoiHoc: string;
}

const mapDangBaiToVi = (type: string): string => {
  const t = (type || "").toLowerCase();
  if (t === "listening-mcq" || t === "listening") return "Nghe trắc nghiệm";
  if (t === "listening-image") return "Nghe chọn hình ảnh";
  if (t === "listening-dictation") return "Nghe chép chính tả";
  if (t === "listening-fill-in") return "Điền từ đoạn văn";
  if (t === "speaking-pronounce") return "Luyện phát âm";
  if (t === "speaking-topic") return "Nói theo chủ đề";
  if (t === "reading-split") return "Đọc chia đôi màn hình";
  if (t === "reading-vocab-mcq") return "Bài tập từ vựng";
  if (t === "writing-order-words") return "Sắp xếp từ";
  if (t === "writing-tense-mcq") return "Trắc nghiệm ngữ pháp";
  if (t === "writing-essay") return "Tự luận viết";
  if (t === "writing-order-sentences") return "Sắp xếp câu";
  if (t === "exam") return "Bài kiểm tra";
  return type;
};

const KhoHocLieu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isQTV = location.pathname.startsWith("/QTV");
  const [activeTab, setActiveTab] = useState<ActiveTab>("baigiang");
  
  // Data lists
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Loading & states
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [toast, setToast] = useState("");
  
  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; type: ActiveTab; title: string } | null>(null);

  const handleViewDocumentDetail = (doc: any) => {
    const fileUrl = doc.FileUrl
      ? (doc.FileUrl.startsWith("http") ? doc.FileUrl : `http://14.225.192.252:5000${doc.FileUrl}`)
      : doc.NoiDung?.includes("File: /uploads/")
      ? `http://14.225.192.252:5000${doc.NoiDung.split("File: ")[1]?.trim()}`
      : null;

    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${doc.TieuDe || "Tài liệu"}</title>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  padding: 40px;
                  max-width: 800px;
                  margin: 0 auto;
                  line-height: 1.6;
                  color: #333;
                }
                h1 { color: #000080; border-bottom: 2px solid #eee; padding-bottom: 12px; }
                p { font-size: 16px; white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>${doc.TieuDe || "Tài liệu"}</h1>
              <p>${doc.NoiDung || ""}</p>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  // Fetch all lists
  const fetchData = async () => {
    setLoading(true);
    try {
      const [lectRes, exRes, docRes] = await Promise.all([
        fetch(`${API}/baigiang/list/all`).then(r => r.json()),
        fetch(`${API}/exercises/list/all`).then(r => r.json()),
        fetch(`${API}/tailieu/list/all`).then(r => r.json())
      ]);
      
      setLectures(Array.isArray(lectRes) ? lectRes : []);
      setExercises(Array.isArray(exRes) ? exRes : []);
      setDocuments(Array.isArray(docRes) ? docRes : []);
    } catch (e) {
      console.error("Error loading library assets", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show Toast helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Get distinct classes list for filtering
  const classesList = useMemo(() => {
    const classNamesSet = new Set<string>();
    lectures.forEach(l => { if (l.TenLop) classNamesSet.add(l.TenLop); });
    exercises.forEach(e => { if (e.TenLop) classNamesSet.add(e.TenLop); });
    documents.forEach(d => { if (d.TenLop) classNamesSet.add(d.TenLop); });
    return Array.from(classNamesSet).sort();
  }, [lectures, exercises, documents]);

  // Tab Filtering & Search
  const filteredLectures = useMemo(() => {
    return lectures.filter(item => {
      const matchSearch = item.TieuDe?.toLowerCase().includes(search.toLowerCase());
      const matchClass = !selectedClass || item.TenLop === selectedClass;
      return matchSearch && matchClass;
    });
  }, [lectures, search, selectedClass]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(item => {
      const matchSearch = item.Title?.toLowerCase().includes(search.toLowerCase());
      const matchClass = !selectedClass || item.TenLop === selectedClass;
      return matchSearch && matchClass;
    });
  }, [exercises, search, selectedClass]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(item => {
      const matchSearch = item.TieuDe?.toLowerCase().includes(search.toLowerCase());
      const matchClass = !selectedClass || item.TenLop === selectedClass;
      return matchSearch && matchClass;
    });
  }, [documents, search, selectedClass]);

  // Action: Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    
    let url = "";
    if (type === "baigiang") url = `${API}/baigiang/${id}`;
    else if (type === "baitap") url = `${API}/baitap/${id}`;
    else if (type === "tailieu") url = `${API}/tailieu/${id}`;

    try {
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        showToast("Đã xóa thành công!");
        // Update local state lists directly
        if (type === "baigiang") {
          setLectures(prev => prev.filter(item => item.MaBaiHoc !== id));
        } else if (type === "baitap") {
          setExercises(prev => prev.filter(item => item.MaBaiTap !== id));
        } else if (type === "tailieu") {
          setDocuments(prev => prev.filter(item => item.MaTaiLieu !== id));
        }
      } else {
        alert("Xóa thất bại. Vui lòng kiểm tra lại!");
      }
    } catch (e) {
      alert("Đã xảy ra lỗi kết nối đến máy chủ.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button onClick={() => navigate("/QTV/khoahoc")} className={styles.backBtn}>
          <FiArrowLeft /> Quay lại Khóa học
        </button>
        <h1> Kho học liệu tổng hợp</h1>
        
      </div>

      {/* Tabs list */}
      <div className={styles.tabsRow}>
        <button
          className={`${styles.tabBtn} ${activeTab === "baigiang" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("baigiang")}
        >
           Bài giảng 
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "baitap" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("baitap")}
        >
           Bài tập & Kiểm tra 
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "tailieu" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("tailieu")}
        >
           Tài liệu 
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className={styles.toolbarRow}>
        <div className={styles.searchWrap}>
          <FiSearch className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Tìm kiếm tiêu đề học liệu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
        >
          <option value="">-- Lọc theo Lớp học --</option>
          {classesList.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Content Lists */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Đang tải dữ liệu học liệu...</div>
        ) : (
          <>
            {/* Tab: BAIGIANG */}
            {activeTab === "baigiang" && (
              filteredLectures.length === 0 ? (
                <div className={styles.emptyState}>Không tìm thấy bài giảng nào.</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tiêu đề bài giảng</th>
                      <th>Loại</th>
                      <th>Thời lượng</th>
                      <th>Lớp học</th>
                      <th>Buổi học</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLectures.map(l => (
                      <tr key={l.MaBaiHoc}>
                        <td className={styles.cellTitle}>{l.TieuDe}</td>
                        <td>
                          <span className={`${styles.badge} ${styles.badgeOrange}`}>
                            {l.LoaiBaiHoc || "Video"}
                          </span>
                        </td>
                        <td>{l.ThoiLuong || "—"}</td>
                        <td>{l.TenLop || "Roadmap"}</td>
                        <td>{l.TenBuoiHoc || "—"}</td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnView}`}
                              title="Xem chi tiết"
                              onClick={() => navigate(isQTV ? `/QTV/bai-giang/${l.MaBaiHoc}` : `/bai-giang/${l.MaBaiHoc}`)}
                            >
                              <FiEye />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                              title="Xóa"
                              onClick={() => setDeleteTarget({ id: l.MaBaiHoc, type: "baigiang", title: l.TieuDe })}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Tab: BAITAP */}
            {activeTab === "baitap" && (
              filteredExercises.length === 0 ? (
                <div className={styles.emptyState}>Không tìm thấy bài tập nào.</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tiêu đề bài tập</th>
                      <th>Loại định dạng</th>
                      <th>Lớp học</th>
                      <th>Buổi học</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExercises.map(ex => (
                      <tr key={ex.MaBaiTap}>
                        <td className={styles.cellTitle}>{ex.Title}</td>
                        <td>
                          <span className={`${styles.badge} ${ex.IsExam === 1 || ex.Type === "exam" ? styles.badgeOrange : styles.badgeBlue}`}>
                            {ex.IsExam === 1 || ex.Type === "exam" ? "Bài kiểm tra" : mapDangBaiToVi(ex.Type)}
                          </span>
                        </td>
                        <td>{ex.TenLop || "Roadmap"}</td>
                        <td>{ex.TenBuoiHoc || "—"}</td>
                        <td>{ex.CreatedDate ? new Date(ex.CreatedDate).toLocaleDateString("vi-VN") : "—"}</td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnView}`}
                              title="Xem chi tiết"
                              onClick={() => navigate(isQTV ? `/QTV/baitap-detail/${ex.MaBaiTap}/0` : `/baitap-detail/${ex.MaBaiTap}/0`)}
                            >
                              <FiEye />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                              title="Xóa"
                              onClick={() => setDeleteTarget({ id: ex.MaBaiTap, type: "baitap", title: ex.Title })}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Tab: TAILIEU */}
            {activeTab === "tailieu" && (
              filteredDocuments.length === 0 ? (
                <div className={styles.emptyState}>Không tìm thấy tài liệu nào.</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tiêu đề tài liệu</th>
                      <th>Mô tả ngắn</th>
                      <th>Lớp học</th>
                      <th>Buổi học</th>
                      <th>Cập nhật</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map(doc => (
                      <tr key={doc.MaTaiLieu}>
                        <td className={styles.cellTitle}>{doc.TieuDe}</td>
                        <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doc.MoTa || "(Không có mô tả)"}
                        </td>
                        <td>{doc.TenLop || "Roadmap"}</td>
                        <td>{doc.TenBuoiHoc || "—"}</td>
                        <td>{doc.NgayCapNhat ? new Date(doc.NgayCapNhat).toLocaleDateString("vi-VN") : "—"}</td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnView}`}
                              title="Xem chi tiết"
                              onClick={() => handleViewDocumentDetail(doc)}
                            >
                              <FiEye />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                              title="Xóa"
                              onClick={() => setDeleteTarget({ id: doc.MaTaiLieu, type: "tailieu", title: doc.TieuDe })}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </>
        )}
      </div>

      {/* CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmBox}>
            <FiAlertTriangle className={styles.warnIcon} />
            <h3>Xác nhận xóa vĩnh viễn</h3>
            <p>
              Bạn có chắc chắn muốn xóa học liệu <strong>"{deleteTarget.title}"</strong> không? Hành động này sẽ gỡ bỏ học liệu khỏi tất cả các lớp của giáo viên và sinh viên.
            </p>
            <div className={styles.modalButtons}>
              <button className={styles.btnCancel} onClick={() => setDeleteTarget(null)}>Hủy bỏ</button>
              <button className={styles.btnConfirm} onClick={handleDeleteConfirm}>Đồng ý xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST POPUP */}
      {toast && (
        <div className={styles.toast}>
          {toast}
        </div>
      )}
    </div>
  );
};

export default KhoHocLieu;
