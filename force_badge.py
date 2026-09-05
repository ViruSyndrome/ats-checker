import os
import glob
import re

os.chdir(r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker')

# 1. Fix injection in ATS-Checker (index.html + PSEO)
html_files = glob.glob('*.html') + glob.glob('guides/*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    badge_html = '<div style="margin-top: 15px; display: inline-block; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">&#9889; <span id="scanner-counter-display">14,230</span> Resumes Scanned</div>'
    
    if 'scanner-counter-display' not in content:
        # Match '100% Private... No Signup Required.' followed by whitespace and </div>
        pattern = r'(100%\s*Private:\s*Processed entirely in your browser\.\s*No Signup Required\.)'
        
        # We need to make sure we only inject it near the hero section, not the footer history section
        # But 'No Signup Required' only appears in the hero.
        content = re.sub(pattern, r'\1<br>' + badge_html, content, count=1)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

# 2. Fix injection in Resume Maker
with open('resume-maker.html', 'r', encoding='utf-8') as f:
    rcontent = f.read()
if 'maker-counter-display' not in rcontent:
    maker_badge = '<div style="margin-top: 10px; margin-bottom: 20px; display: inline-block; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); color: var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">&#128640; <span id="maker-counter-display">8,920</span> Resumes Built</div>'
    
    # Use regex to find the H1 exactly
    pattern = r'(<h1[^>]*>Free ATS Resume Builder</h1>)'
    rcontent = re.sub(pattern, r'\1\n' + maker_badge, rcontent, count=1)
    
    with open('resume-maker.html', 'w', encoding='utf-8') as f:
        f.write(rcontent)

print("Badges firmly injected.")
