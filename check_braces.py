with open("react-code-v2.jsx") as f:
    text = f.read()

lines = text.split('\n')
for start, end in [(3000, 3300)]:
    s = "\n".join(lines[start:end])
    # Very crude bracket matching, ignoring strings
    stack = []
    for i, char in enumerate(s):
        if char in "{[(":
            stack.append((char, i))
        elif char in "}])":
            if not stack:
                print(f"Unmatched {char} around index {i} in chunk {start}-{end}")
            else:
                top, pos = stack.pop()
                pairs = {"{": "}", "[": "]", "(": ")"}
                if pairs[top] != char:
                    print(f"Mismatched {top} and {char} at {pos} and {i}")

    if stack:
        print(f"Leftover brackets: {[(c, p) for c,p in stack]}")

