import "./StudentList.css";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const StudentList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [lopFilter, setLopFilter] = useState(""); // lọc theo lớp
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleViewStudent = (maSinhVien: string) => {
    if (!maSinhVien) return;
    const trimmedId = maSinhVien.trim();
    setShowModal(true);
    setModalLoading(true);
    fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/students/${trimmedId}`)
      .then(res => res.json())
      .then(data => {
        setSelectedStudentDetails(data);
      })
      .catch(err => console.error(err))
      .finally(() => setModalLoading(false));
  };

  const studentsPerPage = 10;

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    if (!maNguoiDung) { setLoading(false); return; }

    fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/teacher/students/${maNguoiDung}`)
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
      "Mã học viên (Hệ thống)": s.MaSinhVien,
      "Mã số sinh viên (Trường)": s.MSSV || "—",
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
      { wch: 5 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 10 },
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

      <div className="sl-header-row">
        <h1>Danh sách học viên</h1>
      </div>

      {/* Search + Filter */}
      <div className="sl-search-filter-row">
        <form className="sl-search-container" onSubmit={(e) => e.preventDefault()}>
          <input
            className="sl-search-input"
            type="text"
            placeholder="Tìm theo tên hoặc mã sinh viên"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          <button className="sl-search-button" type="button">
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

        <select
          className="sl-select-filter"
          value={lopFilter}
          onChange={e => { setLopFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Tất cả lớp</option>
          {danhSachLop.map(lop => (
            <option key={lop} value={lop}>{lop}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="sl-stats-row">
        <div className="sl-stat-card">
          <span className="sl-stat-label">Tổng học viên:</span>
          <span className="sl-stat-value">{filteredStudents.length}</span>
        </div>
        <div className="sl-stat-card">
          <span className="sl-stat-label">Số lớp:</span>
          <span className="sl-stat-value">{danhSachLop.length}</span>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Đang tải...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã học viên</th>
                <th>MSSV (Trường)</th>
                <th>Tên sinh viên</th>
                <th>Giới tính</th>
                <th>Khóa học</th>
                <th>Lớp</th>
                <th>Ngày ghi danh</th>
                <th>Trạng thái</th>
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
                  <tr key={index} onClick={() => handleViewStudent(student.MaSinhVien)}>
                    <td>{student.MaSinhVien ? student.MaSinhVien.trim() : ""}</td>
                    <td>{student.MSSV ? student.MSSV.trim() : "—"}</td>
                    <td>{student.HoTen}</td>
                    <td>{student.GioiTinh || "—"}</td>
                    <td>{student.TenKhoaHoc || "—"}</td>
                    <td>
                      <span className="sl-class-tag">
                        {student.Lop || "—"}
                      </span>
                    </td>
                    <td>{student.NgayGhiDanh ? new Date(student.NgayGhiDanh).toLocaleDateString("vi-VN") : "—"}</td>
                    <td>
                      <span className={`sl-status-tag ${student.TrangThai === "Đang học" ? "active" : ""}`}>
                        {student.TrangThai || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        <div className="table-footer">
          <button className="export-btn" onClick={handleExport}>Xuất Excel</button>
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

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                border: 'none',
                background: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#667085'
              }}
            >
              ×
            </button>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700, color: '#101828' }}>
              Thông tin cá nhân học viên
            </h3>
            {modalLoading ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#667085' }}>Đang tải thông tin...</div>
            ) : selectedStudentDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #f2f4f7', paddingBottom: '8px' }}>
                  <span style={{ width: '130px', fontWeight: 600, color: '#344054' }}>Mã học viên:</span>
                  <span style={{ color: '#475467' }}>{selectedStudentDetails.MaSinhVien}</span>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #f2f4f7', paddingBottom: '8px' }}>
                  <span style={{ width: '130px', fontWeight: 600, color: '#344054' }}>MSSV (Trường):</span>
                  <span style={{ color: '#475467' }}>{selectedStudentDetails.MSSV || "—"}</span>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #f2f4f7', paddingBottom: '8px' }}>
                  <span style={{ width: '130px', fontWeight: 600, color: '#344054' }}>Họ và tên:</span>
                  <span style={{ color: '#475467' }}>{selectedStudentDetails.HoTen}</span>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #f2f4f7', paddingBottom: '8px' }}>
                  <span style={{ width: '130px', fontWeight: 600, color: '#344054' }}>Giới tính:</span>
                  <span style={{ color: '#475467' }}>{selectedStudentDetails.GioiTinh || "—"}</span>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #f2f4f7', paddingBottom: '8px' }}>
                  <span style={{ width: '130px', fontWeight: 600, color: '#344054' }}>Ngày sinh:</span>
                  <span style={{ color: '#475467' }}>
                    {selectedStudentDetails.NgaySinh ? new Date(selectedStudentDetails.NgaySinh).toLocaleDateString("vi-VN") : "—"}
                  </span>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #f2f4f7', paddingBottom: '8px' }}>
                  <span style={{ width: '130px', fontWeight: 600, color: '#344054' }}>Email:</span>
                  <span style={{ color: '#475467' }}>{selectedStudentDetails.Email || "—"}</span>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #f2f4f7', paddingBottom: '8px' }}>
                  <span style={{ width: '130px', fontWeight: 600, color: '#344054' }}>Lớp:</span>
                  <span style={{ color: '#475467' }}>{selectedStudentDetails.Lop || "—"}</span>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #f2f4f7', paddingBottom: '8px' }}>
                  <span style={{ width: '130px', fontWeight: 600, color: '#344054' }}>Khóa học:</span>
                  <span style={{ color: '#475467' }}>{selectedStudentDetails.TenKhoaHoc || "—"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button 
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '8px 16px',
                      background: '#f2f4f7',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: '#344054'
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: '#d92d20' }}>Không thể tải thông tin học viên.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentList;

