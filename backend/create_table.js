const { sql, poolPromise } = require("./config/db");

async function run() {
  try {
    const pool = await poolPromise;
    console.log("Connected. Creating table NGUOIDUNG_QUYENHAN...");
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='NGUOIDUNG_QUYENHAN' and xtype='U')
      BEGIN
          CREATE TABLE NGUOIDUNG_QUYENHAN (
              MaNguoiDung INT NOT NULL,
              MaQuyenHan INT NOT NULL,
              PRIMARY KEY (MaNguoiDung, MaQuyenHan)
          )
          PRINT 'Table NGUOIDUNG_QUYENHAN created.'
      END
      ELSE
      BEGIN
          PRINT 'Table NGUOIDUNG_QUYENHAN already exists.'
      END
    `);
    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
