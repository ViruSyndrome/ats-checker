import os
import glob

os.chdir(r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker')

scanner_badge = '<div style="margin-top: 15px; margin-bottom: 5px; display: inline-block; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">&#9889; <span id="scanner-counter-display">14,230</span> Resumes Scanned</div>'

maker_badge = '<div style="margin-top: 10px; margin-bottom: 20px; display: inline-block; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); color: var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">&#128640; <span id="maker-counter-display">8,920</span> Resumes Built</div>'

# 1. Fix Scanner Badge in index.html & PSEO pages
html_files = glob.glob('*.html') + glob.glob('guides/*.html')
for file in html_files:
    if 'resume-maker.html' in file:
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # A. Remove the wrongly placed old badge (which was next to fileInput)
    old_badge_pattern1 = '<div style="margin-bottom: 15px; display: inline-block; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">&#9889; <span id="scanner-counter-display">14,230</span> Resumes Scanned</div>\n'
    old_badge_pattern2 = '<div style="margin-bottom: 15px; display: inline-block; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">&#9889; <span id="scanner-counter-display">14,230</span> Resumes Scanned</div>'
    
    content = content.replace(old_badge_pattern1, '')
    content = content.replace(old_badge_pattern2, '')
    
    # Also remove any rogue injected ones just in case
    # Now find "No Signup Required." and inject right after it
    target = '100% Private: Processed entirely in your browser. No Signup Required.'
    
    if target in content and 'id="scanner-counter-display"' not in content:
        content = content.replace(target, f'{target}<br>{scanner_badge}')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

# 2. Fix Maker Badge in resume-maker.html
with open('resume-maker.html', 'r', encoding='utf-8') as f:
    rcontent = f.read()

target_maker = 'Your data stays completely private in your browser.</p>'
if target_maker in rcontent and 'id="maker-counter-display"' not in rcontent:
    rcontent = rcontent.replace(target_maker, f'{target_maker}\n{maker_badge}')
    with open('resume-maker.html', 'w', encoding='utf-8') as f:
        f.write(rcontent)

print("Badges firmly repositioned.")
