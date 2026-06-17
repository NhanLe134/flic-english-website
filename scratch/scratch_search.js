const fs = require('fs');
const content = fs.readFileSync('d:\\TaiLieuSinhVien\\FLIC\\my-project\\backend\\server.js', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes("app.get") && (line.includes("classes/:id") || line.includes("lophoc/:id"))) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
