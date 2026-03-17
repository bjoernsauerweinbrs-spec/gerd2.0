const apiKey = process.env.GEMINI_API_KEY;
const prompt = `Erstelle einen aktuellen (oder aus der letzten bekannten Saison) Kader für den Profi-Fußballverein "RB Leipzig".
WICHTIG: Antworte AUSSCHLIESSLICH mit einem einzigen validen JSON-Objekt. Keine Einleitung, keine Markdown-Formatierung.
Struktur:
{
  "clubName": "RB Leipzig",
  "league": "Bundesliga",
  "primaryColor": "#ffffff",
  "secondaryColor": "#e21b4d",
  "players": [
    { "name": "Spieler Name", "position": "Torwart|Abwehr|Mittelfeld|Sturm", "marketValue": 1000000, "age": 25, "nationality": "GER" }
  ]
}`;

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  })
}).then(res => res.json()).then(data => {
  console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
