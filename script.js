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
    trackEvent('try_example_resume');
    resumeText = EXAMPLE_RESUME;
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
        const errorMsg = error.message ? `: ${error.message}` : '';
        fileNameDisplay.textContent = `Error: File processing failed${errorMsg}. Please try again.`;
        fileNameDisplay.style.color = 'var(--danger)';
        resumeText = "";
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

        // Reconstruct natural line breaks using Y coordinate (PDF Y is bottom-up)
        // This is critical for bullet detection — joined text has no newlines otherwise
        const itemsByY = {};
        for (const item of content.items) {
            if (!item || !item.str || !item.str.trim() || !item.transform) continue;
            const y = Math.round(item.transform[5] / 4) * 4; // cluster within 4pt
            if (!itemsByY[y]) itemsByY[y] = [];
            itemsByY[y].push({ x: item.transform[4], str: item.str, width: item.width });
        }
        const sortedLines = Object.keys(itemsByY)
            .map(Number)
            .sort((a, b) => b - a) // PDF Y is bottom-up, descending = top to bottom
            .map(y => {
                const items = itemsByY[y].sort((a, b) => a.x - b.x);
                if (items.length === 0) return '';
                let lineStr = items[0].str;
                for (let j = 1; j < items.length; j++) {
                    const prev = items[j - 1];
                    const curr = items[j];
                    const gap = curr.x - (prev.x + prev.width);
                    // If gap is greater than ~3pt, assume it's a space or a new column
                    if (gap > 3) {
                        lineStr += ' ' + curr.str;
                    } else {
                        // Words were split unnaturally, merge them directly without a space
                        lineStr += curr.str;
                    }
                }
                return lineStr;
            });
        text += sortedLines.join('\n') + '\n';
        
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
        .replace(/[^\w\s+#+]/g, ' ') 
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 2 || /^(ai|js|ip|5g|ui|ux|c#|xml)$/.test(w));

// PROTECT List: Words that should NEVER be filtered out
    const protectedWords = new Set(['data', 'training', 'software', 'web', 'agile', 'scrum', 'code', 'writing', 'user', 'seo', 'api']);

    const noiseWords = new Set([
        // Articles, prepositions, conjunctions
        'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'over', 'per', 'off', 'out', 'down',
        'its', 'our', 'you', 'they', 'who', 'we', 'are', 'was', 'were', 'has', 'had', 'been', 'will',
        'can', 'may', 'all', 'any', 'both', 'each', 'few', 'some', 'such', 'only', 'own', 'same',
        'than', 'too', 'very', 'just', 'now', 'then', 'when', 'where', 'why', 'how', 'also', 'back',
        'more', 'most', 'much', 'many', 'even', 'well', 'still', 'since', 'while', 'after', 'before',
        'above', 'below', 'near', 'far', 'upon', 'against', 'under', 'around', 'there', 'here', 'these',
        'during', 'between', 'without', 'himself', 'herself', 'themselves', 'whether',
        // Generic verbs too vague to be keywords
        'have', 'make', 'take', 'give', 'show', 'find', 'come', 'get', 'see', 'look', 'use', 'help',
        'need', 'want', 'keep', 'let', 'put', 'seem', 'ask', 'work', 'turn', 'move', 'live', 'feel',
        'build', 'identify', 'improve', 'manage', 'provide', 'ensure', 'maintain', 'understand',
        'leverage', 'enable', 'support', 'deliver', 'create', 'develop', 'bring', 'grow', 'follow',
        'join', 'become', 'execute', 'drive', 'align', 'evolve', 'advance', 'include',
        // Generic adjectives / adverbs that are NOT skills
        'good', 'best', 'great', 'new', 'old', 'big', 'large', 'small', 'long', 'short', 'high', 'low',
        'fast', 'slow', 'deep', 'bold', 'solid', 'robust', 'active', 'diverse', 'inclusive', 'critical',
        'complex', 'effective', 'innovative', 'impactful', 'comparable', 'confident', 'different',
        'several', 'various', 'another', 'every', 'often', 'always', 'never', 'usually', 'sometimes',
        'today', 'highly', 'truly', 'deeply', 'closely', 'actively', 'primarily', 'primarily', 'directly',
        // HR / JD boilerplate words — appear in every JD, carry zero differentiation
        'experience', 'skills', 'ability', 'knowledge', 'responsible', 'excellent', 'strong', 'required',
        'requirements', 'preferred', 'preferably', 'familiarity', 'openness', 'interest', 'similar',
        'proven', 'demonstrated', 'commitment', 'attention', 'detail', 'quality', 'learn', 'learning',
        'think', 'thinking', 'adaptable', 'flexible', 'quick', 'quickly', 'ability', 'able', 'being',
        'areas', 'area', 'sets', 'surfaces', 'feature', 'planning', 'solutions', 'feedback', 'processes',
        'process', 'processes', 'effectiveness', 'automation', 'needed', 'needed', 'similar', 'approach',
        'approaches', 'outcomes', 'impact', 'impacts', 'results', 'goals', 'vision', 'mission', 'missions',
        'responsibilities', 'opportunity', 'opportunities', 'candidate', 'candidates', 'ideal', 'position',
        'role', 'roles', 'team', 'teams', 'project', 'projects', 'management', 'development', 'tools',
        'using', 'within', 'across', 'including', 'based', 'related', 'field', 'concept', 'concepts',
        'people', 'ways', 'way', 'needs', 'part', 'year', 'years', 'month', 'months', 'week', 'weeks',
        'day', 'days', 'finding', 'joining', 'growing', 'bringing', 'advancing', 'accelerate', 'industry',
        'world', 'business', 'businesses', 'company', 'enterprise', 'organization', 'organizations',
        'culture', 'mindset', 'empathy', 'bias', 'listening', 'accountability', 'creativity', 'behaviors',
        'diversity', 'maturity', 'awareness', 'viewpoints', 'behaviors', 'proficiency', 'standards',
        'models', 'model', 'systems', 'system', 'samples', 'sample', 'simple', 'simply', 'guide', 'done',
        'get', 'started', 'starter', 'entire', 'journey', 'mark', 'engaging', 'helpful', 'expert',
        'degree', 'degrees', 'science', 'journalism', 'english', 'field', 'assurance', 'additional',
        'policies', 'controls', 'administrative', 'procedures', 'maintenance', 'history', 'oriented',
        'demonstrates', 'demonstrates', 'strategy', 'strategic', 'execute', 'executing', 'driven',
        'drives', 'aligns', 'aligned', 'differentiators', 'differentiator', 'simplifying', 'seeking',
        'seek', 'seeks', 'head', 'heads', 'sensitive', 'deriving', 'derive', 'greater', 'careers',
        'increasing', 'workers', 'confident', 'shift', 'left', 'key', 'value', 'like', 'ideas', 'least',
        'one', 'address', 'object', 'problem', 'solving', 'track', 'record', 'tooling', 'streamline',
        'proficiency', 'evolving', 'championing', 'champion', 'solid', 'bonus', 'inactive', 'comparable',
        'think', 'edits', 'creation', 'expand', 'assurance', 'additional', 'onsite',
        'what', 'where', 'when', 'how', 'why', 'familiarity', 'qualifications', 'required', 'preferred', 'across', 'through', 'from', 'your', 'will', 'must', 'should',
        'etc', 'prem', 'review', 'templates', 'initiatives', 'standard', 'standards', 'timelines', 'plus', 'exposure', 'etc', 'etc.',
        'base', 'customer', 'notes', 'appropriate', 'beyond', 'traditional', 'videos', 'demos', 'tours', 'other', 'passion', 'their', 'proofreading', 'generation', 'scripting', 
        'bachelor', 'fields', '15+', 'capacity', 'understanding', 'methodologies', 'editing', 'prioritize', 'effectively', 'tight', 'client', 'aids', 'online', 'educational', 
        'techniques', 'continuous', 'enablement', 'modern', 'proactively', 'contribution', 'improvement', 'practices', 'knowledge', 'understanding', 'lifecycle', 'methods',
        'method', 'methodologies', 'tools', 'technologies', 'technology', 'skills', 'experience', 'years', 'month', 'months', 'degree', 'degrees', 'education',
        // HR soft-skills that read as keywords but aren't searchable skills
        'collaboration', 'collaborative', 'communication', 'communicating', 'partnership', 'partnering',
        'cross', 'functional', 'cross-functional', 'attention', 'detail', 'leadership', 'collaboration',
        // Company names — never resume skills
        'ibm', 'microsoft', 'google', 'amazon', 'oracle', 'sap', 'meta', 'apple', 'hewlett', 'packard',
        'hpe', 'salesforce', 'cisco', 'synopsys', 'vmware', 'nokia', 'dell', 'reltio',
        // Size/quantity adjectives
        'millions', 'thousands', 'hundreds', 'large', 'small', 'big', 'new', 'old', 'senior', 'junior',
        // Split fragments from compound phrases
        'not', 'individual', 'topics', 'topic', 'feel', 'feeling', 'felt', 'feels',
        'enabling', 'enables', 'enabled', 'businesses', 'sensitive', 'deriving', 'derived', 'derives'
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
    'data': ['analytics', 'databases', 'analysis', 'dataset', 'datasets', 'big data', 'metrics', 'kpis', 'statistics', 'visualization', 'tableau', 'power bi'],
    'metrics': ['kpis', 'data points', 'roi', 'conversion', 'analytics', 'metrics', 'measurements', 'okrs', 'dashboards'],
    'seo': ['search', 'visibility', 'optimization', 'metadata', 'google search', 'organic traffic', 'serp'],
    'ai': ['artificial intelligence', 'ml', 'machine learning', 'chatbot', 'nlp', 'llm', 'generative', 'pytorch', 'tensorflow', 'neural networks'],
    
    // Technical Writing & Content
    'writing': ['documentation', 'content', 'authoring', 'editorial', 'write', 'writer', 'technical writing', 'tech docs', 'copywriting', 'ghostwriting'],
    'content developer': ['technical writer', 'content creator', 'documentation specialist', 'information architecture', 'knowledge management'],
    'xml': ['dita', 'xml', 'structured authoring', 'authoring tools', 'content-as-code', 'madcap flare', 'framemaker'],
    
    // Cloud & Infrastructure
    'cloud': ['aws', 'azure', 'gcp', 'cloud computing', 'saas', 'paas', 'iaas', 'serverless', 'infrastructure'],
    'devops': ['ci/cd', 'docker', 'kubernetes', 'k8s', 'jenkins', 'automation', 'terraform', 'ansible'],

    // Software & Web
    'software': ['application', 'platform', 'product', 'saas', 'solution', 'tools', 'software products', 'systems'],
    'web': ['online', 'cloud', 'browser', 'internet', 'portal', 'web-based', 'frontend', 'backend', 'fullstack'],
    'javascript': ['js', 'typescript', 'react', 'node', 'vue', 'angular', 'jquery', 'npm', 'webpack'],
    'api': ['rest', 'graphql', 'soap', 'microservices', 'endpoints', 'json', 'postman'],
    
    // Leadership & Business
    'project management': ['pm', 'pmp', 'agile', 'scrum', 'leadership', 'stakeholder', 'partnerships', 'strategy', 'roadmap'],
    'problem solving': ['analytical', 'troubleshooting', 'problem-solving', 'resolved', 'critical thinking', 'debugging'],
    'communication': ['communications', 'communicating', 'interpersonal', 'collaborate', 'collaboration', 'stakeholder engagement'],
    'certification': ['training', 'certified', 'cert', 'credentials', 'program', 'course', 'degree', 'diploma']
};

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
        { name: 'Certifications / Awards',patterns: ['certifications', 'awards', 'training', 'certification', 'license', 'credentials'], weight: 2 }
    ];
    const totalWeight = sectionGroups.reduce((s, g) => s + g.weight, 0); // = 100

    const found = [];
    const missing = [];
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
        } else {
            missing.push(group.name);
        }
    });

    const score = Math.min(Math.round((earnedWeight / totalWeight) * 100), 100);
    return { score, found, missing };
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

    const metricPattern = /\b\d+%|\$[\d,]+|\d+[kKmMbB]\b|\+\d{1,3}%|\b\d{1,4}(?:\+)?\s*(users?|customers?|people|engineers?|writers?|teams?|products?|projects?|companies|countries|articles?|clients?)/gi;
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
        
        // 2. Fallback heuristic: Starts with uppercase, reasonable length (>= 50 to avoid short wrapped fragments)
        // Also ensure it is NOT an all-caps header and DOES NOT contain title indicators like " — " or " | "
        const hasBulletEnd = /[.!?]$/.test(line);
        const isLikelyBullet = /^[A-Z]/.test(line) && line.length >= 50 && line.length < 350 && line !== line.toUpperCase();
        
        // 3. Reject if it looks like a section header, job metadata, or title
        const isMetadata = /[|—]/.test(line) || /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/i.test(line);
        const isSkillList = (line.match(/,/g) || []).length > 2 && line.length < 120;
        
        return isLikelyBullet && !isMetadata && hasBulletEnd && !isSkillList;
    });
    const metricPattern = /\d+%|\$[\d,]+|\d+\s?[kKmMbB]\b|\+\d+%|\d+x\b|\d+\s*(users?|customers?|people|products?|projects?|teams?|engineers?|writers?|companies|countries|articles?|cycles?|platforms?|members?|roles?|sites?)/i;
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
        alert("Please upload your resume first.");
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
            <strong>Free ATS-safe templates:</strong><br>
            • <strong>Google Docs:</strong> File → Template gallery → search "resume" → pick <em>Swiss</em> or <em>Serif</em><br>
            • <strong>Microsoft Word:</strong> File → New → search "ATS resume" in the template search bar<br>
            • <strong>Online:</strong> resume.io or novoresume.com → filter to "ATS-friendly" templates<br><br>
            After switching: paste your content as plain text (Ctrl+Shift+V), not drag-and-drop. Re-upload here to confirm your improved score.`
        });
    }

    // 1. Keyword Gap Strategy with SPECIFIC EXAMPLES
    if (keywordMatchPct < 85 && missing.length > 0) {
        const filteredMissing = missing.filter(kw => kw.length > 3 && !noiseWords.has(kw));
        const topMissing = filteredMissing.slice(0, 5);
        
        const templates = [
            (kw) => `<em>"Optimized ${kw} workflows, resulting in a 20% increase in team productivity."</em>`,
            (kw) => `<em>"Led the transition to ${kw}-based systems, improving scalability for 50k+ users."</em>`,
            (kw) => `<em>"Implemented advanced ${kw} strategies that reduced manual processing time by 15 hours/week."</em>`,
            (kw) => `<em>"Directed cross-functional initiatives involving ${kw} to deliver project 3 weeks early."</em>`
        ];

        const examples = topMissing.slice(0, 3).map((kw, idx) => {
            const lowerKw = kw.toLowerCase();
            if (lowerKw.includes('aws') || lowerKw.includes('cloud') || lowerKw.includes('azure')) {
                return `<em>"Deployed microservices on ${kw.toUpperCase()}, reducing infrastructure costs by 30%"</em>`;
            } else if (lowerKw.includes('data') || lowerKw.includes('analytics')) {
                return `<em>"Conducted ${kw} to identify trends, resulting in 25% efficiency improvement"</em>`;
            } else if (lowerKw.includes('team') || lowerKw.includes('lead')) {
                return `<em>"Led cross-functional ${kw} of 8 members to deliver project 2 weeks ahead of schedule"</em>`;
            } else {
                return templates[idx % templates.length](kw);
            }
        }).join('<br>        ');
        
        tips.push({
            type: 'warning',
            html: `<strong>🎯 Critical Keywords Missing (${keywordMatchPct}% match):</strong> Add these to your resume: <strong>${topMissing.slice(0, 5).join(', ')}</strong><br><br>Example phrases you can use:<br>        ${examples}`
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
                    ? `Add a number, %, or team size — e.g., "<em>...reducing X by 30%</em>" or "<em>...for a team of N</em>"`
                    : `Start with a power verb ("Led", "Reduced", "Delivered") and quantify the result.`;
                return `❌ <strong>Your resume:</strong> "${clean}"<br>✅ <strong>Improve it:</strong> ${suggestion}`;
            }).join('<br><br>');
        } else {
            exampleHTML = `❌ Weak: "Responsible for improving system performance"<br>
            ✅ Strong: "Optimized database queries, reducing load time by 45% for 50K+ users"<br><br>
            ❌ Weak: "Managed documentation projects"<br>
            ✅ Strong: "Delivered 12 documentation projects on time, reducing support tickets by 25%"`;
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

    window.lastResults = { finalScore, found, missing, tips, structureScore, impactScore, keywordMatchPct, formatScore, formatCheck, effectiveKeywordScore, projectedWithFix, hasJD, bulletMetrics, contactCheck, weakBulletSamples: bulletMetrics.weakBulletSamples };
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

    // Template Compliance
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

    // Keyword Match (Conditional based on JD)
    const kwLabel = res.hasJD ? "KEYWORD MATCH" : "KEYWORD MATCH (BASE)";
    const kwExpl = res.hasJD ? 
        `Score: ${res.keywordMatchPct}%. Effective (after template penalty): ${res.effectiveKeywordScore}%. ${res.found.length} skills matched out of ${res.keywordMatchPct === 100 ? res.found.length : (res.found.length + Math.min(res.missing.length, 25))} key terms identified in job description.` :
        "No job description provided for matching. This score is currently set to 0. Paste a JD for a full keyword analysis.";

    y = drawMetricCard(
        kwLabel, 
        res.keywordMatchPct, 
        kwExpl,
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
        `Evaluates quantifiable achievements. Detected ${res.bulletMetrics.withMetrics} metrics out of ${res.bulletMetrics.total} bullets. Strong action verbs used: ${res.foundVerbs && res.foundVerbs.length > 0 ? res.foundVerbs.slice(0, 5).join(', ') : 'None detected'}.`,
        y
    );

    // 4. Contact Details Audit (CRITICAL)
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CONTACT INFO AUDIT", 20, y + 8);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y + 10, 190, y + 10);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    let contactY = y + 16;
    if (res.contactCheck.issues.length === 0 && res.contactCheck.warnings.length === 0) {
        doc.setTextColor(16, 185, 129);
        doc.text("✓ Professional Contact Details: All core items (Email, Phone, LinkedIn) detected.", 20, contactY);
    } else {
        res.contactCheck.issues.forEach(issue => {
            doc.setTextColor(239, 68, 68);
            doc.text(`[CRITICAL] ${cleanText(issue)}`, 20, contactY);
            contactY += 5;
        });
        res.contactCheck.warnings.forEach(warning => {
            doc.setTextColor(245, 158, 11);
            doc.text(`[WARNING] ${cleanText(warning)}`, 20, contactY);
            contactY += 5;
        });
    }

    // 5. Industry Benchmark & Expert Tip
    let benchY = contactY + 8;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INDUSTRY BENCHMARKS", 20, benchY);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const avgLabel = res.finalScore >= 85 ? 'Above average (top performer)' : res.finalScore >= 68 ? 'Above average' : 'Below average';
    doc.text(`Your Score: ${res.finalScore}% | Industry Average: 68% | Top Performers: 85%+ | Status: ${avgLabel}`, 20, benchY + 6);
    
    // Dynamic Expert Tip — reflects the user's actual biggest weakness
    let expertTip = '';
    if (res.formatCheck && res.formatCheck.issues.filter(i => i.severity === 'critical').length > 0) {
        expertTip = 'Expert Tip: Your biggest win is fixing your template. A single-column layout can immediately raise your score by 20-40 points without changing a word of content.';
    } else if (res.keywordMatchPct < 70) {
        expertTip = `Expert Tip: With ${res.missing.length} missing keywords, tailoring your resume to each job description is your highest-impact action. Even adding 5-10 missing terms can push you past the 75% threshold.`;
    } else if (res.bulletMetrics && res.bulletMetrics.pct < 40) {
        expertTip = `Expert Tip: Only ${res.bulletMetrics.pct}% of your bullets have numbers. Recruiters spend 7 seconds on a resume — quantified achievements (30%, $500K, team of 12) are what make them stop and read.`;
    } else {
        expertTip = `Expert Tip: Your resume is well-optimized. The final step is tailoring 2-3 bullets per role to mirror exact phrases from each job description before applying.`;
    }
    doc.setFillColor(248, 250, 252);
    doc.rect(20, benchY + 10, 170, 14, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "italic");
    const splitTip = doc.splitTextToSize(expertTip, 160);
    doc.text(splitTip, 25, benchY + 17);
    benchY += (splitTip.length > 1 ? 4 : 0);

    // PAGE 2: Detailed Analysis & Strategic Action Plan
    doc.addPage();
    
    // Header for Page 2
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Detailed Analysis & Recommendations", 20, 16);

    // Strategic Action Plan
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
    res.tips.forEach((tipObj, idx) => {
        // Handle new tip object structure {type, html}
        const tipHtml = tipObj.html || tipObj;
        const tipType = tipObj.type || 'info';

        // Convert <br> to newlines to preserve formatting, THEN strip HTML tags AND emojis
        let rawText = tipHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
        // Remove consecutive spaces but preserve newlines
        rawText = rawText.replace(/[ \t]{2,}/g, ' ');
        let cleanedTip = cleanText(rawText);
        
        const splitTip = doc.splitTextToSize(cleanedTip, 160);
        
        // Add a colored background box for each action item to make it look premium
        const boxHeight = (splitTip.length * 5) + 12;
        if (y + boxHeight > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, boxHeight, 'F');
        
        doc.setFont("helvetica", "bold");
        // Color header based on tip type
        const headerColor = tipType === 'danger' ? [239, 68, 68] : (tipType === 'warning' ? [245, 158, 11] : [99, 102, 241]);
        doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.text(`Action Item #${idx + 1}`, 20, y + 6);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(splitTip, 20, y + 12);
        
        y += boxHeight + 6;
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
    if (res.hasJD && res.found.length > 0) {
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
    }

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

    // Before & After Example Section — uses REAL weak bullet from the user's resume if available
    if (y > 220) {
        doc.addPage();
        y = 20;
    }
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Example Improvements (from your resume)", 20, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 10;
    
    const weakSamples = res.weakBulletSamples && res.weakBulletSamples.length > 0 ? res.weakBulletSamples : null;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    if (weakSamples) {
        // Use the real bullet from the user's resume
        weakSamples.forEach((bullet, idx) => {
            const beforeText = `"${cleanText(bullet)}"`;
            const splitBefore = doc.splitTextToSize(beforeText, 150);
            
            const suggestion = idx === 0
                ? `Quantify with a number or % — e.g., add "reduced X by 30%", "managed team of N", or "delivered Y in Z weeks".`
                : `Add a strong action verb at the start ("Led", "Built", "Drove", "Reduced") and at least one measurable outcome.`;
            const splitSuggestion = doc.splitTextToSize(suggestion, 150);

            const boxHeight = (splitBefore.length * 4) + (splitSuggestion.length * 4) + 20;
            if (y + boxHeight > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setDrawColor(226, 232, 240);
            doc.setFillColor(255, 255, 255);
            doc.rect(15, y, 180, boxHeight, 'FD');

            doc.setTextColor(239, 68, 68);
            doc.setFont("helvetica", "bold");
            doc.text(`BEFORE (your resume - bullet ${idx + 1}):`, 20, y + 6);
            y += 10;
            doc.setTextColor(71, 85, 105);
            doc.setFont("helvetica", "italic");
            doc.text(splitBefore, 20, y);
            y += (splitBefore.length * 4) + 4;

            doc.setTextColor(16, 185, 129);
            doc.setFont("helvetica", "bold");
            doc.text(`AFTER (suggested improvement):`, 20, y);
            y += 4;
            doc.setTextColor(71, 85, 105);
            doc.setFont("helvetica", "normal");
            doc.text(splitSuggestion, 20, y);
            y += (splitSuggestion.length * 4) + 12;
        });

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        const notice = doc.splitTextToSize("Tip: The bullets above are from your resume that have no metrics detected. Adding specific numbers, percentages, or team sizes will dramatically increase your Impact score.", 170);
        doc.text(notice, 20, y);
        y += (notice.length * 4) + 4;
    } else {
        // Fallback: generic example when all bullets already have metrics (great resume!)
        doc.setTextColor(16, 185, 129);
        doc.text("Great news: All detected bullet points in your resume already contain metrics!", 20, y);
        y += 6;
        doc.setTextColor(100, 116, 139);
        const genericNote = doc.splitTextToSize("Generic example for reference — BEFORE: \"Responsible for managing team projects and helping with development tasks\" — AFTER: \"Led cross-functional team of 8 to deliver 5 features, reducing deployment time by 40%\"", 170);
        doc.text(genericNote, 20, y);
        y += (genericNote.length * 4) + 4;
    }

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
        alert("Debug log downloaded! Please email this file to hello@getatsready.com for support.");
    });
}
// View Toggle Logic for Raw Text Preview
document.getElementById('viewVisual')?.addEventListener('click', () => {
    document.getElementById('viewVisual').classList.add('active');
    document.getElementById('viewStream').classList.remove('active');
    document.getElementById('rawTextPreview').value = resumeText;
    document.getElementById('rawTextDesc').innerHTML = "This is our engine's <strong>Visual Reconstruction</strong>. We sort text by coordinates to make it readable, but horizontal merging across columns is what confuses ATS systems.";
});

document.getElementById('viewStream')?.addEventListener('click', () => {
    document.getElementById('viewStream').classList.add('active');
    document.getElementById('viewVisual').classList.remove('active');
    document.getElementById('rawTextPreview').value = resumeStreamText;
    document.getElementById('rawTextDesc').innerHTML = "This is the <strong>ATS Stream View</strong> (the order words appear in the PDF file). If this looks scrambled or 'word salad', an older ATS will almost certainly reject your resume automatically.";
});
