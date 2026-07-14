import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./QuanLyKetQuaHocTap.css";

const QuanLyKetQuaHocTap = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    if (!maNguoiDung) { setLoading(false); return; }

    fetch(`${(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004")}/teacher/classes/${maNguoiDung}`)
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Chuyển hướng ngay lập tức tới lớp học phụ trách đầu tiên
          navigate(`/lesson-result/${data[0].MaLopHoc}`, { replace: true });
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="qlkq-wrapper">
      <h1 className="qlkq-title">Quản lý kết quả học tập</h1>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Đang tải...</div>
      ) : (
        <div className="card-container">
          <p>Bạn chưa được phân công lớp học nào.</p>
        </div>
      )}
    </div>
  );
};

export default QuanLyKetQuaHocTap;

