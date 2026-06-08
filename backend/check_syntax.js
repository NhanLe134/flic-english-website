const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');
const pairs = { '(': ')', '{': '}', '[': ']' };
const stack = [];
let quote = null;
let escaped = false;
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (escaped) {
    escaped = false;
    continue;
  }
  if (ch === '\\') {
    escaped = true;
    continue;
  }
  if (quote === null) {
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
  } else {
    if (ch === quote) {
      quote = null;
    }
    continue;
  }
  if (pairs[ch]) {
    stack.push({ ch, i });
  } else if (Object.values(pairs).includes(ch)) {
    const last = stack.pop();
    if (!last || pairs[last.ch] !== ch) {
      console.log('Mismatch at', i, ch, 'last', last);
      process.exit(1);
    }
  }
}
console.log('quote open', quote, 'stack len', stack.length);
if (stack.length > 0) {
  console.log('leftovers', stack.slice(-10));
}
