import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Checking Firebase Script:")
if 'firebase-app.js' in html:
    print("Found firebase script!")
else:
    print("Missing firebase script!")

print("Checking Counter Element:")
match = re.search(r'<span id="scanner-counter-display">.*?</span>', html)
if match:
    print("Found badge:", match.group(0))
else:
    print("Missing badge!")
