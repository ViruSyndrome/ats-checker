import os
import re

dir_path = r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker'
pattern = re.compile(r'<!-- Contribute / Support Banner -->.*?</div>\s*</div>\s*</div>', re.DOTALL)

for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = pattern.sub('', content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Removed from: {filepath}')
