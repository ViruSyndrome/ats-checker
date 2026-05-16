
# Read file content preserving original encoding
$content = [System.IO.File]::ReadAllText('index.html', [System.Text.Encoding]::UTF8)

$newResultsSection = @'
            <div id="results" class="results-section">

                <!-- 1. FORMAT WARNING BANNER -->
                <div id="formatWarningBanner" style="display:none; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.4); border-radius: 12px; padding: 1.2rem 1.5rem; margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.9rem; line-height: 1.7;"></div>

                <!-- 2. SCORE + BREAKDOWN -->
                <div class="results-grid">
                    <div class="score-card">
                        <div class="score-circle" id="scoreValue">0</div>
                        <h2>ATS Compatibility Score</h2>
                        <div id="scoreVerdictBadge" style="display:inline-block; margin: 0.4rem 0 0.6rem; padding: 4px 16px; border-radius: 99px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; background: rgba(99,102,241,0.15); color: var(--accent);">Analyzing...</div>
                        <p id="scoreText" style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.3rem;">Keyword match x template compliance x structure x impact — mirroring how enterprise ATS systems rank candidates.</p>
                        <button id="downloadReport" class="secondary-btn" style="margin-top: 1rem; width: 100%;">&#8595; Download Full PDF Report</button>
                    </div>

                    <div class="stats-card">
                        <div class="stat-item">
                            <div class="stat-header">
                                <span>Template Compliance
                                    <span class="tooltip-icon">&#8505;&#65039;
                                        <span class="tooltip-text">Checks if your resume template can be correctly parsed by ATS software. Multi-column and table layouts cause "text-layer scrambling" — your content becomes unreadable word salad. This score is used as a multiplier on your keyword match: a 30% template score means ATS will only find ~30% of your keywords regardless of how good your content is.</span>
                                    </span>
                                </span>
                                <span id="formatPct">0%</span>
                            </div>
                            <div class="progress-bar"><div id="formatBar" class="progress-fill" style="width: 0%"></div></div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-header">
                                <span>Structure &amp; Parsability
                                    <span class="tooltip-icon">&#8505;&#65039;
                                        <span class="tooltip-text">Weighted section check: Work Experience (30pts), Skills (25pts), Education (20pts), Summary (10pts), Contact (10pts), Projects (3pts), Certifications (2pts). Missing critical sections heavily penalises your score.</span>
                                    </span>
                                </span>
                                <span id="structurePct">0%</span>
                            </div>
                            <div class="progress-bar"><div id="structureBar" class="progress-fill" style="width: 0%"></div></div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-header">
                                <span>Keyword Match
                                    <span class="tooltip-icon">&#8505;&#65039;
                                        <span class="tooltip-text">Percentage of job description keywords found in your resume. ATS systems scan for exact matches and synonyms. Higher match = better chance of passing automated screening. Aim for 75%+.</span>
                                    </span>
                                </span>
                                <span id="keywordPct">0%</span>
                            </div>
                            <div class="progress-bar"><div id="keywordBar" class="progress-fill" style="width: 0%"></div></div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-header">
                                <span>Impact &amp; Metrics
                                    <span class="tooltip-icon">&#8505;&#65039;
                                        <span class="tooltip-text">Driven by the % of your bullet points that contain quantified results (numbers, %, $, team sizes). 80% of this score comes from bullet metrics; 20% from strong action verbs — mirroring what recruiters reward.</span>
                                    </span>
                                </span>
                                <span id="impactPct">0%</span>
                            </div>
                            <div class="progress-bar"><div id="impactBar" class="progress-fill" style="width: 0%"></div></div>
                        </div>
                    </div>
                </div>

                <!-- 3. PRIORITY ACTION PLAN — most valuable content, shown immediately after score -->
                <div class="card" style="margin-top: 1.5rem; border-left: 3px solid var(--accent);">
                    <div class="card-title">&#127919; Your Priority Action Plan</div>
                    <p style="color: var(--text-muted); font-size: 0.83rem; margin-bottom: 1rem;">Fixes are ranked by impact. Address #1 before working on anything else.</p>
                    <ul id="tipsList"></ul>
                </div>

                <!-- 4. KEYWORDS: Missing then Found -->
                <div class="tool-grid" style="margin-top: 1rem;">
                    <div class="card">
                        <div class="card-title">&#10060; Missing Keywords <span style="font-size:0.72rem;font-weight:400;color:var(--text-muted);margin-left:8px;">Add these to pass ATS screening</span></div>
                        <div id="missingKeywords"></div>
                    </div>
                    <div class="card">
                        <div class="card-title">&#9989; Found Keywords <span style="font-size:0.72rem;font-weight:400;color:var(--text-muted);margin-left:8px;">Already matched in your resume</span></div>
                        <div id="foundKeywords"></div>
                    </div>
                </div>

                <!-- 5. TECHNICAL DETAILS — collapsed by default -->
                <details style="margin-top: 1rem;">
                    <summary style="cursor:pointer; padding: 1rem 1.5rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; font-weight: 600; font-size: 0.9rem; color: var(--text-muted); user-select: none;">
                        &#128300; Technical Details &nbsp;<span style="font-size:0.75rem;font-weight:400;">(structure analysis, impact metrics, raw ATS text)</span>
                    </summary>
                    <div style="padding-top: 1rem;">
                        <div class="tool-grid" id="detailsSection">
                            <div class="card">
                                <div class="card-title">Structure &amp; Parsability &#8212; Detected Sections</div>
                                <div id="structureDetails"></div>
                            </div>
                            <div class="card">
                                <div class="card-title">Impact &amp; Metrics &#8212; Bullet Analysis</div>
                                <div id="impactDetails"></div>
                            </div>
                        </div>
                        <div class="card" style="margin-top: 1rem;">
                            <div class="card-title">How ATS Reads Your Resume (Raw Extracted Text)</div>
                            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">This is exactly what an ATS parser extracts from your file. Scrambled or merged words = your template is failing the ATS screen automatically.</p>
                            <textarea id="rawTextPreview" readonly style="width: 100%; height: 200px; background: rgba(15,23,42,0.5); color: var(--text-main); border: 1px solid var(--border); border-radius: 8px; padding: 12px; font-family: monospace; font-size: 0.85rem; resize: vertical; outline: none; line-height: 1.4;"></textarea>
                        </div>
                    </div>
                </details>

            </div>
'@

# Find the start and end of the results div
$startPattern = '<div id="results" class="results-section">'
$startIdx = $content.IndexOf($startPattern)

if ($startIdx -lt 0) {
    Write-Host "ERROR: Could not find start marker"
    exit 1
}

# Find the closing </div> that matches - it's the last </div> before the next major section
# We'll find the end by looking for the pattern after the Improvement Tips card
$endSearchStart = $content.IndexOf('Improvement Tips', $startIdx)
if ($endSearchStart -lt 0) {
    Write-Host "ERROR: Could not find 'Improvement Tips'"
    exit 1
}

# Find the closing div for the results section (two </div> closes after tipsList)
$tipsListClose = $content.IndexOf('</ul>', $content.IndexOf('id="tipsList"', $startIdx))
$firstClose = $content.IndexOf('</div>', $tipsListClose)      # closes the card
$secondClose = $content.IndexOf('</div>', $firstClose + 6)   # closes the results div

$endIdx = $secondClose + 6  # includes the </div>

Write-Host "Start: $startIdx, End: $endIdx"
Write-Host "Replacing section of length:" ($endIdx - $startIdx)

$newContent = $content.Substring(0, $startIdx) + $newResultsSection.Trim() + $content.Substring($endIdx)

[System.IO.File]::WriteAllText('index.html', $newContent, [System.Text.Encoding]::UTF8)
Write-Host "SUCCESS: HTML patched."
