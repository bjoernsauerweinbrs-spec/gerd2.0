import re

with open("react-code-v2.jsx") as f:
    lines = f.readlines()

content = "".join(lines[3053:3283])

def count_tags(tag_name):
    opens = len(re.findall(r'<' + tag_name + r'(?:>|\s[^>]*?(?<!/)>)', content))
    closes = len(re.findall(r'</' + tag_name + r'>', content))
    return opens, closes

print("divs:", count_tags("div"))
print("spans:", count_tags("span"))
print("hs:", count_tags("h[1-6]"))
print("ps:", count_tags("p"))
print("buttons:", count_tags("button"))
