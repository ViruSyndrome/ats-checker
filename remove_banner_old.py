import os

dir_path = r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker'
target_start = '<!-- Contribute / Support Banner -->'

for file in os.listdir(dir_path):
    if file.endswith('resume-checker.html'):
        filepath = os.path.join(dir_path, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if target_start in content:
            start_idx = content.find(target_start)
            end_idx = content.find('<section class="featured-guides', start_idx)
            
            if end_idx != -1:
                new_content = content[:start_idx] + content[end_idx:]
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print('Removed banner from:', file)
