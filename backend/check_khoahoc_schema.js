const { poolPromise, sql } = require('./config/db');

(async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(
            `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'KHOAHOC' ORDER BY COLUMN_NAME`
        );

        console.log('\n=== KHOAHOC Table Columns ===');
        result.recordset.forEach(row => {
            console.log(`${row.COLUMN_NAME} (${row.DATA_TYPE})`);
        });

        // Check for LRSW columns
        const hasListening = result.recordset.some(r => r.COLUMN_NAME === 'Listening');
        const hasReading = result.recordset.some(r => r.COLUMN_NAME === 'Reading');
        const hasSpeaking = result.recordset.some(r => r.COLUMN_NAME === 'Speaking');
        const hasWriting = result.recordset.some(r => r.COLUMN_NAME === 'Writing');

        console.log('\n=== LRSW Columns Status ===');
        console.log(`Listening: ${hasListening ? '✓ YES' : '✗ NO'}`);
        console.log(`Reading: ${hasReading ? '✓ YES' : '✗ NO'}`);
        console.log(`Speaking: ${hasSpeaking ? '✓ YES' : '✗ NO'}`);
        console.log(`Writing: ${hasWriting ? '✓ YES' : '✗ NO'}`);

        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
})();
