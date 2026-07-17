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

async function main() {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to DB!");
    
    // Query exercise 99
    const result = await pool.request()
      .input("id", 99)
      .query("SELECT * FROM BAITAP WHERE MaBaiTap = @id");
    
    const ex = result.recordset[0];
    const content = JSON.parse(ex.NoiDung);
    const secType = content.sections[0].type;
    console.log("=== DB secType ===");
    console.log(secType);

    console.log("=== CHAR CODES IN DB secType ===");
    const chars = secType.split("").map(c => `${c} (${c.charCodeAt(0)})`).join(", ");
    console.log(chars);

    await sql.close();
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
