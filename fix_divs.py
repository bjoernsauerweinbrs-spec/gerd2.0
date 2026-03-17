import re

with open("react-code-v2.jsx") as f:
    text = f.read()

comps = list(re.finditer(r'const\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)|\w+)\s*=>\s*\{', text))

class DummyMatch:
    def start(self): return len(text)
comps.append(DummyMatch())

for i in range(len(comps)-1):
    if comps[i].group(1) == 'handleExport':
        body = text[comps[i].start():comps[i+1].start()]
        
        div_opens = [m.start() for m in re.finditer(r'<div\b', body)]
        div_closes = [m.start() for m in re.finditer(r'</div\s*>', body)]
        print(f"Total <div: {len(div_opens)}, Total </div: {len(div_closes)}")
        
        # Match using positions
        stack = []
        for pos in sorted(div_opens + div_closes):
            if pos in div_opens:
                stack.append(pos)
            else:
                if stack:
                    stack.pop()
        print("Unclosed <div at body offsets:", stack)
        
        # print the lines corresponding to offsets
        for pos in stack:
            # find line number
            prefix = body[:pos]
            ln = prefix.count('\n') + 1
            print(f"Line offset: {ln}, text: {body.split(chr(10))[ln-1]}")
