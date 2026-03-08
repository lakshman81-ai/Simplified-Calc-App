const fs = require('fs');
let content = fs.readFileSync('src/components/TransformTab.jsx', 'utf8');

// Replace id assignment in smartTo2D mapped result
content = content.replace(
  /id: segments3D\[i\]\?\.id \|\| \`Leg-\$\{i\}\`,/g,
  `id: \`\${tabName}-\${i+1}\`,`
);

fs.writeFileSync('src/components/TransformTab.jsx', content);
