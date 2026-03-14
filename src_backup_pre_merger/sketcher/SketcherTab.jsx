import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { useSketchStore } from './SketcherStore';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, PerspectiveCamera, OrbitControls, Grid } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MousePointer2, PenTool, Triangle, Axis3D, DownloadCloud, UploadCloud, Trash2 } from 'lucide-react';

const SketcherToolbar = () => {
    const { activeTool, setActiveTool, workingPlane, setWorkingPlane, importFromComponents, exportToComponents, clearSketch } = useSketchStore();
    const appComponents = useAppStore(s => s.components);
    const setAppComponents = useAppStore(s => s.setComponents);
    const setActiveTab = useAppStore(s => s.setActiveTab);

    const handleImport = () => {
        if (appComponents.length === 0) {
            alert("No geometry in 3D Viewer to import.");
            return;
        }
        importFromComponents(appComponents);
    };

    const handleSync = () => {
        const newComps = exportToComponents();
        if (newComps.length > 0) {
            setAppComponents(newComps);
            alert("Successfully synchronized graph to 3D Viewer!");
            setActiveTab('viewer');
        } else {
            alert("Graph is empty, nothing to sync.");
        }
    };

    const btnStyle = (active) => ({
        padding: '8px',
        background: active ? '#3b82f6' : '#1e293b',
        color: active ? '#fff' : '#cbd5e1',
        border: '1px solid #334155',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    return (
        <div style={{ width: '50px', background: '#0f172a', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', padding: '8px', gap: '8px', alignItems: 'center' }}>
            <button title="Select" style={btnStyle(activeTool === 'select')} onClick={() => setActiveTool('select')}>
                <MousePointer2 size={18} />
            </button>
            <button title="Draw Pipe" style={btnStyle(activeTool === 'draw_pipe')} onClick={() => setActiveTool('draw_pipe')}>
                <PenTool size={18} />
            </button>
            <button title="Add Node/Anchor" style={btnStyle(activeTool === 'add_node')} onClick={() => setActiveTool('add_node')}>
                <Triangle size={18} />
            </button>
<<<<<<< Updated upstream

            <div style={{ height: '1px', background: '#334155', width: '100%', margin: '4px 0' }} />

=======

            <div style={{ height: '1px', background: '#334155', width: '100%', margin: '4px 0' }} />

>>>>>>> Stashed changes
            <button title="Working Plane" style={btnStyle(false)} onClick={() => setWorkingPlane(workingPlane === 'XY' ? 'XZ' : 'XY')}>
                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{workingPlane}</span>
            </button>

            <div style={{ flex: 1 }} />

            <button title="Clear Sketch" style={btnStyle(false)} onClick={() => { if(window.confirm('Clear sketch?')) clearSketch(); }}>
                <Trash2 size={18} color="#ef4444" />
            </button>
            <button title="Pull from 3D Viewer" style={btnStyle(false)} onClick={handleImport}>
                <DownloadCloud size={18} color="#10b981" />
            </button>
            <button title="Sync to 3D Viewer" style={btnStyle(false)} onClick={handleSync}>
                <UploadCloud size={18} color="#3b82f6" />
            </button>
        </div>
    );
};

// Interactive Plane for catching clicks in 2D View
const InteractivePlane = () => {
    const { activeTool, workingPlane, setDraftingState, draftingState, createNode, createSegment, resolve3DPoint, snapNodeId, nodes } = useSketchStore();
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
    // Rotate the invisible plane to match the working plane
    let rotation = [0, 0, 0];
    if (workingPlane === 'XZ') rotation = [-Math.PI/2, 0, 0];
    if (workingPlane === 'YZ') rotation = [0, Math.PI/2, 0];

    const handlePointerMove = (e) => {
        if (draftingState.isDrawing) {
            // If snapped, use the exact node position for phantom visual, else use plane pos
            if (snapNodeId && nodes[snapNodeId]) {
                const n = nodes[snapNodeId];
                setDraftingState({ currentPos: new THREE.Vector3(...n.pos) });
            } else {
                setDraftingState({ currentPos: e.point });
            }
        }
    };

    const handleClick = (e) => {
        e.stopPropagation();
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
        let targetId = null;
        let pt3D;

        if (snapNodeId && nodes[snapNodeId]) {
            // OSNAP logic: User clicked while hovered over an existing node
            targetId = snapNodeId;
            pt3D = nodes[snapNodeId].pos; // use exact coordinate
        } else {
            // User clicked on the grid, resolve new 3D coordinate
            pt3D = resolve3DPoint(e.point);
        }

        if (activeTool === 'add_node') {
            if (!targetId) createNode(pt3D, 'anchor');
            else {
                // Future: convert free node to anchor
            }
<<<<<<< Updated upstream
        }
=======
        }
>>>>>>> Stashed changes
        else if (activeTool === 'draw_pipe') {
            if (!draftingState.isDrawing) {
                // First click: start drawing
                const startId = targetId || createNode(pt3D, 'free');
                setDraftingState({ isDrawing: true, startNodeId: startId, currentPos: new THREE.Vector3(...(targetId ? pt3D : resolve3DPoint(e.point))) });
            } else {
                // Second click: end drawing, create segment, continue from new node
                // Do not allow zero length segments (clicking on start node)
                if (targetId && targetId === draftingState.startNodeId) return;

                const endId = targetId || createNode(pt3D, 'free');
                createSegment(draftingState.startNodeId, endId, { type: 'PIPE', bore: 100, material: 'CARBON STEEL' });
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
                // Continue drawing from the new end node
                const nextPos = targetId ? new THREE.Vector3(...pt3D) : new THREE.Vector3(...resolve3DPoint(e.point));
                setDraftingState({ startNodeId: endId, currentPos: nextPos });
            }
        }
    };

    // Right click or Escape to cancel drawing
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && draftingState.isDrawing) {
                setDraftingState({ isDrawing: false, startNodeId: null, currentPos: null });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [draftingState.isDrawing, setDraftingState]);

    return (
<<<<<<< Updated upstream
        <mesh
            rotation={rotation}
            visible={false}
=======
        <mesh
            rotation={rotation}
            visible={false}
>>>>>>> Stashed changes
            onPointerMove={handlePointerMove}
            onClick={handleClick}
            onContextMenu={(e) => {
                e.stopPropagation();
                if (draftingState.isDrawing) {
                    setDraftingState({ isDrawing: false, startNodeId: null, currentPos: null });
                }
            }}
        >
            <planeGeometry args={[100000, 100000]} />
            <meshBasicMaterial side={THREE.DoubleSide} />
        </mesh>
    );
};

// AutoCenter bounds for the 3D Verification View
const VerificationViewBounds = () => {
    const { camera, controls } = useThree();
    const nodes = useSketchStore(s => s.nodes);
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
    useEffect(() => {
        const nodeValues = Object.values(nodes);
        if (nodeValues.length === 0) return;

        const box = new THREE.Box3();
        nodeValues.forEach(n => {
            box.expandByPoint(new THREE.Vector3(...n.pos));
        });

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const safeMaxDim = maxDim === 0 ? 1000 : maxDim;

        const fov = camera.fov * (Math.PI / 180);
        const boundingSphereRadius = (safeMaxDim / 2) * Math.sqrt(3);
        let targetDistance = (boundingSphereRadius * 1.2) / Math.sin(fov / 2);
<<<<<<< Updated upstream
        targetDistance = Math.max(targetDistance, 1000);

        const offset = Math.sqrt((targetDistance * targetDistance) / 3);
        camera.position.set(center.x + offset, center.y + offset, center.z + offset);

=======
        targetDistance = Math.max(targetDistance, 1000);

        const offset = Math.sqrt((targetDistance * targetDistance) / 3);
        camera.position.set(center.x + offset, center.y + offset, center.z + offset);

>>>>>>> Stashed changes
        camera.near = 1;
        camera.far = targetDistance * 100;
        camera.updateProjectionMatrix();

        if (controls) {
            controls.target.copy(center);
            controls.update();
        }
    }, [nodes, camera, controls]);

    return null;
};

// Abstract rendering of the graph
const GraphRenderer = ({ is3D }) => {
    const nodes = useSketchStore(s => s.nodes);
    const segments = useSketchStore(s => s.segments);
    const draftingState = useSketchStore(s => s.draftingState);
    const setSnapNodeId = useSketchStore(s => s.setSnapNodeId);
    const snapNodeId = useSketchStore(s => s.snapNodeId);

    return (
        <group>
            {Object.entries(nodes).map(([id, node]) => (
<<<<<<< Updated upstream
                <mesh
                    key={id}
=======
                <mesh
                    key={id}
>>>>>>> Stashed changes
                    position={node.pos}
                    onPointerEnter={(e) => { e.stopPropagation(); setSnapNodeId(id); }}
                    onPointerLeave={(e) => { e.stopPropagation(); if (snapNodeId === id) setSnapNodeId(null); }}
                >
                    <sphereGeometry args={[is3D ? 100 : (snapNodeId === id ? 80 : 50), 16, 16]} />
                    <meshBasicMaterial color={snapNodeId === id ? '#ef4444' : (node.type === 'anchor' ? '#1e90ff' : '#ffa500')} />
                </mesh>
            ))}
            {segments.map(seg => {
                const n1 = nodes[seg.startNode];
                const n2 = nodes[seg.endNode];
                if (!n1 || !n2) return null;
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
                const startVec = new THREE.Vector3(...n1.pos);
                const endVec = new THREE.Vector3(...n2.pos);
                const diff = endVec.clone().sub(startVec);
                const length = diff.length();
                if (length < 1) return null; // prevent zero-length errors
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
                const mid = startVec.clone().add(diff.clone().multiplyScalar(0.5));
                const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.normalize());

                return (
                    <mesh key={seg.id} position={mid} quaternion={quaternion}>
                        <cylinderGeometry args={[is3D ? (seg.properties?.bore || 100)/2 : 20, is3D ? (seg.properties?.bore || 100)/2 : 20, length, 8]} />
                        <meshBasicMaterial color={seg.properties?.type === 'FITTING_LEG' ? '#32cd32' : '#94a3b8'} wireframe={!is3D} />
                    </mesh>
                );
            })}
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
            {/* Phantom Drawing Segment */}
            {!is3D && draftingState.isDrawing && draftingState.startNodeId && draftingState.currentPos && (
                <PhantomSegment startPos={nodes[draftingState.startNodeId].pos} endPos={useSketchStore.getState().resolve3DPoint(draftingState.currentPos)} />
            )}
        </group>
    );
};

const PhantomSegment = ({ startPos, endPos }) => {
    const startVec = new THREE.Vector3(...startPos);
    const endVec = new THREE.Vector3(...endPos);
    const diff = endVec.clone().sub(startVec);
    const length = diff.length();
    if (length < 1) return null;

    const mid = startVec.clone().add(diff.clone().multiplyScalar(0.5));
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.normalize());

    return (
        <mesh position={mid} quaternion={quaternion}>
            <cylinderGeometry args={[20, 20, length, 8]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
    );
};

export const SketcherTab = () => {
    const workingPlane = useSketchStore(s => s.workingPlane);
    const activeTool = useSketchStore(s => s.activeTool);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', height: 'calc(100vh - 48px)', background: '#0f172a' }}>
            <SketcherToolbar />

            {/* Main 2D Canvas */}
            <div style={{ flex: 1, position: 'relative' }}>
                {/* Mode Indicator */}
                <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, background: 'rgba(15, 23, 42, 0.8)', padding: '6px 12px', borderRadius: '4px', border: '1px solid #334155', color: '#f8fafc', fontSize: '14px', fontWeight: 'bold' }}>
                    2D Orthographic Mode: {workingPlane} Plane | Tool: {activeTool.replace('_', ' ').toUpperCase()}
                </div>

                <Canvas style={{ cursor: activeTool !== 'select' ? 'crosshair' : 'default' }}>
<<<<<<< Updated upstream
                    <OrthographicCamera
                        makeDefault
                        position={workingPlane === 'XY' ? [0, 0, 10000] : (workingPlane === 'XZ' ? [0, 10000, 0] : [10000, 0, 0])}
                        zoom={0.2}
                        near={-100000} far={100000}
=======
                    <OrthographicCamera
                        makeDefault
                        position={workingPlane === 'XY' ? [0, 0, 10000] : (workingPlane === 'XZ' ? [0, 10000, 0] : [10000, 0, 0])}
                        zoom={0.2}
                        near={-100000} far={100000}
>>>>>>> Stashed changes
                    />
                    <OrbitControls makeDefault enableRotate={false} />
                    <Grid position={[0, 0, 0]} args={[50000, 50000]} sectionSize={1000} cellColor="#1e293b" sectionColor="#334155" fadeDistance={30000} rotation={workingPlane === 'XY' ? [Math.PI/2, 0, 0] : (workingPlane === 'XZ' ? [0, 0, 0] : [0, 0, Math.PI/2])} />
                    <InteractivePlane />
                    <GraphRenderer is3D={false} />
                </Canvas>

                {/* PiP 3D Container (Top Right) */}
<<<<<<< Updated upstream
                <div style={{
                    position: 'absolute', top: 16, right: 16, width: '300px', height: '300px',
                    background: '#1e293b', border: '2px solid #3b82f6', borderRadius: '8px',
                    overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
=======
                <div style={{
                    position: 'absolute', top: 16, right: 16, width: '300px', height: '300px',
                    background: '#1e293b', border: '2px solid #3b82f6', borderRadius: '8px',
                    overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
>>>>>>> Stashed changes
                }}>
                    <div style={{ position: 'absolute', top: 4, left: 8, zIndex: 10, color: '#38bdf8', fontSize: '10px', fontWeight: 'bold', textShadow: '1px 1px 2px black' }}>3D VERIFICATION VIEW</div>
                    <Canvas>
                        <PerspectiveCamera makeDefault position={[5000, 5000, 5000]} fov={50} />
                        <OrbitControls makeDefault />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <VerificationViewBounds />
                        <GraphRenderer is3D={true} />
                    </Canvas>
                </div>
            </div>
        </div>
    );
};

export default SketcherTab;
