import os
import glob
import re

os.chdir(r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker')

# 1. Fix injection in ATS-Checker (index.html + PSEO)
html_files = glob.glob('*.html') + glob.glob('guides/*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    badge_html = '<div style="margin-bottom: 15px; display: inline-block; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">&#9889; <span id="scanner-counter-display">14,230</span> Resumes Scanned</div>\n'
    
    if 'scanner-counter-display' not in content:
        # Match the file input and put it right before
        pattern = r'(<input type="file" id="fileInput")'
        content = re.sub(pattern, badge_html + r'\1', content, count=1)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

print("Badges injected before fileInput")
