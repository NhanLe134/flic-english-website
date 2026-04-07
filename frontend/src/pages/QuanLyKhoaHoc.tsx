import "./quanlykhoahoc.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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

  /* LẤY KHÓA HỌC TỪ API */
  useEffect(() => {
  // Lấy thông tin GV từ localStorage (sau khi login)
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const maNguoiDung = user.MaNguoiDung;

  fetch(`http://localhost:5000/teacher/courses/${maNguoiDung}`)
    .then(res => res.json())
    .then(data => {
      const mappedCourses = data.map((c: any) => ({
        name: c.TenKhoaHoc,
        code: c.MaKhoaHoc,
        students: c.SoHocVien || 0,
        schedule: "Thứ 2, 4, 6 · 9:00 AM - 10:30 AM",
        progress: Math.floor(Math.random() * 100)
      }));
      setCourses(mappedCourses);
    })
    .catch(err => console.log(err));
}, []);


  /* SEARCH */
  const filteredCourses = courses.filter((course)=>
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="qlkh-wrapper">
      <h1>Khóa học của tôi</h1>
      <p className="sub">
        Quản lý các khóa học bạn đang giảng dạy và theo dõi tiến độ học tập của học viên.
      </p>

      <input
        className="search"
        placeholder="Tìm kiếm khóa học theo tên hoặc mã lớp..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* STATS */}
      <div className="stats">
        <div className="stat-box">
          <p>Tổng số khóa học</p>
          <h3>{filteredCourses.length}</h3>
        </div>
        <div className="stat-box">
          <p>Tổng số học viên</p>
          <h3>{filteredCourses.reduce((t, c) => t + c.students, 0)}</h3>
        </div>
        <div className="stat-box">
          <p>Tiến độ trung bình</p>
          <h3 className="green">
            {filteredCourses.length > 0
              ? Math.round(
                  filteredCourses.reduce((t, c) => t + c.progress, 0) /
                    filteredCourses.length
                )
              : 0}%
          </h3>
        </div>
        <div className="stat-box">
          <p>Cấp độ hiện có</p>
          <h3>4 Levels</h3>
        </div>
      </div>

      {/* COURSES */}
      <div className="courses">
        {filteredCourses.length === 0 ? (
          <p>Không tìm thấy khóa học</p>
        ) : (
          filteredCourses.map((c, i) => (
            <div className="course-card" key={i}>
              <h3>{c.name}</h3>
              <p className="code">{c.code}</p>
              <p className="schedule">📅 {c.schedule}</p>
              <p>👥 {c.students} Học viên</p>
              <p className="progress-text">
                Tiến độ khóa học <span>{c.progress}%</span>
              </p>
              <div className="progress">
                <div className="progress-bar" style={{ width: c.progress + "%" }} />
              </div>
              <button onClick={() => navigate(`/khoa-hoc/${c.code}`, { state: { tenKhoaHoc: c.name } })}>
                📖 Xem chi tiết
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuanLyKhoaHoc;