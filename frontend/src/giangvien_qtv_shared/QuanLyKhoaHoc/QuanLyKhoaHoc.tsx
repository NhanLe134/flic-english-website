import "./QuanLyKhoaHoc.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { formatScheduleOnlyDays } from "../../utils/schedule";


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
  const { teacherId } = useParams<{ teacherId: string }>();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const teacherIdStr = teacherId || `teacher${user.MaNguoiDung || ""}`;

  const [search, setSearch] = useState("");
  const [classes, setClasses] = useState<ClassItem[]>([]);


  /* LẤY LỚP HỌC TỪ API */
  useEffect(() => {
    // Lấy thông tin GV từ localStorage (sau khi login)
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/teacher/classes/${maNguoiDung}`)
      .then(res => res.json())
      .then(data => {
        const mappedClasses = data.map((c: any) => ({
          id: c.MaLopHoc,
          name: c.TenLop,
          code: `${c.MaLopHoc}`,
          schedule: formatScheduleOnlyDays(c.LichHoc) || '—',
          courseName: c.TenKhoaHoc || '',
          students: c.SoLuongHocVien || 0,
          progress: c.TienDo || 0
        }));
        setClasses(mappedClasses);
      })
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
                <p className="students-count">{c.courseName}</p>
                <button
                  className="detail-button"
                  onClick={() => navigate(`/${teacherIdStr}/lophoc/${c.id}`, { state: { tenKhoaHoc: c.courseName, tenLop: c.name } })}
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

