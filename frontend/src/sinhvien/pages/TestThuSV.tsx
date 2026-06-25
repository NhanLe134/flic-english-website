import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiClock } from "react-icons/fi";
import "./TestThuSV.css";

interface BaiTest {
  MaBaiTest: number;
  TieuDe: string;
  MoTa: string;
  TongThoiGian: number;
  CapDo: string;
  LoaiBai: string;
  NgayTao: string;
  TrangThai: string;
}

const STATIC_TESTS = [
  {
    MaBaiTest: 1,
    TieuDe: "VSTEP B1 - Đề thi mẫu số 1",
    MoTa: "Đề thi thử VSTEP trình độ B1 bao gồm đầy đủ 4 kỹ năng: Nghe, Đọc, Viết và Nói.",
    TongThoiGian: 177,
    CapDo: "B1",
    LoaiBai: "VSTEP",
    NgayTao: "2026-01-10T00:00:00.000Z",
    TrangThai: "published"
  },
  {
    MaBaiTest: 2,
    TieuDe: "VSTEP B2 - Đề thi mẫu số 2",
    MoTa: "Đề thi thử VSTEP trình độ B2 với câu hỏi nâng cao hơn cho cả 4 kỹ năng.",
    TongThoiGian: 177,
    CapDo: "B2",
    LoaiBai: "VSTEP",
    NgayTao: "2026-02-15T00:00:00.000Z",
    TrangThai: "published"
  },
  {
    MaBaiTest: 3,
    TieuDe: "TOEIC Practice Test - Full Exam",
    MoTa: "Đề thi thử TOEIC đầy đủ với phần Listening và Reading chuẩn format quốc tế.",
    TongThoiGian: 120,
    CapDo: "Intermediate",
    LoaiBai: "TOEIC",
    NgayTao: "2026-03-01T00:00:00.000Z",
    TrangThai: "published"
  }
];

export default function TestThuSV() {
  const [tests, setTests] = useState<BaiTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!sessionStorage.getItem("user");
  const homePath = isLoggedIn ? "/profile" : "/";

  useEffect(() => {
    if ((location.state as any)?.submitted) setSubmitted(true);
    
    const API = "http://localhost:5000";
    setLoading(true);

    fetch(`${API}/dethi`)
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi tải đề thi");
        return res.json();
      })
      .then((data) => {
        // Chỉ lấy các đề thi có TrangThaiDuyet là "Đã duyệt"
        const approvedData = data.filter(
          (t: any) => t.TrangThaiDuyet === "Đã duyệt"
        );

        const mappedTests = approvedData.map((t: any) => {
          let parsedKyNang = {};
          try {
            parsedKyNang = typeof t.NoiDungDeThi === "string" 
              ? JSON.parse(t.NoiDungDeThi) 
              : t.NoiDungDeThi;
          } catch (e) {
            console.error("Lỗi parse NoiDungDeThi cho đề:", t.MaDeThi, e);
          }

          // Đảm bảo có thoiGian cho từng kỹ năng để trang làm bài chạy đúng
          const kyNang = parsedKyNang as any;
          if (kyNang) {
            if (kyNang.listening && !kyNang.listening.thoiGian) kyNang.listening.thoiGian = 45 * 60;
            if (kyNang.reading && !kyNang.reading.thoiGian) kyNang.reading.thoiGian = 60 * 60;
            if (kyNang.writing && !kyNang.writing.thoiGian) kyNang.writing.thoiGian = 60 * 60;
            if (kyNang.speaking && !kyNang.speaking.thoiGian) kyNang.speaking.thoiGian = 12 * 60;
          }

          return {
            MaBaiTest: t.MaDeThi,
            TieuDe: t.TieuDe,
            MoTa: t.MoTa || "",
            TongThoiGian: t.ThoiGian,
            CapDo: t.CapDo || "",
            LoaiBai: t.LoaiBai || "",
            NgayTao: t.NgayTao,
            TrangThai: t.TrangThai,
            kyNang: kyNang
          };
        });

        setTests(mappedTests);
        localStorage.setItem("flic_student_practice_tests", JSON.stringify(mappedTests));
      })
      .catch((err) => {
        console.error("Lỗi khi fetch danh sách đề thi từ backend:", err);
        // Fallback to localStorage
        let localTests = localStorage.getItem("flic_student_practice_tests");
        if (localTests) {
          try {
            setTests(JSON.parse(localTests));
          } catch (e) {
            setTests(STATIC_TESTS);
          }
        } else {
          setTests(STATIC_TESTS);
        }
      })
      .finally(() => setLoading(false));
  }, [location]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
  };

  return (
    <div className="test-thu-container">
      {/* Breadcrumb */}
      <nav className="courses-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', marginTop: '24px', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
        <Link to={homePath} style={{ color: '#777777', textDecoration: 'none', fontWeight: 500 }}>Trang chủ</Link>
        <span style={{ color: '#bbbbbb', fontSize: '14px', userSelect: 'none' }}>›</span>
        <span style={{ color: '#777777', fontWeight: 500 }}>Học & thi thử</span>
        <span style={{ color: '#bbbbbb', fontSize: '14px', userSelect: 'none' }}>›</span>
        <span style={{ color: '#F95800', fontWeight: 600 }}>Làm bài test</span>
      </nav>

      {/* Submitted success banner (No checkmark emoji, clean green color style) */}
      {submitted && (
        <div className="submit-success-banner">
          <div>
            <div className="banner-title">Nộp bài thành công!</div>
            <div className="banner-desc">Bài thi của bạn đã được ghi nhận. Kết quả sẽ được thông báo sau.</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="test-header">
        <div>
          <h1>LÀM BÀI TEST</h1>
          <p>Chọn đề thi để bắt đầu làm bài thi thử.</p>
        </div>
      </div>



      {/* Test list */}
      {loading ? (
        <div className="test-loading-box">
          <div className="test-spinner" />
          <div>Đang tải danh sách đề thi...</div>
        </div>
      ) : (
        <div className="test-list-grid">
          {tests.map(test => (
            <div key={test.MaBaiTest} className="test-item-card">
              <div className="test-item-info">
                <h3 className="test-item-title">{test.TieuDe}</h3>
                <p className="test-item-desc">{test.MoTa}</p>
                <div className="test-item-meta">
                  <span className="meta-time">
                    <FiClock style={{ marginRight: 4 }} /> Thời gian: {formatTime(test.TongThoiGian)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/test-exam/${test.MaBaiTest}`)}
                className="test-item-btn"
              >
                Vào thi
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
