import re
with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"(standard:\s*\{.*?url:\s*\{\s*india:\s*)''", r"\1'https://rzp.io/rzp/03GFDB2'", content, flags=re.DOTALL)
content = re.sub(r"(express:\s*\{.*?url:\s*\{\s*india:\s*)''", r"\1'https://rzp.io/rzp/l7UFzUvu'", content, flags=re.DOTALL)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Razorpay links injected")
