import React, { useRef, useState } from 'react';
import { useSimpStore } from './store';
import { Html, TransformControls } from '@react-three/drei';

const NodeDraggable = ({ id, node, plane }) => {
  const moveNode = useSimpStore(state => state.moveNode);
  const setOrbitEnabled = useSimpStore(state => state.setOrbitEnabled);
  const recalc = useSimpStore(state => state.recalc);

  const meshRef = useRef();
  const [active, setActive] = useState(false);

  // Determine which axes to lock based on the current active plane
  const showX = plane === 'XY' || plane === 'XZ';
  const showY = plane === 'XY' || plane === 'YZ';
  const showZ = plane === 'XZ' || plane === 'YZ';

  return (
    <TransformControls
      object={meshRef}
      mode="translate"
      showX={showX}
      showY={showY}
      showZ={showZ}
      onDraggingChanged={(e) => {
        setOrbitEnabled(!e.value);
        setActive(e.value);
        if (!e.value && meshRef.current) {
          // Explicitly recalculate at end of drag
          recalc();
        }
      }}
      onChange={() => {
        if (meshRef.current) {
          const { x, y, z } = meshRef.current.position;

          // Apply active plane constraints
          let finalX = showX ? x : node.pos[0];
          let finalY = showY ? y : node.pos[1];
          let finalZ = showZ ? z : node.pos[2];

          // Snapping 100mm
          finalX = Math.round(finalX / 100) * 100;
          finalY = Math.round(finalY / 100) * 100;
          finalZ = Math.round(finalZ / 100) * 100;

          // Only mutate state if the position actually changed to prevent infinite loops
          if (finalX !== node.pos[0] || finalY !== node.pos[1] || finalZ !== node.pos[2]) {
            moveNode(id, [finalX, finalY, finalZ]);
          }
        }
      }}
    >
      <mesh ref={meshRef} position={node.pos}>
        <sphereGeometry args={[200, 32, 32]} />
        <meshStandardMaterial color={node.type === 'anchor' ? 'blue' : (active ? 'yellow' : 'orange')} />
        <Html position={[0, 300, 0]} center zIndexRange={[100, 0]}>
          <div style={{color: 'white', background: 'black', padding: '2px 5px', fontSize: '10px'}}>{id}</div>
        </Html>
      </mesh>
    </TransformControls>
  );
};

export const PipingNodes = () => {
  const nodes = useSimpStore(state => state.nodes);
  const plane = useSimpStore(state => state.plane);

  return (
    <group>
      {Object.entries(nodes).map(([id, node]) => (
        <NodeDraggable key={id} id={id} node={node} plane={plane} />
      ))}
    </group>
  );
};
