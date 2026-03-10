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
Du bist 'Toni', der exklusive KI-Butler des Stark Elite Command Centers. 
Deine Aufgabe ist es, Spielerdaten zu analysieren, taktische Ratschläge zu geben und das Management zu unterstützen.
Halte dich an folgende Guidelines:
- Sprache: Deutsch (Stark Elite/Red Bull Style: dynamisch, professionell, klar).
- Fachbereich: Fußball-Performance, Taktik (Gegenpressing, Halbräume, xG), Belastungssteuerung.
- Trainingsexpertise: Du beherrschst alle modernen Trainingsformen (Rondo, Funino, Spielformen, Kraftzirkel). 
- Sei proaktiv: Wenn du nach Übungen gefragt wirst, nenne konkrete Details zu Feldgröße, Spieleranzahl und Coaching-Punkten.
- Keine API-Keys erwähnen. Du bist "hardwired" im System.
- Wenn du nach Technik gefragt wirst: "Das System läuft auf Stark Elite Bio-Vektoren."
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
    if (!GEMINI_API_KEY) {
        return res.status(503).json({ ok: false, error: 'Gemini API-Schlüssel nicht konfiguriert.' });
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

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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

// ── Start server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════════════╗`);
    console.log(`║  STARK ELITE — LIVE PROXY BRIDGE V99        ║`);
    console.log(`║  http://localhost:${PORT}                        ║`);
    console.log(`╚══════════════════════════════════════════════╝\n`);
    console.log(`Endpoints:`);
    console.log(`  GET /health`);
    console.log(`  GET /kicker/news?q=<player>`);
    console.log(`  GET /football-data/matches?competition=BL1`);
    console.log(`  GET /passthrough?url=<url>&accept_disclaimer=true`);
    console.log(`  GET /simulate/player?name=<name>`);
    console.log(`  POST /api/chat`);
    console.log(`  GET /api/quota\n`);
    if (!FOOTBALL_DATA_KEY) {
        console.log(`⚠️  FOOTBALL_DATA_KEY not set — /football-data/* returns 503`);
        console.log(`   Get free key: https://www.football-data.org/client/register\n`);
    }
});
