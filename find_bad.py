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
    body = text[c_match.start():n_match.start()]
    
    opens = len(re.findall(r'<div(?:\s[^>]*?(?<!/)>|>)', body))
    closes = len(re.findall(r'</div>', body))
    
    if opens != closes:
        print(f"Component {name} has mismatch: {opens} open, {closes} close")

