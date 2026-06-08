import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ketQuaHocTapHocVien.css";

const API = "http://localhost:5000";

const KetQuaHocTapHocVien = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id này là MaSinhVien lấy từ URL
  const location = useLocation();
  
  // Lấy lessonId từ state truyền sang, nếu không có mặc định là 1
  const lessonId = location.state?.lessonId || 1;

  const [student, setStudent] = useState<any>(null);
  const [baiNops, setBaiNops] = useState<any[]>([]);
  const [tienDo, setTienDo] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!id) return;
  setLoading(true);

  Promise.all([
    fetch(`${API}/students/${id}`).then((r) => r.json()),
    fetch(`${API}/students/${id}/tiendo/${lessonId}`).then((r) => r.json()),
  ])
    .then(([svData, tienDoData]) => {
      setStudent(svData);
      setTienDo(tienDoData?.TienDo || 0);

      // Sửa ở đây: dùng MaNguoiDung thay vì id
      const maNguoiDung = svData?.MaNguoiDung;
      return fetch(`${API}/student/bainop/${maNguoiDung}?lessonId=${lessonId}`).then((r) => r.json());
    })
    .then((nopData) => {
      setBaiNops(Array.isArray(nopData) ? nopData : []);
    })
    .catch((err) => {
      console.error("Lỗi khi tải dữ liệu:", err);
    })
    .finally(() => setLoading(false));
}, [id, lessonId]);

  // Logic tính toán điểm trung bình
  const baiCoDiem = baiNops.filter((b) => b.Diem !== null && b.Diem !== undefined);
  
  const diemTrungBinh = baiCoDiem.length > 0
    ? (baiCoDiem.reduce((sum, b) => sum + Number(b.Diem), 0) / baiCoDiem.length).toFixed(1)
    : "—";

  if (loading) return <div className="loading-state">Đang tải dữ liệu học viên...</div>;
  if (!student) return <div className="error-state">Không tìm thấy thông tin học viên.</div>;

  return (
    <div className="kq-wrapper">
      <div className="ketqua-page-header">
        <h1>Xem kết quả học tập</h1>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      <div className="ketqua-card">
        {/* Thông tin sinh viên */}
        <div className="student-header">
          <div className="avatar">👤</div>
          <div>
            <h3>{student.HoTen || "N/A"}</h3>
            <p className="student-id">{student.MaSinhVien}</p>
            <span className={`badge ${tienDo === 100 ? "finished" : "learning"}`}>
              {tienDo === 100 ? "Hoàn thành" : tienDo > 0 ? "Đang học" : "Chưa học"}
            </span>
          </div>
        </div>

        <hr />

        {/* Thống kê nhanh (Stats) */}
        <h3 className="section-title">Kết quả học tập</h3>
        <div className="ketqua-stats">
          <div className="stat-box">
            <p>Điểm trung bình</p>
            <h2 className="avg-score">{diemTrungBinh}</h2>
          </div>
          <div className="stat-box">
            <p>Tiến độ lesson</p>
            <h2 className="attend-score">{tienDo}%</h2>
          </div>
          <div className="stat-box">
            <p>Số bài đã nộp</p>
            <h2>{baiNops.length}</h2>
          </div>
          <div className="stat-box">
            <p>Đã chấm điểm</p>
            <h2>{baiCoDiem.length}</h2>
          </div>
        </div>

        <hr />

        {/* Danh sách chi tiết bài tập */}
        <h3 className="section-title">Điểm các bài tập</h3>
        <div className="test-list">
          {baiNops.length === 0 ? (
            <p className="empty-msg">Chưa có bài tập nào được nộp</p>
          ) : (
            baiNops.map((item, i) => (
              <div key={i} className="test-item">
                <div className="test-info">
                  <div className="test-name">{item.TenBaiTap || `Bài tập số ${i + 1}`}</div>
                  <div className="test-date">
                    Ngày nộp: {item.NgayNop ? new Date(item.NgayNop).toLocaleDateString("vi-VN") : "—"}
                  </div>
                  <div className="status-tag">
                    <span className={item.Diem !== null ? "graded" : "waiting"}>
                      {item.Diem !== null ? "Đã chấm" : "Chờ chấm"}
                    </span>
                  </div>
                </div>
                <div className={`score-circle ${
                  item.Diem === null ? "pending" : Number(item.Diem) >= 5 ? "pass" : "fail"
                }`}>
                  {item.Diem !== null ? item.Diem : "—"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default KetQuaHocTapHocVien;