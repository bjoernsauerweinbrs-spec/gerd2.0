const https = require('https');
https.get('https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data.slice(-500));
  });
});
