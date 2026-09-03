import re

# We will change the background of the disabled button from #94a3b8 to #475569 for much better contrast with white text.

for file in ['index.html', 'resume-maker.html']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the background color in the inline style
    content = content.replace('background: #94a3b8;', 'background: #475569;')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

# Update script.js where the javascript toggles it back to disabled
with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace("btn.style.background = checkoutUrl ? 'var(--primary)' : '#94a3b8';", "btn.style.background = checkoutUrl ? 'var(--primary)' : '#475569';")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)
