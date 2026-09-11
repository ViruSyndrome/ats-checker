import os

os.chdir(r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker')

email_capture_html = '''                        </div>
                        
                        <!-- 📧 EMAIL CAPTURE WIDGET 📧 -->
                        <div style="margin-top: 24px; padding: 20px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center;">
                            <h3 style="color: var(--text); font-size: 1.1rem; margin-bottom: 8px;">Save Your Score & Get ATS Tips</h3>
                            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.4; margin-bottom: 16px;">Job hunting takes 4-12 weeks on average. Drop your email below and we'll send you a copy of this score plus weekly resume templates.</p>
                            <form action="https://formspree.io/f/REPLACE_WITH_YOUR_ID" method="POST" style="display:flex; gap:8px; align-items:center;">
                                <input type="email" name="email" placeholder="Your email address" required style="flex:1; padding:10px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.95rem; outline:none;">
                                <input type="hidden" name="_subject" value="New Subscriber from ATS-Checker">
                                <button type="submit" style="padding:10px 16px; background:var(--primary); color:white; border:none; border-radius:6px; font-weight:600; cursor:pointer; font-size:0.95rem; transition:0.2s;">Subscribe</button>
                            </form>
                            <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 12px; margin-bottom:0;">No spam. Unsubscribe anytime. 100% free.</p>
                        </div>
                    </div>'''

count = 0
for root, dirs, files in os.walk('.'):
    for fname in files:
        if fname.endswith('.html'):
            filepath = os.path.join(root, fname)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Target string to replace
            target = '''                        </div>\n                    </div>'''
            if target in content and "EMAIL CAPTURE WIDGET" not in content:
                new_content = content.replace(target, email_capture_html, 1)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
            
            # Alternative target for slight whitespace differences
            target2 = '''                        </div>\n                      </div>'''
            if target2 in content and "EMAIL CAPTURE WIDGET" not in content:
                new_content = content.replace(target2, email_capture_html, 1)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1

print(f"Injected email capture into {count} ATS-Checker files.")
