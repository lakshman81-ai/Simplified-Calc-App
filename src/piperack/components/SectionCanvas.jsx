import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { usePipeRackStore } from '../store/usePipeRackStore';

const PipeCrossSection = ({ line }) => {
    const OD = line.OD_in * 25.4;
    const ins = line.insulationThk * 25.4;
    const flg = line.flgRad_in * 25.4;

    // We scale the UI rendering down (mm -> scene units)
    const scale = 0.01;

    // Position
    const [hovered, setHover] = useState(false);
    const x = line.x_mm * scale;
    const y = line.y_mm * scale;

    const baseColor = line.tier === 3 ? '#ef4444' : (line.tier === 2 ? '#3b82f6' : '#10b981');

    return (
        <group
           position={[x, y, 0]}
           onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'grab'; }}
           onPointerOut={(e) => { setHover(false); document.body.style.cursor = 'default'; }}
           onPointerDown={(e) => {
               // Future hook for Drag & Drop / Edit Menu (Section 3.4 of report)
               e.stopPropagation();
               console.log(`[DragDrop Placeholder] Selected Pipe ${line.id}. Overrides will dispatch to setPipeXOrder.`);
           }}
        >
            {/* Core Pipe */}
            <mesh>
                <cylinderGeometry args={[(OD / 2) * scale, (OD / 2) * scale, 10, 32]} rotation={[Math.PI/2, 0, 0]} />
                <meshStandardMaterial color={hovered ? '#facc15' : baseColor} roughness={0.4} metalness={0.6} />
            </mesh>

            {/* Insulation Ring */}
            {ins > 0 && (
                <mesh>
                    <cylinderGeometry args={[((OD / 2) + ins) * scale, ((OD / 2) + ins) * scale, 9.8, 32]} rotation={[Math.PI/2, 0, 0]} />
                    <meshStandardMaterial color="#cbd5e1" opacity={0.3} transparent />
                </mesh>
            )}

            {/* Label */}
            <Html center position={[0, -((OD / 2) * scale + 1), 0]}>
                <div style={{ color: '#fff', fontSize: '10px', background: hovered ? '#facc15' : 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', userSelect: 'none', transition: 'background 0.2s' }}>
                    <span style={{ fontWeight: 'bold', color: hovered ? '#000' : '#38bdf8' }}>{line.id}</span>
                    <br/>
                    <span style={{ fontSize: '9px', color: hovered ? '#333' : '#94a3b8' }}>{line.sizeNps}" {line.service.split('-')[0]}</span>
                </div>
            </Html>
        </group>
    );
};

export default function SectionCanvas({ layout, width_mm, tiers }) {
    if (!layout || layout.length === 0) return null;

    const scale = 0.01;
    const w = width_mm * scale;
    const halfW = w / 2;

    // We calculate camera limits to tightly frame the bent structure
    const maxTiers = Object.keys(tiers).length;
    const topY = layout[layout.length - 1]?.y_mm * scale || 150;

    return (
        <Canvas orthographic camera={{ position: [0, topY / 2, 200], zoom: 15, near: 0.1, far: 1000 }}>
            <color attach="background" args={['#020617']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[100, 200, 100]} intensity={1.5} castShadow />
            <OrbitControls enableRotate={false} />

            {/* Render Ground */}
            <gridHelper args={[w * 2, 20]} position={[0, 0, 0]} material-color="#1e293b" />

            <group position={[0, 0, 0]}>
                <mesh position={[0, -0.5, 0]}>
                    <boxGeometry args={[w + 10, 1, 10]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>

                {/* Render Transverse Beams per Tier */}
                {Object.keys(tiers).map((tierNum) => {
                    const tGroup = tiers[tierNum];
                    if (tGroup.length === 0) return null;
                    const y_mm = tGroup[0].y_mm;
                    const y = y_mm * scale;

                    return (
                        <group key={tierNum}>
                            <mesh position={[0, y - 1, 0]}>
                                <boxGeometry args={[w, 2, 10]} />
                                <meshStandardMaterial color="#64748b" />
                            </mesh>
                            <Html position={[-halfW - 4, y, 0]} center>
                                <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', background: '#0f172a', padding: '4px', border: '1px solid #334155' }}>T{tierNum}</div>
                            </Html>
                        </group>
                    );
                })}

                {/* Render Vertical Columns */}
                <mesh position={[-halfW, topY / 2, 0]}>
                    <boxGeometry args={[2, topY + 10, 10]} />
                    <meshStandardMaterial color="#64748b" />
                </mesh>
                <mesh position={[halfW, topY / 2, 0]}>
                    <boxGeometry args={[2, topY + 10, 10]} />
                    <meshStandardMaterial color="#64748b" />
                </mesh>
            </group>

            {/* Render Pipes */}
            {layout.map((line) => (
                <PipeCrossSection key={line.id} line={line} />
            ))}
        </Canvas>
    );
}
