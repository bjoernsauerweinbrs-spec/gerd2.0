with open('src/components/TacticalHub.jsx', 'r') as f:
    lines = f.readlines()

# Remove two orphaned lines:
# index 123 (L124 1-indexed) = '}\n' 
# index 124 (L125 1-indexed) = '`;\n'
out = []
for i, line in enumerate(lines):
    if i == 123 and line.strip() == '}':
        print(f"Removing orphan at L{i+1}: {repr(line)}")
        continue
    if i == 124 and '`' in line and ';' in line:
        print(f"Removing orphan at L{i+1}: {repr(line)}")
        continue
    out.append(line)

with open('src/components/TacticalHub.jsx', 'w') as f:
    f.writelines(out)
print(f"Done: {len(lines)} -> {len(out)} lines (removed {len(lines)-len(out)})")
