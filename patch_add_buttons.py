import re

with open('resume-maker.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Wrap Job 2 and Job 3 in hidden divs
old_job2 = r'<!-- Job 2 -->\s*<h4 style="margin: 32px 0 8px; color: var\(--text-main\);">Role 2 \(Optional\)</h4>'
new_job2 = '<div id="job_form_2" style="display: none;">\n                        <!-- Job 2 -->\n                        <h4 style="margin: 24px 0 8px; color: var(--text-main);">Role 2</h4>'

old_job3 = r'<!-- Job 3 -->\s*<h4 style="margin: 32px 0 8px; color: var\(--text-main\);">Role 3 \(Optional\)</h4>'
new_job3 = '</div>\n\n                        <div id="job_form_3" style="display: none;">\n                        <!-- Job 3 -->\n                        <h4 style="margin: 24px 0 8px; color: var(--text-main);">Role 3</h4>'

old_edu = r'</div>\s*</div>\s*<div class="form-section">\s*<h3>4\. Education</h3>'
new_edu = '</div>\n                        </div>\n                        <button type="button" id="addJobBtn" onclick="showNextJob()" style="background: transparent; color: var(--primary); border: 2px dashed var(--primary); padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem; width: 100%; margin-top: 16px; transition: background 0.2s;">+ Add Work Experience</button>\n                    </div>\n\n                    <div class="form-section">\n                        <h3>4. Education</h3>'

content = re.sub(old_job2, new_job2, content)
content = re.sub(old_job3, new_job3, content)
content = re.sub(old_edu, new_edu, content)

# 2. Wrap Edu 2 in a hidden div
old_edu2 = r'<h4 style="margin: 24px 0 8px; color: var\(--text-main\);">Degree 2 \(Optional\)</h4>'
new_edu2 = '<div id="edu_form_2" style="display: none;">\n                        <h4 style="margin: 24px 0 8px; color: var(--text-main);">Degree 2</h4>'

old_edu_end = r'</div>\s*</div>\s*<div class="form-section" style="border-bottom: none;">'
new_edu_end = '</div>\n                        </div>\n                        </div>\n                        <button type="button" id="addEduBtn" onclick="showNextEdu()" style="background: transparent; color: var(--primary); border: 2px dashed var(--primary); padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem; width: 100%; margin-top: 16px; transition: background 0.2s;">+ Add Education</button>\n                    </div>\n\n                    <div class="form-section" style="border-bottom: none;">'

content = re.sub(old_edu2, new_edu2, content)
content = re.sub(old_edu_end, new_edu_end, content)


# 3. Add the JS functions
js_injection = '''
        function showNextJob() {
            if (document.getElementById('job_form_2').style.display === 'none') {
                document.getElementById('job_form_2').style.display = 'block';
            } else if (document.getElementById('job_form_3').style.display === 'none') {
                document.getElementById('job_form_3').style.display = 'block';
                document.getElementById('addJobBtn').style.display = 'none';
            }
        }

        function showNextEdu() {
            document.getElementById('edu_form_2').style.display = 'block';
            document.getElementById('addEduBtn').style.display = 'none';
        }
        
        function checkHiddenForms() {
            if (document.getElementById('b_jobtitle2').value.trim() !== '' || document.getElementById('b_company2').value.trim() !== '') {
                document.getElementById('job_form_2').style.display = 'block';
            }
            if (document.getElementById('b_jobtitle3').value.trim() !== '' || document.getElementById('b_company3').value.trim() !== '') {
                document.getElementById('job_form_2').style.display = 'block';
                document.getElementById('job_form_3').style.display = 'block';
                document.getElementById('addJobBtn').style.display = 'none';
            }
            if (document.getElementById('b_degree2').value.trim() !== '') {
                document.getElementById('edu_form_2').style.display = 'block';
                document.getElementById('addEduBtn').style.display = 'none';
            }
        }
'''

content = content.replace('updatePreview();\n        };', 'updatePreview();\n            checkHiddenForms();\n        };\n' + js_injection)

with open('resume-maker.html', 'w', encoding='utf-8') as f:
    f.write(content)
