import "./classdetail.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ClassDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [lesson, setLesson] = useState<any>(null);
  const [teacherName, setTeacherName] = useState<string>("Đang tải...");
  const [studentCount, setStudentCount] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/lesson/${id}`)
      .then(res => res.json())
      .then(async (data) => {
        console.log("lesson data:", data);
        setLesson(data);

        // Lấy MaLopHoc từ lesson data thay vì location.state
        const maLopHoc = data.MaLopHoc ?? location.state?.maLopHoc;
        if (maLopHoc) {
          const countRes = await fetch(`http://localhost:5000/lophoc/${maLopHoc}/students/count`);
          const countData = await countRes.json();
          setStudentCount(countData?.SoLuongHocVien ?? 0);
        }
      })
      .catch(err => console.log(err));
  }, [id]);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user?.MaNguoiDung;
    if (maNguoiDung) {
      fetch(`http://localhost:5000/giangvien/${maNguoiDung}`)
        .then(res => res.json())
        .then(data => setTeacherName(data?.HoTen || "Giảng viên"))
        .catch(() => setTeacherName("Giảng viên"));
    }
  }, []);

  if (!lesson) return <p>Đang tải dữ liệu...</p>;

  const documents = [
    "Giáo trình Unit 1-10.pdf",
    "Bài tập thực hành.pdf",
    "Từ vựng tổng hợp.pdf",
  ];

  return (
    <div className="cd2-wrapper">

      <div className="back" onClick={() => navigate(-1)}>← Quay lại</div>

      {/* ===== HEADER CARD ===== */}
      <div className="header-card">
        <div className="header-top">
          <div>
            <h1>{lesson.TenLesson}</h1>
            <p>{lesson.MoTa}</p>
            <p>Mã lớp: B239B1</p>
            <p>
              📅 {new Date(lesson.NgayBatDau).toLocaleDateString("vi-VN")} -{" "}
              {new Date(lesson.NgayKetThuc).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <span className="status-badge">Đang học</span>
        </div>

        <div className="info-row">
          <div className="info-item">
            <span>👩‍🏫</span>
            <div>
              <p className="label">Giáo viên</p>
              <b>{teacherName}</b>
            </div>
          </div>

          <div className="info-item">
            <span>📅</span>
            <div>
              <p className="label">Lịch học</p>
              <b>{lesson.LichHoc}</b>
            </div>
          </div>

          <div className="info-item">
            <span>👥</span>
            <div>
              <p className="label">Số học viên</p>
              <b>{studentCount}</b>
            </div>
          </div>

          <div className="info-item">
            <span>📘</span>
            <div>
              <p className="label">Trạng thái</p>
              <b>Đang học</b>
            </div>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="progress-section">
          <div className="progress-label">
            <span>Tiến độ khóa học</span>
            <span className="percent">68%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "68%" }}></div>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="tabs">
        <button className="tab active" onClick={() => navigate("/class/1")}>Tổng quan</button>
        <button className="tab" onClick={() => navigate(`/bai-tap/${id}`)}>Bài tập</button>
        <button className="tab" onClick={() => navigate(`/quan-ly-bai-giang/${id}`)}>Bài giảng</button>
        <button className="tab" onClick={() => navigate(`/documents/${id}`)}>Tài liệu</button>
      </div>

      {/* COURSE DESCRIPTION */}
      <div className="card">
        <h3>Mô tả khóa học</h3>
        <p>Khóa học tiếng Anh cơ bản dành cho học viên mới bắt đầu. Tập trung vào giao tiếp và ngữ pháp cơ bản.</p>
        <h4>Mục tiêu khóa học:</h4>
        <ul>
          <li>Nắm vững 500 từ vựng cơ bản</li>
          <li>Hiểu và sử dụng các thì cơ bản</li>
          <li>Giao tiếp trong các tình huống hằng ngày</li>
          <li>Đọc hiểu văn bản đơn giản</li>
        </ul>
      </div>

      {/* DOCUMENTS */}
      <div className="card">
        <h3>Tài liệu khóa học</h3>
        {documents.map((doc, index) => (
          <div key={index} className="file-item">📄 {doc}</div>
        ))}
      </div>

    </div>
  );
};

export default ClassDetail;