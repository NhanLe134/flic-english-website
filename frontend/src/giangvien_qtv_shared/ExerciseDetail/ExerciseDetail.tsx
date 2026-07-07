import "./ExerciseDetail.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ChiTietBaiTap from "../../sinhvien/pages/AssignmentDetail/KhungHienThi/ChiTietBaiTap";

const mapDangBaiToType = (db: string): string => {
  if (!db) return "Tổng hợp";
  const dbClean = db.trim();
  if (dbClean === "Nghe audio trắc nghiệm") return "Nghe audio trắc nghiệm";
  if (dbClean === "Hình ảnh chọn đáp án") return "Hình ảnh chọn đáp án";
  if (dbClean === "Nghe chép chính tả") return "Nghe chép chính tả";
  if (dbClean === "Điền từ vào đoạn văn") return "Điền từ vào đoạn văn";
  if (dbClean === "Luyện phát âm (check phát âm tự động)") return "Luyện phát âm (check phát âm tự động)";
  if (dbClean === "Nói theo chủ đề (ghi âm nộp GV)") return "Nói theo chủ đề (ghi âm nộp GV)";
  if (dbClean === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") return "Trắc nghiệm đọc hiểu (chia đôi màn hình)";
  if (dbClean === "Bài tập từ vựng" || dbClean === "Nối từ") return "Nối từ";
  if (dbClean === "Sắp xếp từ thành câu") return "Sắp xếp từ thành câu";
  if (dbClean === "Tìm lỗi sai") return "Tìm lỗi sai";
  if (dbClean === "Trắc nghiệm xác định thì" || dbClean === "Trắc nghiệm") return "Trắc nghiệm";
  if (dbClean === "Viết đoạn văn ngắn") return "Viết đoạn văn ngắn";
  if (dbClean === "Sắp xếp câu thành đoạn văn") return "Sắp xếp câu thành đoạn văn";
  return dbClean;
};

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5000`
    : "http://14.225.192.252:5000";

const ExerciseDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isQTV = location.pathname.includes("/QTV");

  const [exercise, setExercise] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/baitap/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.Type) {
          data.Type = mapDangBaiToType(data.Type);
        }
        setExercise(data);
      })
      .catch(console.log);
  }, [id]);

  if (!exercise) return <p style={{ padding: 20 }}>Đang tải dữ liệu...</p>;

  return (
    <div className="ed-wrapper" style={isQTV ? { maxWidth: "1200px", margin: "0 auto", padding: "24px 32px 32px 32px", boxSizing: "border-box" } : undefined}>
      <div className="back" onClick={() => navigate(-1)}>← Quay lại</div>

      {/* TITLE BAR */}
      <div className="exercise-header">
        <h1>{exercise.Title}</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="submissions-btn" onClick={() => navigate(isQTV ? ('/QTV/danh-sach-bai-nop/' + id) : ('/danh-sach-bai-nop/' + id))}>
            Danh sách bài nộp
          </button>
        </div>
      </div>

      {/* RENDER THE FORM DIRECTLY USING CHITIETBAITAP (PREVIEW MODAL VIEW) */}
      <div className="exercise-detail-card" style={{ padding: 0, border: "none", background: "transparent" }}>
        <ChiTietBaiTap
          overrideExerciseId={Number(id)}
          isPreview={true}
        />
      </div>
    </div>
  );
};

export default ExerciseDetail;
