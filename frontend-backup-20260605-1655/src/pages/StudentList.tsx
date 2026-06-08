import "./studentList.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [lopFilter, setLopFilter] = useState(""); // lọc theo lớp
  const [loading, setLoading] = useState(true);

  const studentsPerPage = 10;

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    if (!maNguoiDung) { setLoading(false); return; }

    fetch(`http://localhost:5000/teacher/students/${maNguoiDung}`)
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  // Danh sách lớp để filter
  const danhSachLop = [...new Set(students.map(s => s.Lop).filter(Boolean))]

  const filteredStudents = students.filter((student: any) => {
    const matchSearch =
      student.HoTen?.toLowerCase().includes(search.toLowerCase()) ||
      student.MaSinhVien?.toLowerCase().includes(search.toLowerCase()) ||
      student.Lop?.toLowerCase().includes(search.toLowerCase()) ||
      student.TenKhoaHoc?.toLowerCase().includes(search.toLowerCase())

    const matchLop = !lopFilter || student.Lop === lopFilter

    return matchSearch && matchLop
  });

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage) || 1;
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  /* ===== EXPORT EXCEL ===== */
  const handleExport = () => {
    if (filteredStudents.length === 0) { alert("Không có học viên nào để xuất!"); return; }

    const exportData = filteredStudents.map((s, index) => ({
      "STT": index + 1,
      "Mã sinh viên": s.MaSinhVien,
      "Tên sinh viên": s.HoTen,
      "Giới tính": s.GioiTinh || "—",
      "Khóa học": s.TenKhoaHoc || "—",
      "Lớp": s.Lop || "—",
      "Ngày ghi danh": s.NgayGhiDanh ? new Date(s.NgayGhiDanh).toLocaleDateString("vi-VN") : "—",
      "Trạng thái": s.TrangThai || "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách học viên");

    const colWidths = [
      { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 10 },
      { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 12 },
    ];
    worksheet["!cols"] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `DanhSachHocVien_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "-")}.xlsx`);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="sl-wrapper">

      <div className="header-row">
        <h1>Danh sách học viên</h1>
        <p style={{ color: "#888", fontSize: 14, marginTop: 4 }}>
          Học viên trong các lớp bạn phụ trách
        </p>
      </div>

      {/* Search + Filter */}
      <div className="search-bar" style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          placeholder="Tìm kiếm học viên..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          style={{ flex: 1 }}
        />
        <select
          value={lopFilter}
          onChange={e => { setLopFilter(e.target.value); setCurrentPage(1); }}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
        >
          <option value="">Tất cả lớp</option>
          {danhSachLop.map(lop => (
            <option key={lop} value={lop}>{lop}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "#e8f5e9", borderRadius: 8, padding: "10px 20px", fontSize: 13 }}>
          <span style={{ color: "#555" }}>Tổng học viên: </span>
          <strong style={{ color: "#2e7d32" }}>{filteredStudents.length}</strong>
        </div>
        <div style={{ background: "#e3f2fd", borderRadius: 8, padding: "10px 20px", fontSize: 13 }}>
          <span style={{ color: "#555" }}>Số lớp: </span>
          <strong style={{ color: "#1565c0" }}>{danhSachLop.length}</strong>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Đang tải...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã sinh viên</th>
                <th>Tên sinh viên</th>
                <th>Giới tính</th>
                <th>Khóa học</th>
                <th>Lớp</th>
                <th>Ngày ghi danh</th>
                <th>Trạng thái</th>
                <th>Hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                    {loading ? "Đang tải..." : "Không có học viên nào"}
                  </td>
                </tr>
              ) : (
                currentStudents.map((student: any, index: number) => (
                  <tr key={index}>
                    <td>{student.MaSinhVien}</td>
                    <td>{student.HoTen}</td>
                    <td>{student.GioiTinh || "—"}</td>
                    <td>{student.TenKhoaHoc || "—"}</td>
                    <td>
                      <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>
                        {student.Lop || "—"}
                      </span>
                    </td>
                    <td>{student.NgayGhiDanh ? new Date(student.NgayGhiDanh).toLocaleDateString("vi-VN") : "—"}</td>
                    <td>
                      <span style={{
                        background: student.TrangThai === "Đang học" ? "#e8f5e9" : "#f5f5f5",
                        color: student.TrangThai === "Đang học" ? "#2e7d32" : "#666",
                        padding: "2px 8px", borderRadius: 6, fontSize: 12
                      }}>
                        {student.TrangThai || "—"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/xem-hoc-vien/${student.MaSinhVien}`)}
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
          <button className="export-btn" onClick={handleExport}>⬇ Export Excel</button>
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>◀</button>
            <span>Trang {currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>▶</button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="check-circle">
              <span style={{ fontSize: 28, color: "#2ecc71" }}>✔</span>
            </div>
            <p>Đã tải file thành công</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentList;