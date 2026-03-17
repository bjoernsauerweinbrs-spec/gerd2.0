import re

with open("react-code-v2.jsx") as f:
    text = f.read()

# find all components like `const XXX = ({...}) => {`
components = list(re.finditer(r'const\s+([A-Za-z0-9_]+)\s*=\s*(?:function)?\([^)]*\)\s*=>\s*\{', text))
components.append(re.match(r'', '')) # dummy end
components[-1].start = lambda: len(text)

for i in range(len(components)-1):
    c_match = components[i]
    n_match = components[i+1]
    name = c_match.group(1)
    body = text[c_match.start():n_match.start()]
    
    opens = len(re.findall(r'<div(?:\s[^>]*?(?<!/)>|>)', body))
    closes = len(re.findall(r'</div>', body))
    
    if opens != closes:
        print(f"Component {name} has mismatch: {opens} open, {closes} close")

