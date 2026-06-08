import "./danhSachBaiNop.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const DanhSachBaiNop = () => {
  const navigate = useNavigate();
  const { maExercise } = useParams();

  const [exercise, setExercise] = useState<any>(null);
  const [danhSach, setDanhSach] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  /* ===== LOAD EXERCISE ===== */
  useEffect(() => {
  if (!maExercise) return;

  const id = parseInt(maExercise.trim());

  fetch(`http://localhost:5000/exercise/${id}`)
    .then(res => res.json())
    .then(data => setExercise(data))
    .catch(err => console.log(err));

  fetch(`http://localhost:5000/bainop/exercise/${id}`)
    .then(res => res.json())
    .then(data => setDanhSach(data))
    .catch(err => console.log(err));
}, [maExercise]);

  const filtered = danhSach.filter((b: any) =>
    b.HoTen?.toLowerCase().includes(search.toLowerCase()) ||
    b.MaSinhVien?.toString().includes(search)
  );

  const daCham = danhSach.filter(b => b.TrangThai === "Đã chấm").length;
  const choCham = danhSach.filter(b => b.TrangThai === "Chờ chấm").length;

  return (
    <div className="dsbn-wrapper">

      <div className="back" onClick={() => navigate(-1)}>← Quay lại</div>

      {/* HEADER */}
      <div className="dsbn-header">
        <div>
          <h1>{exercise?.Title || "Đang tải..."}</h1>
          <p>Loại: {exercise?.Type} • Danh sách bài nộp của học viên</p>
        </div>
      </div>

      {/* STATS */}
      <div className="dsbn-stats">
        <div className="dsbn-stat-card">
          <p>Tổng bài nộp</p>
          <h2>{danhSach.length}</h2>
        </div>
        <div className="dsbn-stat-card">
          <p>Đã chấm</p>
          <h2 style={{ color: "#2e7d32" }}>{daCham}</h2>
        </div>
        <div className="dsbn-stat-card">
          <p>Chờ chấm</p>
          <h2 style={{ color: "#f58220" }}>{choCham}</h2>
        </div>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        className="dsbn-search"
        placeholder="Tìm kiếm theo tên hoặc mã sinh viên..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div className="dsbn-table-container">
        <table>
          <thead>
            <tr>
              <th>Mã sinh viên</th>
              <th>Tên sinh viên</th>
              <th>Ngày nộp</th>
              <th>Điểm</th>
              <th>Trạng thái</th>
              <th>Hoạt động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                  Chưa có bài nộp nào
                </td>
              </tr>
            ) : (
              filtered.map((b: any) => (
                <tr key={b.MaBaiNop}>
                  <td>{b.MaSinhVien}</td>
                  <td>{b.HoTen}</td>
                  <td>
                    {b.NgayNop
                      ? new Date(b.NgayNop).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td>
                    {b.Diem !== null && b.Diem !== undefined
                      ? <span style={{ color: "#f58220", fontWeight: 600 }}>{b.Diem}</span>
                      : "—"}
                  </td>
                  <td>
                    <span className={
                      b.TrangThai === "Đã chấm" ? "status-done" : "status-pending"
                    }>
                      {b.TrangThai || "Chờ chấm"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="dsbn-view-btn"
                      onClick={() => navigate(`/cham-bai/${b.MaBaiNop}`)}
                    >
                      {b.TrangThai === "Đã chấm" ? "Xem lại" : "Chấm bài"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default DanhSachBaiNop;