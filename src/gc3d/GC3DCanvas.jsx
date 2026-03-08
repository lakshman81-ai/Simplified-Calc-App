import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, OrthographicCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGC3DStore } from './GC3DStore';
import { GC3DNodeMesh } from './GC3DNodeMesh';
import { GC3DSegmentMesh } from './GC3DSegmentMesh';

const SceneBounds = ({ segments, nodes }) => {
  const { camera, controls } = useThree();
  useEffect(() => {
    if (segments.length === 0 || !nodes || Object.keys(nodes).length === 0) return;
    const box = new THREE.Box3();
    Object.values(nodes).forEach(n => {
      box.expandByPoint(new THREE.Vector3(...n.pos));
    });
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Using mutable properties to satisfy React lifecycle rules properly
    camera.left = -maxDim;
    camera.right = maxDim;
    camera.top = maxDim;
    camera.bottom = -maxDim;
    camera.updateProjectionMatrix();

    if (controls) {
      controls.target.copy(center);
      controls.update();
    }
  }, [segments, nodes, camera, controls]);
  return null;
};

export const GC3DCanvas = () => {
  const segments = useGC3DStore(s => s.segments);
  const nodes = useGC3DStore(s => s.nodes);

  return (
    <div style={{ flex: 1, position: 'relative', background: '#0f172a' }}>
      <Canvas>
        <OrthographicCamera makeDefault position={[5000, 5000, 5000]} zoom={0.5} near={-10000} far={10000} />
        <OrbitControls makeDefault />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Grid args={[10000, 10000]} sectionSize={1000} cellColor="#1e293b" sectionColor="#334155" fadeDistance={30000} />
        <axesHelper args={[2000]} />
        <Suspense fallback={null}>
          {Object.entries(nodes).map(([id, n]) => (
            <GC3DNodeMesh key={id} id={id} pos={n.pos} type={n.type} label={n.label} />
          ))}
          {segments.map(s => {
            const startNode = nodes[s.startNode];
            const endNode = nodes[s.endNode];
            if (!startNode || !endNode) return null;
            return (
              <GC3DSegmentMesh
                key={s.id}
                id={s.id}
                startPos={startNode.pos}
                endPos={endNode.pos}
                compType={s.compType}
                length_in={s.length_in}
              />
            );
          })}
          <SceneBounds segments={segments} nodes={nodes} />
        </Suspense>
      </Canvas>
    </div>
  );
};
