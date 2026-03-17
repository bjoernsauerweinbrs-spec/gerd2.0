const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const JSXParser = acorn.Parser.extend(jsx());

const filename = process.argv[2];
if (!filename) {
    console.error('Usage: node check_jsx.js <filename>');
    process.exit(1);
}

try {
    const code = fs.readFileSync(filename, 'utf8');
    JSXParser.parse(code, {
        sourceType: 'module',
        ecmaVersion: 'latest'
    });
    console.log('JSX is valid!');
} catch (err) {
    console.error('JSX Error:');
    console.error(err.message);
    if (err.loc) {
        console.error(`Line: ${err.loc.line}, Column: ${err.loc.column}`);
        const lines = fs.readFileSync(filename, 'utf8').split('\n');
        console.error('Context:');
        console.error(lines[err.loc.line - 1]);
        console.error(' '.repeat(err.loc.column) + '^');
    }
    process.exit(1);
}
