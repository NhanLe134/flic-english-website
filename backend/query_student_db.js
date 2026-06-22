const sql = require("mssql");

const config = {
  user: 'team3',
  password: 'FLIC@2026!218',
  server: '14.225.192.252',
  database: 'WebHocTiengAnh',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function run() {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to SQL Server");
    
    const result = await pool.request()
      .input("id", 1)
      .query(`
        SELECT e.MaBaiTap, e.TieuDe AS Title, e.DangBai AS Type, 
               CAST(e.LaBaiKiemTra AS INT) AS IsExam,
               bh.MaBuoiHoc, l.ThuTu AS ThuTuBuoiHoc, e.TrangThai
        FROM BAITAP e
        JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
        JOIN BUOIHOC l ON bh.MaBuoiHoc = l.MaBuoiHoc
        WHERE l.MaLopHoc = @id AND (e.TrangThai = 'published' OR e.TrangThai IS NULL)
        ORDER BY l.ThuTu
      `);
    console.log("Exercises list:", result.recordset);

    await sql.close();
  } catch (err) {
    console.error(err);
  }
}

run();
