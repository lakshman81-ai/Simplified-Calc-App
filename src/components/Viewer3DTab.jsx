import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useAppStore } from '../store/appStore';
import * as THREE from 'three';
import { parsePCF } from '../utils/pcfReader';
import { log } from '../utils/logger';

const PipeSegment = ({ comp }) => {
  const toggle = useAppStore(state => state.toggleSelection);
  const isSelected = useAppStore(state => state.selectedIds.has(comp.id));

  const start = new THREE.Vector3(...comp.start);
  const end = new THREE.Vector3(...comp.end);
  const dist = start.distanceTo(end);
  const center = start.clone().lerp(end, 0.5);

  const direction = end.clone().sub(start).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

  const color = isSelected ? '#ffa500' : '#4a90e2';

  return (
    <mesh
      position={center}
      quaternion={quaternion}
      onClick={(e) => {
        e.stopPropagation();
        toggle(comp.id);
      }}
    >
      <cylinderGeometry args={[comp.radius, comp.radius, dist, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export const Viewer3DTab = () => {
  const components = useAppStore(state => state.components);
  const setComponents = useAppStore(state => state.setComponents);
  const selectedCount = useAppStore(state => state.selectedIds.size);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const parsedComponents = parsePCF(text);
    log('info', 'Viewer3DTab', `PCF loaded`, { file: file.name, count: parsedComponents.length });
    if (parsedComponents.length > 0) {
      setComponents(parsedComponents);
    } else {
      alert("No valid pipe components found in PCF.");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 z-10 w-full">
        <div className="flex items-center gap-4">
          <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded cursor-pointer transition-colors shadow-sm inline-flex items-center">
            Load PCF
            <input type="file" accept=".pcf" className="hidden" onChange={handleFileUpload} />
          </label>
          <span className="text-slate-300 text-sm whitespace-nowrap">
            {components.length} components loaded
          </span>
        </div>
        <div className="text-sm font-medium text-slate-400 whitespace-nowrap ml-4">
          <span className="text-amber-400">{selectedCount}</span> selected
        </div>
      </div>
      <div className="flex-1 relative w-full h-full">
        <Canvas camera={{ position: [5000, 5000, 5000], fov: 50 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[100, 100, 50]} intensity={1} />
          <OrbitControls makeDefault />
          {components.map(c => <PipeSegment key={c.id} comp={c} />)}
          <gridHelper args={[20000, 20]} position={[0, -1000, 0]} material-opacity={0.2} material-transparent />
        </Canvas>

        {components.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-slate-500 text-lg font-medium">Upload a PCF file to begin.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewer3DTab;
