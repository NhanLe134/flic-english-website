import "./CourseDetail.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { formatScheduleOnlyDays } from "../../utils/schedule";
import {
  FiBookOpen,
  FiUsers,
  FiCheckSquare,
  FiArrowLeft
} from "react-icons/fi";

interface ClassItem {
  id: number;
  name: string;
  code: string;
  schedule: string;
  students: number;
  progress: number;
}

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const tenKhoaHoc = location.state?.tenKhoaHoc || "Chi tiết khóa học";

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    fetch(`http://14.225.192.252:5000/course-detail/${id}/classes/${maNguoiDung}`)
      .then((res) => res.json())
      .then(async (data) => {
        const mapped = await Promise.all(
          data.map(async (c: any) => {
            let soLuong = 0;
            try {
              const res = await fetch(`http://14.225.192.252:5000/lophoc/${c.MaLopHoc}/students/count`);
              const json = await res.json();
              soLuong = json?.SoLuongHocVien ?? 0;
            } catch (_) { }

            return {
              id: c.MaLopHoc,
              name: c.TenLop,
              code: `${c.MaLopHoc}`,
              schedule: c.LichHoc,
              students: soLuong,
              progress: c.TienDo || 0,
            };
          })
        );
        setClasses(mapped);
      })
      .catch((err) => console.log(err));

    fetch("http://14.225.192.252:5000/teacher/submissions/pending-count")
      .then(res => res.json())
      .then(data => setPendingCount(data.count))
      .catch(err => console.log(err));
  }, [id]);

  const filteredClasses = classes.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="cd-wrapper">
      <span className="cd-back" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Quay lại
      </span>

      {/* HEADER ROW */}
      <div className="cd-header">
        <div>
          <h1 className="cd-title">{tenKhoaHoc}</h1>
        </div>
      </div>

      {/* STATS CARD */}
      <div className="cd-stats">
        <div className="cd-stat-card classes-card">
          <div className="stat-icon-wrapper">
            <FiBookOpen size={16} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Lớp học</span>
            <h3 className="stat-value">{filteredClasses.length} lớp</h3>
            <span className="stat-desc">Tổng số lớp học</span>
          </div>
        </div>

        <div className="cd-stat-card students-card">
          <div className="stat-icon-wrapper">
            <FiUsers size={16} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Học viên</span>
            <h3 className="stat-value">{filteredClasses.reduce((t, c) => t + c.students, 0)} HV</h3>
            <span className="stat-desc">Tổng số học viên</span>
          </div>
        </div>

        <div className="cd-stat-card pending-card">
          <div className="stat-icon-wrapper">
            <FiCheckSquare size={16} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Chấm bài</span>
            <h3 className="stat-value">{pendingCount} bài nộp</h3>
            <span className="stat-desc">Số bài nộp chưa chấm</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        {/* SEARCH CONTAINER - PREVENT SUBMIT/RELOAD */}
        <form className="search-container" onSubmit={(e) => e.preventDefault()}>
          <input
            className="search-input"
            placeholder="Tìm kiếm lớp học theo tên hoặc mã lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* CLASS LIST */}
        <div className="cd-class-list">
          {filteredClasses.length === 0 ? (
            <p>Không tìm thấy lớp học</p>
          ) : (
            filteredClasses.map((item, i) => (
              <div key={item.id} className="cd-class-card">
                <div className="cd-card-header">
                  <span className="cd-index-tag">Lớp {i + 1}</span>
                  <span className="cd-code-tag">{item.code}</span>
                </div>
                <h3>{item.name}</h3>
                <p className="cd-schedule">{formatScheduleOnlyDays(item.schedule)}</p>
                <p className="cd-students">{item.students} Học viên</p>
                <button
                  className="cd-detail-btn"
                  onClick={() =>
                    navigate(`/lessonlist/${item.id}`, {
                      state: { tenKhoaHoc, tenLop: item.name },
                    })
                  }
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

export default CourseDetail;

