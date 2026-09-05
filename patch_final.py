import os
import glob

os.chdir(r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker')

html_files = glob.glob('*.html') + glob.glob('guides/*.html')

for file in html_files:
    with open(file, 'rb') as f:
        content = f.read()

    badge_html = b'<div style="margin-bottom: 15px; display: inline-block; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">&#9889; <span id="scanner-counter-display">14,230</span> Resumes Scanned</div>\n'
    
    if b'id="scanner-counter-display"' not in content:
        # Find exactly where to put it by searching for fileInput
        target = b'fileInput'
        idx = content.find(target)
        if idx != -1:
            input_start = content.rfind(b'<input', 0, idx)
            if input_start != -1:
                content = content[:input_start] + badge_html + content[input_start:]
                with open(file, 'wb') as f:
                    f.write(content)
                print(f"Patched {file}")

print("Done final patch")
