with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# We want to replace the empty strings for the standard tier.
pattern = r"(standard:\s*\{\s*label:\s*'Pay for Standard review',\s*india:\s*)''(\s*,\s*international:\s*)''(\s*\})"
replacement = r"\1'https://razorpay.me/@virusyndrome?amount=n%2FUUsdogj%2F7sarE2WD13qg%3D%3D'\2'https://vinodisaac.gumroad.com/l/ats-pro'\3"

new_content = re.sub(pattern, replacement, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Successfully patched standard tier links")
