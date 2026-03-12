import React from 'react';
import { useSketchStore } from './SketcherStore';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

import { useThree, useFrame } from '@react-three/fiber';
import { useState } from 'react';

export const SketcherAnnotations = ({ is3D }) => {
    const nodes = useSketchStore(s => s.nodes);
    const segments = useSketchStore(s => s.segments);
    const { camera } = useThree();
    const [zoom, setZoom] = useState(camera.zoom || 0.2);

    useFrame(() => {
        if (!is3D && camera.zoom !== zoom) {
            setZoom(camera.zoom);
        }
    });

    // Font configuration - scale dynamically in 2D
    // Limit font size explosion on deep zoom-out (when zoom is very small)
    const effectiveZoom = Math.max(zoom, 0.05);
    const fontSize = is3D ? 100 : (40 / effectiveZoom);
    const color = '#f8fafc';

    return (
        <group>
            {/* Node Annotations */}
            {Object.entries(nodes).map(([id, node]) => {
                const labelStr = `${id} (${Math.round(node.pos[0])}, ${Math.round(node.pos[1])}, ${Math.round(node.pos[2])})`;
                return (
                    <Text
                        key={`label-${id}`}
                        position={[node.pos[0] + (is3D ? 150 : (50 / effectiveZoom)), node.pos[1] + (is3D ? 150 : (50 / effectiveZoom)), node.pos[2]]}
                        fontSize={fontSize * 0.6}
                        color="#94a3b8"
                        anchorX="left"
                        anchorY="bottom"
                        renderOrder={100}
                        depthTest={false}
                    >
                        {labelStr}
                    </Text>
                );
            })}

            {/* Segment Length Annotations */}
            {segments.map(seg => {
                const n1 = nodes[seg.startNode];
                const n2 = nodes[seg.endNode];
                if (!n1 || !n2) return null;

                const startVec = new THREE.Vector3(...n1.pos);
                const endVec = new THREE.Vector3(...n2.pos);
                const diff = endVec.clone().sub(startVec);
                const length = diff.length();
                if (length < 1) return null;

                const mid = startVec.clone().add(diff.clone().multiplyScalar(0.5));

                // Calculate perpendicular offset vector for placing text
                let offsetVec;
                if (diff.y === 0 && diff.z === 0) { // Along X axis
                     offsetVec = new THREE.Vector3(0, 1, 0);
                } else if (diff.x === 0 && diff.z === 0) { // Along Y axis
                     offsetVec = new THREE.Vector3(1, 0, 0);
                } else { // Generic
                     const tempUp = new THREE.Vector3(0, 1, 0);
                     if (Math.abs(diff.clone().normalize().dot(tempUp)) > 0.99) {
                         offsetVec = new THREE.Vector3(1, 0, 0); // fallback if nearly vertical
                     } else {
                         offsetVec = diff.clone().cross(tempUp).normalize().cross(diff).normalize();
                     }
                }

                const offsetMagnitude = is3D ? 150 : (50 / effectiveZoom);
                mid.add(offsetVec.multiplyScalar(offsetMagnitude));

                return (
                    <Text
                        key={`len-${seg.id}`}
                        position={[mid.x, mid.y, mid.z]}
                        fontSize={fontSize}
                        color={color}
                        anchorX="center"
                        anchorY="middle"
                        renderOrder={100}
                        depthTest={false}
                    >
                        {length.toFixed(1)}
                    </Text>
                );
            })}
        </group>
    );
};

export default SketcherAnnotations;
