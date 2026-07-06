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
                const targetUrl = `/MyCourses/${maLopHoc}/${lessonId}/${tabKey}`;
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
            onClick={async () => {
              const confirmReview = window.confirm(
                "Nếu xem lại đáp án và giải thích, bạn sẽ KHÔNG được thực hiện lại (làm lại) bài tập này nữa. Bạn có chắc chắn muốn xem lại không?"
              );
              if (confirmReview) {
                try {
                  const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
                  const user = JSON.parse(userStr || "{}");
                  await fetch(`http://14.225.192.252:5000/bainop/xem-giai-thich`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      MaSinhVien: user.MaSinhVien || user.MaNguoiDung,
                      MaBaiTap: maBaiTap
                    })
                  });
                } catch (e) {
                  console.error("Error setting review flag:", e);
                }
                if (maLopHoc && lessonId && maBaiTap) {
                  navigate(`/MyCourses/${maLopHoc}/${lessonId}/${tabKey}/${maBaiTap}?mode=review`, {
                    state: { maLopHoc, justSubmittedAnswers: location.state?.justSubmittedAnswers, diem: location.state?.diem }
                  });
                } else if (maBaiTap) {
                  navigate(`/baitap/${maBaiTap}?mode=review`, {
                    state: { maLopHoc, justSubmittedAnswers: location.state?.justSubmittedAnswers, diem: location.state?.diem }
                  });
                } else {
                  navigate("/MyCourses");
                }
              }
            }}
          >
            Xem lại
          </button>
        </div>
      </div>

    </div>
  )
}

export default AssignmentSuccess;