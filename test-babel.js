const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const scriptMatch = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (scriptMatch) {
    fs.writeFileSync('react-code.jsx', scriptMatch[1]);
    console.log('Saved to react-code.jsx');
}
