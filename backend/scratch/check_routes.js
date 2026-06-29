const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

// Find lines containing my-classes, classes, lophoc
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('my-classes') || line.toLowerCase().includes('lophoc') || line.toLowerCase().includes('/classes')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
