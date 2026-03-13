import React from 'react';
import { useExtendedStore } from '../store/useExtendedStore';
import { runExtendedSolver } from '../solver/ExtendedSolver';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import DebugConsole from './DebugConsole';

const styles = {
  container: { position: 'relative', width: '100%', height: '100%', background: '#020617' },
  topBar: { position: 'absolute', top: 0, left: 0, width: '100%', padding: '16px', display: 'flex', justifyContent: 'space-between', zIndex: 10, background: 'rgba(15,23,42,0.8)' },
  btn: { background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  toolsPanel: { position: 'absolute', bottom: '24px', left: '24px', background: '#0f172a', padding: '16px', borderRadius: '8px', zIndex: 10, border: '1px solid #1e293b' },
  statusBadge: { position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#064e3b', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', zIndex: 10 }
};

const NodeMesh = ({ node, isAnchor1, isAnchor2, onClick }) => (
  <mesh position={[node.x, node.y, node.z]} onClick={(e) => { e.stopPropagation(); onClick(node.id); }}>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshStandardMaterial color={isAnchor1 ? '#ef4444' : isAnchor2 ? '#f59e0b' : '#94a3b8'} />
    {(isAnchor1 || isAnchor2) && (
      <Html position={[0, 1, 0]} center>
        <div style={{ color: 'white', background: '#000', padding: '2px 4px', fontSize: '10px', borderRadius: '4px' }}>
          {isAnchor1 ? 'Anchor 1' : 'Anchor 2'}
        </div>
      </Html>
    )}
  </mesh>
);

const SegmentMesh = ({ start, end, results, heatmapMode }) => {
  const vecStart = new THREE.Vector3(start.x, start.y, start.z);
  const vecEnd = new THREE.Vector3(end.x, end.y, end.z);
  const dist = vecStart.distanceTo(vecEnd);
  const mid = new THREE.Vector3().addVectors(vecStart, vecEnd).multiplyScalar(0.5);

  // Align cylinder to vector
  const axis = new THREE.Vector3().subVectors(vecEnd, vecStart).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, axis);

  // Determine Color
  let color = '#334155'; // Default gray
  if (results && results.axes) {
    // Determine the primary axis of this segment to color it
    let primaryAxis = 'X';
    if (Math.abs(axis.y) > 0.5) primaryAxis = 'Y';
    if (Math.abs(axis.z) > 0.5) primaryAxis = 'Z';

    const res = results.axes[primaryAxis];
    if (res) {
      let ratio = 0;
      if (heatmapMode === 'STRESS') {
        ratio = res.stress / res.maxStress;
      } else if (heatmapMode === 'SHELL' && results.mist) {
        ratio = results.mist.interactionRatio;
      }

      if (ratio < 0.75) color = '#10b981'; // Green
      else if (ratio < 1.0) color = '#f59e0b'; // Yellow
      else color = '#ef4444'; // Red
    }
  }

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[0.2, 0.2, dist, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default function Viewport3DView() {
  const { setActiveView, nodes, segments, anchors, setAnchor, calculationStatus, heatmapMode, setHeatmapMode, inputs, vessel, boundaryMovement, constraints, results, setResults } = useExtendedStore();

  const handleNodeClick = (nodeId) => {
    if (!anchors.anchor1) setAnchor(1, nodeId);
    else if (!anchors.anchor2 && anchors.anchor1 !== nodeId) setAnchor(2, nodeId);
  };

  const handleRun = () => {
    if (calculationStatus !== 'READY' && calculationStatus !== 'CALCULATED') return;
    const res = runExtendedSolver({ nodes, segments, anchors, inputs, vessel, boundaryMovement, constraints });
    setResults(res);
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={{...styles.btn, background: '#1e293b'}} onClick={() => setActiveView('dashboard')}>← Back to Dashboard</button>
        <div>
          <button style={{...styles.btn, background: heatmapMode === 'STRESS' ? '#3b82f6' : '#1e293b', marginRight: '8px'}} onClick={() => setHeatmapMode('STRESS')}>STRESS HEATMAP</button>
          <button style={{...styles.btn, background: heatmapMode === 'SHELL' ? '#a78bfa' : '#1e293b'}} onClick={() => setHeatmapMode('SHELL')}>SHELL HEATMAP</button>
        </div>
      </div>

      <div style={styles.statusBadge}>
        {calculationStatus === 'AWAITING_ANCHORS' ? 'AWAITING ANCHORS' : calculationStatus === 'READY' ? 'READY TO RUN' : `CALCULATED [${heatmapMode}]`}
      </div>

      <div style={styles.toolsPanel}>
        <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>R3F TOOLS:</div>
        <div style={{ color: '#e2e8f0', fontSize: '14px', marginBottom: '8px' }}>
          {(!anchors.anchor1 || !anchors.anchor2) ? '👉 Click nodes to set Anchors' : '✅ Anchors Set'}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button style={{...styles.btn, background: '#ef4444', fontSize: '12px'}} onClick={() => { setAnchor(1, null); setAnchor(2, null); }}>Reset Anchors</button>
          <button
            style={{...styles.btn, background: '#10b981', fontSize: '12px', opacity: calculationStatus === 'AWAITING_ANCHORS' ? 0.5 : 1}}
            disabled={calculationStatus === 'AWAITING_ANCHORS'}
            onClick={handleRun}
          >
            RUN ►
          </button>
        </div>
      </div>

      <Canvas camera={{ position: [50, 50, 50], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[100, 100, 100]} />
        <OrbitControls />
        <gridHelper args={[100, 10]} />
        <axesHelper args={[20]} />

        {segments.map(seg => {
          const s1 = nodes.find(n => n.id === seg.startNodeId);
          const s2 = nodes.find(n => n.id === seg.endNodeId);
          if (!s1 || !s2) return null;
          return <SegmentMesh key={seg.id} start={s1} end={s2} results={results} heatmapMode={heatmapMode} />;
        })}

        {nodes.map(node => (
          <NodeMesh
            key={node.id}
            node={node}
            isAnchor1={anchors.anchor1 === node.id}
            isAnchor2={anchors.anchor2 === node.id}
            onClick={handleNodeClick}
          />
        ))}
      </Canvas>

      <DebugConsole />
    </div>
  );
}
