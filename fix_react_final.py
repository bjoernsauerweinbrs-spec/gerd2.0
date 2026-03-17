with open("restore_sidebar.js", "r") as f:
    chunk1 = f.readlines()
with open("restore_legacy.js", "r") as f:
    chunk2 = f.readlines()

with open("react-code-v2.jsx", "r") as f:
    lines = f.readlines()

insert1 = -1
insert2 = -1

for i, line in enumerate(lines):
    if "const PlayerCard =" in line:
        insert1 = i
    if "const EliteTacticalLab =" in line:
        insert2 = i

if insert1 != -1 and insert2 != -1:
    # insert2 will shift after chunk1 is inserted!
    final_lines = lines[:insert1] + chunk1 + lines[insert1:insert2] + chunk2 + lines[insert2:]
    with open("react-code-v2.jsx", "w") as f:
        f.writelines(final_lines)
    print("SUCCESS")
else:
    print(f"FAILED: idx1={insert1}, idx2={insert2}")
