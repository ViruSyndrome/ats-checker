import os
import glob

os.chdir(r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker')

html_files = glob.glob('*.html') + glob.glob('guides/*.html')

scanner_badge = '<div style="margin-top: 15px; margin-bottom: 5px; display: inline-block; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">&#9889; <span id="scanner-counter-display">14,230</span> Resumes Scanned</div>'

for file in html_files:
    if 'resume-maker.html' in file: continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Target exact bad string
    bad_string = f'<br>{scanner_badge}'
    
    if bad_string in content:
        # Remove it from inside the privacy badge
        content = content.replace(bad_string, '')
        
        # Now find the end of the privacy badge
        # The structure is:
        # 100% Private: Processed entirely in your browser. No Signup Required.
        #             </div>
        
        target = '100% Private: Processed entirely in your browser. No Signup Required.\n            </div>'
        new_text = f'{target}\n            <div style="text-align: center;">\n                {scanner_badge}\n            </div>'
        
        content = content.replace(target, new_text)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

print("Layout fixed.")
