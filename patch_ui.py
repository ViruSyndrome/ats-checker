import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Enhance the dropdown UI
old_select = r'<select id="reviewTier"[^>]*>'
new_select = r'<select id="reviewTier" style="width:100%; padding:14px 12px; margin-bottom:20px; border:2px solid var(--primary); border-radius:8px; font-size:1.05rem; font-weight:600; color:#0f172a; background-color:#eff6ff; cursor:pointer; box-shadow: 0 4px 6px -1px rgba(15, 98, 254, 0.1); outline:none;">'

content = re.sub(old_select, new_select, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

# Now let's patch script.js for the fallback IP check
with open('script.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

old_fetch = """    fetch('https://get.geojs.io/v1/ip/country.json')
        .then(response => response.json())
        .then(data => {
            if (data.country === 'IN') {
                detectedMarket = 'india';
            }
            updateButton();
        })
        .catch(err => {
            console.log('Location check failed, defaulting to international', err);
            updateButton(); // Default to international
        });"""

new_fetch = """    fetch('https://get.geojs.io/v1/ip/country.json')
        .then(response => response.json())
        .then(data => {
            if (data.country === 'IN') detectedMarket = 'india';
            updateButton();
        })
        .catch(err => {
            // Secondary fallback if geojs is blocked by Adblocker
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data.country_code === 'IN') detectedMarket = 'india';
                    updateButton();
                })
                .catch(err2 => {
                    console.log('All location checks blocked, defaulting to international', err2);
                    updateButton();
                });
        });"""

js_content = js_content.replace(old_fetch, new_fetch)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
