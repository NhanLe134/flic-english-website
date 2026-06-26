import "./AssignmentSuccess.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FiCheck } from "react-icons/fi";

function AssignmentSuccess() {
  const navigate = useNavigate()
  const location = useLocation()

  const title = location.state?.title || "Bài tập"
  const maLopHoc = location.state?.maLopHoc || null
  const diem = location.state?.diem ?? null
  const maBaiTap = location.state?.maBaiTap || null

  const lessonId = location.state?.lessonId || null
  const tabKey = location.state?.tabKey || "lt"

  const hasScore = diem !== null

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
            <p className="as-pending-text">
              Đã gửi đến giảng viên chấm điểm
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="as-actions">
          <button
            className="as-btn-outline"
            onClick={() => {
              if (maLopHoc && lessonId) {
                const targetUrl = maBaiTap
                  ? `/MyCourses/${maLopHoc}/${lessonId}/${tabKey}/${maBaiTap}`
                  : `/MyCourses/${maLopHoc}/${lessonId}/${tabKey}`;
                navigate(targetUrl);
              } else if (maLopHoc) {
                navigate(`/MyCourses/${maLopHoc}`);
              } else {
                navigate("/MyCourses");
              }
            }}
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