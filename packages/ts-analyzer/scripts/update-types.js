const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://docs.cluster.mu/script/index.d.ts';
const outDir = path.join(__dirname, '..', 'src', 'external');
const outFile = path.join(outDir, 'index.d.ts');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('Downloading', url);
https.get(url, (res) => {
    if (res.statusCode !== 200) {
        console.error('Failed to download:', res.statusCode);
        process.exit(1);
    }
    const chunks = [];
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        fs.writeFileSync(outFile, body, 'utf8');
        console.log('Saved to', outFile);
    });
}).on('error', (err) => {
    console.error('Request failed:', err.message);
    process.exit(1);
});
