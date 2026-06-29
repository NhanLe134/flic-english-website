import "./LessonList.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiUsers, FiTrendingUp, FiCheckSquare, FiArrowLeft, FiFileText } from "react-icons/fi";

interface Lesson {
  MaBuoiHoc: number;
  TenBuoiHoc: string;
  MoTa: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  ThuTu: number;
}

const LessonList = () => {

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const tenKhoaHoc = location.state?.tenKhoaHoc || "Chi tiết khóa học";
  const tenLop = location.state?.tenLop || "Danh sách buổi học";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const [classProgress, setClassProgress] = useState(57);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeBuoiHocId, setActiveBuoiHocId] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    desc: "",
    startDate: "",
    endDate: "",
    order: 1
  });

  const fetchClassInfo = () => {
    fetch(`http://localhost:5000/classes/${id}/info`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setActiveBuoiHocId(data.ActiveBuoiHocId);
        }
      })
      .catch(err => console.log(err));
  };

  const handleMarkActiveLesson = async (lessonId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/classes/${id}/active-buoihoc`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeBuoiHocId: lessonId })
      });
      if (res.ok) {
        setActiveBuoiHocId(lessonId);
      } else {
        alert("Lỗi khi cập nhật buổi học đang học");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveLesson = async () => {
    if (!lessonForm.title.trim()) {
      alert("Vui lòng nhập tên buổi học!");
      return;
    }
    const minOrder = Math.max(1, lessons.length);
    if (lessonForm.order < minOrder) {
      alert(`Thứ tự buổi học không được nhỏ hơn số buổi hiện có ở lớp này (${lessons.length})!`);
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/qtv/buoihoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TenBuoiHoc: lessonForm.title,
          MaLopHoc: Number(id),
          MoTa: lessonForm.desc,
          NgayBatDau: lessonForm.startDate || null,
          NgayKetThuc: lessonForm.endDate || null,
          ThuTu: lessonForm.order
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setLessonForm({
          title: "",
          desc: "",
          startDate: "",
          endDate: "",
          order: 1
        });
        // Re-fetch lessons list
        fetch(`http://localhost:5000/classes/${id}/buoihoc`)
          .then(r => r.json())
          .then(data => setLessons(data))
          .catch(err => console.log(err));
      } else {
        alert("Lỗi khi thêm buổi học");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi server khi thêm buổi học");
    }
  };

  const handleOpenAddModal = () => {
    setLessonForm({
      title: "",
      desc: "",
      startDate: "",
      endDate: "",
      order: lessons.length > 0 ? lessons.length + 1 : 1
    });
    setShowAddModal(true);
  };

  useEffect(() => {
    fetch(`http://localhost:5000/classes/${id}/buoihoc`)
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(err => console.log(err));

    fetchClassInfo();

    // Fetch số học viên của lớp
    fetch(`http://localhost:5000/lophoc/${id}/students/count`)
      .then(res => res.json())
      .then(data => setStudentCount(data?.SoLuongHocVien ?? 12))
      .catch(() => setStudentCount(12));

    // Lấy tiến độ lớp học thực tế từ backend
    fetch(`http://localhost:5000/lophoc/${id}/tiendo`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.TienDo === 'number') {
          setClassProgress(data.TienDo);
        }
      })
      .catch(err => {
        console.log("Error loading class progress:", err);
        setClassProgress(57); // fallback
      });

    // Lấy số lượng bài tập cần duyệt
    fetch("http://localhost:5000/teacher/submissions/pending-count")
      .then(res => res.json())
      .then(data => setPendingCount(data.count))
      .catch(err => console.log(err));
  }, [id]);

  const filteredLessons = lessons.filter((lesson) =>
    lesson.TenBuoiHoc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lesson-wrapper">
      <span className="lesson-back" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Quay lại
      </span>

      {/* HEADER */}
      <div className="lesson-header">
        <div>
          <h1 className="lesson-title">{tenLop}</h1>
        </div>
      </div>

      {/* STATS */}
      <div className="lesson-stats">
        <div className="lesson-stat-card students-card">
          <div className="stat-icon-wrapper">
            <FiUsers size={16} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Học viên</span>
            <h3 className="stat-value">{studentCount}</h3>
            <span className="stat-desc">Tổng số học viên</span>
          </div>
        </div>
        <div className="lesson-stat-card progress-card">
          <div className="stat-icon-wrapper">
            <FiTrendingUp size={16} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tiến độ</span>
            <h3 className="stat-value">{classProgress}%</h3>
            <span className="stat-desc">Tiến độ trung bình</span>
          </div>
        </div>
        <div className="lesson-stat-card pending-card">
          <div className="stat-icon-wrapper">
            <FiCheckSquare size={16} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Bài tập</span>
            <h3 className="stat-value">{pendingCount} bài</h3>
            <span className="stat-desc">Bài tập cần duyệt</span>
          </div>
        </div>
      </div>

      {/* SEARCH CONTAINER & DRAFTS BUTTON */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "24px" }}>
        <form className="search-container" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: 0 }}>
          <input
            className="search-input"
            placeholder="Tìm kiếm buổi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        <button
          type="button"
          className="drafts-btn"
          onClick={() => navigate("/quan-ly-ban-nhap")}
          style={{
            height: "40px",
            padding: "0 20px",
            borderRadius: "8px",
            border: "1.5px solid #F95800",
            background: "white",
            color: "#F95800",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#fff4ec")}
          onMouseOut={(e) => (e.currentTarget.style.background = "white")}
        >
          <FiFileText size={16} />
          Quản lý bản nháp
        </button>

        <button
          type="button"
          className="create-lesson-btn"
          onClick={handleOpenAddModal}
          style={{
            height: "40px",
            padding: "0 20px",
            borderRadius: "8px",
            background: "#F95800",
            border: "none",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#e04f00")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#F95800")}
        >
          Tạo buổi học
        </button>
      </div>

      {/* LESSON GRID */}
      <div className="lesson-grid">
        {filteredLessons.map((lesson) => (
          <div key={lesson.MaBuoiHoc} className="lesson-card">
            <h3>{lesson.TenBuoiHoc}</h3>
            <p className="lesson-desc">{lesson.MoTa}</p>
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              {lesson.MaBuoiHoc === activeBuoiHocId ? (
                <div style={{
                  background: "#e8f5e9",
                  color: "#2e7d32",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  border: "1px solid #c8e6c9"
                }}>
                  <span>🟢 Buổi đang học</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleMarkActiveLesson(lesson.MaBuoiHoc)}
                  style={{
                    background: "transparent",
                    color: "#666",
                    border: "1.5px dashed #ccc",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = "#F95800";
                    e.currentTarget.style.borderColor = "#F95800";
                    e.currentTarget.style.background = "#fff4ec";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = "#666";
                    e.currentTarget.style.borderColor = "#ccc";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Đánh dấu buổi đang học
                </button>
              )}
              <button
                className="lesson-btn"
                onClick={() => navigate(`/class/${lesson.MaBuoiHoc}`, {
                  state: { tenKhoaHoc, tenLop, maLopHoc: id } // ← thêm maLopHoc
                })}
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-top">
              <h3>Thêm buổi học vào lộ trình</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <p className="modal-sub">Lớp: {tenLop} · {tenKhoaHoc}</p>
            <div className="form-group">
              <label>Tên buổi học <span className="req">*</span></label>
              <input 
                value={lessonForm.title} 
                onChange={e => setLessonForm(p => ({...p, title: e.target.value}))} 
                placeholder="VD: Buổi 1: Ngữ pháp cơ bản" 
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea 
                value={lessonForm.desc} 
                onChange={e => setLessonForm(p => ({...p, desc: e.target.value}))} 
                placeholder="Nội dung buổi học..." 
                rows={3} 
              />
            </div>
            <div className="two-cols">
              <div className="form-group">
                <label>📅 Ngày bắt đầu</label>
                <input 
                  type="date" 
                  value={lessonForm.startDate} 
                  onChange={e => setLessonForm(p => ({...p, startDate: e.target.value}))} 
                />
              </div>
              <div className="form-group">
                <label>📅 Ngày kết thúc</label>
                <input 
                  type="date" 
                  value={lessonForm.endDate} 
                  onChange={e => setLessonForm(p => ({...p, endDate: e.target.value}))} 
                />
              </div>
            </div>
            <div className="form-group">
              <label>Thứ tự</label>
              <input 
                type="number" 
                min={Math.max(1, lessons.length)} 
                value={lessonForm.order} 
                onChange={e => setLessonForm(p => ({...p, order: Number(e.target.value)}))} 
              />
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowAddModal(false)}>Hủy</button>
              <button className="btn-primary" onClick={saveLesson}>Thêm buổi</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LessonList;
