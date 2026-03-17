/**
 * STARK ELITE — LIVE DATA PROXY BRIDGE (V100)
 * Node.js / Express proxy server
 */

const express = require('express');
const cors = require('cors');
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

app.listen(PORT, () => console.log(`Proxy on port ${PORT}`));
