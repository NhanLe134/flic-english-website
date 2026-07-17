import "./StatisticsAdmin.css";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { FiUsers, FiBookOpen, FiUserCheck } from "react-icons/fi";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";
// const DONUT_COLORS = ["#f58220", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];

export default function StatisticsAdmin() {
  const [stats, setStats] = useState({
    tongNguoiDung: 0, sinhVien: 0, giangVien: 0,
    quanTriVien: 0, khoaHoc: 0, dangKy: 0
  });
  const [monthData, setMonthData] = useState<any[]>([]);
  // Tạm thời ẩn các thống kê dưới
  // const [pieData, setPieData] = useState<any[]>([]);
  // const [khoaHocStats, setKhoaHocStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/admin/stats`).then(r => r.json()),
      fetch(`${API}/admin/stats/dangky-thang`).then(r => r.json()),
      // fetch(`${API}/admin/stats/trangthaidangky`).then(r => r.json()),
      // fetch(`${API}/admin/stats/khoahoc`).then(r => r.json()),
    ])
      .then(([statsData, thangData]) => {
        setStats(statsData)

        // Bar chart: đăng ký theo tháng
        const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
        const mapped = months.map((name, i) => {
          const found = thangData.find((d: any) => parseInt(d.Thang) === i + 1)
          return { name, value: found ? found.SoLuong : 0 }
        })
        setMonthData(mapped)

        // Tạm thời ẩn xử lý biểu đồ dưới
        /*
        setPieData(Array.isArray(ttData) ? ttData.map((d: any) => ({
          name: d.TrangThai === "Đã duyệt" ? "Đã duyệt" :
            d.TrangThai === "Pending" ? "Chờ duyệt" :
              d.TrangThai === "Từ chối" ? "Từ chối" : d.TrangThai,
          value: d.SoLuong
        })) : [])

        setKhoaHocStats(Array.isArray(khData) ? khData : [])
        */
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
        <div className="card card-users">
          <div className="card-icon-container">
            <FiUsers size={22} />
          </div>
          <div className="card-content">
            <span className="card-label">Tổng người dùng</span>
            <h2 className="card-value">{stats.tongNguoiDung}</h2>
            <small className="card-subtext">Tài khoản đăng ký</small>
          </div>
        </div>
        <div className="card card-students">
          <div className="card-icon-container">
            <FiUsers size={22} />
          </div>
          <div className="card-content">
            <span className="card-label">Sinh viên</span>
            <h2 className="card-value">{stats.sinhVien}</h2>
            <small className="card-subtext">Học viên hoạt động</small>
          </div>
        </div>
        <div className="card card-teachers">
          <div className="card-icon-container">
            <FiUserCheck size={22} />
          </div>
          <div className="card-content">
            <span className="card-label">Giảng viên</span>
            <h2 className="card-value">{stats.giangVien}</h2>
            <small className="card-subtext">Đang giảng dạy</small>
          </div>
        </div>
        <div className="card card-courses">
          <div className="card-icon-container">
            <FiBookOpen size={22} />
          </div>
          <div className="card-content">
            <span className="card-label">Khóa học</span>
            <h2 className="card-value">{stats.khoaHoc}</h2>
            <small className="card-subtext">Tổng số khóa học</small>
          </div>
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
              <Bar dataKey="value" name="Đăng ký" fill="#E5733A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* BOTTOM GRID */}
      {/* TẠM THỜI ẨN TRÌNH ĐỘ KHÓA HỌC VÀ BÁO CÁO NHANH
      <div className="bottom-grid">

        <div className="pie-box">
          <h3>Trình độ khóa học</h3>
          <p>Phân bố số lượng khóa học theo trình độ đào tạo</p>
          {loading ? (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Đang tải...</div>
          ) : khoaHocStats.length === 0 ? (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={khoaHocStats.map((k: any) => ({
                    name: k.TrinhDo || "Chưa phân loại",
                    value: k.SoLuong
                  }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  label
                >
                  {khoaHocStats.map((_, index) => (
                    <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="report-box">
          <h3>Báo cáo nhanh</h3>
          <p>Tổng hợp các số liệu quan trọng</p>
          <div className="report-item"><span>Tổng sinh viên</span><b>{stats.sinhVien}</b></div>
          <div className="report-item"><span>Tổng giảng viên</span><b>{stats.giangVien}</b></div>
          <div className="report-item"><span>Tổng khóa học</span><b>{stats.khoaHoc}</b></div>
          <div className="report-item"><span>Tổng đăng ký khóa học</span><b>{stats.dangKy}</b></div>
          <div className="report-item">
            <span>Khóa học đã duyệt</span>
            <b style={{ color: "#10b981" }}>{pieData.find(p => p.name === "Đã duyệt")?.value ?? 0}</b>
          </div>
          <div className="report-item">
            <span>Khóa học chờ duyệt</span>
            <b style={{ color: "#ffb020" }}>{pieData.find(p => p.name === "Chờ duyệt")?.value ?? 0}</b>
          </div>
        </div>

      </div>
      */}
    </div>
  );
}
