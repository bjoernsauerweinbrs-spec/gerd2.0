const apiKey = process.argv[2];
const team = "RB Leipzig";

if (!apiKey) {
    console.error("Missing API Key");
    process.exit(1);
}

fetch(`http://localhost:3001/api/scrape?team=${encodeURIComponent(team)}&apiKey=${apiKey}`)
    .then(r => r.json())
    .then(d => {
        console.log("Scraper Result for RB Leipzig:");
        console.log("Next Match:", d.liveIntelligence?.nextMatch);
        console.log("Last Match:", d.liveIntelligence?.lastMatch);
        console.log("Strengths:", d.liveIntelligence?.opponentStrengths);
    })
    .catch(err => console.error("Error:", err));
