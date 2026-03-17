import re

with open("react-code-v2.jsx") as f:
    text = f.read()

comps = list(re.finditer(r'const\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)|\w+)\s*=>\s*\{', text))

class DummyMatch:
    def start(self): return len(text)

comps.append(DummyMatch())

for i in range(len(comps)-1):
    c_match = comps[i]
    n_match = comps[i+1]
    name = c_match.group(1)
    if name == 'handleExport':
        body = text[c_match.start():n_match.start()]
        lines = body.split('\n')
        stack = []
        for ln, line in enumerate(lines, 1):
            opens = len(re.findall(r'<div(?:\s[^>]*?(?<!/)>|>)', line))
            closes = len(re.findall(r'</div>', line))
            for _ in range(opens): stack.append(ln)
            for _ in range(closes):
                if stack: stack.pop()
        print("Unclosed div started on lines:", stack)

