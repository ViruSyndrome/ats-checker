import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_str = "<strong>2. Copy your text:</strong> Scroll down to the <em>Visual View</em> box at the bottom of this page, click <strong>\"Copy current view\"</strong>, and paste it directly into the new template.<br><br>"
new_str = "<strong>2. Move your text:</strong> Scroll down to the <em>Visual View</em> box, copy your clean text, and paste it into the matching sections of the new template (don't just overwrite the whole file!).<br><br>"

content = content.replace(old_str, new_str)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed instructions")
