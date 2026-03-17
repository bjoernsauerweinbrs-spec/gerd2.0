const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { runScripts: "dangerously" });
const window = dom.window;

const https = require('https');
https.get('https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Mock React
    window.React = { 
      createContext: () => ({}), 
      useState: () => [], 
      useEffect: () => {}, 
      useRef: () => ({}), 
      useMemo: () => {}, 
      forwardRef: () => {},
      useContext: () => ({})
    };
    try {
      window.eval(data);
      console.log("window.Motion keys:", Object.keys(window.Motion || {}).length);
      console.log("Has AnimatePresence:", !!(window.Motion && window.Motion.AnimatePresence));
    } catch(e) {
      console.log("Eval error:", e.message);
    }
  });
});
