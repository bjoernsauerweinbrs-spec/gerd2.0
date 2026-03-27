import re

with open('react-code-v2.jsx', 'r') as f:
    lines = f.readlines()

app_start = -1
nlz_start = -1
nlz_end = -1

for i, line in enumerate(lines):
    if "const App = () => {" in line:
        app_start = i
    if "const FuchsNLZ = ({" in line:
        nlz_start = i

if nlz_start != -1:
    # find matching brace for nlz
    open_braces = 0
    in_nlz = False
    for i in range(nlz_start, len(lines)):
        line = lines[i]
        if "{" in line:
            open_braces += line.count("{")
            in_nlz = True
        if "}" in line:
            open_braces -= line.count("}")
        if in_nlz and open_braces == 0 and "};" in line:
            nlz_end = i
            break

print(f"App start: {app_start}")
print(f"NLZ start: {nlz_start}")
print(f"NLZ end: {nlz_end}")

if nlz_start != -1 and nlz_end != -1:
    nlz_lines = lines[nlz_start:nlz_end+1]
    
    # modify signature
    sig_end = -1
    for i, line in enumerate(nlz_lines):
        if "}) => {" in line:
            sig_end = i
            break
            
    if sig_end != -1:
        # inject new props
        new_props = "    clubIdentity,\n    truthObject,\n    dispatchAction,\n    addAiLog,\n"
        nlz_lines.insert(sig_end, new_props)
        
    # remove from original
    del lines[nlz_start:nlz_end+1]
    
    # insert before App (which might have shifted, but we know the exact line content)
    # Actually, let's find where to insert: right before `const App = () => {`
    insert_idx = -1
    for i, line in enumerate(lines):
        if "const App = () => {" in line:
            insert_idx = i
            break
            
    if insert_idx != -1:
        lines = lines[:insert_idx] + nlz_lines + ["\n"] + lines[insert_idx:]
        
    # update the call to FuchsNLZ
    for i, line in enumerate(lines):
        if "<FuchsNLZ" in line:
            lines[i] = line.replace("<FuchsNLZ", "<FuchsNLZ clubIdentity={clubIdentity} truthObject={truthObject} dispatchAction={dispatchAction} addAiLog={addAiLog}")
            
    with open('react-code-v2.jsx', 'w') as f:
        f.writelines(lines)
    print("Done moving FuchsNLZ outside App.")
else:
    print("Could not find bounds.")

