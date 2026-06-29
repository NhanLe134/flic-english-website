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
    
    // Check if column exists, if not, add it
    const checkCol = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'LOPHOC' AND COLUMN_NAME = 'ChoPhepHocThu'
    `);
    
    if (checkCol.recordset.length === 0) {
      console.log("Adding ChoPhepHocThu column to LOPHOC...");
      await pool.request().query(`
        ALTER TABLE LOPHOC ADD ChoPhepHocThu BIT NOT NULL DEFAULT 0;
      `);
      console.log("Column added successfully!");
    } else {
      console.log("ChoPhepHocThu column already exists.");
    }

    // Set ChoPhepHocThu = 1 for some classes (MaLopHoc = 1 and 2)
    console.log("Setting trial flag for classes 1 and 2...");
    await pool.request().query(`
      UPDATE LOPHOC SET ChoPhepHocThu = 1 WHERE MaLopHoc IN (1, 2);
    `);
    console.log("Trial flags updated successfully!");

    await sql.close();
  } catch (err) {
    console.error(err);
  }
}

run();
