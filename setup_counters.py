import os
import glob
import re

os.chdir(r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker')

# 1. Write the Firebase Counter module
firebase_script = """
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
  import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAaNW63xpS09AZ6ZH6DvpwGx4n_0lhTKco",
    authDomain: "ats-counters.firebaseapp.com",
    databaseURL: "https://ats-counters-default-rtdb.firebaseio.com",
    projectId: "ats-counters",
    storageBucket: "ats-counters.firebasestorage.app",
    messagingSenderId: "804950922331",
    appId: "1:804950922331:web:db0784099c50c5fdd79b7e"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  window.incrementScannerCount = function() {
    runTransaction(ref(db, 'counters/scanner'), (currentData) => {
      return (currentData === null) ? 14231 : currentData + 1;
    }).catch(console.error);
  };

  window.incrementMakerCount = function() {
    runTransaction(ref(db, 'counters/maker'), (currentData) => {
      return (currentData === null) ? 8921 : currentData + 1;
    }).catch(console.error);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const scannerEl = document.getElementById('scanner-counter-display');
    if (scannerEl) {
      onValue(ref(db, 'counters/scanner'), (snapshot) => {
        const data = snapshot.val() || 14230;
        scannerEl.innerText = data.toLocaleString();
      });
    }

    const makerEl = document.getElementById('maker-counter-display');
    if (makerEl) {
      onValue(ref(db, 'counters/maker'), (snapshot) => {
        const data = snapshot.val() || 8920;
        makerEl.innerText = data.toLocaleString();
      });
    }
  });
</script>
"""

# 2. Inject into all HTML files
html_files = glob.glob('*.html') + glob.glob('guides/*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Inject script if not present
    if 'firebase-app.js' not in content:
        content = content.replace('</head>', f'{firebase_script}</head>')
    
    # Inject badge into scanner pages
    if 'id="uploadBtn"' in content or 'class="hero"' in content:
        badge_html = '<div style="margin-top: 15px; display: inline-block; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">⚡ <span id="scanner-counter-display">14,230</span> Resumes Scanned</div>'
        
        # Inject right after the hero subtitle or 100% private text
        if '100% Private: Processed entirely in your browser. No Signup Required.</p>' in content:
            if 'scanner-counter-display' not in content:
                content = content.replace('100% Private: Processed entirely in your browser. No Signup Required.</p>', f'100% Private: Processed entirely in your browser. No Signup Required.</p>\n{badge_html}')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

# 3. Inject into Resume Maker
with open('resume-maker.html', 'r', encoding='utf-8') as f:
    rcontent = f.read()
if 'maker-counter-display' not in rcontent:
    maker_badge = '<div style="margin-top: 10px; margin-bottom: 20px; display: inline-block; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); color: var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">🚀 <span id="maker-counter-display">8,920</span> Resumes Built</div>'
    rcontent = rcontent.replace('<h1>Free ATS Resume Builder</h1>', f'<h1>Free ATS Resume Builder</h1>\n{maker_badge}')
    with open('resume-maker.html', 'w', encoding='utf-8') as f:
        f.write(rcontent)

# 4. Trigger increment on scan
with open('script.js', 'r', encoding='utf-8') as f:
    js_content = f.read()
if 'window.incrementScannerCount' not in js_content:
    js_content = js_content.replace('function startScan() {', 'function startScan() {\n    if(window.incrementScannerCount) window.incrementScannerCount();')
    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(js_content)

# 5. Trigger increment on PDF download in resume-maker.html
with open('resume-maker.html', 'r', encoding='utf-8') as f:
    rcontent2 = f.read()
if 'window.incrementMakerCount' not in rcontent2:
    rcontent2 = rcontent2.replace('html2pdf().set(opt).from(element).save();', 'html2pdf().set(opt).from(element).save();\n            if(window.incrementMakerCount) window.incrementMakerCount();')
    with open('resume-maker.html', 'w', encoding='utf-8') as f:
        f.write(rcontent2)

print("ATS Counters setup complete!")
