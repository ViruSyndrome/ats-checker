import os

filepath = r'c:\Users\Vinod\Desktop\Website ideas\ATS-Checker\script.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Cap 5 to 25
content = content.replace('if (history.length > 5) history.pop();', 'if (history.length > 25) history.pop();')

# 2. Add Export button and Sparkline rendering
old_start = "    historyCard.classList.remove('hidden');\n    \n    historyList.innerHTML = history.map(item => {"
new_start = '''    historyCard.classList.remove('hidden');
    
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
        const scores = history.map(h => h.score).reverse();
        sparklineHtml = renderSparkline(scores);
    }
    
    historyList.innerHTML = sparklineHtml + history.map(item => {'''
content = content.replace(old_start, new_start)

# 3. Add the functions
funcs_code = '''
function renderSparkline(scores) {
    if (scores.length < 2) return '';
    var w = 200, h = 40, pad = 4;
    var min = Math.min.apply(null, scores), max = Math.max.apply(null, scores);
    var range = max - min || 1;
    var points = scores.map(function(s, i) {
        var x = pad + (i / (scores.length - 1)) * (w - 2 * pad);
        var y = h - pad - ((s - min) / range) * (h - 2 * pad);
        return x + ',' + y;
    }).join(' ');
    var latest = scores[scores.length - 1];
    var color = latest >= 80 ? '#22c55e' : latest >= 65 ? '#a855f7' : latest >= 45 ? '#f59e0b' : '#ef4444';
    return '<div style="text-align:center;margin:12px 0 8px"><svg width="' + w + '" height="' + h + '" style="border-radius:8px;background:rgba(0,0,0,0.03)"><polyline points="' + points + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><div style="font-size:0.7rem;color:#94a3b8;margin-top:4px">Score Trend</div></div>';
}

function exportHistoryCSV() {
    var raw = _ls.getRaw('ats_score_history');
    if (!raw) return;
    var history = JSON.parse(raw);
    if (!history.length) return;
    var csv = 'Date,Filename,Job Title,Score,Delta\\n';
    history.forEach(function(h) {
        csv += '"' + (h.timestamp || '') + '","' + (h.filename || '').replace(/"/g, '""') + '","' + (h.jobTitle || '').replace(/"/g, '""') + '",' + h.score + ',' + (h.delta || 0) + '\\n';
    });
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ats_scan_history.csv';
    a.click();
    URL.revokeObjectURL(url);
}
'''
if 'exportHistoryCSV' not in content:
    content = content + funcs_code

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated script.js")
