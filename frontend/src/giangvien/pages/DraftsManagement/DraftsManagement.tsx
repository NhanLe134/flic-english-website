import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiCheckSquare, FiAward, FiTrash2, FiSend, FiEye } from "react-icons/fi";
import "./DraftsManagement.css";

interface DraftLesson {
  MaBaiHoc: number;
  TieuDe: string;
  LoaiBaiHoc: string;
  ThoiLuong: string;
  TrangThai: string;
  TenBuoiHoc: string;
  TenLop: string;
  TenKhoaHoc: string;
}

interface DraftExercise {
  MaBaiTap: number;
  Title: string;
  Type: string;
  CreatedDate: string;
  TrangThai: string;
  TenBuoiHoc: string;
  TenLop: string;
  TenKhoaHoc: string;
  MaBuoiHoc?: number;
}

const DraftsManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"lessons" | "exercises" | "exams">("lessons");
  const [lessons, setLessons] = useState<DraftLesson[]>([]);
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [exams, setExams] = useState<DraftExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  const maNguoiDung = user.MaNguoiDung;

  const fetchDrafts = () => {
    if (!maNguoiDung) return;
    setLoading(true);
    fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/teacher/${maNguoiDung}/drafts`)
      .then((res) => res.json())
      .then((data) => {
        setLessons(data.lessons || []);
        setExercises(data.exercises || []);
        setExams(data.exams || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrafts();
  }, [maNguoiDung]);

  const handleSubmitLesson = async (id: number) => {
    try {
      const res = await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/baigiang/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TrangThai: "Chờ duyệt" })
      });
      if (res.ok) {
        alert("Gửi duyệt bài giảng thành công!");
        fetchDrafts();
      } else {
        alert("Gửi duyệt thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối");
    }
  };

  const handleSubmitExercise = async (id: number) => {
    try {
      const res = await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/baitap/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TrangThai: "Chờ duyệt" })
      });
      if (res.ok) {
        alert("Gửi duyệt thành công!");
        fetchDrafts();
      } else {
        alert("Gửi duyệt thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối");
    }
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    message: string;
    subMessage?: string;
    onConfirm?: () => void;
  }>({
    show: false,
    message: ""
  });

  const showConfirm = (message: string, subMessage: string, onConfirm: () => void) => {
    setConfirmDialog({
      show: true,
      message,
      subMessage,
      onConfirm
    });
  };

  const handleDeleteLesson = (lessonId: number) => {
    showConfirm(
      "Xác nhận xóa bản nháp bài giảng",
      "Hành động này sẽ xóa vĩnh viễn bản nháp bài giảng hiện tại.",
      async () => {
        try {
          const res = await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/baigiang/${lessonId}`, {
            method: "DELETE"
          });
          if (res.ok) {
            fetchDrafts();
          }
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  const handleDeleteExercise = (exId: number) => {
    showConfirm(
      "Xác nhận xóa bản nháp bài tập",
      "Hành động này sẽ xóa vĩnh viễn bản nháp bài tập hiện tại.",
      async () => {
        try {
          const res = await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/baitap/${exId}`, {
            method: "DELETE"
          });
          if (res.ok) {
            fetchDrafts();
          }
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  const getFilteredItems = () => {
    if (activeTab === "lessons") {
      return lessons.filter((item) =>
        item.TieuDe.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.TenBuoiHoc && item.TenBuoiHoc.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else if (activeTab === "exercises") {
      return exercises.filter((item) =>
        item.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.TenBuoiHoc && item.TenBuoiHoc.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else {
      return exams.filter((item) =>
        item.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.TenBuoiHoc && item.TenBuoiHoc.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="dm-wrapper">
      <span className="dm-back" onClick={() => navigate("/lessonlist/18")}>
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
        Quay lại
      </span>

      <div className="dm-header">
        <h1>Quản lý bản nháp</h1>
        <p className="dm-subtitle">Nơi lưu trữ và gửi phê duyệt các bản nháp đang làm dở.</p>
      </div>

      <div className="dm-tabs">
        <button
          className={`dm-tab ${activeTab === "lessons" ? "active" : ""}`}
          onClick={() => { setActiveTab("lessons"); setSearchTerm(""); }}
        >
          <FiBookOpen size={16} />
          Bài giảng ({lessons.length})
        </button>
        <button
          className={`dm-tab ${activeTab === "exercises" ? "active" : ""}`}
          onClick={() => { setActiveTab("exercises"); setSearchTerm(""); }}
        >
          <FiCheckSquare size={16} />
          Bài tập ({exercises.length})
        </button>
        <button
          className={`dm-tab ${activeTab === "exams" ? "active" : ""}`}
          onClick={() => { setActiveTab("exams"); setSearchTerm(""); }}
        >
          <FiAward size={16} />
          Bài kiểm tra ({exams.length})
        </button>
      </div>

      <form className="dm-search-container" onSubmit={(e) => e.preventDefault()}>
        <input
          className="dm-search-input"
          placeholder="Tìm kiếm bản nháp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="dm-search-button" type="button">
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

      {loading ? (
        <div className="dm-loading">Đang tải dữ liệu...</div>
      ) : (
        <div className="dm-list">
          {filteredItems.length === 0 ? (
            <div className="dm-empty">Không có bản nháp nào được tìm thấy.</div>
          ) : (
            filteredItems.map((item: any) => {
              const id = item.MaBaiHoc || item.MaBaiTap;
              const title = item.TieuDe || item.Title;
              const typeLabel = item.LoaiBaiHoc || item.Type;
              const extraLabel = item.ThoiLuong ? `Thời lượng: ${item.ThoiLuong}` : `Ngày tạo: ${item.CreatedDate}`;

              return (
                <div key={id} className="dm-card">
                  <div className="dm-card-info">
                    <h3 
                      style={{ cursor: "pointer", color: "#F95800" }}
                      onClick={() => {
                        if (item.MaBaiHoc) {
                          navigate(`/them-bai-giang/${item.MaBuoiHoc || 0}?editDraftId=${id}`);
                        } else {
                          navigate(`/create-exercise/${item.MaBuoiHoc || 0}?editDraftId=${id}`);
                        }
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.textDecoration = "underline";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.textDecoration = "none";
                      }}
                    >
                      {title}
                    </h3>
                    <div className="dm-card-meta">
                      <span className="dm-meta-tag">{typeLabel}</span>
                      <span>{extraLabel}</span>
                      {item.TenKhoaHoc && (
                        <span className="dm-meta-course">
                          {item.TenKhoaHoc} &middot; {item.TenLop} &middot; {item.TenBuoiHoc}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="dm-card-actions">
                    <button
                      className="dm-action-delete"
                      onClick={() => item.MaBaiHoc ? handleDeleteLesson(id) : handleDeleteExercise(id)}
                      title="Xóa bản nháp"
                    >
                      <FiTrash2 size={16} />
                      Xóa
                    </button>
                    <button
                      className="dm-action-view"
                      onClick={() => {
                        if (item.MaBaiHoc) {
                          navigate(`/them-bai-giang/${item.MaBuoiHoc || 0}?editDraftId=${id}`);
                        } else {
                          navigate(`/create-exercise/${item.MaBuoiHoc || 0}?editDraftId=${id}`);
                        }
                      }}
                      style={{
                        background: "#eff6ff",
                        color: "#3b82f6",
                        border: "1px solid #dbeafe",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = "#dbeafe";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = "#eff6ff";
                      }}
                    >
                      <FiEye size={16} />
                      Xem
                    </button>
                    <button
                      className="dm-action-submit"
                      onClick={() => item.MaBaiHoc ? handleSubmitLesson(id) : handleSubmitExercise(id)}
                    >
                      <FiSend size={16} />
                      Gửi duyệt
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {confirmDialog.show && (
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
              Xác nhận xóa
            </h3>
            <p style={{ fontSize: "14px", color: "#475569", margin: confirmDialog.subMessage ? "0 0 8px 0" : "0 0 24px 0", lineHeight: "1.5" }}>
              {confirmDialog.message}
            </p>
            {confirmDialog.subMessage && (
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 24px 0", lineHeight: "1.5" }}>
                {confirmDialog.subMessage}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              <button
                type="button"
                onClick={() => setConfirmDialog(p => ({ ...p, show: false }))}
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
                  setConfirmDialog(p => ({ ...p, show: false }));
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
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
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftsManagement;

