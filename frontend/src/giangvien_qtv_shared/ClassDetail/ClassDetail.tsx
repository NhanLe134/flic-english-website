import "./ClassDetail.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCalendar, FiArrowLeft, FiEye, FiTrash2, FiSearch } from "react-icons/fi";
import { FaClock, FaBook } from "react-icons/fa"; // Đã bỏ FaChalkboardTeacher và FaUsers
import LessonManagement from "../LessonManagement/LessonManagement";
import DocumentManagement from "../DocumentManagement/DocumentManagement";

type ActiveTab = "exercises" | "lectures" | "documents";

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

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/buoihoc/${id}`)
      .then(res => res.json())
      .then(async (data) => {
        setLesson(data);
      })
      .catch(err => console.log(err));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5000/baitap/buoihoc/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log("ClassDetail exercises fetched:", data);
        setExercises(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("ClassDetail exercises fetch error:", err));
  }, [id]);

  if (!lesson) return <p>Đang tải dữ liệu...</p>;

  const handleToggleOpen = async (maBaiTap: number) => {
    try {
      const res = await fetch("http://localhost:5000/baitap/toggle-open", {
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
      const url = `http://localhost:5000/baitap/${selectedId}`;
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
                <span className="cd-meta-value">{lesson.LichHoc}</span>
              </div>
            </div>

            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaBook />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Trạng thái</span>
                <span className="cd-meta-value">Đang học</span>
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
                Mã lớp: B239B1
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
            Đang học
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

            <button className="ep-add-btn" onClick={() => navigate(`/create-exercise/${id}`)}>
              + Tạo BT/KT
            </button>

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

            <div className="ep-total-box">
              <p>Tổng số bài tập</p>
              <b>{filteredExercises.length}</b>
            </div>
          </div>

          {filteredExercises.length === 0 ? (
            <div className="lesson-tab-empty">Chưa có bài tập nào cho buổi học này.</div>
          ) : (
            <div className="lesson-card-grid">
              {filteredExercises.map((ex: any) => (
                <div key={ex.MaBaiTap} className="lesson-content-card">
                  <div className="lesson-content-head">
                    <h4>{ex.Title}</h4>
                    {ex.TrangThai !== "practice" && (
                      <span className={`content-status ${ex.TrangThai || "pending"}`}>
                        {ex.TrangThai === "published" ? "Đã duyệt" : ex.TrangThai === "rejected" ? "Từ chối" : "Chờ duyệt"}
                      </span>
                    )}
                  </div>

                  <p>{ex.Type || "Bài tập"}</p>
                  
                  {(() => {
                    let parsedContent: any = {};
                    try {
                      if (ex.Content) parsedContent = JSON.parse(ex.Content);
                    } catch (e) {}
                    const isExam = ex.Type === "exam" || ex.IsExam === 1 || parsedContent.isExam || ex.Title?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("kiểm tra");
                    if (!isExam) return null;

                    const isManual = parsedContent.openingMode === "manual";
                    const isOpened = !!parsedContent.isOpened;
                    const isApproved = ex.TrangThai === "published";

                    return (
                      <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: !isApproved ? "#F95800" : isManual ? (isOpened ? "#16a34a" : "#64748b") : "#b45309",
                          background: !isApproved ? "#fff3e0" : isManual ? (isOpened ? "#dcfce7" : "#f1f5f9") : "#fef3c7",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          width: "fit-content"
                        }}>
                          {!isApproved ? "⏳ Đang chờ duyệt" : isManual ? (isOpened ? "🔓 Đang mở đề (Thủ công)" : "🔒 Đang đóng đề (Thủ công)") : "🕒 Tự động mở theo lịch"}
                        </span>
                        {isApproved && isManual && (
                          <button
                            onClick={() => handleToggleOpen(ex.MaBaiTap)}
                            style={{
                              background: isOpened ? "#fff" : "#F95800",
                              color: isOpened ? "#64748b" : "#fff",
                              border: isOpened ? "1.5px solid #cbd5e1" : "none",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              width: "fit-content"
                            }}
                          >
                            {isOpened ? "Khóa đề" : "Mở đề"}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                  <span className="content-date">
                    <FiCalendar size={14} />
                    {ex.CreatedDate ? new Date(ex.CreatedDate).toLocaleDateString("vi-VN") : "Chưa có ngày tạo"}
                  </span>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
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
                        width: "32px",
                        height: "32px",
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
                      <FiEye size={16} />
                    </button>
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
                        width: "32px",
                        height: "32px",
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
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
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
        <div className="baitap-modal-overlay">
          <div className="delete-modal">
            <div className="modal-icon">!</div>
            <h3>Xác nhận Xóa</h3>
            <p>Bạn có chắc chắn muốn xóa bài tập này không?</p>
            <button className="confirm-btn" onClick={handleDelete}>Xác nhận</button>
            <button className="cancel-btn" onClick={() => { setShowDeleteModal(false); setSelectedId(null); }}>Không</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;