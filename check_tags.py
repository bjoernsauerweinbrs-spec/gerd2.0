import re
import sys

with open(sys.argv[1]) as f:
    text = f.read()

lines = text.split('\n')
for i, line in enumerate(lines, 1):
    if i < 3054: continue
    if i > 3285: break
    
    # Just print the line number and the line to inspect manually
    print(f"{i}: {line}")

