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
        
        stack = []
        for i, line in enumerate(body.split('\n')):
            opens = len(re.findall(r'<div(?:\s[^>]*?(?<!/)>|>)', line))
            closes = len(re.findall(r'</div>', line))
            
            for _ in range(opens):
                stack.append(i + 1)
                
            for _ in range(closes):
                if stack:
                    stack.pop()
                    
        print(f"Unclosed divs started on lines (relative to component start): {stack}")
        for ln in stack:
            print(f"Line {ln}: {body.split(chr(10))[ln-1]}")

