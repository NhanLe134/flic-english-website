// @ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import { formatScheduleOnlyDays } from "../../../utils/schedule";
import { FiSearch, FiDownload, FiFileText } from "react-icons/fi";
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
  BietDanh?: string | null;
  GioiTinh: string | null;
  NgayGhiDanh: string;
  TrangThai: string;
}

const StudentListQTV: React.FC = () => {
  const API =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") ||
    window.location.hostname.startsWith("10.")
      ? `http://${window.location.hostname}:5004`
      : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

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

  // Tab State
  const [activeTab, setActiveTab] = useState<'enrolled' | 'pending'>('enrolled');
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);

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

  // Pending registration requests states & logic
  interface PendingReg {
    id: number;
    studentId: string;
    name: string;
    phone: string;
    courseId: number;
    courseName: string;
    regDate: string;
    status: 'Chờ ghi danh' | 'Đã ghi danh' | 'Từ chối';
    classId?: number;
    className?: string;
  }

  const [pendingRegs, setPendingRegs] = useState<PendingReg[]>([]);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showAssignClassModal, setShowAssignClassModal] = useState(false);
  const [selectedReg, setSelectedReg] = useState<PendingReg | null>(null);
  const [assignClassId, setAssignClassId] = useState<number | ''>('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRegId, setRejectRegId] = useState<number | null>(null);
  const [showCancelEnrollModal, setShowCancelEnrollModal] = useState(false);
  const [regClassFilter, setRegClassFilter] = useState<string>('all');

  const uniqueRegClasses = useMemo(() => {
    const list: { id: string | number; name: string }[] = [];
    pendingRegs.forEach(r => {
      if (r.classId && r.className && !list.find(x => x.id === r.classId)) {
        list.push({ id: r.classId, name: r.className });
      }
    });
    return list;
  }, [pendingRegs]);

  const loadPendingRegs = () => {
    fetch(`${API}/dangky/pending?t=${Date.now()}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPendingRegs(data.map((r: any) => ({
            id: r.MaDangKy, studentId: r.MaSinhVien, name: r.HoTen,
            phone: '—', courseId: r.MaKhoaHoc, courseName: r.TenKhoaHoc,
            regDate: new Date(r.NgayDangKy).toLocaleDateString('vi-VN'),
            status: (r.TrangThai === 'Đã ghi danh' ? 'Đã ghi danh' : r.TrangThai === 'Từ chối' ? 'Từ chối' : 'Chờ ghi danh') as 'Chờ ghi danh' | 'Đã ghi danh' | 'Từ chối',
            classId: r.MaLopHoc,
            className: r.TenLop
          })));
        }
      })
      .catch(() => {});
  };

  const loadEnrolledStudents = () => {
    setLoadingEnrolled(true);
    fetch(`${API}/qtv/students/enrolled`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEnrolledStudents(data.map((s: any) => ({
            studentId: s.MaSinhVien,
            MSSV: s.MSSV || null,
            HoTen: s.HoTen,
            BietDanh: s.BietDanh || null,
            GioiTinh: s.GioiTinh || "—",
            NgayGhiDanh: s.NgayGhiDanh || "—",
            TrangThai: s.TrangThai || "Đang học",
            classId: s.MaLopHoc,
            className: s.TenLop,
            courseId: s.MaKhoaHoc,
            courseName: s.TenKhoaHoc
          })));
        } else {
          setEnrolledStudents([]);
        }
      })
      .catch(err => {
        console.error("Lỗi khi tải danh sách học viên ghi danh:", err);
        setEnrolledStudents([]);
      })
      .finally(() => setLoadingEnrolled(false));
  };

  const handleRemoveEnrolled = async (studentId: string, classId: number, studentName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy ghi danh học viên ${studentName} khỏi lớp học này?`)) {
      try {
        const res = await fetch(`${API}/qtv/lophoc/${classId}/ghidanh/${studentId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          triggerSuccessPopup(`Đã hủy ghi danh ${studentName}!`);
          loadEnrolledStudents();
          loadPendingRegs();
        } else {
          alert('Lỗi khi hủy ghi danh');
        }
      } catch {
        alert('Lỗi khi hủy ghi danh');
      }
    }
  };

  const confirmAssign = async () => {
    if (!selectedReg || !assignClassId) { alert('Vui lòng chọn lớp!'); return }
    try {
      const res = await fetch(`${API}/qtv/lophoc/${assignClassId}/ghidanh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MaSinhVien: selectedReg.studentId })
      })
      const data = await res.json()
      if (res.ok && data.message && data.message.includes("thành công")) {
        setShowAssignClassModal(false); setSelectedReg(null); setAssignClassId('')
        triggerSuccessPopup(`Đã ghi danh ${selectedReg.name}!`)
        loadPendingRegs();
        loadEnrolledStudents();
      } else {
        alert(data.message || 'Lỗi khi ghi danh')
      }
    } catch { alert('Lỗi khi ghi danh') }
  }

  const rejectReg = (id: number) => {
    setRejectRegId(id);
    setShowRejectModal(true);
  };

  const confirmRejectReg = () => {
    if (rejectRegId === null) return;
    const id = rejectRegId;
    setShowRejectModal(false);
    setRejectRegId(null);

    fetch(`${API}/dangky/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ TrangThai: 'Từ chối' })
    })
    .then(res => {
      if (res.ok) {
        setPendingRegs(prev => prev.map(r => r.id === id ? { ...r, status: 'Từ chối' as const } : r));
        triggerSuccessPopup('Đã từ chối!');
        loadPendingRegs();
      } else {
        alert('Lỗi khi từ chối đăng ký');
      }
    })
    .catch(() => {
      alert('Lỗi khi từ chối đăng ký');
    });
  };

  // Load classes across all courses
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. Fetch courses
        const coursesData = await fetch(`${API}/admin/khoahoc`).then(r => r.json());
        const coursesRes = Array.isArray(coursesData) ? coursesData.filter((c: any) => c.TrangThai === 'Hiển thị') : [];
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
    loadPendingRegs();
    loadEnrolledStudents();
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
          BietDanh: s.BietDanh || null,
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

  const confirmCancelEnroll = async () => {
    if (!selectedStudentDetails || !selectedClassId) return;
    const maSinhVien = selectedStudentDetails.MaSinhVien;
    const classId = selectedClassId;
    
    try {
      const res = await fetch(`${API}/qtv/lophoc/${classId}/ghidanh/${maSinhVien}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setShowCancelEnrollModal(false);
        setShowModal(false);
        triggerSuccessPopup("Đã hủy ghi danh thành công!");
        if (selectedClass) {
          handleSelectClass(selectedClass);
        }
      } else {
        alert(data.message || "Lỗi khi hủy ghi danh");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối");
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
      "Biệt danh": s.BietDanh || "—",
      "Giới tính": s.GioiTinh || "—",
      "Ngày ghi danh": formatDate(s.NgayGhiDanh),
      "Trạng thái học tập": s.TrangThai
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Học viên lớp " + selectedClass.name);

    const colWidths = [
      { wch: 6 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 15 }
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
                <div className="slqtv-modal-footer" style={{ justifyContent: selectedClassId ? "space-between" : "flex-end" }}>
                  {selectedClassId && (
                    <button 
                      type="button"
                      onClick={() => setShowCancelEnrollModal(true)}
                      disabled={savingNickname}
                      style={{
                        padding: "7px 14px",
                        background: "white",
                        border: "1.5px solid #dc2626",
                        color: "#dc2626",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "12.5px",
                        transition: "all 0.15s ease",
                        opacity: savingNickname ? 0.6 : 1
                      }}
                      onMouseOver={e => {
                        if (!savingNickname) e.currentTarget.style.background = "#fef2f2";
                      }}
                      onMouseOut={e => {
                        if (!savingNickname) e.currentTarget.style.background = "white";
                      }}
                    >
                      Hủy ghi danh
                    </button>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="slqtv-btn-close" onClick={() => setShowModal(false)} disabled={savingNickname}>Đóng</button>
                    <button className="slqtv-btn-save" onClick={handleSaveNickname} disabled={savingNickname}>
                      {savingNickname ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px", color: "#d92d20" }}>Không thể tải thông tin học viên.</div>
            )}
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
        <div className="slqtv-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
          <div className="slqtv-header-text">
            <h1>Danh Sách Học Viên</h1>
            <p style={{ margin: '4px 0 12px 0' }}>Quản lý và tra cứu thông tin học viên của các lớp tại trung tâm</p>
          </div>
          
          {(() => {
            const pendingRegCount = pendingRegs.filter(r => r.status === 'Chờ ghi danh').length;
            return pendingRegCount > 0 ? (
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: '#fef2f2', 
                  border: '1.5px solid #fca5a5', 
                  borderRadius: '20px', 
                  padding: '6px 16px', 
                  color: '#dc2626', 
                  fontSize: '13.5px', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
                  transition: 'transform 0.15s ease'
                }} 
                onClick={() => setShowRegModal(true)}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span 
                  style={{ 
                    display: 'inline-block', 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#dc2626',
                    animation: 'slqtv-red-dot-blink 1.2s infinite' 
                  }}
                ></span>
                <style>{`
                  @keyframes slqtv-red-dot-blink {
                    0% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                    100% { opacity: 0.3; transform: scale(0.8); }
                  }
                `}</style>
                <span>Yêu cầu ghi danh chờ duyệt: <strong style={{ fontSize: '15px', color: '#b91c1c' }}>{pendingRegCount}</strong></span>
              </div>
            ) : (
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: '#f8fafc', 
                  border: '1.5px solid #cbd5e1', 
                  borderRadius: '20px', 
                  padding: '6px 16px', 
                  color: '#475569', 
                  fontSize: '13.5px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }} 
                onClick={() => setShowRegModal(true)}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }}></span>
                <span>Không có yêu cầu ghi danh chờ duyệt</span>
              </div>
            );
          })()}
        </div>

        <div>
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

              <button 
                className="slqtv-btn-export-new" 
                onClick={() => setShowRegModal(true)}
                style={{
                  background: '#f97316',
                  color: 'white',
                  borderColor: '#f97316',
                  gap: '6px'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#ea580c'}
                onMouseOut={e => e.currentTarget.style.background = '#f97316'}
              >
                <FiFileText style={{ fontSize: 14 }} />
                <span>Đăng ký ({pendingRegs.filter(r => r.status === 'Chờ ghi danh').length})</span>
              </button>
              {selectedClass && (
                <button className="slqtv-btn-export-new" onClick={handleExportExcel} style={{ gap: '6px' }}>
                  <FiDownload style={{ fontSize: 14 }} />
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
                          <th style={{ width: 220 }}>Họ tên</th>
                          <th style={{ width: 120 }}>Biệt danh</th>
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
                            <td>{s.BietDanh || "—"}</td>
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

      {/* ════ MODAL: DANH SÁCH GHI DANH ĐĂNG KÝ LỚP ════ */}
      {showRegModal && !showAssignClassModal && (
        <div className="slqtv-modal-overlay" onClick={() => setShowRegModal(false)}>
          <div className="slqtv-modal-card" style={{ maxWidth: '1150px', width: '96vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 className="slqtv-modal-title" style={{ border: "none", marginBottom: 0, paddingBottom: 0 }}>
                  Danh sách ghi danh đăng ký lớp
                </h2>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Sinh viên đã đăng ký – chờ ghi danh vào lớp</div>
              </div>
              <button className="slqtv-modal-close" onClick={() => setShowRegModal(false)} style={{ top: '20px', right: '20px' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <select 
                value={regClassFilter} 
                onChange={e => setRegClassFilter(e.target.value)} 
                style={{
                  padding: '8px 12px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '220px'
                }}
              >
                <option value="all">Tất cả lớp học</option>
                {uniqueRegClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>Chờ: {pendingRegs.filter(r => r.status === 'Chờ ghi danh').length}</span>
                <span style={{ background: '#c8eacc', color: '#1e6b30', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>Đã GD: {pendingRegs.filter(r => r.status === 'Đã ghi danh').length}</span>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#f8fafc', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Mã học viên</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Họ và tên</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>SĐT</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Lớp/Khóa</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Ngày ĐK</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Trạng thái</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRegs.filter(r => regClassFilter === 'all' || String(r.classId) === regClassFilter || r.className === regClassFilter).map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#475569' }}>{r.studentId}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>{r.name}</td>
                      <td style={{ padding: '12px 14px' }}>{r.phone}</td>
                      <td style={{ padding: '12px 14px' }}>{r.className ? `${r.className} / ${r.courseName}` : r.courseName}</td>
                      <td style={{ padding: '12px 14px' }}>{r.regDate}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ 
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: r.status === 'Chờ ghi danh' ? '#fef3c7' : r.status === 'Đã ghi danh' ? '#c8eacc' : '#fee2e2',
                          color: r.status === 'Chờ ghi danh' ? '#b45309' : r.status === 'Đã ghi danh' ? '#166534' : '#991b1b'
                        }}>{r.status}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {r.status === 'Chờ ghi danh' && (
                            <>
                              <button 
                                style={{ background: '#F95800', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => { setSelectedReg(r); setAssignClassId(r.classId || ''); setShowAssignClassModal(true) }}
                              >
                                GD vào lớp
                              </button>
                              <button 
                                style={{ background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }} 
                                onClick={() => rejectReg(r.id)}
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                          {r.status === 'Đã ghi danh' && (
                            <button 
                              style={{ background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                              onClick={() => handleRemoveEnrolled(r.studentId, r.classId, r.name)}
                            >
                              Hủy GD
                            </button>
                          )}
                          {r.status !== 'Chờ ghi danh' && r.status !== 'Đã ghi danh' && <span style={{ fontSize: '12px', color: '#aaa' }}>—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              <button 
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }} 
                onClick={() => setShowRegModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: GHI DANH VÀO LỚP ════ */}
      {showAssignClassModal && selectedReg && (
        <div className="slqtv-modal-overlay" onClick={() => { setShowAssignClassModal(false); setSelectedReg(null) }}>
          <div className="slqtv-modal-card" style={{ maxWidth: '480px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 className="slqtv-modal-title" style={{ border: "none", marginBottom: 0, paddingBottom: 0 }}>
                  Ghi danh vào lớp học
                </h2>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Chọn lớp phù hợp</div>
              </div>
              <button className="slqtv-modal-close" onClick={() => { setShowAssignClassModal(false); setSelectedReg(null) }} style={{ top: '20px', right: '20px' }}>&times;</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Họ và tên:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedReg.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Mã SV:</span>
                <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>{selectedReg.studentId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Khóa học:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedReg.courseName}</span>
              </div>
            </div>

            {selectedReg.className ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginBottom: '20px' }}>
                <span style={{ color: '#64748b' }}>Lớp học:</span>
                <span style={{ fontWeight: 600, color: '#d97706' }}>{selectedReg.className}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Chọn lớp học <span style={{ color: '#dc2626' }}>*</span></label>
                <select 
                  value={assignClassId} 
                  onChange={e => setAssignClassId(Number(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.filter(cl => cl.courseId === selectedReg.courseId).map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.name} — {cl.schedule} — {cl.studentsCount} học viên</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }} 
                onClick={() => { setShowAssignClassModal(false); setSelectedReg(null) }}
              >
                Hủy
              </button>
              <button 
                style={{ background: '#F95800', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: assignClassId ? 1 : 0.5 }} 
                onClick={confirmAssign}
                disabled={!assignClassId}
              >
                Ghi danh vào lớp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: TỪ CHỐI GHI DANH ════ */}
      {showRejectModal && (
        <div className="slqtv-modal-overlay" onClick={() => { setShowRejectModal(false); setRejectRegId(null); }}>
          <div className="slqtv-modal-card" style={{ maxWidth: '440px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="slqtv-modal-title" style={{ border: "none", marginBottom: 0, paddingBottom: 0 }}>
                Từ chối ghi danh
              </h2>
              <button className="slqtv-modal-close" onClick={() => { setShowRejectModal(false); setRejectRegId(null); }} style={{ top: '20px', right: '20px' }}>&times;</button>
            </div>
            
            <div style={{ padding: "8px 0 20px 0" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#1e293b", lineHeight: "1.5" }}>
                Bạn có chắc chắn muốn từ chối đăng ký học của học viên này không?
              </p>
              <p style={{ margin: "0", fontSize: "13px", color: "#dc2626", background: "#fef2f2", padding: "10px 12px", borderRadius: "6px", border: "1px solid #fee2e2", lineHeight: "1.5" }}>
                <strong>Lưu ý:</strong> Hành động này không thể khôi phục và học viên sẽ nhận trạng thái "Từ chối" cho lớp học đăng ký này.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }} 
                onClick={() => { setShowRejectModal(false); setRejectRegId(null); }}
              >
                Hủy bỏ
              </button>
              <button 
                style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }} 
                onClick={confirmRejectReg}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: XÁC NHẬN HỦY GHI DANH ════ */}
      {showCancelEnrollModal && (
        <div className="slqtv-modal-overlay" onClick={() => setShowCancelEnrollModal(false)}>
          <div className="slqtv-modal-card" style={{ maxWidth: '440px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="slqtv-modal-title" style={{ border: "none", marginBottom: 0, paddingBottom: 0, color: "#dc2626" }}>
                Xác nhận hủy ghi danh
              </h2>
              <button className="slqtv-modal-close" onClick={() => setShowCancelEnrollModal(false)} style={{ top: '20px', right: '20px' }}>&times;</button>
            </div>
            
            <div style={{ padding: "8px 0 20px 0" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#1e293b", lineHeight: "1.5" }}>
                Bạn có chắc chắn muốn hủy ghi danh học viên <strong>{selectedStudentDetails?.HoTen}</strong> ra khỏi lớp <strong>{selectedStudentDetails?.Lop}</strong> không?
              </p>
              <p style={{ margin: "0", fontSize: "13px", color: "#dc2626", background: "#fef2f2", padding: "10px 12px", borderRadius: "6px", border: "1px solid #fee2e2", lineHeight: "1.5" }}>
                <strong>Lưu ý:</strong> Hành động này sẽ xóa vĩnh viễn học viên khỏi lớp học hiện tại. Tất cả lịch sử làm bài tập và điểm số của học viên trong lớp này sẽ bị ảnh hưởng.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }} 
                onClick={() => setShowCancelEnrollModal(false)}
              >
                Hủy bỏ
              </button>
              <button 
                style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }} 
                onClick={confirmCancelEnroll}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentListQTV;
