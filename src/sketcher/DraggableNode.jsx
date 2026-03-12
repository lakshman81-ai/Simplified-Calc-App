import React, { useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useSketchStore } from './SketcherStore';
import * as THREE from 'three';

export const DraggableNode = ({ id, node, is3D }) => {
    // Ensure hooks are called unconditionally
    const { camera } = useThree();
    const updateNode = useSketchStore(s => s.updateNode);
    const workingPlane = useSketchStore(s => s.workingPlane);
    const activeTool = useSketchStore(s => s.activeTool);
    const setSelectedNodeId = useSketchStore(s => s.setSelectedNodeId);
    const snapNodeId = useSketchStore(s => s.snapNodeId);
    const setSnapNodeId = useSketchStore(s => s.setSnapNodeId);
    const selectedItems = useSketchStore(s => s.selectedItems);
    const selectedNodeId = useSketchStore(s => s.selectedNodeId);

    const isSelected = selectedItems.nodes.includes(id) || selectedNodeId === id;

    const [isDragging, setIsDragging] = useState(false);

    const onPointerDown = (e) => {
        if (activeTool !== 'select' || is3D) return;
        e.stopPropagation();
        setSelectedNodeId(id);
        setIsDragging(true);
        e.target.setPointerCapture(e.pointerId);
    };

    const onPointerUp = (e) => {
        if (is3D) return;
        e.stopPropagation();
        setIsDragging(false);
        e.target.releasePointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (!isDragging || activeTool !== 'select' || is3D) return;
        e.stopPropagation();

        // Convert pointer coordinate directly to world space.
        // We use e.pointer which correctly accounts for container offsets.
        const vec = new THREE.Vector3();
        vec.set(
            e.pointer.x,
            e.pointer.y,
            0.5
        );
        vec.unproject(camera);

        const newPos = [...node.pos];

        // Constrain movement strictly to the active working plane
        // E.g., if workingPlane is XY, map Z back to original node.pos[2]
        if (workingPlane === 'XY') {
            newPos[0] = vec.x;
            newPos[1] = vec.y;
        } else if (workingPlane === 'XZ') {
            newPos[0] = vec.x;
            newPos[2] = vec.y; // orthographic mapping
        } else if (workingPlane === 'YZ') {
            newPos[1] = vec.x;
            newPos[2] = vec.y; // orthographic mapping
        }

        updateNode(id, { pos: newPos });
    };

    return (
        <mesh
            position={node.pos}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerMove={onPointerMove}
            onPointerEnter={(e) => { e.stopPropagation(); setSnapNodeId(id); }}
            onPointerLeave={(e) => { e.stopPropagation(); if (snapNodeId === id) setSnapNodeId(null); }}
        >
            <sphereGeometry args={[is3D ? 100 : (snapNodeId === id ? 80 : 50), 16, 16]} />
            <meshBasicMaterial color={isSelected ? '#38bdf8' : (snapNodeId === id ? '#ef4444' : (node.type === 'anchor' ? '#1e90ff' : '#ffa500'))} />
        </mesh>
    );
};
