import React, { useState, useEffect } from "react";
import { formatScheduleOnlyDays } from "../../../utils/schedule";
import { FiSearch, FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./StudentListQTV.css";

interface LopHoc {
  id: number;
  name: string;
  schedule: string;
  studentsCount: number;
  progress: number;
  lessonCount: number;
  courseId: number;
  courseName: string;
}

interface Student {
  studentId: string;
  MaSinhVien: string;
  MSSV: string | null;
  HoTen: string;
  GioiTinh: string | null;
  NgayGhiDanh: string;
  TrangThai: string;
}

const StudentListQTV: React.FC = () => {
  const API = "http://localhost:5000";

  // Helper to format date safely
  const formatDate = (dateStr: any) => {
    if (!dateStr || dateStr === "—") return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("vi-VN");
    } catch {
      return "—";
    }
  };

  // State
  const [classes, setClasses] = useState<LopHoc[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected class, course, & students
  const [selectedClass, setSelectedClass] = useState<LopHoc | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | string>("");
  const [selectedClassId, setSelectedClassId] = useState<number | string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Student Details Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);

  // Success Notification
  const [showSuccess, setShowSuccess] = useState(false);
  const [successText, setSuccessText] = useState("Xuất Excel thành công");

  const triggerSuccessPopup = (text: string) => {
    setSuccessText(text);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Load classes across all courses
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. Fetch courses
        const coursesRes = await fetch(`${API}/admin/khoahoc`).then(r => r.json());
        setCourses(coursesRes);

        // 2. Fetch classes for each course in parallel
        const classesPromises = coursesRes.map((c: any) => 
          fetch(`${API}/course-detail/${c.MaKhoaHoc}/classes`)
            .then(r => r.json())
            .then(data => {
              const uniqueClasses: Record<number, any> = {};
              data.forEach((cl: any) => {
                if (!uniqueClasses[cl.MaLopHoc]) {
                  uniqueClasses[cl.MaLopHoc] = {
                    id: cl.MaLopHoc,
                    name: cl.TenLop,
                    schedule: formatScheduleOnlyDays(cl.LichHoc) || "—",
                    studentsCount: cl.SoLuongHocVien || 0,
                    progress: cl.TienDo || 0,
                    lessonCount: cl.SoBuoiHoc || 0,
                    courseId: c.MaKhoaHoc,
                    courseName: c.TenKhoaHoc
                  };
                }
              });
              return Object.values(uniqueClasses);
            })
            .catch(() => [])
        );

        const allCourseClasses = await Promise.all(classesPromises);
        const flatClasses = allCourseClasses.flat();
        setClasses(flatClasses);

        if (flatClasses.length > 0) {
          // Sort classes by ID descending to find the latest
          const sorted = [...flatClasses].sort((a, b) => b.id - a.id);
          const latestClass = sorted[0];
          setSelectedClass(latestClass);
          setSelectedCourseId(latestClass.courseId);
          setSelectedClassId(latestClass.id);
          handleSelectClass(latestClass);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách lớp học:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Fetch students when a class is selected
  const handleSelectClass = (cls: LopHoc) => {
    setSelectedClass(cls);
    setLoadingStudents(true);
    setStudentSearchQuery("");
    fetch(`${API}/lophoc/${cls.id}/sinhvien`)
      .then(r => r.json())
      .then(data => {
        setStudents(data.map((s: any) => ({
          studentId: s.MaSinhVien,
          MaSinhVien: s.MaSinhVien,
          MSSV: s.MSSV || null,
          HoTen: s.HoTen,
          GioiTinh: s.GioiTinh || "—",
          NgayGhiDanh: s.NgayGhiDanh || "—",
          TrangThai: s.TrangThai || "Đang học"
        })));
      })
      .catch(err => {
        console.error("Lỗi khi tải học sinh của lớp:", err);
        setStudents([]);
      })
      .finally(() => setLoadingStudents(false));
  };

  // Handle dropdown filters
  const handleCourseChange = (courseId: number) => {
    setSelectedCourseId(courseId);
    const courseClasses = classes.filter(c => c.courseId === courseId);
    if (courseClasses.length > 0) {
      // Pick the first class of this course as default
      const firstClass = courseClasses[0];
      setSelectedClassId(firstClass.id);
      handleSelectClass(firstClass);
    } else {
      setSelectedClass(null);
      setSelectedClassId("");
      setStudents([]);
    }
  };

  const handleClassChange = (classId: number) => {
    setSelectedClassId(classId);
    const cls = classes.find(c => c.id === classId);
    if (cls) {
      handleSelectClass(cls);
    }
  };

  // View individual student details
  const handleViewStudentDetails = (maSinhVien: string) => {
    if (!maSinhVien) return;
    setShowModal(true);
    setModalLoading(true);
    setNicknameInput("");
    fetch(`${API}/students/${maSinhVien.trim()}`)
      .then(res => res.json())
      .then(data => {
        setSelectedStudentDetails(data);
        setNicknameInput(data?.BietDanh || "");
      })
      .catch(err => console.error(err))
      .finally(() => setModalLoading(false));
  };

  // Save Student Nickname
  const handleSaveNickname = async () => {
    if (!selectedStudentDetails) return;
    try {
      setSavingNickname(true);
      const res = await fetch(`${API}/students/${selectedStudentDetails.MaSinhVien}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          HoTen: selectedStudentDetails.HoTen,
          Email: selectedStudentDetails.Email,
          GioiTinh: selectedStudentDetails.GioiTinh,
          NgaySinh: selectedStudentDetails.NgaySinh,
          Lop: selectedStudentDetails.Lop,
          MSSV: selectedStudentDetails.MSSV,
          BietDanh: nicknameInput
        })
      });
      if (res.ok) {
        setSelectedStudentDetails((prev: any) => prev ? { ...prev, BietDanh: nicknameInput } : null);
        triggerSuccessPopup("Cập nhật biệt danh thành công");
        setShowModal(false);
      } else {
        alert("Lỗi khi lưu biệt danh học viên!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi lưu biệt danh!");
    } finally {
      setSavingNickname(false);
    }
  };

  // Export to Excel for selected class
  const handleExportExcel = () => {
    if (!selectedClass || students.length === 0) {
      alert("Không có dữ liệu học viên để xuất!");
      return;
    }

    const exportData = filteredStudents.map((s, index) => ({
      "STT": index + 1,
      "Mã học viên (Hệ thống)": s.MaSinhVien,
      "Mã số sinh viên (Trường)": s.MSSV || "—",
      "Tên học viên": s.HoTen,
      "Giới tính": s.GioiTinh || "—",
      "Ngày ghi danh": formatDate(s.NgayGhiDanh),
      "Trạng thái học tập": s.TrangThai
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Học viên lớp " + selectedClass.name);

    const colWidths = [
      { wch: 6 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 15 }
    ];
    worksheet["!cols"] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `HocVien_${selectedClass.name}_Export.xlsx`);

    triggerSuccessPopup("Xuất Excel thành công");
  };

  // Filter students based on search query
  const filteredStudents = students.filter(s => 
    s.HoTen.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    (s.MSSV && s.MSSV.toLowerCase().includes(studentSearchQuery.toLowerCase())) ||
    s.MaSinhVien.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  return (
    <div className="slqtv-container">
      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="slqtv-success-overlay">
          <div className="slqtv-success-modal">
            <div className="slqtv-check-circle">
              <span style={{ fontSize: 24, color: "#2ecc71" }}>✔</span>
            </div>
            <p style={{ margin: 0, fontWeight: 600, color: "#333", fontSize: 13.5 }}>{successText}</p>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE DETAILS MODAL */}
      {showModal && (
        <div className="slqtv-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="slqtv-modal-card" onClick={e => e.stopPropagation()}>
            <button className="slqtv-modal-close" onClick={() => setShowModal(false)}>×</button>
            <h3 className="slqtv-modal-title">Thông tin chi tiết học viên</h3>
            
            {modalLoading ? (
              <div style={{ textAlign: "center", padding: "24px", color: "#667085" }}>Đang tải thông tin...</div>
            ) : selectedStudentDetails ? (
              <div className="slqtv-modal-body">
                <div className="slqtv-modal-row">
                  <span className="slqtv-label">Mã học viên:</span>
                  <span className="slqtv-val">{selectedStudentDetails.MaSinhVien}</span>
                </div>
                <div className="slqtv-modal-row">
                  <span className="slqtv-label">MSSV (Trường):</span>
                  <span className="slqtv-val">{selectedStudentDetails.MSSV || "—"}</span>
                </div>
                <div className="slqtv-modal-row">
                  <span className="slqtv-label">Họ và tên:</span>
                  <span className="slqtv-val">{selectedStudentDetails.HoTen}</span>
                </div>
                <div className="slqtv-modal-row">
                  <span className="slqtv-label">Giới tính:</span>
                  <span className="slqtv-val">{selectedStudentDetails.GioiTinh || "—"}</span>
                </div>
                <div className="slqtv-modal-row">
                  <span className="slqtv-label">Ngày sinh:</span>
                  <span className="slqtv-val">
                    {formatDate(selectedStudentDetails.NgaySinh)}
                  </span>
                </div>
                <div className="slqtv-modal-row">
                  <span className="slqtv-label">Email:</span>
                  <span className="slqtv-val">{selectedStudentDetails.Email || "—"}</span>
                </div>
                <div className="slqtv-modal-row">
                  <span className="slqtv-label">Biệt danh:</span>
                  <input
                    type="text"
                    className="slqtv-input-nickname"
                    value={nicknameInput}
                    onChange={e => setNicknameInput(e.target.value)}
                    placeholder="Chưa có biệt danh"
                    disabled={savingNickname}
                  />
                </div>
                <div className="slqtv-modal-row">
                  <span className="slqtv-label">Lớp học hiện tại:</span>
                  <span className="slqtv-val">{selectedStudentDetails.Lop || "—"}</span>
                </div>
                <div className="slqtv-modal-row">
                  <span className="slqtv-label">Khóa học đăng ký:</span>
                  <span className="slqtv-val">{selectedStudentDetails.TenKhoaHoc || "—"}</span>
                </div>
                <div className="slqtv-modal-footer">
                  <button className="slqtv-btn-close" onClick={() => setShowModal(false)} disabled={savingNickname}>Đóng</button>
                  <button className="slqtv-btn-save" onClick={handleSaveNickname} disabled={savingNickname}>
                    {savingNickname ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px", color: "#d92d20" }}>Không thể tải thông tin học viên.</div>
            )}
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div>
        <div className="slqtv-header">
          <div className="slqtv-header-text">
            <h1>Danh Sách Học Viên</h1>
            <p>Quản lý và tra cứu thông tin học viên của các lớp tại trung tâm</p>
          </div>
          
          <div className="slqtv-stats">
            <div className="slqtv-stat-card">
              <span className="slqtv-stat-num">{classes.length}</span>
              <span className="slqtv-stat-name">Tổng lớp học</span>
            </div>
            <div className="slqtv-stat-card">
              <span className="slqtv-stat-num">{classes.reduce((acc, c) => acc + c.studentsCount, 0)}</span>
              <span className="slqtv-stat-name">Tổng lượt học viên</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 32px 32px 32px" }}>
          {/* Search bar & Filters */}
          <div className="slqtv-filters-row-new">
            <div className="slqtv-search-wrapper-new">
              <FiSearch className="slqtv-search-icon" />
              <input
                type="text"
                placeholder="Tìm tên, mã học viên..."
                value={studentSearchQuery}
                onChange={e => setStudentSearchQuery(e.target.value)}
              />
            </div>

            <div className="slqtv-selectors-group">
              <div className="slqtv-select-wrapper">
                <span className="slqtv-select-label">Khóa:</span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(Number(e.target.value))}
                  className="slqtv-filter-select"
                >
                  <option value="" disabled>Chọn khóa học</option>
                  {courses.map(c => (
                    <option key={c.MaKhoaHoc} value={c.MaKhoaHoc}>
                      {c.TenKhoaHoc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="slqtv-select-wrapper">
                <span className="slqtv-select-label">Lớp:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(Number(e.target.value))}
                  className="slqtv-filter-select"
                  disabled={!selectedCourseId}
                >
                  <option value="" disabled>Chọn lớp học</option>
                  {classes
                    .filter(c => c.courseId === selectedCourseId)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {selectedClass && (
                <button className="slqtv-btn-export-new" onClick={handleExportExcel}>
                  <FiDownload style={{ marginRight: 6, fontSize: 14 }} />
                  <span>Xuất Excel</span>
                </button>
              )}
            </div>
          </div>

          <hr className="slqtv-divider-line" />

          <div className="slqtv-student-list-view">
            {loading ? (
              <div className="slqtv-loading" style={{ padding: "60px 0" }}>Đang tải dữ liệu...</div>
            ) : selectedClass ? (
              <>


                {/* Students table */}
                <div className="slqtv-table-wrapper">
                  {loadingStudents ? (
                    <div className="slqtv-loading" style={{ padding: "60px 0" }}>Đang tải danh sách học viên...</div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="slqtv-empty" style={{ padding: "60px 0" }}>Lớp chưa có học viên nào ghi danh hoặc không khớp tìm kiếm.</div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: 60, textAlign: "center" }}>STT</th>
                          <th>Mã học viên</th>
                          <th>MSSV (Trường)</th>
                          <th style={{ width: 280 }}>Họ tên</th>
                          <th>Giới tính</th>
                          <th>Ngày ghi danh</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((s, idx) => (
                          <tr key={s.studentId} onClick={() => handleViewStudentDetails(s.studentId)} style={{ cursor: "pointer" }}>
                            <td style={{ textAlign: "center", color: "#666", fontWeight: 600 }}>{idx + 1}</td>
                            <td className="slqtv-code-cell">{s.studentId}</td>
                            <td className="slqtv-code-cell">{s.MSSV || "—"}</td>
                            <td>
                              <span className="slqtv-student-name">{s.HoTen}</span>
                            </td>
                            <td>
                              {s.GioiTinh === "Nam" ? (
                                <span className="slqtv-gender-badge male">Nam</span>
                              ) : s.GioiTinh === "Nữ" ? (
                                <span className="slqtv-gender-badge female">Nữ</span>
                              ) : (
                                <span className="slqtv-gender-badge other">—</span>
                              )}
                            </td>
                            <td>{formatDate(s.NgayGhiDanh)}</td>
                            <td>
                              <span className={`slqtv-status-badge ${s.TrangThai === "Đang học" ? "active" : ""}`}>
                                {s.TrangThai}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            ) : (
              <div className="slqtv-empty" style={{ padding: "60px 0" }}>
                Chưa có lớp học nào được chọn hoặc không tìm thấy dữ liệu.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentListQTV;
