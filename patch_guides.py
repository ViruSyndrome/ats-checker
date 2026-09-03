import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the 'Read ATS Guides' button contrast
old_html = r'<a href="guides/index.html" class="btn-primary" style="display:inline-block; margin-top:12px; text-decoration:none;">Read ATS Guides</a>'
new_html = r'<a href="guides/index.html" style="display:inline-block; margin-top:12px; text-decoration:none; background-color: var(--primary); color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(15, 98, 254, 0.2); transition: transform 0.2s;">Read ATS Guides &rarr;</a>'

if old_html in content:
    content = content.replace(old_html, new_html)
else:
    content = re.sub(r'<a href="guides/index\.html"[^>]*>Read ATS Guides</a>', new_html, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
