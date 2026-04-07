import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./chitietketqua.css";

const ChiTietKetQua = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id = MaLesson

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [lessonInfo, setLessonInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const rowsPerPage = 10;

  useEffect(() => {
    if (!id) return;

    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    Promise.all([
      fetch(`http://localhost:5000/lesson/${id}`).then(r => r.json()),
      fetch(`http://localhost:5000/lesson/${id}/students/${maNguoiDung}`).then(r => r.json())
    ])
      .then(([lessonData, studentData]) => {
        setLessonInfo(lessonData);
        setStudents(Array.isArray(studentData) ? studentData : []);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [id]);

  const filteredStudents = students.filter((sv: any) =>
    sv.HoTen?.toLowerCase().includes(search.toLowerCase()) ||
    sv.MaSinhVien?.toString().toLowerCase().includes(search.toLowerCase())
  );

  const indexOfFirst = (currentPage - 1) * rowsPerPage;
  const indexOfLast = currentPage * rowsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage) || 1;

  const exportCSV = () => {
    const headers = ["Mã sinh viên", "Tên sinh viên", "Tiến độ (%)", "Số bài đã làm", "Điểm trung bình", "Trạng thái"];
    const rows = filteredStudents.map((s: any) => [
      s.MaSinhVien, s.HoTen,
      s.TienDo || 0, s.SoBaiDaLam || 0,
      s.DiemTrungBinh || "—", s.TrangThai || "Chưa học"
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ketqua_lesson_${id}.csv`;
    link.click();
  };

  const getStatusClass = (trangThai: string) => {
    if (trangThai === "Hoàn thành") return "status-done";
    return "status-pending";
  };

  // Stats
  const doneCount     = students.filter(s => s.TrangThai === "Hoàn thành").length
  const inProgressCount = students.filter(s => s.TrangThai === "Đang học").length
  const avgDiem = students.length > 0
    ? (students.reduce((sum, s) => sum + (s.DiemTrungBinh || 0), 0) / students.filter(s => s.DiemTrungBinh).length || 0).toFixed(1)
    : "—"

  return (
    <div className="ctq-wrapper">

      <div className="lesson-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Quay lại</button>
        <div className="lesson-title">
          <h1>{loading ? "Đang tải..." : lessonInfo?.TenLesson || "—"}</h1>
          <h2>{lessonInfo?.MoTa || ""}</h2>
        </div>
        <div style={{ width: 90 }} />
      </div>

      {/* Mini stats */}
      {!loading && (
        <div style={{ display:"flex", gap:12, marginBottom:16 }}>
          <div style={{ background:"#e8f5e9", borderRadius:8, padding:"10px 20px", fontSize:13 }}>
            <span style={{ color:"#555" }}>Tổng học viên: </span>
            <strong style={{ color:"#2e7d32" }}>{students.length}</strong>
          </div>
          <div style={{ background:"#e3f2fd", borderRadius:8, padding:"10px 20px", fontSize:13 }}>
            <span style={{ color:"#555" }}>Hoàn thành: </span>
            <strong style={{ color:"#1565c0" }}>{doneCount}</strong>
          </div>
          <div style={{ background:"#fff8e1", borderRadius:8, padding:"10px 20px", fontSize:13 }}>
            <span style={{ color:"#555" }}>Đang học: </span>
            <strong style={{ color:"#f57c00" }}>{inProgressCount}</strong>
          </div>
          <div style={{ background:"#fce4ec", borderRadius:8, padding:"10px 20px", fontSize:13 }}>
            <span style={{ color:"#555" }}>Điểm TB: </span>
            <strong style={{ color:"#c62828" }}>{avgDiem}</strong>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          <button>🔍</button>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:"#999" }}>Đang tải...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã sinh viên</th>
                <th>Tên sinh viên</th>
                <th>Tiến độ (%)</th>
                <th>Số bài đã làm</th>
                <th>Điểm trung bình</th>
                <th>Trạng thái</th>
                <th>Hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign:"center", padding:"20px", color:"#999" }}>
                    Không có học viên nào
                  </td>
                </tr>
              ) : (
                currentStudents.map((sv: any, index: number) => (
                  <tr key={index}>
                    <td>{sv.MaSinhVien}</td>
                    <td>{sv.HoTen}</td>
                    <td>{sv.TienDo || 0}%</td>
                    <td>{sv.SoBaiDaLam || 0}</td>
                    <td>{sv.DiemTrungBinh || "—"}</td>
                    <td>
                      <span className={getStatusClass(sv.TrangThai)}>
                        {sv.TrangThai || "Chưa học"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/xem-ket-qua/${sv.MaSinhVien}`, {
                          state: { lessonId: id }
                        })}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        <div className="table-footer">
          <button
            className="export-btn"
            onClick={() => { exportCSV(); setShowPopup(true); setTimeout(() => setShowPopup(false), 2000); }}
          >
            ⬇ Export
          </button>
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>◀</button>
            <span>{indexOfFirst + 1} – {Math.min(indexOfLast, filteredStudents.length)} / {filteredStudents.length}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>▶</button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="check-icon">✓</div>
            <p>Đã tải file thành công</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChiTietKetQua;