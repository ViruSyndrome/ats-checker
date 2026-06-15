import os
import xml.etree.ElementTree as ET
from datetime import datetime

SITEMAP_PATH = "C:/Users/Vinod/Desktop/Website ideas/ATS-Checker/sitemap.xml"
BASE_URL = "https://www.getatsready.com/"
ROLE_DIR = "C:/Users/Vinod/Desktop/Website ideas/ATS-Checker/role"

def update_ats_sitemap():
    ET.register_namespace('', "http://www.sitemaps.org/schemas/sitemap/0.9")
    try:
        tree = ET.parse(SITEMAP_PATH)
        root = tree.getroot()
    except Exception:
        # Create a new sitemap if it doesn't exist or is invalid
        root = ET.Element("{http://www.sitemaps.org/schemas/sitemap/0.9}urlset")
        tree = ET.ElementTree(root)

    # Get all current URLs in the sitemap to avoid duplicates
    existing_urls = set()
    for url in root.findall("{http://www.sitemaps.org/schemas/sitemap/0.9}url"):
        loc = url.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
        if loc is not None:
            existing_urls.add(loc.text)

    # Find all html files in the role directory
    today = datetime.now().strftime("%Y-%m-%d")
    added = 0
    
    for file in os.listdir(ROLE_DIR):
        if file.endswith(".html"):
            page_url = f"{BASE_URL}role/{file}"
            
            if page_url not in existing_urls:
                url_element = ET.SubElement(root, "url")
                loc = ET.SubElement(url_element, "loc")
                loc.text = page_url
                lastmod = ET.SubElement(url_element, "lastmod")
                lastmod.text = today
                changefreq = ET.SubElement(url_element, "changefreq")
                changefreq.text = "weekly"
                priority = ET.SubElement(url_element, "priority")
                priority.text = "0.8"
                added += 1

    tree.write(SITEMAP_PATH, encoding='utf-8', xml_declaration=True)
    print(f"ATS Sitemap updated successfully. Added {added} new URLs.")

if __name__ == "__main__":
    update_ats_sitemap()
