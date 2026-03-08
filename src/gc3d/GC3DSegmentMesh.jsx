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
  const selectedSegmentId = useGC3DStore(s => s.selectedSegmentId);
  const setSelectedSegment = useGC3DStore(s => s.setSelectedSegment);
  const isSelected = selectedSegmentId === id;

  const startVec = new THREE.Vector3(...startPos);
  const endVec = new THREE.Vector3(...endPos);
  const diff = new THREE.Vector3().subVectors(endVec, startVec);
  const length = diff.length();
  const mid = startVec.clone().add(diff.clone().multiplyScalar(0.5));

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    diff.clone().normalize()
  );

  const baseColor = COLORS[compType] || COLORS.PIPE;
  const color = isSelected ? '#ffa500' : (hovered ? '#ffffff' : baseColor);

  return (
    <group position={mid} quaternion={quaternion}>
      <mesh
        onClick={(e) => { e.stopPropagation(); setSelectedSegment(id); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[80, 80, length, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {isSelected && (
        <Html position={[0, 0, 150]} center>
          <div style={{ color: '#fff', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', pointerEvents: 'none' }}>
            L={(length_in * 25.4).toFixed(0)}mm ({length_in.toFixed(1)}in)
          </div>
        </Html>
      )}
    </group>
  );
};
