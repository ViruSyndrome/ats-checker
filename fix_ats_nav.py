import os
import re

os.chdir(r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker')

# The canonical nav for ATS auxiliary pages (about, 404, etc)
CANONICAL_ATS_NAV = '''<nav class="main-nav" id="atsNavLinks">
                <a href="/">Scanner</a>
                <a href="resume-maker.html">Resume Builder</a>
                <a href="about.html">About Us</a>
                <a href="guides/index.html">Guides</a>
                <a href="contact.html">Contact Us</a>
            </nav>'''

OLD_ATS_NAV_PATTERN = re.compile(
    r'<nav class="main-nav"[^>]*>.*?</nav>',
    re.DOTALL
)

pages_to_fix = ['about.html', '404.html']

for fname in pages_to_fix:
    if not os.path.exists(fname):
        print(f'SKIP: {fname}')
        continue
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix nav
    new_content = OLD_ATS_NAV_PATTERN.sub(CANONICAL_ATS_NAV, content, count=1)

    if new_content != content:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'FIXED nav: {fname}')
    else:
        print(f'NO CHANGE: {fname}')

print('Done.')
