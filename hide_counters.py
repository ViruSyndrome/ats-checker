import os
import glob

os.chdir(r'C:\Users\Vinod\Desktop\Website ideas\ATS-Checker')

html_files = glob.glob('*.html') + glob.glob('guides/*.html')

new_firebase_script = """
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
      return (currentData === null) ? 1 : currentData + 1;
    }).catch(console.error);
  };

  window.incrementMakerCount = function() {
    runTransaction(ref(db, 'counters/maker'), (currentData) => {
      return (currentData === null) ? 1 : currentData + 1;
    }).catch(console.error);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const scannerContainer = document.getElementById('scanner-badge-container');
    const scannerNum = document.getElementById('scanner-counter-display');
    if (scannerContainer && scannerNum) {
      onValue(ref(db, 'counters/scanner'), (snapshot) => {
        const data = snapshot.val() || 0;
        if (data > 500) {
          scannerContainer.style.display = 'inline-block';
          scannerNum.innerText = data.toLocaleString();
        } else {
          scannerContainer.style.display = 'none';
        }
      });
    }

    const makerContainer = document.getElementById('maker-badge-container');
    const makerNum = document.getElementById('maker-counter-display');
    if (makerContainer && makerNum) {
      onValue(ref(db, 'counters/maker'), (snapshot) => {
        const data = snapshot.val() || 0;
        if (data > 500) {
          makerContainer.style.display = 'inline-block';
          makerNum.innerText = data.toLocaleString();
        } else {
          makerContainer.style.display = 'none';
        }
      });
    }
  });
</script>
"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace the old firebase script
    # It starts with <script type="module"> and ends with </script>\n</head>
    import re
    script_pattern = r'<script type="module">\s*import \{ initializeApp.*?\}\);\s*</script>'
    content = re.sub(script_pattern, new_firebase_script.strip(), content, flags=re.DOTALL)
    
    # 2. Add an ID to the scanner badge container and set display: none
    if 'id="scanner-counter-display"' in content:
        # The container currently has style="margin-top: 15px... display: inline-block..."
        old_div = '<div style="margin-top: 15px; margin-bottom: 5px; display: inline-block;'
        new_div = '<div id="scanner-badge-container" style="margin-top: 15px; margin-bottom: 5px; display: none;'
        content = content.replace(old_div, new_div)

    # 3. Add an ID to the maker badge container and set display: none
    if 'id="maker-counter-display"' in content:
        old_maker_div = '<div style="margin-top: 10px; margin-bottom: 20px; display: inline-block;'
        new_maker_div = '<div id="maker-badge-container" style="margin-top: 10px; margin-bottom: 20px; display: none;'
        content = content.replace(old_maker_div, new_maker_div)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Counters reset and hidden until 500.")
