const { sql, poolPromise } = require("./config/db.js");

async function getCols() {
    try {
        let pool = await poolPromise;
        const tables = ['EXERCISE', 'TIENDOHOCTAP', 'DAPAN', 'CAUHOI', 'KETQUABAIKIEMTRA', 'LESSON'];
        
        for (const table of tables) {
            let result = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`);
            console.log(`${table}:`, result.recordset.map(r => r.COLUMN_NAME).join(', '));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getCols();
