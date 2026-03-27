const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const { data } = await axios.get('https://www.transfermarkt.com/eintracht-frankfurt/kader/verein/24', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const $ = cheerio.load(data);
  const players = [];
  $('.items > tbody > tr').each((i, el) => {
    const row = $(el);
    const inlines = row.find('.inline-table');
    if(inlines.length > 0) {
      const name = inlines.find('td.hauptlink a').text().trim();
      const pos = inlines.find('tr').eq(1).find('td').text().trim();
      if(name) {
         players.push({ name, position: pos });
      }
    }
  });
  console.log(players.slice(0, 5));
}
test();
