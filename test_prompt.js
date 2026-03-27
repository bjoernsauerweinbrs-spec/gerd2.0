const FIELD_W = 1050; 
const FIELD_H = 680;

const availablePlayers = [
    { id: "1", name: "WUNDERKIND", pos: "ZOM", startX: 525, startY: 340 },
    { id: "2", name: "TORMINATOR", pos: "ST", startX: 600, startY: 340 },
    { id: "3", name: "FELS", pos: "IV", startX: 400, startY: 340 }
];
const rosterContext = JSON.stringify(availablePlayers);
const drillPrompt = "passübung über 3 stationen aus dem mittelfeld langer ball nach aussen flanke stürmer kreuzen torabschluss";

const systemPrompt = `Du bist Visualisierungs-KI für ein Fußball-Taktikboard (Größe: X=0 bis ${FIELD_W}, Y=0 bis ${FIELD_H}). Tor links ist Home, Tor rechts ist Away.
Der Trainer gibt eine Übung vor. Du übersetzt sie in eine Abfolge von Keyframes (JSON).
WICHTIG: Nutze AUSSCHLIESSLICH diese Spieler-IDs, die aktuell auf dem Feld stehen. Verschiebe sie ausgehend von ihren Startparametern ("startX", "startY"):
${rosterContext}

Jeder Frame muss zwingend folgendes Format haben:
[{
  "duration": 1500, // Dauer in ms bis zum naechsten Frame (circa 1000 - 2500)
  "players": {
    "99": {"x": 500, "y": 300}, // Key MUSS eine gültige "id" aus der Liste oben sein (als String)
    "10": {"x": 600, "y": 350}
  },
  "ball": {"x": 600, "y": 350} // Optionaler Ball, wandert mit dem Pass/Schuss
}]
WICHTIG: Antworte AUSSCHLIESSLICH mit dem puren JSON-Array (4 bis 8 Frames). Kein Markdown, kein Text davor oder danach!

Übungsbeschreibung: "${drillPrompt}"`;

async function test() {
    console.log("Sending prompt to Ollama...");
    try {
        const res = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                model: "llama3:latest", 
                messages: [{ role: "user", content: systemPrompt }], 
                temperature: 0.1,
                stream: false
            })
        });
        const data = await res.json();
        console.log("RAW RESPONSE:\n", data.message.content);
        
        let raw = data.message.content.trim();
        if(raw.startsWith("```json")) raw = raw.replace(/^```json/, "").replace(/```$/, "").trim();
        else if(raw.startsWith("```")) raw = raw.replace(/^```/, "").replace(/```$/, "").trim();
        
        console.log("\nPARSED OLLAMA JSON:");
        console.log(JSON.parse(raw));
    } catch (e) {
        console.error(e);
    }
}

test();
