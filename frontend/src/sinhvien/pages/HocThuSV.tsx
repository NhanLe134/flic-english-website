import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./MyCourses/MyCourses.css"; // Reuse styling directly

const API = "http://localhost:5000";

export default function HocThuSV() {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem("user");
  const homePath = isLoggedIn ? "/profile" : "/";

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch trial classes
  useEffect(() => {
    fetch(`${API}/student/trial-classes`)
      .then((res) => res.json())
      .then((data) => {
        setClasses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching trial classes:", err);
        setLoading(false);
      });
  }, []);

  const handleClassClick = (c: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate(`/hoc-thu-sv/${c.MaLopHoc}`);
    } else {
      navigate(`/hoc-thu/${c.MaLopHoc}`);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 20px 0 20px", fontFamily: "Inter, sans-serif" }}>
      {/* Breadcrumb */}
      <nav className="courses-breadcrumb" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", marginTop: "0px", marginBottom: "24px" }}>
        <Link to={homePath} style={{ color: "#777777", textDecoration: "none", fontWeight: 500 }}>Trang chủ</Link>
        <span style={{ color: "#bbbbbb", fontSize: "14px", userSelect: "none" }}>›</span>
        <span style={{ color: "#777777", fontWeight: 500 }}>Học & thi thử</span>
        <span style={{ color: "#bbbbbb", fontSize: "14px", userSelect: "none" }}>›</span>
        <span style={{ color: "#F95800", fontWeight: 600 }}>Học thử</span>
      </nav>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #FFF2EB 0%, #FFEBE0 100%)", borderRadius: "16px", padding: "36px", marginBottom: "32px", border: "1px solid #FFE0D1" }}>
        <h1 style={{ margin: "0 0 12px 0", color: "#dd4e00", fontSize: "28px", fontWeight: 800 }}>LỚP HỌC TRẢI NGHIỆM THỬ</h1>
        <p style={{ color: "#64748b", fontSize: "15px", margin: 0, lineHeight: "1.6" }}>
          Chào mừng bạn đến với góc học thử của trung tâm FLIC! Dưới đây là danh sách các lớp học thử nghiệm được thiết kế giúp bạn làm quen với phương pháp dạy học trước khi đăng ký chính thức.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Đang tải danh sách lớp học thử...</div>
      ) : classes.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          Hiện chưa có lớp học thử nào được xuất bản.
        </div>
      ) : (
        <div className="mc-list-layout">
          {classes.map((c, i) => {
            return (
              <div className="mc-card" key={c.MaLopHoc} style={{ animationDelay: `${i * 60}ms`, padding: "24px 30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <h3 className="mc-card-name" style={{ margin: "0 0 8px 0", color: "#000080" }}>{c.TenLop}</h3>
                    <span style={{ display: "inline-block", background: "#FFF2EB", color: "#F95800", padding: "4px 10px", borderRadius: "12px", fontSize: "13px", fontWeight: 600 }}>
                      {c.TenKhoaHoc}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleClassClick(c, e)}
                    style={{
                      background: "linear-gradient(135deg, #000080, #0000b3)",
                      color: "#fff",
                      border: "none",
                      padding: "12px 28px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 15px rgba(0, 0, 128, 0.15)",
                      transition: "all 0.2s"
                    }}
                  >
                    Vào học thử
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
