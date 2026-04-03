// Quick test: validate the user's Gemini API key
// Run: node test_key.js YOUR_API_KEY

const key = process.argv[2] || process.env.GEMINI_API_KEY;
if (!key || key === 'your_gemini_api_key_here') {
    console.error("Usage: node test_key.js YOUR_API_KEY");
    process.exit(1);
}

async function testKey() {
    console.log(`\n🔑 Testing API Key: ${key.substring(0, 8)}...${key.substring(key.length - 4)}`);
    console.log("=".repeat(60));
    
    // Test 1: List available models
    console.log("\n📋 Test 1: Listing available models...");
    try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await resp.json();
        if (resp.ok) {
            const models = data.models || [];
            const flashModels = models.filter(m => m.name.includes('flash') || m.name.includes('gemini'));
            console.log(`   ✅ Key is VALID! Found ${models.length} models.`);
            console.log(`   Available Gemini models:`);
            flashModels.slice(0, 10).forEach(m => {
                console.log(`      - ${m.name} (${m.displayName || ''})`);
            });
        } else {
            console.log(`   ❌ Key is INVALID! Status: ${resp.status}`);
            console.log(`   Error: ${JSON.stringify(data.error?.message || data)}`);
            return;
        }
    } catch (e) {
        console.error(`   ❌ Network error: ${e.message}`);
        return;
    }
    
    // Test 2: Try a simple generation
    const modelsToTest = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];
    for (const model of modelsToTest) {
        console.log(`\n🤖 Test 2: Generating with ${model}...`);
        try {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Say 'hello' in one word." }] }]
                })
            });
            const data = await resp.json();
            if (resp.ok) {
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'NO_TEXT';
                console.log(`   ✅ ${model} WORKS! Response: "${text.trim()}"`);
            } else {
                console.log(`   ❌ ${model} FAILED! Status: ${resp.status}`);
                console.log(`   Error: ${data.error?.message?.substring(0, 100) || JSON.stringify(data).substring(0, 100)}`);
            }
        } catch (e) {
            console.error(`   ❌ ${model} Network error: ${e.message}`);
        }
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("Done!");
}

testKey();
