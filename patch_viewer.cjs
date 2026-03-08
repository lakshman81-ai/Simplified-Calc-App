const fs = require('fs');

let viewerContent = fs.readFileSync('src/components/Viewer3DTab.jsx', 'utf8');

const sendToGCSnippet = `
            <button
              onClick={() => {
                const selected = components.filter(c => selectedIds.has(c.id));
                const params = useAppStore.getState().processParams || {};
                useGC3DStore.getState().importFromViewer(selected, params);
                setActiveTab('gc3d');
              }}
              className="px-3 py-1 bg-blue-500 text-white text-[11px] rounded font-semibold shadow-sm hover:bg-blue-600 flex items-center gap-1"
              disabled={selectedIds.size === 0}
            >
              <Activity size={12} /> Send to GC 3D
            </button>
`;

if (!viewerContent.includes("Send to GC 3D")) {
  viewerContent = viewerContent.replace(
    /className="px-3 py-1 bg-\[#10b981\] text-white text-\[11px\] rounded font-semibold shadow-sm hover:bg-\[#059669\]">/,
    `className="px-3 py-1 bg-[#10b981] text-white text-[11px] rounded font-semibold shadow-sm hover:bg-[#059669]">\n                ↓ Export as PCF\n              </button>\n` + sendToGCSnippet + `<span className="hidden">`
  );
  if (!viewerContent.includes("import { useGC3DStore }")) {
      viewerContent = viewerContent.replace(
          /import React/,
          `import React, { useState, useEffect, useRef } from 'react';\nimport { Activity } from 'lucide-react';\nimport { useGC3DStore } from '../gc3d';\n`
      );
  }
}

fs.writeFileSync('src/components/Viewer3DTab.jsx', viewerContent);
