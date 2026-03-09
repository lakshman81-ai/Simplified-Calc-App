import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, OrthographicCamera, Environment, GizmoHelper, GizmoViewport } from '@react-three/drei';
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

    // Defer the fit calculation slightly to allow React to mount the meshes
    const timer = setTimeout(() => {
      const box = new THREE.Box3().setFromObject(scene);
      if (box.isEmpty()) return;

      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const padding = 1.2;

      const r = (maxDim / 2) * padding;

      // Ensure we don't zoom in infinitely if the object is perfectly flat or small
      const zoom = Math.max(1, 1000 / (r || 1));

      camera.left = -r;
      camera.right = r;
      camera.top = r;
      camera.bottom = -r;
      camera.zoom = 1; // reset zoom and let left/right/top/bottom handle frustum sizing
      camera.updateProjectionMatrix();

      if (controls) {
        controls.target.copy(center);
        controls.update();
      }

      // We also update camera position to look from an isometric view
      camera.position.set(center.x + maxDim, center.y + maxDim, center.z + maxDim);
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
        <OrthographicCamera makeDefault position={[5000, 5000, 5000]} zoom={0.5} near={-100000} far={100000} />
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
