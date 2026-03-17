const fetch = require('node-fetch');

async function test() {
  const prompt = `Erstelle einen aktuellen (oder aus der letzten bekannten Saison) Kader für den Profi-Fußballverein "RB Leipzig".
          WICHTIG: Antworte AUSSCHLIESSLICH mit einem einzigen validen JSON-Objekt. Keine Einleitung, keine Markdown-Formatierung.
          Struktur:
          {
            "clubName": "RB Leipzig",
            "league": "Liga",
            "primaryColor": "#00f3ff",
            "secondaryColor": "#e21b4d",
            "players": [
              { "name": "Spieler Name", "position": "Torwart|Abwehr|Mittelfeld|Sturm", "marketValue": 1000000, "age": 25, "nationality": "GER" }
            ]
          }`;
          
  const aiRes = await fetch("http://localhost:3001/api/chat", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        apiKey: process.env.GEMINI_API_KEY,
        persona: "Data-Analyst"
     })
  });
  const data = await aiRes.json();
  console.log(data.text);
}
test();
