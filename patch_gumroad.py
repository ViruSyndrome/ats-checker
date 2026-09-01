with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_usd = "btn.href = 'https://pages.razorpay.com/YOUR_RAZORPAY_LINK_USD';"
new_usd = "btn.href = 'https://vinodisaac.gumroad.com/l/ats-pro';"

if old_usd in content:
    content = content.replace(old_usd, new_usd)
    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Gumroad link successfully injected.")
else:
    print("Placeholder not found. The script might already have been updated.")
