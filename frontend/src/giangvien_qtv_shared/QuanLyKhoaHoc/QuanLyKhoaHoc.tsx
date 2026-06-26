import "./QuanLyKhoaHoc.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiBookOpen, FiUsers, FiCheckSquare } from "react-icons/fi";

interface ClassItem {
  id: number;
  name: string;
  code: string;
  schedule: string;
  courseName: string;
  students: number;
  progress: number;
}

const QuanLyKhoaHoc = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  /* LẤY LỚP HỌC TỪ API */
  useEffect(() => {
    // Lấy thông tin GV từ localStorage (sau khi login)
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    fetch(`http://localhost:5000/teacher/classes/${maNguoiDung}`)
      .then(res => res.json())
      .then(data => {
        const mappedClasses = data.map((c: any) => ({
          id: c.MaLopHoc,
          name: c.TenLop,
          code: `CT-${c.MaLopHoc}`,
          schedule: c.LichHoc || '—',
          courseName: c.TenKhoaHoc || '',
          students: c.SoLuongHocVien || 0,
          progress: c.TienDo || 0
        }));
        setClasses(mappedClasses);
      })
      .catch(err => console.log(err));

    // Lấy số lượng bài tập cần duyệt
    fetch("http://localhost:5000/teacher/submissions/pending-count")
      .then(res => res.json())
      .then(data => setPendingCount(data.count))
      .catch(err => console.log(err));
  }, []);

  /* SEARCH */
  const filteredClasses = classes.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.code.toLowerCase().includes(search.toLowerCase()) ||
    item.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="qlkh-wrapper">
      <div className="qlkh-content-card">
        <h1 style={{ color: "#F95800" }}>Lớp học của tôi</h1>

        {/* STATS */}
        <div className="stats">
          <div className="stat-box courses-stat">
            <div className="stat-icon-wrapper">
              <FiBookOpen size={16} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Lớp học</span>
              <h3 className="stat-value">{filteredClasses.length}</h3>
              <span className="stat-desc">Tổng số lớp học</span>
            </div>
          </div>
          <div className="stat-box students-stat">
            <div className="stat-icon-wrapper">
              <FiUsers size={16} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Sinh viên</span>
              <h3 className="stat-value">{filteredClasses.reduce((t, c) => t + c.students, 0)}</h3>
              <span className="stat-desc">Học viên hoạt động</span>
            </div>
          </div>
          <div className="stat-box pending-stat">
            <div className="stat-icon-wrapper">
              <FiCheckSquare size={16} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Bài tập</span>
              <h3 className="stat-value">{pendingCount} bài</h3>
              <span className="stat-desc">Bài tập cần duyệt</span>
            </div>
          </div>
        </div>

        {/* SEARCH CONTAINER - PREVENT SUBMIT/RELOAD */}
        <form className="search-container" onSubmit={(e) => e.preventDefault()}>
          <input
            className="search-input"
            placeholder="Tìm kiếm lớp học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="search-button" type="button">
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

        {/* CLASSES */}
        <div className="courses">
          {filteredClasses.length === 0 ? (
            <p>Không tìm thấy lớp học</p>
          ) : (
            filteredClasses.map((c, i) => (
              <div className="course-card" key={i}>
                <div className="course-card-header">
                  <span className="course-index-tag">Lớp {i + 1}</span>
                  <span className="course-code-tag">{c.code}</span>
                </div>
                <h3>{c.name}</h3>
                <p className="schedule">{(c.schedule || '—').replace(/,?\s*\d{1,2}:\d{2}-\d{1,2}:\d{2}/g, '')}</p>
                <p className="students-count">Khóa: {c.courseName}</p>
                <button
                  className="detail-button"
                  onClick={() => navigate(`/lessonlist/${c.id}`, { state: { tenKhoaHoc: c.courseName, tenLop: c.name } })}
                >
                  Xem chi tiết
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuanLyKhoaHoc;

