const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGrounding() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        tools: [{
            googleSearchRetrieval: {
                dynamicRetrievalConfig: {
                    mode: "MODE_DYNAMIC",
                    dynamicThreshold: 0.3
                }
            }
        }]
    }, { apiVersion: 'v1beta' });

    const prompt = "Wer ist der aktuelle Trainer von RB Leipzig und wie war das letzte Spielergebnis im März 2026? Gib Quellen an.";
    const result = await model.generateContent(prompt);
    
    console.log("Response:", result.response.text());
    console.log("Grounding Metadata:", JSON.stringify(result.response.candidates?.[0]?.groundingMetadata, null, 2));
}

testGrounding();
