import os
import json

base_html = ""
with open("index.html", "r", encoding="utf-8") as f:
    base_html = f.read()

jobs = [
    ("Software Engineer", "software-engineer"),
    ("Product Manager", "product-manager"),
    ("Data Scientist", "data-scientist"),
    ("Marketing Manager", "marketing-manager"),
    ("Registered Nurse", "registered-nurse"),
    ("Project Manager", "project-manager"),
    ("Financial Analyst", "financial-analyst"),
    ("Graphic Designer", "graphic-designer"),
    ("Accountant", "accountant"),
    ("Business Analyst", "business-analyst"),
    ("Human Resources", "human-resources"),
    ("Sales Manager", "sales-manager"),
]

ats_systems = [
    ("Workday", "workday"),
    ("Greenhouse", "greenhouse"),
    ("Taleo", "taleo"),
    ("iCIMS", "icims"),
    ("Lever", "lever"),
    ("Jobvite", "jobvite"),
    ("SmartRecruiters", "smartrecruiters"),
    ("BambooHR", "bamboohr"),
]

sitemap_urls = []
site_url = "https://www.getatsready.com"

# First, add the H1 block injection marker to base_html
# We inject right before <div class="tool-grid">
hero_injection = """
        <div class="hero" style="text-align: center; margin: 2rem 0; padding: 0 1rem;">
            <h1 style="font-size: 2.2rem; margin-bottom: 0.5rem; color: var(--text-main);">{H1_TITLE}</h1>
            <p style="font-size: 1.1rem; color: var(--text-muted); max-width: 600px; margin: 0 auto;">{HERO_SUBTITLE}</p>
        </div>
        <div class="tool-grid">
"""
base_html = base_html.replace('<div class="tool-grid">', hero_injection)

# Add an SEO FAQ section at the bottom before footer
faq_injection = """
            <div id="seo-content" style="margin-top: 4rem; margin-bottom: 2rem; padding: 2rem; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border);">
                <h2 style="margin-bottom: 1rem;">Frequently Asked Questions</h2>
                <div class="faq-item" style="margin-bottom: 1.5rem;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--primary);">{FAQ_Q1}</h3>
                    <p style="color: var(--text-muted); line-height: 1.6;">{FAQ_A1}</p>
                </div>
                <div class="faq-item">
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--primary);">{FAQ_Q2}</h3>
                    <p style="color: var(--text-muted); line-height: 1.6;">{FAQ_A2}</p>
                </div>
            </div>
            
        </main>
"""
base_html = base_html.replace('</main>', faq_injection)

def generate_page(title_str, slug, q1, a1, q2, a2):
    content = base_html
    
    # Meta replacements
    content = content.replace("Free ATS Resume Checker | Get ATS Ready | No Signup, 100% Private", f"Free {title_str} Resume Checker | Get ATS Ready")
    content = content.replace("Free ATS Resume Checker | Get ATS Ready", f"Free {title_str} Resume Checker | Get ATS Ready")
    content = content.replace("Free ATS resume checker - instantly score your resume against any job description.", f"Free {title_str} resume checker - instantly score your resume for {title_str} roles.")
    content = content.replace("Free ATS resume checker — instantly score your resume against any job description.", f"Free {title_str} resume checker — instantly score your resume for {title_str} roles.")
    
    # Canonical
    content = content.replace('href="https://www.getatsready.com/"', f'href="https://www.getatsready.com/{slug}-resume-checker.html"')
    content = content.replace('content="https://www.getatsready.com/"', f'content="https://www.getatsready.com/{slug}-resume-checker.html"')
    
    # Hero
    content = content.replace("{H1_TITLE}", f"Free {title_str} Resume Checker")
    content = content.replace("{HERO_SUBTITLE}", f"Check keyword overlap, section headers, metrics, and layout risk for {title_str} roles — local browser scan, not a vendor ATS emulator.")
    
    # FAQ
    content = content.replace("{FAQ_Q1}", q1)
    content = content.replace("{FAQ_A1}", a1)
    content = content.replace("{FAQ_Q2}", q2)
    content = content.replace("{FAQ_A2}", a2)

    # Honesty guard — never reintroduce guarantee / human-eyes claims from older templates
    content = content.replace(
        "your resume is guaranteed to reach human eyes",
        "helps you see parsing and keyword gaps before you apply",
    )
    content = content.replace(
        "which one guarantees your resume passes",
        "which formats parse more reliably in common ATS tools",
    )
    content = content.replace(
        "mirroring how enterprise ATS systems rank candidates.",
        "estimating keyword overlap, headers, metrics, and layout risk — not a vendor emulator.",
    )
    
    file_name = f"{slug}-resume-checker.html"
    with open(file_name, "w", encoding="utf-8") as f:
        f.write(content)
        
    sitemap_urls.append(f"{site_url}/{file_name}")

# Generate Job Roles
for role, slug in jobs:
    q1 = f"What keywords do ATS look for in a {role} resume?"
    a1 = f"For {role} positions, applicant tracking systems scan for specific hard skills, certifications, and software tools mentioned in the job description. Ensure you use the exact phrasing from the posting (e.g., if they ask for 'Project Management', don't just write 'Managed Projects')."
    q2 = f"How can I improve my {role} resume for ATS parsing?"
    a2 = f"For {role} applications, use a clean, single-column layout without tables or complex graphics. Prefer a text-based PDF or DOCX, and keep job titles and dates clearly labeled. GetATSReady helps you see keyword and parsing gaps before you apply; it does not guarantee a human review or a vendor match score."
    generate_page(f"{role} ATS", slug, q1, a1, q2, a2)

# Generate ATS Systems
for sys, slug in ats_systems:
    q1 = f"How does the {sys} ATS parse resumes?"
    a1 = f"{sys} products typically extract contact info, work history, and skills from uploaded files. Multi-column layouts, headers/footers, and complex graphics are common parse risks. A standard single-column chronological resume is usually safer. This page is guidance — GetATSReady is not a live {sys} emulator."
    q2 = f"Does GetATSReady mirror {sys} scoring?"
    a2 = f"No. GetATSReady estimates keyword overlap, section headers, metrics, and layout risk in your browser. Employers configure {sys} differently, so our number cannot predict how {sys} will rank you."
    generate_page(f"{sys} ATS", slug, q1, a1, q2, a2)

print(f"Generated {len(jobs) + len(ats_systems)} pSEO pages for ATS-Checker.")

# Update sitemap
try:
    with open("sitemap.xml", "r", encoding="utf-8") as f:
        sitemap_content = f.read()
    
    # Strip closing tag to append
    sitemap_content = sitemap_content.replace("</urlset>", "")
    
    for url in sitemap_urls:
        if f"<loc>{url}</loc>" not in sitemap_content:
            sitemap_content += f"""  <url>
    <loc>{url}</loc>
    <lastmod>2026-05-31</lastmod>
    <priority>0.8</priority>
  </url>\n"""
            
    sitemap_content += "</urlset>"
    
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(sitemap_content)
    print("sitemap.xml updated with new ATS pages.")
except Exception as e:
    print(f"Error updating sitemap: {e}")
