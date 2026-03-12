/**
 * STARK ELITE — LIVE DATA PROXY BRIDGE (V99)
 * Node.js / Express proxy server
 * 
 * Data Sources:
 *   ✅ Kicker RSS    — public RSS feeds, no ToS issues
 *   ✅ football-data.org — free API (API key required, set in env)
 *   ⚠️  Transfermarkt passthrough — user must accept disclaimer
 *   ⚠️  FBref passthrough          — user must accept disclaimer
 *
 * Run: node server.js  (from /proxy directory)
 * Port: 3001
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const RSSParser = require('rss-parser');

const app = express();
const parser = new RSSParser({ timeout: 10000 });
const PORT = process.env.PORT || 3001;

// Allow requests from the frontend (file:// or localhost)
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'null', '*'],
    methods: ['GET'],
}));

app.use(express.json());

// ── API Key config (set via env or .env file) ─────────────────────────────
const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_KEY || '';  // https://www.football-data.org/
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

// ── Rate Limiting State (Free Tier: 15 RPM) ───────────────────────────────
let requestLog = [];
const RPM_LIMIT = 15;

function checkRateLimit() {
    const now = Date.now();
    // Remove requests older than 1 minute
    requestLog = requestLog.filter(t => now - t < 60000);
    return requestLog.length < RPM_LIMIT;
}

const SYSTEM_CONTEXT = `
Du bist 'Manager-Gerd 2.0', der strategische Kopf des Stark Elite Command Centers. 
Deine Aufgabe ist die 'Grounded Intelligence': Du analysierst Live-Daten des Truth Objects und triffst operative Entscheidungen.
Halte dich an folgende Guidelines:
- Identität: Du bist kein Textgenerator, du bist der Sportdirektor. Deine Antworten basieren AUF FAKTEN des Systems (Budget, Kader, Taktik).
- Sprache: Deutsch (Stark Elite/Red Bull Style: hoch-analytisch, direkt, Sportdirektor-Ebene).
- Fachbereich: Kaderplanung, Financial Engineering, Taktik-Architektur, NLZ-Entwicklung.
- Proaktivität: Identifiziere Schwachstellen im Kader oder im Budget ungefragt.
- Keine API-Keys erwähnen. Du bist die zentrale Intelligenz des Vereins.
`;

// ── /health ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        version: 'V99',
        timestamp: new Date().toISOString(),
        sources: {
            kicker_rss: true,
            football_data_org: !!FOOTBALL_DATA_KEY,
            transfermarkt: 'passthrough — user disclaimer required',
            fbref: 'passthrough — user disclaimer required',
        }
    });
});

// ── /kicker/news — Kicker RSS Feed ───────────────────────────────────────
app.get('/kicker/news', async (req, res) => {
    const query = req.query.q || '';
    try {
        const feed = await parser.parseURL(
            'https://newsfeed.kicker.de/news/fussball'
        );
        const items = feed.items
            .filter(item => !query || item.title?.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10)
            .map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                summary: item.contentSnippet?.slice(0, 200),
                source: { name: 'Kicker', logo: 'https://www.kicker.de/images/logo-kicker.png' },
                tag: 'LIVE',
            }));
        res.json({ ok: true, count: items.length, items });
    } catch (err) {
        res.status(502).json({ ok: false, error: err.message, source: 'kicker_rss' });
    }
});

// ── /football-data/player — football-data.org player lookup ──────────────
app.get('/football-data/competitions', async (req, res) => {
    if (!FOOTBALL_DATA_KEY) {
        return res.status(503).json({
            ok: false,
            error: 'No FOOTBALL_DATA_KEY set. Add to environment: FOOTBALL_DATA_KEY=your_key',
            hint: 'Free key at https://www.football-data.org/client/register'
        });
    }
    try {
        const resp = await fetch('https://api.football-data.org/v4/competitions', {
            headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY }
        });
        const data = await resp.json();
        res.json({ ok: true, tag: 'LIVE', source: 'football-data.org', data });
    } catch (err) {
        res.status(502).json({ ok: false, error: err.message });
    }
});

app.get('/football-data/matches', async (req, res) => {
    if (!FOOTBALL_DATA_KEY) {
        return res.status(503).json({ ok: false, error: 'API key required' });
    }
    const comp = req.query.competition || 'BL1'; // Bundesliga
    try {
        const resp = await fetch(
            `https://api.football-data.org/v4/competitions/${comp}/matches?status=FINISHED&limit=5`,
            { headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY } }
        );
        const data = await resp.json();
        res.json({ ok: true, tag: 'LIVE', source: 'football-data.org', matches: data.matches || [] });
    } catch (err) {
        res.status(502).json({ ok: false, error: err.message });
    }
});

// ── /passthrough — Generic proxy with disclaimer ──────────────────────────
// User must explicitly pass ?accept_disclaimer=true
app.get('/passthrough', async (req, res) => {
    const { url, accept_disclaimer } = req.query;

    if (!accept_disclaimer || accept_disclaimer !== 'true') {
        return res.status(403).json({
            ok: false,
            error: 'DISCLAIMER_REQUIRED',
            message: 'This endpoint proxies third-party websites. You must confirm that accessing this data complies with the target site\'s Terms of Service and applicable law in your jurisdiction. Pass ?accept_disclaimer=true to proceed.',
        });
    }

    if (!url) return res.status(400).json({ ok: false, error: 'url parameter required' });

    // Allowlist: only specific domains
    const allowedDomains = [
        'transfermarkt.de',
        'fbref.com',
        'kicker.de',
        'sofascore.com',
    ];
    const targetHost = new URL(url).hostname;
    if (!allowedDomains.some(d => targetHost.endsWith(d))) {
        return res.status(403).json({ ok: false, error: `Domain ${targetHost} not in allowlist` });
    }

    try {
        const resp = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; StarkEliteResearch/1.0)',
                'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
            },
            timeout: 15000,
        });
        const html = await resp.text();
        res.set('Content-Type', 'text/html');
        res.set('X-Proxy-Source', targetHost);
        res.set('X-Data-Tag', 'LIVE-PASSTHROUGH');
        res.send(html);
    } catch (err) {
        res.status(502).json({ ok: false, error: err.message });
    }
});

// ── /simulate/player — SIM data (fallback when no API key) ───────────────
app.get('/simulate/player', (req, res) => {
    const name = req.query.name || 'Player';
    const seed = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const rand = (min, max) => min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min);

    res.json({
        ok: true,
        tag: 'SIM',
        player: name,
        data: {
            xg_last5: +(rand(0.2, 0.9)).toFixed(2),
            goals_last5: Math.floor(rand(1, 6)),
            assists_last5: Math.floor(rand(0, 5)),
            duels_won_pct: +(rand(45, 75)).toFixed(1),
            progressive_carries: Math.floor(rand(6, 20)),
            market_value_m: Math.floor(rand(15, 150)),
            contract_months: Math.floor(rand(6, 36)),
            form_trend: rand(0, 1) > 0.5 ? '+' : '-',
        },
        timestamp: new Date().toISOString(),
        source: { name: 'Stark Elite Internal Model', url: null }
    });
});



// ── /api/chat — Gemini Universal Proxy ──────────────────────────────────
app.post('/api/chat', async (req, res) => {
    const reqKey = req.body.apiKey;
    const finalKey = reqKey || GEMINI_API_KEY;

    if (!finalKey) {
        return res.status(403).json({ ok: false, error: 'Gemini API-Schlüssel nicht konfiguriert.' });
    }

    if (!checkRateLimit()) {
        return res.status(429).json({
            ok: false,
            error: 'Der Butler ist gerade im Gespräch. Bitte versuchen Sie es in wenigen Sekunden erneut.'
        });
    }

    const { messages, persona = 'Trainer-Toni' } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ ok: false, error: 'Ungültiges Nachrichtenformat.' });
    }

    // RPM Tracking
    requestLog.push(Date.now());

    try {
        const userPrompt = messages[messages.length - 1].content;
        const fullPrompt = `${SYSTEM_CONTEXT}\nAktuelle Persona: ${persona}\nUser-Anfrage: ${userPrompt}`;

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${finalKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    maxOutputTokens: 800,
                    temperature: 0.7,
                }
            })
        });

        const data = await resp.json();

        if (data.error) {
            throw new Error(data.error.message || 'Gemini API Error');
        }

        const aiText = data.candidates[0].content.parts[0].text;
        res.json({ ok: true, text: aiText });
    } catch (err) {
        console.error('Gemini Proxy Error:', err);
        res.status(502).json({ ok: false, error: 'Kommunikationsfehler mit der KI-Zentrale.' });
    }
});

// ── /api/ai/morning-call — State-Grounded Executive Briefing ──────────
app.post('/api/ai/morning-call', async (req, res) => {
    const reqKey = req.body.apiKey;
    const finalKey = reqKey || GEMINI_API_KEY;
    if (!finalKey) return res.status(503).json({ ok: false, error: 'AI Core offline.' });
    if (!checkRateLimit()) return res.status(429).json({ ok: false, error: 'System overload. Try later.' });

    const { truthObject } = req.body;
    if (!truthObject) return res.status(400).json({ ok: false, error: 'No Truth Object provided.' });

    requestLog.push(Date.now());

    try {
        const clubName = truthObject.club_identity?.name || 'Unbekannter Verein';
        const budget = truthObject.financials?.current_budget || 0;
        const squadSize = truthObject.players?.length || 0;
        const formation = truthObject.tactical_setup?.formation_home || '4-4-2';

        const prompt = `Führe einen 'Executive Intelligence Briefing' für den Club ${clubName} durch.
        DATEN-BASIS (Ground Truth):
        - Budget: € ${budget.toLocaleString()}
        - Kader-Größe: ${squadSize} Spieler
        - Formation: ${formation}
        
        AUFGABE:
        Analysiere den aktuellen Zustand. Erstelle 3 prägnante strategische Prioritäten. 
        Wenn das Budget niedrig ist (< €1M), fordere Sponsoring-Aquise. 
        Wenn der Kader klein ist (< 18), fordere Scouting-Aktivität.
        Stil: Hoch-analytisch, Klopp/Nagelsmann Mix, keine Floskeln.`;

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${finalKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${SYSTEM_CONTEXT}\n\n${prompt}` }] }],
                generationConfig: { maxOutputTokens: 500, temperature: 0.6 }
            })
        });

        const data = await resp.json();
        const briefing = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Daten-Analyse fehlgeschlagen.';
        res.json({ ok: true, briefing });
    } catch (err) {
        console.error('Morning Call Error:', err);
        res.status(502).json({ ok: false, error: 'Neural link corrupted.' });
    }
});

// ── /api/youtube/playlist — YouTube Proxy ──────────────────────────────
app.get('/api/youtube/playlist', async (req, res) => {
    const { playlistId } = req.query;
    if (!YOUTUBE_API_KEY) {
        return res.status(503).json({ ok: false, error: 'YouTube API-Schlüssel nicht konfiguriert.' });
    }
    if (!playlistId) return res.status(400).json({ ok: false, error: 'playlistId erforderlich.' });

    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.error) throw new Error(data.error.message);

        const items = data.items.map(item => ({
            title: item.snippet.title,
            url: item.snippet.resourceId.videoId,
            isYouTube: true,
            analysis: item.snippet.description.slice(0, 150) + '...'
        }));

        res.json({ ok: true, items });
    } catch (err) {
        console.error('YouTube Proxy Error:', err);
        res.status(502).json({ ok: false, error: err.message });
    }
});

// ── /api/quota — Monitoring ───────────────────────────────────────────────
app.get('/api/quota', (req, res) => {
    const now = Date.now();
    requestLog = requestLog.filter(t => now - t < 60000);
    res.json({
        ok: true,
        rpm_current: requestLog.length,
        rpm_limit: RPM_LIMIT,
        percentage: Math.round((requestLog.length / RPM_LIMIT) * 100),
        status: requestLog.length > (RPM_LIMIT * 0.8) ? 'warning' : 'stable'
    });
});

// ── /fussball-de — Data scouting (passthrough with disclaimer) ─────────────
app.get('/fussball-de/team', async (req, res) => {
    const verein = req.query.verein || '';
    const disclaimer = req.query.accept_disclaimer;

    if (disclaimer !== 'true') {
        return res.status(403).json({
            ok: false,
            error: 'DISCLAIMER_REQUIRED',
            message: 'fussball.de scraping may violate their ToS. Pass ?accept_disclaimer=true to proceed at your own legal responsibility.',
        });
    }

    // Try fussball.de search
    const url = `https://www.fussball.de/spieler/-/${encodeURIComponent(verein)}`;
    try {
        const resp = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'de-DE,de;q=0.9' },
            timeout: 12000,
        });
        const html = await resp.text();
        // Basic name extraction via regex (no cheerio import needed)
        const names = [...html.matchAll(/class="name">([^<]+)</g)].map(m => m[1].trim()).slice(0, 25);
        res.json({ ok: true, tag: 'LIVE', source: 'fussball.de', verein, players: names, count: names.length, disclaimer: 'passthrough' });
    } catch (err) {
        // Return SIM data as fallback
        res.json({ ok: true, tag: 'SIM', source: 'fussball.de-fallback', verein, players: [], error: err.message });
    }
});

// ── /api/hydrate — Deep Data Hydration Engine ────────────────────────────
// POST body: { clubName: "FC Schalke 04" }
// Returns a full HydrationPayload:
//   { ok, clubName, league, logoUrl, primaryColor, secondaryColor,
//     players[], lastFormation, totalSquadValue, source }
app.post('/api/hydrate', async (req, res) => {
    const { clubName, apiKey } = req.body || {};
    const finalKey = apiKey || GEMINI_API_KEY;
    if (!clubName) {
        return res.status(400).json({ ok: false, error: 'clubName required' });
    }

    let players = [];
    let league = '';
    let logoUrl = '';
    let lastFormation = '4-4-2';
    let source = 'ai-generated';

    // ── Step 1: Try football-data.org if key is set ─────────────────────
    if (FOOTBALL_DATA_KEY) {
        try {
            // Search for the team
            const searchResp = await fetch(
                `https://api.football-data.org/v4/teams?name=${encodeURIComponent(clubName)}`,
                { headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY } }
            );
            const searchData = await searchResp.json();
            const team = searchData.teams?.[0];

            if (team) {
                logoUrl = team.crest || '';
                league = team.area?.name || team.runningCompetitions?.[0]?.name || '';

                // Fetch full squad from team endpoint
                const squadResp = await fetch(
                    `https://api.football-data.org/v4/teams/${team.id}`,
                    { headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY } }
                );
                const squadData = await squadResp.json();

                if (squadData.squad?.length > 0) {
                    players = squadData.squad.map((p, i) => {
                        const age = p.dateOfBirth
                            ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()
                            : 24;
                        // Simulate market value based on position and age
                        const positionValues = { Goalkeeper: 3, Defence: 8, Midfield: 12, Offence: 18 };
                        const baseMV = (positionValues[p.position] || 8) * 1_000_000;
                        const ageFactor = age >= 30 ? 0.5 : age <= 23 ? 1.4 : 1;
                        const marketValue = Math.round(baseMV * ageFactor * (0.7 + Math.random() * 0.6));

                        return {
                            id: p.id || i + 1,
                            name: p.name,
                            position: mapPosition(p.position),
                            age,
                            nationality: p.nationality || '—',
                            marketValue,
                            form: 75 + Math.floor(Math.random() * 20),
                            fitness: 80 + Math.floor(Math.random() * 18),
                            sharpness: 70 + Math.floor(Math.random() * 25),
                            stats: simulateStats(p.position),
                            status: 'Fit',
                        };
                    });
                    source = 'football-data.org | live';
                }
            }
        } catch (err) {
            console.warn('[hydrate] football-data.org error:', err.message);
        }
    }

    // ── Step 2: AI fallback — generate squad via Gemini ─────────────────
    if (players.length === 0 && finalKey) {
        try {
            const aiPrompt = `You are a football data expert. Generate a squad for the club: "${clubName}".

STEP 1 — Detect club level from the name:
- If the name contains words like "Real", "FC Barcelona", "Bayern", "Juventus", "Liverpool", "PSG", "Manchester", "Chelsea", "Atletico", or is clearly in top-5 European leagues → level = "PRO"
- If the name sounds like a mid-level club (regional leagues, 2. Bundesliga, Ligue 2, Serie B, etc.) → level = "SEMI_PRO"  
- If the name contains "Kreisliga", "Bezirksliga", "C-Klasse", "D-Klasse", "Jugend", "SV", "TSV", "FC" followed by a small town, or any amateur/grassroots indicators → level = "AMATEUR"
- Default to "SEMI_PRO" if unsure

STEP 2 — Use these rules per level:
- PRO: 20-25 players, marketValue range €5M–€150M, realistic international names (German for Bundesliga, Spanish for La Liga, etc.)
- SEMI_PRO: 16-20 players, marketValue range €50K–€2M, mix of nationalities common to that region
- AMATEUR: 14-17 players, marketValue range €0–€50K (write as integers like 5000 not 5000000), local names matching the region, formation 4-4-2 or 4-3-3

STEP 3 — Return ONLY a valid JSON object (no markdown, no code block, no explanation):
{
  "level": "PRO|SEMI_PRO|AMATEUR",
  "league": "full competition name in German or local language",
  "countryCode": "DE",
  "primaryColor": "#HEXCODE",
  "secondaryColor": "#HEXCODE",
  "lastFormation": "4-4-2",
  "players": [
    { "name": "Full Name", "position": "GK|CB|LB|RB|CDM|CM|CAM|LW|RW|ST", "age": 25, "nationality": "DE", "marketValue": 8000000 }
  ]
}

IMPORTANT RULES:
- Colors must be real hex codes that visually match the club's known kit (if unknown, use dark navy/white or red/white as default)
- Player names must match the nationality of the club's likely home country
- marketValue must be a NUMBER (integer), never a string
- AMATEUR clubs: marketValue should be 0–50000 (NOT millions)
- Include ALWAYS exactly 1 GK in the players array`;


            const aiResp = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${finalKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: aiPrompt }] }],
                        generationConfig: { maxOutputTokens: 2000, temperature: 0.55 }
                    })
                }
            );
            const aiData = await aiResp.json();
            const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                const clubLevel = parsed.level || 'SEMI_PRO';
                league = parsed.league || '';
                lastFormation = parsed.lastFormation || '4-4-2';
                req._clubLevel = clubLevel; // Store for response

                // Extract colors from AI if provided
                if (parsed.primaryColor) req._aiColors = { primary: parsed.primaryColor, secondary: parsed.secondaryColor };

                // Level-aware market value normalization
                const normalizeMarketValue = (rawVal, level) => {
                    const v = Number(rawVal) || 0;
                    if (level === 'AMATEUR') {
                        // AI sometimes returns millions even for amateur — clamp to max 50k
                        return v > 50000 ? Math.round(v / 1000) : v;
                    } else if (level === 'SEMI_PRO') {
                        return Math.min(v, 3_000_000);
                    }
                    return v || 5_000_000; // PRO default
                };

                players = (parsed.players || []).map((p, i) => ({
                    id: Date.now() + i,
                    name: p.name,
                    position: p.position,
                    age: p.age || 24,
                    nationality: p.nationality || '—',
                    marketValue: normalizeMarketValue(p.marketValue, clubLevel),
                    form: 75 + Math.floor(Math.random() * 20),
                    fitness: 80 + Math.floor(Math.random() * 18),
                    sharpness: 70 + Math.floor(Math.random() * 25),
                    stats: simulateStats(p.position),
                    status: 'Fit',
                }));
                source = 'ai-generated | gemini-1.5-flash';
            }
        } catch (err) {
            console.warn('[hydrate] Gemini fallback error:', err.message);
        }
    }

    // ── Step 3: Hard fallback — generic squad ────────────────────────────
    if (players.length === 0) {
        players = generateGenericSquad(clubName);
        source = 'sim | offline-fallback';
    }

    // ── Step 4: Compute branding + financials ────────────────────────────
    const clubColors = getClubColors(clubName);
    const aiColors = req._aiColors;
    const primaryColor = aiColors?.primary || clubColors.primary;
    const secondaryColor = aiColors?.secondary || clubColors.secondary;
    const totalSquadValue = players.reduce((sum, p) => sum + (p.marketValue || 0), 0);

    res.json({
        ok: true,
        clubName,
        league,
        logoUrl,
        primaryColor,
        secondaryColor,
        lastFormation,
        players,
        totalSquadValue,
        transferBudget: Math.round(totalSquadValue * 0.05),
        source,
        clubLevel: req._clubLevel || 'PRO',
        timestamp: new Date().toISOString(),
    });
});

// ── Helper: Map football-data.org positions to short codes ────────────────
function mapPosition(pos) {
    const map = {
        'Goalkeeper': 'GK',
        'Centre-Back': 'CB', 'Left-Back': 'LB', 'Right-Back': 'RB',
        'Defence': 'CB',
        'Defensive Midfield': 'CDM', 'Central Midfield': 'CM',
        'Attacking Midfield': 'CAM', 'Midfield': 'CM',
        'Left Winger': 'LW', 'Right Winger': 'RW',
        'Centre-Forward': 'ST', 'Offence': 'ST',
    };
    return map[pos] || pos?.substring(0, 3).toUpperCase() || 'MF';
}

// ── Helper: Simulate attribute stats per position ─────────────────────────
function simulateStats(position) {
    const rand = (min, max) => min + Math.floor(Math.random() * (max - min));
    if (position === 'GK' || position === 'Goalkeeper') {
        return { pac: rand(55, 70), sho: rand(30, 50), pas: rand(60, 75), dri: rand(50, 65), def: rand(75, 90), phy: rand(72, 85) };
    } else if (['CB', 'LB', 'RB', 'Defence'].includes(position)) {
        return { pac: rand(65, 80), sho: rand(45, 65), pas: rand(64, 78), dri: rand(60, 74), def: rand(75, 90), phy: rand(75, 88) };
    } else if (['CDM', 'CM', 'CAM', 'Midfield'].includes(position)) {
        return { pac: rand(68, 82), sho: rand(60, 78), pas: rand(75, 90), dri: rand(72, 86), def: rand(60, 78), phy: rand(68, 82) };
    } else {
        return { pac: rand(75, 92), sho: rand(75, 92), pas: rand(68, 84), dri: rand(75, 90), def: rand(30, 55), phy: rand(65, 82) };
    }
}

// ── Helper: Known club colors (fallback) ─────────────────────────────────
function getClubColors(name) {
    const n = name.toLowerCase();
    if (n.includes('schalke')) return { primary: '#004B91', secondary: '#FFFFFF' };
    if (n.includes('bayern')) return { primary: '#DC052D', secondary: '#0066B2' };
    if (n.includes('dortmund') || n.includes('bvb')) return { primary: '#FDE100', secondary: '#000000' };
    if (n.includes('leverkusen')) return { primary: '#D20514', secondary: '#000000' };
    if (n.includes('frankfurt')) return { primary: '#E2001A', secondary: '#000000' };
    if (n.includes('stuttgart')) return { primary: '#E00220', secondary: '#FFFFFF' };
    if (n.includes('gladbach') || n.includes('mönchengladbach')) return { primary: '#000000', secondary: '#FFFFFF' };
    if (n.includes('real madrid')) return { primary: '#00529F', secondary: '#FEBE10' };
    if (n.includes('barcelona') || n.includes('barça')) return { primary: '#A50044', secondary: '#004D98' };
    if (n.includes('liverpool')) return { primary: '#C8102E', secondary: '#F6EB61' };
    if (n.includes('manchester city')) return { primary: '#6CABDD', secondary: '#1C2C5B' };
    if (n.includes('arsenal')) return { primary: '#EF0107', secondary: '#063672' };
    return { primary: '#00f3ff', secondary: '#e21b4d' };
}

// ── Helper: Generate a generic squad for complete offline fallback ─────────
function generateGenericSquad(clubName) {
    const positions = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CB', 'CM', 'ST', 'LW'];
    return positions.map((pos, i) => ({
        id: i + 1,
        name: `Spieler ${i + 1} (${clubName})`,
        position: pos,
        age: 22 + Math.floor(Math.random() * 12),
        nationality: 'DE',
        marketValue: (3 + Math.floor(Math.random() * 20)) * 1_000_000,
        form: 75 + Math.floor(Math.random() * 20),
        fitness: 80 + Math.floor(Math.random() * 18),
        sharpness: 70 + Math.floor(Math.random() * 25),
        stats: simulateStats(pos),
        status: 'Fit',
    }));
}

// ── Start server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════════════╗`);
    console.log(`║  STARK ELITE — LIVE PROXY BRIDGE V100       ║`);
    console.log(`║  http://localhost:${PORT}                        ║`);
    console.log(`╚══════════════════════════════════════════════╝\n`);
    console.log(`Endpoints:`);
    console.log(`  GET  /health`);
    console.log(`  GET  /kicker/news?q=<player>`);
    console.log(`  GET  /football-data/matches?competition=BL1`);
    console.log(`  GET  /passthrough?url=<url>&accept_disclaimer=true`);
    console.log(`  GET  /simulate/player?name=<name>`);
    console.log(`  POST /api/chat`);
    console.log(`  POST /api/hydrate    ← NEW: Deep Data Hydration Engine`);
    console.log(`  GET  /api/quota\n`);
    if (!FOOTBALL_DATA_KEY) {
        console.log(`⚠️  FOOTBALL_DATA_KEY not set — /api/hydrate uses AI fallback`);
        console.log(`   Get free key: https://www.football-data.org/client/register\n`);
    }
    if (!GEMINI_API_KEY) {
        console.log(`⚠️  GEMINI_API_KEY not set — /api/hydrate uses offline SIM fallback\n`);
    }
});

