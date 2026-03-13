import React from 'react';

const styles = {
  container: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#64748b' }
};

import { usePipeRackStore } from '../store/usePipeRackStore';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

const LoopMesh = ({ line }) => {
  const { W_ft, H_ft } = line.dimensions;
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

  // Dynamic color based on material
  const matColor = line.material.includes('Austenitic') ? '#fbbf24' : '#38bdf8';

  return (
    <group>
      <Line points={pts} color={matColor} lineWidth={3} />
      {/* Label */}
      <Html position={[0, yOffset, H_ft + 2]} center>
        <div style={{ color: matColor, fontSize: '10px', background: '#000', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
          {line.id} ({line.sizeNps}")
        </div>
      </Html>
    </group>
  );
};

export default function RackVisualizer() {
  const { results } = usePipeRackStore();

  return (
    <div style={styles.container}>
      {!results && <h2>Run calculation to view nested loops</h2>}

      {results && (
        <Canvas camera={{ position: [0, 100, 100], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <OrbitControls target={[0, -10, 0]} />
          <gridHelper args={[250, 25]} />
          <axesHelper args={[20]} />

          {results.lines.map(line => (
             <LoopMesh key={line.id} line={line} />
          ))}
        </Canvas>
      )}
    </div>
  );
}
