import sys
import re

def check_balance(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Simple tag matching (doesn't handle all JSX nuances like self-closing tags)
    # but good for finding gross imbalances.
    
    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)

    stack = []
    # Find all <tag ...> and </tag>
    # Note: This is an approximation.
    tags = re.findall(r'<(/?)([a-zA-Z0-9.\-]+)([^>]*)>', content)
    
    line_counts = content.splitlines()
    
    current_pos = 0
    line_num = 1
    
    # We'll use a more robust regex to find tags and their positions
    pattern = re.compile(r'<(/?)([a-zA-Z0-9.\-]+)([^>]*)>')
    
    for match in pattern.finditer(content):
        is_closing = match.group(1) == '/'
        tag_name = match.group(2)
        attributes = match.group(3)
        
        # Skip self-closing tags like <img ... />, <br>, <hr>, <input>, <img>, etc.
        # In JSX, anything ending with /> is self-closing.
        if attributes.strip().endswith('/') or tag_name.lower() in ['img', 'br', 'hr', 'input', 'link', 'meta']:
            continue
            
        # Get line number
        line_num = content.count('\n', 0, match.start()) + 1
        
        if is_closing:
            if not stack:
                print(f"Error: Unexpected closing tag </{tag_name}> at line {line_num}")
            else:
                prev_tag, prev_line = stack.pop()
                if prev_tag != tag_name:
                    print(f"Error: Mismatched tag </{tag_name}> at line {line_num}, expected </{prev_tag}> (opened at line {prev_line})")
        else:
            stack.append((tag_name, line_num))

    for tag_name, line_num in stack:
        print(f"Error: Unclosed tag <{tag_name}> opened at line {line_num}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check.py <filename>")
    else:
        check_balance(sys.argv[1])
