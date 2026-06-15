import os
import json

OUT_DIR = "role"

ROLES = [
    {"title": "Software Engineer", "slug": "software-engineer", "keywords": ["JavaScript", "Python", "React", "Node.js", "AWS", "Docker", "Git", "Agile", "SQL", "REST API"], "mistakes": ["Focusing on tools instead of impact.", "Missing GitHub or portfolio links.", "Using obscure acronyms instead of standard ones."]},
    {"title": "Data Analyst", "slug": "data-analyst", "keywords": ["SQL", "Python", "Tableau", "Excel", "Data Visualization", "A/B Testing", "Statistics", "Power BI", "Data Cleaning", "Dashboarding"], "mistakes": ["Not highlighting actionable business insights.", "Listing tools without context.", "Failing to quantify data volumes."]},
    {"title": "Product Manager", "slug": "product-manager", "keywords": ["Product Strategy", "Agile", "Scrum", "Go-to-Market", "User Research", "Roadmapping", "Cross-functional Leadership", "Data-driven", "Jira", "KPIs"], "mistakes": ["Focusing on output instead of outcomes.", "Using generic buzzwords without proof.", "Ignoring cross-functional collaboration metrics."]},
    {"title": "Marketing Manager", "slug": "marketing-manager", "keywords": ["SEO", "Content Marketing", "Google Analytics", "Social Media", "Campaign Management", "Email Marketing", "PPC", "Brand Strategy", "CRM", "ROI"], "mistakes": ["Missing hard metrics like ROI or conversion rates.", "Using overly creative language that ATS cannot parse.", "Failing to specify budget sizes managed."]},
    {"title": "Project Manager", "slug": "project-manager", "keywords": ["PMP", "Agile", "Scrum", "Risk Management", "Budgeting", "Stakeholder Management", "Jira", "Resource Allocation", "SDLC", "Timeline Management"], "mistakes": ["Not quantifying budget or team sizes.", "Missing specific methodologies (e.g., Scrum, Kanban).", "Failing to highlight successful project deliveries."]},
    {"title": "Graphic Designer", "slug": "graphic-designer", "keywords": ["Adobe Creative Suite", "Photoshop", "Illustrator", "InDesign", "Typography", "Branding", "UI/UX", "Figma", "Visual Communication", "Layout Design"], "mistakes": ["Using a highly visual PDF that an ATS cannot read.", "Omitting a clickable portfolio link.", "Focusing only on art, not business impact."]},
    {"title": "Financial Analyst", "slug": "financial-analyst", "keywords": ["Financial Modeling", "Excel", "Forecasting", "Variance Analysis", "Budgeting", "SQL", "ERP", "Valuation", "Reporting", "DCF"], "mistakes": ["Not detailing the scope of financial models.", "Missing specific software proficiencies.", "Failing to quantify cost savings or revenue impact."]},
    {"title": "Human Resources", "slug": "human-resources", "keywords": ["Employee Relations", "Recruitment", "Onboarding", "Performance Management", "HRIS", "Compliance", "Benefits Administration", "Workday", "Talent Acquisition", "Training"], "mistakes": ["Using generic 'people skills' instead of concrete HR terms.", "Failing to quantify hiring volume or retention rates.", "Omitting specific HR software (like Workday or BambooHR)."]},
    {"title": "Sales Representative", "slug": "sales-representative", "keywords": ["B2B Sales", "CRM", "Salesforce", "Cold Calling", "Lead Generation", "Negotiation", "Account Management", "Quota Attainment", "Pipeline Management", "Closing"], "mistakes": ["Not explicitly stating quota attainment percentages.", "Missing the scale of deals closed.", "Failing to mention specific CRM tools used."]},
    {"title": "Customer Success Manager", "slug": "customer-success-manager", "keywords": ["Customer Retention", "Onboarding", "Churn Reduction", "Account Management", "Upselling", "NPS", "Zendesk", "Salesforce", "Customer Support", "Relationship Building"], "mistakes": ["Missing retention or churn metrics.", "Not quantifying the book of business managed.", "Failing to highlight proactive account strategies."]},
    {"title": "Data Scientist", "slug": "data-scientist", "keywords": ["Machine Learning", "Python", "R", "SQL", "Deep Learning", "TensorFlow", "NLP", "Statistical Modeling", "Data Mining", "Predictive Analytics"], "mistakes": ["Listing algorithms without business context.", "Missing cloud deployment skills (AWS/GCP).", "Failing to quantify the impact of models."]},
    {"title": "Business Analyst", "slug": "business-analyst", "keywords": ["Requirements Gathering", "Process Improvement", "SQL", "Agile", "UML", "Data Analysis", "Stakeholder Management", "Jira", "Visio", "User Stories"], "mistakes": ["Not detailing process improvements.", "Missing specific modeling techniques.", "Failing to highlight stakeholder alignment."]},
    {"title": "UX Designer", "slug": "ux-designer", "keywords": ["Wireframing", "Prototyping", "Figma", "User Research", "Usability Testing", "Information Architecture", "Interaction Design", "Sketch", "Adobe XD", "User-Centered Design"], "mistakes": ["Using an unparseable portfolio PDF.", "Missing metrics on user engagement improvements.", "Failing to detail the research process."]},
    {"title": "Account Executive", "slug": "account-executive", "keywords": ["B2B Sales", "Quota Attainment", "Salesforce", "Pipeline Management", "Closing", "Negotiation", "Lead Generation", "Account Planning", "CRM", "Presentations"], "mistakes": ["Not explicitly stating quota numbers.", "Missing deal size ranges.", "Failing to highlight specific sales methodologies."]},
    {"title": "Operations Manager", "slug": "operations-manager", "keywords": ["Process Optimization", "Supply Chain", "Logistics", "Budgeting", "Lean Six Sigma", "Team Leadership", "KPIs", "Vendor Management", "Cost Reduction", "Continuous Improvement"], "mistakes": ["Not quantifying cost savings.", "Missing specific methodologies like Lean or Six Sigma.", "Failing to detail team sizes managed."]},
    {"title": "Executive Assistant", "slug": "executive-assistant", "keywords": ["Calendar Management", "Travel Arrangements", "Expense Reporting", "Microsoft Office", "Event Planning", "Communication", "Confidentiality", "Project Coordination", "Meeting Preparation", "Scheduling"], "mistakes": ["Not specifying the level of executives supported.", "Missing details on specific software used.", "Failing to highlight proactive problem-solving."]},
    {"title": "Recruiter", "slug": "recruiter", "keywords": ["Talent Acquisition", "Sourcing", "Applicant Tracking Systems", "LinkedIn Recruiter", "Interviewing", "Onboarding", "Full Cycle Recruiting", "Boolean Search", "Candidate Experience", "Employer Branding"], "mistakes": ["Not quantifying time-to-fill metrics.", "Missing specific ATS platforms used.", "Failing to highlight successful passive sourcing."]},
    {"title": "Mechanical Engineer", "slug": "mechanical-engineer", "keywords": ["SolidWorks", "CAD", "AutoCAD", "FEA", "Manufacturing", "Product Design", "Thermodynamics", "GD&T", "Prototyping", "Testing"], "mistakes": ["Listing software without project context.", "Missing details on manufacturing processes.", "Failing to quantify design improvements."]},
    {"title": "Civil Engineer", "slug": "civil-engineer", "keywords": ["AutoCAD", "Civil 3D", "Project Management", "Structural Analysis", "Construction Management", "Site Inspection", "Permitting", "Surveying", "Geotechnical Engineering", "Cost Estimating"], "mistakes": ["Not detailing project scale or budgets.", "Missing specific software proficiencies.", "Failing to highlight regulatory compliance experience."]},
    {"title": "Registered Nurse", "slug": "registered-nurse", "keywords": ["Patient Care", "BLS", "ACLS", "EMR", "Epic", "Medication Administration", "Triage", "Vital Signs", "Patient Education", "Clinical Documentation"], "mistakes": ["Not detailing unit specialties or bed counts.", "Missing specific EMR systems used.", "Failing to highlight leadership or charge nurse duties."]},
    {"title": "Teacher", "slug": "teacher", "keywords": ["Lesson Planning", "Classroom Management", "Curriculum Development", "Student Assessment", "Special Education", "Educational Technology", "Differentiated Instruction", "Parent Communication", "IEP", "Instructional Design"], "mistakes": ["Not quantifying student numbers or grade levels.", "Missing specific educational technologies used.", "Failing to highlight measurable student progress."]},
    {"title": "Sales Manager", "slug": "sales-manager", "keywords": ["Sales Strategy", "Team Leadership", "Quota Attainment", "CRM", "Salesforce", "Coaching", "Forecasting", "Pipeline Management", "B2B", "Account Management"], "mistakes": ["Not quantifying team size or total revenue managed.", "Missing details on coaching and development.", "Failing to highlight strategic planning methodologies."]},
    {"title": "Web Developer", "slug": "web-developer", "keywords": ["HTML", "CSS", "JavaScript", "React", "Node.js", "WordPress", "PHP", "Responsive Design", "Git", "UI/UX"], "mistakes": ["Focusing on older technologies without modern frameworks.", "Missing links to live projects or GitHub.", "Failing to quantify performance improvements."]},
    {"title": "Network Engineer", "slug": "network-engineer", "keywords": ["Cisco", "Routing", "Switching", "Firewalls", "TCP/IP", "BGP", "OSPF", "VPN", "Troubleshooting", "Network Security"], "mistakes": ["Listing protocols without scale or context.", "Missing specific hardware models.", "Failing to highlight uptime improvements."]},
    {"title": "System Administrator", "slug": "system-administrator", "keywords": ["Windows Server", "Linux", "Active Directory", "VMware", "Troubleshooting", "Scripting", "Backup", "Security", "Network Administration", "Cloud Computing"], "mistakes": ["Not quantifying the number of servers or users supported.", "Missing specific scripting languages used.", "Failing to highlight specific security improvements."]},
    {"title": "Quality Assurance", "slug": "quality-assurance", "keywords": ["Test Planning", "Manual Testing", "Automated Testing", "Selenium", "Jira", "Defect Tracking", "Agile", "SQL", "Regression Testing", "API Testing"], "mistakes": ["Not specifying the ratio of manual to automated testing.", "Missing details on specific testing frameworks.", "Failing to quantify defect reduction rates."]},
    {"title": "Copywriter", "slug": "copywriter", "keywords": ["Content Creation", "SEO", "Editing", "Proofreading", "Social Media", "Blog Writing", "Brand Voice", "WordPress", "Marketing Copy", "Research"], "mistakes": ["Using a highly stylized PDF that ATS cannot parse.", "Missing metrics on content performance (e.g., views, conversions).", "Failing to link a portfolio."]},
    {"title": "Social Media Manager", "slug": "social-media-manager", "keywords": ["Content Strategy", "Social Media Marketing", "Analytics", "Instagram", "Facebook", "Twitter", "Hootsuite", "Community Management", "Copywriting", "Campaign Management"], "mistakes": ["Not quantifying follower growth or engagement rates.", "Missing specific analytics tools used.", "Failing to highlight successful campaigns with metrics."]},
    {"title": "Event Planner", "slug": "event-planner", "keywords": ["Event Management", "Budgeting", "Vendor Management", "Logistics", "Contract Negotiation", "Marketing", "Sponsorship", "Venue Selection", "Customer Service", "Scheduling"], "mistakes": ["Not quantifying event sizes or budgets.", "Missing details on specific event types (e.g., corporate, weddings).", "Failing to highlight successful problem-solving scenarios."]},
    {"title": "Legal Assistant", "slug": "legal-assistant", "keywords": ["Legal Research", "Document Preparation", "Filing", "Case Management", "LexisNexis", "Drafting", "Client Communication", "Billing", "Calendar Management", "Discovery"], "mistakes": ["Not specifying the areas of law practiced.", "Missing specific software proficiencies.", "Failing to highlight specific types of documents prepared."]},
    {"title": "Pharmacist", "slug": "pharmacist", "keywords": ["Patient Counseling", "Medication Management", "Dispensing", "Pharmacy Operations", "Inventory Management", "Clinical Pharmacology", "Immunization", "Regulatory Compliance", "Healthcare", "Communication"], "mistakes": ["Not quantifying script volume or patient interactions.", "Missing specific pharmacy software systems used.", "Failing to highlight clinical interventions."]},
    {"title": "Dentist", "slug": "dentist", "keywords": ["Patient Care", "Restorative Dentistry", "Treatment Planning", "Oral Surgery", "Endodontics", "Prosthodontics", "Diagnosis", "Radiography", "Communication", "Practice Management"], "mistakes": ["Not detailing specific procedures frequently performed.", "Missing patient volume metrics.", "Failing to highlight practice management skills if applicable."]},
    {"title": "Physical Therapist", "slug": "physical-therapist", "keywords": ["Rehabilitation", "Patient Assessment", "Treatment Planning", "Orthopedics", "Manual Therapy", "Exercise Prescription", "Documentation", "Communication", "Neurology", "Outpatient Care"], "mistakes": ["Not detailing specific patient populations treated.", "Missing specific therapeutic techniques used.", "Failing to highlight measurable patient outcomes."]},
    {"title": "Architect", "slug": "architect", "keywords": ["AutoCAD", "Revit", "Architectural Design", "Project Management", "Construction Documents", "SketchUp", "3D Modeling", "Building Codes", "Sustainability", "Client Communication"], "mistakes": ["Using an unparseable portfolio PDF.", "Missing details on project scale or budgets.", "Failing to highlight specific software proficiencies."]},
    {"title": "Interior Designer", "slug": "interior-designer", "keywords": ["Space Planning", "AutoCAD", "Revit", "Material Selection", "Project Management", "3D Rendering", "SketchUp", "Furniture Selection", "Client Presentations", "Budgeting"], "mistakes": ["Using an unparseable portfolio PDF.", "Missing details on project scale or budgets.", "Failing to highlight specific software proficiencies."]},
    {"title": "Chef", "slug": "chef", "keywords": ["Menu Development", "Culinary Arts", "Inventory Management", "Food Safety", "Kitchen Management", "Cost Control", "Staff Training", "Catering", "Baking", "Purchasing"], "mistakes": ["Not quantifying kitchen staff size or cover counts.", "Missing details on food cost reduction.", "Failing to highlight specific cuisines or techniques."]},
    {"title": "Bartender", "slug": "bartender", "keywords": ["Mixology", "Customer Service", "POS Systems", "Inventory Management", "Cash Handling", "Fast-Paced Environment", "Menu Knowledge", "Upselling", "Hospitality", "Communication"], "mistakes": ["Not quantifying sales volume or drink output.", "Missing details on signature drink creation.", "Failing to highlight specific POS systems used."]},
    {"title": "Retail Manager", "slug": "retail-manager", "keywords": ["Store Operations", "Sales Management", "Customer Service", "Inventory Control", "Visual Merchandising", "Staff Training", "Loss Prevention", "Scheduling", "KPIs", "P&L Management"], "mistakes": ["Not quantifying store revenue or team size.", "Missing details on shrink reduction.", "Failing to highlight specific KPIs achieved."]},
    {"title": "Real Estate Agent", "slug": "real-estate-agent", "keywords": ["Real Estate Transactions", "Negotiation", "Lead Generation", "Contract Management", "Marketing", "Client Relations", "Property Management", "Sales", "Networking", "Market Analysis"], "mistakes": ["Not quantifying sales volume or number of transactions.", "Missing details on specific marketing strategies used.", "Failing to highlight specific property types sold."]},
    {"title": "Insurance Agent", "slug": "insurance-agent", "keywords": ["Sales", "Customer Service", "Lead Generation", "Underwriting", "Risk Assessment", "Policy Administration", "Networking", "Negotiation", "CRM", "Account Management"], "mistakes": ["Not quantifying premium volume or number of policies written.", "Missing details on specific insurance lines sold.", "Failing to highlight specific CRM tools used."]},
    {"title": "Travel Agent", "slug": "travel-agent", "keywords": ["Travel Arrangements", "Customer Service", "Booking Systems", "Sales", "Itinerary Planning", "Vendor Management", "Communication", "Problem Solving", "Geography", "Negotiation"], "mistakes": ["Not quantifying sales volume or number of trips booked.", "Missing details on specific booking systems used.", "Failing to highlight specific travel specialties."]},
    {"title": "Flight Attendant", "slug": "flight-attendant", "keywords": ["Customer Service", "Safety Procedures", "Emergency Response", "Communication", "First Aid", "Teamwork", "Problem Solving", "Conflict Resolution", "Cultural Awareness", "Hospitality"], "mistakes": ["Not detailing specific aircraft types flown.", "Missing details on specific safety training received.", "Failing to highlight specific customer service commendations."]},
    {"title": "Pilot", "slug": "pilot", "keywords": ["Aviation", "Flight Operations", "Safety", "Navigation", "Communication", "Decision Making", "Aircraft Systems", "Crew Resource Management", "Meteorology", "Regulations"], "mistakes": ["Not specifying total flight hours or aircraft types.", "Missing details on specific certifications held.", "Failing to highlight specific safety commendations."]},
    {"title": "Police Officer", "slug": "police-officer", "keywords": ["Law Enforcement", "Criminal Justice", "Patrol", "Investigations", "Public Safety", "Report Writing", "Communication", "Crisis Intervention", "First Aid", "Firearms"], "mistakes": ["Not detailing specific divisions worked or commendations received.", "Missing details on specific training received.", "Failing to highlight community outreach efforts."]},
    {"title": "Firefighter", "slug": "firefighter", "keywords": ["Fire Suppression", "Emergency Response", "Rescue Operations", "EMT", "First Aid", "Public Safety", "Equipment Maintenance", "Physical Fitness", "Teamwork", "Communication"], "mistakes": ["Not detailing specific certifications held.", "Missing details on specific types of rescues performed.", "Failing to highlight specific community outreach efforts."]},
    {"title": "Construction Manager", "slug": "construction-manager", "keywords": ["Project Management", "Scheduling", "Budgeting", "Contract Management", "Safety Compliance", "Quality Control", "Subcontractor Management", "Estimating", "Blueprint Reading", "OSHA"], "mistakes": ["Not quantifying project sizes or budgets.", "Missing details on specific types of construction projects.", "Failing to highlight specific safety records."]},
    {"title": "Electrician", "slug": "electrician", "keywords": ["Electrical Wiring", "Troubleshooting", "Blueprint Reading", "Safety Compliance", "Installation", "Maintenance", "Testing", "NEC", "Hand Tools", "Power Tools"], "mistakes": ["Not detailing specific types of electrical systems worked on.", "Missing details on specific certifications held.", "Failing to highlight specific types of projects completed."]},
    {"title": "Plumber", "slug": "plumber", "keywords": ["Plumbing Systems", "Installation", "Maintenance", "Troubleshooting", "Blueprint Reading", "Pipefitting", "Safety Compliance", "Hand Tools", "Power Tools", "Customer Service"], "mistakes": ["Not detailing specific types of plumbing systems worked on.", "Missing details on specific certifications held.", "Failing to highlight specific types of projects completed."]},
    {"title": "Welder", "slug": "welder", "keywords": ["Welding Techniques", "Blueprint Reading", "Fabrication", "Safety Compliance", "MIG", "TIG", "Stick", "Metalworking", "Quality Control", "Hand Tools"], "mistakes": ["Not detailing specific welding techniques or materials used.", "Missing details on specific certifications held.", "Failing to highlight specific types of projects completed."]},
    {"title": "Machinist", "slug": "machinist", "keywords": ["CNC Machining", "Blueprint Reading", "Precision Measuring", "Tooling", "Programming", "Quality Control", "Lathes", "Mills", "Safety Compliance", "CAD/CAM"], "mistakes": ["Not detailing specific types of machines operated or materials used.", "Missing details on specific programming languages used.", "Failing to highlight specific tolerances achieved."]}
]

def load_template():
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
    return html

def create_page(role, template):
    title = role['title']
    slug = role['slug']
    keywords = role['keywords']
    mistakes = role['mistakes']
    
    # Replace Meta Title
    html = template.replace("<title>Free ATS Resume Checker | Get ATS Ready | No Signup, 100% Private</title>", f"<title>Free {title} ATS Resume Checker | Get ATS Ready</title>")
    
    # Replace Meta Description
    html = html.replace('content="Free ATS resume checker — instantly score your resume against any job description. No signup. 100% private, processed in your browser. Get ATS ready in seconds."', f'content="Free {title} ATS Resume Checker. Instantly score your {title} resume against job descriptions to optimize keywords and beat the ATS."')
    
    # Replace OG and Twitter tags
    html = html.replace('content="Free ATS Resume Checker | Get ATS Ready"', f'content="Free {title} ATS Resume Checker | Get ATS Ready"')
    
    # Add a custom H1 above the tool grid
    h1_injection = f"""
        <div class="card inline-style-text-seo" style="margin-bottom: 24px; text-align: center;">
            <h1 style="font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; margin-top: 0;">Free {title} ATS Resume Checker</h1>
            <p style="color: var(--text-muted); font-size: 1.1rem; max-width: 800px; margin: 0 auto;">Optimize your {title} resume for Applicant Tracking Systems. Paste your job description and upload your resume to instantly reveal missing hard skills, formatting errors, and critical keywords.</p>
        </div>
    """
    html = html.replace('<div class="tool-grid">', h1_injection + '\n            <div class="tool-grid">')
    
    # Modify the canonical link
    html = html.replace('href="https://www.getatsready.com/"', f'href="https://www.getatsready.com/role/{slug}.html"')
    
    # Fix asset paths since this is in a subdirectory (/role/)
    html = html.replace('href="style.css', 'href="../style.css')
    html = html.replace('src="script.js', 'src="../script.js')
    html = html.replace('href="favicon.svg', 'href="../favicon.svg')
    html = html.replace('href="about.html', 'href="../about.html')
    html = html.replace('href="contact.html', 'href="../contact.html')
    html = html.replace('href="privacy.html', 'href="../privacy.html')
    html = html.replace('href="terms.html', 'href="../terms.html')
    html = html.replace('href="guides/index.html', 'href="../guides/index.html')
    html = html.replace('href="/"', 'href="../"')
    
    # Inject SEO Content specifically below the newly added scoring explanation
    keyword_list = "".join([f'<li style="display: inline-block; background: var(--bg-secondary); padding: 4px 12px; margin: 4px; border-radius: 99px; font-size: 0.9rem; font-weight: 500; border: 1px solid var(--border-color);">{kw}</li>' for kw in keywords])
    mistake_list = "".join([f'<li style="margin-bottom: 8px;">{mst}</li>' for mst in mistakes])
    
    seo_content = f"""
            <!-- PSEO Specific Content -->
            <div class="card inline-style-text-seo" style="margin-top: 24px; line-height: 1.6; color: var(--text-muted);">
                <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; margin-top: 0;">Top 10 Keywords for a {title} Resume</h2>
                <p style="margin-bottom: 16px;">Applicant Tracking Systems scan your resume for specific hard skills and terminologies related to the {title} role. Based on current industry standards, make sure you include these keywords if you have the experience:</p>
                <ul style="list-style: none; padding: 0; margin-bottom: 24px;">
                    {keyword_list}
                </ul>
                
                <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">3 Common Mistakes on {title} Resumes</h2>
                <ul style="margin-bottom: 0; margin-left: 20px; list-style-type: disc;">
                    {mistake_list}
                </ul>
            </div>
    """
    
    html = html.replace('<!-- SEO Text Section: How the Multiplicative Scoring Model Works -->', seo_content + '\n            <!-- SEO Text Section: How the Multiplicative Scoring Model Works -->')

    return html

def main():
    template = load_template()
    
    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)
        
    for role in ROLES:
        html = create_page(role, template)
        out_path = os.path.join(OUT_DIR, f"{role['slug']}.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Generated: {out_path}")

if __name__ == "__main__":
    main()
