import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken newlines
content = content.replace("leftText + '\n\n' + rightText + '\n\n';", "leftText + '\\n\\n' + rightText + '\\n\\n';")
content = content.replace("leftText + '\n\n';", "leftText + '\\n\\n';")
content = content.replace(".join('\n')", ".join('\\n')")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed")
