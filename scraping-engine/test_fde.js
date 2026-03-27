const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Anti-bot evasions
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  });

  const url = 'https://www.fussball.de/mannschaft/jfv-bad-hersfeld-i-jfv-bad-hersfeld-hessen/-/saison/2526/team-id/02QS1505F4000000VS5489B2VUEKSRPC#!/';
  console.log('Navigating to ' + url);
  
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Wait a bit for JS to render
  await new Promise(r => setTimeout(r, 2000));
  
  // Try to find the "Kader" or "Mannschaft" tab and click it
  // Fussball.de usually has something like <a data-tab="tab-roster"> or contains "Kader"
  const kaderFound = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button, li'));
    const kaderLink = links.find(el => el.textContent.trim().toLowerCase() === 'kader');
    if (kaderLink) {
        kaderLink.click();
        return true;
    }
    return false;
  });

  console.log('Kader tab found and clicked?', kaderFound);
  
  if (kaderFound) {
      await new Promise(r => setTimeout(r, 2000));
  } else {
      // Sometimes it's a specific URL section. Let's redirect to /section/kader
      const newUrl = url.replace('#!/', 'section/kader#!/');
      console.log('Trying direct Kader URL: ' + newUrl);
      await page.goto(newUrl, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 2000));
  }

  // Dump some HTML or parse the players
  const players = await page.evaluate(() => {
      // Look for the typical list of players on fussball.de
      const playerElements = document.querySelectorAll('.player, .player-card, .squad-player, .player-item, tr.player, .kader-player');
      const results = [];
      
      if (playerElements.length > 0) {
          playerElements.forEach(el => {
              // Try generic selectors
              const nameEl = el.querySelector('.player-name, .name, [itemprop="name"]');
              const imgEl = el.querySelector('img');
              const posEl = el.querySelector('.player-position, .position');
              
              results.push({
                  name: nameEl ? nameEl.textContent.trim() : el.textContent.trim().replace(/\s+/g, ' '),
                  img: imgEl ? imgEl.src : null,
                  pos: posEl ? posEl.textContent.trim() : 'Unknown'
              });
          });
          return results;
      }
      
      // If we didn't find specific classes, try to find any images in a list
      const allImages = Array.from(document.querySelectorAll('img')).filter(img => 
           img && img.src && (img.src.includes('profile') || img.src.includes('player') || img.src.includes('avatar') || img.src.includes('team'))
      );
      return allImages.map(img => ({
          img: img.src,
          name: img.alt || "Found image only"
      }));
  });

  console.log('Players found:', players.length);
  if (players.length > 0) {
      console.log(players.slice(0, 5));
  } else {
      // Dump text content of the page to find clues
      const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));
      console.log('Page text preview:', text);
      const html = await page.evaluate(() => document.body.innerHTML);
      console.log('HTML snippet contains "Kader"?', html.includes('Kader'), html.includes('spieler'));
  }

  await browser.close();
})();
