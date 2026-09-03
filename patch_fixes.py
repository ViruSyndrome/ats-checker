import re

with open('resume-maker.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the extra </div>
content = content.replace('</div>\n                        </div>\n                        </div>\n                        <button type="button" id="addEduBtn"',
                          '</div>\n                        </div>\n                        <button type="button" id="addEduBtn"')

# 2. Fix the split newline syntax error
content = content.replace("const bullets = textToFormat.split('\n').filter(l => l.trim().length > 0);", 
                          r"const bullets = textToFormat.split('\n').filter(l => l.trim().length > 0);")
content = content.replace("const bullets = textToFormat.split('\n\').filter", r"const bullets = textToFormat.split('\n').filter")
# The previous replace might have left a weird newline, let's fix it robustly:
content = re.sub(r"const bullets = textToFormat\.split\('[^']*'\)\.filter\(l => l\.trim\(\)\.length > 0\);",
                 r"const bullets = textToFormat.split('\\n').filter(l => l.trim().length > 0);",
                 content)

# 3. Add back the standalone CTA script that got deleted
if 'updateCheckoutButton' not in content:
    cta_script = '''
        // --- CTA Checkout Logic ---
        let detectedMarket = 'international';
        
        fetch('https://get.geojs.io/v1/ip/country.json')
            .then(res => res.json())
            .then(data => { if(data.country === 'IN') detectedMarket = 'india'; updateCheckoutButton(); })
            .catch(() => {
                fetch('https://ipapi.co/json/')
                    .then(res => res.json())
                    .then(data => { if(data.country_code === 'IN') detectedMarket = 'india'; updateCheckoutButton(); })
                    .catch(() => updateCheckoutButton());
            });

        const ctaPlans = {
            standard: {
                label: { india: 'Pay for Standard review (₹2,499)', international: 'Pay for Standard review ($49)' },
                url: { india: 'https://rzp.io/rzp/03GFDB2', international: 'https://virusyndrome.gumroad.com/l/buhtlh' }
            },
            express: {
                label: { india: 'Pay for Express review (₹3,999)', international: 'Pay for Express review ($79)' },
                url: { india: 'https://rzp.io/rzp/l7UFzUvu', international: 'https://virusyndrome.gumroad.com/l/emfsta' }
            }
        };

        function updateCheckoutButton() {
            const btn = document.getElementById('atsProCheckoutBtn');
            const tierSelect = document.getElementById('reviewTier');
            const consent = document.getElementById('refundConsent');
            const intakeLink = document.getElementById('paidIntakeLink');
            
            if(!btn || !tierSelect || !consent) return;
            
            const tier = tierSelect.value;
            const hasConsent = consent.checked;
            
            if (hasConsent && tier && ctaPlans[tier]) {
                const checkoutUrl = ctaPlans[tier].url[detectedMarket];
                const checkoutLabel = ctaPlans[tier].label[detectedMarket];
                
                if (checkoutUrl) {
                    btn.href = checkoutUrl;
                    btn.textContent = checkoutLabel;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    btn.style.background = 'var(--primary)';
                    btn.style.color = '#ffffff';
                }
            } else {
                btn.removeAttribute('href');
                btn.textContent = 'Select a tier to continue';
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'none';
                btn.style.background = '#475569';
                btn.style.color = '#ffffff';
            }
            
            if (tier) {
                intakeLink.href = `submit-resume.html?tier=${encodeURIComponent(tier)}&market=${encodeURIComponent(detectedMarket)}`;
            }
        }

        const rt = document.getElementById('reviewTier');
        const rc = document.getElementById('refundConsent');
        if(rt) rt.addEventListener('change', updateCheckoutButton);
        if(rc) rc.addEventListener('change', updateCheckoutButton);
        updateCheckoutButton();
    </script>
</body>'''
    
    content = content.replace('    </script>\n</body>', cta_script)
    content = content.replace('    </script>\n\n</body>', cta_script)


with open('resume-maker.html', 'w', encoding='utf-8') as f:
    f.write(content)
