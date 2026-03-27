const axios = require('axios');
const cheerio = require('cheerio');

async function testKicker() {
    try {
        const teamName = 'RB Leipzig'.toLowerCase().replace(' ', '-');
        const url = `https://www.kicker.de/${teamName}/info`;
        console.log("Fetching: ", url);
        
        const res = await axios.get(url, {
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'}
        });
        
        const $ = cheerio.load(res.data);
        
        const matchData = { lastMatch: null, nextMatch: null };
        
        // Kicker has a "Vereins-Info" block with last and next match.
        // Let's just find the generic `.kick__v100-gameCell`
        const games = [];
        $('.kick__v100-gameCell').each((i, el) => {
            const date = $(el).find('.kick__v100-gameCell__date').text().trim();
            const home = $(el).find('.kick__v100-gameCell__team__name').eq(0).text().trim();
            const away = $(el).find('.kick__v100-gameCell__team__name').eq(1).text().trim();
            const result = $(el).find('.kick__v100-scoreBoard__score--concluded').text().trim() || $(el).find('.kick__v100-scoreBoard__date').text().trim();
            
            if (home && away) {
               games.push({ date, home, away, result });
            }
        });
        
        console.log("Kicker Games Found:");
        console.log(games);
        
    } catch (e) {
        console.log("Error:", e.message);
    }
}
testKicker();
