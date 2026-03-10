import React, { useState } from 'react';
import { Html, Outlines } from '@react-three/drei';
import { useGC3DStore } from './GC3DStore';

export const GC3DNodeMesh = ({ id, pos, type, label }) => {
  const [hovered, setHovered] = useState(false);
  const selectedNodeId = useGC3DStore(s => s.selectedNodeId);
  const setSelectedNode = useGC3DStore(s => s.setSelectedNode);
  const isSelected = selectedNodeId === id;

  // Determine dynamic radius and color based on type
  let color = '#ffa500'; // free
  let radius = 100; // Smaller default radius to match piping OD visually
  if (type === 'anchor') { color = '#1e90ff'; radius = 150; }
  else if (type === 'elbow') { color = '#32cd32'; radius = 120; } // Green to match BEND/ELBOW in COLORS
  else if (type === 'tee') { color = '#ff69b4'; radius = 120; }   // Pink to match TEE in COLORS

  return (
    <mesh
      position={pos}
      onClick={(e) => { e.stopPropagation(); setSelectedNode(id); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {type === 'anchor' ? (
        <coneGeometry args={[radius, radius * 2, 32]} />
      ) : (
        <sphereGeometry args={[radius, 32, 32]} />
      )}
      <meshStandardMaterial
        color={color}
        emissive={hovered ? color : '#000000'}
        emissiveIntensity={0.3}
      />
      {isSelected && <Outlines color="white" thickness={0.1} />}
      <Html position={[0, radius + 20, 0]} center zIndexRange={[100, 0]}>
        <div style={{ color: '#fff', background: 'rgba(0,0,0,0.8)', padding: '4px 6px', borderRadius: '4px', fontSize: '11px', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {label || id}
        </div>
      </Html>
    </mesh>
  );
};
