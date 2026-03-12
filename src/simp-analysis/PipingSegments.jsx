import React, { useMemo } from 'react';
import { useSimpStore } from './store';
import { Vector3, CylinderGeometry, MeshStandardMaterial, Mesh, Quaternion } from 'three';
import { Html } from '@react-three/drei';

export const PipingSegments = () => {
  const nodes = useSimpStore(state => state.nodes);
  const segments = useSimpStore(state => state.segments);
  const stats = useSimpStore(state => state.stats);

  const segmentsData = useMemo(() => {
    return segments.map((seg, i) => {
      if (!nodes[seg.start] || !nodes[seg.end]) return null;
      const p1 = new Vector3(...nodes[seg.start].pos);
      const p2 = new Vector3(...nodes[seg.end].pos);
      const vec = p2.clone().sub(p1);
      const dist = vec.length();
      const pos = p1.clone().add(p2).divideScalar(2);
      
      // Calculate rotation. Cylinder naturally goes along Y axis.
      // We want it to point along 'vec'.
      const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), vec.clone().normalize());
      
      const isGenerator = i === 0;
      const isAbsorber = i === 1;
      let color = 'gray';
      
      if (stats.ratio > 0) {
        if (isAbsorber) color = stats.ratio <= 1.0 ? 'green' : 'red';
        else if (isGenerator) color = '#aaffaa'; // Light green for generator leg
      }

      return { key: `seg-${i}`, dist, pos, quaternion, color, isAbsorber, statsReq: stats.Lreq };
    }).filter(Boolean);
  }, [nodes, segments, stats.ratio, stats.Lreq]);

  return (
    <group>
      {segmentsData.map(({ key, dist, pos, quaternion, color, isAbsorber, statsReq }) => (
        <mesh key={key} position={pos} quaternion={quaternion}>
          <cylinderGeometry args={[100, 100, dist, 16]} />
          <meshStandardMaterial color={color} />
          <Html position={[0, 200, 0]} center zIndexRange={[100, 0]}>
            <div style={{color: 'white', background: 'rgba(0,0,0,0.8)', padding: '2px 5px', fontSize: '10px'}}>
              L={dist.toFixed(1)}mm {isAbsorber && statsReq > 0 && `(Req: ${statsReq.toFixed(1)}mm)`}
            </div>
          </Html>
        </mesh>
      ))}
    </group>
  );
};
