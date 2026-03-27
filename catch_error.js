const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`BROWSER ERROR: ${msg.text()}`);
    }
  });

  page.on('pageerror', exception => {
    console.log(`UNCAUGHT EXCEPTION: ${exception}`);
  });

  await page.goto('http://localhost:3000');
  
  try {
    // Wait for the main wrapper
    await page.waitForTimeout(2000);

    // Bypass setup wizard and ensure all default states are present
    await page.evaluate(() => {
        localStorage.setItem("gerd_epicKey", "dummy-key");
        localStorage.setItem("stark_elite_budget", "15000000");
        localStorage.setItem("gerd_clubIdentity", JSON.stringify({ name: "Test" }));
        localStorage.setItem("gerd_truthObject", JSON.stringify({}));
    });
    
    // Refresh to bypass setup wizard completely
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log("Dashboard loaded, clicking Medical...");
    // Force click Medical directly via DOM
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const medicalBtn = buttons.find(b => b.textContent && b.textContent.includes('Medical'));
        if (medicalBtn) medicalBtn.click();
    });
    
    await page.waitForTimeout(3000);
  } catch(e) {
    console.log("Test execution failed:", e.message);
  }

  await browser.close();
})();
