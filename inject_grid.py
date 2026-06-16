import json
import os

with open('roles_data.json', 'r', encoding='utf-8') as f:
    roles = json.load(f)

html = '''
        <!-- PSEO Roles Grid -->
        <div class="roles-grid-section" style="max-width: 1100px; margin: 4rem auto 2rem; padding: 0 1rem;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-primary, #1e293b); text-align: center;">Popular ATS Resume Checkers</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
'''
for role in roles:
    html += f'                <a href="{role["role_id"]}-resume-checker.html" style="color: var(--accent, #38bdf8); text-decoration: none; font-size: 0.95rem; padding: 0.75rem; background: rgba(0,0,0,0.03); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; text-align: center; transition: background 0.2s;">{role["title"]}</a>\n'

html += '''            </div>
        </div>
'''

# Read index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Inject right before <footer class="site-footer">
if '<footer class="site-footer">' in content:
    content = content.replace('<footer class="site-footer">', html + '\n        <footer class="site-footer">')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected grid into index.html successfully.")
else:
    print("Could not find footer tag to inject.")
