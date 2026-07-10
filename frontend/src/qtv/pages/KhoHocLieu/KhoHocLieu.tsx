import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./KhoHocLieu.module.css";
import { 
  FiSearch, 
  FiX, 
  FiPlus, 
  FiTrash2, 
  FiVideo, 
  FiFileText, 
  FiFolder, 
  FiChevronDown, 
  FiChevronRight 
} from "react-icons/fi";

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? `http://${window.location.hostname}:5000`
    : "http://14.225.192.252:5000";

interface Lecture {
  MaBaiHoc: number;
  TieuDe: string;
  LoaiBaiHoc: string;
  ThoiLuong: string;
  TenLop: string;
  TenBuoiHoc: string;
  MaBuoiHoc: number;
  MaLopHoc: number;
}

interface Exercise {
  MaBaiTap: number;
  Title: string;
  Type: string;
  IsExam: number;
  CreatedDate: string;
  TenLop: string;
  TenBuoiHoc: string;
  MaBuoiHoc: number;
  MaLopHoc: number;
}

interface Document {
  MaTaiLieu: number;
  TieuDe: string;
  MoTa: string;
  NgayCapNhat: string;
  TenLop: string;
  TenBuoiHoc: string;
  MaBuoiHoc: number;
  MaLopHoc: number;
  FileUrl?: string;
  NoiDung?: string;
}


const KhoHocLieu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isQTV = location.pathname.startsWith("/QTV");
  
  // Data lists
  const [allClasses, setAllClasses] = useState<{ MaLopHoc: number; TenLop: string }[]>([]);
  const [classSessions, setClassSessions] = useState<Record<number, { MaBuoiHoc: number; TenBuoiHoc: string; MoTa: string; ThuTu: number }[]>>({});
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Loading & states
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [toast, setToast] = useState("");
  
  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; type: "baigiang" | "baitap" | "tailieu"; title: string } | null>(null);

  // Session creation modal states
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [targetClassId, setTargetClassId] = useState<number | null>(null);
  const [sessionForm, setSessionForm] = useState({ title: "", desc: "", order: 1 });

  // Lecture creation / clone modal states
  const [showAddLectureModal, setShowAddLectureModal] = useState(false);
  const [bgTab, setBgTab] = useState<"create" | "reuse">("create");
  const [bgForm, setBgForm] = useState({ title: "", content: "", fileUrl: "", type: "Video", duration: "0 phút", order: 1 });
  const [allExistingBg, setAllExistingBg] = useState<any[]>([]);

  // Document creation / clone modal states
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docTab, setDocTab] = useState<"create" | "reuse">("create");
  const [docForm, setDocForm] = useState({ title: "", desc: "", content: "", fileUrl: "" });
  const [allExistingDoc, setAllExistingDoc] = useState<any[]>([]);

  // Active session for new assets
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});

  const toggleClassCollapse = (className: string) => {
    setCollapsedClasses(prev => ({
      ...prev,
      [className]: !prev[className]
    }));
  };



  const handleViewDocumentDetail = (doc: any) => {
    const fileUrl = doc.FileUrl
      ? (doc.FileUrl.startsWith("http") ? doc.FileUrl : `${API}${doc.FileUrl}`)
      : doc.NoiDung?.includes("File: /uploads/")
      ? `${API}${doc.NoiDung.split("File: ")[1]?.trim()}`
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
      // 1. Fetch all classes
      const classesData = await fetch(`${API}/student/all-classes`).then(r => r.json());
      const classesListResult = Array.isArray(classesData) ? classesData : [];
      setAllClasses(classesListResult);

      // 2. Fetch sessions for each class in parallel
      const sessionsMap: Record<number, any[]> = {};
      await Promise.all(
        classesListResult.map(async (cls: any) => {
          try {
            const sData = await fetch(`${API}/classes/${cls.MaLopHoc}/buoihoc`).then(r => r.json());
            sessionsMap[cls.MaLopHoc] = Array.isArray(sData) ? sData : [];
          } catch (err) {
            console.error("Error fetching sessions for class", cls.MaLopHoc, err);
            sessionsMap[cls.MaLopHoc] = [];
          }
        })
      );
      setClassSessions(sessionsMap);

      // 3. Fetch all assets
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
    return allClasses.map(c => c.TenLop).filter(Boolean).sort();
  }, [allClasses]);

  // Group all assets under each class and session
  const groupedData = useMemo(() => {
    const result: any[] = [];
    
    allClasses.forEach(cls => {
      // Filter by selectedClass dropdown
      if (selectedClass && cls.TenLop !== selectedClass) return;

      const sessionsData = classSessions[cls.MaLopHoc] || [];
      const sortedSessions = [...sessionsData].sort((a, b) => a.ThuTu - b.ThuTu);

      const matchedSessions: any[] = [];
      let totalAssetsCount = 0;

      sortedSessions.forEach(sess => {
        // Find assets for this session
        const sessLectures = lectures.filter(l => Number(l.MaBuoiHoc) === Number(sess.MaBuoiHoc) && (!search || l.TieuDe?.toLowerCase().includes(search.toLowerCase())));
        const sessExercises = exercises.filter(e => Number(e.MaBuoiHoc) === Number(sess.MaBuoiHoc) && (!search || e.Title?.toLowerCase().includes(search.toLowerCase())));
        const sessDocuments = documents.filter(d => Number(d.MaBuoiHoc) === Number(sess.MaBuoiHoc) && (!search || d.TieuDe?.toLowerCase().includes(search.toLowerCase())));

        const totalCount = sessLectures.length + sessExercises.length + sessDocuments.length;
        totalAssetsCount += totalCount;

        // If we are searching, only include sessions that have matching assets
        if (search && totalCount === 0) return;

        matchedSessions.push({
          sessionName: sess.TenBuoiHoc,
          sessionId: sess.MaBuoiHoc,
          desc: sess.MoTa || "",
          order: sess.ThuTu,
          lectures: sessLectures,
          exercises: sessExercises,
          documents: sessDocuments,
          totalCount
        });
      });

      // If we are searching, only include classes that have matching sessions
      if (search && matchedSessions.length === 0) return;

      result.push({
        className: cls.TenLop,
        classId: cls.MaLopHoc,
        totalCount: totalAssetsCount,
        sessions: matchedSessions
      });
    });

    return result;
  }, [allClasses, classSessions, lectures, exercises, documents, search, selectedClass]);

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

  // Session creation handler
  const handleSaveSession = async () => {
    if (!sessionForm.title.trim()) { alert("Vui lòng nhập tên buổi học!"); return; }
    if (!targetClassId) return;

    try {
      const res = await fetch(`${API}/qtv/buoihoc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TenBuoiHoc: sessionForm.title,
          MaLopHoc: targetClassId,
          MoTa: sessionForm.desc,
          NgayBatDau: null,
          NgayKetThuc: null,
          ThuTu: Number(sessionForm.order)
        })
      });
      if (res.ok) {
        showToast("Đã thêm buổi học thành công!");
        setShowAddSessionModal(false);
        setSessionForm({ title: "", desc: "", order: 1 });
        fetchData();
      } else {
        alert("Lỗi khi thêm buổi học");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối");
    }
  };

  // Session deletion handler
  const handleDeleteSession = async (sessionId: number, sessionName: string) => {
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa "${sessionName}" không? Hành động này sẽ xóa buổi học và gỡ bỏ toàn bộ học liệu liên quan.`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API}/qtv/buoihoc/${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Đã xóa buổi học thành công!");
        fetchData();
      } else {
        const errText = await res.text();
        alert("Xóa buổi học thất bại: " + errText);
      }
    } catch (err: any) {
      console.error(err);
      alert("Lỗi kết nối khi xóa buổi học: " + err.message);
    }
  };

  // Lecture modal actions
  const openAddLecture = (sessionId: number, currentLecturesCount: number) => {
    setActiveSessionId(sessionId);
    setBgForm({ title: "", content: "", fileUrl: "", type: "Video", duration: "0 phút", order: currentLecturesCount + 1 });
    setBgTab("create");
    setShowAddLectureModal(true);
    fetch(`${API}/baigiang/list/all`)
      .then(r => r.json())
      .then(data => setAllExistingBg(Array.isArray(data) ? data : []))
      .catch(() => setAllExistingBg([]));
  };

  const saveNewLecture = async () => {
    if (!bgForm.title.trim()) { alert("Vui lòng nhập tiêu đề!"); return; }
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
      const res = await fetch(`${API}/baigiang`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TieuDe: bgForm.title,
          NoiDung: bgForm.content,
          FileUrl: bgForm.fileUrl,
          LoaiBaiHoc: bgForm.type,
          ThoiLuong: bgForm.duration,
          TrangThai: "published",
          TrangThaiDuyet: "Đã duyệt",
          ThuTu: bgForm.order,
          MaKhoaHoc: null,
          MaGiangVien: user.MaNguoiDung || 1,
          MaBuoiHoc: activeSessionId
        })
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Lỗi từ phía máy chủ");
      }

      showToast("Đã thêm bài giảng mới!");
      setShowAddLectureModal(false);
      fetchData();
    } catch (err: any) {
      alert("Lỗi khi lưu bài giảng: " + (err.message || err));
    }
  };

  const cloneLecture = async (originalBgId: number) => {
    try {
      const res = await fetch(`${API}/baigiang/${originalBgId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaBuoiHoc: activeSessionId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Đã sao chép bài giảng!");
        setShowAddLectureModal(false);
        fetchData();
      } else {
        alert(data.message || "Lỗi khi sao chép");
      }
    } catch {
      alert("Lỗi kết nối");
    }
  };

  // Document modal actions
  const openAddDoc = (sessionId: number) => {
    setActiveSessionId(sessionId);
    setDocForm({ title: "", desc: "", content: "", fileUrl: "" });
    setDocTab("create");
    setShowAddDocModal(true);
    fetch(`${API}/tailieu/list/all`)
      .then(r => r.json())
      .then(data => setAllExistingDoc(Array.isArray(data) ? data : []))
      .catch(() => setAllExistingDoc([]));
  };

  const saveNewDoc = async () => {
    if (!docForm.title.trim()) { alert("Vui lòng nhập tiêu đề!"); return; }
    try {
      const res = await fetch(`${API}/tailieu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TieuDe: docForm.title,
          MoTa: docForm.desc,
          NoiDung: docForm.content,
          FileUrl: docForm.fileUrl,
          MaBuoiHoc: activeSessionId,
          TrangThai: "Đã duyệt"
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Lỗi từ phía máy chủ");
      }

      showToast("Đã thêm tài liệu mới!");
      setShowAddDocModal(false);
      fetchData();
    } catch (err: any) {
      alert("Lỗi khi lưu tài liệu: " + (err.message || err));
    }
  };

  const cloneDoc = async (originalDocId: number) => {
    try {
      const res = await fetch(`${API}/tailieu/${originalDocId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaBuoiHoc: activeSessionId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Đã sao chép tài liệu!");
        setShowAddDocModal(false);
        fetchData();
      } else {
        alert(data.message || "Lỗi khi sao chép");
      }
    } catch {
      alert("Lỗi kết nối");
    }
  };

  // Exercise modal navigation
  const openAddExercise = (sessionId: number, classId: number) => {
    navigate(`/QTV/create-exercise/${sessionId}`, {
      state: {
        fromClassId: classId,
        fromPage: "kho-hoc-lieu"
      }
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button onClick={() => navigate("/QTV/khoahoc")} className={styles.backBtn}>
          ← Quay lại Khóa học
        </button>
        <h1>Kho học liệu tổng hợp</h1>
        <p>Quản lý toàn bộ lộ trình học tập, bài giảng, bài tập và tài liệu trực thuộc các lớp học</p>
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
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            Đang tải dữ liệu học liệu...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
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
                        {isCollapsed ? <FiChevronRight className={styles.toggleIcon} /> : <FiChevronDown className={styles.toggleIcon} />}
                        <h3 className={styles.classTitle}>{group.className}</h3>
                      </div>
                      <div className={styles.classHeaderRight} onClick={e => e.stopPropagation()}>
                        
                        <button 
                          className={styles.addClassBtn}
                          onClick={() => {
                            setTargetClassId(group.classId);
                            setSessionForm({ title: "", desc: "", order: (classSessions[group.classId]?.length || 0) + 1 });
                            setShowAddSessionModal(true);
                          }}
                        >
                          <FiPlus /> Thêm buổi học
                        </button>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className={styles.classContent}>
                        {group.sessions.length === 0 ? (
                          <div className={styles.emptyText}>Chưa có buổi học nào trong lộ trình lớp học này.</div>
                        ) : (
                          group.sessions.map((session: any) => (
                            <div key={session.sessionId} className={styles.sessionBlock}>
                              <div className={styles.sessionHeaderRow}>
                                <div className={styles.sessionHeaderLeft}>
                                  <h4 className={styles.sessionTitle}>{session.sessionName}</h4>
                                  {session.desc && <p className={styles.sessionDesc}>{session.desc}</p>}
                                </div>
                                <button className={styles.sessionDeleteBtn} onClick={() => handleDeleteSession(session.sessionId, session.sessionName)} title="Xóa buổi học">
                                  <FiTrash2 />
                                </button>
                              </div>

                              {/* 3-Column Resource Layout */}
                              <div className={styles.sessionColumns}>
                                {/* Column 1: Lectures */}
                                <div className={styles.sessionColumn}>
                                  <div className={`${styles.columnHeader} ${styles.lecture}`}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiVideo /> Bài giảng ({session.lectures.length})</span>
                                    <button className={styles.columnAddBtn} onClick={() => openAddLecture(session.sessionId, session.lectures.length)} title="Thêm bài giảng"><FiPlus /></button>
                                  </div>
                                  {session.lectures.length === 0 ? (
                                    <div className={styles.emptyText}>Chưa có bài giảng</div>
                                  ) : (
                                    session.lectures.map((item: any) => (
                                      <div key={item.MaBaiHoc} className={styles.itemRow}>
                                        <div className={styles.itemMain}>
                                          <div className={styles.itemDetails}>
                                            <p className={styles.itemTitle}>{item.TieuDe}</p>
                                            <p className={styles.itemSubtitle}>
                                              <span className={`${styles.badge} ${styles.badgeOrange}`}>{item.LoaiBaiHoc}</span>
                                              {item.ThoiLuong && <span style={{ marginLeft: "6px" }}>{item.ThoiLuong}</span>}
                                            </p>
                                          </div>
                                        </div>
                                        <div className={styles.itemActions}>
                                          <button className={styles.actionBtnViewText} onClick={() => navigate(isQTV ? `/QTV/bai-giang/${item.MaBaiHoc}` : `/bai-giang/${item.MaBaiHoc}`)}>Xem</button>
                                          <button className={styles.actionBtnDeleteText} onClick={() => setDeleteTarget({ id: item.MaBaiHoc, type: "baigiang", title: item.TieuDe })}>Xóa</button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>

                                {/* Column 2: Exercises */}
                                <div className={styles.sessionColumn}>
                                  <div className={`${styles.columnHeader} ${styles.exercise}`}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiFileText /> Bài tập & Kiểm tra ({session.exercises.length})</span>
                                    <button className={styles.columnAddBtn} onClick={() => openAddExercise(session.sessionId, group.classId)} title="Thêm bài tập"><FiPlus /></button>
                                  </div>
                                  {session.exercises.length === 0 ? (
                                    <div className={styles.emptyText}>Chưa có bài tập</div>
                                  ) : (
                                    session.exercises.map((item: any) => {
                                      const isEx = item.IsExam === 1 || item.Type === "exam";
                                      const isLT = item.Type === "luyen-tap-them" || item.Type === "practice";
                                      const badgeClass = isEx 
                                        ? styles.badgeRed 
                                        : (isLT ? styles.badgeOrange : styles.badgeBlue);
                                      const badgeText = isEx 
                                        ? "Bài KTra" 
                                        : (isLT ? "LTThem" : "BTap");
                                      return (
                                        <div key={item.MaBaiTap} className={styles.itemRow}>
                                          <div className={styles.itemMain}>
                                            <div className={styles.itemDetails}>
                                              <p className={styles.itemTitle}>{item.Title}</p>
                                              <p className={styles.itemSubtitle}>
                                                <span className={`${styles.badge} ${badgeClass}`}>
                                                  {badgeText}
                                                </span>
                                              </p>
                                            </div>
                                          </div>
                                          <div className={styles.itemActions}>
                                            <button className={styles.actionBtnViewText} onClick={() => navigate(isQTV ? `/QTV/baitap-detail/${item.MaBaiTap}/0` : `/baitap-detail/${item.MaBaiTap}/0`)}>Xem</button>
                                            <button className={styles.actionBtnDeleteText} onClick={() => setDeleteTarget({ id: item.MaBaiTap, type: "baitap", title: item.Title })}>Xóa</button>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                                {/* Column 3: Documents */}
                                <div className={styles.sessionColumn}>
                                  <div className={`${styles.columnHeader} ${styles.document}`}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiFolder /> Tài liệu ({session.documents.length})</span>
                                    <button className={styles.columnAddBtn} onClick={() => openAddDoc(session.sessionId)} title="Thêm tài liệu"><FiPlus /></button>
                                  </div>
                                  {session.documents.length === 0 ? (
                                    <div className={styles.emptyText}>Chưa có tài liệu</div>
                                  ) : (
                                    session.documents.map((item: any) => (
                                      <div key={item.MaTaiLieu} className={styles.itemRow}>
                                        <div className={styles.itemMain}>
                                          <div className={styles.itemDetails}>
                                            <p className={styles.itemTitle}>{item.TieuDe}</p>
                                            {item.MoTa && <p className={styles.itemSubtitle}>{item.MoTa}</p>}
                                          </div>
                                        </div>
                                        <div className={styles.itemActions}>
                                          <button className={styles.actionBtnViewText} onClick={() => handleViewDocumentDetail(item)}>Xem</button>
                                          <button className={styles.actionBtnDeleteText} onClick={() => setDeleteTarget({ id: item.MaTaiLieu, type: "tailieu", title: item.TieuDe })}>Xóa</button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MODAL: THÊM BUỔI HỌC */}
      {showAddSessionModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalTop}>
              <h3>Thêm buổi học vào lộ trình</h3>
              <button className={styles.modalClose} onClick={() => setShowAddSessionModal(false)}><FiX /></button>
            </div>
            <div style={{ marginTop: "16px" }}>
              <div className={styles.formGroup}>
                <label>Tên buổi học <span className={styles.req}>*</span></label>
                <input value={sessionForm.title} onChange={e => setSessionForm(p => ({ ...p, title: e.target.value }))} placeholder="VD: Buổi 1: Ngữ pháp cơ bản" />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea value={sessionForm.desc} onChange={e => setSessionForm(p => ({ ...p, desc: e.target.value }))} placeholder="Nội dung buổi học..." rows={3} />
              </div>
              <div className={styles.formGroup}>
                <label>Thứ tự</label>
                <input type="number" min={1} value={sessionForm.order} onChange={e => setSessionForm(p => ({ ...p, order: Number(e.target.value) }))} />
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.detailBtnOutline} onClick={() => setShowAddSessionModal(false)}>Hủy</button>
                <button className={styles.detailBtnPrimary} onClick={handleSaveSession}>Thêm buổi</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM BÀI GIẢNG */}
      {showAddLectureModal && (
        <div className={styles.overlay}>
          <div className={styles.modal} style={{ maxWidth: '600px' }}>
            <div className={styles.modalTop}>
              <h3>Thêm bài giảng</h3>
              <button className={styles.modalClose} onClick={() => setShowAddLectureModal(false)}><FiX /></button>
            </div>
            
            <div className={styles.tabs} style={{ marginBottom: '16px', marginTop: '12px' }}>
              <button className={`${styles.tab} ${bgTab === 'create' ? styles.tabActive : ''}`} onClick={() => setBgTab('create')}>Tạo mới</button>
              <button className={`${styles.tab} ${bgTab === 'reuse' ? styles.tabActive : ''}`} onClick={() => setBgTab('reuse')}>Chọn từ danh sách</button>
            </div>

            {bgTab === 'create' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className={styles.formGroup}>
                  <label>Tiêu đề bài giảng *</label>
                  <input value={bgForm.title} onChange={e => setBgForm(p => ({...p, title: e.target.value}))} placeholder="VD: Lesson 1: Grammar basics" />
                </div>
                <div className={styles.formGroup}>
                  <label>Mô tả nội dung</label>
                  <textarea value={bgForm.content} onChange={e => setBgForm(p => ({...p, content: e.target.value}))} placeholder="Nhập mô tả hoặc nội dung bài học..." rows={5} />
                </div>
                <div className={styles.formGroup}>
                  <label>Link tài liệu / Video URL (nếu có)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input style={{ flex: 1 }} value={bgForm.fileUrl} onChange={e => setBgForm(p => ({...p, fileUrl: e.target.value}))} placeholder="http://..." />
                    <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#1e293b', padding: '0 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, border: '1px solid #cbd5e1', height: '38px', margin: 0 }}>
                      Tải file
                      <input type="file" style={{ display: 'none' }} onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await fetch(`${API}/upload`, {
                            method: "POST",
                            body: formData
                          });
                          if (!res.ok) throw new Error("Upload failed");
                          const data = await res.json();
                          setBgForm(p => ({ ...p, fileUrl: data.url }));
                          alert("Tải lên file thành công!");
                        } catch (err) {
                          alert("Lỗi tải lên file: " + (err as Error).message);
                        }
                      }} />
                    </label>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.detailBtnOutline} onClick={() => setShowAddLectureModal(false)}>Hủy</button>
                  <button className={styles.detailBtnPrimary} onClick={saveNewLecture}>Tạo mới</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                  {allExistingBg.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Không tìm thấy bài giảng nào.</div>
                  ) : (
                    allExistingBg.map((bg: any) => (
                      <div key={bg.MaBaiHoc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ flex: 1, paddingRight: '8px' }}>
                          <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block' }}>{bg.TieuDe}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {bg.LoaiBaiHoc} · {bg.ThoiLuong} · Nguồn: Lớp {bg.TenLop} ({bg.TenBuoiHoc})
                          </div>
                        </div>
                        <button className={styles.detailBtnPrimary} style={{ fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }} onClick={() => cloneLecture(bg.MaBaiHoc)}>Chọn</button>
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.modalFooter} style={{ marginTop: '16px' }}>
                  <button className={styles.detailBtnOutline} onClick={() => setShowAddLectureModal(false)}>Đóng</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: THÊM TÀI LIỆU */}
      {showAddDocModal && (
        <div className={styles.overlay}>
          <div className={styles.modal} style={{ maxWidth: '600px' }}>
            <div className={styles.modalTop}>
              <h3>Thêm tài liệu</h3>
              <button className={styles.modalClose} onClick={() => setShowAddDocModal(false)}><FiX /></button>
            </div>
            
            <div className={styles.tabs} style={{ marginBottom: '16px', marginTop: '12px' }}>
              <button className={`${styles.tab} ${docTab === 'create' ? styles.tabActive : ''}`} onClick={() => setDocTab('create')}>Tạo mới</button>
              <button className={`${styles.tab} ${docTab === 'reuse' ? styles.tabActive : ''}`} onClick={() => setDocTab('reuse')}>Chọn từ danh sách</button>
            </div>

            {docTab === 'create' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className={styles.formGroup}>
                  <label>Tiêu đề tài liệu *</label>
                  <input value={docForm.title} onChange={e => setDocForm(p => ({...p, title: e.target.value}))} placeholder="VD: Slide bài học Unit 1" />
                </div>
                <div className={styles.formGroup}>
                  <label>Mô tả ngắn</label>
                  <input value={docForm.desc} onChange={e => setDocForm(p => ({...p, desc: e.target.value}))} placeholder="Slide tóm tắt lý thuyết..." />
                </div>
                <div className={styles.formGroup}>
                  <label>Nội dung tài liệu (Markdown hoặc Text)</label>
                  <textarea value={docForm.content} onChange={e => setDocForm(p => ({...p, content: e.target.value}))} placeholder="Nội dung tóm tắt..." rows={4} />
                </div>
                <div className={styles.formGroup}>
                  <label>File đính kèm (URL)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input style={{ flex: 1 }} value={docForm.fileUrl} onChange={e => setDocForm(p => ({...p, fileUrl: e.target.value}))} placeholder="http://..." />
                    <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#1e293b', padding: '0 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, border: '1px solid #cbd5e1', height: '38px', margin: 0 }}>
                      Tải file
                      <input type="file" style={{ display: 'none' }} onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await fetch(`${API}/upload`, {
                            method: "POST",
                            body: formData
                          });
                          if (!res.ok) throw new Error("Upload failed");
                          const data = await res.json();
                          setDocForm(p => ({ ...p, fileUrl: data.url }));
                          alert("Tải lên file thành công!");
                        } catch (err) {
                          alert("Lỗi tải lên file: " + (err as Error).message);
                        }
                      }} />
                    </label>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.detailBtnOutline} onClick={() => setShowAddDocModal(false)}>Hủy</button>
                  <button className={styles.detailBtnPrimary} onClick={saveNewDoc}>Tạo mới</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                  {allExistingDoc.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Không tìm thấy tài liệu nào.</div>
                  ) : (
                    allExistingDoc.map((doc: any) => (
                      <div key={doc.MaTaiLieu} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        <div style={{ flex: 1, paddingRight: '8px' }}>
                          <strong style={{ fontSize: '14px', color: '#15803d', display: 'block' }}>{doc.TieuDe}</strong>
                          <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>
                            {doc.MoTa || 'Không có mô tả'} · Nguồn: Lớp {doc.TenLop} ({doc.TenBuoiHoc})
                          </div>
                        </div>
                        <button className={styles.detailBtnPrimary} style={{ fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }} onClick={() => cloneDoc(doc.MaTaiLieu)}>Chọn</button>
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.modalFooter} style={{ marginTop: '16px' }}>
                  <button className={styles.detailBtnOutline} onClick={() => setShowAddDocModal(false)}>Đóng</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.modal} style={{ width: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTop}>
              <span style={{ fontSize: "16px", fontWeight: 750, color: "#1e293b" }}>Xác nhận xóa vĩnh viễn</span>
              <button type="button" className={styles.modalClose} onClick={() => setDeleteTarget(null)}>&times;</button>
            </div>
            <div style={{ marginTop: "16px" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#1e293b", lineHeight: "1.6" }}>
                Bạn có chắc chắn muốn xóa học liệu <strong>"{deleteTarget.title}"</strong> không? Hành động này sẽ gỡ bỏ học liệu khỏi tất cả các lớp của giáo viên và sinh viên.
              </p>
              <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#ef4444" }}>
                <strong>Lưu ý:</strong> Hành động này không thể khôi phục!
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" className={styles.detailBtnOutline} onClick={() => setDeleteTarget(null)}>Hủy bỏ</button>
                <button type="button" className={styles.detailBtnPrimary} style={{ background: "#c20e0e" }} onClick={handleDeleteConfirm}>Đồng ý xóa</button>
              </div>
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
