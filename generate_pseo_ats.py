import json
import os
import re

def main():
    base_dir = r"C:\Users\Vinod\Desktop\Website ideas\ATS-Checker"
    
    with open(os.path.join(base_dir, "roles_data.json"), "r", encoding="utf-8") as f:
        roles = json.load(f)
        
    with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
        template = f.read()
        
    # Create the pages
    for role in roles:
        html = template
        
        # 1. Replace Title & Meta
        html = re.sub(r'<title>.*?</title>', f'<title>{role["seo_title"]}</title>', html)
        html = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{role["seo_desc"]}">', html)
        
        html = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{role["seo_title"]}">', html)
        html = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{role["seo_desc"]}">', html)
        html = re.sub(r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="https://www.getatsready.com/{role["role_id"]}-resume-checker.html">', html)
        
        html = re.sub(r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{role["seo_title"]}">', html)
        html = re.sub(r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{role["seo_desc"]}">', html)
        
        html = re.sub(r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="https://www.getatsready.com/{role["role_id"]}-resume-checker.html">', html)
        
        # Replace the canonical URL in the JSON-LD schema
        html = html.replace('"url": "https://www.getatsready.com"', f'"url": "https://www.getatsready.com/{role["role_id"]}-resume-checker.html"')
        
        # 2. Inject Hero H1
        hero_html = f'''<div class="pseo-hero" style="text-align: center; margin-bottom: 2rem; padding: 0 1rem;">
                <h1 style="font-size: 2.2rem; margin-bottom: 0.5rem; color: var(--text-main, #f8fafc);">{role["hero_h1"]}</h1>
                <p style="font-size: 1.1rem; color: var(--text-muted, #94a3b8); max-width: 600px; margin: 0 auto;">{role["hero_sub"]}</p>
            </div>
            <div class="tool-grid">'''
        html = html.replace('<div class="tool-grid">', hero_html)
        
        # 3. Inject SEO Paragraph at the bottom of the tool, right before historyCard
        seo_paragraph_html = f'''
            <div class="card" style="margin-top: 1.5rem; padding: 1.5rem; background: var(--card-bg, #1e293b); border: 1px solid var(--border-color, #334155); border-radius: 12px; line-height: 1.6; color: var(--text-muted, #94a3b8);">
                <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main, #f8fafc); margin-bottom: 12px; margin-top: 0;">Why ATS Optimization Matters for {role["title"]}s</h2>
                <p style="margin-bottom: 0;">{role["seo_paragraph"]}</p>
            </div>
            <!-- Client-Side Scan History -->'''
        html = html.replace('<!-- Client-Side Scan History (100% Private, stored in user\'s browser localStorage) -->', seo_paragraph_html)
        
        # 4. Update the "Home" active link to not be active, since we are on a role page
        html = html.replace('<a href="/" class="active">Home</a>', '<a href="/">Home</a>')
        
        # Save file
        out_path = os.path.join(base_dir, f'{role["role_id"]}-resume-checker.html')
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)
            
    print(f"Generated {len(roles)} PSEO pages successfully.")

if __name__ == "__main__":
    main()
