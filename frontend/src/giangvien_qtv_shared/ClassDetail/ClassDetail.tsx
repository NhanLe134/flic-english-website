import "./ClassDetail.css";
import { useState, useEffect } from "react";
import { formatScheduleOnlyDays } from "../../utils/schedule";
import { useParams, useNavigate } from "react-router-dom";
import { FiCalendar, FiArrowLeft, FiEye, FiTrash2, FiSearch } from "react-icons/fi";
import { FaClock, FaBook } from "react-icons/fa"; // Đã bỏ FaChalkboardTeacher và FaUsers
import LessonManagement from "../LessonManagement/LessonManagement";
import DocumentManagement from "../DocumentManagement/DocumentManagement";
import { hasPermission } from "../../utils/permission";

type ActiveTab = "exercises" | "lectures" | "documents";

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5000`
    : "http://14.225.192.252:5000";

const ClassDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [lesson, setLesson] = useState<any>(null);
  // Đã bỏ hoàn toàn state teacherName và studentCount thừa kèm 2 useEffect fetch dữ liệu của chúng
  const [activeTab, setActiveTab] = useState<ActiveTab>("exercises");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "homework" | "exam" | "practice">("all");
  const [exercises, setExercises] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggleExId, setToggleExId] = useState<number | null>(null);
  const [toggleCurrentState, setToggleCurrentState] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/buoihoc/${id}`)
      .then(res => res.json())
      .then(async (data) => {
        setLesson(data);
      })
      .catch(err => console.log(err));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    fetch(`${API}/baitap/buoihoc/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log("ClassDetail exercises fetched:", data);
        setExercises(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("ClassDetail exercises fetch error:", err));
  }, [id]);

  if (!lesson) return <p>Đang tải dữ liệu...</p>;

  const handleToggleOpenClick = (maBaiTap: number, currentOpened: boolean) => {
    setToggleExId(maBaiTap);
    setToggleCurrentState(currentOpened);
    setShowToggleModal(true);
  };

  const handleConfirmToggleOpen = async () => {
    if (toggleExId === null) return;
    const maBaiTap = toggleExId;
    setShowToggleModal(false);
    setToggleExId(null);

    try {
      const res = await fetch(`${API}/baitap/toggle-open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaBaiTap: maBaiTap })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExercises((prev: any[]) =>
          prev.map((ex: any) => {
            if (Number(ex.MaBaiTap) === Number(maBaiTap)) {
              let parsed: any = {};
              try {
                if (ex.Content) parsed = JSON.parse(ex.Content);
              } catch (e) {}
              const updatedContent = JSON.stringify({
                ...parsed,
                isOpened: data.isOpened
              });
              return { ...ex, Content: updatedContent };
            }
            return ex;
          })
        );
      } else {
        alert("Lỗi: " + (data.message || "Không thể cập nhật trạng thái đóng/mở"));
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err);
    }
  };

  const handleDelete = async () => {
    if (selectedId === null) return;
    try {
      const url = `${API}/baitap/${selectedId}`;
      const res = await fetch(url, { method: "DELETE" });
      const body = await res.text();
      if (res.ok) {
        setExercises((prev: any[]) =>
          prev.filter((e: any) => Number(e.MaBaiTap) !== Number(selectedId))
        );
      } else {
        alert("Xóa thất bại: " + body);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err);
    }
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  const filteredExercises = exercises.filter((ex: any) => {
    const matchesSearch = ex.Title?.toLowerCase().includes(exerciseSearch.toLowerCase());
    let parsedContent: any = {};
    try {
      if (ex.Content) parsedContent = JSON.parse(ex.Content);
    } catch (e) {}
    const isExam = ex.IsExam === 1 || ex.Type === "exam" || parsedContent.isExam || ex.Title?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("kiểm tra");

    if (filterType === "homework") {
      return matchesSearch && !isExam && ex.TrangThai !== "practice";
    }
    if (filterType === "exam") {
      return matchesSearch && isExam && ex.TrangThai !== "practice";
    }
    if (filterType === "practice") {
      return matchesSearch && ex.TrangThai === "practice";
    }
    return matchesSearch;
  });

  return (
    <div className="cd2-wrapper">
      <span className="cd2-back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
        Quay lại
      </span>

      <div 
        className="cd-overview-card"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "18px 20px",
        }}
      >
        <div 
          className="cd-left-content"
          style={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            marginRight: "auto",
          }}
        >
          <h2 className="cd-class-title">{lesson.TenBuoiHoc}</h2>

          <div className="cd-meta-grid">
            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaClock />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Lịch học</span>
                <span className="cd-meta-value">{formatScheduleOnlyDays(lesson.LichHoc)}</span>
              </div>
            </div>

            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaBook />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Trạng thái</span>
                <span className="cd-meta-value">{lesson.TrangThaiLopHoc || "Đang học"}</span>
              </div>
              <span 
                className="cd-class-id"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: 1,
                  marginTop: "17px",
                  marginLeft: "10px",
                }}
              >
                Mã lớp: {lesson.MaLopHoc}
              </span>
            </div>
          </div>
        </div>

        <div 
          className="cd-right-content"
          style={{
            width: "auto",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            borderLeft: "1px dashed #e2e8f0",
            paddingLeft: "16px",
            paddingRight: "0px",
            flexShrink: 0,
            flexGrow: 0,
            gap: "12px",
            marginLeft: "auto",
            marginRight: "0px",
            alignSelf: "stretch",
          }}
        >
          <span 
            className="status-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {lesson.TrangThaiLopHoc || "Đang học"}
          </span>
          <span 
            className="cd-class-dates"
            style={{
              display: "inline-flex",
              alignItems: "center",
              lineHeight: 1,
            }}
          >
            <FiCalendar size={13} style={{ marginRight: 6 }} />
            {new Date(lesson.NgayBatDau).toLocaleDateString("vi-VN")} - {new Date(lesson.NgayKetThuc).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === "exercises" ? "active" : ""}`} onClick={() => setActiveTab("exercises")}>
          Bài tập
        </button>
        <button className={`tab ${activeTab === "lectures" ? "active" : ""}`} onClick={() => setActiveTab("lectures")}>
          Bài giảng
        </button>
        <button className={`tab ${activeTab === "documents" ? "active" : ""}`} onClick={() => setActiveTab("documents")}>
          Tài liệu
        </button>
      </div>

      {activeTab === "exercises" && (
        <div className="lesson-tab-section">
          <div className="shared-tab-toolbar">
            <form className="search-container" onSubmit={(e) => e.preventDefault()}>
              <input
                className="search-input"
                placeholder="Tìm kiếm bài tập..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
              />
              <button className="search-button" type="button" aria-label="Tìm kiếm">
                <FiSearch size={16} />
              </button>
            </form>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">Tất cả bài</option>
              <option value="homework">Bài tập</option>
              <option value="exam">Bài kiểm tra</option>
              <option value="practice">Bài LTT</option>
            </select>

            {lesson?.TrangThaiLopHoc !== "Đã hoàn thành" && (hasPermission("BAITAP_CREATE") || hasPermission("QUIZ_CREATE")) && (
              <button className="ep-add-btn" onClick={() => navigate(`/create-exercise/${id}`)}>
                + Tạo BT/KT
              </button>
            )}

            {lesson?.TrangThaiLopHoc !== "Đã hoàn thành" && hasPermission("EXTRA_PRACTICE_CREATE") && (
              <button
                className="ep-add-btn"
                onClick={() => navigate(`/create-exercise/${id}?isPractice=true`)}
                style={{
                  background: "#fff",
                  color: "#F95800",
                  border: "1.5px solid #F95800",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#fff4ec"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; }}
              >
                + Tạo bài LTT
              </button>
            )}

            <div className="ep-total-box">
              <p>Tổng số bài tập</p>
              <b>{filteredExercises.length}</b>
            </div>
          </div>

          {filteredExercises.length === 0 ? (
            <div className="lesson-tab-empty">Chưa có bài tập nào cho buổi học này.</div>
          ) : (
            <div className="doc-list" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              {filteredExercises.map((ex: any) => {
                let parsedContent: any = {};
                try {
                  if (ex.Content) parsedContent = JSON.parse(ex.Content);
                } catch (e) {}
                const isExam = ex.IsExam === 1 || ex.Type === "exam" || parsedContent.isExam || ex.Title?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("kiểm tra");

                let typeLabel = "BaiTap";
                let typeColor = "#000080";
                let typeBg = "#e0e7ff";
                if (ex.TrangThai === "practice") {
                  typeLabel = "LuyenTapThem";
                  typeColor = "#c2410c";
                  typeBg = "#ffedd5";
                } else if (isExam) {
                  typeLabel = "BaiKTra";
                  typeColor = "#b91c1c";
                  typeBg = "#fee2e2";
                }

                const isPractice = ex.TrangThai === "practice";

                return (
                  <div
                    key={ex.MaBaiTap}
                    className="doc-card"
                    style={{
                      background: "white",
                      padding: "12px 20px",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid #eef2f6",
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.03)";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#eef2f6";
                    }}
                  >
                    <div className="doc-left" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 600, color: "#1e293b" }}>
                        {ex.Title}
                      </h3>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: typeColor,
                          background: typeBg,
                          padding: "3px 8px",
                          borderRadius: "12px",
                          display: "inline-block",
                          whiteSpace: "nowrap"
                        }}>
                          {typeLabel}
                        </span>
                        {!isPractice && (
                          <span className={`content-status ${ex.TrangThai || "pending"}`} style={{ display: "inline-block" }}>
                            {ex.TrangThai === "published" ? "Đã duyệt" : ex.TrangThai === "rejected" ? "Từ chối" : "Chờ duyệt"}
                          </span>
                        )}

                        {(() => {
                          if (!isExam) return null;
                          const isManual = parsedContent.openingMode === "manual";
                          const isOpened = !!parsedContent.isOpened;
                          const isApproved = ex.TrangThai === "published";

                          if (!isApproved) return <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>Chờ duyệt đề</span>;

                          return (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {isManual && lesson?.TrangThaiLopHoc !== "Đã hoàn thành" ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleOpenClick(ex.MaBaiTap, isOpened)}
                                  title={isOpened ? "Nhấp để đóng đề thi" : "Nhấp để mở đề thi"}
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: isOpened ? "#16a34a" : "#64748b",
                                    background: isOpened ? "#dcfce7" : "#f1f5f9",
                                    border: isOpened ? "1px solid #bbf7d0" : "1px solid #cbd5e1",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                  }}
                                  onMouseOver={e => {
                                    e.currentTarget.style.opacity = "0.85";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                  }}
                                  onMouseOut={e => {
                                    e.currentTarget.style.opacity = "1";
                                    e.currentTarget.style.transform = "none";
                                  }}
                                >
                                  {isOpened ? "🔓 Đang mở đề" : "🔒 Đang đóng đề"}
                                </button>
                              ) : (
                                <span style={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: isManual ? (isOpened ? "#16a34a" : "#64748b") : "#b45309",
                                  background: isManual ? (isOpened ? "#dcfce7" : "#f1f5f9") : "#fef3c7",
                                  border: isManual ? (isOpened ? "1px solid #bbf7d0" : "1px solid #cbd5e1") : "1px solid #fde68a",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  whiteSpace: "nowrap"
                                }}>
                                  {isManual ? (isOpened ? "🔓 Đang mở đề" : "🔒 Đang đóng đề") : "🕒 Tự động mở theo lịch"}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="doc-right" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                      <span className="doc-date" style={{ fontSize: "12.5px", color: "#64748b", marginRight: "8px", whiteSpace: "nowrap" }}>
                        ⏱ Cập nhật: {ex.CreatedDate ? new Date(ex.CreatedDate).toLocaleDateString("vi-VN") : "Chưa có"}
                      </span>

                      <button
                        onClick={() => navigate(`/baitap-detail/${ex.MaBaiTap}/${id}`)}
                        style={{
                          background: "#e0e7ff",
                          border: "1px solid #c7d2fe",
                          color: "#4f46e5",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          transition: "all 0.2s",
                          flexShrink: 0
                        }}
                        title="Xem chi tiết"
                        onMouseOver={e => {
                          e.currentTarget.style.background = "#c7d2fe";
                          e.currentTarget.style.color = "#3730a3";
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = "#e0e7ff";
                          e.currentTarget.style.color = "#4f46e5";
                        }}
                      >
                        <FiEye size={15} />
                      </button>

                      {(() => {
                        if (lesson?.TrangThaiLopHoc === "Đã hoàn thành") return null;
                        const canDelete = isPractice 
                          ? hasPermission("EXTRA_PRACTICE_CREATE")
                          : (isExam ? hasPermission("QUIZ_CREATE") : hasPermission("BAITAP_CREATE"));
                        
                        if (!canDelete) return null;

                        return (
                          <button
                            onClick={() => {
                              setSelectedId(Number(ex.MaBaiTap));
                              setShowDeleteModal(true);
                            }}
                            style={{
                              background: "#fee2e2",
                              border: "1px solid #fecaca",
                              color: "#ef4444",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              transition: "all 0.2s",
                              flexShrink: 0
                            }}
                            title="Xóa bài tập"
                            onMouseOver={e => {
                              e.currentTarget.style.background = "#fca5a5";
                              e.currentTarget.style.color = "#b91c1c";
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.background = "#fee2e2";
                              e.currentTarget.style.color = "#ef4444";
                            }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "lectures" && (
        <LessonManagement buoiHocIdProp={id} isEmbedded={true} />
      )}

      {activeTab === "documents" && (
        <DocumentManagement buoiHocIdProp={id} isEmbedded={true} />
      )}

      {/* ===== MODAL ===== */}
      {showDeleteModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
        }} onClick={() => { setShowDeleteModal(false); setSelectedId(null); }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "450px", maxWidth: "90%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0", overflow: "hidden", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Xóa bài tập</span>
              <button type="button" onClick={() => { setShowDeleteModal(false); setSelectedId(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b", padding: 0, display: "flex", alignItems: "center" }}>&times;</button>
            </div>
            <div style={{ padding: "20px 24px", textAlign: "left" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#1e293b", lineHeight: "1.6" }}>
                Bạn có chắc chắn muốn xóa bài tập này không?
              </p>
              <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#475569" }}>
                <strong>Lưu ý:</strong> Xóa xong không thể khôi phục lại được
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setSelectedId(null); }}
                  style={{
                    padding: "8px 16px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1",
                    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: "8px 16px", background: "#c20e0e", color: "white", border: "none",
                    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 700
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showToggleModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
        }} onClick={() => { setShowToggleModal(false); setToggleExId(null); }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "450px", maxWidth: "90%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0", overflow: "hidden", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                {toggleCurrentState ? "Đóng đề thi/bài tập" : "Mở đề thi/bài tập"}
              </span>
              <button 
                type="button" 
                onClick={() => { setShowToggleModal(false); setToggleExId(null); }} 
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b", padding: 0, display: "flex", alignItems: "center" }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: "20px 24px", textAlign: "left" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#1e293b", lineHeight: "1.6" }}>
                {toggleCurrentState 
                  ? "Bạn có chắc chắn muốn đóng đề thi/bài tập này không?" 
                  : "Bạn có chắc chắn muốn mở đề thi/bài tập này không?"
                }
              </p>
              <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#475569" }}>
                {toggleCurrentState 
                  ? "Lưu ý: Học viên sẽ không thể truy cập làm bài sau khi đóng đề." 
                  : "Lưu ý: Học viên sẽ có thể truy cập làm bài ngay sau khi mở đề."
                }
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => { setShowToggleModal(false); setToggleExId(null); }}
                  style={{
                    padding: "8px 16px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1",
                    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmToggleOpen}
                  style={{
                    padding: "8px 16px", 
                    background: toggleCurrentState ? "#c20e0e" : "#F95800", 
                    color: "white", 
                    border: "none",
                    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 700
                  }}
                >
                  {toggleCurrentState ? "Đóng đề" : "Mở đề"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;