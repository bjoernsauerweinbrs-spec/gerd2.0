/**
 * STARK ELITE — LIVE DATA PROXY BRIDGE (V100)
 * Node.js / Express proxy server
 */

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

app.get('/health', (req, res) => res.json({ status: 'ok', server: 'Stark Elite Proxy' }));

app.post('/api/verify-gemini', async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) return res.status(400).json({ error: "No key provided" });
        
        // Lightweight ping to check if key is valid
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
        let isMatchUrl = false;

        let cleanUrl = (fussballDeUrl || '').split('#')[0].split('?')[0];
        if (cleanUrl && cleanUrl.includes('fussball.de')) {
            if (cleanUrl.includes('/mannschaft/')) {
                squadUrl = cleanUrl.replace('/tabellen/', '/spieler/').replace('/ergebnisse/', '/spieler/');
            } else if (cleanUrl.includes('/spiel/')) {
                const matchIdMatch = cleanUrl.match(/\/spiel\/([A-Z0-9]+)/);
                if (matchIdMatch) {
                    squadUrl = `https://www.fussball.de/ajax.match.lineup/-/mode/PAGE/spiel/${matchIdMatch[1]}`;
                    isMatchUrl = true;
                }
            }
        } else if (clubName && (clubName.toLowerCase().includes('sv') || clubName.toLowerCase().includes('sg') || clubName.toLowerCase().includes('fc') || clubName.toLowerCase().includes('tsv'))) {
            const searchUrl = `https://www.fussball.de/suche.ergebnisse/-/search-text/${encodeURIComponent(clubName)}`;
            const searchResp = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const searchHtml = await searchResp.text();
            const teamMatch = searchHtml.match(/\/mannschaft\/[^"]+/);
            if (teamMatch) {
                squadUrl = `https://www.fussball.de${teamMatch[0].replace('/zeugnis/', '/spieler/')}`;
            }
        }

        let rawHtmlBlocks = [];
        if (squadUrl) {
            console.log(`[hydrate] Scraping: ${squadUrl}`);
            const squadResp = await fetch(squadUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'de-DE,de;q=0.9',
                    'Referer': 'https://www.google.com/'
                }
            });
            const squadHtml = await squadResp.text();

            if (squadUrl.includes('transfermarkt')) {
                // Transfermarkt logic
                console.log('[hydrate] Using Transfermarkt parser');
                // Basic tm crest extraction
                const logoMatch = squadHtml.match(/src="([^"]+)"\s+alt="[^"]+"\s+class="data-header__profile-image"/);
                if (logoMatch) logoUrl = logoMatch[1];
                
                // Matches standard table rows or grid items containing player info
                const lineupRegex = /<tr class="(odd|even)">([\s\S]*?)<\/tr>/g;
                let matches = [...squadHtml.matchAll(lineupRegex)];
                
                rawHtmlBlocks = matches.slice(0, 35).map(m => {
                    const block = m[0];
                    const imgMatch = block.match(/data-src="([^"]+)"/);
                    const numberMatch = block.match(/<div class="rn_nummer">([^<]+)<\/div>/);
                    return {
                        html: block.replace(/\s+/g, ' ').substring(0, 1000), // Larger block for tm stats
                        photo: imgMatch ? imgMatch[1] : null,
                        number: numberMatch ? numberMatch[1].trim() : ''
                    };
                });
            } else {
                // Default fussball.de logic
                console.log('[hydrate] Using Fussball.de parser');
                const logoMatch = squadHtml.match(/src="([^"]+crest[^"]+)"/) ||
                    squadHtml.match(/<div class="club-logo">[\s\S]*?src="([^"]+)"/) ||
                    squadHtml.match(/<div class="header-logo">[\s\S]*?src="([^"]+)"/);
                if (logoMatch) {
                    logoUrl = logoMatch[1].startsWith('//') ? `https:${logoMatch[1]}` : logoMatch[1];
                }

                const lineupRegex = /<a[^>]+class="player-wrapper[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
                const squadRegex = /<div class="name">[\s\S]*?(?:src|data-responsive-image)="[^"]+"[\s\S]*?<\/div>/g;

                let matches = [...squadHtml.matchAll(lineupRegex)];
                if (matches.length === 0) matches = [...squadHtml.matchAll(squadRegex)];

                rawHtmlBlocks = matches.slice(0, 24).map(m => {
                    const block = m[0];
                    const imgMatch = block.match(/(?:src|data-responsive-image)="([^"]+)"/);
                    const numberMatch = block.match(/class="player-number">([^<]+)</);
                    return {
                        html: block.replace(/\s+/g, ' ').substring(0, 800),
                        photo: imgMatch ? (imgMatch[1].startsWith('//') ? `https:${imgMatch[1]}` : imgMatch[1]) : null,
                        number: numberMatch ? numberMatch[1].trim() : ''
                    };
                });
            }
            console.log(`[hydrate] Blocks: ${rawHtmlBlocks.length}`);
        }

        if (finalKey && rawHtmlBlocks.length > 0) {
            const aiPrompt = `
            Task: De-obfuscate and hydrate a football squad with DEEP HARD FACTS.
            Club: ${clubName || 'Unknown'}
            Blocks: ${rawHtmlBlocks.map((b, i) => `[ID:${i} N:${b.number} C:${b.html}]`).join('\n')}
            
            Return JSON only:
            {
              "club": "...",
              "primaryColor": "#...",
              "secondaryColor": "#...",
              "league": "...",
              "level": "PRO|SEMI_PRO|AMATEUR",
              "stadium": "...",
              "players": [
                {
                  "blockIdx": 0,
                  "name": "RealName",
                  "position": "...",
                  "age": 25,
                  "nationality": "ISO-Code",
                  "marketValue": 1000000,
                  "weeklyWage": 15000,
                  "contractMonths": 24,
                  "preferredFoot": "Right|Left",
                  "height": 185,
                  "stats": {
                    "pac": 75,
                    "sho": 70,
                    "pas": 72,
                    "dri": 74,
                    "def": 68,
                    "phy": 70
                  }
                }
              ]
            }
            
            CRITICAL: Do NOT hallucinate stats. If a field is unavailable, set it to 0 or null.
            `;

            const aiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: aiPrompt }] }],
                    generationConfig: { response_mime_type: "application/json" }
                })
            });
            const aiData = await aiResp.json();

            if (aiData.candidates && aiData.candidates[0]) {
                const aiText = aiData.candidates[0].content.parts[0].text;
                try {
                    const parsed = JSON.parse(aiText);

                    primaryColor = parsed.primaryColor || primaryColor;
                    secondaryColor = parsed.secondaryColor || secondaryColor;
                    league = parsed.league || league;
                    clubLevel = parsed.level || clubLevel;

                    players = (parsed.players || []).map((p, i) => {
                        const block = rawHtmlBlocks[p.blockIdx] || {};
                        return {
                            id: Date.now() + i,
                            name: p.name,
                            position: p.position,
                            photo: block.photo || null,
                            age: p.age || 0,
                            nationality: p.nationality || '??',
                            marketValue: p.marketValue || 0,
                            weeklyWage: p.weeklyWage || 0,
                            contractMonths: p.contractMonths || 0,
                            preferredFoot: p.preferredFoot || 'Right',
                            height: p.height || 180,
                            status: 'fit',
                            stats: p.stats || { pac: 50, sho: 50, pas: 50, dri: 50, def: 50, phy: 50 }
                        };
                    });
                    source = `fussball.de + AI Deep Hydration (v5.0)`;
                } catch (parseErr) {
                    console.error('[hydrate] JSON Parse Error:', parseErr.message);
                    console.log('[hydrate] Raw AI Text:', aiText);
                }
            } else {
                console.error('[hydrate] AI Error or No Candidates:', JSON.stringify(aiData));
            }
        }
    } catch (err) {
        console.warn('[hydrate] General Error:', err.message);
    }

    res.json({
        ok: true,
        clubName: clubName || 'Unknown',
        league,
        logoUrl,
        primaryColor,
        secondaryColor,
        players: players.slice(0, 30),
        totalSquadValue: players.reduce((sum, p) => sum + p.marketValue, 0),
        source,
        clubLevel,
        timestamp: new Date().toISOString(),
    });
});

app.post('/api/scout-search', async (req, res) => {
    const { query, epicKey } = req.body;
    const finalKey = epicKey || GEMINI_API_KEY;

    if (!finalKey) return res.status(401).json({ error: "Missing API Key" });

    try {
        // Search Phase: Use Google Search via Gemini to find player data
        const searchPrompt = `
        Search for live scouting data for: "${query}".
        Extract: Name, Age, current Club, Market Value (TM style), Stats (Pace, Shooting, Passing, Dribbling, Defense, Physical), Nationality.
        Return 3-5 potential matches in JSON format.
        JSON only: { "matches": [{ "name": "...", "club": "...", "age": 0, "marketValue": 0, "stats": {...}, "nationality": "..." }] }
        `;

        const aiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${finalKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: searchPrompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });
        const aiData = await aiResp.json();
        const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const results = JSON.parse(text);

        res.json({ ok: true, matches: results.matches || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/league/trends', async (req, res) => {
    const epicKey = req.query.key || GEMINI_API_KEY;
    if (!epicKey) return res.json({ ok: false, error: "Missing Key" });

    try {
        const trendPrompt = `
        Analyze the current state of professional football leagues (focusing on Regionalliga and 2. Bundesliga).
        Identify 3 major tactical or structural trends.
        Format as JSON: 
        { 
          "trends": [
            { "title": "...", "description": "...", "impact": "HIGH|MEDIUM|LOW" }
          ],
          "league_focus": "Germany"
        }
        `;

        const aiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${epicKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: trendPrompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });
        const aiData = await aiResp.json();
        const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const results = JSON.parse(text);

        res.json({ ok: true, ...results });
    } catch (err) {
        res.json({ ok: false, error: err.message });
    }
});

app.post('/api/fetch-text', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Missing URL" });

    try {
        console.log(`[fetch-text] Scraping generic URL: ${url}`);
        const resp = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        const html = await resp.text();
        
        // Strip out scripts, styles, and SVG blocks first
        let cleanText = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
        cleanText = cleanText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
        cleanText = cleanText.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ');
        
        // Strip all other HTML tags
        cleanText = cleanText.replace(/<[^>]+>/g, ' ');
        
        // Remove extra whitespace, tabs, and newlines
        cleanText = cleanText.replace(/\s+/g, ' ').trim();
        
        // Limit text length to prevent payload being too massive for Gemini (approx 100k chars is safe)
        if (cleanText.length > 100000) {
            cleanText = cleanText.substring(0, 100000);
        }

        console.log(`[fetch-text] Extracted ${cleanText.length} characters of clean text.`);
        res.json({ ok: true, text: cleanText });
    } catch (err) {
        console.error(`[fetch-text] Error:`, err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

let requestCount = 0;
setInterval(() => { requestCount = 0; }, 60000);

app.get('/api/quota', (req, res) => {
    res.json({
        ok: true,
        rpm_current: requestCount,
        rpm_limit: 15,
        percentage: Math.min(Math.round((requestCount / 15) * 100), 100),
        status: requestCount > 12 ? "warning" : "stable"
    });
});

app.post('/api/chat', async (req, res) => {
    requestCount++;
    const { messages, apiKey, persona } = req.body;
    const finalKey = apiKey || GEMINI_API_KEY;

    if (!finalKey) return res.status(401).json({ error: "Missing API Key" });

    try {
        const aiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: messages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }))
            })
        });
        const aiData = await aiResp.json();
        if (!aiData.candidates) {
            console.error("[api/chat] Error response from Gemini API:", JSON.stringify(aiData, null, 2));
            return res.json({ ok: false, text: `API Error: ${aiData.error ? aiData.error.message : JSON.stringify(aiData)}` });
        }
        const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Ich habe aktuell Verbindungsschwierigkeiten zum Core.";
        res.json({ ok: true, text });
    } catch (err) {
        console.error("[api/chat] General Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- NEW SCRAPER MERGE (V2.0) ---
function mapPosition(pos) {
    if(!pos) return "ZM";
    const p = pos.toLowerCase();
    if(p.includes('torwart')) return "TW";
    if(p.includes('innenverteidiger')) return "IV";
    if(p.includes('linker verteidiger')) return "LV";
    if(p.includes('rechter verteidiger')) return "RV";
    if(p.includes('defensives mittelfeld')) return "ZDM";
    if(p.includes('zentrales mittelfeld')) return "ZM";
    if(p.includes('offensives mittelfeld')) return "ZOM";
    if(p.includes('linkes mittelfeld')) return "LM";
    if(p.includes('rechtes mittelfeld')) return "RM";
    if(p.includes('linksaußen')) return "LF";
    if(p.includes('rechtsaußen')) return "RF";
    if(p.includes('mittelstürmer') || p.includes('sturm')) return "ST";
    return "ZM";
}

app.get('/api/scrape', async (req, res) => {
    const rawTeamQuery = req.query.team;
    const apiKey = req.query.apiKey || GEMINI_API_KEY;
    if(!rawTeamQuery) return res.status(400).json({ error: "Missing team query parameter" });

    try {
        console.log(`[SCRAPER] Merged Engine: Incoming for ${rawTeamQuery}`);
        const cheerio = require('cheerio');
        
        // Step 1: Search for the team ID
        const searchUrl = `https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(rawTeamQuery)}`;
        const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const searchHtml = await searchRes.text();
        let $ = cheerio.load(searchHtml);
        
        let officialClubName = rawTeamQuery;
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
            return res.status(404).json({ error: "Verein nicht gefunden." });
        }
        
        clubLink = clubLink.replace('startseite', 'kader');
        const rosterUrl = `https://www.transfermarkt.de${clubLink}`;
        const rosterRes = await fetch(rosterUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const rosterHtml = await rosterRes.text();
        $ = cheerio.load(rosterHtml);
        
        const players = [];
        $('.items > tbody > tr').each((i, el) => {
            const row = $(el);
            const inlines = row.find('.inline-table');
            if(inlines.length > 0) {
              const name = inlines.find('td.hauptlink a').text().trim();
              const pos = inlines.find('tr').eq(1).find('td').text().trim();
              
              // Better Image Logic: Try multiple selectors and data attributes
              let imgTag = row.find('img.bilderrahmen-fixed, img.bilderrahmen, img.profilfoto');
              let imgUrl = imgTag.attr('data-src') || imgTag.attr('src') || null;
              
              if(imgUrl && imgUrl.includes('placeholder')) imgUrl = null;
              if(imgUrl && !imgUrl.startsWith('http')) imgUrl = `https://www.transfermarkt.de${imgUrl}`;

              if(name && !players.find(p => p.name === name)) {
                 players.push({
                     id: players.length + 1,
                     name: name,
                     position: mapPosition(pos),
                     ovr: 75, // Stable default, AI will refine later if needed
                     inSquad: true,
                     imageUrl: imgUrl
                 });
              }
            }
        });

        // LIVE INTELLIGENCE AI - The "Gerd-Sprech" part using Gemini
        let liveIntelligence = {
            lastMatch: "N/A (Keine Live-Daten)",
            nextMatch: "Wird gescannt...",
            form: "?-?-?-?-?",
            tacticalNotes: "Datenextraktion läuft...",
            dataSource: "Gerd Core",
            confidence: 0
        };

        let manualSetupAdvice = null;

        if (apiKey) {
            try {
                const hasPlayers = players.length > 0;
                const aiPrompt = `Du bist GERD 2.0, der High-Performance Director.
                VEREIN: ${officialClubName}
                LIGA: ${league || "Profi-Bereich"}
                SPIELER GEFUNDEN: ${players.length}
                
                AUFGABE (RECHERCHE & ANALYSE):
                1. Suche das absolut aktuellste LETZTE SPIEL von ${officialClubName} (Ergebnis, Gegner, Fazit).
                2. Suche das nächste anstehende PFLICHTSPIEL (Gegner, Datum, Wettbewerb). Wenn kein Spiel bekannt ist, nenne den wahrscheinlichsten nächsten Testspiel-Gegner oder "Saisonvorbereitung".
                3. Erstelle eine GEGNER-ANALYSE für diesen nächsten Gegner (Stärken, Schwächen, taktische Marschroute).
                
                WICHTIG: Sei präzise. Wenn du ${officialClubName} nicht kennst, nutze die Spieler-Liste (${players.slice(0, 5).map(p => p.name).join(", ")}) als Kontext, um den Verein zu identifizieren.
                
                Antworte ZWINGEND als valides JSON-Objekt in diesem Format:
                {
                  "liveIntelligence": {
                     "lastMatch": "Gegner + Ergebnis (z.B. 2:1 gegen FC X) + kurzer Kommentar",
                     "nextMatch": "Nächster Gegner (Name) + Datum/Uhrzeit",
                     "form": "S-S-U-S-N",
                     "tacticalNotes": "Brutale taktische Analyse (Max 40 Wörter)",
                     "opponentStrengths": ["Punkt 1", "Punkt 2"],
                     "opponentWeaknesses": ["Punkt 1", "Punkt 2"],
                     "dataSource": "Gerd 2.0 Engine",
                     "confidence": 95
                  },
                  "manualSetupAdvice": null
                }`;

                const localGenAI = new GoogleGenerativeAI(apiKey);
                const model = localGenAI.getGenerativeModel({ 
                    model: "gemini-1.5-pro",
                    generationConfig: { response_mime_type: "application/json" }
                });

                const result = await model.generateContent(aiPrompt);
                const responseText = result.response.text();
                
                try {
                    const parsed = JSON.parse(responseText);
                    if (parsed.liveIntelligence) {
                        liveIntelligence = parsed.liveIntelligence;
                    }
                    if (parsed.manualSetupAdvice) {
                        manualSetupAdvice = parsed.manualSetupAdvice;
                    }
                } catch (parseErr) {
                    console.error("[SCRAPER] JSON Parse Error from AI:", parseErr);
                    // Fallback attempt to extract JSON if model wrapped it in markdown
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const extracted = JSON.parse(jsonMatch[0]);
                        if (extracted.liveIntelligence) liveIntelligence = extracted.liveIntelligence;
                    }
                }
            } catch (aiErr) {
                console.warn("[SCRAPER] AI Enhancement failed via Gemini 1.5 Pro SDK:", aiErr.message);
            }
        }

        res.json({ 
            success: true, 
            officialClubName, 
            players: players.slice(0, 35), 
            liveIntelligence,
            manualSetupAdvice,
            isHonestFallback: players.length === 0
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/ollama', async (req, res) => {
    try {
        const ollamaResp = await fetch('http://localhost:11434/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        if (!ollamaResp.ok) {
            return res.status(ollamaResp.status).json({ error: `Ollama returned ${ollamaResp.status}` });
        }
        const data = await ollamaResp.json();
        res.json(data);
    } catch (e) {
        console.error("[api/ollama] Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const TACTIC_SYSTEM_INSTRUCTION = `
Du bist Gerd 2.0, ein Elite-Fußballanalyst.
Liefere eine hochprofessionelle Taktik-Analyse in 5 Markdown-Sektionen: [DAS BRIEFING], [KOPFKINO: DER AUFBAU], [DER ABLAUF], [MICRO-COACHING], [WISSENSCHAFTLICHER NUTZEN].
Am absoluten Ende deiner Antwort fügst du ZWINGEND einen JSON-Block für das Frontend-Rendering ein. Nutze X/Y Koordinaten für ein 800x600 Feld.
Format:
\`\`\`json
{
  "feld_typ": "halbfeld",
  "spieler_blau": [{"x": 400, "y": 500, "label": "6er"}],
  "spieler_rot": [{"x": 400, "y": 300, "label": "ST"}],
  "huetchen": [{"x": 200, "y": 200}],
  "linien": [{"start": [400, 500], "ende": [400, 300], "typ": "pass", "farbe": "weiß"}]
}
\`\`\`
`;

app.post('/api/generate-tactic', async (req, res) => {
    try {
        const { exercise, department, apiKey } = req.body;
        const finalKey = apiKey || GEMINI_API_KEY;

        if (!finalKey) return res.status(401).json({ error: "Missing API Key" });

        const localGenAI = new GoogleGenerativeAI(finalKey);
        const model = localGenAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            systemInstruction: TACTIC_SYSTEM_INSTRUCTION
        });

        const context = department === "Senioren" 
            ? "Fokus: Profi-Niveau, maximale taktische Komplexität." 
            : "Fokus: NLZ-Niveau, Schwerpunkt auf kognitive und technische Ausbildung (Ballkontrolle, Bewegung). Seien Sie extrem detailliert bei der Bewegungsschulung.";

        const result = await model.generateContent(`Analysiere die Übung: ${exercise}. ${context}`);
        const responseText = result.response.text();

        // Parser: Extrahiere den JSON-Block aus dem Text
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        let tacticJson = null;
        let markdownText = responseText;

        if (jsonMatch && jsonMatch[1]) {
            try {
                tacticJson = JSON.parse(jsonMatch[1]);
                // Entferne das JSON aus dem Text, der ans Frontend geht
                markdownText = responseText.replace(/```json\n[\s\S]*?\n```/, '').trim();
            } catch (e) {
                console.error("JSON Parsing Error:", e);
            }
        }

        res.json({ markdownText, tacticJson });
    } catch (e) {
        console.error("[api/generate-tactic] Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => console.log(`Proxy on port ${PORT}`));

