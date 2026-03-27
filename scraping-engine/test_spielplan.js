const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
    const rawTeamQuery = 'RB Leipzig';
    const searchUrl = `https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(rawTeamQuery)}`;
    
    try {
        console.log("Fetching search results...");
        const searchRes = await axios.get(searchUrl, {
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'}
        });
        let $ = cheerio.load(searchRes.data);
        
        let clubLink = null;
        $('.items tbody tr').each((i, el) => {
            const row = $(el);
            const aTag = row.find('td.hauptlink a');
            const href = aTag.attr('href');
            if(href && href.includes('/verein/')) {
                clubLink = href;
                return false;
            }
        });
        
        if (clubLink) {
            const startseiteUrl = `https://www.transfermarkt.de${clubLink}`;
            console.log("Fetching Startseite:", startseiteUrl);
            
            const res = await axios.get(startseiteUrl, {
                headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'}
            });
            $ = cheerio.load(res.data);
            
            // On Transfermarkt Startseite, look for Letzte Begegnung
            let letzteData = [];
            $('.box.match-box').each((i, el) => {
               const text = $(el).text().replace(/\s+/g, ' ').trim();
               if(text.includes('Letzte Begegnung') || text.includes('Letztes Spiel')) {
                   letzteData.push({ type: 'Letztes Spiel', raw: text });
               } else if(text.includes('Nächste Begegnung') || text.includes('Nächstes Spiel')) {
                   letzteData.push({ type: 'Nächstes Spiel', raw: text });
               }
               // Also try finding actual teams and results inside the box
               const home = $(el).find('.vereinsname').eq(0).text().trim();
               const away = $(el).find('.vereinsname').eq(1).text().trim();
               const result = $(el).find('.matchresult').text().trim();
               if(home && away) {
                   letzteData.push({ home, away, result });
               }
            });
            
            console.log("Found match boxes:", letzteData);
            
            if (letzteData.length === 0) {
                // Try dumping all matchresult classes
                const results = [];
                $('.matchresult').each((i, el) => results.push($(el).text().trim()));
                console.log("Found match results:", results);
                
                // Try dumping all team names near results
                const teams = [];
                $('.ergebnis-link').parent().parent().text();
                // Just dump text of entire page to see if 'Hoffenheim' is there
                console.log("Has Hoffenheim?", res.data.includes('Hoffenheim'));
                console.log("Has 5:0?", res.data.includes('5:0'));
            }
        }
    } catch (e) {
        console.error(e);
    }
}
testScrape();
