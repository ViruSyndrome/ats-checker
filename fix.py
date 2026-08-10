import os
import re

directory = r'c:\Users\Vinod\Desktop\Website ideas\ATS-Checker\guides'
for filename in os.listdir(directory):
    if filename.endswith('.html'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = re.sub(r'(<a[^>]*?href=)\"/\"([^>]*>\s*Guides\s*</a>)', r'\1"index.html"\2', content)
        
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print('Updated ' + filename)
