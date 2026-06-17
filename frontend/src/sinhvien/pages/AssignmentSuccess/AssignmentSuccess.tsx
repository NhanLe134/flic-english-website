import "./AssignmentSuccess.css";
import { useNavigate, useLocation } from "react-router-dom";

function AssignmentSuccess() {
  const navigate = useNavigate()
  const location = useLocation()

  const title    = location.state?.title    || "Bài tập"
  const maLopHoc = location.state?.maLopHoc || null
  const diem     = location.state?.diem     ?? null
  const soLuong  = location.state?.soLuong  || "—"
  const loai     = location.state?.loai     || "Bài tập"

  const hasScore = diem !== null
  const pct      = hasScore ? Math.round(diem * 10) : null

  return (
        <div className="as-content">

          <div className="as-header">
            <h1 className="as-page-title">BÀI TẬP</h1>
            <button className="as-back" onClick={() => navigate(-1)}>← Quay lại</button>
          </div>

          <p className="as-assignment-name">{title}</p>

          <div className="as-card">
            {/* Icon */}
            <div className="as-icon-wrap">
              <div className="as-icon">✓</div>
            </div>

            <h2 className="as-success-title">NỘP BÀI THÀNH CÔNG</h2>

            {/* Score */}
            {hasScore ? (
              <>
                <p className="as-score-label">Điểm của bạn là:</p>
                <p className="as-score">{diem}</p>
              </>
            ) : (
              <div style={{ textAlign:"center", marginBottom:8 }}>
                <p className="as-score-label">Bài tự luận đã được ghi nhận</p>
                <p style={{ fontSize:13, color:"#aaa", margin:"4px 0 0" }}>
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
                <span className="as-stat-val" style={{ fontSize:13 }}>{loai}</span>
                <span className="as-stat-label">Loại bài</span>
              </div>
            </div>

            {/* Actions */}
            <div className="as-actions">
              <button
                className="as-btn-outline"
                onClick={() => navigate("/assignments")}
              >
                Về danh sách bài tập
              </button>
              <button
                className="as-btn-fill"
                onClick={() => maLopHoc
                  ? navigate(`/course-detail/${maLopHoc}`)
                  : navigate("/MyCourses")
                }
              >
                Về khóa học
              </button>
            </div>
          </div>

        </div>
  )
}

export default AssignmentSuccess;