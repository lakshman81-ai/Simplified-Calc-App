const fs = require('fs');
const content = fs.readFileSync('src/components/TransformTab.jsx', 'utf8');

let newContent = content.replace(
  /\/\/ Anchor splitting states\s*\n\s*\/\/ Array of \{ index: segmentIndex, dist: distanceFromStart \}\s*\n\s*const \[anchors, setAnchors\] = useState\(\[\]\);/g,
  `// Anchor splitting states
  // Array of { absoluteDist: distanceFromStartOfPipeline }
  const [anchors, setAnchors] = useState([]);`
);

newContent = newContent.replace(
  /const toggleAnchor = \(segmentIndex, trueLength\) => \{[\s\S]*?\/\/ Switch to UNIFIED view when changing anchors to see the whole picture\s*\n\s*setActiveGeoTab\('UNIFIED'\);\s*\n\s*\};/,
  `const toggleAnchor = (segmentIndex, trueLength) => {
      // Calculate absolute distance to start of this segment
      let distToStart = 0;
      for (let i = 0; i < segmentIndex; i++) {
          distToStart += activeSegments[i].trueLength || 0;
      }
      const targetAbsoluteDist = distToStart + (trueLength / 2);

      setAnchors(prev => {
          const existsIdx = prev.findIndex(a => a.absoluteDist > distToStart - 0.1 && a.absoluteDist < distToStart + trueLength + 0.1);
          if (existsIdx >= 0) {
              const copy = [...prev];
              copy.splice(existsIdx, 1);
              return copy;
          }
          return [...prev, { absoluteDist: targetAbsoluteDist }];
      });
      setActiveGeoTab('UNIFIED');
  };`
);

newContent = newContent.replace(
  /const updateAnchorDist = \(segmentIndex, newDist\) => \{[\s\S]*?\};/,
  `const updateAnchorDist = (segmentIndex, newLocalDist) => {
      let distToStart = 0;
      for (let i = 0; i < segmentIndex; i++) {
          distToStart += activeSegments[i].trueLength || 0;
      }
      const newAbsoluteDist = distToStart + Number(newLocalDist);
      setAnchors(prev => {
          const existsIdx = prev.findIndex(a => a.absoluteDist > distToStart - 0.1 && a.absoluteDist < distToStart + activeSegments[segmentIndex].trueLength + 0.1);
          if (existsIdx >= 0) {
              const copy = [...prev];
              copy[existsIdx] = { absoluteDist: newAbsoluteDist };
              return copy;
          }
          return prev;
      });
  };`
);

fs.writeFileSync('src/components/TransformTab.jsx', newContent);
