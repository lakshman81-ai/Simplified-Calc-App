import React, { useState } from 'react';
import { Html, Outlines } from '@react-three/drei';
import { useGC3DStore } from './GC3DStore';

export const GC3DNodeMesh = ({ id, pos, type, label }) => {
  const [hovered, setHovered] = useState(false);
  const selectedNodeId = useGC3DStore(s => s.selectedNodeId);
  const setSelectedNode = useGC3DStore(s => s.setSelectedNode);
  const snapNodeId = useGC3DStore(s => s.snapNodeId);
  const setSnapNodeId = useGC3DStore(s => s.setSnapNodeId);
  const isSelected = selectedNodeId === id;
  const isSnapped = snapNodeId === id;

  let color = '#ffa500'; // free
  let radius = 200;
  if (type === 'anchor') { color = '#1e90ff'; radius = 250; }
  else if (type === 'elbow') { color = '#800080'; }
  else if (type === 'tee') { color = '#ffd700'; }

  if (isSnapped) {
    color = '#ef4444'; // Red for snap
    radius = 250;
  }

  return (
    <mesh
      position={pos}
      onClick={(e) => { e.stopPropagation(); setSelectedNode(id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); setSnapNodeId(id); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); if (snapNodeId === id) setSnapNodeId(null); }}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={hovered ? color : '#000000'}
        emissiveIntensity={0.3}
      />
      {isSelected && <Outlines color="white" thickness={0.1} />}
      <Html position={[0, radius + 50, 0]} center>
        <div style={{ color: '#fff', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', pointerEvents: 'none' }}>
          {label || id}
        </div>
      </Html>
    </mesh>
  );
};
