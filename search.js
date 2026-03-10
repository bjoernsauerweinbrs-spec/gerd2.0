const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');
const parser = acorn.Parser.extend(jsx());

const content = fs.readFileSync('/Users/bjoernsauerwein/Toni2.0 Antigravity/index.html', 'utf8');
const match = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
const codeLines = match[1].split('\n');
const offset = content.substring(0, match.index).split('\n').length;

// If we put lines from start to end, we can close it with }; and see if it parses.
// We know that up to some line L, it is perfectly balanced (no extra `}`).
// Wait, if it's perfectly balanced up to L, then slicing up to L and appending matching closes will parse.
// Let's just track the `{` and `}` counts manually using a strict lexer that ignores comments and strings.

let openCount = 0;
for(let i=0; i<codeLines.length; i++) {
    // A quick hack to tokenize JS:
    // We can use acorn's tokenizer!
    try {
       // but wait, acorn tokenizer needs a valid string
    } catch(e){}
}

