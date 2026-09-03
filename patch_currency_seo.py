import re

# 1. Update Resume-Maker: Schema + Dynamic Dropdown Text
with open('resume-maker.html', 'r', encoding='utf-8') as f:
    rm_content = f.read()

# Add SEO Schema
schema = '''    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Free ATS Resume Builder",
      "url": "https://www.getatsready.com/resume-maker.html",
      "description": "Build an ATS-optimized resume for free. Fill out your details, live preview, and download as PDF instantly. 100% private, no signup required.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    }
    </script>
'''
if 'application/ld+json' not in rm_content:
    rm_content = rm_content.replace('</head>', schema + '</head>')

# Add Dynamic Dropdown Logic
js_update = '''
            if(!btn || !tierSelect || !consent) return;
            
            // Dynamically update dropdown currency based on location
            const optStd = tierSelect.querySelector('option[value="standard"]');
            const optExp = tierSelect.querySelector('option[value="express"]');
            if (optStd) optStd.textContent = detectedMarket === 'india' ? 'Standard: 48 hours / ₹2,499' : 'Standard: 48 hours / $49';
            if (optExp) optExp.textContent = detectedMarket === 'india' ? 'Express: 24 hours / ₹3,999' : 'Express: 24 hours / $79';
            
            const tier = tierSelect.value;
'''
rm_content = rm_content.replace('\n            if(!btn || !tierSelect || !consent) return;\n            \n            const tier = tierSelect.value;', js_update)

with open('resume-maker.html', 'w', encoding='utf-8') as f:
    f.write(rm_content)


# 2. Update Script.js Dynamic Dropdown Text
with open('script.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

js_update2 = '''
    if(!btn || !tierSelect || !consent) return;

    // Dynamically update dropdown currency based on location
    const optStd = tierSelect.querySelector('option[value="standard"]');
    const optExp = tierSelect.querySelector('option[value="express"]');
    if (optStd) optStd.textContent = detectedMarket === 'india' ? 'Standard: 48 hours / ₹2,499' : 'Standard: 48 hours / $49';
    if (optExp) optExp.textContent = detectedMarket === 'india' ? 'Express: 24 hours / ₹3,999' : 'Express: 24 hours / $79';

    const tier = tierSelect.value;
'''
js_content = js_content.replace('\n    if(!btn || !tierSelect || !consent) return;\n    \n    const tier = tierSelect.value;', js_update2)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js_content)


# 3. Clean up FAQ references in index.html
with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Replace stray $29 or ₹499 in FAQ section if any exist
index_content = re.sub(r'\$29\b', '$49', index_content)
index_content = re.sub(r'₹499\b', '₹2,499', index_content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(index_content)
