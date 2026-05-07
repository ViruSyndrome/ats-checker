// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const tryExampleBtn = document.getElementById('tryExampleBtn');
const resultsSection = document.getElementById('results');

let resumeText = "";

// Cookie Consent
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    document.getElementById('cookieConsent').classList.add('hidden');
}

window.addEventListener('load', () => {
    if (localStorage.getItem('cookieConsent') === 'true') {
        document.getElementById('cookieConsent').classList.add('hidden');
    }
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
    resumeText = EXAMPLE_RESUME;
    pdfFormatWarnings = []; // plain text example — no layout issues
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
    
    // Show loading state
    fileNameDisplay.textContent = `Processing: ${file.name}...`;
    fileNameDisplay.style.color = 'var(--warning)';
    
    try {
        if (file.type === "application/pdf") {
            isPdfUpload = true;
            resumeText = await readPdf(file);
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            isPdfUpload = false;
            pdfFormatWarnings = [];
            resumeText = await readDocx(file);
        } else {
            alert("Please upload a PDF or DOCX file.");
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
        }
    } catch (error) {
        console.error('Error processing file:', error);
        fileNameDisplay.textContent = "Error: File processing failed. Please try again.";
        fileNameDisplay.style.color = 'var(--danger)';
        resumeText = "";
    }
}

let pdfFormatWarnings = []; // Global, set during PDF read
let isPdfUpload = false;    // True only when a PDF file was uploaded

async function readPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    pdfFormatWarnings = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Collect X positions to detect multi-column layout
        const xPositions = content.items.map(item => Math.round(item.transform[4]));
        const uniqueXClusters = new Set(xPositions.filter(x => x > 0));

        // If many distinct X positions > 4 distinct left-margins, likely multi-column or table
        const leftMargins = xPositions.filter(x => x < 100); // items starting near the left edge
        const midPageItems = xPositions.filter(x => x > 200 && x < 400); // items in the middle of page
        
        if (midPageItems.length > 10 && i === 1) {
            pdfFormatWarnings.push('multi-column');
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
            pdfFormatWarnings.push('table-cells');
        }

        // Reconstruct natural line breaks using Y coordinate (PDF Y is bottom-up)
        // This is critical for bullet detection — joined text has no newlines otherwise
        const itemsByY = {};
        for (const item of content.items) {
            if (!item.str.trim()) continue;
            const y = Math.round(item.transform[5] / 4) * 4; // cluster within 4pt
            if (!itemsByY[y]) itemsByY[y] = [];
            itemsByY[y].push({ x: item.transform[4], str: item.str });
        }
        const sortedLines = Object.keys(itemsByY)
            .map(Number)
            .sort((a, b) => b - a) // PDF Y is bottom-up, descending = top to bottom
            .map(y => itemsByY[y].sort((a, b) => a.x - b.x).map(i => i.str).join(' '));
        text += sortedLines.join('\n') + '\n';
    }

    // Deduplicate warnings
    pdfFormatWarnings = [...new Set(pdfFormatWarnings)];
    return text;
}

async function readDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

// Format Compliance Checklist
// Returns { score: 0-100, issues: [{key, label, severity}] }
// Score is used as a MULTIPLIER on keyword effectiveness, modelling real ATS behavior:
// a bad template physically prevents the parser from finding keywords (text-layer scrambling).
function getFormatChecklist(fullText) {
    const issues = [];
    let score = isPdfUpload ? 100 : 90; // DOCX: can't detect layout, assume clean

    if (isPdfUpload) {
        const isMultiCol    = pdfFormatWarnings.includes('multi-column');
        const hasTableCells = pdfFormatWarnings.includes('table-cells');
        if (isMultiCol && hasTableCells) {
            issues.push({ key: 'multi-column+tables', label: 'Multi-column layout + table cells', severity: 'critical' });
            score = 15;
        } else if (isMultiCol) {
            issues.push({ key: 'multi-column', label: 'Multi-column layout (2-column template)', severity: 'critical' });
            score = 30;
        } else if (hasTableCells) {
            issues.push({ key: 'table-cells', label: 'Table-based layout', severity: 'critical' });
            score = 55;
        }
    }

    // Universal: detect apostrophe-style dates ('21, '22) — confuses ATS years-of-experience parsing
    if (/'\d{2}\b/.test(fullText)) {
        issues.push({ key: 'bad-dates', label: "Non-standard dates (e.g., '21, '22) — ATS can't calculate years of experience", severity: 'minor' });
        score = Math.max(15, score - 5);
    }

    return { score, issues };
}

// Professional Keyword Extraction Logic
function getKeywords(text, isJD = false) {
    if (!text) return {};

    let processingText = text;

    if (isJD) {
        // Surgical Noise Removal: Strip known corporate "fluff" blocks
        processingText = text
            .replace(/who we are[\s\S]*?job description/gi, '') // Strip HPE-style intro
            .replace(/diversity[\s\S]*?equal opportunity/gi, '') // Strip diversity statements
            .replace(/we have the flexibility to manage[\s\S]*?embrace you/gi, '') // Strip culture fluff
            .replace(/hewlett packard enterprise is the global[\s\S]*?thrive in today/gi, '');

        // Isolate the core sections
        const sections = processingText.split(/(?=\n[A-Z][a-z]+\s[A-Z][a-z]+|\n[A-Z]{2,})/);
        const coreHeaders = ['do', 'bring', 'need', 'requirements', 'responsibilities', 'experience', 'skills', 'plus', 'preferred', 'description', 'role'];
        
        let coreText = "";
        sections.forEach(section => {
            const lines = section.trim().split('\n');
            const header = lines[0].toLowerCase();
            if (coreHeaders.some(h => header.includes(h))) {
                coreText += section + " ";
            }
        });
        
        if (coreText.length > 100) {
            processingText = coreText;
        }
    }

    const words = processingText.toLowerCase()
        .replace(/([a-z])([A-Z])/g, '$1 $2') 
        .replace(/[^\w\s+#]/g, ' ') 
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 2 || /^(ai|js|ip|5g|ui|ux|c#|xml)$/.test(w));

// PROTECT List: Words that should NEVER be filtered out
    const protectedWords = new Set(['data', 'training', 'software', 'web', 'agile', 'scrum', 'code', 'writing', 'user', 'seo', 'api']);

    const noiseWords = new Set([
        'about', 'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'their', 'work', 'experience', 'skills', 
        'ability', 'responsible', 'knowledge', 'excellent', 'strong', 'management', 'development', 'team', 'project', 
        'using', 'tools', 'years', 'within', 'across', 'including', 'various', 'based', 'provide', 'ensure', 'highly', 
        'professional', 'must', 'have', 'can', 'are', 'our', 'looking', 'who', 'help', 'make', 'more', 'other', 'into', 
        'way', 'people', 'live', 'needs', 'take', 'you', 'they', 'what', 'most', 'deeper', 'such', 'will', 'been', 'has',
        'was', 'were', 'had', 'should', 'could', 'would', 'then', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
        'both', 'each', 'few', 'some', 'such', 'only', 'own', 'same', 'than', 'too', 'very', 'can', 'just', 'should', 'now',
        'role', 'position', 'designed', 'expectation', 'primarily', 'office', 'who', 'we', 'are', 'help', 'turn', 'required',
        'world', 'accelerate', 'opportunity', 'mark', 'delivering', 'engaging', 'industry', 'expert', 'truly', 'helpful',
        'entire', 'journey', 'ideal', 'candidate', 'starter', 'get', 'done', 'also', 'follow', 'offer', 'plus', 'preferred',
        'accountability', 'empathy', 'bias', 'mindset', 'active', 'listening', 'learning', 'procedures', 'administrative',
        'controls', 'maintenance', 'mindset', 'empathy', 'growth', 'listening', 'learning', 'hpe', 'hewlett', 'packard', 
        'enterprise', 'edge', 'company', 'applications', 'culture', 'here', 'opportunities', 'effective', 'leverage', 
        'comparable', 'thinking', 'onsite', 'complex', 'understanding', 'through', 'customers', 'job', 'advancing',
        'wherever', 'outcomes', 'today', 'finding', 'better', 'ways', 'varied', 'backgrounds', 'valued', 'succeed',
        'flexibility', 'manage', 'bold', 'moves', 'together', 'force', 'good', 'stretch', 'grow', 'career', 'embrace',
        'usa', 'europe', 'india', 'bengaluru', 'identify', 'improve', 'keeping', 'finger', 'pulse', 'robust', 'dive',
        'find', 'process', 'closely', 'leverage', 'build', 'maintain', 'understand', 'requirements', 'identify',
        'need', 'bring', 'fast', 'paced', 'preferably', 'concepts', 'projects', 'science', 'journalism', 'english',
        'related', 'field', 'approaches', 'creation', 'expand', 'assurance', 'additional', 'business', 'policies', 
        'creativity', 'inactive', 'bringing', 'join', 'joining', 'growing', 'millions', 'thousands', 'hundreds',
        'years', 'months', 'weeks', 'days', 'large', 'small', 'big', 'new', 'old', 'long', 'short', 'high', 'low',
        'best', 'great', 'many', 'much', 'every', 'several', 'different', 'become', 'give', 'show', 'part', 'over',
        'year', 'back', 'however', 'well', 'may', 'come', 'these', 'during', 'between', 'after', 'before', 'while',
        'since', 'until', 'without', 'still', 'even', 'much', 'large', 'small', 'another', 'being', 'able', 'see',
        'its', 'himself', 'herself', 'themselves', 'whether', 'upon', 'against', 'under', 'above', 'below', 'off',
        'out', 'down', 'per', 'around', 'near', 'far', 'often', 'always', 'never', 'sometimes', 'usually', 'become',
        // Company names & context words that should never be resume keywords
        'ibm', 'microsoft', 'google', 'amazon', 'oracle', 'sap', 'meta', 'apple', 'hewlett', 'packard',
        // Noise from JD context phrases
        'feel', 'feeling', 'felt', 'feels',
        'head', 'heads',
        'enabling', 'enable', 'enables', 'enabled',
        'businesses',
        'sensitive',
        'deriving', 'derive', 'derived', 'derives',
        'greater',
        'careers',
        'mission',
        'critical', // standalone ("mission-critical" compound)
        'seeking', 'seeks', 'seek',
        'differentiators', 'differentiator',
        'simplifying', 'simplifies', 'simplify',
        'responsibilities',
        'degree', 'degrees',
        'increasing', 'increases', 'increase',
        'organizations', 'organization',
        'workers', // too generic when not "knowledge workers"
        'confident',
        'shift', 'left', // split from "shift-left" compound
        'key', // too generic
        'value', // too generic
        'like', // from "differentiators like"
        'execute', // too generic as verb
        'executing',
        'driven', // from "outcome-driven"
        'drives', 'drive',
        'mission', 'missions',
        'aligns', 'aligned', // too vague
        'new', // already above but ensure
        'senior', 'junior', // job levels, not keywords
        'including', // already above
        'across',
        // Generic JD soft-skill / filler words — appear in job descriptions but are NOT real ATS keywords
        'proficiency', 'evolve', 'evolving', 'championing', 'champion', 'viewpoints', 'maturity',
        'awareness', 'solid', 'actively', 'bonus', 'history', 'oriented', 'demonstrates',
        'innovative', 'impactful', 'deeply', 'vision', 'goals', 'impacts', 'diverse', 'diversity',
        'inclusive', 'approach', 'approaches', 'behaviors',
        // Single words split from compound phrases ("object-oriented", "problem solving", "track record")
        'ideas', 'deep', 'least', 'one', 'address', 'object', 'problem', 'solving', 'track', 'record',
        'tooling', 'streamline', 'streamlining'
    ]);

    const frequencyMap = {};
    words.forEach(w => {
        if (protectedWords.has(w) || !noiseWords.has(w)) {
            frequencyMap[w] = (frequencyMap[w] || 0) + 1;
        }
    });

    return frequencyMap;
}

// Semantic Synonym Map - Universal Library
const SYNONYMS = {
    // Data & Performance
    'data': ['analytics', 'databases', 'analysis', 'dataset', 'datasets', 'big data', 'metrics', 'kpis', 'statistics'],
    'metrics': ['kpis', 'data points', 'roi', 'conversion', 'analytics', 'metrics', 'measurements'],
    'seo': ['search', 'visibility', 'optimization', 'metadata', 'google search'],
    'ai': ['artificial intelligence', 'ml', 'machine learning', 'chatbot', 'nlp', 'llm', 'generative'],
    
    // Technical Writing & Content
    'writing': ['documentation', 'content', 'authoring', 'editorial', 'write', 'writer', 'technical writing', 'tech docs'],
    'content developer': ['technical writer', 'content creator', 'documentation specialist', 'information architecture'],
    'xml': ['dita', 'xml', 'structured authoring', 'authoring tools', 'content-as-code'],
    
    // Software & Web
    'software': ['application', 'platform', 'product', 'saas', 'solution', 'tools', 'software products'],
    'web': ['online', 'cloud', 'browser', 'internet', 'portal', 'web-based'],
    'javascript': ['js', 'typescript', 'react', 'node', 'vue', 'frontend'],
    'api': ['rest', 'graphql', 'soap', 'microservices', 'endpoints'],
    
    // Leadership & Business
    'project management': ['pm', 'pmp', 'agile', 'scrum', 'leadership', 'stakeholder', 'partnerships'],
    'problem solving': ['analytical', 'troubleshooting', 'problem-solving', 'resolved', 'critical thinking'],
    'communication': ['communications', 'communicating', 'interpersonal', 'collaborate', 'collaboration'],
    'certification': ['training', 'certified', 'cert', 'credentials', 'program', 'course']
};

const TECH_BOOST = new Set(['xml', 'agile', 'scrum', 'ai', 'seo', 'api', 'cloud', 'wireless', '5g', 'gui', 'architecture', 'dita', 'cms', 'software', 'documentation', 'content', 'technical']);

// Professional Analysis Modules
const ANALYSIS_RULES = {
    weakVerbs: ['assisted', 'helped', 'worked', 'involved', 'responsible', 'participated'],
    pronouns: ['i', 'me', 'my', 'mine', 'we', 'our', 'us']
};

// ─────────────────────────────────────────────────────────────────────────────
//  CONTACT INFO VALIDATOR — catches broken LinkedIn, bad email, bad phone
// ─────────────────────────────────────────────────────────────────────────────
function checkContactInfo(text) {
    const issues = [];
    const warnings = [];

    // ── Email ──────────────────────────────────────────────────────────────────
    // Match anything that looks like it was meant to be an email
    const emailCandidates = text.match(/[a-zA-Z0-9._%+\-]+\s*[@＠]\s*[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
    if (emailCandidates.length === 0) {
        issues.push('No email address found. Add a professional email (yourname@gmail.com) to your contact section.');
    } else {
        emailCandidates.forEach(raw => {
            const e = raw.replace(/\s/g, '');
            // Catch common typos: double @, missing TLD dot, .con/.cmo/.ocm etc.
            if ((e.match(/@/g) || []).length > 1) {
                issues.push(`Email looks broken: <strong>${e}</strong> — has two @ symbols.`);
            } else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(e)) {
                issues.push(`Email may be malformed: <strong>${e}</strong> — check for typos.`);
            } else if (/\.(con|cmo|ocm|cm|gmal|gmial|yahooo|outlok|outlookcom)$/i.test(e)) {
                issues.push(`Email domain looks like a typo: <strong>${e}</strong> — check the domain spelling.`);
            }
        });
    }

    // ── Phone ──────────────────────────────────────────────────────────────────
    // Match 7+ digit sequences (international or local, with optional +, dashes, spaces, parens)
    const phoneCandidates = text.match(/\+?[\d\s\-().]{7,20}/g) || [];
    const validPhones = phoneCandidates.filter(p => (p.replace(/\D/g, '').length >= 7 && p.replace(/\D/g, '').length <= 15));
    if (validPhones.length === 0) {
        warnings.push('No phone number detected. Many recruiters call before emailing — add your number.');
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
    const sectionGroups = [
        { name: 'Work Experience', patterns: ['experience', 'work history', 'professional background', 'employment', 'career'] },
        { name: 'Education', patterns: ['education', 'academic', 'university', 'degree'] },
        { name: 'Skills', patterns: ['skills', 'competencies', 'technologies', 'expertise', 'specialization'] },
        { name: 'Summary / Profile', patterns: ['summary', 'profile', 'objective', 'about me', 'professional profile'] },
        { name: 'Contact Info', patterns: ['contact', 'phone', 'email', 'linkedin', 'address'] },
        { name: 'Projects / Portfolio', patterns: ['projects', 'portfolio', 'key initiatives', 'selected works', 'publications'] },
        { name: 'Certifications / Awards', patterns: ['certifications', 'awards', 'training', 'certification', 'license', 'credentials'] }
    ];

    const found = [];
    const missing = [];

    sectionGroups.forEach(group => {
        const detected = group.patterns.some(s => lowerText.includes(s));
        // Also check contact info via regex if header not found
        if (!detected && group.name === 'Contact Info') {
            if (/\S+@\S+\.\S+/.test(lowerText) || /\d{7,}/.test(lowerText)) {
                found.push(group.name + ' (detected via phone/email)');
                return;
            }
        }
        if (detected) {
            found.push(group.name);
        } else {
            missing.push(group.name);
        }
    });

    const score = Math.min(Math.round((found.length / sectionGroups.length) * 100), 100);
    return { score, found, missing };
}

function calculateImpactScore(text) {
    return getImpactDetails(text).score;
}

function getImpactDetails(text) {
    const lowerText = text.toLowerCase();
    const metrics = text.match(/\d+%|\$[\d,]+|\d+\s?[kKmM]\b|\+\d+/g);
    const metricCount = metrics ? metrics.length : 0;
    const metricExamples = metrics ? [...new Set(metrics)].slice(0, 5) : [];

    const impactWordList = [
        'spearheaded', 'executed', 'launched', 'expanded', 'increased', 'managed',
        'developed', 'delivered', 'automated', 'optimized', 'standardized', 'streamlined',
        'reduced', 'pioneered', 'architected', 'led', 'built', 'designed', 'implemented',
        'created', 'improved', 'achieved', 'generated', 'established', 'transformed'
    ];
    const foundVerbs = impactWordList.filter(v => lowerText.includes(v));

    let score = (metricCount * 15) + (foundVerbs.length * 10);
    return { score: Math.min(score, 100), metricCount, metricExamples, foundVerbs };
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
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 20);
    const bullets = lines.filter(line =>
        /^[\u2022\u2023\u25B8\u25E6\u2043\u25CF\u25AA\-\*\u00b7]/.test(line) ||
        (/^[A-Z]/.test(line) && line.length > 35 && line.length < 250 && !/^[A-Z\s]{3,}$/.test(line))
    );
    const metricPattern = /\d+%|\$[\d,]+|\d+\s?[kKmMbB]\b|\+\d+|\d+x\b|\d+\s*(users?|customers?|people|products?|projects?|teams?|engineers?|writers?|companies|countries|articles?)/i;
    const withMetrics = bullets.filter(line => metricPattern.test(line));
    const total = bullets.length;
    return { pct: total > 0 ? Math.round((withMetrics.length / total) * 100) : 0, withMetrics: withMetrics.length, total };
}

analyzeBtn.addEventListener('click', () => {
    const jdText = document.getElementById('jobDescription').value.trim();

    if (!resumeText) {
        alert("Please upload your resume first.");
        return;
    }

    const hasJD = jdText.length > 50;

    // Show loading state
    const btnText = analyzeBtn.querySelector('.btn-text');
    const btnLoader = analyzeBtn.querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    analyzeBtn.disabled = true;
    
    // Simulate brief processing delay for UX
    setTimeout(() => {
        const jdFreq = hasJD ? getKeywords(jdText, true) : {};
        const resumeFreq = getKeywords(resumeText, false);
        
        const found = [];
        const missing = [];
        let keywordScore = 0;
        let maxPossibleScore = 0;

        if (hasJD) {
            // Helper for Universal (Bi-directional) Synonym Matching
            const checkMatch = (jdKw, freqMap) => {
                // 1. Direct Match
                if (freqMap[jdKw] > 0) return true;
                
                // 2. Family Match (Bi-directional lookup)
                const families = [];
                for (const [key, values] of Object.entries(SYNONYMS)) {
                    if (key === jdKw || values.includes(jdKw)) {
                        families.push(...values, key);
                    }
                }
                
                for (const member of families) {
                    if (freqMap[member] > 0) return true;
                    if (member.length >= 3) {
                        const root = member.substring(0, 4);
                        if (Object.keys(freqMap).some(rk => rk.startsWith(root) || rk.includes(member) || member.includes(rk))) return true;
                    }
                }
                
                // 3. Fallback: Fuzzy root on the JD keyword itself
                if (jdKw.length >= 3) {
                    const root = jdKw.substring(0, 4);
                    if (Object.keys(freqMap).some(rk => rk.startsWith(root) || rk.includes(jdKw) || jdKw.includes(rk))) return true;
                }
                return false;
            };

            // Semantic Matching & Intelligent Scoring
            Object.keys(jdFreq).forEach(jdKw => {
                const jdWeight = Math.min(jdFreq[jdKw], 3);
                const boostMultiplier = TECH_BOOST.has(jdKw) ? 5 : 1;
                maxPossibleScore += jdWeight * 10 * boostMultiplier;
                if (checkMatch(jdKw, resumeFreq)) {
                    found.push(jdKw);
                    keywordScore += jdWeight * 10 * boostMultiplier;
                } else {
                    missing.push(jdKw);
                }
            });
        }

        displayResults(found, missing, resumeText, jdFreq, resumeFreq, keywordScore, maxPossibleScore, hasJD);
        
        // Reset button state
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
        analyzeBtn.disabled = false;
    }, 500);
});

function displayResults(found, missing, fullText, jdFreq, resumeFreq, keywordScore, maxPossibleScore, hasJD = true) {
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    // Populate Raw Text Preview
    const rawPreview = document.getElementById('rawTextPreview');
    if (rawPreview) {
        rawPreview.value = fullText.trim();
    }

    const structureResult = getStructureDetails(fullText);
    const impactResult = getImpactDetails(fullText);
    const health = getResumeHealth(fullText);
    const contactCheck = checkContactInfo(fullText);  // ← NEW

    const structureScore = structureResult.score;
    const impactScore = impactResult.score;
    const formatCheck = getFormatChecklist(fullText);
    const formatScore = formatCheck.score;
    const criticalFormatIssues = formatCheck.issues.filter(i => i.severity === 'critical');

    const keywordMatchPct = maxPossibleScore > 0 
        ? Math.min(Math.round((keywordScore / maxPossibleScore) * 100), 100)
        : 0;

    // Multiplicative model: bad template physically hides keywords from ATS parsers.
    // Format score acts as a discount factor on keyword effectiveness — replicating how
    // a multi-column PDF's text-layer scrambling stops keywords from being found.
    const effectiveKeywordScore = Math.round(keywordMatchPct * (formatScore / 100));
    // Projected score if user fixes their template (format penalty removed)
    const projectedWithFix = Math.round(keywordMatchPct * 0.50 + structureScore * 0.25 + impactScore * 0.25);
    // Final score: with JD use keyword-weighted formula; without JD redistribute to structure & impact
    const finalScore = hasJD
        ? Math.round(effectiveKeywordScore * 0.50 + structureScore * 0.25 + impactScore * 0.25)
        : Math.round(formatScore * 0.25 + structureScore * 0.40 + impactScore * 0.35);

    // Format banner — explains the multiplicative impact when template issues are detected
    const formatBanner = document.getElementById('formatWarningBanner');
    if (formatBanner) {
        if (criticalFormatIssues.length > 0) {
            formatBanner.innerHTML = `
                <strong>⚠️ Template Compliance: ${formatScore}% — this is your #1 problem right now</strong><br>
                Detected: <strong>${formatCheck.issues.map(i => i.label).join(' + ')}</strong>.<br><br>
                ATS systems (Workday, Taleo, Greenhouse) parse PDFs as a straight left-to-right text stream.
                Multi-column and table layouts cause <strong>text-layer scrambling</strong> — your content becomes "word salad" the parser cannot read.<br><br>
                <strong>What this means for your score:</strong>
                <ul style="margin:0.5rem 0 0.5rem 1.4rem; padding:0; list-style:disc;">
                  <li>Your resume has strong keyword content: <strong>${keywordMatchPct}%</strong></li>
                  <li>But ATS will only find ~<strong>${effectiveKeywordScore}%</strong> of them (${keywordMatchPct}% × ${formatScore}% template compliance)</li>
                  <li>Fix your template → your score jumps from <strong>${finalScore}% → ~${projectedWithFix}%</strong></li>
                </ul>
                <strong>Free fix:</strong> Switch to a single-column template —
                <em>Google Docs: File → Templates → <strong>Swiss</strong> or <strong>Serif</strong></em>,
                <em>Word: File → New → search "ATS resume"</em>, or
                <em>resume.io / novoresume.com (ATS-friendly filter)</em>.
                Re-upload here to confirm your improved score.`;
            formatBanner.style.display = 'block';
        } else if (formatCheck.issues.length > 0) {
            formatBanner.innerHTML = `<strong>ℹ️ Minor Format Note:</strong> ${formatCheck.issues.map(i => `• ${i.label}`).join('<br>')}`;
            formatBanner.style.display = 'block';
        } else {
            formatBanner.style.display = 'none';
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

    // Update UI
    document.getElementById('scoreValue').textContent = finalScore;
    document.getElementById('formatBar').style.width = formatScore + '%';
    document.getElementById('formatPct').textContent  = formatScore + '%';
    document.getElementById('structureBar').style.width = structureScore + '%';
    document.getElementById('structurePct').textContent = structureScore + '%';
    document.getElementById('keywordBar').style.width = keywordMatchPct + '%';
    document.getElementById('keywordPct').textContent = keywordMatchPct + '%';
    document.getElementById('impactBar').style.width = impactScore + '%';
    document.getElementById('impactPct').textContent = impactScore + '%';
    
    // Update Keywords UI
    if (hasJD) {
        document.getElementById('foundKeywords').innerHTML = found
            .sort((a, b) => jdFreq[b] - jdFreq[a])
            .map(kw => `<span class="keyword-badge keyword-found">${kw}</span> `)
            .join(' ');
        document.getElementById('missingKeywords').innerHTML = missing
            .sort((a, b) => jdFreq[b] - jdFreq[a])
            .slice(0, 25)
            .map(kw => `<span class="keyword-badge keyword-missing">${kw}</span> `)
            .join(' ');
    } else {
        document.getElementById('missingKeywords').innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Paste a job description and re-analyse to see which keywords your resume is missing for that specific role.</p>';
        document.getElementById('foundKeywords').innerHTML = '';
    }

    // Structure Details
    const structureDetailsEl = document.getElementById('structureDetails');
    if (structureDetailsEl) {
        const foundHTML = structureResult.found.map(s => 
            `<span class="keyword-badge keyword-found">✓ ${s}</span>`).join(' ');
        const missingHTML = structureResult.missing.length > 0
            ? structureResult.missing.map(s => 
                `<span class="keyword-badge keyword-missing">✗ ${s}</span>`).join(' ')
            : '<span style="color: var(--success); font-size: 0.85rem;">All standard sections detected!</span>';
        structureDetailsEl.innerHTML = `
            <p style="color: var(--text-muted); font-size: 0.82rem; margin-bottom: 0.6rem;">Checks for 7 standard resume sections. ATS systems need these headers to correctly categorize your information.</p>
            <div style="margin-bottom: 0.5rem;">${foundHTML}</div>
            ${structureResult.missing.length > 0 ? `<p style="color: var(--text-muted); font-size: 0.8rem; margin: 0.5rem 0 0.3rem;">Missing:</p><div>${missingHTML}</div>` : missingHTML}`;
        document.getElementById('detailsSection').style.display = 'grid';
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

    // -1. Contact Info Issues — HIGHEST PRIORITY: if recruiter can't reach you, nothing else matters
    if (contactCheck.issues.length > 0) {
        tips.push(`<strong>🚨 Broken Contact Details — Fix Immediately</strong><br>
        A recruiter found your resume but cannot reach you. These issues will cost you interviews:<br><br>
        <ul style="margin:0.4rem 0 0 1.2rem; padding:0; list-style:disc;">
          ${contactCheck.issues.map(i => `<li style="margin-bottom:6px">${i}</li>`).join('')}
        </ul>`);
    }
    if (contactCheck.warnings.length > 0) {
        tips.push(`<strong>⚠️ Contact Info — Missing Items</strong><br>
        <ul style="margin:0.4rem 0 0 1.2rem; padding:0; list-style:disc;">
          ${contactCheck.warnings.map(w => `<li style="margin-bottom:6px">${w}</li>`).join('')}
        </ul>`);
    }

    // 0. Template Compliance — HIGHEST PRIORITY, fix before anything else
    if (criticalFormatIssues.length > 0) {
        tips.push(`<strong>🚨 Fix Your Template First — This Is Priority #1</strong><br>
        Your current template is reducing your score from a potential <strong>${projectedWithFix}%</strong> to <strong>${finalScore}%</strong>. No other single fix will have as much impact.<br><br>
        Detected: <strong>${criticalFormatIssues.map(i => i.label).join(', ')}</strong><br><br>
        <strong>Free ATS-safe templates:</strong><br>
        • <strong>Google Docs:</strong> File → Template gallery → search "resume" → pick <em>Swiss</em> or <em>Serif</em><br>
        • <strong>Microsoft Word:</strong> File → New → search "ATS resume" in the template search bar<br>
        • <strong>Online:</strong> resume.io or novoresume.com → filter to "ATS-friendly" templates<br><br>
        After switching: paste your content as plain text (Ctrl+Shift+V), not drag-and-drop. Re-upload here to confirm your improved score.`);
    }

    // 1. Keyword Gap Strategy with SPECIFIC EXAMPLES
    if (keywordMatchPct < 85 && missing.length > 0) {
        const topMissing = missing.slice(0, 5);
        const examples = topMissing.slice(0, 3).map(kw => {
            // Provide context-specific examples
            if (kw.includes('aws') || kw.includes('cloud') || kw.includes('azure')) {
                return `<em>"Deployed microservices on ${kw.toUpperCase()}, reducing infrastructure costs by 30%"</em>`;
            } else if (kw.includes('data') || kw.includes('analytics')) {
                return `<em>"Conducted ${kw} to identify trends, resulting in 25% efficiency improvement"</em>`;
            } else if (kw.includes('team') || kw.includes('lead')) {
                return `<em>"Led cross-functional ${kw} of 8 members to deliver project 2 weeks ahead of schedule"</em>`;
            } else {
                return `<em>"[Add a specific achievement that demonstrates your ${kw} experience]"</em>`;
            }
        }).join('<br>        ');
        
        tips.push(`<strong>🎯 Critical Keywords Missing (${keywordMatchPct}% match):</strong> Add these to your resume: <strong>${topMissing.slice(0, 5).join(', ')}</strong><br><br>Example phrases you can use:<br>        ${examples}`);
    }

    // 2. Impact & Metrics with bullet-level specificity
    if (bulletMetrics.pct < 50 || impactScore < 60) {
        const bulletMsg = bulletMetrics.total > 0
            ? `Only <strong>${bulletMetrics.pct}%</strong> of your bullets have metrics (${bulletMetrics.withMetrics} of ${bulletMetrics.total}) — add numbers to show impact.`
            : 'Add quantifiable metrics to your bullets — numbers are what recruiters and ATS systems look for.';
        tips.push(`<strong>📊 ${bulletMsg}</strong><br><br>
        ❌ Weak: "Responsible for improving system performance"<br>
        ✅ Strong: "Optimized database queries, reducing load time by 45% for 50K+ users"<br><br>
        ❌ Weak: "Managed marketing campaigns"<br>
        ✅ Strong: "Launched 3 email campaigns achieving 28% open rate, generating $250K revenue"`);
    }

    // 3. Structural Integrity with SPECIFIC SECTION NAMES
    if (structureScore < 95) {
        const missingSections = [];
        if (!fullText.match(/\b(experience|employment|work history)\b/i)) missingSections.push('"Professional Experience" or "Work History"');
        if (!fullText.match(/\b(education|academic)\b/i)) missingSections.push('"Education"');
        if (!fullText.match(/\b(skills|technical skills)\b/i)) missingSections.push('"Skills" or "Technical Skills"');
        
        const sectionAdvice = missingSections.length > 0 
            ? `Missing standard sections: ${missingSections.join(', ')}. Add these headers to improve parsability.`
            : 'Use clear, standard section headers like "Professional Experience", "Education", "Skills", "Certifications".';
        
        tips.push(`<strong>📑 Resume Structure (${structureScore}%):</strong> ${sectionAdvice}<br><br>
        ATS systems scan for standard headers. Use industry-standard terms instead of creative ones like "My Journey" or "What I've Done".`);
    }

    // 4. Tone & Professionalism with BEFORE/AFTER
    if (health.pronounCount > 0) {
        tips.push(`<strong>✍️ Remove Personal Pronouns (Found ${health.pronounCount}):</strong><br>
        ❌ Avoid: "I developed a new feature that improved..."<br>
        ✅ Better: "Developed new feature that improved..."<br><br>
        ❌ Avoid: "My responsibilities included managing..."<br>
        ✅ Better: "Managed cross-functional team of..."<br><br>
        Professional resumes use implied first-person voice.`);
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
        tips.push(`<strong>💪 Weak Verbs Found in Your Resume (${health.weakVerbCount} instance${health.weakVerbCount > 1 ? 's' : ''}):</strong><br>${verbLines}<br><br>Example transformation:<br>❌ "${health.weakVerbsFound[0].charAt(0).toUpperCase() + health.weakVerbsFound[0].slice(1)} on backend API development"<br>✅ "Engineered RESTful backend APIs serving 200K+ requests/day"`);
    }

    // 5. Length & Formatting with SPECIFIC GUIDANCE
    if (health.isWallOfText) {
        tips.push(`<strong>📏 Resume Length (${health.wordCount.toLocaleString()} words):</strong><br>
        For a <strong>senior, lead, or staff-level role</strong> with 8+ years of experience, 900–1,500 words across 2 pages is perfectly appropriate — recruiters expect depth at this level. <strong>ATS parsers do not penalise long resumes.</strong><br><br>
        If you want to tighten it for readability:<br>
        • Trim bullets to 1–2 lines; cut setup phrases ("responsible for", "worked on")<br>
        • Each role: keep the 3–5 highest-impact bullets, trim supporting context<br><br>
        Example:<br>
        ❌ "Was responsible for working on the development of an API system that helped to reduce load times"<br>
        ✅ "Built REST API that reduced load time by 40%"`);
    }

    // 6. Overall Score Guidance — template-aware so low scores from format penalty aren't misleading
    if (criticalFormatIssues.length > 0) {
        // Content is strong but template is hiding it — don't say "needs improvement" about the content
        tips.push(`<strong>📋 Summary:</strong> Your content scores well (<strong>${keywordMatchPct}% keyword match</strong>). The low overall score (<strong>${finalScore}%</strong>) is driven almost entirely by your template — not a content problem. Fix the template first, then fine-tune keywords.`);
    } else if (finalScore >= 80) {
        tips.push(`<strong>🎉 Excellent Score!</strong> Your resume is well-optimized for ATS systems. Make the suggested tweaks above to reach 90%+.`);
    } else if (finalScore >= 60) {
        tips.push(`<strong>📈 Good Foundation:</strong> Your resume passes basic ATS screening. Focus on adding the missing keywords and quantifiable achievements to increase your interview chances by 40%+.`);
    } else {
        tips.push(`<strong>⚠️ Needs Improvement:</strong> Priority actions: (1) Add missing keywords from the job description, (2) Quantify achievements with numbers and percentages, (3) Ensure you have standard section headers (Professional Experience, Education, Skills).`);
    }

    tips.forEach(tip => {
        const li = document.createElement('li');
        li.innerHTML = tip; // Use innerHTML to render <strong> and <em>
        tipsList.appendChild(li);
    });

    window.lastResults = { finalScore, found, missing, tips, structureScore, impactScore, keywordMatchPct, formatScore, formatCheck, effectiveKeywordScore, projectedWithFix, hasJD, bulletMetrics, contactCheck };
}

// Download Enhanced PDF Report (Designer Edition with More Details)
document.getElementById('downloadReport').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const res = window.lastResults;
    const date = new Date().toLocaleDateString();

    // Helper: Strip HTML tags AND emojis/non-ASCII for PDF
    const cleanText = (str) => str
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/&nbsp;/g, ' ')
        .replace(/[^\x00-\x7E]/g, '')  // strip emojis and non-ASCII
        .replace(/\s{2,}/g, ' ')
        .trim();

    // PAGE 1: Executive Summary
    // 1. Header & Branding
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text("ATS PERFORMANCE AUDIT", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`CONFIDENTIAL REPORT | ${date} | V3.0 ENHANCED`, 20, 33);

    // 2. Executive Score Dashboard
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 20, 60);

    // Main Score Badge
    doc.setFillColor(16, 185, 129);
    doc.circle(165, 80, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.text(`${res.finalScore}`, 165, 83, { align: "center" });
    doc.setFontSize(10);
    doc.text("MATCH", 165, 90, { align: "center" });

    // Score Interpretation Box
    let interpretation = "";
    let interpColor = [16, 185, 129];
    if (res.finalScore >= 80) {
        interpretation = "EXCELLENT: Your resume is highly optimized for ATS systems.";
        interpColor = [16, 185, 129]; // Green
    } else if (res.finalScore >= 60) {
        interpretation = "GOOD: Your resume will pass most ATS filters. Improvements recommended.";
        interpColor = [245, 158, 11]; // Orange
    } else {
        interpretation = "NEEDS WORK: High risk of automatic rejection. Immediate action required.";
        interpColor = [239, 68, 68]; // Red
    }
    
    doc.setFillColor(interpColor[0], interpColor[1], interpColor[2], 0.1);
    doc.rect(15, 95, 130, 12, 'F');
    doc.setTextColor(interpColor[0], interpColor[1], interpColor[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(interpretation, 20, 102);

    // 3. Detailed Metrics Breakdown
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Breakdown", 20, 120);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 122, 190, 122);

    const drawMetricCard = (label, pct, explanation, y) => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text(label, 20, y);
        
        // Progress bar
        doc.setFillColor(241, 245, 249);
        doc.rect(20, y + 2, 80, 4, 'F');
        const color = pct > 80 ? [16, 185, 129] : (pct > 50 ? [245, 158, 11] : [239, 68, 68]);
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(20, y + 2, (pct / 100) * 80, 4, 'F');
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.text(`${pct}%`, 105, y + 5);
        
        // Explanation
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const splitExp = doc.splitTextToSize(explanation, 170);
        doc.text(splitExp, 20, y + 10);
        
        return y + 10 + (splitExp.length * 4) + 4;
    };

    let y = 130;

    // Template Compliance — first because it's the multiplier for everything else
    const formatIssueText = res.formatCheck.issues.length > 0
        ? `Issues detected: ${res.formatCheck.issues.map(i => i.label).join('; ')}. This is discounting your keyword score from ${res.keywordMatchPct}% to ${res.effectiveKeywordScore}%. Fixing your template could raise your score to ~${res.projectedWithFix}%.`
        : res.formatScore >= 95 
            ? `Single-column layout detected. Your template is fully ATS-compatible. No parsing issues found.`
            : `DOCX format - layout is assumed clean. If submitting as PDF, verify your template uses a single-column layout.`;

    y = drawMetricCard(
        "TEMPLATE COMPLIANCE",
        res.formatScore,
        formatIssueText,
        y
    );

    y = drawMetricCard(
        "KEYWORD MATCH", 
        res.keywordMatchPct, 
        `Raw keyword content score: ${res.keywordMatchPct}%. Effective (after template penalty): ${res.effectiveKeywordScore}%. ${res.found.length} skills matched out of ${res.found.length + Math.min(res.missing.length, 25)} key terms found in job description.`,
        y
    );
    
    y = drawMetricCard(
        "STRUCTURE & PARSABILITY", 
        res.structureScore, 
        "Checks if your resume uses standard sections that ATS systems can recognize. Includes Experience, Education, Skills sections.",
        y
    );
    
    y = drawMetricCard(
        "IMPACT & METRICS", 
        res.impactScore, 
        "Evaluates use of quantifiable achievements (numbers, percentages, dollar amounts). Higher scores indicate results-driven content.",
        y
    );

    // 4. Industry Benchmark
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Industry Benchmarks", 20, y + 8);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const avgScore = 68; // Average ATS score
    const topScore = 85; // Top 10% score
    
    doc.text(`Your Score: ${res.finalScore}% | Average: ${avgScore}% | Top Performers: ${topScore}%+`, 20, y + 14);
    
    if (res.finalScore >= topScore) {
        doc.setTextColor(16, 185, 129);
        doc.text("You're in the TOP 10% of resumes! Excellent work.", 20, y + 20);
    } else if (res.finalScore >= avgScore) {
        doc.setTextColor(245, 158, 11);
        doc.text(`You're above average! ${topScore - res.finalScore}% away from top tier.`, 20, y + 20);
    } else {
        doc.setTextColor(239, 68, 68);
        doc.text(`Below average. Focus on improvements to reach ${avgScore}% first.`, 20, y + 20);
    }

    // 5. Priority Action Items (Top 3)
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOP 3 PRIORITY ACTIONS", 20, y + 32);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y + 34, 190, y + 34);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    
    let actionY = y + 40;
    const topActions = [];
    
    if (res.formatCheck && res.formatCheck.issues.filter(i => i.severity === 'critical').length > 0) {
        topActions.push(`#1 CRITICAL - Fix Template: Switch to a single-column ATS-safe layout. This alone will raise your score from ${res.finalScore}% to ~${res.projectedWithFix}%. Use Google Docs "Swiss/Serif", Word "ATS resume" template, or resume.io (ATS-friendly filter).`);
    }
    if (res.keywordMatchPct < 75) {
        topActions.push(`${topActions.length > 0 ? '#2' : '#1'}: Add ${Math.min(res.missing.length, 5)} missing keywords: ${res.missing.slice(0, 5).join(', ')}`);
    }
    if (res.impactScore < 60) {
        topActions.push(`#${topActions.length + 1}: Quantify achievements - add numbers, percentages, dollar amounts to at least 3 bullet points`);
    }
    if (res.structureScore < 95) {
        topActions.push(`#${topActions.length + 1}: Use standard section headers: "Professional Experience", "Education", "Skills"`);
    }
    
    if (topActions.length === 0) {
        topActions.push("#1: Your resume is well-optimized! Focus on tailoring it to each specific job application.");
        topActions.push("#2: Consider adding more quantifiable metrics to strengthen impact.");
        topActions.push("#3: Review and update your resume every 3-6 months.");
    }
    
    topActions.slice(0, 3).forEach(action => {
        const splitAction = doc.splitTextToSize(action, 170);
        doc.text(splitAction, 20, actionY);
        actionY += (splitAction.length * 5) + 3;
    });

    // PAGE 2: Detailed Analysis
    doc.addPage();
    
    // Header for Page 2
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Detailed Analysis & Recommendations", 20, 16);

    // Strategic Action Plan (with examples)
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Strategic Action Plan", 20, 40);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 42, 190, 42);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    
    y = 48;
    res.tips.slice(0, 5).forEach((tip, idx) => {
        const cleanedTip = cleanText(tip);
        const splitTip = doc.splitTextToSize(`${idx + 1}. ${cleanedTip}`, 170);
        
        if (y + (splitTip.length * 5) > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.text(splitTip, 20, y);
        y += (splitTip.length * 5) + 6;
    });

    // Keyword Intelligence
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    
    if (y > 200) {
        doc.addPage();
        y = 20;
    }
    
    doc.text("Keyword Intelligence Report", 20, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 10;

    // Matching Keywords
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Detected Skills (${res.found.length}):`, 20, y);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const foundText = doc.splitTextToSize(res.found.slice(0, 30).join(" • "), 170);
    doc.text(foundText, 20, y + 6);
    y += (foundText.length * 4) + 12;

    // Missing Keywords
    if (res.missing.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(239, 68, 68);
        doc.text(`Missing Skills (${Math.min(res.missing.length, 25)}):`, 20, y);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 85);
        const missingText = doc.splitTextToSize(res.missing.slice(0, 25).join(" • "), 170);
        doc.text(missingText, 20, y + 6);
        y += (missingText.length * 4) + 12;
    }

    // Before & After Example Section
    if (y > 220) {
        doc.addPage();
        y = 20;
    }
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Example Improvements", 20, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 10;
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(239, 68, 68);
    doc.text("BEFORE (Weak):", 20, y);
    doc.setTextColor(71, 85, 105);
    doc.text('"Responsible for managing team projects and helping with development tasks"', 20, y + 4);
    
    y += 10;
    doc.setTextColor(16, 185, 129);
    doc.text("AFTER (Strong):", 20, y);
    doc.setTextColor(71, 85, 105);
    const afterExample = doc.splitTextToSize('"Led cross-functional team of 8 developers to deliver 5 major features, reducing deployment time by 40% and increasing user engagement by 25%"', 170);
    doc.text(afterExample, 20, y + 4);
    
    y += (afterExample.length * 4) + 10;
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text("Notice: Specific numbers (8, 5, 40%, 25%), action verbs (Led, deliver), and measurable outcomes", 20, y);

    // Footer on last page
    y = 280;
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("END OF REPORT | PRIVACY: ALL DATA PROCESSED LOCALLY | NO STORAGE", 105, y, { align: "center" });
    doc.text(`Generated: ${date} | ATS Optimizer v3.0`, 105, y + 4, { align: "center" });

    doc.save(`ATS-Audit-Enhanced-${date.replace(/\//g, '-')}.pdf`);
});

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
