const fs = require('fs');

let viewerContent = fs.readFileSync('src/components/Viewer3DTab.jsx', 'utf8');

viewerContent = viewerContent.replace(
    /<span className="hidden">\s*↓ Export as PCF\s*<\/button>/,
    `<span className="hidden">\n                ↓ Export as PCF\n              </span>`
);

fs.writeFileSync('src/components/Viewer3DTab.jsx', viewerContent);
