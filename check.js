const fs = require('fs');
const content = fs.readFileSync('/Users/bjoernsauerwein/Toni2.0 Antigravity/index.html', 'utf8');
const match = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
const code = match[1];
const lines = code.split('\n');
console.log("Line 3721 (0-indexed):", lines[3721]);
console.log("Line 3722 (1-indexed):", lines[3722]);

const offset = content.substring(0, match.index).split('\n').length;
console.log("Offset:", offset);
