const https = require('https');

https.get('https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("AnimatePresence found:", data.includes('AnimatePresence'));
    console.log("window.framerMotion found:", data.includes('framerMotion'));
    console.log("exports.AnimatePresence found:", data.includes('exports.AnimatePresence'));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
