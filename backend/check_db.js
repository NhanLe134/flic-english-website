const { sql, poolPromise } = require("./config/db.js");

async function checkData() {
    try {
        let pool = await poolPromise;
        
        let cols = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LOPHOC'");
        console.log("=== LOPHOC COLUMNS ===");
        console.log(cols.recordset);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
