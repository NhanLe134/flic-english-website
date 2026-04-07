import "./statisticsAdmin.css";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";

const API = "http://localhost:5000";
const COLORS = ["#4CAF50", "#FFC107", "#F44336", "#673AB7"];

export default function StatisticsAdmin() {
  const [stats, setStats] = useState({
    tongNguoiDung: 0, sinhVien: 0, giangVien: 0,
    quanTriVien: 0, khoaHoc: 0, dangKy: 0
  });
  const [monthData, setMonthData]   = useState<any[]>([]);
  const [pieData, setPieData]       = useState<any[]>([]);
  const [khoaHocStats, setKhoaHocStats] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/admin/stats`).then(r => r.json()),
      fetch(`${API}/admin/stats/dangky-thang`).then(r => r.json()),
      fetch(`${API}/admin/stats/trangthaidangky`).then(r => r.json()),
      fetch(`${API}/admin/stats/khoahoc`).then(r => r.json()),
    ])
      .then(([statsData, thangData, ttData, khData]) => {
        setStats(statsData)

        // Bar chart: đăng ký theo tháng
        const months = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"]
        const mapped = months.map((name, i) => {
          const found = thangData.find((d: any) => parseInt(d.Thang) === i + 1)
          return { name, value: found ? found.SoLuong : 0 }
        })
        setMonthData(mapped)

        // Pie chart: trạng thái khóa học
        setPieData(Array.isArray(ttData) ? ttData.map((d: any) => ({
          name: d.TrangThai === "Đã duyệt" ? "Đã duyệt" :
                d.TrangThai === "Pending"  ? "Chờ duyệt" :
                d.TrangThai === "Từ chối"  ? "Từ chối" : d.TrangThai,
          value: d.SoLuong
        })) : [])

        // Khóa học theo trình độ
        setKhoaHocStats(Array.isArray(khData) ? khData : [])
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false))
  }, []);

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <h1>Thống kê & Báo cáo</h1>
        <p>Tổng quan hệ thống – dữ liệu thực từ database</p>
      </div>

      {/* CARD GRID */}
      <div className="card-grid">
        <div className="card">
          <span>Tổng người dùng</span>
          <h2>{stats.tongNguoiDung}</h2>
          <small>Tổng tài khoản trong hệ thống</small>
        </div>
        <div className="card">
          <span>Sinh viên</span>
          <h2>{stats.sinhVien}</h2>
          <small>Đang hoạt động</small>
        </div>
        <div className="card">
          <span>Giảng viên</span>
          <h2>{stats.giangVien}</h2>
          <small>Đang giảng dạy</small>
        </div>
        <div className="card">
          <span>Khóa học</span>
          <h2>{stats.khoaHoc}</h2>
          <small>Tổng khóa học</small>
        </div>
      </div>

      {/* BAR CHART: đăng ký theo tháng */}
      <div className="chart-container">
        <h3>Số lượng người đăng ký theo tháng</h3>
        <p>Thống kê học viên đăng ký khóa học từng tháng trong năm</p>
        {loading ? (
          <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Đang tải...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="Đăng ký" fill="#E5733A" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* BOTTOM GRID */}
      <div className="bottom-grid">

        {/* PIE: trạng thái khóa học */}
        <div className="pie-box">
          <h3>Trạng thái khóa học</h3>
          <p>Tỷ lệ khóa học đã duyệt, chờ duyệt, từ chối</p>
          {loading ? (
            <div style={{ height:300, display:"flex", alignItems:"center", justifyContent:"center", color:"#999" }}>Đang tải...</div>
          ) : pieData.length === 0 ? (
            <div style={{ height:300, display:"flex", alignItems:"center", justifyContent:"center", color:"#999" }}>Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={110} paddingAngle={3} label>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* REPORT BOX */}
        <div className="report-box">
          <h3>Báo cáo nhanh</h3>
          <p>Tổng hợp các số liệu quan trọng</p>
          <div className="report-item"><span>Tổng sinh viên</span><b>{stats.sinhVien}</b></div>
          <div className="report-item"><span>Tổng giảng viên</span><b>{stats.giangVien}</b></div>
          <div className="report-item"><span>Tổng khóa học</span><b>{stats.khoaHoc}</b></div>
          <div className="report-item"><span>Tổng đăng ký khóa học</span><b>{stats.dangKy}</b></div>
          <div className="report-item">
            <span>Khóa học đã duyệt</span>
            <b style={{ color:"#16a34a" }}>{pieData.find(p => p.name === "Đã duyệt")?.value ?? 0}</b>
          </div>
          <div className="report-item">
            <span>Khóa học chờ duyệt</span>
            <b style={{ color:"#d97706" }}>{pieData.find(p => p.name === "Chờ duyệt")?.value ?? 0}</b>
          </div>

          {/* Khóa học theo trình độ */}
          {khoaHocStats.length > 0 && (
            <>
              <div style={{ borderTop:"1px solid #f0f0f0", margin:"12px 0 8px", paddingTop:8, fontSize:13, fontWeight:600, color:"#555" }}>
                Khóa học theo trình độ
              </div>
              {khoaHocStats.map((k: any, i: number) => (
                <div key={i} className="report-item">
                  <span>{k.TrinhDo || "Chưa phân loại"}</span>
                  <b>{k.SoLuong}</b>
                </div>
              ))}
            </>
          )}
        </div>

      </div>
    </div>
  );
}