// --- UI Helpers ---
function showInlineAlert(message) {
    let alertBox = document.getElementById('global-inline-alert');
    if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.id = 'global-inline-alert';
        alertBox.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#fef2f2; color:#b91c1c; border:1px solid #f87171; padding:10px 20px; border-radius:6px; z-index:10000; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); font-weight:500; font-family:sans-serif; text-align:center; transition:opacity 0.3s;';
        document.body.appendChild(alertBox);
    }
    alertBox.textContent = message;
    alertBox.style.opacity = '1';
    alertBox.style.display = 'block';
    setTimeout(() => { alertBox.style.opacity = '0'; setTimeout(() => alertBox.style.display = 'none', 300); }, 3500);
}
// ── Safe localStorage Wrapper ──────────────────────────────────────────────
// Catches QuotaExceededError and private-browsing SecurityError silently.
// Usage: lsSet('key', value)  lsGet('key', fallback)  lsDel('key')
// ──────────────────────────────────────────────────────────────────────────
const _ls = (() => {
  const _ok = (() => { try { window.localStorage.setItem('__ls_test__', '1'); window.localStorage.removeItem('__ls_test__'); return true; } catch (e) { return false; } })();
  return {
    get(key, fallback = null) {
      if (!_ok) return fallback;
      try { const v = window.localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, val) {
      if (!_ok) return false;
      try { window.localStorage.setItem(key, JSON.stringify(val)); return true; }
      catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          console.warn('[Storage] Quota exceeded — clearing old data to make room.');
          try { window.localStorage.clear(); window.localStorage.setItem(key, JSON.stringify(val)); } catch (err) { return false; }
        }
        return false;
      }
    },
    setRaw(key, val) {
      if (!_ok) return false;
      try { window.localStorage.setItem(key, val); return true; }
      catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          console.warn('[Storage] Quota exceeded — clearing old data to make room.');
          try { window.localStorage.clear(); window.localStorage.setItem(key, val); } catch (err) { return false; }
        }
        return false;
      }
    },
    getRaw(key, fallback = null) {
      if (!_ok) return fallback;
      try { const v = window.localStorage.getItem(key); return v !== null ? v : fallback; } catch (e) { return fallback; }
    },
    del(key)   { if (!_ok) return; try { window.localStorage.removeItem(key); } catch (e) {} },
    clear()    { if (!_ok) return; try { window.localStorage.clear(); } catch (e) {} },
  };
})();
// Convenience aliases
function lsGet(key, fallback = null) { return _ls.get(key, fallback); }
function lsSet(key, val)             { return _ls.set(key, val); }
function lsDel(key)                  { return _ls.del(key); }
// ──────────────────────────────────────────────────────────────────────────// ──────────────────────────────────────────────────────────────────────────


// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const tryExampleBtn = document.getElementById('tryExampleBtn');
const resultsSection = document.getElementById('results');

let resumeText = "";
let resumeStreamText = "";

// Analytics Tracking Helper
function trackEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    }
}

// Public usage tallies. Scanner increments after a finished analysis.
// Maker increments from resume-maker.html after a PDF actually saves.
const USAGE_COUNTER_CONFIG = {
    apiKey: "AIzaSyAaNW63xpS09AZ6ZH6DvpwGx4n_0lhTKco",
    authDomain: "ats-counters.firebaseapp.com",
    databaseURL: "https://ats-counters-default-rtdb.firebaseio.com",
    projectId: "ats-counters",
    storageBucket: "ats-counters.firebasestorage.app",
    messagingSenderId: "804950922331",
    appId: "1:804950922331:web:db0784099c50c5fdd79b7e"
};

let usageCounterDbPromise = null;

function bumpUsageCounter(path) {
    usageCounterDbPromise = usageCounterDbPromise || (async () => {
        const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js");
        const { getDatabase } = await import("https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js");
        const app = getApps().length ? getApps()[0] : initializeApp(USAGE_COUNTER_CONFIG);
        return getDatabase(app);
    })();

    usageCounterDbPromise.then(async (db) => {
        const { ref, runTransaction } = await import("https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js");
        await runTransaction(ref(db, path), (current) => (current == null ? 1 : current + 1));
    }).catch((err) => console.error("Usage counter failed", err));
}

// Cookie Consent
function acceptCookies() {
    _ls.setRaw('cookieConsent', 'true');
    const cookieBanner = document.getElementById('cookieConsent');
    if (cookieBanner) cookieBanner.classList.add('hidden');
}

window.addEventListener('load', () => {
    const cookieBanner = document.getElementById('cookieConsent');
    if (cookieBanner) {
        if (_ls.getRaw('cookieConsent') === 'true') {
            cookieBanner.classList.add('hidden');
        } else {
            const autoHideOnInteraction = () => {
                setTimeout(() => {
                    if (!cookieBanner.classList.contains('hidden')) {
                        cookieBanner.style.transition = 'opacity 0.5s ease';
                        cookieBanner.style.opacity = '0';
                        setTimeout(() => cookieBanner.classList.add('hidden'), 500);
                    }
                }, 8000);
                document.removeEventListener('click', autoHideOnInteraction);
                document.removeEventListener('keydown', autoHideOnInteraction);
            };
            document.addEventListener('click', autoHideOnInteraction);
            document.addEventListener('keydown', autoHideOnInteraction);
        }
    }
    try {
        renderHistory();
    } catch (historyError) {
        console.warn('Unable to render scan history:', historyError);
    }
    injectFaqSchema();
});

// Example Resume Data
const EXAMPLE_RESUME = `John Doe
Software Engineer
john.doe@email.com | +1-555-123-4567 | LinkedIn: /in/johndoe

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 5+ years of experience in full-stack development. Specialized in building scalable web applications using React, Node.js, and cloud technologies. Proven track record of delivering high-impact projects that improved system performance by 40%.

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Corp | Jan 2022 - Present
• Architected and launched microservices platform serving 2M+ daily active users, reducing API response time by 45%
• Led team of 4 engineers in migrating legacy monolith to containerized architecture using Docker and Kubernetes
• Implemented CI/CD pipeline with GitHub Actions, reducing deployment time from 2 hours to 15 minutes
• Optimized database queries and caching strategies, cutting infrastructure costs by $50K annually

Software Engineer | StartupXYZ | Jun 2019 - Dec 2021
• Developed RESTful APIs and GraphQL endpoints handling 10K+ requests per second
• Built responsive web applications using React, Redux, and TypeScript with 95%+ test coverage
• Collaborated with product team to deliver features that increased user engagement by 30%
• Mentored 2 junior developers, conducting code reviews and establishing best practices

SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL
Frontend: React, Redux, Next.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express, GraphQL, REST APIs, Microservices
Databases: PostgreSQL, MongoDB, Redis
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, GitHub Actions
Tools: Git, Jira, Agile/Scrum

EDUCATION
Bachelor of Science in Computer Science | State University | 2015-2019
GPA: 3.8/4.0

CERTIFICATIONS
AWS Certified Solutions Architect
MongoDB Certified Developer`;

const EXAMPLE_JD = `Senior Software Engineer - Full Stack

We are looking for an experienced Senior Software Engineer to join our growing team. You will work on building scalable web applications and microservices that serve millions of users.

Responsibilities:
• Design and implement RESTful APIs and GraphQL endpoints
• Build responsive web applications using React and modern JavaScript frameworks
• Work with cloud infrastructure (AWS, Azure) and containerization (Docker, Kubernetes)
• Collaborate with cross-functional teams using Agile methodologies
• Mentor junior developers and conduct code reviews
• Optimize application performance and database queries

Requirements:
• 5+ years of software development experience
• Strong proficiency in JavaScript, TypeScript, Node.js, and React
• Experience with microservices architecture and REST APIs
• Familiarity with databases (PostgreSQL, MongoDB)
• Experience with cloud platforms (AWS preferred)
• Knowledge of CI/CD pipelines and DevOps practices
• Excellent problem-solving and communication skills
• Bachelor's degree in Computer Science or related field

Nice to Have:
• Experience with GraphQL
• AWS certifications
• Contributions to open-source projects
• Experience with Redis caching`;

// Try Example Button
tryExampleBtn.addEventListener('click', () => {
    trackEvent('try_example_resume');
    resumeText = EXAMPLE_RESUME;
    resumeStreamText = EXAMPLE_RESUME;
    layoutWarnings = []; // plain text example — no layout issues
    document.getElementById('jobDescription').value = EXAMPLE_JD;
    fileNameDisplay.textContent = 'Loaded: Example Resume (Software Engineer)';
    fileNameDisplay.style.color = 'var(--success)';
});

// File Upload Handling
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--primary)';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = 'var(--glass-border)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

async function handleFile(file) {
    if (!file) return;
    
    // Store metadata for analysis
    fileMetadata = {
        name: file.name,
        size: file.size
    };
    
    // Show loading state
    fileNameDisplay.textContent = `Processing: ${file.name}...`;
    fileNameDisplay.style.color = 'var(--warning)';
    
    try {
        if (file.type === "application/pdf") {
            isPdfUpload = true;
            const pdfData = await readPdf(file);
            resumeText = pdfData.reconstructed;
            resumeStreamText = pdfData.stream;
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            isPdfUpload = false;
            layoutWarnings = [];
            resumeText = await readDocx(file);
            resumeStreamText = resumeText; // Word doesn't have the same stream issues as PDF
        } else {
            showInlineAlert("Please upload a PDF or DOCX file.");
            fileNameDisplay.textContent = "";
            return;
        }
        
        if (resumeText && resumeText.length > 50) {
            fileNameDisplay.textContent = `Selected: ${file.name} ✓`;
            fileNameDisplay.style.color = 'var(--success)';
        } else {
            fileNameDisplay.textContent = "Error: Could not extract text. Try a different file.";
            fileNameDisplay.style.color = 'var(--danger)';
            resumeText = "";
            resumeStreamText = "";
        }
    } catch (error) {
        console.error('Error processing file:', error);
        const errorMsg = error.message ? `: ${error.message}` : '';
        fileNameDisplay.textContent = `Error: File processing failed${errorMsg}. Please try again.`;
        fileNameDisplay.style.color = 'var(--danger)';
        resumeText = "";
        resumeStreamText = "";
    }
}

let layoutWarnings = []; // Global, set during file read
let isPdfUpload = false;    // True only when a PDF file was uploaded
let fileMetadata = { name: "", size: 0 }; // Track for warnings

async function readPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    let streamText = "";
    layoutWarnings = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Collect X positions to detect multi-column layout
        const xPositions = content.items.map(item => Math.round(item.transform[4]));

        // ── Multi-column detection: look for TWO distinct left-margin clusters ──
        // We count how many DISTINCT lines (Y-coordinates) start at each X-position.
        // This prevents headers or multi-fragment lines from being seen as "columns".
        const buckets = {}; // bucket -> Set of Y-coordinates
        content.items.forEach(item => {
            if (!item.str.trim() || !item.transform) return;
            const x = Math.round(item.transform[4]);
            const y = Math.round(item.transform[5]);
            if (x >= 20 && x <= 350) {
                const xBucket = Math.round(x / 30) * 30;
                if (!buckets[xBucket]) buckets[xBucket] = new Set();
                buckets[xBucket].add(y);
            }
        });

        // A column is "significant" if it has at least 8 distinct lines starting at that X-margin
        const bucketKeys = Object.keys(buckets)
            .map(Number)
            .filter(k => buckets[k].size >= 8)
            .sort((a, b) => a - b);

        const hasWideGap = bucketKeys.length >= 2 && (bucketKeys[bucketKeys.length - 1] - bucketKeys[0]) >= 120;
        if (bucketKeys.length >= 2 && hasWideGap && i === 1) {
            layoutWarnings.push('multi-column');
        }

        // Check for very short text fragments (table cells)
        // Exclude bullet chars, separators, and ordinal markers — these appear in clean resumes too
        const SEPARATOR_PAT = /^[\u2022\u2023\u25B8\u25E6\u25CF\u2043\u2013\u2014\|\*\/\\\-]$|^\d{1,2}$/;
        const fragments = content.items.map(item => item.str.trim()).filter(s => s.length > 0);
        const shortFragments = fragments.filter(s =>
            s.length <= 3 &&
            !/^[A-Z]/.test(s) &&
            !SEPARATOR_PAT.test(s)
        );
        // Raise threshold to 50% — genuine table layouts have the majority of fragments as short cells
        if (shortFragments.length > fragments.length * 0.50 && fragments.length > 30) {
            layoutWarnings.push('table-cells');
        }

        // Reconstruct natural line breaks (Visual View)
        // Sort items into columns if a multi-column layout is detected
        let splitX = 9999;
        if (bucketKeys.length >= 2) {
            let maxGap = 0;
            for (let j = 0; j < bucketKeys.length - 1; j++) {
                const gap = bucketKeys[j+1] - bucketKeys[j];
                if (gap > maxGap) {
                    maxGap = gap;
                    splitX = bucketKeys[j] + (gap / 2);
                }
            }
        }

        // Group items by column (left/right of splitX), then by Y
        const columns = { left: {}, right: {} };
        for (const item of content.items) {
            if (!item || !item.str || !item.str.trim() || !item.transform) continue;
            const x = item.transform[4];
            const y = Math.round(item.transform[5] / 4) * 4;
            const col = x < splitX ? columns.left : columns.right;
            if (!col[y]) col[y] = [];
            col[y].push({ x: item.transform[4], str: item.str, width: item.width });
        }

        // Helper to process a column
        const processColumn = (colByY) => {
            return Object.keys(colByY)
                .map(Number)
                .sort((a, b) => b - a) // PDF Y is bottom-up
                .map(y => {
                    const items = colByY[y].sort((a, b) => a.x - b.x);
                    if (items.length === 0) return '';
                    let lineStr = items[0].str;
                    for (let j = 1; j < items.length; j++) {
                        const prev = items[j - 1];
                        const curr = items[j];
                        const gap = curr.x - (prev.x + prev.width);
                        if (gap > 3) {
                            lineStr += ' ' + curr.str;
                        } else {
                            lineStr += curr.str;
                        }
                    }
                    return lineStr;
                })
                .join('\n');
        };

        const leftText = processColumn(columns.left);
        const rightText = processColumn(columns.right);
        
        // Append to page text
        if (rightText.trim().length > 0) {
            text += leftText + '\n\n' + rightText + '\n\n';
        } else {
            text += leftText + '\n\n';
        }
        
        // Capture raw stream order (ATS Stream)
        streamText += content.items.map(item => item.str).join(' ') + '\n\n';
    }

    // Deduplicate warnings
    layoutWarnings = [...new Set(layoutWarnings)];
    return { reconstructed: text, stream: streamText };
}

async function readDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    
    // Check for tables by converting to HTML (diagnostic)
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    if (htmlResult.value.includes('<table')) {
        layoutWarnings.push('table-cells');
    }
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

// Format Compliance Checklist
// Returns { score: 0-100, issues: [{key, label, severity}] }
// Score is used as a MULTIPLIER on keyword effectiveness, modelling real ATS behavior:
// a bad template physically prevents the parser from finding keywords (text-layer scrambling).
function getFormatChecklist(fullText) {
    const issues = [];
    let score = 100;

    const isMultiCol    = layoutWarnings.includes('multi-column');
    const hasTableCells = layoutWarnings.includes('table-cells');
    
    if (isMultiCol && hasTableCells) {
        issues.push({ key: 'multi-column+tables', label: 'Multi-column layout + table cells', severity: 'critical' });
        score = 15;
    } else if (isMultiCol) {
        issues.push({ key: 'multi-column', label: 'Multi-column layout (2-column template)', severity: 'critical' });
        score = 30;
    } else if (hasTableCells) {
        issues.push({ key: 'table-cells', label: 'Table-based layout (multi-column warning)', severity: 'critical' });
        score = 55;
    }

    // Universal: detect apostrophe-style dates ('21, '22) — confuses ATS years-of-experience parsing
    if (/'\d{2}\b/.test(fullText)) {
        issues.push({ key: 'bad-dates', label: "Non-standard dates (e.g., '21, '22) — ATS can't calculate years of experience", severity: 'minor' });
        score = Math.max(15, score - 5);
    }

    return { score, issues };
}

function getCompanyNameCandidates(text) {
    if (!text) return new Set();
    const snippet = text.split(/\r?\n/).slice(0, 2).join(' ');
    const companyPattern = /\b([A-Z][A-Za-z0-9&\-\.\s]{2,100}?)\s+(provides|is|offers|creates|delivers|builds|develops|seeks|looks|specializes|serves|supports|manufactures|designs|consults|helps|partners)/i;
    const match = snippet.match(companyPattern);
    const candidates = new Set();

    const addCandidate = (name) => {
        if (!name) return;
        name.split(/[\s&\/-]+/).forEach(part => {
            const normalized = part.trim().toLowerCase();
            if (normalized.length > 2 && !/^(inc|llc|ltd|corp|co|company|group|solutions|services|technologies|systems)$/.test(normalized)) {
                candidates.add(normalized);
            }
        });
    };

    if (match) {
        addCandidate(match[1]);
    }
    return candidates;
}

const PROTECTED_KEYWORDS = new Set(['data', 'training', 'software', 'web', 'agile', 'scrum', 'code', 'writing', 'user', 'seo', 'api', 'cloud', 'security', 'database', 'testing', 'programming', 'engineering', 'development', 'management', 'analytics']);
const NOISE_KEYWORDS = new Set([
    // Standard English Stop Words (Articles, Prepositions, Conjunctions, Pronouns, Auxiliary Verbs)
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren', "aren't",
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', "can't",
    'cannot', 'could', 'couldn', "couldn't", 'did', 'didn', "didn't", 'do', 'does', 'doesn', "doesn't", 'doing',
    'don', "don't", 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn', "hadn't", 'has',
    'hasn', "hasn't", 'have', 'haven', "haven't", 'having', 'he', "he'd", "he'll", "he's", 'her', 'here', "here's",
    'hers', 'herself', 'him', 'himself', 'his', 'how', "how's", 'i', "i'd", "i'll", "i'm", "i've", 'if', 'in',
    'into', 'is', 'isn', "isn't", 'it', "it's", 'its', 'itself', "let's", 'me', 'more', 'most', 'mustn', "mustn't",
    'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
    'ourselves', 'out', 'over', 'own', 'same', 'shan', "shan't", 'she', "she'd", "she'll", "she's", 'should',
    'shouldn', "shouldn't", 'so', 'some', 'such', 'than', 'that', "that's", 'the', 'their', 'theirs', 'them',
    'themselves', 'then', 'there', "there's", 'these', 'they', "they'd", "they'll", "they're", "they've", 'this',
    'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn', "wasn't", 'we', "we'd", "we'll",
    "we're", "we've", 'were', 'weren', "weren't", 'what', "what's", 'when', "when's", 'where', "where's", 'which',
    'while', 'who', "who's", 'whom', 'why', "why's", 'with', 'won', "won't", 'would', 'wouldn', "wouldn't",
    'you', "you'd", "you'll", "you're", "you've", 'your', 'yours', 'yourself', 'yourselves',

    // Extra Prepositions & Conjunctions
    'onto', 'upon', 'above', 'below', 'amid', 'among', 'atop', 'behind', 'beneath', 'beside', 'between',
    'beyond', 'during', 'inside', 'outside', 'towards', 'along', 'per', 'via', 'versus', 'vs', 'unless',
    'since', 'whether', 'although', 'though', 'whereas', 'based', 'using', 'related', 'related to', 'including',

    // Auxiliary & Modals
    'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'ought', 'dare', 'need', 'needs', 'needed',

    // High-frequency generic verbs (no specific skill signal)
    'get', 'got', 'getting', 'make', 'made', 'making', 'take', 'took', 'taking', 'give', 'gave', 'giving',
    'come', 'came', 'coming', 'go', 'went', 'going', 'see', 'saw', 'seeing', 'know', 'knew', 'knowing',
    'think', 'thought', 'thinking', 'want', 'wanted', 'wanting', 'feel', 'felt', 'feeling', 'seem', 'seemed',
    'seeming', 'let', 'lets', 'put', 'puts', 'putting', 'set', 'sets', 'setting', 'try', 'tries', 'trying',
    'look', 'looks', 'looking', 'keep', 'kept', 'keeping', 'ask', 'asked', 'asking', 'turn', 'turned',
    'turning', 'move', 'moved', 'moving', 'show', 'showed', 'showing', 'find', 'found', 'finding',
    'use', 'used', 'uses', 'using', 'help', 'helped', 'helping', 'tell', 'told', 'telling',
    'work', 'worked', 'works', 'working', 'lead', 'led', 'leading', 'drive', 'driven', 'driving',
    'manage', 'managed', 'manages', 'managing', 'coordinate', 'coordinated', 'coordinating',
    'build', 'built', 'building', 'create', 'created', 'creating', 'design', 'designed', 'designing',
    'develop', 'developed', 'developing', 'support', 'supported', 'supporting', 'deliver', 'delivered',
    'delivering', 'establish', 'established', 'establishing', 'maintain', 'maintained', 'maintaining',
    'monitor', 'monitored', 'monitoring', 'oversee', 'oversaw', 'overseeing', 'perform', 'performed',
    'performing', 'present', 'presented', 'presenting', 'resolve', 'resolved', 'resolving',
    'train', 'trained', 'training', 'track', 'tracked', 'tracking', 'update', 'updated', 'updating',
    'utilize', 'utilized', 'utilizing', 'assist', 'assisted', 'assisting', 'guide', 'guided', 'guiding',
    'conduct', 'conducted', 'conducting', 'direct', 'directed', 'directing', 'ensure', 'ensured',
    'ensuring', 'handle', 'handled', 'handling', 'execute', 'executed', 'executing', 'report',
    'reported', 'reporting', 'achieve', 'achieved', 'achieving', 'collaborate', 'collaborated',
    'collaborating', 'communicate', 'communicated', 'communicating', 'facilitate', 'facilitated',
    'facilitating', 'implement', 'implemented', 'implementing', 'improve', 'improved', 'improving',
    'maximize', 'maximized', 'maximizing', 'optimize', 'optimized', 'optimizing',

    // Filler/Qualitative Adjectives & Adverbs
    'good', 'great', 'new', 'old', 'big', 'small', 'large', 'fast', 'slow', 'long', 'short',
    'high', 'low', 'deep', 'bold', 'simple', 'different', 'various', 'several', 'another',
    'similar', 'same', 'common', 'next', 'last', 'right', 'left', 'early', 'late',
    'highly', 'truly', 'deeply', 'closely', 'directly', 'quickly', 'effectively', 'primarily',
    'proactively', 'actively', 'accurately', 'concisely', 'efficiently', 'easily', 'successfully',
    'frequently', 'always', 'never', 'sometimes', 'often', 'usually', 'also', 'even', 'just',
    'now', 'then', 'here', 'there', 'still', 'well', 'very', 'too', 'proven', 'strong',
    'excellent', 'outstanding', 'required', 'preferred', 'preferably', 'ideal', 'minimum',
    'additional', 'appropriate', 'multiple', 'significant', 'important', 'key', 'core',
    'main', 'major', 'primary', 'general', 'qualified', 'relevant', 'top', 'typical',
    'able', 'active', 'adaptable', 'basic', 'best', 'broad', 'central', 'clear', 'close',
    'competitive', 'complex', 'daily', 'dedicated', 'focused', 'professional', 'successful',

    // Boilerplate Nouns & Qualifiers (meaningless for professional matching)
    'ability', 'abilities', 'background', 'backgrounds', 'candidate', 'candidates', 'company',
    'companies', 'corporate', 'culture', 'day', 'days', 'degree', 'degrees', 'department',
    'departments', 'division', 'divisions', 'duty', 'duties', 'employee', 'employees',
    'employer', 'employers', 'environment', 'environments', 'experience', 'experiences',
    'field', 'fields', 'focus', 'foci', 'function', 'functions', 'group', 'groups',
    'individual', 'individuals', 'industry', 'industries', 'interest', 'interests',
    'job', 'jobs', 'knowledge', 'level', 'levels', 'member', 'members', 'methodology',
    'methodologies', 'mission', 'missions', 'opportunity', 'opportunities', 'organization',
    'organizations', 'part', 'parts', 'passion', 'passions', 'people', 'person', 'persons',
    'place', 'places', 'position', 'positions', 'practice', 'practices', 'problem',
    'problems', 'process', 'processes', 'product', 'products', 'project', 'projects',
    'qualification', 'qualifications', 'requirement', 'requirements', 'responsibility',
    'responsibilities', 'role', 'roles', 'segment', 'segments', 'service', 'services',
    'skill', 'skills', 'solution', 'solutions', 'staff', 'task', 'tasks', 'team',
    'teams', 'technology', 'technologies', 'understanding', 'understandings', 'value',
    'values', 'way', 'ways', 'year', 'years', 'week', 'weeks', 'month', 'months',
    'time', 'times', 'etc', 'one', 'plus', 'prior', 'least', 'basis', 'note', 'notes',
    'detail', 'details', 'mindset', 'mindsets', 'bias', 'diversity', 'inclusive',
    'inclusion', 'equity', 'belonging', 'transparent', 'accountability', 'innovative',
    'innovation', 'creativity', 'creative', 'motivated', 'adaptable', 'flexible', 'driven',
    'dedicated', 'committed', 'enthusiastic', 'collaborative', 'proactive', 'self',
    'expert', 'expertise', 'specialist', 'specialists', 'leadership', 'leader', 'leaders',
    'management', 'manager', 'managers', 'officer', 'officers', 'director', 'directors',
    'vice', 'president', 'associate', 'associates', 'senior', 'junior', 'staff',
    'personnel', 'executive', 'executives', 'owner', 'owners', 'member', 'members',
    'adviser', 'advisers', 'advisor', 'advisors', 'consultant', 'consultants',
    'success', 'successes', 'growth', 'strategic', 'strategy', 'strategies',
    'passionate', 'empathy',

    // Generic JD filler that is NOT a real skill (prevents misleading "missing keyword" advice)
    'experienced', 'growing', 'grow', 'grows', 'join', 'joining', 'joins', 'nice',
    'modern', 'million', 'millions', 'proficiency', 'proficient', 'familiarity',
    'familiar', 'looking', 'seeking', 'seek', 'seeks', 'world', 'class', 'paced',
    'cutting', 'edge', 'hands', 'bonus', 'preferred', 'preferable', 'desired',
    'ideal', 'strong', 'solid', 'excellent', 'exciting', 'dynamic', 'leading',
    'fast', 'growing', 'scalable', 'robust', 'modern', 'across', 'within', 'every',

    // URL components — extracted when JDs contain links
    'https', 'http', 'www', 'com', 'org', 'net', 'edu', 'gov', 'html', 'htm', 'php',
    'email', 'mailto', 'link', 'links', 'url', 'urls', 'pdf', 'docx', 'doc', 'click',
    'page', 'pages', 'site', 'sites', 'visit', 'apply', 'applying',

    // Generic media/content nouns (not skills)
    'video', 'videos', 'audio', 'image', 'images', 'photo', 'photos', 'media',
    'webinar', 'webinars', 'podcast', 'podcasts', 'blog', 'blogs', 'post', 'posts',
    'article', 'articles', 'report', 'reports', 'whitepaper', 'whitepapers',

    // Hyphenated JD filler adjectives
    'solution-oriented', 'detail-oriented', 'results-driven', 'customer-focused',
    'customer-centric', 'data-driven', 'self-starter', 'self-motivated', 'fast-paced',
    'forward-thinking', 'results-oriented', 'metrics-driven', 'outcome-focused',

    // Diversity / inclusion boilerplate
    'diverse', 'diversify', 'diversified', 'inclusion', 'inclusive', 'belong', 'belonging'
]);


// Words from company marketing, job titles, and cities. Not skills to paste into a resume.
const JD_NOT_SKILLS = new Set([
    'bring', 'bringing', 'launching', 'limitless', 'seamlessly', 'believes', 'breakthrough',
    'discover', 'trusted', 'biggest', 'players', 'resilient', 'matter', 'follow', 'today',
    'bangalore', 'bengaluru', 'principal', 'hands-on', 'exploring', 'potential', 'game-changing'
]);

// Whole-word equivalents only. "docs" must not count as "mkdocs", and "data" must not count as "analytics".
const NARROW_SYNONYMS = {
    rest: ['api'],
    api: ['rest'],
    js: ['javascript'],
    javascript: ['js'],
    k8s: ['kubernetes'],
    kubernetes: ['k8s'],
    nosql: ['no-sql'],
    'no-sql': ['nosql'],
    genai: ['generative']
};

function keywordsMatch(jdKw, freqMap) {
    const needle = String(jdKw || '').toLowerCase();
    if (!needle || !freqMap) return false;
    if (freqMap[needle] > 0) return true;
    const alts = NARROW_SYNONYMS[needle] || [];
    return alts.some(alt => freqMap[alt] > 0);
}

// Keep the role, responsibilities, and requirements. Drop the company introduction.
function isolateJobRequirements(text) {
    const src = String(text || '').replace(/\r/g, '');
    const hadCompanyIntro = /about the job\b|about the company\b|about us\b|who we are\b/i.test(src);
    const headerRes = [
        /about the role\b/i,
        /about this role\b/i,
        /key responsibilities\b/i,
        /roles?\s+and\s+responsibilities\b/i,
        /what you(?:'|’)ll (?:do|bring)\b/i,
        /what you will (?:do|bring)\b/i,
        /what we(?:'|’)re looking for\b/i,
        /what we are looking for\b/i,
        /requirements?\s*(?:&|and)\s*experience\b/i,
        /minimum qualifications\b/i,
        /required qualifications\b/i,
        /basic qualifications\b/i,
        /qualifications\b/i,
        /\bresponsibilities\b/i,
        /\brequirements\b/i
    ];
    let start = -1;
    headerRes.forEach(re => {
        const match = re.exec(src);
        if (match && (start === -1 || match.index < start)) start = match.index;
    });
    let body = start >= 0 ? src.slice(start) : src;
    const beforeStrip = body;
    body = body.replace(/\n(?:about (?:the|our) company|who we are|equal opportunity|we are an equal)[\s\S]*$/i, '');
    const trimmed = (start > 0) || body.length < beforeStrip.length;
    return {
        text: body,
        trimmed,
        hadCompanyIntro,
        foundRole: start >= 0
    };
}

// Professional Keyword Extraction Logic

function getKeywords(text, isJD = false) {
    if (!text) return {};

    let processingText = text;

    // Strip URLs first — they produce noise tokens like 'https', 'www', 'com'
    processingText = processingText.replace(/https?:\/\/\S+/gi, ' ').replace(/\bwww\.\S+/gi, ' ');

    if (isJD) {
        processingText = processingText
            .replace(/who we are[\s\S]*?job description/gi, '')
            .replace(/diversity[\s\S]*?equal opportunity/gi, '')
            .replace(/we have the flexibility to manage[\s\S]*?embrace you/gi, '')
            .replace(/hewlett packard enterprise is the global[\s\S]*?thrive in today/gi, '');
        const isolated = isolateJobRequirements(processingText);
        processingText = isolated.text;
        window.lastJdScope = isolated;
    }

    const companyCandidates = isJD ? getCompanyNameCandidates(processingText) : new Set();
    const words = processingText.toLowerCase()
        .replace(/([a-z])([A-Z])/g, '$1 $2') 
        .replace(/[^\w\s+#+-]/g, ' ') 
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 2 || /^(ai|js|ip|5g|ui|ux|c#|xml)$/.test(w));

    const frequencyMap = {};
    words.forEach(w => {
        if (companyCandidates.has(w)) return;
        if (isJD && JD_NOT_SKILLS.has(w)) return;
        if (PROTECTED_KEYWORDS.has(w) || !NOISE_KEYWORDS.has(w)) {
            frequencyMap[w] = (frequencyMap[w] || 0) + 1;
        }
    });

    return frequencyMap;
}

const TECH_BOOST = new Set(['xml', 'agile', 'scrum', 'ai', 'seo', 'api', 'cloud', 'wireless', '5g', 'gui', 'architecture', 'dita', 'cms', 'software', 'documentation', 'content', 'technical', 'kubernetes', 'docker', 'aws', 'typescript']);

// Professional Analysis Modules
const ANALYSIS_RULES = {
    weakVerbs: ['assisted', 'helped', 'worked', 'involved', 'responsible', 'participated', 'did', 'making'],
    activeVerbs: ['led', 'directed', 'managed', 'supervised', 'orchestrated', 'spearheaded', 'built', 'developed', 'designed', 'engineered', 'created', 'architected', 'optimized', 'improved', 'increased', 'decreased', 'streamlined', 'simplified', 'accelerated', 'delivered', 'generated', 'negotiated', 'secured', 'won', 'surpassed', 'launched', 'mentored', 'automated'],
    pronouns: ['i', 'me', 'my', 'mine', 'we', 'our', 'us']
};

// ─────────────────────────────────────────────────────────────────────────────
//  CONTACT INFO VALIDATOR — catches broken LinkedIn, bad email, bad phone
// ─────────────────────────────────────────────────────────────────────────────
function checkContactInfo(text) {
    const issues = [];
    const warnings = [];

    // ── Email ──────────────────────────────────────────────────────────────────
    const emailRegex = /([a-zA-Z0-9._%+\-]+\s*[@＠]\s*[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g;
    const emailCandidates = text.match(emailRegex) || [];
    
    if (emailCandidates.length === 0) {
        issues.push('No email address found. Add a professional email (yourname@gmail.com) to your contact section.');
    } else {
        emailCandidates.forEach(raw => {
            const e = raw.replace(/\s/g, '').toLowerCase();
            if ((e.match(/@/g) || []).length > 1) {
                issues.push(`Email looks broken: <strong>${e}</strong> — has two @ symbols.`);
            } else if (/\.(con|cmo|ocm|cm|gmal|gmial|yahooo|outlok|outlookcom)$/i.test(e)) {
                issues.push(`Email domain looks like a typo: <strong>${e}</strong> — check the domain spelling.`);
            }
        });
    }

    // ── Phone ──────────────────────────────────────────────────────────────────
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}/g;
    const phoneCandidates = text.match(phoneRegex) || [];
    const validPhones = phoneCandidates.filter(p => p.replace(/\D/g, '').length >= 10);
    
    if (validPhones.length === 0) {
        warnings.push('No phone number detected. Add your number so recruiters can call you.');
    } else {
        validPhones.forEach(raw => {
            const digits = raw.replace(/\D/g, '');
            if (digits.length < 10 && digits.length > 0) {
                issues.push(`Phone number looks incomplete: <strong>${raw.trim()}</strong> — only ${digits.length} digits found (expected 10+).`);
            }
        });
    }

    // ── LinkedIn ───────────────────────────────────────────────────────────────
    // Match any linkedin.com mention in the text
    const linkedinMatches = text.match(/linkedin\.com[^\s,)"<>]*/gi) || [];
    if (linkedinMatches.length === 0) {
        // Also check for bare /in/ pattern (no domain)
        if (!/\/in\/[a-zA-Z0-9\-]{3,}/i.test(text)) {
            warnings.push('No LinkedIn profile URL found. Add linkedin.com/in/your-name — recruiters check LinkedIn for every candidate.');
        }
    } else {
        linkedinMatches.forEach(raw => {
            const url = raw.toLowerCase();
            // Must have /in/ followed by a username of at least 3 chars
            if (!/linkedin\.com\/in\/[a-zA-Z0-9\-]{3,}/.test(url)) {
                issues.push(`LinkedIn URL looks broken: <strong>${raw}</strong><br>
                    Expected format: <code>linkedin.com/in/your-name</code><br>
                    Common issues: missing /in/, extra spaces, broken copy-paste from PDF.`);
            } else if (/linkedin\.com\/in\/$/.test(url) || /linkedin\.com\/in\/[^a-zA-Z0-9]/.test(url)) {
                issues.push(`LinkedIn URL appears incomplete: <strong>${raw}</strong> — the username part is missing or invalid.`);
            }
        });
    }

    // ── Other URLs (portfolio, GitHub, website) ────────────────────────────────
    const urlMatches = text.match(/https?:\/\/[^\s,)"<>]+/gi) || [];
    urlMatches.forEach(raw => {
        // Catch obviously broken URLs
        if (/https?:\/\/(www\.)?linkedin/i.test(raw) && !/\/in\/[a-zA-Z0-9\-]{3,}/.test(raw)) {
            issues.push(`LinkedIn URL is broken: <strong>${raw}</strong> — missing the /in/username part.`);
        }
        // Catch URLs with spaces (common PDF copy-paste artifact)
        if (/https?:\/\/[^\s]*\s/.test(raw + ' ')) {
            issues.push(`URL appears to have a space or line-break in it (common in PDFs): <strong>${raw}</strong>`);
        }
    });

    return { issues, warnings };
}

function calculateStructureScore(text) {
    return getStructureDetails(text).score;
}

function getStructureDetails(text) {
    const lowerText = text.toLowerCase();
    // Sections are weighted by how critical they are to ATS parsing.
    // Critical: without these, the ATS cannot categorise the candidate at all.
    // Major: strongly expected by most ATS and recruiters.
    // Minor: beneficial but not universally required.
    const sectionGroups = [
        { name: 'Work Experience',        patterns: ['experience', 'work history', 'professional background', 'employment', 'career'], weight: 30 },
        { name: 'Skills',                 patterns: ['skills', 'competencies', 'technologies', 'expertise', 'specialization'],        weight: 25 },
        { name: 'Education',              patterns: ['education', 'academic', 'university', 'degree'],                                   weight: 20 },
        { name: 'Summary / Profile',      patterns: ['summary', 'profile', 'objective', 'about me', 'professional profile'],           weight: 10 },
        { name: 'Contact Info',           patterns: ['contact', 'phone', 'email', 'linkedin', 'address'],                              weight: 10 },
        { name: 'Projects / Portfolio',   patterns: ['projects', 'portfolio', 'key initiatives', 'selected works', 'publications'],    weight: 3  },
        { name: 'Certifications / Awards',patterns: ['certifications', 'awards', 'training', 'certification', 'license', 'credentials'], weight: 2, optional: true }
    ];
    const totalWeight = sectionGroups.reduce((s, g) => s + g.weight, 0); // = 100

    const found = [];
    const missing = [];
    const optional = [];
    let earnedWeight = 0;

    sectionGroups.forEach(group => {
        const detected = group.patterns.some(s => lowerText.includes(s));
        // Fallback: detect Contact Info via email/phone regex even if header label is absent
        if (!detected && group.name === 'Contact Info') {
            if (/\S+@\S+\.\S+/.test(lowerText) || /\d{7,}/.test(lowerText)) {
                found.push(group.name + ' (detected via phone/email)');
                earnedWeight += group.weight;
                return;
            }
        }
        if (detected) {
            found.push(group.name);
            earnedWeight += group.weight;
        } else if (group.optional) {
            optional.push(group.name);
            earnedWeight += group.weight;
        } else {
            missing.push(group.name);
        }
    });

    const score = Math.min(Math.round((earnedWeight / totalWeight) * 100), 100);
    return { score, found, missing, optional };
}

function calculateImpactScore(text) {
    return getImpactDetails(text).score;
}

function getImpactDetails(text) {
    const lowerText = text.toLowerCase();
    
    // Detect numbers, percentages, dollar amounts — but exclude phone numbers and years
    // Phone numbers: 7+ consecutive digits. Years: 4-digit 19xx/20xx. Zip codes: bare 5-digit.
    const phonePattern = /(?:\+\d{7,}|\b\d{10,}\b)/g;
    const yearPattern = /\b(19|20)\d{2}\b/g;
    const cleanedText = text.replace(phonePattern, '').replace(yearPattern, '');

    const metricPattern = /\b\d+%|\$[\d,]+|\d+[kKmMbB]\b|\+\d{1,3}%|\b\d{1,3}\s*\+|\b\d{1,3}-member\b|\b\d{1,4}(?:\+)?\s*(?:years?|users?|customers?|people|engineers?|writers?|teams?|products?|projects?|companies|countries|articles?|clients?|packs?|members?)/gi;
    const softMetricPattern = /\b(reduced|increased|saved|growth|revenue|efficiency)\b/gi;

    const rawMetrics = cleanedText.match(metricPattern) || [];
    const softMetrics = cleanedText.match(softMetricPattern) || [];
    const metrics = [...rawMetrics, ...softMetrics];
    const metricCount = metrics.length;
    // Filter out phone-like sequences from the display examples
    const metricExamples = [...new Set(rawMetrics)].filter(m => !/^\d{5,}$/.test(m.replace(/[^\d]/g, ''))).slice(0, 5);

    // Detect high-impact action verbs
    const words = lowerText.split(/\W+/);
    const foundVerbs = ANALYSIS_RULES.activeVerbs.filter(v => words.includes(v));

    // Impact score is now driven PRIMARILY by bullet-level metrics percentage.
    // We call getBulletMetricsPct() here to get the accurate per-bullet measurement.
    // This aligns the displayed "Bullets with metrics" stat with the actual score.
    const bulletData = getBulletMetricsPct(text);
    const bulletPct = bulletData.pct; // 0-100

    // Verb quality contributes a smaller boost (max 20 points)
    const verbBonus = Math.min([...new Set(foundVerbs)].length * 3, 20);

    // Composite: 80% bullet metrics + 20% verb bonus
    const score = Math.round(bulletPct * 0.80 + verbBonus);

    return { 
        score: Math.min(score, 100), 
        metricCount, 
        metricExamples, 
        foundVerbs: [...new Set(foundVerbs)] 
    };
}


function getResumeHealth(text) {
    const words = text.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    
    const foundPronouns = words.filter(w => ANALYSIS_RULES.pronouns.includes(w));
    const foundWeakVerbsList = words.filter(w => ANALYSIS_RULES.weakVerbs.includes(w));
    const uniqueWeakVerbs = [...new Set(foundWeakVerbsList)];
    
    return {
        wordCount,
        pronounCount: foundPronouns.length,
        weakVerbCount: foundWeakVerbsList.length,
        weakVerbsFound: uniqueWeakVerbs,
        isWallOfText: wordCount > 1800,
        isTooShort: wordCount < 300
    };
}

function getBulletMetricsPct(text) {
    // Clean phone numbers and years first to avoid false positives in metric detection
    const phonePattern = /(?:\+\d{7,}|\b\d{10,}\b)/g;
    const yearPattern = /\b(19|20)\d{2}\b/g;
    const cleanedText = text.replace(phonePattern, ' [PHONE] ').replace(yearPattern, ' [YEAR] ');

    const lines = cleanedText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 20);
    const bullets = lines.filter(line => {
        // 1. Explicit bullet characters are always treated as bullets
        if (/^[\u2022\u2023\u25B8\u25E6\u2043\u25CF\u25AA\-\*\u00b7]/.test(line)) return true;
        
        // 2. Fallback heuristic: Starts with uppercase, reasonable length
        // Also ensure it is NOT an all-caps header and DOES NOT contain title indicators
        const isLikelyBullet = /^[A-Z]/.test(line) && line.length >= 40 && line.length < 350 && line !== line.toUpperCase();
        
        // 3. Reject if it looks like a section header, job metadata, or title
        const isMetadata = /[|—]/.test(line) || /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/i.test(line);
        const isSkillList = (line.match(/,/g) || []).length > 2 && line.length < 120;
        
        return isLikelyBullet && !isMetadata && !isSkillList;
    });
    const metricPattern = /\d+%|\$[\d,]+|\d+\s?[kKmMbB]\b|\+\d+%|\d+x\b|\d{1,3}\s*\+|\d{1,3}-member|\d+\s*(years?|users?|customers?|people|products?|projects?|teams?|engineers?|writers?|companies|countries|articles?|cycles?|platforms?|members?|roles?|sites?|packs?)/i;
    const withMetrics = bullets.filter(line => metricPattern.test(line));
    const withoutMetrics = bullets.filter(line => !metricPattern.test(line));
    const total = bullets.length;
    // Pick up to 2 of the weakest bullets (shortest = least detail = best "before" candidates)
    const weakBulletSamples = withoutMetrics
        .filter(b => b.length > 30 && b.length < 200)
        .sort((a, b) => a.length - b.length)
        .slice(0, 2)
        .map(b => b.replace(/^[\u2022\u2023\u25B8\u25E6\u2043\u25CF\u25AA\-\*\u00b7]\s*/, '').trim());
    return { pct: total > 0 ? Math.round((withMetrics.length / total) * 100) : 0, withMetrics: withMetrics.length, total, weakBulletSamples };
}

analyzeBtn.addEventListener('click', () => {
    const jdText = document.getElementById('jobDescription').value.trim();

    if (!resumeText) {
        showInlineAlert("Please upload your resume first.");
        return;
    }

    const hasJD = jdText.length > 50;

    trackEvent('analyze_resume', {
        'has_jd': hasJD ? 'yes' : 'no'
    });

    // Show loading state
    const btnText = analyzeBtn.querySelector('.btn-text');
    const btnLoader = analyzeBtn.querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    analyzeBtn.disabled = true;
    
    // Reset score circle visual offset
    const circle = document.getElementById('scoreBarCircle');
    if (circle) {
        circle.style.strokeDashoffset = 283;
    }
    
    // Simulate brief processing delay for UX
    setTimeout(() => {
        try {
            const jdFreq = hasJD ? getKeywords(jdText, true) : {};
            const resumeFreq = getKeywords(resumeText, false);
            
            const found = [];
            const missing = [];
            let keywordScore = 0;
            let maxPossibleScore = 0;

            if (hasJD) {
                // Helper for Universal (Bi-directional) Synonym Matching
                const checkMatch = (jdKw, freqMap) => keywordsMatch(jdKw, freqMap);

                // Keyword matching: each JD keyword is scored by frequency (capped at 3 occurrences).
                // TECH_BOOST removed: the 5x multiplier made scores unpredictable and opaque.
                // Instead, all keywords are scored equally — the quality of match is what matters.
                Object.keys(jdFreq).forEach(jdKw => {
                    const jdWeight = Math.min(jdFreq[jdKw], 3);
                    maxPossibleScore += jdWeight * 10;
                    if (checkMatch(jdKw, resumeFreq)) {
                        found.push(jdKw);
                        keywordScore += jdWeight * 10;
                    } else {
                        missing.push(jdKw);
                    }
                });
            }

            displayResults(found, missing, resumeText, jdFreq, resumeFreq, keywordScore, maxPossibleScore, hasJD);
            bumpUsageCounter('counters/v2_scanner');
        } catch (analysisError) {
            console.error('Resume analysis failed:', analysisError);
            if (!window.lastResults || !resultsSection || resultsSection.classList.contains('hidden')) {
                showInlineAlert('Resume analysis failed. Please refresh the page and try again.');
            } else {
                console.warn('Partial analysis completed despite error:', analysisError);
            }
        } /* finally */ {
            // Reset button state even if an error occurs
            try {
                btnText.style.display = 'inline-block';
                btnLoader.style.display = 'none';
                analyzeBtn.disabled = false;
            } catch (resetError) {
                console.error('Error resetting analyze button state:', resetError);
            }
        }
    }, 500);
});

function inferJobFamilies(text) {
    const t = (text || '').toLowerCase();
    const hits = [];
    if (/technical writer|documentation engineer|information developer|docs-as-code|docs as code|dita|oxygen xml|acrolinx|api docs|madcap/.test(t)) hits.push('docs');
    if (/software engineer|javascript|python|react|kubernetes|backend|full stack/.test(t)) hits.push('swe');
    if (/data analyst|data scientist|tableau|pandas|power bi/.test(t)) hits.push('data');
    if (/product manager|product owner|roadmap/.test(t)) hits.push('pm');
    if (/ux designer|product designer|figma|wireframe/.test(t)) hits.push('design');
    return hits;
}

function ensureJobsMatchCta(fullText) {
    const roles = inferJobFamilies(fullText);
    try {
        sessionStorage.setItem('atsJobMatch', JSON.stringify({ roles: roles, t: Date.now() }));
    } catch (e) { /* private mode */ }
    const jobsHref = (location.pathname.indexOf('/role/') !== -1 ? '../jobs.html' : 'jobs.html') +
        (roles.length ? ('?roles=' + encodeURIComponent(roles.join(','))) : '');
    let box = document.getElementById('jobsMatchCta');
    if (!box) {
        box = document.createElement('div');
        box.id = 'jobsMatchCta';
        box.className = 'cta-box alt';
        const host = document.querySelector('.results-cta');
        if (host) host.insertBefore(box, host.firstChild);
        else if (resultsSection) resultsSection.appendChild(box);
    }
    const roleNote = roles.length
        ? 'We inferred: ' + roles.join(', ') + '.'
        : 'Pick a role family on the next page.';
    box.innerHTML = '<h3>Find jobs this resume matches</h3>' +
        '<p>' + roleNote + ' Opens official LinkedIn search plus public Greenhouse boards. Paste any posting back here to rescore.</p>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;">' +
        '<a href="' + jobsHref + '" style="display:inline-block;text-decoration:none;background-color:var(--primary);color:#ffffff;padding:10px 20px;border-radius:8px;font-weight:600;">Find matching jobs →</a>' +
        '</div>';
}

function displayResults(found, missing, fullText, jdFreq, resumeFreq, keywordScore, maxPossibleScore, hasJD = true) {
    resultsSection.classList.remove('hidden');
    resultsSection.style.display = 'block'; // force visible regardless of CSS
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    ensureJobsMatchCta(fullText);

    // Populate Raw Text Preview
    const rawPreview = document.getElementById('rawTextPreview');
    if (rawPreview) {
        rawPreview.value = fullText.trim();
        const formatScore = getFormatChecklist(fullText).score;
        if (formatScore < 50) {
            rawPreview.style.borderColor = '#ef4444'; // Red
            rawPreview.parentElement.style.border = '2px solid #ef4444';
        } else {
            rawPreview.style.borderColor = 'var(--border)';
            rawPreview.parentElement.style.border = 'none';
        }
    }

    const structureResult = getStructureDetails(fullText);
    const impactResult = getImpactDetails(fullText);
    const health = getResumeHealth(fullText);
    const contactCheck = checkContactInfo(fullText);

    const structureScore = structureResult.score;
    const impactScore = impactResult.score;
    const formatCheck = getFormatChecklist(fullText);
    const formatScore = formatCheck.score;
    const criticalFormatIssues = formatCheck.issues.filter(i => i.severity === 'critical');

    const keywordMatchPct = (maxPossibleScore > 0 && hasJD)
        ? Math.min(Math.round((keywordScore / maxPossibleScore) * 100), 100)
        : 0;

    // Multiplicative model: bad template physically hides keywords from ATS parsers.
    const effectiveKeywordScore = Math.round(keywordMatchPct * (formatScore / 100));
    // Final score calculation
    let finalScore = hasJD
        ? Math.round(effectiveKeywordScore * 0.40 + structureScore * 0.20 + impactScore * 0.20 + formatScore * 0.20)
        : Math.round(formatScore * 0.40 + structureScore * 0.30 + impactScore * 0.30);

    const projectedWithFix = hasJD 
        ? Math.min(95, Math.round(keywordMatchPct * 0.95 + 10)) 
        : Math.round(95); // If no JD, fix template → near perfect base score

    // CRITICAL PENALTIES: If core contact info is missing or template is broken, cap the score
    if (contactCheck.issues.length > 0) {
        finalScore = Math.min(finalScore, 65);
    }
    if (formatScore < 50) {
        finalScore = Math.min(finalScore, 50);
    }

    // Critical Alert Zone — prominent warning for template issues
    const criticalAlert = document.getElementById('criticalAlert');
    if (criticalAlert) {
        if (criticalFormatIssues.length > 0) {
            const keywordText = hasJD ? 
                `<li>Our engine detected strong keyword content: <strong>${keywordMatchPct}%</strong></li>
                 <li>But enterprise ATS systems will likely only find <strong>${effectiveKeywordScore}%</strong> of them due to your template.</li>` :
                `<li>Paste a job description above to see your predicted keyword match score.</li>`;
            
            const jumpText = hasJD ? 
                `<li>Fix your template → your score jumps from <strong>${finalScore}% → ~${projectedWithFix}%</strong></li>` :
                `<li>Fixing your template is the fastest way to improve your visibility to recruiters.</li>`;

            criticalAlert.innerHTML = `
                <div class="card critical-alert-card">
                    <div style="display: flex; gap: 1rem; align-items: flex-start;">
                        <div class="alert-icon">⚠️</div>
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 0.5rem 0; color: var(--danger); font-size: 1.1rem;">Template Compliance: ${formatScore}% — Action Required</h3>
                            <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-muted); margin-bottom: 1rem;">
                                Detected: <strong>${formatCheck.issues.map(i => i.label).join(' + ')}</strong>.<br><br>
                                Even if the <strong>Raw Text Preview</strong> below looks readable, older ATS systems (Workday, Taleo) often "mash" columns together, creating unreadable word salad. We've penalized your score to reflect this high risk of automated rejection.
                            </p>
                            <div style="background: rgba(239, 68, 68, 0.05); border-radius: 8px; padding: 1rem; border: 1px solid rgba(239, 68, 68, 0.1);">
                                <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; color: var(--text-muted);">
                                    ${keywordText}
                                    ${jumpText}
                                </ul>
                            </div>
                            <p style="margin-top: 1rem; font-size: 0.85rem; font-weight: 600;">
                                Fix: Use a single-column template from Google Docs (Swiss/Serif) or Word (search "ATS resume").
                            </p>
                        </div>
                    </div>
                </div>`;
            criticalAlert.style.display = 'block';
        } else if (formatCheck.issues.length > 0) {
            criticalAlert.innerHTML = `
                <div class="card" style="border-left: 4px solid var(--warning); padding: 1rem 1.5rem;">
                    <p style="margin: 0; font-size: 0.88rem; color: var(--text-muted);">
                        <strong>ℹ️ Minor Format Note:</strong> ${formatCheck.issues.map(i => i.label).join(' • ')}
                    </p>
                </div>`;
            criticalAlert.style.display = 'block';
        } else {
            criticalAlert.style.display = 'none';
        }
    }

    // Update score description dynamically based on format health
    const scoreTextEl = document.getElementById('scoreText');
    if (scoreTextEl) {
        if (!hasJD) {
            scoreTextEl.textContent = 'Base score (no JD) — template, structure and impact only. Paste a job description above for full keyword analysis.';
        } else if (criticalFormatIssues.length > 0) {
            scoreTextEl.innerHTML = `Template issues are hiding your keywords from ATS parsers. Fix your template to unlock ~<strong>${projectedWithFix}%</strong>.`;
        } else {
            scoreTextEl.textContent = 'ATS compatibility: keyword match, template compliance, structure, and impact — based on how real ATS systems score resumes.';
        }
    }

    // Update UI (Animate score value text count-up)
    const scoreValEl = document.getElementById('scoreValue');
    if (scoreValEl) {
        let startVal = 0;
        const duration = 1200;
        const startTime = performance.now();
        
        function animateNumber(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuad = progress * (2 - progress);
            const currentVal = Math.round(startVal + easeOutQuad * (finalScore - startVal));
            scoreValEl.textContent = currentVal;
            
            if (progress < 1) {
                requestAnimationFrame(animateNumber);
            }
        }
        requestAnimationFrame(animateNumber);
    }
    
    // Animate SVG stroke offset
    const scoreCircleElement = document.getElementById('scoreBarCircle');
    if (scoreCircleElement) {
        const radius = 45;
        const circumference = 2 * Math.PI * radius; // 282.74
        const offset = circumference - (finalScore / 100) * circumference;
        scoreCircleElement.style.strokeDashoffset = offset;
        
        let strokeColor;
        if (finalScore >= 80) strokeColor = 'var(--success)';
        else if (finalScore >= 65) strokeColor = 'var(--primary)';
        else if (finalScore >= 45) strokeColor = 'var(--warning)';
        else strokeColor = 'var(--danger)';
        scoreCircleElement.style.stroke = strokeColor;
    }

    document.getElementById('formatBar').style.width = formatScore + '%';
    document.getElementById('formatPct').textContent  = formatScore + '%';
    document.getElementById('structureBar').style.width = structureScore + '%';
    document.getElementById('structurePct').textContent = structureScore + '%';
    document.getElementById('keywordBar').style.width = keywordMatchPct + '%';
    document.getElementById('keywordPct').textContent = keywordMatchPct + '%';
    document.getElementById('impactBar').style.width = impactScore + '%';
    document.getElementById('impactPct').textContent = impactScore + '%';

    // Verdict badge — contextual label under the score circle
    const verdictBadge = document.getElementById('scoreVerdictBadge');
    if (verdictBadge) {
        let label, bg, color;
        if (finalScore >= 80) {
            label = '🏆 Excellent — ATS-Ready';    bg = 'rgba(52,211,153,0.15)'; color = 'var(--success)';
        } else if (finalScore >= 65) {
            label = '✅ Good — Minor Tweaks Needed';  bg = 'rgba(99,102,241,0.15)'; color = 'var(--accent)';
        } else if (finalScore >= 45) {
            label = '⚠️ Fair — Action Required';     bg = 'rgba(234,179,8,0.15)';  color = 'var(--warning)';
        } else {
            label = '🚨 Needs Work — High Risk';      bg = 'rgba(239,68,68,0.15)';  color = 'var(--danger)';
        }
        verdictBadge.textContent = label;
        verdictBadge.style.background = bg;
        verdictBadge.style.color = color;
    }
    
    // Update Keywords UI
    let filteredMissing = [];
    let extraMissingCount = 0;
    if (hasJD) {
        document.getElementById('foundKeywords').innerHTML = found
            .sort((a, b) => jdFreq[b] - jdFreq[a])
            .map(kw => `<span class="keyword-badge keyword-found">${kw}</span> `)
            .join(' ');
        const filteredMissingRaw = Array.from(new Set(
            missing
            .filter(kw => kw.length > 4 && !NOISE_KEYWORDS.has(kw) && !JD_NOT_SKILLS.has(kw))
            .sort((a, b) => jdFreq[b] - jdFreq[a])
        ));
        filteredMissing = filteredMissingRaw;
        const INITIAL_MISSING_COUNT = 8;
        const displayMissing = filteredMissing.slice(0, INITIAL_MISSING_COUNT);
        extraMissingCount = Math.max(0, filteredMissing.length - displayMissing.length);
        document.getElementById('missingKeywords').innerHTML =
            `<p id="jdScopeNote" style="color:var(--text-muted);font-size:0.82rem;line-height:1.45;margin:0 0 0.75rem;"></p>` +
            displayMissing.map(kw => `<span class="keyword-badge keyword-missing">${kw}</span>`).join(' ') +
            (extraMissingCount > 0
                ? `<div id="allMissingKeywords" style="display:none; margin-top:0.5rem; line-height:1.8;">
                       ${filteredMissing.slice(INITIAL_MISSING_COUNT).map(kw => `<span class="keyword-badge keyword-missing">${kw}</span>`).join(' ')}
                   </div>
                   <button id="showMissingKeywordsBtn" style="margin-top:0.9rem; background: transparent; border: 1px solid rgba(239,68,68,0.35); color: var(--danger); padding: 0.45rem 1rem; border-radius: 999px; font-size: 0.8rem; font-weight:600; cursor:pointer; display:block;">
                       + Show ${extraMissingCount} more missing keywords
                   </button>`
                : '');
        const showMissingBtn = document.getElementById('showMissingKeywordsBtn');
        if (showMissingBtn) {
            showMissingBtn.addEventListener('click', () => {
                document.getElementById('allMissingKeywords').style.display = 'block';
                showMissingBtn.textContent = '− Show fewer';
                showMissingBtn.addEventListener('click', () => {
                    document.getElementById('allMissingKeywords').style.display = 'none';
                    showMissingBtn.textContent = `+ Show ${extraMissingCount} more missing keywords`;
                }, { once: true });
            }, { once: true });
        }
        window.lastResults = window.lastResults || {};
        window.lastResults.filteredMissing = filteredMissing;
        const scopeEl = document.getElementById('jdScopeNote');
        const scope = window.lastJdScope || {};
        if (scopeEl) {
            if (scope.trimmed) {
                scopeEl.textContent = 'Company introduction was skipped. These terms come from the role, responsibilities, and requirements. Add one only if you have done that work.';
            } else if (scope.hadCompanyIntro && !scope.foundRole) {
                scopeEl.textContent = 'This paste includes a company introduction and no Role or Requirements heading, so marketing sentences may appear as keywords. Paste from the role or responsibilities section if the list looks wrong.';
            } else {
                scopeEl.textContent = 'Keyword match uses the role, responsibilities, and requirements. Add a missing term only if you have done that work.';
            }
        }
    } else {
        document.getElementById('missingKeywords').innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Paste a job description and re-analyse to see which keywords your resume is missing for that specific role.</p>';
        document.getElementById('foundKeywords').innerHTML = '';
    }

    // Structure Details
    const structureDetailsEl = document.getElementById('structureDetails');
    if (structureDetailsEl) {
        const foundHTML = structureResult.found.map(s => 
            `<span class="keyword-badge keyword-found">✓ ${s}</span>`).join(' ');
        const optional = structureResult.optional || [];
        const missingHTML = structureResult.missing.length > 0
            ? structureResult.missing.map(s => 
                `<span class="keyword-badge keyword-missing">✗ ${s}</span>`).join(' ')
            : '';
        const optionalHTML = optional.length > 0
            ? optional.map(s => `<span class="keyword-badge" style="opacity:0.8;">○ ${s} — optional, skip if you have none</span>`).join(' ')
            : '';
        const missingBlock = structureResult.missing.length > 0
            ? `<p style="color: var(--text-muted); font-size: 0.8rem; margin: 0.5rem 0 0.3rem;">Missing:</p><div>${missingHTML}</div>`
            : (optional.length ? '' : '<span style="color: var(--success); font-size: 0.85rem;">All standard sections detected!</span>');
        structureDetailsEl.innerHTML = `
            <p style="color: var(--text-muted); font-size: 0.82rem; margin-bottom: 0.6rem;">Checks for standard resume sections. ATS systems need these headers to correctly categorize your information.</p>
            <div style="margin-bottom: 0.5rem;">${foundHTML}</div>
            ${missingBlock}
            ${optionalHTML ? `<p style="color: var(--text-muted); font-size: 0.8rem; margin: 0.5rem 0 0.3rem;">Not required:</p><div>${optionalHTML}</div>` : ''}`;
        // detailsSection is now inside a <details> accordion — no display toggle needed
    }

    // Impact Details
    const bulletMetrics = getBulletMetricsPct(fullText);
    const impactDetailsEl = document.getElementById('impactDetails');
    if (impactDetailsEl) {
        const bulletPctColor = bulletMetrics.pct < 30 ? 'var(--danger)' : bulletMetrics.pct < 60 ? 'var(--warning)' : 'var(--success)';
        const metricHTML = impactResult.metricExamples.length > 0
            ? `Found metrics in your resume: ${impactResult.metricExamples.map(m => `<strong>${m}</strong>`).join(', ')}`
            : '⚠️ No metrics found (%, $, numbers like "50K"). Quantify your achievements!';
        const verbsHTML = impactResult.foundVerbs.length > 0
            ? impactResult.foundVerbs.slice(0, 8).map(v => 
                `<span class="keyword-badge keyword-found">✓ ${v}</span>`).join(' ')
            : '<span style="color: var(--danger); font-size: 0.85rem;">No strong action verbs detected. Use: led, built, launched, optimized, delivered</span>';
        impactDetailsEl.innerHTML = `
            <p style="color: var(--text-muted); font-size: 0.82rem; margin-bottom: 0.6rem;">Scores (1) quantifiable metrics and (2) strong action verbs. Both signal real results to recruiters.</p>
            <p style="font-size: 0.85rem; margin-bottom: 0.5rem;">Bullets with metrics: <strong style="color:${bulletPctColor}">${bulletMetrics.pct}%</strong> <span style="color:var(--text-muted);font-size:0.8rem;">(${bulletMetrics.withMetrics} of ${bulletMetrics.total} bullet points)</span></p>
            <p style="color: var(--text-muted); font-size: 0.82rem; margin-bottom: 0.4rem;"><strong>Metrics found:</strong> ${metricHTML}</p>
            <p style="color: var(--text-muted); font-size: 0.82rem; margin-bottom: 0.4rem;"><strong>Action verbs detected:</strong></p>
            <div>${verbsHTML}</div>`;
    }

    // Generate Strategic Action Plan with REAL EXAMPLES
    const tipsList = document.getElementById('tipsList');
    tipsList.innerHTML = "";
    const tips = [];

    // -2. File Metadata (New Hardening)
    if (fileMetadata.name.length > 30) {
        tips.push({
            type: 'warning',
            html: `<strong>⚠️ Long Filename Detected (${fileMetadata.name.length} chars)</strong><br>
            Your filename is quite long. Some Applicant Tracking Systems truncate filenames or throw errors during upload. 
            <br><em>Recommendation: Use a simpler format like "Firstname_Lastname_Resume.pdf"</em>`
        });
    }
    if (fileMetadata.size > 2 * 1024 * 1024) {
        tips.push({
            type: 'danger',
            html: `<strong>🚨 File Size Alert (${(fileMetadata.size / (1024 * 1024)).toFixed(1)} MB)</strong><br>
            Your file is over 2MB. Older ATS portals (like Workday or Taleo) often have strict file size limits and may reject your application automatically.`
        });
    }

    // -1. Contact Info Issues — HIGHEST PRIORITY: if recruiter can't reach you, nothing else matters
    if (contactCheck.issues.length > 0) {
        tips.push({
            type: 'danger',
            html: `<strong>🚨 Broken Contact Details — Fix Immediately</strong><br>
            A recruiter found your resume but cannot reach you. These issues will cost you interviews:<br><br>
            <ul style="margin:0.4rem 0 0 1.2rem; padding:0; list-style:disc;">
              ${contactCheck.issues.map(i => `<li style="margin-bottom:6px">${i}</li>`).join('')}
            </ul>`
        });
    }
    if (contactCheck.warnings.length > 0) {
        tips.push({
            type: 'warning',
            html: `<strong>⚠️ Contact Info — Missing Items</strong><br>
            <ul style="margin:0.4rem 0 0 1.2rem; padding:0; list-style:disc;">
              ${contactCheck.warnings.map(w => `<li style="margin-bottom:6px">${w}</li>`).join('')}
            </ul>`
        });
    }

    // 0. Template Compliance — HIGHEST PRIORITY, fix before anything else
    if (criticalFormatIssues.length > 0) {
        tips.push({
            type: 'danger',
            html: `<strong>🚨 Fix Your Template First — This Is Priority #1</strong><br>
            Your current template is reducing your score from a potential <strong>${projectedWithFix}%</strong> to <strong>${finalScore}%</strong>. No other single fix will have as much impact.<br><br>
            Detected: <strong>${criticalFormatIssues.map(i => i.label).join(', ')}</strong><br><br>
            <strong>Fix your template in 2 easy steps:</strong><br><br>
            <strong>1. Download our official template:</strong> <a href="GetATSReady_Template.docx" download style="color:var(--primary); font-weight:bold; text-decoration:underline;">📥 Download ATS-Safe Word Template (.docx)</a><br><br>
            <strong>2. Move your text:</strong> Scroll down to the <em>Visual View</em> box, copy your clean text, and paste it into the matching sections of the new template (don't just overwrite the whole file!).<br><br>
            Re-upload here to confirm your improved score!`
        });
    }

    // 1. Keyword Gap Strategy with SPECIFIC EXAMPLES
    if (keywordMatchPct < 85 && missing.length > 0) {
        let filteredMissing = missing.filter(kw => kw.length > 2 && !NOISE_KEYWORDS.has(kw) && !JD_NOT_SKILLS.has(kw));
        filteredMissing = Array.from(new Set(filteredMissing));
        const topMissing = filteredMissing.slice(0, 8);
        const extraMissingCount = Math.max(0, filteredMissing.length - topMissing.length);
        
        tips.push({
            type: 'warning',
            html: `<strong>🎯 Missing terms (${keywordMatchPct}% match):</strong> These are in the role requirements and not as whole words on your resume. Add one only if you have actually done that work. Do not invent a result to make it fit.<br><br><strong>${topMissing.join(', ')}</strong>${extraMissingCount > 0 ? `<br><span style="color:var(--text-muted);">Plus ${extraMissingCount} more in the list below.</span>` : ''}`
        });
    }

    // 2. Impact & Metrics
    if (bulletMetrics.pct < 50 || impactScore < 60) {
        const bulletMsg = bulletMetrics.total > 0
            ? `Only <strong>${bulletMetrics.pct}%</strong> of your bullets have metrics (${bulletMetrics.withMetrics} of ${bulletMetrics.total}) — add numbers to show impact.`
            : 'Add quantifiable metrics to your bullets — numbers are what recruiters and ATS systems look for.';

        let exampleHTML = '';
        const weakSamples = bulletMetrics.weakBulletSamples || [];
        if (weakSamples.length > 0) {
            exampleHTML = weakSamples.map((b, i) => {
                const clean = b.replace(/<[^>]+>/g, '').trim();
                const suggestion = i === 0
                    ? `If this work had a real count — years, a team size, a release count — add that number. Do not invent a percentage.`
                    : `Start with a verb you can stand behind ("Led", "Mentored", "Documented") and add a real count if you have one.`;
                return `❌ <strong>Your resume:</strong> "${clean}"<br>✅ <strong>Improve it:</strong> ${suggestion}`;
            }).join('<br><br>');
        } else {
            exampleHTML = `A duty with no count: "Documented the admin guide."<br>
            A duty with a real count: "Documented the admin guide across 12 service packs" — only if that number is true.`;
        }
        tips.push({
            type: 'warning',
            html: `<strong>📊 ${bulletMsg}</strong><br><br>${exampleHTML}`
        });
    }

    // 2.5 Vocabulary Diversity (New Check)
    const vocab = calculateVocabularyDiversity(fullText);
    if (vocab.overused.length > 0) {
        const overusedList = vocab.overused.map(v => `<strong>${v.verb}</strong> (${v.count}x)`).join(', ');
        tips.push({
            type: 'warning',
            html: `<strong>🔄 Vocabulary Repetition:</strong> You've overused these terms: ${overusedList}.<br>
            <em>Tip: Use a thesaurus or our synonym engine to diversify your language and show a broader professional vocabulary.</em>`
        });
    }

    // 3. Structural Integrity
    if (structureScore < 95) {
        const missingSections = [];
        if (!fullText.match(/\b(experience|employment|work history)\b/i)) missingSections.push('"Professional Experience" or "Work History"');
        if (!fullText.match(/\b(education|academic)\b/i)) missingSections.push('"Education"');
        if (!fullText.match(/\b(skills|technical skills)\b/i)) missingSections.push('"Skills" or "Technical Skills"');
        
        const sectionAdvice = missingSections.length > 0 
            ? `Missing standard sections: ${missingSections.join(', ')}. Add these headers to improve parsability.`
            : 'Use clear, standard section headers like "Professional Experience", "Education", "Skills", "Certifications".';
        
        tips.push({
            type: 'warning',
            html: `<strong>📑 Resume Structure (${structureScore}%):</strong> ${sectionAdvice}<br><br>
            ATS systems scan for standard headers. Use industry-standard terms instead of creative ones like "My Journey" or "What I've Done".`
        });
    }

    // 4. Tone & Professionalism
    if (health.pronounCount > 0) {
        tips.push({
            type: 'warning',
            html: `<strong>✍️ Remove Personal Pronouns (Found ${health.pronounCount}):</strong><br>
            ❌ Avoid: "I developed a new feature that improved..."<br>
            ✅ Better: "Developed new feature that improved..."<br><br>
            Professional resumes use implied first-person voice.`
        });
    }

    if (health.weakVerbCount > 0) {
        const verbReplacements = {
            'assisted': 'Collaborated / Engineered / Delivered',
            'helped': 'Facilitated / Enabled / Spearheaded',
            'worked': 'Built / Developed / Architected',
            'involved': 'Executed / Drove / Contributed',
            'responsible': 'Managed / Led / Owned / Oversaw',
            'participated': 'Contributed / Facilitated / Delivered'
        };
        const verbLines = health.weakVerbsFound.map(v => 
            `• Found "<strong>${v}</strong>" → Replace with: <em>${verbReplacements[v] || 'a stronger action verb'}</em>`
        ).join('<br>');
        tips.push({
            type: 'warning',
            html: `<strong>💪 Weak Verbs Found (${health.weakVerbCount}):</strong><br>${verbLines}<br><br>Example transformation:<br>❌ "${health.weakVerbsFound[0].charAt(0).toUpperCase() + health.weakVerbsFound[0].slice(1)} on backend API development"<br>✅ "Engineered RESTful backend APIs serving 200K+ requests/day"`
        });
    }

    // 5. Length & Formatting
    if (health.isWallOfText) {
        tips.push({
            type: 'success',
            html: `<strong>📏 Resume Length (${health.wordCount.toLocaleString()} words):</strong><br>
            For a <strong>senior, lead, or staff-level role</strong>, 900–1,500 words across 2 pages is perfectly appropriate. Recruiter expect depth at this level.`
        });
    }

    // 6. Overall Score Guidance
    if (criticalFormatIssues.length > 0) {
        const contentStatus = hasJD ? `Your content scores well (<strong>${keywordMatchPct}% keyword match</strong>). ` : "";
        tips.push({
            type: 'danger',
            html: `<strong>📋 Summary:</strong> ${contentStatus}The low overall score (<strong>${finalScore}%</strong>) is driven almost entirely by your template. Fix the template first.`
        });
    } else if (finalScore >= 80) {
        tips.push({
            type: 'success',
            html: `<strong>🎉 Excellent Score!</strong> Your resume is well-optimized for ATS systems. Make the suggested tweaks above to reach 90%+.`
        });
    } else if (finalScore >= 60) {
        tips.push({
            type: 'success',
            html: `<strong>📈 Good Foundation:</strong> Your resume passes basic ATS screening. Focus on adding the missing keywords and quantifiable achievements.`
        });
    } else {
        tips.push({
            type: 'warning',
            html: `<strong>⚠️ Needs Improvement:</strong> Priority actions: (1) Add missing keywords, (2) Quantify achievements, (3) Ensure standard section headers.`
        });
    }

    tips.forEach(tip => {
        const li = document.createElement('li');
        if (tip.type) li.classList.add(`tip-${tip.type}`);
        li.innerHTML = tip.html;
        tipsList.appendChild(li);
    });

    if (tips.length === 0) {
        const fallbackLi = document.createElement('li');
        fallbackLi.classList.add('tip-success');
        fallbackLi.innerHTML = '<strong>🎉 Great news:</strong> No critical action items detected. Your resume is already in strong shape for ATS screening.';
        tipsList.appendChild(fallbackLi);
    }

    window.lastResults = {
        finalScore,
        found,
        missing,
        filteredMissing: window.lastResults && window.lastResults.filteredMissing ? window.lastResults.filteredMissing : [],
        tips,
        structureScore,
        impactScore,
        keywordMatchPct,
        formatScore,
        formatCheck,
        effectiveKeywordScore,
        projectedWithFix,
        hasJD,
        bulletMetrics,
        contactCheck,
        weakBulletSamples: bulletMetrics.weakBulletSamples
    };

    saveScanNotesForMaker();

    // Save to Local Scan History (100% Client-Side, fully private)
    saveScanToHistory(fileMetadata.name, finalScore);
}

function calculateVocabularyDiversity(text) {
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const counts = {};
    words.forEach(w => counts[w] = (counts[w] || 0) + 1);
    
    // Specifically check for overused action verbs
    const targetVerbs = ['managed', 'responsible', 'assisted', 'helped', 'worked', 'involved', 'participated'];
    const overused = targetVerbs.filter(v => counts[v] > 3);
    
    return {
        uniqueRatio: words.length > 0 ? (Object.keys(counts).length / words.length) : 0,
        overused: overused.map(v => ({ verb: v, count: counts[v] }))
    };
}

// Rewrite brief + maker scan notes
function htmlToPlain(str) {
    const tmp = document.createElement('div');
    tmp.innerHTML = String(str == null ? '' : str).replace(/<br\s*\/?>/gi, '\n');
    return (tmp.textContent || tmp.innerText || '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function gatherScanNotes() {
    const res = window.lastResults;
    if (!res) return null;
    const jd = document.getElementById('jobDescription')?.value.trim() || '';
    const missing = (res.filteredMissing && res.filteredMissing.length ? res.filteredMissing : res.missing) || [];
    const notes = {
        savedAt: Date.now(),
        fileName: (fileMetadata && fileMetadata.name) || '',
        score: Number.isFinite(res.finalScore) ? res.finalScore : 0,
        formatScore: Number.isFinite(res.formatScore) ? res.formatScore : 0,
        keywordMatchPct: Number.isFinite(res.keywordMatchPct) ? res.keywordMatchPct : 0,
        structureScore: Number.isFinite(res.structureScore) ? res.structureScore : 0,
        impactScore: Number.isFinite(res.impactScore) ? res.impactScore : 0,
        hasJD: !!res.hasJD,
        formatIssues: (res.formatCheck && Array.isArray(res.formatCheck.issues) ? res.formatCheck.issues : [])
            .map(i => i && (i.label || i.message || String(i)))
            .filter(Boolean),
        missingKeywords: missing.slice(0, 40),
        weakBullets: (Array.isArray(res.weakBulletSamples) ? res.weakBulletSamples : []).slice(0, 8),
        tips: (Array.isArray(res.tips) ? res.tips : []).map(t => htmlToPlain(t && t.html ? t.html : t)).filter(Boolean).slice(0, 12),
        jobDescription: jd.slice(0, 12000),
        resumeText: String(typeof resumeText === 'string' ? resumeText : '').slice(0, 60000)
    };
    notes.brief = buildRewriteBrief(notes);
    return notes;
}

function buildRewriteBrief(notes) {
    if (!notes) return '';
    const missing = notes.missingKeywords && notes.missingKeywords.length
        ? notes.missingKeywords.join(', ')
        : 'None listed (paste a job description and rescan for keyword gaps).';
    const issues = notes.formatIssues && notes.formatIssues.length
        ? notes.formatIssues.map(i => '- ' + i).join('\n')
        : '- No template issues flagged.';
    const weak = notes.weakBullets && notes.weakBullets.length
        ? notes.weakBullets.map(b => '- ' + b).join('\n')
        : '- No weak bullets flagged.';
    const tips = notes.tips && notes.tips.length
        ? notes.tips.map((t, i) => (i + 1) + '. ' + t).join('\n\n')
        : 'None.';
    return `You are helping me rewrite my resume so applicant tracking systems (ATS) can parse it and match a specific job.

Rules:
- Do not invent jobs, employers, dates, degrees, certifications, or metrics I did not provide.
- Keep a single-column layout and standard headers (Summary, Experience, Education, Skills).
- Weave missing keywords in naturally only where they match my real experience.
- Prefer quantified bullets when I already have the numbers.
- Output a clean resume I can paste into a simple template. No tables, text boxes, or multi-column design.

## GetATSReady scan (in-browser estimate, not a guarantee)
Overall: ${notes.score}
Template compliance: ${notes.formatScore}
Keyword match: ${notes.keywordMatchPct}${notes.hasJD ? '' : ' (no job description was pasted)'}
Structure: ${notes.structureScore}
Impact & metrics: ${notes.impactScore}
File: ${notes.fileName || 'n/a'}

## Template / parsing issues
${issues}

## Missing keywords from the job description
${missing}

## Weak bullets (little or no metrics)
${weak}

## Priority actions from the scan
${tips}

## Job description
${notes.jobDescription || '(none pasted)'}

## Resume text as extracted from my file
${notes.resumeText || '(no text extracted)'}
`;
}

function saveScanNotesForMaker() {
    const notes = gatherScanNotes();
    if (!notes) return false;
    return lsSet('ats_scan_notes', notes);
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            resolve();
        } catch (err) {
            reject(err);
        } finally {
            document.body.removeChild(ta);
        }
    });
}

function copyRewriteBrief(btn) {
    const notes = gatherScanNotes();
    if (!notes) {
        showInlineAlert('Analyze your resume first, then copy the rewrite brief.');
        return;
    }
    saveScanNotesForMaker();
    copyTextToClipboard(notes.brief).then(() => {
        if (btn) {
            const original = btn.textContent;
            btn.textContent = 'Copied — paste into an AI';
            setTimeout(() => { btn.textContent = original; }, 2200);
        }
        if (typeof trackEvent === 'function') trackEvent('copy_rewrite_brief');
    }).catch(() => {
        showInlineAlert('Could not copy automatically. Select the text in a new tab after opening the maker.');
    });
}

function wireScanNextStepButtons() {
    const copyBtn = document.getElementById('downloadReport');
    if (copyBtn) {
        copyBtn.textContent = 'Copy rewrite brief';
        copyBtn.type = 'button';
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            copyRewriteBrief(copyBtn);
        });
    }

    let makerLink = document.getElementById('openMakerWithNotes');
    if (!makerLink && copyBtn) {
        makerLink = document.createElement('a');
        makerLink.id = 'openMakerWithNotes';
        makerLink.className = 'analyze-btn';
        makerLink.style.cssText = 'width:auto;margin:10px 0 0;padding:10px 16px;text-decoration:none;display:inline-flex;align-items:center;';
        makerLink.textContent = 'Open in resume maker';
        copyBtn.insertAdjacentElement('afterend', makerLink);
    }
    if (makerLink) {
        makerLink.href = '/resume-maker.html';
        makerLink.addEventListener('click', () => {
            if (window.lastResults) saveScanNotesForMaker();
        });
    }

    const cta = document.getElementById('openMakerWithNotesCta');
    if (cta) {
        cta.addEventListener('click', () => {
            if (window.lastResults) saveScanNotesForMaker();
        });
    }
}

wireScanNextStepButtons();

// Tooltip: Viewport-aware positioning + mobile tap support
document.addEventListener('DOMContentLoaded', () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    function positionTooltip(icon) {
        const rect = icon.getBoundingClientRect();
        // If icon is within 200px of top of viewport, flip tooltip to show below
        if (rect.top < 200) {
            icon.classList.add('tooltip-below');
        } else {
            icon.classList.remove('tooltip-below');
        }
    }

    const tooltipIcons = document.querySelectorAll('.tooltip-icon');

    // Desktop: smart positioning on mouseenter
    tooltipIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => positionTooltip(icon));
        icon.addEventListener('mouseleave', () => icon.classList.remove('tooltip-below'));
    });

    // Mobile: tap to show/hide
    if (isMobile) {
        tooltipIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const tooltip = icon.querySelector('.tooltip-text');
                const isVisible = tooltip.style.visibility === 'visible';

                // Hide all first
                document.querySelectorAll('.tooltip-text').forEach(t => {
                    t.style.visibility = 'hidden';
                    t.style.opacity = '0';
                });
                document.querySelectorAll('.tooltip-icon').forEach(i => i.classList.remove('tooltip-below'));

                if (!isVisible) {
                    positionTooltip(icon);
                    icon.classList.add('active');
                    tooltip.style.visibility = 'visible';
                    tooltip.style.opacity = '1';
                } else {
                    icon.classList.remove('active');
                }
            });
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.tooltip-text').forEach(t => {
                t.style.visibility = 'hidden';
                t.style.opacity = '0';
            });
            document.querySelectorAll('.tooltip-icon').forEach(i => {
                i.classList.remove('active', 'tooltip-below');
            });
        });
    }
});

// Debug Support Logic
const debugBtn = document.getElementById("debugBtn");
if (debugBtn) {
    debugBtn.addEventListener('click', (e) => {
        e.preventDefault();
        trackEvent('download_debug_log');
        const debugData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            resumeLength: resumeText ? resumeText.length : 0,
            jdLength: document.getElementById('jobDescription').value.length,
            rawText: resumeText ? resumeText.substring(0, 1000) : 'None',
            url: window.location.href
        };
        const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ats_debug_log.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showInlineAlert("Debug log downloaded! Please email this file to hello@getatsready.com for support.");
    });
}
// View Toggle Logic for Raw Text Preview
function setRawViewMode(mode) {
    const statusEl = document.getElementById('rawViewStatus');
    if (!statusEl) return;
    if (mode === 'stream') {
        statusEl.textContent = 'ATS Stream mode active — actual extracted word order used by ATS parsers.';
    } else {
        statusEl.textContent = 'Visual Reconstruction mode active — readable resume order after parsing layout coordinates.';
    }
}

document.getElementById('viewVisual')?.addEventListener('click', () => {
    document.getElementById('viewVisual').classList.add('active');
    document.getElementById('viewStream').classList.remove('active');
    document.getElementById('rawTextPreview').value = resumeText;
    document.getElementById('rawTextDesc').innerHTML = "This is our engine's <strong>Visual Reconstruction</strong>. We sort text by coordinates to make it readable, but horizontal merging across columns is what confuses ATS systems.";
    setRawViewMode('visual');
});

document.getElementById('viewStream')?.addEventListener('click', () => {
    document.getElementById('viewStream').classList.add('active');
    document.getElementById('viewVisual').classList.remove('active');
    document.getElementById('rawTextPreview').value = resumeStreamText;
    document.getElementById('rawTextDesc').innerHTML = "This is the <strong>ATS Stream View</strong> (the order words appear in the PDF file). If this looks scrambled or 'word salad', an older ATS will almost certainly reject your resume automatically.";
    setRawViewMode('stream');
});

document.getElementById('copyRawTextBtn')?.addEventListener('click', () => {
    const rawPreview = document.getElementById('rawTextPreview');
    const copyBtn = document.getElementById('copyRawTextBtn');
    if (!rawPreview || !copyBtn) return;
    navigator.clipboard.writeText(rawPreview.value).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = originalText; }, 1600);
    }).catch(() => {
        copyBtn.textContent = 'Copy failed';
        setTimeout(() => { copyBtn.textContent = 'Copy current view'; }, 1800);
    });
});

setRawViewMode('visual');

// ── Private Scan History Management (Stored client-side in user's browser localStorage) ──
function saveScanToHistory(filename, score) {
    try {
        const historyKey = 'ats_score_history';
        let history = JSON.parse(_ls.getRaw(historyKey) || '[]');
        const jdText = document.getElementById('jobDescription')?.value.trim() || '';
        
        let jobTitle = 'General Analysis';
        if (jdText) {
            const firstLine = jdText.split('\n')[0].trim();
            if (firstLine.length > 5) {
                jobTitle = firstLine.substring(0, 35);
                if (firstLine.length > 35) jobTitle += '...';
            }
        }
        
        const timestamp = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        
        // Calculate delta if previous scan of same file exists
        let delta = 0;
        const prevScan = history.find(h => h.filename === (filename || 'Resume.pdf'));
        if (prevScan) {
            delta = score - prevScan.score;
        }

        const historyItem = {
            id: Date.now(),
            filename: filename || 'Resume.pdf',
            score: score,
            timestamp: timestamp,
            jobTitle: jobTitle,
            delta: delta
        };
        
        // Avoid double entries
        const isDuplicate = history.length > 0 && 
                            history[0].filename === historyItem.filename && 
                            history[0].score === historyItem.score;
                            
        if (!isDuplicate) {
            history.unshift(historyItem);
            if (history.length > 25) history.pop();
            _ls.setRaw(historyKey, JSON.stringify(history));
        }
        
        renderHistory();
    } catch (storageError) {
        console.warn('Unable to save scan history:', storageError);
    }
}

function renderHistory() {
    const buildSparkline = (scores) => {
        const values = (scores || []).map(Number).filter(n => Number.isFinite(n));
        if (values.length < 2) return '';

        const width = 220;
        const height = 40;
        const pad = 3;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = Math.max(max - min, 1);
        const stepX = (width - pad * 2) / (values.length - 1);
        const points = values.map((value, index) => {
            const x = pad + index * stepX;
            const y = height - pad - ((value - min) / range) * (height - pad * 2);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');

        return `<div class="score-sparkline" style="margin-bottom:12px;" aria-hidden="true">
        <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Score trend">
            <polyline fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points}"></polyline>
        </svg>
    </div>`;
    };

    let history = [];
    try {
        history = JSON.parse(_ls.getRaw('ats_score_history') || '[]');
        if (!Array.isArray(history)) history = [];
    } catch (parseError) {
        console.warn('Unable to read scan history:', parseError);
        return;
    }
    const historyCard = document.getElementById('historyCard');
    const historyList = document.getElementById('historyList');
    if (!historyList || !historyCard) return;
    
    if (history.length === 0) {
        historyCard.classList.add('hidden');
        return;
    }
    
    historyCard.classList.remove('hidden');
    
    const title = historyCard.querySelector('.card-title');
    if (title && !document.getElementById('exportCsvBtn')) {
        const btn = document.createElement('button');
        btn.id = 'exportCsvBtn';
        btn.innerHTML = 'Export CSV';
        btn.style.cssText = 'float:right;font-size:0.75rem;padding:2px 8px;border-radius:4px;background:var(--primary);color:#fff;border:none;cursor:pointer;margin-left:auto;';
        btn.onclick = exportHistoryCSV;
        title.appendChild(btn);
        title.style.display = 'flex';
        title.style.alignItems = 'center';
    }

    let sparklineHtml = '';
    if (history.length > 1) {
        try {
            sparklineHtml = buildSparkline(history.map(h => h.score).reverse());
        } catch (sparklineError) {
            sparklineHtml = '';
        }
    }
    
    historyList.innerHTML = sparklineHtml + history.map(item => {
        let badgeColor = 'var(--danger)';
        if (item.score >= 80) badgeColor = 'var(--success)';
        else if (item.score >= 65) badgeColor = 'var(--primary)';
        else if (item.score >= 45) badgeColor = 'var(--warning)';
        
        let deltaHtml = '';
        if (item.delta && item.delta !== 0) {
            const isPos = item.delta > 0;
            const sign = isPos ? '↑ +' : '↓ ';
            const color = isPos ? 'var(--success)' : 'var(--danger)';
            deltaHtml = `<span style="font-size: 0.75rem; color: ${color}; font-weight: 700; margin-right: 8px;">${sign}${item.delta}</span>`;
        }
        
        return `
            <div class="history-item">
                <div class="history-item-left">
                    <span class="history-item-name">${item.filename}</span>
                    <span class="history-item-sub">${item.jobTitle}</span>
                </div>
                <div class="history-item-right">
                    <span class="history-item-date">${item.timestamp}</span>
                    ${deltaHtml}
                    <span class="keyword-badge" style="border: 1px solid ${badgeColor}; color: ${badgeColor}; font-weight: 700; background: transparent; padding: 4px 10px; margin: 0;">${item.score}%</span>
                </div>
            </div>
        `;
    }).join('');
}



// ── SEO FAQ Schema Dynamic Injector ──
function injectFaqSchema() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": []
    };
    
    faqItems.forEach(item => {
        const q = item.querySelector('h3');
        const a = item.querySelector('p');
        if (q && a) {
            schema.mainEntity.push({
                "@type": "Question",
                "name": q.textContent.trim(),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": a.textContent.trim()
                }
            });
        }
    });
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

// ── Native High-Performance Scroll-Reveal ──
window.addEventListener('load', () => {
  const targets = document.querySelectorAll('.card, .faq-item, .secondary-btn, .privacy-badge, #historyCard');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -10px 0px'
  });
  targets.forEach(target => {
    target.classList.add('reveal-scroll');
    observer.observe(target);
  });
});


function exportHistoryCSV() {
    const history = JSON.parse(_ls.getRaw('ats_score_history') || '[]');
    if (history.length === 0) return;
    
    let csv = 'Date,Resume File,Job Description / Title,Score,Delta\n';
    history.forEach(h => {
        csv += `${h.timestamp || ''},${(h.filename || '').replace(/,/g, '')},${(h.jobTitle || '').replace(/,/g, '')},${h.score || 0},${h.delta || 0}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ATS_Scan_History.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


// Automatic PPP Pricing + Review Tier Integration
function setupReviewPricing() {
    const btn = document.getElementById('atsProCheckoutBtn');
    const tier = document.getElementById('reviewTier');
    if (!btn || !tier) return;
    const intakeLink = document.getElementById('paidIntakeLink');
    const consent = document.getElementById('refundConsent');

    const plans = {
        standard: {
            label: { india: 'Pay for Standard review (₹2,499)', international: 'Pay for Standard review ($49)' },
            url: {
                india: 'https://rzp.io/rzp/03GFDB2',
                international: 'https://virusyndrome.gumroad.com/l/buhtlh'
            }
        },
        express: {
            label: { india: 'Pay for Express review (₹3,999)', international: 'Pay for Express review ($79)' },
            url: {
                india: 'https://rzp.io/rzp/l7UFzUvu',
                international: 'https://virusyndrome.gumroad.com/l/emfsta'
            }
        }
    };

    let detectedMarket = 'international';

    const intakeUrl = () =>
        `/submit-resume.html?tier=${encodeURIComponent(tier.value)}&market=${encodeURIComponent(detectedMarket)}&pay=1`;

    const setEnabled = (on) => {
        btn.style.pointerEvents = on ? 'auto' : 'none';
        btn.style.opacity = on ? '1' : '0.5';
        btn.style.background = on ? 'var(--primary)' : '#475569';
        btn.style.boxShadow = on ? '0 4px 12px rgba(15, 98, 254, 0.3)' : 'none';
    };

    const optionLabels = {
        india: {
            standard: 'Standard: 48 hours / ₹2,499',
            express: 'Express: 24 hours / ₹3,999'
        },
        international: {
            standard: 'Standard: 48 hours / $49',
            express: 'Express: 24 hours / $79'
        }
    };

    const updateButton = () => {
        const plan = plans[tier.value];
        const checkoutUrl = plan.url[detectedMarket];
        const checkoutLabel = plan.label[detectedMarket];
        const consented = !consent || consent.checked;
        const labels = optionLabels[detectedMarket];

        Array.from(tier.options).forEach((opt) => {
            if (labels[opt.value]) opt.textContent = labels[opt.value];
        });

        btn.textContent = checkoutUrl ? checkoutLabel : 'Select a tier to continue';
        btn.href = checkoutUrl || '#';
        btn.dataset.plan = tier.value;
        btn.dataset.market = detectedMarket;
        if (intakeLink) intakeLink.href = intakeUrl();
        setEnabled(Boolean(checkoutUrl) && consented);
    };

    updateButton();

    tier.addEventListener('change', updateButton);
    if (consent) consent.addEventListener('change', updateButton);

    btn.textContent = 'Loading pricing...';
    setEnabled(false);

    fetch('https://get.geojs.io/v1/ip/country.json')
        .then(response => response.json())
        .then(data => {
            if (data.country === 'IN') detectedMarket = 'india';
            updateButton();
        })
        .catch(() => {
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data.country_code === 'IN') detectedMarket = 'india';
                    updateButton();
                })
                .catch(() => {
                    updateButton();
                });
        });
}
document.addEventListener('DOMContentLoaded', setupReviewPricing);

function explainJobDescriptionField() {
    const area = document.getElementById('jobDescription');
    if (!area || document.getElementById('jdPasteHint')) return;
    const hint = 'Paste the full posting if you like. Keyword match skips the company introduction and uses the role, responsibilities, and requirements.';
    area.placeholder = 'Paste the full job posting, or only the responsibilities and requirements.';
    area.title = hint;
    const note = document.createElement('p');
    note.id = 'jdPasteHint';
    note.textContent = hint;
    note.style.cssText = 'margin:8px 0 0;font-size:0.82rem;line-height:1.45;color:var(--text-muted,#94a3b8);';
    area.insertAdjacentElement('afterend', note);
}
explainJobDescriptionField();
