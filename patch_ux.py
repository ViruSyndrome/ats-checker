import re

# Fix 1: Update the "Choose a service above" button to look less dull
# Fix 2: Add Resume Builder CTA to index.html results section
with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Make the disabled checkout button look less "dull" (opacity 0.7 instead of 0.5, better text)
index_content = index_content.replace('opacity: 0.5;">Choose a service above</a>', 'opacity: 0.8; background: #94a3b8; box-shadow: none;">Select a tier to continue</a>')
# We need to ensure the script.js updates the button properly. script.js sets opacity to 0.5 when disabled. We'll fix script.js too.

# Add Resume Builder link to the 'Need help fixing your score?' box
old_help_box = r'<h3>Need help fixing your score\?</h3>\s*<p>Read our free guides on bypassing the ATS filters and formatting your resume perfectly\.</p>\s*<a href="guides/index\.html"[^>]*>Read ATS Guides &rarr;</a>'
new_help_box = '''<h3>Need help fixing your score?</h3>
                        <p>Use our free Resume Builder to generate a perfectly parsable template, or read our guides for manual formatting tips.</p>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px;">
                            <a href="resume-maker.html" style="display:inline-block; text-decoration:none; background-color: var(--primary); color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(15, 98, 254, 0.2); transition: transform 0.2s;">Build Free Resume &rarr;</a>
                            <a href="guides/index.html" class="secondary-btn" style="padding: 10px 20px; border-radius: 8px; background: rgba(255,255,255,0.05);">Read Guides</a>
                        </div>'''
index_content = re.sub(old_help_box, new_help_box, index_content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(index_content)


# Fix 3: Fix Resume Maker Buttons matching
with open('resume-maker.html', 'r', encoding='utf-8') as f:
    rm_content = f.read()

# The Download PDF button currently uses 'analyze-btn'. 
# Let's change both to have the exact same shape, just different colors.
old_buttons = r'<button class="analyze-btn" onclick="downloadPDF\(\)" style="width: auto;">Download PDF</button>\s*<button class="secondary-btn" onclick="clearDraft\(\)" style="width: auto;">Clear Draft</button>'
new_buttons = '''<button onclick="downloadPDF()" style="background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(15, 98, 254, 0.2);">Download PDF</button>
                    <button onclick="clearDraft()" style="background: transparent; color: var(--text-main); border: 1px solid var(--glass-border); padding: 12px 24px; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">Clear Draft</button>'''
rm_content = re.sub(old_buttons, new_buttons, rm_content)

# Also fix the disabled checkout button in resume-maker.html
rm_content = rm_content.replace('opacity: 0.5;">Choose a service above</a>', 'opacity: 0.8; background: #94a3b8; box-shadow: none;">Select a tier to continue</a>')

with open('resume-maker.html', 'w', encoding='utf-8') as f:
    f.write(rm_content)


# Fix script.js disabled state opacity
with open('script.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# The script dynamically sets text and opacity.
js_content = js_content.replace("btn.textContent = checkoutUrl ? checkoutLabel : 'Payment link coming soon';", "btn.textContent = checkoutUrl ? checkoutLabel : 'Select a tier to continue';")
js_content = js_content.replace("btn.textContent = checkoutUrl ? checkoutLabel : 'Express links coming soon';", "btn.textContent = checkoutUrl ? checkoutLabel : 'Select a tier to continue';")
js_content = js_content.replace("btn.style.opacity = checkoutUrl ? '1' : '0.5';", "btn.style.opacity = checkoutUrl ? '1' : '0.8';\n        btn.style.background = checkoutUrl ? 'var(--primary)' : '#94a3b8';\n        btn.style.boxShadow = checkoutUrl ? '0 4px 12px rgba(15, 98, 254, 0.3)' : 'none';")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
