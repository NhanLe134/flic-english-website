import "./ExercisePage.css";
import { useState, useEffect } from "react";
import { formatScheduleOnlyDays } from "../../utils/schedule";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiTrash2, FiEye } from "react-icons/fi";
import { FaChalkboardTeacher, FaClock, FaUsers, FaBook } from "react-icons/fa";

const ExercisePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [lesson, setLesson] = useState<any>(null);
  const [soHocVien, setSoHocVien] = useState(0);
  const [giangVien, setGiangVien] = useState("—");
  const [lichHoc, setLichHoc] = useState("—");
  const [trangThaiLopHoc, setTrangThaiLopHoc] = useState("Đang học");
  const [filterType, setFilterType] = useState<"all" | "homework" | "exam" | "practice">("all");



  useEffect(() => {
    if (!id) return;
    fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/buoihoc/${id}`)
      .then(res => res.json())
      .then(async (buoiHocData) => {
        const lessonObj = Array.isArray(buoiHocData) ? buoiHocData[0] : buoiHocData;
        setLesson(lessonObj);
        const maLopHoc = lessonObj.MaLopHoc;

        // Lấy số học viên thực tế từ SINHVIEN_LOPHOC
        const countRes = await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/lophoc/${maLopHoc}/students/count`);
        const countData = await countRes.json();
        setSoHocVien(countData.SoLuongHocVien || 0);

        // Lấy thông tin lớp (LichHoc và TrangThaiLopHoc)
        const lopRes = await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/classes/${maLopHoc}/info`);
        const lopData = await lopRes.json();
        setLichHoc(formatScheduleOnlyDays(lopData.LichHoc) || "—");
        setTrangThaiLopHoc(lopData.TrangThaiLopHoc || "Đang học");

        // Lấy tên giảng viên
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const gvRes = await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/giangvien/${user.MaNguoiDung}`);
          const gvData = await gvRes.json();
          setGiangVien(gvData.HoTen || "—");
        }
      })
      .catch(err => console.log(err));
  }, [id]);

  /* ===== LOAD BAITAPS ===== */
  useEffect(() => {
    if (!id) return;
    fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/baitap/buoihoc/${id}`)
      .then(res => res.json())
      .then(data => setExercises(data))
      .catch(err => console.log(err));
  }, [id]);

  /* ===== TOGGLE OPEN/CLOSE EXAM ===== */
  const handleToggleOpen = async (maBaiTap: number) => {
    try {
      const res = await fetch((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "/baitap/toggle-open", {
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

  /* ===== DELETE ===== */
  const handleDelete = async () => {
    if (selectedId === null) return;
    try {
      const url = `${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/baitap/${selectedId}`;
      const res = await fetch(url, { method: "DELETE" });
      const body = await res.text();
      if (res.ok) {
        const cleanId = String(selectedId).replace("exam-", "").replace("baitap-", "");
        setExercises((prev: any[]) =>
          prev.filter((e: any) => String(e.MaBaiTap) !== cleanId)
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
    const matchesSearch = ex.Title?.toLowerCase().includes(search.toLowerCase());
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

  if (!lesson) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="ep-wrapper">
      <span className="cd2-back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Quay lại
      </span>

      {/* ===== HEADER ===== */}
      <div className="cd-overview-card">
        <div className="cd-left-content">
          <h2 className="cd-class-title">{lesson?.TenBuoiHoc}</h2>
          <p className="cd-class-desc">{lesson?.MoTa}</p>
          
          <div className="cd-meta-grid">
            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaChalkboardTeacher />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Giáo viên</span>
                <span className="cd-meta-value">{giangVien}</span>
              </div>
            </div>

            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaClock />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Lịch học</span>
                <span className="cd-meta-value">{lichHoc}</span>
              </div>
            </div>

            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaUsers />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Số học viên</span>
                <span className="cd-meta-value">{soHocVien} học viên</span>
              </div>
            </div>

            <div className="cd-meta-item">
              <div className="cd-meta-icon-wrapper">
                <FaBook />
              </div>
              <div className="cd-meta-info">
                <span className="cd-meta-label">Trạng thái</span>
                <span className="cd-meta-value">{trangThaiLopHoc}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cd-right-content">
          <span className="status-badge">{trangThaiLopHoc}</span>
          <span className="cd-class-id">Mã lớp: {lesson?.MaLopHoc}</span>
          <span className="cd-class-dates">
            <FiCalendar size={13} style={{ marginRight: 6 }} />
            {lesson?.NgayBatDau && new Date(lesson.NgayBatDau).toLocaleDateString("vi-VN")} - {lesson?.NgayKetThuc && new Date(lesson.NgayKetThuc).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="tabs">
                <button className="tab active">Bài tập</button>
        <button className="tab" onClick={() => navigate(`/quan-ly-bai-giang/${id}`)}>Bài giảng</button>
        <button className="tab" onClick={() => navigate(`/documents/${id}`)}>Tài liệu</button>
      </div>

      {/* ===== BAITAPS ===== */}
      <div className="exercise-section">
        <h2>Danh sách bài tập</h2>

        <div className="exercise-top">
          <div className="ep-search-group">
            <form className="search-container" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: 0 }}>
              <input
                className="search-input"
                placeholder="Tìm kiếm bài tập..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="search-button" type="button">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{
                height: "40px",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1.5px solid #f1edeb",
                background: "white",
                color: "#333",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            >
              <option value="all">Tất cả bài</option>
              <option value="homework">Bài tập</option>
              <option value="exam">Bài kiểm tra</option>
              <option value="practice">Bài LTT</option>
            </select>

            <button
              className="ep-add-btn"
              onClick={() => navigate(`/create-exercise/${id}`)}
            >
              + Tạo bài tập
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
          </div>
          <div className="ep-total-box">
            <p>Tổng số bài tập</p>
            <b>{filteredExercises.length}</b>
          </div>
        </div>

        <div className="exercise-grid">
          {filteredExercises.map((ex: any) => (
            <div key={ex.MaBaiTap} className="exercise-card" style={{ height: '200px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a202c', wordBreak: 'break-word', flex: 1 }}>{ex.Title}</h4>
                {ex.TrangThai !== 'practice' && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    background: ex.TrangThai === 'published' ? '#e8f5e9' : ex.TrangThai === 'rejected' ? '#ffebee' : '#fff3e0',
                    color: ex.TrangThai === 'published' ? '#2e7d32' : ex.TrangThai === 'rejected' ? '#c62828' : '#F95800',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    {ex.TrangThai === 'published' ? 'Đã duyệt' : ex.TrangThai === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                  </span>
                )}
              </div>
              <p>{ex.Type}</p>
              
              {/* Lock/Unlock display for exams */}
              {(() => {
                let parsedContent: any = {};
                try {
                  if (ex.Content) parsedContent = JSON.parse(ex.Content);
                } catch (e) {}
                const isExam = ex.Type === "exam" || ex.IsExam === 1 || parsedContent.isExam || ex.Title?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("kiểm tra");
                if (!isExam) return null;

                const isManual = parsedContent.openingMode === "manual";
                const isOpened = !!parsedContent.isOpened;
                const isApproved = ex.TrangThai === "published" || ex.TrangThai === "Đã duyệt";

                if (!isApproved) return null;

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

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                <FiCalendar size={14} />
                {ex.CreatedDate && new Date(ex.CreatedDate).toLocaleDateString("vi-VN")}
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
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
                    let parsedContent: any = {};
                    try {
                      if (ex.Content) parsedContent = JSON.parse(ex.Content);
                    } catch (e) {}
                    const isExam = ex.Type === "exam" || ex.IsExam === 1 || parsedContent.isExam || ex.Title?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("kiểm tra");
                    setSelectedId(isExam ? "exam-" + ex.MaBaiTap : "baitap-" + ex.MaBaiTap);
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
      </div>

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



    </div>
  );
};

export default ExercisePage;

