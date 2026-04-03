export const getAiConfig = () => {
    const aiProvider = localStorage.getItem('stark_ai_provider') || "openai";
    const openaiKey = localStorage.getItem('stark_openai_key') || "";
    const groqKey = localStorage.getItem('stark_groq_key') || "";
    const geminiKey = localStorage.getItem('stark_gemini_key') || "";
    
    let activeKey = groqKey;
    let endpoint = "https://api.groq.com/openai/v1/chat/completions";
    let modelString = "llama3-70b-8192";
    
    if (aiProvider === "openai") {
        activeKey = openaiKey;
        endpoint = "https://api.openai.com/v1/chat/completions";
        modelString = "gpt-4o";
    } else if (aiProvider === "gemini") {
        activeKey = geminiKey;
        // Force gemini-1.5-pro for direct v1beta fallback to ensure maximum compatibility. 
        // Pro models are now handled safely via the Proxy fallback chain.
        const model = "gemini-1.5-pro"; 
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        modelString = model;
    } else if (aiProvider === "ollama") {
        activeKey = "ollama-local-key";
        endpoint = "http://localhost:11434/api/chat";
        modelString = "llama3:latest";
    }

    return { activeKey, endpoint, modelString, aiProvider };
};

export const generateLineup = async (text) => {
    try {
        const geminiKey = localStorage.getItem('stark_gemini_key') || "";
        if (!geminiKey) {
            throw new Error("FEHLENDER GEMINI API KEY. Bitte in den Einstellungen hinterlegen.");
        }

        console.log("[AI] Generating Lineup via Proxy (3001)...");
        const response = await fetch("http://localhost:3001/api/generate-lineup", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text, 
                apiKey: geminiKey 
            })
        });

        if (response.ok) {
            return await response.json();
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Fehler bei der Lineup-Generierung via Proxy");
        }
    } catch (fatalError) {
        console.error("LINEUP ARCHITECT FAILURE:", fatalError);
        throw fatalError;
    }
};

export const generateTactic = async (promptText, department = "Senioren", playerContext = "", smId = null, fde = "", clubContext = null, isNlz = false, ageGroup = "") => {
    try {
        const geminiKey = localStorage.getItem('stark_gemini_key') || "";
        if (!geminiKey) {
            throw new Error("FEHLENDER GEMINI API KEY. Bitte in den Einstellungen hinterlegen.");
        }

        console.log("[AI] Generating Tactic via Proxy (3001)...");
        const response = await fetch("http://localhost:3001/api/generate-tactic", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                exercise: promptText,
                department,
                apiKey: geminiKey,
                playerContext,
                teamId: smId,
                fussballDeUrl: fde,
                clubContext,
                isNlz,
                ageGroup
            })
        });

        if (response.ok) {
            return await response.json();
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Fehler bei der Taktik-Generierung via Proxy");
        }
    } catch (fatalError) {
        console.error("TACTICAL ARCHITECT FAILURE:", fatalError);
        throw fatalError;
    }
};

export const scrapeClubData = async (team, apiKey = "", directAi = false) => {
    const finalKey = apiKey || localStorage.getItem('stark_gemini_key') || "";
    const url = `http://localhost:3001/api/scrape?team=${encodeURIComponent(team)}&apiKey=${finalKey}&directAi=${directAi}`;
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Scraping failed" }));
        throw new Error(err.error);
    }
    return await res.json();
};

export const searchLogistics = async (query, clubInfo) => {
    const geminiKey = localStorage.getItem('stark_gemini_key') || "";
    const res = await fetch("http://localhost:3001/api/logistics-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, apiKey: geminiKey, clubInfo })
    });
    if (!res.ok) throw new Error("Logistics search failed");
    return await res.json();
};

export const generateSponsorInquiry = async (sponsorName, materialName, clubInfo) => {
    const geminiKey = localStorage.getItem('stark_gemini_key') || "";
    const res = await fetch("http://localhost:3001/api/sponsor-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsorName, materialName, clubInfo, apiKey: geminiKey })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Inquiry generation failed");
    return data;
};

export const uploadScoutingReport = async (formData) => {
    const res = await fetch('http://localhost:3001/api/upload-scouting', {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
};

export const sendAiRequest = async (systemPrompt, contextOverride = null) => {
    try {
        const geminiKey = localStorage.getItem('stark_gemini_key') || "";
        
        // 1. Check if key exists (Early return to save proxy overhead)
        if (!geminiKey) {
            throw new Error("FEHLENDER GEMINI API KEY. Bitte in den Einstellungen hinterlegen.");
        }

        // 2. Always try the proxy first for centralized context and intelligence
        console.log("[AI] Requesting via Proxy (3001)...");
        const response = await fetch("http://localhost:3001/api/ai-chat", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: systemPrompt, 
                apiKey: geminiKey,
                contextOverride 
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data.response;
        }

        // 3. --- FALLBACK IF PROXY IS DOWN / ERROR ---
        console.warn("Proxy AI failed or returned error, falling back to direct API...");
        const { activeKey, endpoint, aiProvider } = getAiConfig();
        
        if (!activeKey) throw new Error("KEIN API KEY VERFÜGBAR (Direkt-Modus)");

        if (aiProvider === 'gemini') {
            const resp = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
            });
            const data = await resp.json();
            if (data.error) throw new Error(`Google API Error: ${data.error.message}`);
            return data.candidates[0].content.parts[0].text;
        } else {
            const resp = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeKey}` },
                body: JSON.stringify({ model: "llama3-70b-8192", messages: [{ role: "user", content: systemPrompt }] })
            });
            const data = await resp.json();
            return data.choices[0].message.content;
        }
    } catch (fatalError) {
        console.error("AI SYSTEM FAILURE:", fatalError);
        return `KI-SYSTEM FEHLER: ${fatalError.message}. Bitte prüfen Sie Ihre API-Einstellungen (Zahnrad-Icon) oder den Proxy (Port 3001).`;
    }
};

export const extractPlayersFromImage = async (base64Image) => {
    try {
        const geminiKey = localStorage.getItem('stark_gemini_key') || "";
        if (!geminiKey) throw new Error("Kein Gemini API Schlüssel gefunden!");
        
        const base64Data = base64Image.split(',')[1] || base64Image;
        const mimeType = base64Image.split(';')[0].split(':')[1] || "image/png";

        const prompt = `Du bist ein FIFA Elite Scout. Extrahiere Spielerdaten aus diesem Browser-Screenshot (Fussball.de).
WICHTIG: Ignoriere Browser-Leisten, Tabs und das Dock! Suche NUR in der Tabelle.
1. Name (Vorname Nachname).
2. Geburtsdatum (Format: DD.MM.YYYY).
3. Koordinaten (0.00 bis 1.00) des MITTELPUNKTS DES GESICHTS (links neben dem Namen).
ACHTUNG: Das Gesicht ist sehr klein (ca. 2-5% der Breite). Die X-Koordinate liegt meist ganz links (0.02 - 0.05).
Antworte AUSSCHLIESSLICH als JSON: [{"name": "...", "dob": "...", "xPosition": 0.024, "yPosition": 0.31}]`;

        const resp = await fetch("http://localhost:3001/api/extract-roster", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               base64Image: base64Data,
               mimeType,
               prompt,
               apiKey: geminiKey
            })
        });

        if (!resp.ok) {
            const errText = await resp.text();
            throw new Error(`Proxy AI Error (${resp.status}): ${errText}`);
        }

        const data = await resp.json();
        if (data.error) throw new Error(`Proxy API Error: ${data.error}`);
        
        let aiText = data.result.trim();
        if (aiText.startsWith("```json")) aiText = aiText.replace(/^```json/, "").replace(/```$/, "").trim();
        else if (aiText.startsWith("```")) aiText = aiText.replace(/^```/, "").replace(/```$/, "").trim();
        
        return JSON.parse(aiText);
    } catch (e) {
        console.error("Failed to extract players from image:", e);
        throw e;
    }
};
