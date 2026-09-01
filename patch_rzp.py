with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_rzp = "btn.href = 'https://pages.razorpay.com/YOUR_RAZORPAY_LINK_INR';"
new_rzp = "btn.href = 'https://razorpay.me/@virusyndrome?amount=n%2FUUsdogj%2F7sarE2WD13qg%3D%3D';"

content = content.replace(old_rzp, new_rzp)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
