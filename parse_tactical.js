const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const JSXParser = acorn.Parser.extend(jsx());

const code = fs.readFileSync('react-code.jsx', 'utf8');
const lines = code.split('\n');

// Extract renderTactical (approx lines 3837 to 5503)
const startLine = 3837;
const endLine = 5503;
const tacticalLines = lines.slice(startLine - 1, endLine);
const tacticalBody = tacticalLines.join('\n');

const dummyCode = `
const React = { createElement: () => {} };
const Icon = () => null;
const players = [];
const playerPositions = {};
const startingXI = [];
const scoutingPool = [];
const playlist = [];
const activeClipIndex = 0;
const isPlayingDrill = false;
const currentFrameIndex = 0;
const activeDrill = null;
const drillMetrics = {};
const drawMode = "run";
const drawingPaths = [];
const vectorAnalysisActive = false;
const playbookViewActive = false;
const isRecording = false;
const gerdThinking = false;
const aiTacticsGlow = [];
const gerdFeedback = "";
const FIELD_W = 1000;
const FIELD_H = 600;
const shadowTargetOnPitch = null;
const shadowTargetPos = {x:0, y:0};
const isActive = true;
const opponentPositions = {};
const opponentReactions = [];
const isOptimizing = false;
const videoFeedback = "";
const ytAccessToken = "";
const is3DFlight = false;
const mediaSuiteTool = "ai-writer";
const mediaTimbre = "Analytisch";
const suggestedLayoutBlocks = [];
const isMediaAdvisorLoading = false;
const mediaCanvasBlocks = [];
const editingPlayer = null;
const startingXIReady = true;

const renderTactical = () => {
    ${tacticalBody}
};
`;

try {
    JSXParser.parse(dummyCode, {
        sourceType: 'module',
        ecmaVersion: 'latest'
    });
    console.log('Isolated renderTactical is valid!');
} catch (err) {
    console.error('JSX Error in renderTactical:');
    console.error(err.message);
    if (err.loc) {
        // Adjust line number relative to tacticalBody
        // The dummyCode has about 50 lines before tacticalBody
        console.error(`Error near line ${err.loc.line} in dummy code.`);
        const dummyLines = dummyCode.split('\n');
        console.error('Context:');
        console.log(dummyLines[err.loc.line - 1]);
        console.log(' '.repeat(err.loc.column) + '^');
    }
}
