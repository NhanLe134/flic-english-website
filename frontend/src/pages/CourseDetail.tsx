import "./courseDetail.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    fetch(`http://localhost:5000/course-detail/${id}/classes/${maNguoiDung}`)
      .then((res) => res.json())
      .then(async (data) => {
        // Fetch số học viên thực tế cho từng lớp
        const mapped = await Promise.all(
          data.map(async (c: any) => {
            let soLuong = 0;
            try {
              const res = await fetch(`http://localhost:5000/lophoc/${c.MaLopHoc}/students/count`);
              const json = await res.json();
              soLuong = json?.SoLuongHocVien ?? 0;
            } catch (_) {}

            return {
              id: c.MaLopHoc,
              name: c.TenLop,
              code: `CT-${c.MaLopHoc}`,
              schedule: c.LichHoc,
              students: soLuong, // ← lấy từ API mới
              progress: c.TienDo || 0,
            };
          })
        );
        setClasses(mapped);
      })
      .catch((err) => console.log(err));
  }, [id]);

  const filteredClasses = classes.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="cd-wrapper">

      {/* HEADER ROW */}
      <div className="cd-header">
        <div>
          <h1 className="cd-title">{tenKhoaHoc}</h1>
          <p className="cd-subtitle">
            Quản lý các lớp học thuộc {tenKhoaHoc} và theo dõi tiến độ học tập của học viên.
          </p>
        </div>
        <span className="cd-back" onClick={() => navigate(-1)}>← Quay lại</span>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Tìm kiếm lớp học theo tên hoặc mã lớp..."
        className="cd-search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* STATS */}
      <div className="cd-stats">
        <div className="cd-stat-card">
          <p>Tổng số lớp học</p>
          <h3>{filteredClasses.length}</h3>
        </div>
        <div className="cd-stat-card">
          <p>Tổng số học viên</p>
          <h3>{filteredClasses.reduce((t, c) => t + c.students, 0)}</h3>
        </div>
        <div className="cd-stat-card">
          <p>Tiến độ trung bình</p>
          <h3 className="cd-green">
            {filteredClasses.length > 0
              ? Math.round(
                  filteredClasses.reduce((t, c) => t + c.progress, 0) /
                    filteredClasses.length
                )
              : 0}%
          </h3>
        </div>
        <div className="cd-stat-card">
          <p>Cấp độ hiện có</p>
          <h3>3 Levels</h3>
        </div>
      </div>

      {/* CLASS LIST */}
      <div className="cd-class-list">
        {filteredClasses.length === 0 ? (
          <p>Không tìm thấy lớp học</p>
        ) : (
          filteredClasses.map((item) => (
            <div key={item.id} className="cd-class-card">
              <h3>{item.name}</h3>
              <p className="cd-code">{item.code}</p>
              <p>📅 {item.schedule}</p>
              <p>👥 {item.students} Học viên</p>
              <div className="cd-progress-header">
                <span>📈 Tiến độ khóa học</span>
                <span>{item.progress}%</span>
              </div>
              <div className="cd-progress">
                <div
                  className="cd-progress-orange"
                  style={{ width: `${item.progress - 10}%` }}
                />
                <div
                  className="cd-progress-green"
                  style={{ width: "10%" }}
                />
              </div>
              <button
                className="cd-detail-btn"
                onClick={() =>
                  navigate(`/lessonlist/${item.id}`, {
                    state: { tenKhoaHoc, tenLop: item.name },
                  })
                }
              >
                📖 Xem chi tiết
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default CourseDetail;