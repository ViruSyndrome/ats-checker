import re
import os

filepath = 'refund-policy.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('Terms of Service', 'Refund Policy')
html = html.replace('terms.html', 'refund-policy.html')

content = """<main class="legal-content" style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
    <h1>Refund Policy</h1>
    <p><em>Last Updated: September 1, 2026</em></p>
    
    <h2>1. Customized Digital Services</h2>
    <p>Our "Done for You" resume rewriting service provides highly customized digital content tailored specifically to your background and target roles. Due to the labor-intensive and personalized nature of this work, <strong>we do not offer refunds once the final resume has been delivered</strong>.</p>
    
    <h2>2. Satisfaction Guarantee (Revisions)</h2>
    <p>We are committed to your success. If you are not completely satisfied with the initial draft of your rewritten resume, we offer <strong>up to 2 free revisions</strong>. You must request these revisions within 7 days of receiving your draft.</p>
    
    <h2>3. Cancellations</h2>
    <p>If you purchase the service but change your mind <em>before</em> our writers have begun working on your resume, you may request a cancellation and full refund by contacting us immediately. Once work has commenced, cancellations are no longer possible.</p>
    
    <h2>4. Delivery Times</h2>
    <p>We strive to deliver your completed resume within the timeframes specified during checkout (typically 24-48 hours). Delays caused by waiting for your input, clarifications, or missing information do not qualify for a refund.</p>
    
    <h2>5. Acceptance of Policy</h2>
    <p>By placing an order for our "Done for You" service, you explicitly agree to this refund policy and acknowledge that you waive your right to a refund after the service has been delivered.</p>
</main>"""

html = re.sub(r'<main.*?</main>', content, html, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(html)
