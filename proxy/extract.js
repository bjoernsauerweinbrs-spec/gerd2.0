const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const base64Image = fs.readFileSync('/Users/bjoernsauerwein/.gemini/antigravity/brain/7cecf8f7-85bf-4a07-8148-315bac95d0be/media__1775047549727.png', {encoding: 'base64'});
const genAI = new GoogleGenerativeAI("AIzaSyA3n8eSuUtifN4Af79aFW8eL1ockLCnXF8");

const modelsToTest = [
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-pro-vision",
  "gemini-1.0-pro-vision-latest",
  "gemini-flash-latest",
  "gemini-pro-latest"
];

const prompt = `Du bist ein FIFA Scout. Extrahiere eine JSON-Liste der Spieler. Format: [{"name": "Max M.", "yPosition": 0.35}]`;

async function testModels() {
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([prompt, { inlineData: { data: base64Image, mimeType: "image/png" } }]);
      console.log(`--- SUCCESS: ${modelName} ---`);
      console.log(result.response.text());
      return; 
    } catch (e) {
      console.log(`Failed: ${modelName} -> ${e.message.split('\\n')[0]}`);
    }
  }
}

testModels();
