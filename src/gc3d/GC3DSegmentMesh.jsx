import React, { useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGC3DStore } from './GC3DStore';

const COLORS = {
  PIPE: '#1e90ff',
  ELBOW: '#32cd32',
  BEND: '#32cd32',
  TEE: '#ff69b4',
  VALVE: '#8B4513',
  FLANGE: '#8B4513',
  REDUCER: '#DAA520',
  SUPPORT: '#808080'
};

export const GC3DSegmentMesh = ({ id, startPos, endPos, compType, length_in }) => {
  const [hovered, setHovered] = useState(false);
  const selectedSegmentIds = useGC3DStore(s => s.selectedSegmentIds);
  const toggleSegmentSelection = useGC3DStore(s => s.toggleSegmentSelection);
  const colorMode = useGC3DStore(s => s.colorMode);
  const activeTool = useGC3DStore(s => s.activeTool);
  const splitSegmentAtPoint = useGC3DStore(s => s.splitSegmentAtPoint);
  const segmentData = useGC3DStore(s => s.segments.find(seg => seg.id === id));

  const isSelected = selectedSegmentIds.has(id);

  const startVec = new THREE.Vector3(...startPos);
  const endVec = new THREE.Vector3(...endPos);
  const diff = new THREE.Vector3().subVectors(endVec, startVec);
  const length = diff.length();
  const mid = startVec.clone().add(diff.clone().multiplyScalar(0.5));

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    diff.clone().normalize()
  );

  let baseColor = COLORS[compType] || COLORS.PIPE;
  if (colorMode === 'stress') {
     // fallback if stress data missing
     baseColor = COLORS[compType] || COLORS.PIPE;
  }
  const color = isSelected ? '#ffa500' : (hovered ? '#ffffff' : baseColor);

  // Dynamic radius based on segment OD if available, otherwise fallback to 80
  const radius = segmentData?.od_in ? (segmentData.od_in * 25.4) / 2 : 80;

  return (
    <group position={mid} quaternion={quaternion}>
      <mesh
        userData={{ isSegment: true, id }}
        onClick={(e) => {
          e.stopPropagation();
          if (activeTool === 'anchor') {
              if (e.point) splitSegmentAtPoint(id, e.point);
          } else {
              toggleSegmentSelection(id, e.shiftKey || e.ctrlKey || e.metaKey);
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          if (activeTool === 'anchor') document.body.style.cursor = 'crosshair';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          if (activeTool === 'anchor') document.body.style.cursor = 'default';
        }}
      >
        <cylinderGeometry args={[radius, radius, length, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {isSelected && (
        <Html position={[0, 0, radius + 50]} center zIndexRange={[100, 0]}>
          <div style={{ color: '#fff', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            L={(length_in * 25.4).toFixed(0)}mm ({length_in.toFixed(1)}in)
          </div>
        </Html>
      )}
    </group>
  );
};
