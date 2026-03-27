const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
};

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
    if(!rawTeamQuery) return res.status(400).json({ error: "Missing team query parameter" });

    try {
        console.log(`[SCRAPER] Incoming request for: ${rawTeamQuery}`);

        // Step 1: Search for the team ID
        const searchUrl = `https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(rawTeamQuery)}`;
        const searchRes = await axios.get(searchUrl, { headers: HEADERS });
        let $ = cheerio.load(searchRes.data);
        
        // Find first official club link in search results by checking href for '/verein/'
        let officialClubName = rawTeamQuery;
        let clubLink = null;
        
        $('.items tbody tr').each((i, el) => {
            const row = $(el);
            const aTag = row.find('td.hauptlink a');
            const href = aTag.attr('href');
            if(href && href.includes('/verein/')) {
                clubLink = href;
                officialClubName = aTag.text().trim() || rawTeamQuery;
                return false; // Break out of each loop once found
            }
        });
        
        if(!clubLink) {
            console.log(`[SCRAPER] No club link found in search response.`);
            return res.status(404).json({ error: "Verein nicht gefunden." });
        }
        
        // Replace "startseite" with "kader" for the roster
        clubLink = clubLink.replace('startseite', 'kader');
        
        const rosterUrl = `https://www.transfermarkt.de${clubLink}`;
        console.log(`[SCRAPER] Found roster URL: ${rosterUrl}`);

        // Step 2: Extract the Roster
        const rosterRes = await axios.get(rosterUrl, { headers: HEADERS });
        $ = cheerio.load(rosterRes.data);
        
        const players = [];
        $('.items > tbody > tr').each((i, el) => {
            const row = $(el);
            const inlines = row.find('.inline-table');
            if(inlines.length > 0) {
              const name = inlines.find('td.hauptlink a').text().trim();
              const pos = inlines.find('tr').eq(1).find('td').text().trim();
              
              let imgTag = inlines.find('img.bilderrahmen-fixed');
              let imgUrl = imgTag.attr('data-src') || imgTag.attr('src') || null;
              if (imgUrl && imgUrl.includes('default.jpg')) imgUrl = null;
              
              if(name && !players.find(p => p.name === name)) {
                 const mappedPos = mapPosition(pos);
                 players.push({
                     id: players.length + 1,
                     name: name,
                     position: mappedPos,
                     ovr: Math.floor(Math.random() * 15) + 70, // 70-85
                     pac: Math.floor(Math.random() * 30) + 60,
                     def: Math.floor(Math.random() * 30) + 60,
                     phy: Math.floor(Math.random() * 30) + 60,
                     focus: Math.floor(Math.random() * 5) + 5, // 5-10
                     inSquad: true,
                     isInjured: Math.random() < 0.1, // 10% injury chance
                     readiness: Math.floor(Math.random() * 20) + 80,
                     imageUrl: imgUrl
                 });
              }
            }
        });
        
        console.log(`[SCRAPER] Successfully generated roster of length ${players.length}`);
        
        // Always include user's Youth Prospects
        players.push({ id: 201, name: "Wunderkind 1", position: "ZOM", status: "Hot Prospect", potential: "A+", inSquad: true, isInjured: false, ovr: 72, pac: 80, sho: 65, pas: 70, dri: 75, def: 40, phy: 50, readiness: 99 });
        players.push({ id: 202, name: "Top-Talent 2", position: "ST", status: "Beobachtung", potential: "B+", inSquad: true, isInjured: false, ovr: 68, pac: 85, sho: 70, pas: 55, dri: 65, def: 30, phy: 60, readiness: 80 });

        // Simulate Live Web Scraping Match Intelligence (e.g. from Bild.de / Kicker.de)
        let liveIntelligence = {
           lastMatch: "2:1 Auswärtssieg",
           nextMatch: "Heimspiel am Samstag",
           form: "S-S-N-U-S",
           tacticalNotes: "Starkes Umschaltspiel festgestellt."
        };
        
        // Generic Live Intelligence Fallback
        liveIntelligence = {
            lastMatch: `Letztes Spiel von ${officialClubName}`,
            nextMatch: "Wird vom KI-Scout ermittelt...",
            form: "N/A",
            tacticalNotes: `Das System analysiert aktuell die taktischen Muster von ${officialClubName}. Starte die Trainingseinheit, um tiefergehende Analysen zu erhalten.`
        };

        res.json({ 
            success: true, 
            officialClubName: officialClubName, 
            players: players,
            liveIntelligence: liveIntelligence
        });

    } catch (e) {
        console.error(`[SCRAPER] Error parsing for ${rawTeamQuery}:`, e.message);
        res.status(500).json({ error: "Fehler beim Scraping." });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`[GERD V2] Scraping Engine Backend listening on port ${PORT}`);
});
