import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add link to the navbar if it's not already there
nav_html = r'<nav class="main-nav" id="atsNavLinks">\s*<a href="/" class="active">Home</a>'
new_nav = '<nav class="main-nav" id="atsNavLinks">\n                <a href="/" class="active">Scanner</a>\n                <a href="resume-maker.html">Resume Builder</a>'

if 'resume-maker.html' not in content:
    content = re.sub(nav_html, new_nav, content)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Nav link added!")
else:
    print("Nav link already exists.")
