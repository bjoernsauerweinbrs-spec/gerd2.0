import re

with open("react-code-v2.jsx") as f:
    lines = f.readlines()[3053:3283]

stack = []
for i, line in enumerate(lines, 3054):
    opens = re.finditer(r'<div(?:\s[^>]*?(?<!/)>|>)', line)
    closes = re.finditer(r'</div>', line)
    
    # Just a simple count because multiple tags can be on same line
    opened = len(list(opens))
    closed = len(list(closes))
    
    for _ in range(opened):
        stack.append(i)
    
    for _ in range(closed):
        if stack:
            stack.pop()
        else:
            print(f"EXTRA CLOSE on line {i}")

print("Unclosed open tags from lines:", stack)
