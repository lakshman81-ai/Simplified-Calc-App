const fs = require('fs');
let content = fs.readFileSync('src/components/TransformTab.jsx', 'utf8');

// Replace splits3D
content = content.replace(
  /const splits3D = useMemo\(\(\) => \{[\s\S]*?return splits;\s*\n\s*\}, \[baseSegments3D, anchors\]\);/,
  `const splits3D = useMemo(() => {
      if (!baseSegments3D || baseSegments3D.length === 0) return { UNIFIED: [] };

      const splits = { UNIFIED: baseSegments3D };

      if (anchors.length > 0) {
          const sortedAnchors = [...anchors].sort((a, b) => a.absoluteDist - b.absoluteDist);
          let currentSplitIdx = 1;
          let currentSegs = [];
          let accumL = 0;

          baseSegments3D.forEach((seg, i) => {
              const dx = seg.end[0] - seg.start[0];
              const dy = seg.end[1] - seg.start[1];
              const dz = seg.end[2] - seg.start[2];
              const trueL = Math.sqrt(dx*dx + dy*dy + dz*dz);

              // Find first anchor that falls within this raw segment
              const anchor = sortedAnchors.find(a => a.absoluteDist > accumL && a.absoluteDist <= accumL + trueL + 0.1);

              if (anchor) {
                  const localDist = anchor.absoluteDist - accumL;
                  const ratio = Math.max(0, Math.min(1, localDist / trueL));

                  const midPt = [
                      seg.start[0] + dx * ratio,
                      seg.start[1] + dy * ratio,
                      seg.start[2] + dz * ratio
                  ];

                  const part1 = { ...seg, end: midPt, isSplitHalf: true };
                  const part2 = { ...seg, start: midPt, isSplitHalf: true };

                  currentSegs.push(part1);
                  splits[\`GEO\${currentSplitIdx}\`] = currentSegs;
                  currentSplitIdx++;

                  currentSegs = [part2];
              } else {
                  currentSegs.push(seg);
              }
              accumL += trueL;
          });

          if (currentSegs.length > 0) {
              splits[\`GEO\${currentSplitIdx}\`] = currentSegs;
          }
      }

      return splits;
  }, [baseSegments3D, anchors]);`
);

// Replace UI mapping for `isAnchored`
content = content.replace(
  /const isAnchored = activeGeoTab === 'UNIFIED' && anchors\.find\(a => a\.index === i\);/,
  `let distToStart = 0;
   if (activeGeoTab === 'UNIFIED') {
       for (let j = 0; j < i; j++) {
           distToStart += activeSegments[j].trueLength || 0;
       }
   }
   const segLength = seg.trueLength || 0;
   const isAnchored = activeGeoTab === 'UNIFIED' && anchors.find(a => a.absoluteDist > distToStart - 0.1 && a.absoluteDist < distToStart + segLength + 0.1);
   const localDistVal = isAnchored ? (isAnchored.absoluteDist - distToStart).toFixed(1) : '-';`
);

// Replace input value
content = content.replace(
  /value=\{isAnchored\.dist\}/,
  `value={localDistVal}`
);

fs.writeFileSync('src/components/TransformTab.jsx', content);
