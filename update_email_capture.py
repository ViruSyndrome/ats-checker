import os
import re

os.chdir(r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker')

new_widget_html = '''<!-- 📧 EMAIL CAPTURE WIDGET 📧 -->
                        <div style="margin-top: 24px; padding: 20px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center;">
                            <h3 style="color: var(--text); font-size: 1.1rem; margin-bottom: 8px;">Save Your Score & Get ATS Tips</h3>
                            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.4; margin-bottom: 16px;">Job hunting takes 4-12 weeks on average. Drop your email below and we'll send you a copy of this score plus weekly resume templates.</p>
                            
                            <div data-fs-success style="display:none; color: #15803d; font-weight: 600; padding: 10px; background: #dcfce7; border-radius: 6px; margin-bottom: 10px;">Thanks! You're subscribed.</div>
                            <div data-fs-error style="display:none; color: #b91c1c; font-size: 0.9rem; margin-bottom: 10px;"></div>
                            
                            <form id="ats-email-form" style="display:flex; gap:8px; align-items:center;">
                                <input type="email" name="email" data-fs-field placeholder="Your email address" required style="flex:1; padding:10px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.95rem; outline:none;">
                                <input type="hidden" name="_subject" value="New Subscriber from ATS-Checker">
                                <button type="submit" data-fs-submit-btn style="padding:10px 16px; background:var(--primary); color:white; border:none; border-radius:6px; font-weight:600; cursor:pointer; font-size:0.95rem; transition:0.2s;">Subscribe</button>
                            </form>
                            <span data-fs-error="email" style="color: #b91c1c; font-size: 0.8rem; display:block; text-align:left; margin-top:4px;"></span>
                            <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 12px; margin-bottom:0;">No spam. Unsubscribe anytime. 100% free.</p>
                        </div>
                        
                        <!-- Formspree AJAX -->
                        <script>
                            window.formspree = window.formspree || function () { (formspree.q = formspree.q || []).push(arguments); };
                            formspree('initForm', { formElement: '#ats-email-form', formId: 'maeykznp' });
                        </script>
                        <script src="https://unpkg.com/@formspree/ajax@1" defer></script>'''

# Regex to find the old widget (starts with the comment, ends with the closing div of the widget)
pattern = re.compile(r'<!-- 📧 EMAIL CAPTURE WIDGET 📧 -->.*?<p style="font-size: 0\.75rem; color: #94a3b8; margin-top: 12px; margin-bottom:0;">No spam\. Unsubscribe anytime\. 100% free\.</p>\s*</div>', re.DOTALL)

count = 0
for root, dirs, files in os.walk('.'):
    for fname in files:
        if fname.endswith('.html'):
            filepath = os.path.join(root, fname)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if "maeykznp" not in content and "EMAIL CAPTURE WIDGET" in content:
                new_content = pattern.sub(new_widget_html, content)
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    count += 1

print(f"Updated email capture to AJAX version in {count} files.")
