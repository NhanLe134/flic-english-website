import "./ExerciseDetail.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ChiTietBaiTap from "../../sinhvien/pages/AssignmentDetail/KhungHienThi/ChiTietBaiTap";
import { FiList } from "react-icons/fi";

const normalizeSectionType = (typeStr: string): string => {
  if (!typeStr) return "";
  const s = typeStr.trim().toLowerCase();
  
  if (s.includes("nghe audio") && (s.includes("trac nghiem") || s.includes("tr?c nghi?m") || s.includes("trắc nghiệm"))) {
    return "Nghe audio trắc nghiệm";
  }
  if (s.includes("hình ảnh chọn") || s.includes("hinh anh chon") || s.includes("hnh ?nh ch?n")) {
    return "Hình ảnh chọn đáp án";
  }
  if (s.includes("chép chính tả") || s.includes("chep chinh ta") || s.includes("ch?p chnh t?")) {
    return "Nghe chép chính tả";
  }
  if (s.includes("điền từ") || s.includes("dien tu") || s.includes("di?n t?")) {
    return "Điền từ vào đoạn văn";
  }
  if (s.includes("luyện phát âm") || s.includes("luyen phat am") || s.includes("luy?n pht m") || s.includes("check phát âm") || s.includes("check phat am")) {
    return "Luyện phát âm (check phát âm tự động)";
  }
  if (s.includes("nói theo chủ đề") || s.includes("noi theo chu de") || s.includes("ni theo ch? d?")) {
    return "Nói theo chủ đề (ghi âm nộp GV)";
  }
  if (s.includes("đọc hiểu") || s.includes("doc hieu") || s.includes("d?c hi?u")) {
    return "Trắc nghiệm đọc hiểu (chia đôi màn hình)";
  }
  if (s.includes("nối từ") || s.includes("noi tu") || s.includes("ni t?")) {
    return "Nối từ";
  }
  if (s.includes("sắp xếp từ") || s.includes("sap xep tu") || s.includes("s?p x?p t?")) {
    return "Sắp xếp từ thành câu";
  }
  if (s.includes("tìm lỗi sai") || s.includes("tim loi sai") || s.includes("tm l?i sai")) {
    return "Tìm lỗi sai";
  }
  if (s === "trắc nghiệm" || s === "trac nghiem" || s === "tr?c nghi?m") {
    return "Trắc nghiệm";
  }
  if (s.includes("viết đoạn") || s.includes("viet doan") || s.includes("vi?t do?n")) {
    return "Viết đoạn văn ngắn";
  }
  if (s.includes("sắp xếp câu") || s.includes("sap xep cau") || s.includes("s?p x?p cu")) {
    return "Sắp xếp câu thành đoạn văn";
  }

  if (s.includes("audio")) return "Nghe audio trắc nghiệm";
  if (s.includes("image") || s.includes("ảnh") || s.includes("?nh")) return "Hình ảnh chọn đáp án";
  if (s.includes("dictation") || s.includes("chính tả") || s.includes("chnh t?")) return "Nghe chép chính tả";
  if (s.includes("fill") || s.includes("điền") || s.includes("di?n")) return "Điền từ vào đoạn văn";
  if (s.includes("pronounce") || s.includes("phát âm") || s.includes("pht m")) return "Luyện phát âm (check phát âm tự động)";
  if (s.includes("speaking") || s.includes("nói") || s.includes("ni")) return "Nói theo chủ đề (ghi âm nộp GV)";
  if (s.includes("reading") || s.includes("đọc") || s.includes("d?c")) return "Trắc nghiệm đọc hiểu (chia đôi màn hình)";
  if (s.includes("matching") || s.includes("nối") || s.includes("ni")) return "Nối từ";
  if (s.includes("arrange words") || s.includes("sắp xếp từ")) return "Sắp xếp từ thành câu";
  if (s.includes("mistake") || s.includes("lỗi") || s.includes("l?i")) return "Tìm lỗi sai";
  if (s.includes("mcq") || s.includes("trắc nghiệm")) return "Trắc nghiệm";
  if (s.includes("essay") || s.includes("viết") || s.includes("vi?t")) return "Viết đoạn văn ngắn";
  if (s.includes("arrange sentences") || s.includes("sắp xếp câu")) return "Sắp xếp câu thành đoạn văn";

  return typeStr;
};

const mapDangBaiToType = (db: string): string => {
  if (!db) return "Tổng hợp";
  return normalizeSectionType(db);
};

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5004`
    : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

const ExerciseDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, buoiId, maLop, teacherId } = useParams();
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
      <div className="back" onClick={() => buoiId ? navigate(`/${teacherId}/lophoc/${maLop}/${buoiId}/bt`) : navigate(-1)}>← Quay lại</div>

      <div className="exercise-header">
        <h1>{exercise.Title}</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button 
            className="submissions-btn" 
            onClick={() => navigate(isQTV ? ('/QTV/danh-sach-bai-nop/' + id) : ('/danh-sach-bai-nop/' + id))}
            title="Danh sách bài nộp"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              width: "42px", 
              height: "42px", 
              padding: 0, 
              borderRadius: "50%", 
              boxShadow: "0 4px 12px rgba(249, 88, 0, 0.2)"
            }}
          >
            <FiList size={20} />
          </button>
        </div>
      </div>

      {/* RENDER THE FORM DIRECTLY USING CHITIETBAITAP (PREVIEW MODAL VIEW) */}
      <div className="exercise-detail-card" style={{ padding: 0, border: "none", background: "transparent", boxShadow: "none" }}>
        <ChiTietBaiTap
          overrideExerciseId={Number(id)}
          isPreview={true}
          showAnswers={true}
        />
      </div>
    </div>
  );
};

export default ExerciseDetail;
