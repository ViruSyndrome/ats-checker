with open('submit-resume.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_action = 'action="https://formspree.io/f/YOUR_FORMSPREE_ID"'
new_action = 'action="https://formspree.io/f/mdeogkpb"'

if old_action in content:
    content = content.replace(old_action, new_action)
    with open('submit-resume.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Formspree link successfully injected.")
else:
    print("Placeholder not found.")
