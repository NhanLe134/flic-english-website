import "./LessonList.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiFileText, FiTrash2 } from "react-icons/fi";

interface Lesson {
  MaBuoiHoc: number;
  TenBuoiHoc: string;
  MoTa: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  ThuTu: number;
  TrangThai?: string;
}

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5000`
    : "http://14.225.192.252:5000";

const LessonList = () => {

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const tenKhoaHoc = location.state?.tenKhoaHoc || "Chi tiết khóa học";
  const tenLop = location.state?.tenLop || "Danh sách buổi học";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");



  const [showAddModal, setShowAddModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    desc: "",
    startDate: "",
    endDate: "",
    order: 1
  });

  // Custom popup overlay state
  const [dialog, setDialog] = useState<{
    show: boolean;
    type: "confirm" | "alert";
    message: string;
    subMessage?: string;
    onConfirm?: () => void;
  }>({
    show: false,
    type: "alert",
    message: ""
  });

  const showAlert = (message: string) => {
    setDialog({
      show: true,
      type: "alert",
      message
    });
  };

  const showConfirm = (message: string, subMessage: string, onConfirm: () => void) => {
    setDialog({
      show: true,
      type: "confirm",
      message,
      subMessage,
      onConfirm
    });
  };



  const handleDeleteLesson = (lessonId: number, lessonName: string) => {
    showConfirm(
      `Bạn có chắc chắn muốn xóa buổi học "${lessonName}" không?`,
      "Tất cả tài liệu, bài giảng, và bài tập liên kết với buổi này sẽ bị ảnh hưởng.",
      async () => {
        try {
          const res = await fetch(`${API}/qtv/buoihoc/${lessonId}`, {
            method: "DELETE"
          });
          if (res.ok) {
            setLessons(prev => prev.filter(l => l.MaBuoiHoc !== lessonId));
          } else {
            showAlert("Lỗi khi xóa buổi học");
          }
        } catch (err) {
          console.error(err);
          showAlert("Lỗi kết nối khi xóa buổi học");
        }
      }
    );
  };

  const handleMarkActiveLesson = async (lessonId: number | null) => {
    try {
      const res = await fetch(`${API}/classes/${id}/active-buoihoc`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeBuoiHocId: lessonId })
      });
      if (res.ok) {
        // Re-fetch lessons list to update TrangThai on screen immediately
        fetch(`${API}/classes/${id}/buoihoc`)
          .then(r => r.json())
          .then(data => setLessons(data))
          .catch(err => console.log(err));
      } else {
        showAlert("Lỗi khi cập nhật buổi học đang học");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveLesson = async () => {
    if (!lessonForm.title.trim()) {
      showAlert("Vui lòng nhập tên buổi học!");
      return;
    }
    const minOrder = Math.max(1, lessons.length);
    if (lessonForm.order < minOrder) {
      showAlert(`Thứ tự buổi học không được nhỏ hơn số buổi hiện có ở lớp này (${lessons.length})!`);
      return;
    }
    try {
      const res = await fetch(`${API}/qtv/buoihoc`, {
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
        fetch(`${API}/classes/${id}/buoihoc`)
          .then(r => r.json())
          .then(data => setLessons(data))
          .catch(err => console.log(err));
      } else {
        showAlert("Lỗi khi thêm buổi học");
      }
    } catch (err) {
      console.error(err);
      showAlert("Lỗi server khi thêm buổi học");
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

  const [classStatus, setClassStatus] = useState<string>("");

  useEffect(() => {
    fetch(`${API}/classes/${id}/buoihoc`)
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(err => console.log(err));

    fetch(`${API}/classes/${id}/info`)
      .then(res => res.json())
      .then(data => {
        if (data && data.TrangThaiLopHoc) {
          setClassStatus(data.TrangThaiLopHoc);
        }
      })
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

        {classStatus !== "Đã hoàn thành" && (
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
        )}
      </div>

      {/* LESSON GRID */}
      <div className="lesson-grid">
        {filteredLessons.map((lesson) => {
          const isOpened = lesson.TrangThai === "Đã mở";

          return (
            <div key={lesson.MaBuoiHoc} className="lesson-card">
              {classStatus !== "Đã hoàn thành" && (
                <button
                  type="button"
                  className="lesson-delete-btn"
                  title="Xóa buổi học"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLesson(lesson.MaBuoiHoc, lesson.TenBuoiHoc);
                  }}
                >
                  <FiTrash2 />
                </button>
              )}
              <h3>{lesson.TenBuoiHoc}</h3>
              <p className="lesson-desc">{lesson.MoTa}</p>
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                {classStatus === "Đã hoàn thành" ? (
                  <span style={{
                    color: isOpened ? "#2e7d32" : "#666",
                    border: isOpened ? "1.5px solid #c8e6c9" : "1.5px solid #ccc",
                    background: isOpened ? "#e8f5e9" : "#f1f5f9",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    textAlign: "center",
                    display: "inline-block"
                  }}>
                    {isOpened ? "Đã mở" : "Chưa mở"}
                  </span>
                ) : isOpened ? (
                  <button
                    type="button"
                    onClick={() => {
                      const currentLessonIndex = lessons.findIndex(l => l.MaBuoiHoc === lesson.MaBuoiHoc);
                      const targetId = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1].MaBuoiHoc : null;
                      handleMarkActiveLesson(targetId);
                    }}
                    style={{
                      background: "#e8f5e9",
                      color: "#2e7d32",
                      border: "1.5px solid #c8e6c9",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#d0ebd4";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#e8f5e9";
                    }}
                  >
                    Đã mở
                  </button>
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
                    Mở buổi
                  </button>
                )}
                <button
                  className="lesson-btn"
                  onClick={() => navigate(`/class/${lesson.MaBuoiHoc}`, {
                    state: { tenKhoaHoc, tenLop, maLopHoc: id }
                  })}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          );
        })}
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

      {dialog.show && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1001,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <div className="modal-container" style={{
            background: "#ffffff",
            padding: "32px 40px",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "480px",
            textAlign: "center",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>
              {dialog.type === "confirm" ? "Xác nhận xóa" : "Thông báo"}
            </h3>
            <p style={{ fontSize: "14px", color: "#475569", margin: dialog.subMessage ? "0 0 8px 0" : "0 0 24px 0", lineHeight: "1.5" }}>
              {dialog.message}
            </p>
            {dialog.subMessage && (
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 24px 0", lineHeight: "1.5" }}>
                {dialog.subMessage}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              {dialog.type === "confirm" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setDialog(p => ({ ...p, show: false }))}
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDialog(p => ({ ...p, show: false }));
                      if (dialog.onConfirm) dialog.onConfirm();
                    }}
                    style={{
                      background: "#ef4444",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                  >
                    Xóa
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setDialog(p => ({ ...p, show: false }))}
                  style={{
                    background: "#F95800",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 32px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s"
                  }}
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LessonList;
