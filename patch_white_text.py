import re

for file in ['index.html', 'resume-maker.html']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add explicit white color to the disabled button state inline style
    old_btn = r'<a href="#" id="atsProCheckoutBtn" target="_blank" rel="noopener" class="analyze-btn" style="background: #94a3b8; width: 100%; justify-content: center; font-size: 1.05rem; padding: 14px; box-shadow: none; pointer-events: none; opacity: 0.8;">Select a tier to continue</a>'
    new_btn = r'<a href="#" id="atsProCheckoutBtn" target="_blank" rel="noopener" class="analyze-btn" style="color: #ffffff; background: #94a3b8; width: 100%; justify-content: center; font-size: 1.05rem; padding: 14px; box-shadow: none; pointer-events: none; opacity: 0.8;">Select a tier to continue</a>'
    
    # Try exact replace first
    if old_btn in content:
        content = content.replace(old_btn, new_btn)
    else:
        # Just inject color: #ffffff; into the style attribute if it's missing
        content = re.sub(r'(<a href="#" id="atsProCheckoutBtn"[^>]*?style=")([^"]*?)(")', 
                         lambda m: m.group(1) + ('color: #ffffff; ' if 'color' not in m.group(2) else '') + m.group(2) + m.group(3), 
                         content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
