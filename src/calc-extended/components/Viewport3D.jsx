import React from 'react';
import { useExtendedStore } from '../store/useExtendedStore';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const Viewport3D = () => {
  const store = useExtendedStore();

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#020617' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
        <button onClick={() => store.setActiveView('DASHBOARD')} style={{ padding: '8px 16px', background: '#334155', color: '#f8fafc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          ← Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Detected Geometry: Auto [L]</span>
          <select value={store.heatmapMode} onChange={(e) => store.setHeatmapMode(e.target.value)} style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', padding: '4px' }}>
            <option value="STRESS">STRESS HEATMAP</option>
            <option value="FORCE">FORCE HEATMAP</option>
          </select>
        </div>
      </div>

      {/* R3F Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [50, 50, 50], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <OrbitControls />
          {/* Placeholder Geometry */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 20]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
        </Canvas>

        {/* R3F Tools Overlay */}
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', background: 'rgba(15, 23, 42, 0.9)', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <h4 style={{ color: '#f8fafc', fontSize: '14px', marginBottom: '8px' }}>R3F TOOLS:</h4>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '4px' }}><input type="radio" name="tool" /> Place Anchor</label>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '4px' }}><input type="radio" name="tool" /> Place Guide</label>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px' }}><input type="radio" name="tool" /> Split Geom</label>
        </div>
      </div>
    </div>
  );
};

export default Viewport3D;