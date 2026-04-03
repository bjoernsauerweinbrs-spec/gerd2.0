/**
 * SPORTMONKS API V3 ISOLATED SYSTEM TEST (V2)
 * This script verifies the data quality and parser logic for the Sportmonks migration.
 */
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
const BASE_URL = "https://api.sportmonks.com/v3/football";

/**
 * COMPRESSOR MIDDLEWARE: Turns massive JSON into a high-density RAG string.
 * Optimized for Gemini 1.5 token efficiency.
 */
function compressSportmonksData(squad, standings, fixtures, teamId) {
    let ragString = "";

    // 1. Standings: "Tabelle: Wir Platz 4, Gegner Platz 8."
    if (standings && standings.data) {
        const teamStanding = standings.data.find(s => s.participant_id == teamId);
        if (teamStanding) {
            ragString += `Tabelle-Wir: Platz ${teamStanding.position} (${teamStanding.points} Pkt). `;
        }
    }

    // 2. Fixtures & Form: "Form-Gegner: S-N-U."
    if (fixtures && fixtures.data) {
        const teamFixtures = fixtures.data.filter(f => 
            f.participants && f.participants.some(p => p.id == teamId)
        ).sort((a,b) => new Date(a.starting_at) - new Date(b.starting_at));

        const past = teamFixtures.filter(f => new Date(f.starting_at) < new Date());
        const future = teamFixtures.filter(f => new Date(f.starting_at) > new Date());

        const nextMatch = future[0];
        if (nextMatch) {
            const opp = nextMatch.participants.find(p => p.id != teamId);
            ragString += `Nächstes Spiel: vs. ${opp?.name || 'Unbekannt'}. `;
        }

        const form = past.slice(-3).map(f => {
            if (!f.scores) return 'U';
            // Simple W/L logic for test
            const myScore = f.scores.find(s => s.participant_id == teamId)?.score?.goals || 0;
            const oppScore = f.scores.find(s => s.participant_id != teamId)?.score?.goals || 0;
            if (myScore > oppScore) return 'S';
            if (myScore < oppScore) return 'N';
            return 'U';
        }).join('-');
        if (form) ragString += `Form: ${form}. `;
    }

    // 3. Squad & Key Info: "Kader-Gegner: Top-Stürmer Müller fit."
    if (squad && squad.data) {
        const activeSquad = squad.data.filter(s => s.player);
        const topFive = activeSquad.slice(0, 5).map(s => s.player.display_name).join(', ');
        ragString += `Squad-Core: ${topFive}. `;
        
        const injured = activeSquad.filter(s => s.injury).map(s => s.player.display_name);
        if (injured.length > 0) {
            ragString += `Verletzt: ${injured.join(', ')}. `;
        }
    }

    return ragString.trim() || "Keine validen Sportmonks-Daten extrahiert.";
}

/**
 * LIVE TEST RUNNER
 */
async function runTest(teamId, seasonId) {
    if (!API_TOKEN || API_TOKEN.includes('your_token')) {
        console.error("FATAL: SPORTMONKS_API_TOKEN is missing or placeholder. Please update proxy/.env");
        return;
    }

    console.log(`[TEST] Accessing Sportmonks v3 for Team ${teamId}...`);

    const options = { 
        headers: { "Authorization": API_TOKEN } 
    };

    try {
        // Fetch Squad
        const squadReq = await fetch(`${BASE_URL}/squads/teams/${teamId}?include=player`, options);
        const squad = await squadReq.json();

        // Fetch Standings
        const standingsReq = await fetch(`${BASE_URL}/standings/seasons/${seasonId}`, options);
        const standings = await standingsReq.json();

        // Fetch Recent Fixtures (last 30 days)
        const now = new Date();
        const start = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        const end = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        const fixturesReq = await fetch(`${BASE_URL}/fixtures/between/${start}/${end}?include=participants;scores`, options);
        const fixtures = await fixturesReq.json();

        console.log("--- Sportmonks v3 Data Quality ---");
        console.log(`Squad Size: ${squad.data?.length || 0} players`);
        console.log(`Standings: Found ${standings.data?.length || 0} teams`);
        
        const compressed = compressSportmonksData(squad, standings, fixtures, teamId);
        
        console.log("\n[COMPRESSED RAG STRING]");
        console.log(">>>", compressed);

    } catch (e) {
        console.error("SPORTMONKS API FAILURE:", e.message);
    }
}

// Running for RB Leipzig (Team ID 186, Season ID 25646 for Bundesliga 25/26)
runTest(186, 25646); 

module.exports = { compressSportmonksData };
