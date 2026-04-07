import "./exercisePage.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const ExercisePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [lesson, setLesson] = useState<any>(null);
  const [tienDo, setTienDo] = useState(0);
  const [soHocVien, setSoHocVien] = useState(0);
  const [giangVien, setGiangVien] = useState("—");
  const [lichHoc, setLichHoc] = useState("—");

  /* ===== LOAD LESSON + LỚP + TIẾN ĐỘ ===== */
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/lesson/${id}`)
      .then(res => res.json())
      .then(async (lessonData) => {
        setLesson(Array.isArray(lessonData) ? lessonData[0] : lessonData);
        const maLopHoc = lessonData.MaLopHoc;

        // Lấy số học viên thực tế từ SINHVIEN_LOPHOC
        const countRes = await fetch(`http://localhost:5000/lophoc/${maLopHoc}/students/count`);
        const countData = await countRes.json();
        setSoHocVien(countData.SoLuongHocVien || 0);

        // Lấy thông tin lớp (LichHoc)
        const lopRes = await fetch(`http://localhost:5000/classes/${maLopHoc}/info`);
        const lopData = await lopRes.json();
        setLichHoc(lopData.LichHoc || "—");

        // Lấy tiến độ
        const tienDoRes = await fetch(`http://localhost:5000/lophoc/${maLopHoc}/tiendo`);
        const tienDoData = await tienDoRes.json();
        setTienDo(tienDoData.TienDo || 0);

        // Lấy tên giảng viên
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const gvRes = await fetch(`http://localhost:5000/giangvien/${user.MaNguoiDung}`);
          const gvData = await gvRes.json();
          setGiangVien(gvData.HoTen || "—");
        }
      })
      .catch(err => console.log(err));
  }, [id]);

  /* ===== LOAD EXERCISES ===== */
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/exercises/${id}`)
      .then(res => res.json())
      .then(data => setExercises(data))
      .catch(err => console.log(err));
  }, [id]);

  /* ===== DELETE ===== */
  const handleDelete = async () => {
    if (selectedId === null) return;
    try {
      const url = `http://localhost:5000/exercises/${selectedId}`;
      const res = await fetch(url, { method: "DELETE" });
      const body = await res.text();
      if (res.ok) {
        setExercises(prev =>
          prev.filter(e => Number(e.MaExercise) !== Number(selectedId))
        );
      } else {
        alert("Xóa thất bại: " + body);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err);
    }
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.Title?.toLowerCase().includes(search.toLowerCase())
  );

  if (!lesson) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="ep-wrapper">

      <div className="back" onClick={() => navigate(-1)}>← Quay lại</div>

      {/* ===== HEADER ===== */}
      <div className="header-card">
        <div className="header-top">
          <div>
            <h1>{lesson?.TenLesson}</h1>
            <p>{lesson?.MoTa}</p>
            <p>
              📅 {lesson?.NgayBatDau && new Date(lesson.NgayBatDau).toLocaleDateString("vi-VN")} -{" "}
              {lesson?.NgayKetThuc && new Date(lesson.NgayKetThuc).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <span className="status-badge">Đang học</span>
        </div>

        <div className="info-row">
          <div className="info-item">
            <span>👩‍🏫</span>
            <div>
              <p className="label">Giáo viên</p>
              <b>{giangVien}</b>
            </div>
          </div>
          <div className="info-item">
            <span>📅</span>
            <div>
              <p className="label">Lịch học</p>
              <b>{lichHoc}</b>
            </div>
          </div>
          <div className="info-item">
            <span>👥</span>
            <div>
              <p className="label">Số học viên</p>
              <b>{soHocVien}</b>
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

        <div className="progress-section">
          <div className="progress-label">
            <span>Tiến độ khóa học</span>
            <span className="percent">{tienDo}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${tienDo}%` }} />
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="tabs">
        <button className="tab" onClick={() => navigate(`/class/${id}`)}>Tổng quan</button>
        <button className="tab active">Bài tập</button>
        <button className="tab" onClick={() => navigate(`/quan-ly-bai-giang/${id}`)}>Bài giảng</button>
        <button className="tab" onClick={() => navigate(`/documents/${id}`)}>Tài liệu</button>
      </div>

      {/* ===== EXERCISES ===== */}
      <div className="exercise-section">
        <h2>Danh sách bài tập</h2>

        <div className="exercise-top">
          <div className="ep-search-group">
            <input
              type="text"
              placeholder="Tìm kiếm bài tập"
              className="ep-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="ep-add-btn"
              onClick={() => navigate(`/create-exercise/${id}`)}
            >
              + Tạo bài tập
            </button>
          </div>
          <div className="ep-total-box">
            <p>Tổng số bài tập</p>
            <b>{filteredExercises.length}</b>
          </div>
        </div>

        <div className="exercise-grid">
          {filteredExercises.map((ex) => (
            <div key={ex.MaExercise} className="exercise-card">
              <h4>{ex.Title}</h4>
              <p>{ex.Type}</p>
              <span>
                📅 {ex.CreatedDate && new Date(ex.CreatedDate).toLocaleDateString("vi-VN")}
              </span>
              <div className="btn-group">
                <button
                  className="outline-btn"
                  onClick={() => navigate(`/exercise-detail/${ex.MaExercise}/${id}`)}
                >
                  Xem chi tiết
                </button>
                <button
                  className="delete-btn"
                  onClick={() => {
                    setSelectedId(Number(ex.MaExercise));
                    setShowDeleteModal(true);
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showDeleteModal && (
        <div className="baitap-modal-overlay">
          <div className="delete-modal">
            <div className="modal-icon">!</div>
            <h3>Xác nhận Xóa</h3>
            <p>Bạn có chắc chắn muốn xóa bài tập này không?</p>
            <button className="confirm-btn" onClick={handleDelete}>Xác nhận</button>
            <button className="cancel-btn" onClick={() => { setShowDeleteModal(false); setSelectedId(null); }}>Không</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExercisePage;