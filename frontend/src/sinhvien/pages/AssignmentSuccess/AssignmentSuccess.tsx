import "./AssignmentSuccess.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FiCheck } from "react-icons/fi";

function AssignmentSuccess() {
  const navigate = useNavigate()
  const location = useLocation()

  const title = location.state?.title || "Bài tập"
  const maLopHoc = location.state?.maLopHoc || null
  const diem = location.state?.diem ?? null
  const soLuong = location.state?.soLuong || "—"
  const loai = location.state?.loai || "Bài tập"
  const maBaiTap = location.state?.maBaiTap || null

  const hasScore = diem !== null
  const pct = hasScore ? Math.round(diem * 10) : null

  return (
    <div className="as-content">

      <p className="as-assignment-name">{title}</p>

      <div className="as-card">
        {/* Icon */}
        <div className="as-icon-wrap">
          <div className="as-icon">
            <FiCheck strokeWidth={3} />
          </div>
        </div>

        <h2 className="as-success-title">NỘP BÀI THÀNH CÔNG</h2>

        {/* Score */}
        {hasScore ? (
          <>
            <p className="as-score-label">Điểm của bạn là:</p>
            <p className="as-score">{diem}</p>
          </>
        ) : (
          <div className="as-pending-box">
            <p className="as-score-label" style={{ marginBottom: 0 }}>Bài tự luận đã được ghi nhận</p>
            <p className="as-pending-text">
              ⏳ Đang chờ giảng viên chấm điểm
            </p>
          </div>
        )}

        <div className="as-divider" />

        {/* Stats */}
        <div className="as-stats">
          <div className="as-stat">
            <span className="as-stat-val">{soLuong}</span>
            <span className="as-stat-label">Câu trả lời</span>
          </div>
          <div className="as-stat-sep" />
          <div className="as-stat">
            <span className="as-stat-val">{pct !== null ? `${pct}%` : "—"}</span>
            <span className="as-stat-label">Độ chính xác</span>
          </div>
          <div className="as-stat-sep" />
          <div className="as-stat">
            <span className="as-stat-val" style={{ fontSize: 13 }}>{loai}</span>
            <span className="as-stat-label">Loại bài</span>
          </div>
        </div>

        {/* Actions */}
        <div className="as-actions">
          <button
            className="as-btn-outline"
            onClick={() => maLopHoc ? navigate(`/class-detail/${maLopHoc}`) : navigate("/MyCourses")}
          >
            Quay lại
          </button>
           <button
            className="as-btn-fill"
            onClick={() => maBaiTap ? navigate(`/baitap/${maBaiTap}`, { state: { maLopHoc } }) : navigate("/MyCourses")}
          >
            Xem lại
          </button>
        </div>
      </div>

    </div>
  )
}

export default AssignmentSuccess;