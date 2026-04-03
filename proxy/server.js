/**
 * STARK ELITE — LIVE DATA PROXY BRIDGE (V100)
 * Node.js / Express proxy server
 */

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cheerio = require('cheerio');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Multer Storage Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let PDF_SCOUTING_CONTEXT = "Keine Scouting-Dokumente hochgeladen.";

let clubContext = { 
  officialClubName: "Stark Elite Hub (V6)", 
  lastMatch: "Wird synchronisiert...",
  playersCount: 0,
  liveIntelligence: {
      lastMatch: "Daten-Refresh erforderlich.",
      nextMatch: "Nächstes Spiel wird ermittelt...",
      form: "?-?-?-?-?",
      tacticalNotes: "Gerd 2.0 ist bereit für die Analyse. Bitte Sync-Button betätigen oder Team wählen."
  }
};


// --- SYSTEM INSTRUCTIONS ---

const TACTIC_SYSTEM_INSTRUCTION = `
Du bist „Gerd 2.0“, der weltweit führende High-Performance Director. Dein Analyse-Niveau entspricht Julian Nagelsmann. Du sprichst den Trainer im direkten Dialog an.

DEINE DOPPELTE AUFGABE:
Du musst für das Taktikboard ZWEI Dinge liefern:
1. Eine hochprofessionelle, textliche Tiefenanalyse der Aufstellung und Formation für das kommende Spiel (als Markdown).
2. Einen fehlerfreien JSON-Datenblock für das Frontend, damit die React-Taktiktafel gerendert werden kann.

TEIL 1: DER TEXT-OUTPUT (PFLICHT-STRUKTUR)
- 🎙️ DAS BRIEFING: Ein messerscharfer Satz zum Kernziel der Aufstellung.
- ⚙️ DER ABLAUF (Chronologisch): Beschreibe, wie sich die Formation im Ballbesitz und gegen den Ball verändert. Nutze Elite-Vokabular.
- 🧠 WISSENSCHAFTLICHER NUTZEN: Warum diese spezifische Formation?

TEIL 2: DIE JSON-DATEN (FÜR DAS TAKTIKBOARD)
Am absoluten Ende deiner Antwort generierst du ZWINGEND einen JSON-Codeblock für ein 800x600 SVG-Feld.
Format:
\`\`\`json
{
  "taktiktafel": {
    "feld_typ": "ganzes_feld",
    "spieler_blau": [
      {"x": 400, "y": 550, "label": "TW", "name": "Name"},
      ... (11 Spieler)
    ],
    "spieler_rot": [], 
    "zonen": [],
    "huetchen": [],
    "linien": []
  }
}
\`\`\`
`;

const NLZ_TACTIC_SYSTEM_INSTRUCTION = `
Du bist „Gerd 2.0“, der sportliche Leiter eines Elite-Nachwuchsleistungszentrums (NLZ). Dein Fokus liegt NICHT auf Ergebnisfußball, sondern auf der perfekten technischen, kognitiven und altersgerechten Ausbildung der Spieler.

Der Trainer gibt dir ein Thema und die Altersklasse (z.B. "U12, Passspiel").

TEIL 1: DER TEXT-OUTPUT (PÄDAGOGISCHE STRUKTUR)
Antworte in sauberem Markdown. Nutze eine klare, motivierende und extrem lehrreiche Sprache.

🎯 DAS LERNZIEL: Ein Satz zum Kernfokus der Übung (Technik oder Kognition).
📐 DER AUFBAU & REGELN: Altersgerechte Feldgröße und Spieleranzahl.
👁️ KINDERGERECHTES MICRO-COACHING: 3 Sätze, die der Trainer genau so reinrufen kann (z.B. "Spielt den Ball auf den fernen Fuß!", "Scannt das Feld wie ein Radar!"). Verbanne zu komplexes Profi-Jargon bei Teams unter der U15.
🧠 NEURO-ATHLETIK & ENTWICKLUNG: Warum hilft diese Übung dem kindlichen/jugendlichen Gehirn bei der Entscheidungsfindung?

TEIL 2: DIE JSON-DATEN (FÜR DAS TAKTIKBOARD)
Generiere am Ende ZWINGEND das bekannte JSON-Format für ein 800x600 SVG-Feld. 
WICHTIG: Passe die Anzahl der Spieler und den feld_typ an die Altersklasse an (U9: 4v4/kleinfeld, U17: 8v8/halbfeld, etc.).
Format:
\`\`\`json
{
  "taktiktafel": {
    "feld_typ": "kleinfeld", // oder "halbfeld", "ganzes_feld"
    "spieler_blau": [],
    "spieler_rot": [],
    "huetchen": [],
    "linien": [],
    "zonen": []
  }
}
\`\`\`
`;

const LOGISTICS_SYSTEM_INSTRUCTION = `Du bist der "Stark Elite Procurement Raider". 
Analysiere Materialanfragen und simuliere eine Suche (Idealo/Amazon Style). 
Berücksichtige die Vereinsfarben (Navy, Gold, RedBull-Rot). 
Bewerte das "Sponsor-Potenzial" (z.B. Passt Nike zu Stark Elite?).
Gib IMMER ein JSON-Array mit 3 Objekten zurück: {title, price, source, link, sponsorPotential, colorMatch}.`;

const LINEUP_SYSTEM_INSTRUCTION = `
Du bist der 'Stark Elite Lineup Architect'. Deine Aufgabe ist es, unstrukturierte Trainer-Notizen in ein präzises JSON-Objekt für eine Spielfeld-Visualisierung (800x600) umzuwandeln.

TACTICAL GROUNDING RULES:
1. FORMATION: Erkenne die Grundformation (z.B. 4-4-2, 3-5-2, 4-3-3).
2. KOORDINATENSYSTEM: (X: 0 bis 800, Y: 0 bis 600).
   - X-Achse: 400 ist die Mitte. 0 ist Links, 800 ist Rechts.
   - Y-Achse: 550 ist die Torlinie (Unten), 50 ist der gegnerische Strafraum (Oben).
3. POSITIONIERUNG:
   - TW (Torwart): X: 400, Y: 560.
   - ABWEHR: Y zwischen 420 und 480. IV mittig versetzt, Außenverteidiger (LV/RV) breit (X ~ 100 bzw. 700).
   - MITTELFELD: Y zwischen 220 und 350. ZM zentral, LM/RM breit (X ~ 150 bzw. 650).
   - STURM: Y zwischen 80 und 150.
4. LOGIK: Verteile die Spieler gleichmäßig auf der Breite (X), passend zur Formation. Symmetrie ist wichtig.
5. CLEANUP: Korrigiere Tippfehler (z.B. 'Inenverteidiger' -> 'IV', 'Stürmer' -> 'ST').

AUSGABE: Ausschließlich valides JSON.
FORMAT:
{
  "formation": "4-3-3",
  "players": [
    {"name": "Müller", "pos": "TW", "x": 400, "y": 560},
    {"name": "Hummels", "pos": "IV", "x": 300, "y": 450},
    {"name": "Boateng", "pos": "IV", "x": 500, "y": 450}
  ]
}
`;

// --- HELPER FUNCTIONS ---

function mapPosition(pos) {
    if(!pos) return "ZM";
    const p = pos.toLowerCase();
    if(p.includes('torwart') || p.includes('goalkeeper') || p.includes('gk')) return "TW";
    if(p.includes('innenverteidiger') || p.includes('center back') || p.includes('cb')) return "IV";
    if(p.includes('linker verteidiger') || p.includes('left back') || p.includes('lb')) return "LV";
    if(p.includes('rechter verteidiger') || p.includes('right back') || p.includes('rb')) return "RV";
    if(p.includes('defensives mittelfeld') || p.includes('defensive midfield') || p.includes('dm')) return "ZDM";
    if(p.includes('zentrales mittelfeld') || p.includes('central midfield') || p.includes('cm')) return "ZM";
    if(p.includes('offensives mittelfeld') || p.includes('attacking midfield') || p.includes('am')) return "ZOM";
    if(p.includes('linkes mittelfeld') || p.includes('left midfield') || p.includes('lm')) return "LM";
    if(p.includes('rechtes mittelfeld') || p.includes('right midfield') || p.includes('rm')) return "RM";
    if(p.includes('linksaußen') || p.includes('left wing') || p.includes('lw')) return "LF";
    if(p.includes('rechtsaußen') || p.includes('right wing') || p.includes('rw')) return "RF";
    if(p.includes('mittelstürmer') || p.includes('striker') || p.includes('st') || p.includes('forward') || p.includes('sturm')) return "ST";
    return "ZM";
}

async function getAvailableModels(genAI) {
    try {
        const key = genAI.apiKey;
        console.log("[AI-SYSTEM] Fetching available models for key...");
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await resp.json();
        
        if (!data.models) throw new Error(data.error?.message || "No models returned");

        const models = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name.replace("models/", ""));
        
        // Prioritize Flash/Pro 1.5 and 2.0 models correctly
        const prioritized = models.sort((a, b) => {
            const getScore = (name) => {
                if (name.includes("2.0-flash-lite")) return 1;
                if (name.includes("2.0-flash")) return 2;
                if (name.includes("1.5-flash")) return 3;
                if (name.includes("1.5-pro")) return 4;
                return 5;
            };
            const sA = getScore(a);
            const sB = getScore(b);
            if (sA !== sB) return sA - sB;
            return a.localeCompare(b);
        });

        console.log("[AI-SYSTEM] Chain:", prioritized.join(" -> "));
        return prioritized;
    } catch (e) {
        console.warn("[AI-SYSTEM] API ListModels failed, using legacy defaults:", e.message);
        return ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-lite", "gemini-2.0-flash"];
    }
}

async function runAiGeneration(genAI, prompt, systemInstruction = null, responseMimeType = null, useSearch = false) {
    const modelsToTry = useSearch ? ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"] : await getAvailableModels(genAI);
    let lastError = null;

    for (const modelName of modelsToTry) {
        // Try v1beta first (supports grounding and systemInstruction)
        for (const apiVer of ['v1beta', 'v1']) {
            // Skip v1 if we strictly need search (search only works in v1beta)
            if (useSearch && apiVer === 'v1') continue;

            try {
                const config = { model: modelName };
                if (systemInstruction && apiVer === 'v1beta') config.systemInstruction = systemInstruction;
                
                if (useSearch && apiVer === 'v1beta') {
                    config.tools = [
                        {
                            googleSearch: {} 
                        }
                    ];
                }

                const model = genAI.getGenerativeModel(config, { apiVersion: apiVer });
                const generationConfig = (responseMimeType && apiVer === 'v1beta') ? { responseMimeType } : {};
                
                let finalPrompt = prompt;
                if (systemInstruction && apiVer === 'v1') {
                    finalPrompt = `SYSTEM INSTRUCTION:\n${systemInstruction}\n\nUSER PROMPT:\n${prompt}`;
                }

                const result = await Promise.race([
                    model.generateContent({
                        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
                        generationConfig
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("AI_TIMEOUT")), 45000))
                ]);
                
                const text = result.response.text();
                if (!text) throw new Error("EMPTY_RESPONSE");
                
                const groundingMetadata = result.response.candidates?.[0]?.groundingMetadata;
                const sources = groundingMetadata?.searchEntryPoint?.renderedContent 
                    ? [groundingMetadata.searchEntryPoint.renderedContent] 
                    : (groundingMetadata?.groundingChunks?.map(c => c.web?.uri).filter(Boolean) || []);

                console.log(`[AI-SUCCESS] ${modelName} (${apiVer}) delivered results ${useSearch ? 'with search' : ''}.`);
                return { text, model: modelName, sources };

            } catch (e) {
                lastError = e;
                const msg = (e.message || "").toLowerCase();
                
                // If search failed specifically, we might want to retry WITHOUT search in the next iteration of the outer loop
                if (useSearch && (msg.includes("not found") || msg.includes("not supported") || msg.includes("404"))) {
                    console.warn(`[AI-SEARCH-UNSUPPORTED] ${modelName} does not support search. Retrying next model...`);
                    continue; 
                }

                if (msg.includes("429") || msg.includes("quota")) {
                    console.warn(`[AI-QUOTA] ${modelName} (${apiVer}) limit reached. Trying next...`);
                    break;
                }
                console.warn(`[AI-RETRY] ${modelName} (${apiVer}) failed:`, (e.message || "").substring(0, 100));
            }
        }
    }
    
    // FINAL FALLBACK: If we were using search and everything failed, try ONE LAST TIME without search
    if (useSearch) {
        console.warn("[AI-FALLBACK] Search failed globally. Retrying WITHOUT search as absolute fallback...");
        return runAiGeneration(genAI, prompt, systemInstruction, responseMimeType, false);
    }

    throw lastError || new Error("All AI models failed or quota exceeded.");
}


const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
};

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? process.env.GEMINI_API_KEY : "";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN || "";
const SPORTMONKS_BASE_URL = "https://api.sportmonks.com/v3/football";

// --- SCOUTING ENGINE (PHASE 2) ---

async function fetchProScouting(teamId, leagueId = '78', season = '2025') {
    if (!RAPIDAPI_KEY) return "Pro-Scouting: RAPIDAPI_KEY fehlt.";
    
    console.log(`[SCOUTING-PRO] Fetching stats for Team ${teamId} in League ${leagueId}`);
    
    const url = `https://api-football-v1.p.rapidapi.com/v3/teams/statistics?league=${leagueId}&team=${teamId}&season=${season}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const resp = await fetch(url, options);
        if (!resp.ok) throw new Error(`API_ERROR: ${resp.status}`);
        const data = await resp.json();
        const s = data.response;
        
        if (!s) return "Pro-Scouting: Keine Daten für dieses Team gefunden.";

        return `
            PRO-ANALYSE (API-FOOTBALL):
            Team: ${s.team.name}
            Form: ${s.form}
            Tore (Gesamt): ${s.goals.for.total.total}
            Durchschnitts-Tore: ${s.goals.for.average.total}
            Bester Sieg: ${s.biggest.wins.home || s.biggest.wins.away}
            Taktik-Fokus: Basierend auf Form ${s.form} und Torausbeute.
        `.trim();
    } catch (e) {
        console.error("[SCOUTING-PRO] Error:", e.message);
        return `Pro-Scouting Fehler: ${e.message}`;
    }
}

async function fetchAmateurScouting(url) {
    if (!url || !url.includes('fussball.de')) return "Amateur-Scouting: Ungültige URL.";
    
    console.log(`[SCOUTING-AMATEUR] Scraping: ${url}`);
    
    try {
        const resp = await fetch(url, { headers: HEADERS });
        if (!resp.ok) throw new Error(`SCRAPE_ERROR: ${resp.status}`);
        const html = await resp.text();
        const $ = cheerio.load(html);
        
        // Extract basic table/context from fussball.de
        const tableData = $('.table-container').text().trim().replace(/\s+/g, ' ').substring(0, 800);
        const lastGames = $('.fixtures-results').text().trim().replace(/\s+/g, ' ').substring(0, 500);
        
        return `
            AMATEUR-ANALYSE (FUSSBALL.DE):
            Quelle: ${url}
            Tabellen-Kontext: ${tableData}
            Letzte Ergebnisse: ${lastGames}
        `.trim();
    } catch (e) {
        console.error("[SCOUTING-AMATEUR] Error:", e.message);
        return `Amateur-Scouting Fehler: ${e.message}`;
    }
}

// --- SPORTMONKS V3 ENGINE ---

async function fetchSportmonksData(teamId, seasonId) {
    if (!SPORTMONKS_API_TOKEN) return null;
    
    // Explicitly target 2025/2026 via seasonId
    const squadEndpoint = seasonId ? `${SPORTMONKS_BASE_URL}/squads/seasons/${seasonId}/teams/${teamId}?include=player` : `${SPORTMONKS_BASE_URL}/squads/teams/${teamId}?include=player`;
    
    console.log(`[SPORTMONKS] Fetching V2026 Data for Team ${teamId} (Season ${seasonId})`);
    const options = { headers: { "Authorization": SPORTMONKS_API_TOKEN } };

    try {
        const now = new Date();
        const start = new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        const end = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

        const [squadRes, standingsRes, fixturesRes] = await Promise.all([
            fetch(squadEndpoint, options),
            fetch(`${SPORTMONKS_BASE_URL}/standings/seasons/${seasonId}`, options),
            fetch(`${SPORTMONKS_BASE_URL}/fixtures/between/${start}/${end}?include=participants;scores`, options)
        ]);

        const squad = await squadRes.json();
        const standings = await standingsRes.json();
        const fixtures = await fixturesRes.json();

        let meta = "";
        if (standings.data) {
            const st = standings.data.find(s => s.participant_id == teamId);
            if (st) meta += `Tabelle 2025/26: Platz ${st.position}, Punkte: ${st.points}. `;
        }
        
        if (fixtures.data) {
            const future = fixtures.data.filter(f => new Date(f.starting_at) > now).sort((a,b) => new Date(a.starting_at) - new Date(b.starting_at));
            const nextMatch = future[0];
            if (nextMatch) {
                const opp = nextMatch.participants.find(p => p.id != teamId);
                meta += `Gegner-Fokus: ${opp?.name || 'Unbekannt'}. `;
            }
        }

        if (squad.data) {
            const players = squad.data.filter(s => s.player).map(s => s.player.display_name).join(', ');
            meta += `KADER REAL-TIME (MÄRZ 2026): ${players}.`;
        }

        return meta || "Keine Squad-Details in Sportmonks.";
    } catch (e) {
        console.error("[SPORTMONKS] Error:", e.message);
        return null;
    }
}

async function searchSportmonksTeam(name) {
    if (!SPORTMONKS_API_TOKEN) return null;
    try {
        console.log(`[SPORTMONKS] Searching ID for: ${name}`);
        const res = await fetch(`${SPORTMONKS_BASE_URL}/teams/search/${encodeURIComponent(name)}`, {
            headers: { "Authorization": SPORTMONKS_API_TOKEN }
        });
        const json = await res.json();
        return json.data?.[0]?.id || null;
    } catch (e) {
        return null;
    }
}

// --- RAG ENDPOINT ---
app.post('/api/upload-scouting', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        console.log(`[RAG] Received Scouting Report: ${req.file.originalname} (${req.file.size} bytes)`);
        
        const data = await pdf(req.file.buffer);
        PDF_SCOUTING_CONTEXT = data.text;
        
        console.log(`[RAG] Extracted ${PDF_SCOUTING_CONTEXT.length} characters of tactical context.`);
        res.json({ 
            success: true, 
            message: "Scouting-Bericht erfolgreich verarbeitet.",
            chars: PDF_SCOUTING_CONTEXT.length 
        });
    } catch (e) {
        console.error("[RAG] PDF Processing failed:", e);
        res.status(500).json({ error: "PDF-Verarbeitung fehlgeschlagen." });
    }
});

// --- API ENDPOINTS ---

app.post('/api/verify-gemini', async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) return res.status(400).json({ error: "No key provided" });
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (response.ok) {
            res.json({ status: 'ok' });
        } else {
            res.status(401).json({ error: "Invalid API Key" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/kicker/news', async (req, res) => {
    try {
        const url = `https://www.kicker.de/news/rss/news/aktuell`;
        const resp = await fetch(url);
        const xml = await resp.text();
        res.type('application/xml').send(xml);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function fetchKickerTable(league = '1-bundesliga') {
    try {
        const url = `https://www.kicker.de/${league}/tabelle`;
        const res = await fetch(url, { headers: HEADERS });
        const html = await res.text();
        const $ = cheerio.load(html);
        let tableData = "";
        let teamLinks = [];
        
        $('table.kick__table--standard tbody tr').each((i, el) => {
            const rank = $(el).find('.kick__table-column--rank').text().trim();
            const teamA = $(el).find('.kick__table-column--team a');
            const teamName = teamA.text().trim() || $(el).find('.kick__table-column--team span').text().trim();
            const teamHref = teamA.attr('href');
            const points = $(el).find('.kick__table-column--points').text().trim();
            const goals = $(el).find('.kick__table-column--goals').text().trim();
            
            if (teamName) {
                tableData += `${rank}. ${teamName} | PKT: ${points} | Tore: ${goals}\n`;
                if (teamHref) teamLinks.push({ name: teamName, href: teamHref });
            }
        });
        return { text: tableData || "Keine Tabellen-Daten gefunden.", links: teamLinks };
    } catch (e) { return { text: "Tabellen-Scraping fehlgeschlagen.", links: [] }; }
}

async function fetchKickerSquad(teamSlug, league = '1-bundesliga') {
    try {
        // Construct the kader URL: replace /startseite/ with /kader/
        const url = `https://www.kicker.de${teamSlug.replace('/startseite/', '/kader/')}`;
        console.log(`[SCRAPER] Fetching Kicker Squad from: ${url}`);
        const res = await fetch(url, { headers: HEADERS });
        const html = await res.text();
        const $ = cheerio.load(html);
        
        let squadData = "";
        $('.kick__v100-squadList__playerRow').each((i, el) => {
            const name = $(el).find('.kick__v100-squadList__playerRow__name').text().trim();
            const pos = $(el).find('.kick__v100-squadList__playerRow__position').text().trim();
            if (name) squadData += `${name} (${pos})\n`;
        });
        return squadData || "Keine Kader-Daten auf Kicker gefunden.";
    } catch (e) { return "Kader-Scraping fehlgeschlagen."; }
}

async function fetchKickerSchedule(league = '1-bundesliga') {
    try {
        const baseUrl = `https://www.kicker.de/${league}/spieltag`;
        
        async function scrape(url) {
            const res = await fetch(url, { headers: HEADERS });
            if (!res.ok) return { data: "", nextUrl: null };
            const html = await res.text();
            const $ = cheerio.load(html);
            let data = "";
            $('.kick__v100-gameList__gameRow').each((i, el) => {
                const home = $(el).find('.kick__v100-gameCell__team').eq(0).find('.kick__v100-gameCell__team__name').text().trim();
                const away = $(el).find('.kick__v100-gameCell__team').eq(1).find('.kick__v100-gameCell__team__name').text().trim();
                let scoreOrTime = $(el).find('.kick__v100-scoreBoard__scoreHolder').first().text().trim();
                if (!scoreOrTime) scoreOrTime = $(el).find('.kick__v100-scoreBoard__dateHolder').text().trim();
                const state = $(el).find('.kick__v100-gameList__gameRow__stateCell__indicator').text().trim();
                if (home && away) {
                    data += `${home} vs ${away} | Ergebnis/Zeit: ${scoreOrTime || 'TBD'} | Status: ${state}\n`;
                }
            });
            const nextLink = $('a.kick__pagination__button--flex[href*="spieltag"]:last-child').attr('href');
            return { data, nextUrl: nextLink ? `https://www.kicker.de${nextLink}` : null };
        }

        const current = await scrape(baseUrl);
        let combinedData = "--- AKTUELLER SPIELTAG ---\n" + current.data;
        
        if (current.nextUrl) {
            const next = await scrape(current.nextUrl);
            combinedData += "\n--- NÄCHSTER SPIELTAG ---\n" + next.data;
        }
        
        return combinedData || "Keine Spielplan-Daten gefunden.";
    } catch (e) { 
        console.error("[SCRAPER] Schedule error:", e.message);
        return "Spielplan-Scraping fehlgeschlagen."; 
    }
}

const NEURAL_HYDRATION_SYSTEM_INSTRUCTION = `
Du bist GERD V6, der Strategic Research Analyst & RAG Specialist für Stark Elite.
WIR BEFINDEN UNS IM MÄRZ 2026. 
IGNORIERE HISTORISCHE DATEN AUS 2024/25, WENN SIE DEN AKTUELLEN INFOS WIDERSPRECHEN.

### PRIMÄRE QUELLE (HOCK-PRIORITY RAG):
{{SCOUTING_CONTEXT}}

### SEKUNDÄRE LIVE-DATEN (Grounding):
HEUTE IST: {{CURRENT_DATE}} (März 2026)
SPORTMONKS_REAL_TIME: {{SCOUTING_CONTEXT}}
TABELLENSTAND: {{TABLE_CONTEXT}}
SPIELPLAN: {{SCHEDULE_CONTEXT}}
AKTUELLER KADER: {{SQUAD_CONTEXT}}

### STRENGE REGELN (V6 RAG Mode):
1. DOKUMENT-FOKUS: Priorisiere Informationen aus der "PRIMÄREN QUELLE". Wenn dort taktische Details zum Gegner stehen, nutze diese vorrangig.
2. CITATIONS: Zitiere Quellen als "[Scouting-Report]", "[Kicker-Tabelle]" oder "[Live-News]".
3. ANALYTIC UI: Erzeuge Datenpunkte für Grafiken (Form, Statistiken).
4. KEINE ENTSCHULDIGUNGEN: Gib niemals Disclaimer über fehlende Daten oder 'Informations-Vakuen' ab. Sei ein souveräner Elite-Chefscout.
5. PROFESSIONAL CONFIDENCE: Auch wenn externe Live-Quellen fehlen, liefere eine fundierte, tiefgehende Analyse basierend auf deinem Expertenwissen. Deine Analyse muss absolut souverän, faktenorientiert und 'Inside' wirken (Niveau: Nagelsmann/Rangnick).
6. SQUAD HYDRATION: Erzeuge immer einen vollständigen, realistischen Kader (ca. 18-22 Spieler) basierend auf aktuellem Wissen, falls TM blockiert.
7. ROSTER ENFORCEMENT: Nutze ZWINGEND die Namen aus "AKTUELLER KADER" (Grounding). Lösche keine Spieler daraus und füge nur dann weitere hinzu, wenn der Kader weniger als 18 Spieler hat. Ehemalige Spieler (z.B. Olmo, Werner) dürfen NICHT erscheinen, wenn sie nicht im "AKTUELLER KADER" stehen.

### JSON STRUKTUR:
{
  "officialClubName": "Vollständiger Name",
  "players": [
    {"id": number, "name": "Name", "position": "CODE", "age": number, "ovr": number, "readiness": number, "pac": number, "sho": number, "pas": number, "dri": number, "def": number, "phy": number}
  ],
  "liveIntelligence": {
    "lastMatch": "Faktenbasiertes Ergebnis & Gegner",
    "nextMatch": "Bestätigter nächster Gegner + Datum",
    "form": "S-U-S-N-S",
    "analyticalSummary": "Deep Professional Research Summary (NotebookLM-Style).",
    "dataPoints": [
      {"label": "Siege", "value": number},
      {"label": "Remis", "value": number},
      {"label": "Niederl.", "value": number},
      {"label": "Tore", "value": number}
    ],
    "sources": ["Zitierte Quelle 1", "Zitierte Quelle 2"],
    "tacticalNotes": "Gerd V5 strategische Notiz."
  }
}
}`;

app.get('/api/scrape', async (req, res) => {
    const rawTeamQuery = req.query.team;
    const apiKey = (req.query.apiKey || req.body.apiKey || GEMINI_API_KEY).trim();
    const directAi = req.query.directAi === 'true';
    const smId = req.query.smId; // Sportmonks Team ID
    const smSeasonId = req.query.smSeasonId || "25646"; // UPDATED: Explicitly target 2025/2026 Season ID for Bundesliga (v3)
    
    // API KEY SANITY CHECK
    if (apiKey && (apiKey.includes("AI CORE") || apiKey.length < 10)) {
        return res.status(400).json({ 
            success: false, 
            error: "API_KEY_INVALID_FORMAT", 
            message: "Ungültiges Key-Format. Ein Gemini Key beginnt normal mit 'AIza'." 
        });
    }

    try {
        console.log(`[SCRAPER] Incoming request for: ${rawTeamQuery} (Direct-AI: ${directAi})`);

        let officialClubName = rawTeamQuery;
        let players = [];
        let liveIntelligence = null;

        if (!directAi) {
            // Step 1: Search for the team ID
            const searchUrl = `https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(rawTeamQuery)}`;
            const searchRes = await fetch(searchUrl, { headers: HEADERS });
            
            if (searchRes.status === 405 || searchRes.status === 403) {
                console.warn("[SCRAPER] Request blocked by TM (WAF). Triggering AI-Hydration.");
                throw new Error("BLOCKED");
            }

            const searchHtml = await searchRes.text();
            let $ = cheerio.load(searchHtml);
            
            let clubLink = null;
            $('.items tbody tr').each((i, el) => {
                const row = $(el);
                const aTag = row.find('td.hauptlink a');
                const href = aTag.attr('href');
                if(href && href.includes('/verein/')) {
                    clubLink = href;
                    officialClubName = aTag.text().trim() || rawTeamQuery;
                    return false; 
                }
            });
            
            if(!clubLink) {
                console.log(`[SCRAPER] No club link found. Triggering AI-Hydration.`);
                throw new Error("NOT_FOUND");
            }
            
            // Step 2: Fetch Club Overview for Intelligence
            const overviewUrl = `https://www.transfermarkt.de${clubLink.replace('kader', 'startseite')}`;
            const overviewRes = await fetch(overviewUrl, { headers: HEADERS });
            const overviewHtml = await overviewRes.text();
            const $overview = cheerio.load(overviewHtml);
            
            let tablePos = $overview('a[title="Tabelle"]').first().text().trim() || "N/A";
            let lastMatch = $overview('.begegnungen-widget .result-state--played').first().text().trim() || "N/A";
            let nextMatch = $overview('.begegnungen-widget .result-state--fixture').first().text().trim() || "N/A";
            let opponent = $overview('.begegnungen-widget .begegnung-link a').last().text().trim() || "Unbekannt";

            // Step 3: Extract the Roster (Detailed View)
            const rosterUrl = `https://www.transfermarkt.de${clubLink.replace('startseite', 'kader')}/plus/1`;
            const rosterRes = await fetch(rosterUrl, { headers: HEADERS });
            if (rosterRes.status !== 200) throw new Error("ROSTER_FAILED");

            const rosterHtml = await rosterRes.text();
            $ = cheerio.load(rosterHtml);
            
            $('.items > tbody > tr').each((i, el) => {
                const row = $(el);
                if (row.hasClass('spacer')) return;
                const nameCell = row.find('td.hauptlink');
                if (nameCell.length > 0) {
                    const name = nameCell.find('a.spielprofil_tooltip').text().trim();
                    const pos = row.find('td.pos-zusatz').text().trim() || row.find('td').eq(1).find('tr:last-child td').text().trim();
                    const age = row.find('td.zentriert').eq(1).text().trim();
                    if(name) {
                        players.push({
                            id: players.length + 1,
                            name: name,
                            position: mapPosition(pos),
                            age: age,
                            ovr: 75 + Math.floor(Math.random()*10),
                            readiness: 90
                        });
                    }
                }
            });

            liveIntelligence = {
                lastMatch: lastMatch,
                nextMatch: nextMatch !== "N/A" ? `${nextMatch} gegen ${opponent}` : "Wird analysiert...",
                form: "S-U-S-N-S",
                tacticalNotes: `Analyse für ${officialClubName} (Platz ${tablePos}): Fokus auf Kader-Stabilität (${players.length} Spieler erfasst).`
            };

            if (players.length < 5) throw new Error("INCOMPLETE_ROSTER");

        } else {
            throw new Error("DIRECT_AI_MODE");
        }

        const responseObj = { success: true, officialClubName, players, liveIntelligence, source: "TRANSFERMARKT_LIVE" };
        clubContext = responseObj; // SYNC GLOBAL CONTEXT
        res.json(responseObj);

    } catch (e) {
        console.warn(`[SCRAPER] Falling back to AI-Hydration for ${rawTeamQuery}: ${e.message}`);

        const finalApiKey = apiKey || GEMINI_API_KEY;

        // PRIORITY 0: Simulation Override (User Truth) - NO API KEY REQUIRED
        try {
            const simPath = path.join(__dirname, 'simulation_rosters.json');
            if (fs.existsSync(simPath)) {
                const simRosters = JSON.parse(fs.readFileSync(simPath, 'utf8'));
                const query = rawTeamQuery.toLowerCase();
                
                // Only trigger simulation if query explicitly mentions matchday details or specifically describes the simulated scenario
                // Simulation Override Logic (Fuzzy Matching)
                const match = Object.keys(simRosters).find(k => {
                    const key = k.toLowerCase();
                    // Match if query is contained in key or vice versa, or if it's the specific Leipzig matchday scenario
                    const fuzzyMatch = query.includes(key) || key.includes(query);
                    const isLeipzigMatchdayMatch = query.includes("leipzig") && (query.includes("2026") || query.includes("hoffenheim") || query.includes("löw") || query.includes("5:0"));
                    const isStarkMatch = query.includes("stark elite");
                    return fuzzyMatch || isLeipzigMatchdayMatch || isStarkMatch;
                });

                if (match) {
                    const simData = simRosters[match];
                    console.log("[SIMULATION] Match found for:", match);
                    const responseObj = { 
                        success: true, 
                        officialClubName: match,
                        players: simData.players,
                        liveIntelligence: simData.liveIntelligence || {
                            lastMatch: "Simulation (April 2026)",
                            nextMatch: "Nächstes Spiel (Simulation)"
                        },
                        source: "SIMULATION_OVERRIDE"
                    };
                    clubContext = responseObj; // SYNC GLOBAL CONTEXT
                    return res.json(responseObj);
                }
            }
        } catch (e) { console.warn("[SIMULATION] Override failed:", e.message); }

        if (finalApiKey) {
            const localGenAI = new GoogleGenerativeAI(finalApiKey);

            // New Grounding: Scrape Table, Schedule & Squad
            const isSecondBL = rawTeamQuery.toLowerCase().includes("hsv") || rawTeamQuery.toLowerCase().includes("schalke") || rawTeamQuery.toLowerCase().includes("hertha") || rawTeamQuery.toLowerCase().includes("köln");
            const leagueSlug = isSecondBL ? '2-bundesliga' : '1-bundesliga';

            // PRIORITY 2: Sportmonks if available
            let smCtx = "";
            let finalSmId = smId;
            if (!finalSmId && rawTeamQuery && SPORTMONKS_API_TOKEN) {
                finalSmId = await searchSportmonksTeam(rawTeamQuery);
            }
            if (finalSmId) {
                smCtx = await fetchSportmonksData(finalSmId, smSeasonId);
            }

            const tableResult = await fetchKickerTable(leagueSlug);
            const scheduleCtx = await fetchKickerSchedule(leagueSlug).catch(() => "N/A");
            const tableCtx = tableResult.text;

            const currentDate = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
            const groundedInstruction = NEURAL_HYDRATION_SYSTEM_INSTRUCTION
                .replace('{{SCOUTING_CONTEXT}}', PDF_SCOUTING_CONTEXT + (smCtx ? `\nSPORTMONKS_REAL_TIME: ${smCtx}` : ""))
                .replace('{{CURRENT_DATE}}', currentDate)
                .replace('{{TABLE_CONTEXT}}', tableCtx)
                .replace('{{SCHEDULE_CONTEXT}}', scheduleCtx)
                .replace('{{SQUAD_CONTEXT}}', "AI_SQUAD_GENERATION");

            try {
                if (!finalApiKey) throw new Error("MISSING_API_KEY");

                const aiPrompt = `${groundedInstruction}\n\n---\n\nErstelle das Forschungs-Dossier und den Kader für: "${rawTeamQuery}".`;
                // Enable Search Grounding for AI Hydration
                const result = await runAiGeneration(localGenAI, aiPrompt, null, "application/json", true);
                
                const hydratedData = JSON.parse(result.text);
                const responseObj = { 
                    success: true, 
                    ...hydratedData, 
                    source: "AI_HYDRATION",
                    modelUsed: result.model,
                    groundingSources: result.sources // Pass sources to frontend
                };
                clubContext = responseObj; // SYNC GLOBAL CONTEXT
                return res.json(responseObj);
            } catch (aiErr) {
                console.error(`[SCRAPER] AI Hydration FATAL:`, aiErr.message);
                return res.status(500).json({ 
                    success: false, 
                    error: aiErr.message === "MISSING_API_KEY" ? "ACCESS_BLOCKED" : "AI_HYDRATION_FAILED", 
                    message: "Transfermarkt blockiert. Bitte validen Gemini API Key in den Einstellungen hinterlegen."
                });
            }
        }
        
        res.status(403).json({
            success: false,
            error: "ACCESS_BLOCKED",
            message: "Transfermarkt blockiert Anfragen. Bitte validen Gemini API Key hinterlegen."
        });
    }
});

app.post('/api/ai-chat', async (req, res) => {
    try {
        const { prompt, apiKey, contextOverride } = req.body;
        const finalKey = apiKey || GEMINI_API_KEY;
        if (!finalKey) return res.status(401).json({ error: "Missing API Key" });

        const localGenAI = new GoogleGenerativeAI(finalKey);
        const systemInstruction = `Du bist Gerd 2.0, ein Elite-Taktik-Analyst.
            Nutze folgenden Club-Kontext für deine Analysen: ${JSON.stringify(contextOverride || clubContext || "Stark Elite Standard")}.
            
            Der Trainer gibt dir NUR das Thema für den Hauptteil (z.B. "Passspiel mit Torschuss").
            Deine Aufgabe: Generiere eine komplette, dreiteilige Trainingseinheit in sauberem Markdown.

            STRUKTUR-VORGABE:
            1. Warm-Up (Automatisch generiert): Passe das Aufwärmen thematisch an den Hauptteil an. Berücksichtige dabei den Rhythmus (z.B. brasilianische Ginga-Bewegungen, fließende Koordination).
            2. Hauptteil (Vom Trainer gewünscht): Beschreibe die Übung extrem detailliert. Nutze "Kopfkino", um den Aufbau (Feldmaße) und den chronologischen Ablauf ohne Bilder glasklar zu erklären.
            3. Cool-Down (Automatisch generiert): Spezifisches Auslaufen und Dehnen, passend zur Belastung des Hauptteils.

            TONFALL: Hochprofessionell, analytisch (Niveau: Nagelsmann). Integriere geforderte Stil-Elemente (z.B. "Afrika-Style" für Rhythmus) fachlich fundiert in die Bewegungsabläufe, ohne ins Lächerliche abzurutschen. Keine Platzhalter, keine JSON-Daten, keine Code-Blöcke. Nur perfekter Text.`;

        const result = await runAiGeneration(localGenAI, prompt, systemInstruction);
        res.json({ response: result.text, modelUsed: result.model });
        
    } catch (e) {
        console.error("[api/ai-chat] Fatal Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/hydrate', async (req, res) => {
    const { clubName, fussballDeUrl, apiKey, epicKey } = req.body;
    const finalKey = epicKey || apiKey || GEMINI_API_KEY;
    let players = [];
    let clubLevel = 'AMATEUR';
    let source = 'search';
    let league = '';
    let primaryColor = '#00f3ff';
    let secondaryColor = '#e21b4d';
    let logoUrl = '';

    try {
        let squadUrl = null;
        let cleanUrl = (fussballDeUrl || '').split('#')[0].split('?')[0];
        if (cleanUrl && cleanUrl.includes('fussball.de')) {
            if (cleanUrl.includes('/mannschaft/')) {
                squadUrl = cleanUrl.replace('/tabellen/', '/spieler/').replace('/ergebnisse/', '/spieler/');
            }
        } else if (clubName) {
            const searchUrl = `https://www.fussball.de/suche.ergebnisse/-/search-text/${encodeURIComponent(clubName)}`;
            const searchResp = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const searchHtml = await searchResp.text();
            const teamMatch = searchHtml.match(/\/mannschaft\/[^"]+/);
            if (teamMatch) squadUrl = `https://www.fussball.de${teamMatch[0].replace('/zeugnis/', '/spieler/')}`;
        }

        let rawHtmlBlocks = [];
        if (squadUrl) {
            const squadResp = await fetch(squadUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const squadHtml = await squadResp.text();
            const lineupRegex = /<a[^>]+class="player-wrapper[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
            const matches = [...squadHtml.matchAll(lineupRegex)];
            rawHtmlBlocks = matches.slice(0, 24).map(m => ({
                html: m[0].replace(/\s+/g, ' ').substring(0, 800),
                photo: m[0].match(/(?:src|data-responsive-image)="([^"]+)"/)?.[1]
            }));
        }

        if (finalKey && rawHtmlBlocks.length > 0) {
            const localGenAI = new GoogleGenerativeAI(finalKey);
            const aiPrompt = `Task: Hydrate a football squad. Return JSON only. Club: ${clubName}. Blocks: ${JSON.stringify(rawHtmlBlocks)}`;
            const result = await runAiGeneration(localGenAI, aiPrompt, null, "application/json");
            const parsed = JSON.parse(result.text);
            players = (parsed.players || []).map((p, i) => ({ ...p, id: Date.now() + i }));
        }
    } catch (err) { console.warn('[hydrate] Error:', err.message); }

    res.json({ ok: true, clubName, league, logoUrl, primaryColor, secondaryColor, players, source, clubLevel });
});

app.post('/api/generate-tactic', async (req, res) => {
    try {
        const { exercise, department, apiKey, playerContext, teamId, fussballDeUrl, clubContext: reqContext, isNlz, ageGroup } = req.body;
        
        // Choose the appropriate system instruction
        const effectiveSystemPrompt = (isNlz || department === "NLZ")
            ? NLZ_TACTIC_SYSTEM_INSTRUCTION 
            : TACTIC_SYSTEM_INSTRUCTION;
        
        // Enrich prompt with ageGroup if in NLZ mode
        const ageContext = (isNlz || department === "NLZ") && ageGroup ? ` Altersklasse: ${ageGroup}.` : "";
        const enrichedExercise = `${exercise}${ageContext}`;
        
        // Use request context if provided, otherwise fallback to global
        const effectiveContext = reqContext || clubContext;
        const finalKey = apiKey || GEMINI_API_KEY;
        if (!finalKey) return res.status(401).json({ error: "Missing API Key" });

        let scoutingContext = "";
        
        // Phase 2: Live-Data Fetching
        if (teamId) {
            scoutingContext = await fetchProScouting(teamId);
        } else if (fussballDeUrl) {
            scoutingContext = await fetchAmateurScouting(fussballDeUrl);
        }

        const localGenAI = new GoogleGenerativeAI(finalKey);
        
        const contextInfo = (isNlz || department === "NLZ")
            ? `Fokus: NLZ-Niveau (${ageGroup || 'Kader'}). Schwerpunkt auf kognitive und technische Ausbildung.`
            : (department === "Senioren" ? "Fokus: Profi-Niveau, maximale taktische Komplexität." : `Fokus: Allgemein (${playerContext || 'Kader'}).`);

        let finalPrompt = "";
        if (scoutingContext) {
            finalPrompt = `Hier sind die echten Live-Daten:\n${scoutingContext}\n\nErstelle auf dieser Basis eine knallharte Gegneranalyse und leite Trainingsschwerpunkte für das Thema "${exercise}" ab. ${contextInfo}`;
        } else if (effectiveContext && effectiveContext.liveIntelligence) {
            const intel = effectiveContext.liveIntelligence;
            const intelCtx = `VEREIN: ${effectiveContext.officialClubName || effectiveContext.name}\nGEGNER: ${intel.nextMatch}\nFORM: ${intel.form}\nANALYSE: ${intel.analyticalSummary}`;
            finalPrompt = `Nutze diesen Simulations-Kontext (März 2026) für deine Analyse:\n${intelCtx}\n\nErstelle eine Matchday-Analyse und Trainingsschwerpunkte zum Thema: "${exercise}". ${contextInfo}`;
        } else {
            finalPrompt = `Erstelle eine komplette Trainingseinheit zum Thema: "${enrichedExercise}". ${contextInfo}`;
        }

        // Enable Search Grounding for Tactic Generation if Senioren or explicitly requested (and not in purely pedagogical NLZ mode)
        const useSearchForTactic = (department === "Senioren" || !!scoutingContext) && !isNlz;
        const result = await runAiGeneration(localGenAI, finalPrompt, effectiveSystemPrompt, null, useSearchForTactic);
        const fullResponse = result.text;
        
        // Extract JSON block (TEIL 2)
        let markdownText = fullResponse;
        let tacticJson = null;
        
        const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/) || fullResponse.match(/({[\s\S]*"taktiktafel"[\s\S]*})/);
        if (jsonMatch) {
            try {
                tacticJson = JSON.parse(jsonMatch[1]);
                markdownText = fullResponse.replace(jsonMatch[0], "").trim();
            } catch (jsonErr) {
                console.warn("[api/generate-tactic] JSON Parse failed:", jsonErr.message);
            }
        }
        
        res.json({ 
            markdownText, 
            tacticJson, 
            modelUsed: result.model, 
            scoutingUsed: !!scoutingContext,
            groundingSources: result.sources 
        });
    } catch (e) {
        console.error("[api/generate-tactic] Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/logistics-search', async (req, res) => {
    try {
        const { query, apiKey, clubInfo } = req.body;
        const finalKey = apiKey || GEMINI_API_KEY;
        const localGenAI = new GoogleGenerativeAI(finalKey);
        
        const currentContext = JSON.stringify(clubContext || "Stark Elite Standard");
        const prompt = `Suche nach "${query}" für "${clubInfo?.name || 'Stark Elite'}". 
        Club Context (Wichtig für Branding/Stil): ${currentContext}.
        Colors: ${clubInfo?.colors}. Return JSON array in \`\`\`json\`\`\`.`;

        const result = await runAiGeneration(localGenAI, prompt, LOGISTICS_SYSTEM_INSTRUCTION);
        const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/);
        
        if (jsonMatch) res.json(JSON.parse(jsonMatch[1]));
        else res.json([ { title: `${query} Premium`, price: "49.99 €", source: "Amazon", link: "https://amazon.de", sponsorPotential: "High", colorMatch: "Perfect" } ]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/sponsor-inquiry', async (req, res) => {
    try {
        const { sponsorName, materialName, clubInfo, apiKey } = req.body;
        const finalKey = apiKey || GEMINI_API_KEY;
        const localGenAI = new GoogleGenerativeAI(finalKey);

        const currentContext = JSON.stringify(clubContext || "Stark Elite Standard");
        const prompt = `Schreibe eine Sponsoring-Anfrage an "${sponsorName}" für "${materialName}" (${clubInfo?.name}). 
        Aktueller Club-Status (Nutze dies für die Verhandlung): ${currentContext}.
        Colors: ${clubInfo?.colors}. Elitär, max 200 Wörter.`;

        const result = await runAiGeneration(localGenAI, prompt);
        res.json({ email: result.text, modelUsed: result.model });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/set-context', (req, res) => {
    const { context } = req.body;
    if (context) {
        clubContext = context;
        console.log("[PROXY] Context updated manually:", clubContext.officialClubName);
        res.json({ success: true, context: clubContext });
    } else {
        res.status(400).json({ error: "Missing context object" });
    }
});

app.get('/api/get-context', (req, res) => {
    res.json(clubContext || { status: "No context set" });
});

// --- ISOLATED NLZ MODULE ROUTES ---

/**
 * PHASE 1: Vision Scanner
 * Extracts match data from schedule screenshots (Fussball.de / PDF)
 */
app.post('/api/nlz/scan-schedule', async (req, res) => {
    try {
        const { base64Image, apiKey } = req.body;
        const finalKey = apiKey || GEMINI_API_KEY;
        if (!finalKey) return res.status(401).json({ error: "Missing API Key" });

        const localGenAI = new GoogleGenerativeAI(finalKey);
        const model = localGenAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `Du bist der NLZ-Datenanalyst. Lese diesen Spielplan-Screenshot aus. 
        Extrahiere: Nächster Gegner, Datum (YYYY-MM-DD), Uhrzeit, Heim/Auswärts. 
        Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt.
        Format: { "opponent": "...", "match_date": "...", "time": "...", "location": "Heim/Auswärts" }`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" } }
        ]);

        const responseText = result.response.text();
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/({[\s\S]*})/);
        
        if (jsonMatch) {
            res.json(JSON.parse(jsonMatch[1]));
        } else {
            throw new Error("Konnte Daten nicht aus dem Bild extrahieren.");
        }
    } catch (e) {
        console.error("[NLZ Vision] Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

/**
 * PHASE 2: Training & Match Planner
 */
app.post('/api/nlz/generate-plan', async (req, res) => {
    try {
        const { opponent, matchDate, apiKey } = req.body;
        const finalKey = apiKey || GEMINI_API_KEY;
        const localGenAI = new GoogleGenerativeAI(finalKey);
        const model = localGenAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            systemInstruction: "Du bist NLZ-Planungskoordinator. Fokus: Altersgerechte Belastungssteuerung und taktische Ausbildung."
        });

        const prompt = `Unser nächstes Spiel ist am ${matchDate} gegen ${opponent}. 
        Plane auf Basis dieses Datums die optimalen zwei Trainingstage der Woche und schlage den taktischen Fokus vor (NLZ-gerecht).
        Antworte in strukturiertem Markdown mit klaren Überschriften.`;

        const result = await model.generateContent(prompt);
        res.json({ plan: result.response.text() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PHASE 3: Auto-Press / Eltern-Info
 */
app.post('/api/nlz/generate-press', async (req, res) => {
    try {
        const { opponent, matchDate, trainingFocus, apiKey } = req.body;
        const finalKey = apiKey || GEMINI_API_KEY;
        const localGenAI = new GoogleGenerativeAI(finalKey);
        const model = localGenAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `Nutze die Daten zum nächsten Gegner (${opponent}, ${matchDate}) und unseren Trainingsfokus (${trainingFocus}). 
        Schreibe einen professionellen, aber jugendgerechten kurzen Vorbericht/Elternbrief für unsere Vereinswebsite. 
        Fokus auf Entwicklung und Vorfreude, nicht auf reinen Ergebnisfußball.`;

        const result = await model.generateContent(prompt);
        res.json({ report: result.response.text() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/extract-roster', async (req, res) => {
    try {
        const { base64Image, mimeType, prompt, apiKey } = req.body;
        const finalKey = apiKey || GEMINI_API_KEY;
        if (!finalKey) return res.status(401).json({ error: "Missing API Key" });

        const localGenAI = new GoogleGenerativeAI(finalKey);
        // Using SDK which resolves correct underlying model IDs for us
        const model = localGenAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType || "image/png"
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        res.json({ result: responseText });
    } catch (e) {
        console.error("Roster Extraction Error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/generate-lineup', async (req, res) => {
    try {
        const { text, apiKey } = req.body;
        const finalKey = apiKey || GEMINI_API_KEY;
        if (!finalKey) return res.status(401).json({ error: "Missing API Key" });

        const localGenAI = new GoogleGenerativeAI(finalKey);
        const model = localGenAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            systemInstruction: LINEUP_SYSTEM_INSTRUCTION 
        }, { apiVersion: 'v1beta' });

        const prompt = `Strukturiere diese Aufstellung um: "${text}"`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from potential Markdown blocks
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/({[\s\S]*})/);
        if (jsonMatch) {
            const lineupData = JSON.parse(jsonMatch[1]);
            res.json(lineupData);
        } else {
            throw new Error("Konnte Aufstellung nicht strukturieren.");
        }
    } catch (e) {
        console.error("[api/generate-lineup] Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => console.log(`Proxy on port ${PORT}`));

