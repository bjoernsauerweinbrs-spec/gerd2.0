// AI Semantic Drill Library
// Provides mathematically perfect, flawless animation keyframes for GERD 2.0
// Uses generic IDs "1", "2", "3" which are hydrated with real UUIDs by TacticalHub

export const drillLibrary = {
    passdreieck: {
        id: "passdreieck",
        title: "Klassisches Passdreieck",
        description: "Kurzpassspiel im Zentrum mit direkter Ablage und finalem Steckpass.",
        keywords: ["pass", "kurzpass", "doppelpass", "klatsch", "dreieck", "zentrum", "mitte"],
        difficulty: "Leicht",
        frames: [
            { duration: 1500, players: {}, ball: { x: 400, y: 340 } },
            // Pass 1: "1" spielt zu "2"
            { duration: 1200, players: {}, ball: { x: 500, y: 240 } },
            // Lauf 1: "1" bietet sich neu an, "2" legt klatschen auf "3"
            { duration: 1000, players: { "1": { x: 450, y: 300 } }, ball: { x: 550, y: 340 } },
            // Pass 3: "3" spielt steil auf den gelaufenen "1"
            { duration: 1500, players: { "2": { x: 530, y: 220 } }, ball: { x: 600, y: 280 } },
            { duration: 800, players: { "1": { x: 600, y: 280 } }, ball: { x: 600, y: 280 } }
        ]
    },
    flankenlauf: {
        id: "flankenlauf",
        title: "Flügelspiel & Hereingabe",
        description: 'Ballverlagerung auf den Flügel ("2"), Sprint an die Grundlinie und Flanke auf den Stürmer ("3").',
        keywords: ["flanke", "hereingabe", "außen", "flügel", "kopfball", "diagonalball", "verlagerung"],
        difficulty: "Mittel",
        frames: [
            { duration: 1500, players: {}, ball: { x: 300, y: 340 } },
            // Pass auf Außen
            { duration: 1800, players: {}, ball: { x: 500, y: 100 } },
            // "2" nimmt Ball an und sprintet die Linie runter. "3" und "1" rücken in die Box.
            { duration: 2000, players: { "2": { x: 800, y: 100 }, "3": { x: 750, y: 300 }, "1": { x: 700, y: 400 } }, ball: { x: 800, y: 100 } },
            // Flanke in die Mitte
            { duration: 1500, players: { "3": { x: 820, y: 340 }, "1": { x: 800, y: 380 } }, ball: { x: 820, y: 340 } },
            // Torabschluss
            { duration: 800, players: {}, ball: { x: 950, y: 340 } }
        ]
    },
    umschaltspiel: {
        id: "umschaltspiel",
        title: "Gegenpressing & Vertikalkonter",
        description: 'Tiefer Ballgewinn, sofortiger tiefer Pass zur Spitze ("3"), Klatschen lassen ("2"), tiefer Lauf ("1").',
        keywords: ["konter", "umschaltspiel", "gegenpressing", "vertikal", "tief", "steilpass"],
        difficulty: "Schwer",
        frames: [
            { duration: 1500, players: {}, ball: { x: 200, y: 340 } },
            // Knallharter Pass in die Spitze zu "3"
            { duration: 1600, players: { "1": { x: 300, y: 340 } }, ball: { x: 600, y: 340 } },
            // "3" lässt klatschen auf den nachrückenden "2"
            { duration: 1200, players: { "1": { x: 450, y: 340 }, "3": { x: 580, y: 340 } }, ball: { x: 500, y: 300 } },
            // "2" steckt durch auf "1", der durchs Zentrum bricht
            { duration: 1800, players: { "1": { x: 750, y: 340 } }, ball: { x: 750, y: 340 } },
            // Abschluss
            { duration: 800, players: {}, ball: { x: 950, y: 340 } }
        ]
    },
    hinterlaufen: {
        id: "hinterlaufen",
        title: "Außenverteidiger Hinterlaufen",
        description: 'Enges Spiel auf dem Flügel, der AV ("2") übersprintet den Flügelspieler ("1") für die Überzahl.',
        keywords: ["hinterlaufen", "überzahl", "av", "flügel", "dreieck", "kreuzen"],
        difficulty: "Mittel",
        frames: [
            { duration: 1500, players: { "1": { x: 500, y: 150 }, "2": { x: 400, y: 100 } }, ball: { x: 400, y: 100 } },
            // AV "2" spielt zu Winger "1"
            { duration: 1200, players: {}, ball: { x: 500, y: 150 } },
            // "2" startet im Rücken von "1" durch. "1" zieht leicht nach innen.
            { duration: 1500, players: { "1": { x: 550, y: 200 }, "2": { x: 650, y: 80 } }, ball: { x: 550, y: 200 } },
            // "1" steckt den Ball in den Lauf von "2"
            { duration: 1200, players: { "3": { x: 700, y: 340 } }, ball: { x: 750, y: 80 } },
            // "2" flankt auf "3"
            { duration: 1500, players: { "2": { x: 780, y: 80 }, "3": { x: 820, y: 340 } }, ball: { x: 820, y: 340 } },
            { duration: 800, players: {}, ball: { x: 950, y: 340 } }
        ]
    }
};

// Simple Fallback Classifier (if NLP semantic routing fails)
export const getFallbackDrill = (prompt) => {
    const p = prompt.toLowerCase();
    
    if (p.includes("flanke") || p.includes("außen") || p.includes("aussen") || p.includes("flügel")) return drillLibrary.flankenlauf;
    if (p.includes("konter") || p.includes("umschalten") || p.includes("vertikal")) return drillLibrary.umschaltspiel;
    if (p.includes("hinterlaufen") || p.includes("überzahl")) return drillLibrary.hinterlaufen;
    
    return drillLibrary.passdreieck; // Default
};
