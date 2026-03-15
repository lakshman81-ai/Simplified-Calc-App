import React, { useState, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { usePipeRackStore } from '../store/usePipeRackStore';

const scale = 0.01;

const InteractionManager = ({ layout, activeId, setActiveId, setGhostData }) => {
    const { camera, raycaster, pointer } = useThree();
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

    // Create an invisible plane covering the view to catch pointer move globally
    return (
        <mesh
            position={[0, 0, 0]}
            onPointerMove={(e) => {
                if (activeId) {
                    e.stopPropagation();
                    raycaster.setFromCamera(pointer, camera);
                    const target = new THREE.Vector3();
                    raycaster.ray.intersectPlane(plane, target);

                    const rawX_mm = target.x / scale;
                    const snappedX = Math.round(rawX_mm / 50) * 50;

                    const activePipe = layout.find(l => l.id === activeId);
                    if (!activePipe) return;

                    // Nearest neighbor in SAME TIER
                    const sameTierPipes = layout.filter(l => l.tier === activePipe.tier && l.id !== activeId && !l.isFutureSlot);
                    let nearestNeighbor = null;
                    let minDistance = Infinity;

                    sameTierPipes.forEach(p => {
                        const dist = Math.abs(snappedX - p.x_mm);
                        if (dist < minDistance) {
                            minDistance = dist;
                            nearestNeighbor = p;
                        }
                    });

                    // Calculate required spacing (S_pipe) between active and neighbor
                    let s_required = null;
                    if (nearestNeighbor) {
                        const active_ins = activePipe.insulationThk * 25.4;
                        const active_od = activePipe.OD_in * 25.4;
                        const active_flg = activePipe.flgRad_in * 25.4;

                        const neigh_ins = nearestNeighbor.insulationThk * 25.4;
                        const neigh_od = nearestNeighbor.OD_in * 25.4;
                        const neigh_flg = nearestNeighbor.flgRad_in * 25.4;

                        const physGap = (active_od/2) + active_ins + (neigh_od/2) + neigh_ins;
                        const flgAllow = (activePipe.stagger && nearestNeighbor.stagger) ? Math.max(active_flg, neigh_flg) : (active_flg + neigh_flg);
                        const bowing = Math.max(activePipe.delta_in, nearestNeighbor.delta_in) * 25.4 * 0.15;
                        const standardGap = 75;

                        s_required = physGap + flgAllow + bowing + standardGap;
                    }

                    setGhostData({
                        x_mm: snappedX,
                        y_mm: activePipe.y_mm,
                        neighbor: nearestNeighbor,
                        distance_mm: nearestNeighbor ? minDistance : null,
                        s_required: s_required
                    });
                }
            }}
            onPointerUp={(e) => {
                if (activeId) {
                    e.stopPropagation();
                    setActiveId(null);
                    setGhostData(null);
                }
            }}
            onPointerOut={() => {
                if (activeId) {
                    setActiveId(null);
                    setGhostData(null);
                }
            }}
        >
            <planeGeometry args={[1000, 1000]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
    );
};

const PipeCrossSection = ({ line, layout, onStartDrag }) => {
    const OD = line.OD_in * 25.4;
    const ins = line.insulationThk * 25.4;

    // Position
    const [hovered, setHover] = useState(false);
    const x = line.x_mm * scale;
    const y = line.y_mm * scale;

    const baseColor = line.tier === 3 ? '#ef4444' : (line.tier === 2 ? '#3b82f6' : '#10b981');

    return (
        <group
            position={[x, y + ((OD/2) + ins) * scale + 1, 0]} // Position it sitting ON the beam (beam is at y, so add radius + insulation to y)
            onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'grab'; }}
            onPointerOut={() => { setHover(false); document.body.style.cursor = 'default'; }}
            onPointerDown={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'grabbing';
                onStartDrag(line.id);
            }}
        >
            {/* Core Pipe */}
            <mesh>
                <circleGeometry args={[(OD / 2) * scale, 32]} />
                <meshStandardMaterial color={hovered ? '#facc15' : baseColor} roughness={0.4} metalness={0.6} side={THREE.DoubleSide} />
            </mesh>

            {/* Insulation Ring */}
            {ins > 0 && (
                <mesh position={[0, 0, -0.1]}>
                    <ringGeometry args={[(OD / 2) * scale, ((OD / 2) + ins) * scale, 32]} />
                    <meshStandardMaterial color="#cbd5e1" opacity={0.3} transparent side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Label */}
            <Html center position={[0, -((OD / 2) * scale + 1), 0]}>
                <div style={{ color: '#fff', fontSize: '10px', background: hovered ? '#facc15' : 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', userSelect: 'none', transition: 'background 0.2s' }}>
                    <span style={{ fontWeight: 'bold', color: hovered ? '#000' : '#38bdf8' }}>{line.id}</span>
                    <br />
                    <span style={{ fontSize: '9px', color: hovered ? '#333' : '#94a3b8' }}>{line.sizeNps}" {line.service.split('-')[0]}</span>
                </div>
            </Html>
        </group>
    );
};

export default function SectionCanvas({ layout, width_mm, tiers }) {
    const { setPipeManualPosition, pushLog } = usePipeRackStore();

    // Interaction State
    const [activeId, setActiveId] = useState(null);
    const [ghostData, setGhostData] = useState(null);


    if (!layout || layout.length === 0) return null;


    // We calculate camera limits to tightly frame the bent structure
    const topY = layout[layout.length - 1]?.y_mm * scale || 150;

    const handleStartDrag = (id) => {
        setActiveId(id);
        const pipe = layout.find(l => l.id === id);
        if (pipe) {
            setGhostData({ x_mm: pipe.x_mm, y_mm: pipe.y_mm, neighbor: null, distance_mm: null });
        }
    };


    const activePipeData = activeId ? layout.find(l => l.id === activeId) : null;

    // A wrapping handler to finalize drag
    const finalizeDrag = () => {
        if (activeId && ghostData) {
            setPipeManualPosition(activeId, ghostData.x_mm);

            // Check spacing violation
            let spacingLog = '';
            if (ghostData.neighbor && ghostData.distance_mm < ghostData.s_required) {
                pushLog(`[WARN] ${activeId} spacing violation with ${ghostData.neighbor.id}. Gap: ${ghostData.distance_mm.toFixed(0)}mm (Req: ${ghostData.s_required.toFixed(0)}mm)`);
            } else if (ghostData.neighbor) {
                spacingLog = `, gap to neighbor=${ghostData.distance_mm.toFixed(0)}mm`;
            }

            pushLog(`[DRAG] ${activeId} placed at X=${ghostData.x_mm}mm${spacingLog}`);

            if (activePipeData && activePipeData.hasVessel) {
                const { R_mm, T_mm, r_n_mm } = activePipeData.vesselData;
                const K = (r_n_mm * T_mm * 126 * 1000) / Math.sqrt(R_mm * T_mm);
                const interactionRatio = (3.0 * r_n_mm * 3000 + 1.5 * 1200000 + 1.15 * Math.sqrt(r_n_mm / 10) * 500000) / (Math.PI * K);
                pushLog(`[MIST] ${activeId}: K=${K.toFixed(0)}, IR=${interactionRatio.toFixed(3)} → ${interactionRatio <= 1.0 ? 'PASS ✓' : 'FAIL ✗'}`);
            }

            setActiveId(null);
            setGhostData(null);
            document.body.style.cursor = 'default';
        }
    };

    return (
        <Canvas orthographic camera={{ position: [0, topY / 2, 200], zoom: 15, near: 0.1, far: 1000 }}>
            <color attach="background" args={['#020617']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[100, 200, 100]} intensity={1.5} castShadow />
            <OrbitControls target={[0, topY / 2, 0]} enableRotate={false} />

            <InteractionManager layout={layout} activeId={activeId} setActiveId={finalizeDrag} setGhostData={setGhostData} />

            {/* Render Ground */}
            {(() => {
                const { structuralSettings } = usePipeRackStore.getState();
                // If width_mm is present from the layout (the total width including pipes), use it.
                // Otherwise fallback to 5000.
                const w_mm = width_mm || 5000;
                const beamW = w_mm * scale;
                return (
                    <gridHelper args={[beamW * 2, 20]} position={[0, 0, 0]} material-color="#1e293b" />
                );
            })()}

            <group position={[0, 0, 0]}>
                {/* Ground Footer Beam */}
                {(() => {
                    const w_mm = width_mm || 5000;
                    const beamW = w_mm * scale;
                    return (
                        <mesh position={[0, -0.5, 0]}>
                            <boxGeometry args={[beamW + 10, 1, 10]} />
                            <meshStandardMaterial color="#334155" />
                        </mesh>
                    );
                })()}

                {/* Render Transverse Beams per Tier */}
                {Object.keys(tiers).map((tierNum) => {
                    // Always calculate y based on formula from store: minClearanceGrade_mm + ((tierNum - 1) * tierGap_mm)
                    const { structuralSettings } = usePipeRackStore.getState();
                    const y_mm = structuralSettings.minClearanceGrade_mm + ((Number(tierNum) - 1) * structuralSettings.tierGap_mm);
                    const y = y_mm * scale;
                    const w_mm = width_mm || 5000;
                    const beamW = w_mm * scale;

                    return (
                        <group key={`tier-group-${tierNum}`}>
                            <mesh position={[0, y, 0]}>
                                <boxGeometry args={[beamW + 10, 2, 10]} />
                                <meshStandardMaterial color="#64748b" />
                            </mesh>
                            <Html key={`tier-label-${tierNum}`} position={[-(beamW/2) - 4, y, 0]} center>
                                <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', background: '#0f172a', padding: '4px', border: '1px solid #334155', minWidth: '40px', textAlign: 'center' }}>
                                    T{tierNum}<br/><span style={{fontSize: '9px'}}>+{(y_mm / 1000).toFixed(3)}m</span>
                                </div>
                            </Html>
                        </group>
                    );
                })}

                {/* Render Vertical Columns */}
                {(() => {
                    const w_mm = width_mm || 5000;
                    const beamW = w_mm * scale;
                    return (
                        <>
                            <mesh position={[-(beamW/2), topY / 2, 0]}>
                                <boxGeometry args={[2, topY + 10, 10]} />
                                <meshStandardMaterial color="#64748b" />
                            </mesh>
                            <mesh position={[(beamW/2), topY / 2, 0]}>
                                <boxGeometry args={[2, topY + 10, 10]} />
                                <meshStandardMaterial color="#64748b" />
                            </mesh>
                        </>
                    );
                })()}
            </group>

            {/* Render Pipes and Future Slots */}
            {layout.map((line) => {
                if (line.isFutureSlot) {
                    return (
                        <mesh key={`future-${line.id}`} position={[line.x_mm * scale, line.y_mm * scale, 0]}>
                            <planeGeometry args={[line.gapWidth_mm * scale, 20 * scale]} />
                            <meshStandardMaterial color="#1e3a5f" wireframe opacity={0.5} transparent />
                            <Html key={`html-future-${line.id}`} center position={[0, 0, 0]}>
                                <div style={{ color: '#38bdf8', fontSize: '9px', fontWeight: 'bold', textShadow: '0px 0px 4px #000' }}>FUTURE SPACE<br/>({line.gapWidth_mm}mm)</div>
                            </Html>
                        </mesh>
                    );
                }

                // Dim the active pipe
                if (line.id === activeId) {
                    const ins = line.insulationThk * 25.4;
                    const r = (line.OD_in * 25.4 / 2);
                    return (
                        <group key={line.id} position={[line.x_mm * scale, line.y_mm * scale + (r + ins) * scale + 1, 0]}>
                             <mesh>
                                <circleGeometry args={[r * scale, 32]} />
                                <meshStandardMaterial color="#334155" opacity={0.5} transparent side={THREE.DoubleSide} />
                            </mesh>
                        </group>
                    );
                }

                return <PipeCrossSection key={line.id} line={line} layout={layout} onStartDrag={handleStartDrag} />;
            })}

            {/* Render Ghost Overlay for Dragging */}
            {activeId && ghostData && activePipeData && (
                <group>
                    {(() => {
                        const ins = activePipeData.insulationThk * 25.4;
                        const r = (activePipeData.OD_in * 25.4 / 2);
                        return (
                            <mesh position={[ghostData.x_mm * scale, ghostData.y_mm * scale + (r + ins) * scale + 1, 0]}>
                                <circleGeometry args={[r * scale, 32]} />
                                <meshStandardMaterial color="#facc15" wireframe opacity={0.8} transparent side={THREE.DoubleSide} />
                            </mesh>
                        );
                    })()}

                    {/* Dimension Line to Nearest Neighbor */}
                    {ghostData.neighbor && (() => {
                        const isViolation = ghostData.distance_mm < ghostData.s_required;
                        const color = isViolation ? '#ef4444' : '#0ea5e9';

                        return (
                            <group>
                                <Line
                                    points={[[ghostData.x_mm * scale, ghostData.y_mm * scale, 0], [ghostData.neighbor.x_mm * scale, ghostData.neighbor.y_mm * scale, 0]]}
                                    color={color}
                                    lineWidth={2}
                                />
                                {/* Tick Marks */}
                                <Line points={[[ghostData.x_mm * scale, (ghostData.y_mm - 50) * scale, 0], [ghostData.x_mm * scale, (ghostData.y_mm + 50) * scale, 0]]} color={color} />
                                <Line points={[[ghostData.neighbor.x_mm * scale, (ghostData.neighbor.y_mm - 50) * scale, 0], [ghostData.neighbor.x_mm * scale, (ghostData.neighbor.y_mm + 50) * scale, 0]]} color={color} />

                                {/* Gap Text Label */}
                                <Html position={[((ghostData.x_mm + ghostData.neighbor.x_mm) / 2) * scale, (ghostData.y_mm + 100) * scale, 0]} center>
                                    <div style={{ background: '#0f172a', border: `1px solid ${color}`, color: color, fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                        {ghostData.distance_mm.toFixed(0)}mm
                                    </div>
                                </Html>
                            </group>
                        );
                    })()}
                </group>
            )}

        </Canvas>
    );
}
