import re

with open('resume-maker.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the Form Work Experience Section
old_work_form = r'<div class="form-section">\s*<h3>3\. Work Experience</h3>.*?</div>\s*<div class="form-section">\s*<h3>4\. Education</h3>'
new_work_form = '''<div class="form-section">
                        <h3>3. Work Experience</h3>
                        <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 12px;">Add up to 3 roles. Keep bullets concise.</p>
                        
                        <!-- Job 1 -->
                        <h4 style="margin: 12px 0 8px; color: var(--text-main);">Role 1 (Latest)</h4>
                        <div class="form-group">
                            <label>Job Title</label>
                            <input type="text" id="b_jobtitle1" placeholder="Senior Developer" oninput="updatePreview()">
                        </div>
                        <div style="display: flex; gap: 16px;">
                            <div class="form-group" style="flex: 1;">
                                <label>Company</label>
                                <input type="text" id="b_company1" placeholder="Tech Corp" oninput="updatePreview()">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label>Dates</label>
                                <input type="text" id="b_dates1" placeholder="Jan 2020 - Present" oninput="updatePreview()">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Achievements</label>
                            <textarea id="b_desc1" rows="4" placeholder="- Increased revenue by 20%\\n- Led a team of 5 engineers" oninput="updatePreview()"></textarea>
                        </div>

                        <!-- Job 2 -->
                        <h4 style="margin: 32px 0 8px; color: var(--text-main);">Role 2 (Optional)</h4>
                        <div class="form-group">
                            <label>Job Title</label>
                            <input type="text" id="b_jobtitle2" placeholder="Software Engineer" oninput="updatePreview()">
                        </div>
                        <div style="display: flex; gap: 16px;">
                            <div class="form-group" style="flex: 1;">
                                <label>Company</label>
                                <input type="text" id="b_company2" placeholder="Startup Inc" oninput="updatePreview()">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label>Dates</label>
                                <input type="text" id="b_dates2" placeholder="Mar 2017 - Dec 2019" oninput="updatePreview()">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Achievements</label>
                            <textarea id="b_desc2" rows="4" placeholder="- Built core API infrastructure\\n- Reduced load times by 40%" oninput="updatePreview()"></textarea>
                        </div>

                        <!-- Job 3 -->
                        <h4 style="margin: 32px 0 8px; color: var(--text-main);">Role 3 (Optional)</h4>
                        <div class="form-group">
                            <label>Job Title</label>
                            <input type="text" id="b_jobtitle3" placeholder="Junior Developer" oninput="updatePreview()">
                        </div>
                        <div style="display: flex; gap: 16px;">
                            <div class="form-group" style="flex: 1;">
                                <label>Company</label>
                                <input type="text" id="b_company3" placeholder="Agency LLC" oninput="updatePreview()">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label>Dates</label>
                                <input type="text" id="b_dates3" placeholder="Jun 2015 - Feb 2017" oninput="updatePreview()">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Achievements</label>
                            <textarea id="b_desc3" rows="4" placeholder="- Developed client websites\\n- Maintained legacy databases" oninput="updatePreview()"></textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>4. Education</h3>'''

content = re.sub(old_work_form, new_work_form, content, flags=re.DOTALL)

# 2. Replace Education Section
old_edu_form = r'<h3>4\. Education</h3>.*?<div class="form-section" style="border-bottom: none;">'
new_edu_form = '''<h3>4. Education</h3>
                        <h4 style="margin: 12px 0 8px; color: var(--text-main);">Degree 1</h4>
                        <div class="form-group">
                            <label>Degree & Major</label>
                            <input type="text" id="b_degree" placeholder="B.S. Computer Science" oninput="updatePreview()">
                        </div>
                        <div class="form-group">
                            <label>University & Year</label>
                            <input type="text" id="b_uni" placeholder="State University, 2019" oninput="updatePreview()">
                        </div>
                        
                        <h4 style="margin: 24px 0 8px; color: var(--text-main);">Degree 2 (Optional)</h4>
                        <div class="form-group">
                            <label>Degree & Major</label>
                            <input type="text" id="b_degree2" placeholder="M.S. Data Science" oninput="updatePreview()">
                        </div>
                        <div class="form-group">
                            <label>University & Year</label>
                            <input type="text" id="b_uni2" placeholder="Tech Institute, 2021" oninput="updatePreview()">
                        </div>
                    </div>

                    <div class="form-section" style="border-bottom: none;">'''

content = re.sub(old_edu_form, new_edu_form, content, flags=re.DOTALL)

# 3. Replace the Preview blocks
old_preview = r'<div class="section-title">Experience</div>.*?</p>\s*<div id="out_desc1".*?</div>\s*<div class="section-title">Education</div>\s*<p style="font-weight:bold;" id="out_degree">.*?</p>\s*<p id="out_uni">.*?</p>'
new_preview = '''<div class="section-title">Experience</div>
                        
                        <div id="job_block1" style="margin-bottom: 12px;">
                            <p style="font-weight:bold;" id="out_jobtitle1">Senior Developer</p>
                            <p style="color:#64748b;"><span id="out_company1">Tech Corp</span> &bull; <span id="out_dates1">Jan 2020 - Present</span></p>
                            <div id="out_desc1" style="margin-left: 16px; font-size: 10pt; color: #334155; line-height: 1.5; margin-top: 4px;"></div>
                        </div>

                        <div id="job_block2" style="margin-bottom: 12px; display: none;">
                            <p style="font-weight:bold;" id="out_jobtitle2">Software Engineer</p>
                            <p style="color:#64748b;"><span id="out_company2">Startup Inc</span> &bull; <span id="out_dates2">Mar 2017 - Dec 2019</span></p>
                            <div id="out_desc2" style="margin-left: 16px; font-size: 10pt; color: #334155; line-height: 1.5; margin-top: 4px;"></div>
                        </div>

                        <div id="job_block3" style="margin-bottom: 12px; display: none;">
                            <p style="font-weight:bold;" id="out_jobtitle3">Junior Developer</p>
                            <p style="color:#64748b;"><span id="out_company3">Agency LLC</span> &bull; <span id="out_dates3">Jun 2015 - Feb 2017</span></p>
                            <div id="out_desc3" style="margin-left: 16px; font-size: 10pt; color: #334155; line-height: 1.5; margin-top: 4px;"></div>
                        </div>

                        <div class="section-title">Education</div>
                        <div id="edu_block1" style="margin-bottom: 8px;">
                            <p style="font-weight:bold;" id="out_degree">B.S. Computer Science</p>
                            <p id="out_uni">State University, 2019</p>
                        </div>
                        <div id="edu_block2" style="margin-bottom: 8px; display: none;">
                            <p style="font-weight:bold;" id="out_degree2">M.S. Data Science</p>
                            <p id="out_uni2">Tech Institute, 2021</p>
                        </div>'''

content = re.sub(old_preview, new_preview, content, flags=re.DOTALL)


# 4. Replace Javascript Logic
old_js = r'// Load from LocalStorage.*?function downloadPDF'
new_js = '''// Load from LocalStorage
        window.onload = () => {
            const fields = [
                'b_name', 'b_email', 'b_phone', 'b_link', 'b_summary', 
                'b_jobtitle1', 'b_company1', 'b_dates1', 'b_desc1', 
                'b_jobtitle2', 'b_company2', 'b_dates2', 'b_desc2',
                'b_jobtitle3', 'b_company3', 'b_dates3', 'b_desc3',
                'b_degree', 'b_uni', 'b_degree2', 'b_uni2', 'b_skills'
            ];
            fields.forEach(id => {
                const saved = localStorage.getItem(id);
                const el = document.getElementById(id);
                if (saved && el) el.value = saved;
            });
            updatePreview();
        };

        function updatePreview() {
            const textFields = [
                'b_name', 'b_email', 'b_phone', 'b_link', 'b_summary', 
                'b_jobtitle1', 'b_company1', 'b_dates1', 
                'b_jobtitle2', 'b_company2', 'b_dates2',
                'b_jobtitle3', 'b_company3', 'b_dates3',
                'b_degree', 'b_uni', 'b_degree2', 'b_uni2', 'b_skills'
            ];

            textFields.forEach(id => {
                const el = document.getElementById(id);
                if(el) {
                    const outId = id.replace('b_', 'out_');
                    const outEl = document.getElementById(outId);
                    if(outEl) outEl.innerText = el.value || el.placeholder;
                    localStorage.setItem(id, el.value);
                }
            });

            // Handle bullet points for descriptions
            [1, 2, 3].forEach(num => {
                const descEl = document.getElementById(`b_desc${num}`);
                if(!descEl) return;
                const val = descEl.value;
                localStorage.setItem(`b_desc${num}`, val);
                
                const outEl = document.getElementById(`out_desc${num}`);
                if(outEl) {
                    const textToFormat = val || descEl.placeholder;
                    const bullets = textToFormat.split('\\n').filter(l => l.trim().length > 0);
                    outEl.innerHTML = bullets.map(b => `&bull; ${b.replace(/^- /, '').replace(/^• /, '')}`).join('<br>');
                }
                
                // Hide/Show Job Block based on Job Title
                const block = document.getElementById(`job_block${num}`);
                const title = document.getElementById(`b_jobtitle${num}`);
                if(block && title) {
                    if(num === 1 || title.value.trim() !== '') {
                        block.style.display = 'block';
                    } else {
                        block.style.display = 'none';
                    }
                }
            });

            // Hide/Show Edu 2 Block
            const edu2 = document.getElementById('edu_block2');
            const degree2 = document.getElementById('b_degree2');
            if(edu2 && degree2) {
                edu2.style.display = degree2.value.trim() !== '' ? 'block' : 'none';
            }
        }

        function clearDraft() {
            if(confirm('Are you sure you want to clear your entire draft?')) {
                localStorage.clear();
                document.getElementById('resumeForm').reset();
                updatePreview();
            }
        }

        function downloadPDF'''

content = re.sub(old_js, new_js, content, flags=re.DOTALL)

with open('resume-maker.html', 'w', encoding='utf-8') as f:
    f.write(content)
