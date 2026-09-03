import os
import glob
import re

# 1. Fix Button Classes & Dropdown in index.html & resume-maker.html
for file in ['index.html', 'resume-maker.html']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix broken primary-btn class
    content = content.replace('class="primary-btn"', 'class="analyze-btn"')
    
    # Ensure dropdown arrow is forced (appearance)
    old_select = r'<select id="reviewTier"[^>]*>'
    new_select = r'<select id="reviewTier" style="width:100%; padding:14px 12px; margin-bottom:20px; border:2px solid var(--primary); border-radius:8px; font-size:1.05rem; font-weight:600; color:#0f172a; background-color:#ffffff; cursor:pointer; box-shadow: 0 4px 6px -1px rgba(15, 98, 254, 0.1); outline:none; -webkit-appearance: menulist; appearance: menulist; background-image: none;">'
    content = re.sub(old_select, new_select, content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Add Resume Builder to all Navigation bars
html_files = glob.glob('*.html') + glob.glob('guides/*.html')
nav_regex = r'(<nav class="main-nav"[^>]*>.*?<a href="[^"]*?about\.html">About Us</a>)'

for file in html_files:
    if file == 'index.html' or file == 'resume-maker.html':
        continue # already has it or is the builder itself
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'resume-maker.html' not in content and 'main-nav' in content:
        # We need to insert it before About Us.
        # Find <nav ...> ... <a href="about.html">
        if '/resume-maker.html' not in content:
            # handle relative paths for guides/
            if file.startswith('guides'):
                link = '<a href="../resume-maker.html">Resume Builder</a>\n                '
            else:
                link = '<a href="resume-maker.html">Resume Builder</a>\n                '
            
            content = content.replace('<a href="about.html">', link + '<a href="about.html">')
            content = content.replace('<a href="../about.html">', link + '<a href="../about.html">')
            
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)

# 3. Update Sitemap
with open('sitemap.xml', 'r', encoding='utf-8') as f:
    sitemap = f.read()

if 'resume-maker.html' not in sitemap:
    new_url = '''    <url>
        <loc>https://www.getatsready.com/resume-maker.html</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
</urlset>'''
    sitemap = sitemap.replace('</urlset>', new_url)
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap)
