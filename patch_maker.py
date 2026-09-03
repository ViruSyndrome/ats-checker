import re

with open('resume-maker.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Styles for Dark Mode
old_styles = r'''        \.builder-form-pane \{
            flex: 1;
            background: #fff;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba\(0,0,0,0\.05\);
            border: 1px solid #e2e8f0;
        \}
        \.builder-preview-pane \{
            flex: 1;
            position: sticky;
            top: 24px;
            background: #f8fafc;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            align-items: center;
        \}
        
        /\* Form Styles \*/
        \.form-section \{
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid #e2e8f0;
        \}
        \.form-section h3 \{
            margin-top: 0;
            margin-bottom: 16px;
            color: var\(--primary\);
        \}
        \.form-group \{
            margin-bottom: 16px;
        \}
        \.form-group label \{
            display: block;
            margin-bottom: 8px;
            font-size: 0\.9rem;
            font-weight: 600;
            color: var\(--text-color\);
        \}
        \.form-group input, \.form-group textarea \{
            width: 100%;
            padding: 10px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            font-family: inherit;
        \}'''

new_styles = '''        .builder-form-pane {
            flex: 1;
            background: var(--bg-card);
            backdrop-filter: blur(12px);
            padding: 32px;
            border-radius: 1.5rem;
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
            border: 1px solid var(--glass-border);
            color: var(--text-main);
        }
        .builder-preview-pane {
            flex: 1;
            position: sticky;
            top: 24px;
            background: var(--bg-card);
            backdrop-filter: blur(12px);
            padding: 32px;
            border-radius: 1.5rem;
            border: 1px solid var(--glass-border);
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
        }
        
        /* Form Styles */
        .form-section {
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .form-section h3 {
            margin-top: 0;
            margin-bottom: 16px;
            color: var(--primary);
            font-size: 1.25rem;
        }
        .form-group {
            margin-bottom: 16px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-main);
        }
        .form-group input, .form-group textarea {
            width: 100%;
            padding: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            font-family: inherit;
            color: white;
        }
        .form-group input::placeholder, .form-group textarea::placeholder {
            color: #94a3b8;
        }
        .form-group input:focus, .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            background: rgba(255, 255, 255, 0.1);
        }'''

content = re.sub(old_styles, new_styles, content)

# 2. Fix the CTA Box (Embed the real checkout)
old_cta = r'<div style="margin-top: 24px; text-align: center; padding: 16px; background: #fff; border: 2px solid var\(--primary\); border-radius: 8px;">.*?</div>'

new_cta = '''<div class="ats-pro-cta" style="margin-top: 32px; padding: 24px; border-radius: 12px; background: rgba(30, 41, 59, 0.9); border: 2px solid var(--primary); text-align: left; width: 100%; max-width: 600px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <h3 style="color: var(--primary); font-size: 1.25rem; margin-top: 0; margin-bottom: 12px;">Get a human ATS-focused review</h3>
                    <p style="color: var(--text-main); font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px;">A technical writer reviews your resume against your target role, improves its content and structure, and emails the finished document within the selected turnaround. Results and interviews cannot be guaranteed.</p>
                    
                    <label for="reviewTier" style="display:block; font-size:0.85rem; color:var(--text-main); margin-bottom:8px;">Choose your service</label>
                    <select id="reviewTier" style="width:100%; padding:14px 12px; margin-bottom:20px; border:2px solid var(--primary); border-radius:8px; font-size:1.05rem; font-weight:600; color:#0f172a; background-color:#eff6ff; cursor:pointer; box-shadow: 0 4px 6px -1px rgba(15, 98, 254, 0.1); outline:none;">
                        <option value="standard">Standard: 48 hours / $49 or ₹2,499</option>
                        <option value="express">Express: 24 hours / $79 or ₹3,999</option>
                    </select>
                    
                    <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 0.85rem; color: var(--text-main); margin-bottom: 20px; cursor: pointer; line-height: 1.4;">
                        <input type="checkbox" id="refundConsent" style="margin-top: 3px; accent-color: var(--primary);">
                        <span>I agree to the <a href="refund-policy.html" target="_blank" style="color: var(--primary); text-decoration: underline;">Refund Policy</a> and <a href="terms.html" target="_blank" style="color: var(--primary); text-decoration: underline;">Terms</a>. I understand the service is personalized, has no job or score guarantee, and revisions are limited to the published policy.</span>
                    </label>
                    
                    <a href="#" id="atsProCheckoutBtn" target="_blank" rel="noopener" class="primary-btn" style="background: var(--primary); width: 100%; justify-content: center; font-size: 1.05rem; padding: 14px; box-shadow: 0 4px 12px rgba(15, 98, 254, 0.3); pointer-events: none; opacity: 0.5;">Choose a service above</a>
                    
                    <a href="submit-resume.html" id="paidIntakeLink" style="display:block; margin-top:16px; text-align:center; color:var(--primary); font-size:0.9rem;">Already paid? Complete the intake form</a>
                </div>'''

content = re.sub(old_cta, new_cta, content, flags=re.DOTALL)

# Add script.js at the bottom to power the checkout
if '<script src="script.js?v=18"></script>' not in content:
    content = content.replace('</body>', '    <script src="script.js?v=18"></script>\n</body>')

with open('resume-maker.html', 'w', encoding='utf-8') as f:
    f.write(content)
