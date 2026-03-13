import React from 'react';
import { useExtendedStore } from '../store/useExtendedStore';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: '#020617',
    color: '#e2e8f0',
    overflow: 'hidden',
  },
  overlay: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column', gap: 12, fontSize: 14 }
};

export default function Bundle2DSolverView() {
  const { methodology } = useExtendedStore();

  return (
    <div style={styles.container}>
      {methodology === 'FLUOR' ? (
        <div style={styles.overlay}>
          <span style={{ fontSize: 32 }}>⚠️</span>
          <span>Methodology is set to <strong>FLUOR</strong>.</span>
          <span style={{ color: '#475569', fontSize: 12 }}>Change the global toggle to "Simp. 2D Bundle Equations" to use this solver.</span>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex' }}>
           {/* Left dock for 2D inputs, right for 2D loop schematic & results */}
           <div style={{ width: '360px', borderRight: '1px solid #1e293b', background: '#0f172a', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>2D Loop Parameters</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>
                Modernized UI for existing 2D Bundle logic. Select shape (L, Z, U) and input lengths directly.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Shape:</span>
                <select style={{ width: '120px', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '2px' }}>
                  <option>L-Shape</option>
                  <option>Z-Shape</option>
                  <option>U-Loop</option>
                </select>
              </div>
              <button style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: 'auto' }}>
                RUN 2D CALCULATION ►
              </button>
           </div>
           <div style={{ flex: 1, background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2 style={{ color: '#64748b' }}>[ Interactive 2D Schematic Placeholder ]</h2>
           </div>
        </div>
      )}
    </div>
  );
}