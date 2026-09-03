import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the 'Popular ATS Resume Checkers' text color
old_h3 = r'color: var\(--text-primary, #1e293b\);'
new_h3 = r'color: var(--text-main);'

content = re.sub(old_h3, new_h3, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
