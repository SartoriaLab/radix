const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const files = [
  ['404.html', 'assets/img/'],
  ['politica-privacidade.html', 'assets/img/'],
  ['area-dentista/index.html', '../assets/img/'],
  ['exames/radiografia-panoramica/index.html', '../../assets/img/'],
  ['exames/radiografia-periapical/index.html', '../../assets/img/'],
  ['exames/tomografia-odontologica/index.html', '../../assets/img/'],
  ['exames/documentacao-ortodontica/index.html', '../../assets/img/'],
  ['exames/escaneamento-intraoral-3d/index.html', '../../assets/img/'],
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const [f, prefix] of files) {
  const full = path.join(ROOT, f);
  let s = fs.readFileSync(full, 'utf8');
  const re = new RegExp(
    '[ \\t]*<link rel="icon" type="image/svg\\+xml" href="' + esc(prefix) + 'favicon\\.svg">\\r?\\n' +
      '[ \\t]*<link rel="icon" type="image/webp" href="' + esc(prefix) + 'logo\\.webp">\\r?\\n' +
      '[ \\t]*<link rel="apple-touch-icon" href="' + esc(prefix) + 'logo\\.webp">'
  );
  const newBlock =
    '    <link rel="icon" type="image/webp" sizes="48x48" href="' + prefix + 'favicon-48.webp">\n' +
    '    <link rel="icon" type="image/webp" sizes="96x96" href="' + prefix + 'favicon-96.webp">\n' +
    '    <link rel="icon" type="image/webp" sizes="192x192" href="' + prefix + 'favicon-192.webp">\n' +
    '    <link rel="apple-touch-icon" sizes="180x180" href="' + prefix + 'apple-touch-icon.webp">';
  if (!re.test(s)) {
    console.log('NO MATCH:', f);
    continue;
  }
  s = s.replace(re, newBlock);
  fs.writeFileSync(full, s);
  console.log('updated:', f);
}
