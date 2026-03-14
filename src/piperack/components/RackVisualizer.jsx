import React, { useState } from 'react';

const styles = {
  container: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#64748b', position: 'relative' },
  toolbar: { position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }
};

import { usePipeRackStore } from '../store/usePipeRackStore';
import { useAppStore } from '../../store/appStore';
import { getUnitLabel, formatUnit } from '../../calc-extended/utils/units';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

// Editable Input component overlaid on the Canvas
const EditableHtmlLabel = ({ value, unit, label, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.8)', padding: '4px', borderRadius: '4px', border: '1px solid #334155' }}>
      <div style={{ fontSize: '9px', color: '#94a3b8' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="number"
          value={value}
          onChange={onChange}
          style={{ width: '40px', background: 'transparent', color: '#38bdf8', border: 'none', borderBottom: '1px solid #38bdf8', textAlign: 'center', fontSize: '11px', outline: 'none' }}
        />
        <span style={{ fontSize: '9px', color: '#94a3b8' }}>{unit}</span>
      </div>
    </div>
  );
};

const AnchorSymbol = ({ position }) => (
  <mesh position={position}>
    <boxGeometry args={[2, 2, 2]} />
    <meshStandardMaterial color="#ef4444" />
  </mesh>
);

const GuideSymbol = ({ position }) => (
  <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[1, 1, 4, 16]} />
    <meshStandardMaterial color="#f59e0b" wireframe />
  </mesh>
);

const LoopMesh = ({ line, heatmapMode }) => {
  const { W_ft, H_ft, G1_ft, G2_ft } = line.dimensions;
  const updateLineOverride = usePipeRackStore(state => state.updateLineOverride);
  const unitSystem = useAppStore(state => state.unitSystem);

  // Draw a U-Loop based on calculated W and H
  const pts = [
    new THREE.Vector3(-100, 0, 0), // Anchor 1
    new THREE.Vector3(-W_ft/2, 0, 0), // Tangent 1
    new THREE.Vector3(-W_ft/2, 0, H_ft), // Top corner 1
    new THREE.Vector3(W_ft/2, 0, H_ft), // Top corner 2
    new THREE.Vector3(W_ft/2, 0, 0), // Tangent 2
    new THREE.Vector3(100, 0, 0), // Anchor 2
  ];

  // Adjust Y spacing so loops aren't exactly on top of each other
  // Nesting position 1 is outermost.
  const yOffset = -line.nestingPosition * 4;
  pts.forEach(p => p.y = yOffset);

  // Dynamic color based on material, overridden by Heatmap mode
  let matColor = line.material.includes('Austenitic') ? '#fbbf24' : '#38bdf8';

  // Fake stress simulation heatmap for UI visualization
  if (heatmapMode === 'STRESS') {
    // Highest stress typically on innermost loops due to tightest radius and high thermal expansion
    const stressRatio = (line.tOperate / 600) * (line.nestingPosition / 5);
    if (stressRatio > 0.8) matColor = '#ef4444'; // Red
    else if (stressRatio > 0.5) matColor = '#f59e0b'; // Orange
    else matColor = '#10b981'; // Green
  } else if (heatmapMode === 'FORCE') {
    // Highest force on larger, stiffer pipes
    const forceRatio = line.sizeNps / 24;
    if (forceRatio > 0.8) matColor = '#ec4899'; // Pink
    else if (forceRatio > 0.4) matColor = '#8b5cf6'; // Purple
    else matColor = '#38bdf8'; // Blue
  }

  return (
    <group>
      <Line points={pts} color={matColor} lineWidth={3} />

      {/* Anchors at ends */}
      <AnchorSymbol position={pts[0]} />
      <AnchorSymbol position={pts[5]} />

      {/* Guides */}
      <GuideSymbol position={new THREE.Vector3(-W_ft/2 - G1_ft, yOffset, 0)} />
      <GuideSymbol position={new THREE.Vector3(W_ft/2 + G1_ft, yOffset, 0)} />

      {/* Editable HTML Labels Overlay */}
      <Html position={[0, yOffset, H_ft + 4]} center zIndexRange={[100, 0]}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ color: matColor, fontSize: '10px', background: 'rgba(0,0,0,0.8)', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
            {line.id} ({line.sizeNps}")
          </div>
          <EditableHtmlLabel
             value={formatUnit(unitSystem, 'length', W_ft, 1)}
             unit={getUnitLabel(unitSystem, 'length')}
             label="Width"
             onChange={(e) => updateLineOverride(line.id, 'W_ft', unitSystem === 'Imperial' ? Number(e.target.value) : Number(e.target.value) * 3.28084)}
          />
        </div>
      </Html>

      <Html position={[W_ft/2 + 6, yOffset, H_ft/2]} center zIndexRange={[100, 0]}>
         <EditableHtmlLabel
             value={formatUnit(unitSystem, 'length', H_ft, 1)}
             unit={getUnitLabel(unitSystem, 'length')}
             label="Height"
             onChange={(e) => updateLineOverride(line.id, 'H_ft', unitSystem === 'Imperial' ? Number(e.target.value) : Number(e.target.value) * 3.28084)}
          />
      </Html>

    </group>
  );
};

export default function RackVisualizer() {
  const { results } = usePipeRackStore();
  const [heatmapMode, setHeatmapMode] = useState('MATERIAL');

  return (
    <div style={styles.container}>
      {results && (
        <div style={styles.toolbar}>
          <button style={{ background: heatmapMode === 'MATERIAL' ? '#38bdf8' : '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }} onClick={() => setHeatmapMode('MATERIAL')}>Material View</button>
          <button style={{ background: heatmapMode === 'STRESS' ? '#ef4444' : '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }} onClick={() => setHeatmapMode('STRESS')}>Stress Map</button>
          <button style={{ background: heatmapMode === 'FORCE' ? '#8b5cf6' : '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }} onClick={() => setHeatmapMode('FORCE')}>Force Map</button>
        </div>
      )}

      {!results && <h2>Run calculation to view nested loops</h2>}

      {results && (
        <Canvas camera={{ position: [0, 100, 100], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <OrbitControls target={[0, -10, 0]} />
          <gridHelper args={[250, 25, '#334155', '#1e293b']} position={[0, -25, 0]} />
          <axesHelper args={[20]} />

          {results.lines.map(line => (
             <LoopMesh key={line.id} line={line} heatmapMode={heatmapMode} />
          ))}
        </Canvas>
      )}
    </div>
  );
}
