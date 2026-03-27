const fs = require('fs');
const filePath = '/Users/bjoernsauerwein/Toni2.0 Antigravity/toni-stark-elite/src/components/TacticalHub.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace system prompt
content = content.replace(
  /Block 2: ANTIGRAVITY MEDIA TRIGGER[\s\S]*?"audio_sync": "Papa.mp3"\n\}/,
  `Block 2: SVG-TAKTIKTAFEL & VEO ENGINE (JSON-Feld 'media_trigger')
Gib zwingend diesen JSON-Block aus. Du darfst KEINE Prompts für Bild-KIs mehr schreiben. Du generierst im Feld 'svg_tactical_board' stattdessen den rohen SVG-Code für eine professionelle Taktiktafel im 2D-Top-Down-Look (wie bei fussball.de oder Wyscout).
Regeln für den SVG-Code:
- Erstelle eine <svg> viewBox von "0 0 800 600".
- Hintergrund: Ein sattes Rasengrün (#2d8c3c) mit weißen Spielfeldlinien.
- Elemente: Rote Kreise (fill="red") für Offensiv-Spieler. Blaue Kreise (fill="blue") für Defensiv-Spieler. Gelbe Dreiecke (fill="yellow") für Hütchen.
- Taktische Linien: Nutze <line> oder <path>. Weiße durchgezogene Linien für Pässe, gestrichelte Linien (stroke-dasharray="5,5") für Laufwege.
- WICHTIG: Gib AUSSCHLIESSLICH den rohen, validen <svg>...</svg> Code aus.
"media_trigger": {
  "action": "play_media",
  "svg_tactical_board": "<svg viewBox=\\"0 0 800 600\\">...</svg>",
  "veo_video_prompt": "5-second cinematic high-tech football sequence... Synchronize with Papa.mp3.",
  "audio_sync": "Papa.mp3"
}`
);

// Replace format template
content = content.replace(
  /\"nano_image_prompt\": \"\.\.\.\",/g,
  '"svg_tactical_board": "<svg>...</svg>",'
);

// Replace fallback JSON
const fallbackSvg = `"<svg viewBox=\\"0 0 800 600\\"><rect width=\\"800\\" height=\\"600\\" fill=\\"#2d8c3c\\"/><line x1=\\"400\\" y1=\\"500\\" x2=\\"400\\" y2=\\"100\\" stroke=\\"white\\" stroke-width=\\"2\\"/><circle cx=\\"400\\" cy=\\"300\\" r=\\"100\\" fill=\\"none\\" stroke=\\"white\\" stroke-width=\\"2\\"/><circle cx=\\"300\\" cy=\\"400\\" r=\\"15\\" fill=\\"red\\"/><circle cx=\\"500\\" cy=\\"200\\" r=\\"15\\" fill=\\"blue\\"/><polygon points=\\"390,390 410,390 400,370\\" fill=\\"yellow\\"/><line x1=\\"300\\" y1=\\"400\\" x2=\\"500\\" y2=\\"200\\" stroke=\\"white\\" stroke-width=\\"3\\" stroke-dasharray=\\"5,5\\"/></svg>"`;

content = content.replace(
  /\"nano_image_prompt\": \".*?\",/g,
  `"svg_tactical_board": ${fallbackSvg},`
);

fs.writeFileSync(filePath, content);
console.log('Update script successful');
