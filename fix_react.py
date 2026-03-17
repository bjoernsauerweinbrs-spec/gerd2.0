with open("react-code-fixed.jsx", "r") as f:
    old_lines = f.readlines()

idx_sidebar = -1
idx_player_card = -1
idx_legacy = -1
idx_elite = -1

for i, line in enumerate(old_lines):
    if "const Sidebar =" in line:
        idx_sidebar = i
    if "const MobileTabBar =" in line and idx_player_card == -1:
        pass
    if "// --- NEW COMPONENTS START ---" in line:
        idx_player_card = i + 1
    if "const LegacyHub =" in line:
        idx_legacy = i
    if "// --- PHASE 2: ELITE TACTICAL LAB ---" in line:
        idx_elite = i

print(f"Sidebar: {idx_sidebar}")
print(f"PlayerCard: {idx_player_card}")
print(f"LegacyHub: {idx_legacy}")
print(f"Elite: {idx_elite}")

chunk1 = old_lines[idx_sidebar:idx_player_card]
chunk2 = old_lines[idx_legacy:idx_elite]

with open("react-code-v2.jsx", "r") as f:
    new_lines = f.readlines()

insert_idx_1 = -1
insert_idx_2 = -1

for i, line in enumerate(new_lines):
    if "const PlayerCard =" in line:
        insert_idx_1 = i
    if "// --- PHASE 2: ELITE TACTICAL LAB ---" in line:
        insert_idx_2 = i

print(f"Insert 1: {insert_idx_1}")
print(f"Insert 2: {insert_idx_2}")

final_lines = new_lines[:insert_idx_1] + chunk1 + new_lines[insert_idx_1:insert_idx_2] + chunk2 + new_lines[insert_idx_2:]

with open("react-code-v2.jsx", "w") as f:
    f.writelines(final_lines)
