import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_str = """            <strong>Free ATS-safe templates:</strong><br>
            • <strong>Google Docs:</strong> File → Template gallery → search "resume" → pick <em>Swiss</em> or <em>Serif</em><br>
            • <strong>Microsoft Word:</strong> File → New → search "ATS resume" in the template search bar<br>
            • <strong>Online:</strong> resume.io or novoresume.com → filter to "ATS-friendly" templates<br><br>
            After switching: paste your content as plain text (Ctrl+Shift+V), not drag-and-drop. Re-upload here to confirm your improved score."""

new_str = """            <strong>Fix your template in 2 easy steps:</strong><br><br>
            <strong>1. Download our official template:</strong> <a href="GetATSReady_Template.docx" download style="color:var(--primary); font-weight:bold; text-decoration:underline;">📥 Download ATS-Safe Word Template (.docx)</a><br><br>
            <strong>2. Copy your text:</strong> Scroll down to the <em>Visual View</em> box at the bottom of this page, click <strong>"Copy current view"</strong>, and paste it directly into the new template.<br><br>
            Re-upload here to confirm your improved score!"""

content = content.replace(old_str, new_str)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed warning text")
