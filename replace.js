const fs = require('fs');
const filepath = 'reports-backend/template/complete_report.html';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/of performance\./g, 'level of intelligence.');
content = content.replace(/Low performance/ig, 'Low level of intelligence');
content = content.replace(/Average of performance/ig, 'Average level of intelligence');

const nimhansIndex = content.indexOf('NIMHANS SLD Index - Arithmetic test');
if (nimhansIndex !== -1) {
    const blockStart = content.lastIndexOf('<h4>', nimhansIndex);
    const blockEnd = content.indexOf('<h4>', nimhansIndex + 30);
    const nimhansBlock = content.substring(blockStart, blockEnd);
    if (!nimhansBlock.includes('«nimhans_display»')) {
        content = content.substring(0, blockStart) +
            '<div style="display: «nimhans_display»;">\n' +
            nimhansBlock +
            '</div>\n' +
            content.substring(blockEnd);
    }
}
fs.writeFileSync(filepath, content);
console.log('Template modified safely.');
