import re

files = {
    'about.html': 'About GetATSReady',
    'contact.html': 'Contact GetATSReady',
    'privacy.html': 'Privacy Policy',
    'terms.html': 'Terms of Service',
    'refund-policy.html': 'Refund Policy',
}

for fname, h1text in files.items():
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    if '<h1' not in content:
        h1_tag = '<h1 style="font-size:1.8rem; font-weight:800; margin-bottom:12px;">' + h1text + '</h1>'
        content = re.sub(r'(<main[^>]*>)', r'\1\n    ' + h1_tag, content, count=1)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Fixed:', fname)
    else:
        print('Already has H1:', fname)
