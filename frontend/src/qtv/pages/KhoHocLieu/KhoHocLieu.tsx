import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./KhoHocLieu.module.css";
import { FiSearch, FiAlertTriangle } from "react-icons/fi";

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
  if (t === "Nghe audio trắc nghiệm" || t === "listening") return "Nghe trắc nghiệm";
  if (t === "Hình ảnh chọn đáp án") return "Nghe chọn hình ảnh";
  if (t === "Nghe chép chính tả") return "Nghe chép chính tả";
  if (t === "Điền từ vào đoạn văn") return "Điền từ đoạn văn";
  if (t === "Luyện phát âm (check phát âm tự động)") return "Luyện phát âm";
  if (t === "Nói theo chủ đề (ghi âm nộp GV)") return "Nói theo chủ đề";
  if (t === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") return "Đọc chia đôi màn hình";
  if (t === "Nối từ") return "Bài tập từ vựng";
  if (t === "Sắp xếp từ thành câu") return "Sắp xếp từ";
  if (t === "Trắc nghiệm") return "Trắc nghiệm ngữ pháp";
  if (t === "Viết đoạn văn ngắn") return "Tự luận viết";
  if (t === "Sắp xếp câu thành đoạn văn") return "Sắp xếp câu";
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

  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});

  const toggleClassCollapse = (className: string) => {
    setCollapsedClasses(prev => ({
      ...prev,
      [className]: !prev[className]
    }));
  };

  const extractSessionNumber = (sessionStr: string): number => {
    if (!sessionStr) return 0;
    const match = sessionStr.match(/(?:buổi|buoi|session)\s*(\d+)/i) || sessionStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

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

  const groupedData = useMemo(() => {
    let items: any[] = [];
    if (activeTab === "baigiang") items = filteredLectures;
    else if (activeTab === "baitap") items = filteredExercises;
    else if (activeTab === "tailieu") items = filteredDocuments;

    const groups: Record<string, Record<string, any[]>> = {};

    items.forEach(item => {
      const className = item.TenLop || "Chưa xếp lớp";
      const sessionName = item.TenBuoiHoc || "Chưa xếp buổi";

      if (!groups[className]) {
        groups[className] = {};
      }
      if (!groups[className][sessionName]) {
        groups[className][sessionName] = [];
      }
      groups[className][sessionName].push(item);
    });

    const sortedGroups: {
      className: string;
      totalCount: number;
      sessions: {
        sessionName: string;
        items: any[];
      }[];
    }[] = [];

    const classNames = Object.keys(groups).sort();
    for (const className of classNames) {
      const sessionMap = groups[className];
      const sessionNames = Object.keys(sessionMap).sort((a, b) => {
        const numA = extractSessionNumber(a);
        const numB = extractSessionNumber(b);
        if (numA !== numB) {
          return numB - numA;
        }
        return b.localeCompare(a);
      });

      let totalCount = 0;
      const sessions = sessionNames.map(sessionName => {
        const sessionItems = sessionMap[sessionName];
        totalCount += sessionItems.length;
        return {
          sessionName,
          items: sessionItems
        };
      });

      sortedGroups.push({
        className,
        totalCount,
        sessions
      });
    }

    return sortedGroups;
  }, [activeTab, filteredLectures, filteredExercises, filteredDocuments]);

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
          ← Quay lại Khóa học
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
      <div style={{ background: "transparent", border: "none", boxShadow: "none", overflowX: "visible" }} className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            Đang tải dữ liệu học liệu...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            {groupedData.length === 0 ? (
              <div className={styles.emptyState} style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                Không tìm thấy học liệu nào.
              </div>
            ) : (
              groupedData.map(group => {
                const isCollapsed = !!collapsedClasses[group.className];
                return (
                  <div key={group.className} className={styles.classCard}>
                    <div className={styles.classHeader} onClick={() => toggleClassCollapse(group.className)}>
                      <div className={styles.classHeaderLeft}>
                        <h3 className={styles.classTitle}>{group.className}</h3>
                      </div>
                      <div className={styles.classHeaderRight}>
                        <span className={`${styles.badge} ${styles.badgeBlue}`}>
                          {group.totalCount} {activeTab === "baigiang" ? "bài giảng" : activeTab === "baitap" ? "bài tập & kiểm tra" : "tài liệu"}
                        </span>
                        {isCollapsed ? (
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>[Mở rộng]</span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>[Thu gọn]</span>
                        )}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className={styles.classContent}>
                        {group.sessions.map(session => (
                          <div key={session.sessionName} className={styles.sessionBlock}>
                            <h4 className={styles.sessionTitle}>
                              {session.sessionName}
                            </h4>
                            <div className={styles.sessionItemList}>
                              {session.items.map(item => {
                                // Specific render attributes based on activeTab
                                let title = "";
                                let typeLabel = "";
                                let subtitle = "";
                                let viewClick = () => {};
                                let deleteClick = () => {};

                                if (activeTab === "baigiang") {
                                  title = item.TieuDe;
                                  typeLabel = item.LoaiBaiHoc || "Video";
                                  subtitle = `Thời lượng: ${item.ThoiLuong || "—"}`;
                                  viewClick = () => navigate(isQTV ? `/QTV/bai-giang/${item.MaBaiHoc}` : `/bai-giang/${item.MaBaiHoc}`);
                                  deleteClick = () => setDeleteTarget({ id: item.MaBaiHoc, type: "baigiang", title: item.TieuDe });
                                } else if (activeTab === "baitap") {
                                  title = item.Title;
                                  const isEx = item.IsExam === 1 || item.Type === "exam";
                                  typeLabel = isEx ? "Bài kiểm tra" : mapDangBaiToVi(item.Type);
                                  subtitle = item.CreatedDate
                                    ? `Ngày tạo: ${new Date(item.CreatedDate).toLocaleDateString("vi-VN")}`
                                    : "Không có ngày tạo";
                                  viewClick = () => navigate(isQTV ? `/QTV/baitap-detail/${item.MaBaiTap}/0` : `/baitap-detail/${item.MaBaiTap}/0`);
                                  deleteClick = () => setDeleteTarget({ id: item.MaBaiTap, type: "baitap", title: item.Title });
                                } else if (activeTab === "tailieu") {
                                  title = item.TieuDe;
                                  typeLabel = "Tài liệu";
                                  subtitle = item.MoTa || "(Không có mô tả)";
                                  viewClick = () => handleViewDocumentDetail(item);
                                  deleteClick = () => setDeleteTarget({ id: item.MaTaiLieu, type: "tailieu", title: item.TieuDe });
                                }

                                return (
                                  <div key={activeTab === "baigiang" ? item.MaBaiHoc : activeTab === "baitap" ? item.MaBaiTap : item.MaTaiLieu} className={styles.itemRow}>
                                    <div className={styles.itemMain}>
                                      <div className={styles.itemDetails}>
                                        <p className={styles.itemTitle}>{title}</p>
                                        <p className={styles.itemSubtitle}>
                                          <span className={`${styles.badge} ${
                                            activeTab === "baigiang"
                                              ? styles.badgeOrange
                                              : activeTab === "baitap"
                                              ? (item.IsExam === 1 || item.Type === "exam" ? styles.badgeOrange : styles.badgeBlue)
                                              : styles.badgeGreen
                                          }`}>
                                            {typeLabel}
                                          </span>
                                          <span>{subtitle}</span>
                                        </p>
                                      </div>
                                    </div>
                                    <div className={styles.itemActions}>
                                      <button
                                        className={styles.actionBtnViewText}
                                        title="Xem chi tiết"
                                        onClick={viewClick}
                                      >
                                        Xem
                                      </button>
                                      <button
                                        className={styles.actionBtnDeleteText}
                                        title="Xóa"
                                        onClick={deleteClick}
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
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
