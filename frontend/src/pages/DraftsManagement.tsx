import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiCheckSquare, FiAward, FiTrash2, FiSend } from "react-icons/fi";
import "./draftsManagement.css";

interface DraftLesson {
  MaBaiHoc: number;
  TieuDe: string;
  LoaiBaiHoc: string;
  ThoiLuong: string;
  TrangThai: string;
  TenLesson: string;
  TenLop: string;
  TenKhoaHoc: string;
}

interface DraftExercise {
  MaExercise: number;
  Title: string;
  Type: string;
  CreatedDate: string;
  TrangThai: string;
  TenLesson: string;
  TenLop: string;
  TenKhoaHoc: string;
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
    fetch(`http://localhost:5000/teacher/${maNguoiDung}/drafts`)
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
      const res = await fetch(`http://localhost:5000/baigiang/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TrangThai: "pending" })
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
      const res = await fetch(`http://localhost:5000/exercise/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TrangThai: "pending" })
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

  const handleDeleteLesson = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản nháp bài giảng này không?")) return;
    try {
      const res = await fetch(`http://localhost:5000/baigiang/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Đã xóa bản nháp bài giảng!");
        fetchDrafts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExercise = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản nháp này không?")) return;
    try {
      const res = await fetch(`http://localhost:5000/exercises/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Đã xóa bản nháp!");
        fetchDrafts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getFilteredItems = () => {
    if (activeTab === "lessons") {
      return lessons.filter((item) =>
        item.TieuDe.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.TenLesson && item.TenLesson.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else if (activeTab === "exercises") {
      return exercises.filter((item) =>
        item.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.TenLesson && item.TenLesson.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else {
      return exams.filter((item) =>
        item.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.TenLesson && item.TenLesson.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="dm-wrapper">
      <span className="dm-back" onClick={() => navigate(-1)}>
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
              const id = item.MaBaiHoc || item.MaExercise;
              const title = item.TieuDe || item.Title;
              const typeLabel = item.LoaiBaiHoc || item.Type;
              const extraLabel = item.ThoiLuong ? `Thời lượng: ${item.ThoiLuong}` : `Ngày tạo: ${item.CreatedDate}`;

              return (
                <div key={id} className="dm-card">
                  <div className="dm-card-info">
                    <h3>{title}</h3>
                    <div className="dm-card-meta">
                      <span className="dm-meta-tag">{typeLabel}</span>
                      <span>{extraLabel}</span>
                      {item.TenKhoaHoc && (
                        <span className="dm-meta-course">
                          {item.TenKhoaHoc} &middot; {item.TenLop} &middot; {item.TenLesson}
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
    </div>
  );
};

export default DraftsManagement;
