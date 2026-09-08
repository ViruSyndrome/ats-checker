import os
import re
import glob
from datetime import datetime

os.chdir(r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker')

# Non-PSEO pages that should have consistent nav + sitemap entries
CORE_PAGES = [
    'index.html',
    'resume-maker.html',
    'about.html',
    'contact.html',
    'privacy.html',
    'terms.html',
    'submit-resume.html',
]

GUIDE_PAGES = glob.glob('guides/*.html')
PSEO_PAGES = [f for f in glob.glob('*.html') if 'resume-checker' in f]
OTHER_PAGES = [f for f in glob.glob('*.html') if f not in CORE_PAGES and 'resume-checker' not in f]

# ----------------------------------------------------------
# 1. Check each core+other page for nav consistency
# ----------------------------------------------------------
print("=== NAV AUDIT ===")
for f in CORE_PAGES + OTHER_PAGES:
    if not os.path.exists(f):
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    has_scanner  = 'href="/"' in content or 'href="index.html"' in content
    has_builder  = 'resume-maker.html' in content
    has_guides   = 'guides/index.html' in content or 'guides/' in content
    status = []
    if not has_scanner: status.append('MISSING Scanner link')
    if not has_builder: status.append('MISSING Resume Builder link')
    if not has_guides:  status.append('MISSING Guides link')
    if status:
        print(f"  {f}: {', '.join(status)}")
    else:
        print(f"  {f}: OK")

# ----------------------------------------------------------
# 2. Regenerate sitemap.xml  
# ----------------------------------------------------------
print('\n=== REGENERATING SITEMAP ===')
base_url = 'https://www.getatsready.com'
today = datetime.now().strftime('%Y-%m-%d')

priority_urls = [
    (base_url + '/', '1.0', 'weekly'),
    (base_url + '/resume-maker.html', '0.95', 'weekly'),
    (base_url + '/guides/index.html', '0.9', 'monthly'),
    (base_url + '/guides/how-ats-works.html', '0.9', 'monthly'),
    (base_url + '/guides/resume-keywords-mastery.html', '0.9', 'monthly'),
    (base_url + '/guides/pdf-vs-docx-resume.html', '0.8', 'monthly'),
    (base_url + '/guides/ai-resume-optimization.html', '0.8', 'monthly'),
    (base_url + '/guides/career-break-resume.html', '0.8', 'monthly'),
    (base_url + '/about.html', '0.5', 'monthly'),
    (base_url + '/contact.html', '0.5', 'monthly'),
    (base_url + '/privacy.html', '0.3', 'yearly'),
    (base_url + '/terms.html', '0.3', 'yearly'),
]

# Add all PSEO resume-checker pages
pseo_urls = [(f'{base_url}/{f}', '0.7', 'monthly') for f in PSEO_PAGES]

# Add ATS system pages (bamboohr, greenhouse, etc)
ats_system_pages = [f for f in glob.glob('*.html') if any(x in f for x in ['bamboohr','greenhouse','lever','workday','taleo','icims','jobvite','smartrecruiters'])]
ats_system_urls = [(f'{base_url}/{f}', '0.75', 'monthly') for f in ats_system_pages]

all_urls = priority_urls + pseo_urls + ats_system_urls

xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
seen = set()
for (loc, priority, freq) in all_urls:
    if loc in seen: continue
    seen.add(loc)
    xml += f'  <url>\n    <loc>{loc}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>{freq}</changefreq>\n    <priority>{priority}</priority>\n  </url>\n'
xml += '</urlset>'

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(xml)
    
print(f'sitemap.xml written with {len(seen)} URLs')
