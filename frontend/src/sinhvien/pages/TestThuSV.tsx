import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiClock, FiAlertTriangle } from "react-icons/fi";
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

export default function TestThuSV() {
  const [tests, setTests] = useState<BaiTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if ((location.state as any)?.submitted) setSubmitted(true);
    fetch("http://localhost:5000/tests")
      .then(r => r.json())
      .then(data => { setTests(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [location]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
  };

  return (
    <div className="test-thu-container">
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

      {/* Info banner */}
      <div className="test-info-banner">
        <div className="info-banner-title">
          <FiAlertTriangle style={{ marginRight: 6 }} /> LƯU Ý QUAN TRỌNG
        </div>
        <ul className="info-banner-list">
          <li>Hết thời gian từng phần sẽ tự động chuyển sang phần tiếp theo.</li>
          <li>Không được quay lại các kỹ năng đã hoàn thành.</li>
          <li>Sau khi hoàn thành mỗi phần phải nhấn "LƯU BÀI" để lưu thủ công.</li>
          <li>Phần Listening & Reading: cấm dùng bàn phím và click ngoài vùng thi.</li>
        </ul>
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
