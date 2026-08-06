import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiCheckSquare, FiAward } from "react-icons/fi";
import "./QuanLyBanNhap.css";

// Import các component con
import BanNhapCard from "./components/BanNhapCard";
import XacNhanXoaModal from "./components/XacNhanXoaModal";

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

export default function QuanLyBanNhap() {
  const navigate = useNavigate();
  const { teacherId } = useParams<{ teacherId?: string }>();
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
    fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/teacher/${maNguoiDung}/drafts`)
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
      const res = await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/baigiang/${id}/status`, {
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
      const res = await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/baitap/${id}/status`, {
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
          const res = await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/baigiang/${lessonId}`, {
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
          const res = await fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/baitap/${exId}`, {
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

  const handleView = (id: number, isLesson: boolean, maBuoiHoc: number) => {
    if (isLesson) {
      navigate(`/them-bai-giang/${maBuoiHoc}?editDraftId=${id}`);
    } else {
      navigate(`/create-exercise/${maBuoiHoc}?editDraftId=${id}`);
    }
  };

  return (
    <div className="dm-wrapper">
      <span className="dm-back" onClick={() => {
        const lastClassUrl = sessionStorage.getItem("lastClassUrl") || localStorage.getItem("lastClassUrl");
        const lastClassStateStr = sessionStorage.getItem("lastClassState") || localStorage.getItem("lastClassState");
        const lastClassState = lastClassStateStr ? JSON.parse(lastClassStateStr) : null;
        if (lastClassUrl) {
          navigate(lastClassUrl, { state: lastClassState });
        } else if (teacherId) {
          navigate(`/${teacherId}/lophoc`);
        } else {
          navigate(-1);
        }
      }}>
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
            filteredItems.map((item: any) => (
              <BanNhapCard
                key={item.MaBaiHoc || item.MaBaiTap}
                item={item}
                onDelete={item.MaBaiHoc ? handleDeleteLesson : handleDeleteExercise}
                onSubmit={item.MaBaiHoc ? handleSubmitLesson : handleSubmitExercise}
                onView={handleView}
              />
            ))
          )}
        </div>
      )}

      <XacNhanXoaModal
        show={confirmDialog.show}
        message={confirmDialog.message}
        subMessage={confirmDialog.subMessage}
        onClose={() => setConfirmDialog(p => ({ ...p, show: false }))}
        onConfirm={() => {
          setConfirmDialog(p => ({ ...p, show: false }));
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
        }}
      />
    </div>
  );
}
