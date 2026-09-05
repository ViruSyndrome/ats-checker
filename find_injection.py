import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find the analyze button in index.html
print("INDEX.HTML MATCHES:")
matches = re.finditer(r'<button[^>]*>.*?Analyze.*?</button>', html, flags=re.IGNORECASE|re.DOTALL)
for m in matches:
    print(m.group(0))

with open('resume-maker.html', 'r', encoding='utf-8') as f:
    rhtml = f.read()

# Find where to put the badge in resume-maker.html
print("RESUME-MAKER.HTML MATCHES:")
matches = re.finditer(r'<h1[^>]*>.*?</h1>', rhtml, flags=re.IGNORECASE|re.DOTALL)
for m in matches:
    print(m.group(0))
