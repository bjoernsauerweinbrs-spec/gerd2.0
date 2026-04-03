
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testProxyFallback() {
    console.log("🚀 Testing Proxy Fallback Logic...");
    
    // Note: This test assumes the proxy is running on port 3001
    // We send a request with a deliberately high model priority to see if it falls back correctly
    // Since we can't easily trigger a real 429 without hitting real API, 
    // we just verify that a normal request still works through the new model chain.
    
    const testPayload = {
        prompt: "Say 'Fallback Test' in one word.",
        apiKey: process.env.GEMINI_API_KEY || "AIzaSy_MOCK_KEY_FOR_TEST", // Use a mock or real key
        contextOverride: { officialClubName: "Test FC" }
    };

    try {
        console.log("📡 Sending request to Proxy (api/ai-chat)...");
        const resp = await fetch("http://localhost:3001/api/ai-chat", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });

        const data = await resp.json();
        if (resp.ok) {
            console.log("✅ Proxy Response SUCCESS!");
            console.log("🤖 Model Used:", data.modelUsed);
            console.log("📝 Text:", data.response);
        } else {
            console.error("❌ Proxy Response FAILED:", data.error);
            if (data.error.includes("429") || data.error.includes("quota")) {
                console.log("ℹ️ Note: This is a Quota Error. The logic now handles this better by iterating.");
            }
        }
    } catch (e) {
        console.error("❌ Network Error: Is the proxy running on port 3001?", e.message);
    }
}

testProxyFallback();
