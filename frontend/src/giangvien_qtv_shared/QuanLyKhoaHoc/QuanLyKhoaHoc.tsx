import "./QuanLyKhoaHoc.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiBookOpen, FiUsers, FiCheckSquare } from "react-icons/fi";

interface Course {
  name: string;
  code: string;
  students: number;
  schedule: string;
  progress: number;
}

const QuanLyKhoaHoc = () => {
  const navigate = useNavigate();
  const [search,setSearch] = useState("");
  const [courses,setCourses] = useState<Course[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  /* LẤY KHÓA HỌC TỪ API */
  useEffect(() => {
    // Lấy thông tin GV từ localStorage (sau khi login)
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    fetch(`http://14.225.192.252:5000/teacher/courses/${maNguoiDung}`)
      .then(res => res.json())
      .then(data => {
        const mappedCourses = data.map((c: any) => ({
          name: c.TenKhoaHoc,
          code: c.MaKhoaHoc,
          students: c.SoHocVien || 0,
          schedule: "Thứ 2, 4, 6 ",
          progress: Math.floor(Math.random() * 100)
        }));
        setCourses(mappedCourses);
      })
      .catch(err => console.log(err));

    // Lấy số lượng bài tập cần duyệt
    fetch("http://14.225.192.252:5000/teacher/submissions/pending-count")
      .then(res => res.json())
      .then(data => setPendingCount(data.count))
      .catch(err => console.log(err));
  }, []);


  /* SEARCH */
  const filteredCourses = courses.filter((course)=>
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="qlkh-wrapper">
      <div className="qlkh-content-card">
        <h1>Khóa học của tôi</h1>

        {/* STATS */}
        <div className="stats">
          <div className="stat-box courses-stat">
            <div className="stat-icon-wrapper">
              <FiBookOpen size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Khóa học</span>
              <h3 className="stat-value">{filteredCourses.length}</h3>
              <span className="stat-desc">Tổng số khóa học</span>
            </div>
          </div>
          <div className="stat-box students-stat">
            <div className="stat-icon-wrapper">
              <FiUsers size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Sinh viên</span>
              <h3 className="stat-value">{filteredCourses.reduce((t, c) => t + c.students, 0)}</h3>
              <span className="stat-desc">Học viên hoạt động</span>
            </div>
          </div>
          <div className="stat-box pending-stat">
            <div className="stat-icon-wrapper">
              <FiCheckSquare size={20} />
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
            placeholder="Tìm kiếm khóa học..."
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

        {/* COURSES */}
        <div className="courses">
          {filteredCourses.length === 0 ? (
            <p>Không tìm thấy khóa học</p>
          ) : (
            filteredCourses.map((c, i) => (
              <div className="course-card" key={i}>
                <div className="course-card-header">
                  <span className="course-index-tag">Khóa {i + 1}</span>
                  <span className="course-code-tag">{c.code}</span>
                </div>
                <h3>{c.name}</h3>
                <p className="schedule">{c.schedule}</p>
                <p className="students-count">{c.students} Học viên</p>
                <button
                  className="detail-button"
                  onClick={() => navigate(`/khoa-hoc/${c.code}`, { state: { tenKhoaHoc: c.name } })}
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
