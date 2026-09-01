with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_in = "btn.href = 'https://buy.stripe.com/test_placeholder_inr';"
new_in = "btn.href = 'https://pages.razorpay.com/YOUR_RAZORPAY_LINK_INR';"
old_usd = "btn.href = 'https://buy.stripe.com/test_placeholder_usd';"
new_usd = "btn.href = 'https://pages.razorpay.com/YOUR_RAZORPAY_LINK_USD';"

content = content.replace(old_in, new_in)
content = content.replace(old_usd, new_usd)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
