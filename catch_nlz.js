const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Log ALL console output to terminal
    page.on('console', msg => {
        console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    page.on('pageerror', exception => {
        console.log(`\n=== REACT FATAL EXCEPTION ===\n${exception.stack || exception}\n=============================\n`);
    });

    await page.goto('http://localhost:3000');
    
    // Setup state
    await page.evaluate(() => {
        localStorage.setItem('stark_elite_isAuthenticated', 'true');
        localStorage.setItem('stark_elite_role', 'Trainer');
        localStorage.setItem('stark_elite_activeTab', 'nlz');
    });
    
    console.log("Reloading with auto-crash in NlzAcademy...");
    await page.reload();
    
    // Wait for crash to be logged
    await page.waitForTimeout(4000);
    
    console.log("Done.");
    await browser.close();
})();
