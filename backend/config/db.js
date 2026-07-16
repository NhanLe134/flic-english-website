const sql = require("mssql");

const config = {
  user: 'team3',
  password: 'FLIC@2026!218',
  server: '14.225.192.252',
  database: 'WebHocTiengAnh',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    keepAlive: true, // Tự động gửi gói tin keep-alive để tránh bị tường lửa ngắt kết nối khi rảnh
    connectTimeout: 15000,
    requestTimeout: 30000 // Tăng thời gian chờ request lên 30s
  },
  pool: {
    max: 15,
    min: 0,
    idleTimeoutMillis: 30000 // Hủy kết nối nhàn rỗi sau 30 giây để giải phóng tài nguyên
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch(err => console.log("Database connection failed!", err));

module.exports = { sql, poolPromise };
