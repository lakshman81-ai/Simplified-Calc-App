import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Environment, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { useGC3DStore } from './GC3DStore';
import { GC3DNodeMesh } from './GC3DNodeMesh';
import { GC3DSegmentMesh } from './GC3DSegmentMesh';

const SceneBounds = () => {
  const { camera, controls, scene } = useThree();
  const segments = useGC3DStore(s => s.segments);
  const nodes = useGC3DStore(s => s.nodes);

  useEffect(() => {
    if (segments.length === 0 || !nodes || Object.keys(nodes).length === 0) return;

    const timer = setTimeout(() => {
      const box = new THREE.Box3().setFromObject(scene);
      if (box.isEmpty()) return;

      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      // Simple perspective fit
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5; // padding

      // Set position isometric-ish to center
      camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
      camera.near = maxDim / 100;
      camera.far = maxDim * 100;
      camera.updateProjectionMatrix();

      if (controls) {
        controls.target.copy(center);
        controls.update();
      }
      camera.lookAt(center);
    }, 100);

    return () => clearTimeout(timer);
  }, [segments, nodes, camera, controls, scene]);

  return null;
};

export const GC3DCanvas = () => {
  const segments = useGC3DStore(s => s.segments);
  const nodes = useGC3DStore(s => s.nodes);

  return (
    <div style={{ flex: 1, position: 'relative', background: '#0f172a' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[5000, 5000, 5000]} fov={50} />
        <OrbitControls makeDefault />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Grid position={[0, -500, 0]} args={[50000, 50000]} sectionSize={1000} cellColor="#1e293b" sectionColor="#334155" fadeDistance={30000} />

        {/* Adds navigation axes at bottom right */}
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
        </GizmoHelper>

        <Suspense fallback={null}>
          <group>
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
          </group>
          <SceneBounds />
        </Suspense>
      </Canvas>
    </div>
  );
};
