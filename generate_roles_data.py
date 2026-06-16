import json

roles = [
    ("Software Engineer", "software-engineer", "Python, AWS, React, and Java", "technical ATS filters like Workday or Greenhouse", "technical stack, frameworks, and programming languages"),
    ("Data Analyst", "data-analyst", "SQL, Tableau, Python, and Excel", "data-driven ATS parsers", "data visualization tools, querying languages, and analytics platforms"),
    ("Product Manager", "product-manager", "Agile, Jira, roadmap, and stakeholder management", "product-focused ATS filters", "product lifecycle, cross-functional leadership, and metrics"),
    ("Registered Nurse", "registered-nurse", "BLS, patient care, Epic, and triage", "healthcare ATS systems like Taleo", "clinical skills, certifications, and patient care specialties"),
    ("Financial Analyst", "financial-analyst", "financial modeling, Excel, forecasting, and ERP", "finance and banking ATS parsers", "financial modeling, variance analysis, and reporting standards"),
    ("Project Manager", "project-manager", "PMP, Agile, risk management, and budget tracking", "enterprise ATS filters", "project lifecycle, budget management, and methodology certifications"),
    ("Marketing Manager", "marketing-manager", "SEO, Google Analytics, campaigns, and CRM", "marketing ATS systems", "digital marketing channels, analytics, and campaign ROI"),
    ("Data Scientist", "data-scientist", "Machine Learning, Python, R, and TensorFlow", "technical AI and data ATS parsers", "machine learning algorithms, statistical modeling, and deep learning frameworks"),
    ("Human Resources Manager", "human-resources-manager", "employee relations, onboarding, HRIS, and compliance", "HR-specific ATS filters", "HR compliance, talent acquisition, and employee lifecycle management"),
    ("Graphic Designer", "graphic-designer", "Adobe Creative Suite, Figma, typography, and UI/UX", "creative ATS and portfolio parsers", "design software, visual communication, and digital layout"),
    ("Sales Representative", "sales-representative", "B2B sales, CRM, cold calling, and Salesforce", "sales and CRM ATS systems", "sales quotas, account management, and lead generation"),
    ("Account Executive", "account-executive", "closing, SaaS sales, pipeline management, and negotiation", "enterprise sales ATS parsers", "quota attainment, pipeline generation, and strategic negotiation"),
    ("Customer Success Manager", "customer-success-manager", "churn reduction, onboarding, Zendesk, and NPS", "customer experience ATS filters", "client retention, account expansion, and relationship management"),
    ("Business Analyst", "business-analyst", "requirements gathering, SQL, Agile, and process improvement", "business operations ATS systems", "process mapping, data analysis, and stakeholder alignment"),
    ("Operations Manager", "operations-manager", "supply chain, logistics, KPI tracking, and Six Sigma", "operations and logistics ATS parsers", "process optimization, vendor management, and operational efficiency"),
    ("Executive Assistant", "executive-assistant", "calendar management, travel coordination, expense reporting, and Slack", "administrative ATS filters", "C-level support, scheduling, and office administration"),
    ("Teacher", "teacher", "lesson planning, classroom management, curriculum development, and special education", "education district ATS systems", "instructional design, student assessment, and pedagogical techniques"),
    ("Mechanical Engineer", "mechanical-engineer", "AutoCAD, SolidWorks, thermodynamics, and manufacturing", "engineering ATS parsers", "CAD software, prototyping, and mechanical design"),
    ("Civil Engineer", "civil-engineer", "AutoCAD Civil 3D, structural analysis, project management, and environmental compliance", "construction and engineering ATS filters", "infrastructure design, site planning, and regulatory compliance"),
    ("Electrical Engineer", "electrical-engineer", "circuit design, MATLAB, power systems, and PCB layout", "technical hardware ATS systems", "electrical schematics, power distribution, and testing protocols"),
    ("Web Developer", "web-developer", "HTML, CSS, JavaScript, and responsive design", "frontend ATS parsers", "web technologies, UI development, and cross-browser compatibility"),
    ("UX/UI Designer", "ux-ui-designer", "Figma, wireframing, user research, and prototyping", "design and product ATS filters", "user experience research, interface design, and interaction flows"),
    ("DevOps Engineer", "devops-engineer", "Docker, Kubernetes, CI/CD, and AWS", "cloud and infrastructure ATS parsers", "automation pipelines, containerization, and cloud architecture"),
    ("Cloud Architect", "cloud-architect", "AWS, Azure, cloud migration, and security", "enterprise IT ATS systems", "cloud infrastructure, security protocols, and scalable architecture"),
    ("Cybersecurity Analyst", "cybersecurity-analyst", "SIEM, vulnerability scanning, firewalls, and incident response", "security and IT ATS filters", "threat analysis, network security, and risk assessment"),
    ("Network Engineer", "network-engineer", "Cisco, routing, switching, and BGP", "IT infrastructure ATS parsers", "network protocols, hardware configuration, and troubleshooting"),
    ("Systems Administrator", "systems-administrator", "Active Directory, Windows Server, Linux, and VMware", "IT operations ATS systems", "server maintenance, user provisioning, and virtualization"),
    ("IT Support Specialist", "it-support-specialist", "helpdesk, troubleshooting, ticketing systems, and hardware", "helpdesk ATS filters", "technical troubleshooting, customer service, and issue resolution"),
    ("Pharmacist", "pharmacist", "patient counseling, medication dispensing, pharmacology, and compounding", "pharmacy and healthcare ATS parsers", "drug interactions, regulatory compliance, and clinical pharmacology"),
    ("Medical Assistant", "medical-assistant", "vitals, EMR, phlebotomy, and patient scheduling", "clinic and hospital ATS systems", "clinical procedures, patient communication, and medical records"),
    ("Dental Assistant", "dental-assistant", "x-rays, sterilization, chairside assistance, and Dentrix", "dental office ATS filters", "dental procedures, infection control, and patient prep"),
    ("Physical Therapist", "physical-therapist", "rehabilitation, manual therapy, patient assessment, and exercise prescription", "rehabilitation ATS parsers", "treatment planning, therapeutic exercises, and mobility assessment"),
    ("Occupational Therapist", "occupational-therapist", "ADLs, therapeutic interventions, patient evaluation, and sensory integration", "healthcare ATS systems", "functional assessments, adaptive equipment, and treatment plans"),
    ("Social Worker", "social-worker", "case management, crisis intervention, patient advocacy, and mental health", "social services ATS filters", "psychosocial assessments, community resources, and counseling"),
    ("Paralegal", "paralegal", "legal research, drafting, Westlaw, and case management", "law firm ATS parsers", "legal documentation, trial preparation, and statutory research"),
    ("Attorney", "attorney", "litigation, legal writing, negotiation, and contract review", "legal ATS systems", "case strategy, legal compliance, and courtroom advocacy"),
    ("Copywriter", "copywriter", "SEO, content strategy, email marketing, and editing", "marketing and agency ATS filters", "content creation, brand voice, and conversion copywriting"),
    ("Social Media Manager", "social-media-manager", "content creation, Hootsuite, engagement, and analytics", "digital marketing ATS parsers", "social platforms, community engagement, and trend analysis"),
    ("Content Creator", "content-creator", "video editing, Adobe Premiere, storytelling, and YouTube", "media and creative ATS systems", "multimedia production, audience building, and creative storytelling"),
    ("Event Planner", "event-planner", "vendor management, budgeting, logistics, and catering", "hospitality and event ATS filters", "event coordination, contract negotiation, and timeline management"),
    ("Real Estate Agent", "real-estate-agent", "client relations, contracts, MLS, and negotiation", "brokerage ATS parsers", "property valuation, market analysis, and real estate transactions"),
    ("Store Manager", "store-manager", "inventory management, merchandising, P&L, and team leadership", "retail ATS systems", "store operations, customer service, and sales performance"),
    ("Restaurant Manager", "restaurant-manager", "scheduling, food safety, customer service, and POS", "hospitality ATS filters", "front-of-house operations, staff training, and cost control"),
    ("Chef", "chef", "menu development, culinary techniques, food safety, and inventory", "culinary ATS parsers", "food preparation, kitchen management, and recipe creation"),
    ("Supply Chain Manager", "supply-chain-manager", "logistics, procurement, vendor negotiation, and ERP", "manufacturing and logistics ATS systems", "supply chain optimization, inventory control, and sourcing"),
    ("Logistics Coordinator", "logistics-coordinator", "freight routing, shipping, SAP, and tracking", "transportation ATS filters", "shipment tracking, customs compliance, and carrier relations"),
    ("Quality Assurance Tester", "quality-assurance-tester", "manual testing, automated testing, Selenium, and bug tracking", "software QA ATS parsers", "test cases, defect reporting, and testing methodologies"),
    ("Business Development Manager", "business-development-manager", "lead generation, strategic partnerships, sales, and networking", "growth and sales ATS systems", "market expansion, relationship building, and B2B strategies"),
    ("Construction Manager", "construction-manager", "project scheduling, OSHA, estimating, and contractor management", "construction ATS filters", "site supervision, blueprint reading, and safety compliance"),
    ("Truck Driver", "truck-driver", "CDL-A, logbooks, route planning, and DOT regulations", "transportation ATS parsers", "safe driving practices, freight handling, and vehicle inspection")
]

data = []
for title, role_id, keywords, ats_type, specific_skills in roles:
    data.append({
        "role_id": role_id,
        "title": title,
        "seo_title": f"Free {title} ATS Resume Checker & Keyword Scanner",
        "seo_desc": f"Check your {title} resume against ATS parsers. Discover exactly which keywords and skills you are missing for {title} jobs.",
        "hero_h1": f"{title} ATS Resume Checker",
        "hero_sub": f"Score your {title.lower()} resume. Discover exactly which skills, like {keywords}, you are missing.",
        "seo_paragraph": f"As a {title}, your resume will likely be parsed by {ats_type}. These systems specifically scan for hard skills and industry terms. Our scanner ensures your {specific_skills} are perfectly aligned with the job description so human recruiters actually see your resume."
    })

with open("C:/Users/Vinod/Desktop/Website ideas/ATS-Checker/roles_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

print("Created roles_data.json with 50 roles.")
