const { sql, poolPromise } = require("./config/db.js");

async function getCols() {
    try {
        let pool = await poolPromise;
        let result = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'BAIKIEMTRA'");
        console.log("BAIKIEMTRA:", result.recordset);
        
        let result2 = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'CAUHOI'");
        console.log("CAUHOI:", result2.recordset);
        
        let result3 = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'BAIHOCKHOAHOC'");
        console.log("BAIHOCKHOAHOC:", result3.recordset);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getCols();
