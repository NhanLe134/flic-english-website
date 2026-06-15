const { poolPromise } = require("./config/db.js");

async function checkCols() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'EXERCISE'");
    console.log("EXERCISE columns:", result.recordset);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCols();
