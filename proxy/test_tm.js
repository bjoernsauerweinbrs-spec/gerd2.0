const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
};

async function testScrape() {
    const rawTeamQuery = "TSG Hoffenheim";
    const searchUrl = `https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(rawTeamQuery)}`;
    
    console.log("Fetching:", searchUrl);
    try {
        const searchRes = await fetch(searchUrl, { headers: HEADERS });
        console.log("Status:", searchRes.status);
        const searchHtml = await searchRes.text();
        
        console.log("HTML Start:", searchHtml.substring(0, 500));
        
        let $ = cheerio.load(searchHtml);
        const items = $('.items tbody tr').length;
        console.log("Items found:", items);
        
        $('.items tbody tr').each((i, el) => {
            const row = $(el);
            const aTag = row.find('td.hauptlink a');
            const href = aTag.attr('href');
            const text = aTag.text().trim();
            console.log(`Row ${i}: [${text}] -> ${href}`);
        });
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testScrape();
