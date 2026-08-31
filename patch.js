const fs = require('fs');
const file = 'c:/Users/Vinod/Desktop/Website ideas/ATS-Checker/script.js';
let content = fs.readFileSync(file, 'utf8');

const oldRegex = /\/\/ Reconstruct natural line breaks using Y coordinate.*?text \+\= sortedLines\.join\('\\n'\) \+ '\\n';/s;

const newText = // Reconstruct natural line breaks (Visual View)
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
                .join('\\n');
        };

        const leftText = processColumn(columns.left);
        const rightText = processColumn(columns.right);
        
        // Append to page text
        if (rightText.trim().length > 0) {
            text += leftText + '\\n\\n' + rightText + '\\n\\n';
        } else {
            text += leftText + '\\n\\n';
        };

if(oldRegex.test(content)) {
    content = content.replace(oldRegex, newText);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Success");
} else {
    console.log("Regex not found");
}
