const fs = require('fs');

// Patch App.jsx
let appContent = fs.readFileSync('src/App.jsx', 'utf8');
appContent = appContent.replace(
  /import \{ ConfigTab \} from '\.\/config\/ConfigTab';/,
  `import { ConfigTab } from './config/ConfigTab';\nimport { GC3DTab } from './gc3d';`
);
appContent = appContent.replace(
  /\{activeTab === 'config' && <ConfigTab \/>\}/,
  `{activeTab === 'config' && <ConfigTab />}\n      {activeTab === 'gc3d' && <GC3DTab />}`
);
fs.writeFileSync('src/App.jsx', appContent);

// Patch TopNav.jsx
let topNavContent = fs.readFileSync('src/components/TopNav.jsx', 'utf8');
topNavContent = topNavContent.replace(
  /<TabItem id="simpAnalysis" name="Simp\. Analysis" icon=\{Activity\} \/>/,
  `<TabItem id="simpAnalysis" name="Simp. Analysis" icon={Activity} />\n        <TabItem id="gc3d" name="GC 3D Analyzer" icon={Activity} />`
);
fs.writeFileSync('src/components/TopNav.jsx', topNavContent);

// Patch Viewer3DTab.jsx
let viewerContent = fs.readFileSync('src/components/Viewer3DTab.jsx', 'utf8');
viewerContent = viewerContent.replace(
  /import \{ Play \} from 'lucide-react';/,
  `import { Play, Activity } from 'lucide-react';\nimport { useGC3DStore } from '../gc3d';`
);
viewerContent = viewerContent.replace(
  /setActiveTab\('transform'\);\s*\n\s*\}\}\s*\n\s*style=\{\{/,
  `setActiveTab('transform');
              }}
              style={{`
);

const sendToGCSnippet = `
            <button
              onClick={() => {
                const selected = components.filter(c => selectedIds.has(c.id));
                const params = useAppStore.getState().processParams || {};
                useGC3DStore.getState().importFromViewer(selected, params);
                setActiveTab('gc3d');
              }}
              style={{
                background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold'
              }}
              disabled={selectedIds.size === 0}
            >
              <Activity size={16} /> Send to GC 3D
            </button>
`;

viewerContent = viewerContent.replace(
  /<button\s+onClick=\{\(\) => \{\s+const active = components\.filter\(c => selectedIds\.has\(c\.id\)\);\s+setAnalysisPayload\(/,
  sendToGCSnippet + `\n            <button\n              onClick={() => {\n                const active = components.filter(c => selectedIds.has(c.id));\n                setAnalysisPayload(`
);

fs.writeFileSync('src/components/Viewer3DTab.jsx', viewerContent);
