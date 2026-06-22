import "./ExercisePage.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiMonitor, FiClock, FiUsers, FiBook, FiArrowLeft, FiCalendar } from "react-icons/fi";

const ExercisePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [lesson, setLesson] = useState<any>(null);
  const [soHocVien, setSoHocVien] = useState(0);
  const [giangVien, setGiangVien] = useState("—");
  const [lichHoc, setLichHoc] = useState("—");
  const [filterType, setFilterType] = useState<"all" | "homework" | "exam">("all");



  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/buoihoc/${id}`)
      .then(res => res.json())
      .then(async (buoiHocData) => {
        setLesson(Array.isArray(buoiHocData) ? buoiHocData[0] : buoiHocData);
        const maLopHoc = buoiHocData.MaLopHoc;

        // Lấy số học viên thực tế từ SINHVIEN_LOPHOC
        const countRes = await fetch(`http://localhost:5000/lophoc/${maLopHoc}/students/count`);
        const countData = await countRes.json();
        setSoHocVien(countData.SoLuongHocVien || 0);

        // Lấy thông tin lớp (LichHoc)
        const lopRes = await fetch(`http://localhost:5000/classes/${maLopHoc}/info`);
        const lopData = await lopRes.json();
        setLichHoc(lopData.LichHoc || "—");

        // Lấy tên giảng viên
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const gvRes = await fetch(`http://localhost:5000/giangvien/${user.MaNguoiDung}`);
          const gvData = await gvRes.json();
          setGiangVien(gvData.HoTen || "—");
        }
      })
      .catch(err => console.log(err));
  }, [id]);

  /* ===== LOAD BAITAPS ===== */
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/baitap/buoihoc/${id}`)
      .then(res => res.json())
      .then(data => setExercises(data))
      .catch(err => console.log(err));
  }, [id]);

  /* ===== DELETE ===== */
  const handleDelete = async () => {
    if (selectedId === null) return;
    try {
      const url = `http://localhost:5000/baitap/${selectedId}`;
      const res = await fetch(url, { method: "DELETE" });
      const body = await res.text();
      if (res.ok) {
        setExercises(prev =>
          prev.filter(e => Number(e.MaBaiTap) !== Number(selectedId))
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

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.Title?.toLowerCase().includes(search.toLowerCase());
    const isExam = ex.IsExam === 1 || ex.Type === "exam" || ex.Title?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("kiểm tra");

    if (filterType === "homework") {
      return matchesSearch && !isExam;
    }
    if (filterType === "exam") {
      return matchesSearch && isExam;
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
      <div className="header-card">
        <div className="cd-left-content">
          <h1>{lesson?.TenBuoiHoc}</h1>
          <p className="cd-class-desc">{lesson?.MoTa}</p>
          
          <div className="info-row">
            <div className="info-item">
              <div className="cd-meta-icon-wrapper teacher-icon">
                <FiMonitor size={18} />
              </div>
              <div className="info-item-content">
                <p className="label">Giáo viên</p>
                <b>{giangVien}</b>
              </div>
            </div>

            <div className="info-item">
              <div className="cd-meta-icon-wrapper calendar-icon">
                <FiClock size={18} />
              </div>
              <div className="info-item-content">
                <p className="label">Lịch học</p>
                <b>{lichHoc}</b>
              </div>
            </div>

            <div className="info-item">
              <div className="cd-meta-icon-wrapper students-icon">
                <FiUsers size={18} />
              </div>
              <div className="info-item-content">
                <p className="label">Số học viên</p>
                <b>{soHocVien} học viên</b>
              </div>
            </div>

            <div className="info-item">
              <div className="cd-meta-icon-wrapper status-icon">
                <FiBook size={18} />
              </div>
              <div className="info-item-content">
                <p className="label">Trạng thái</p>
                <b>Đang học</b>
              </div>
            </div>
          </div>
        </div>

        <div className="cd-right-content">
          <span className="status-badge">Đang học</span>
          <span className="cd-class-id">Mã lớp: B239B1</span>
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
          {filteredExercises.map((ex) => (
            <div key={ex.MaBaiTap} className="exercise-card">
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
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                <FiCalendar size={14} />
                {ex.CreatedDate && new Date(ex.CreatedDate).toLocaleDateString("vi-VN")}
              </span>
              <div className="btn-group">
                <button
                  className="outline-btn"
                  onClick={() => navigate(`/baitap-detail/${ex.MaBaiTap}/${id}`)}
                >
                  Xem chi tiết
                </button>
                <button
                  className="delete-btn"
                  onClick={() => {
                    setSelectedId(Number(ex.MaBaiTap));
                    setShowDeleteModal(true);
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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

export default ExercisePage;
