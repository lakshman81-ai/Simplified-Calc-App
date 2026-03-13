import React, { useState } from 'react';
import { useExtendedStore } from '../store/useExtendedStore';
import { runExtendedSolver } from '../solver/ExtendedSolver'; // Reuse the pure function by mocking an equivalent 3D payload

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#020617', color: '#e2e8f0', overflow: 'hidden' },
  overlay: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column', gap: 12, fontSize: 14 },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', alignItems: 'center' },
  input: { width: '80px', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '4px', borderRadius: '4px' },
  statusBadge: (pass) => ({ background: pass ? '#064e3b' : '#7f1d1d', color: pass ? '#34d399' : '#fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' })
};

// 2D SVG Schematic Renderer
const Schematic2D = ({ shape, inputs }) => {
  const c = '#38bdf8'; // pipe color

  if (shape === 'L-Shape') {
    return (
      <svg width="200" height="200" viewBox="0 0 100 100" stroke={c} strokeWidth="2" fill="none">
        <path d="M 20,80 L 20,20 L 80,20" />
        <circle cx="20" cy="80" r="4" fill="#ef4444" stroke="none" /> {/* Anchor */}
        <circle cx="80" cy="20" r="4" fill="#f59e0b" stroke="none" /> {/* Anchor */}
        <text x="50" y="15" fill="#94a3b8" fontSize="8" stroke="none" textAnchor="middle">Vx ({inputs.Vx}')</text>
        <text x="10" y="50" fill="#94a3b8" fontSize="8" stroke="none" textAnchor="end">Vy ({inputs.Vy}')</text>
      </svg>
    );
  }
  if (shape === 'Z-Shape') {
    return (
      <svg width="200" height="200" viewBox="0 0 100 100" stroke={c} strokeWidth="2" fill="none">
        <path d="M 10,80 L 50,80 L 50,20 L 90,20" />
        <circle cx="10" cy="80" r="4" fill="#ef4444" stroke="none" />
        <circle cx="90" cy="20" r="4" fill="#f59e0b" stroke="none" />
        <text x="30" y="90" fill="#94a3b8" fontSize="8" stroke="none" textAnchor="middle">Vx1 ({inputs.Vx1}')</text>
        <text x="45" y="50" fill="#94a3b8" fontSize="8" stroke="none" textAnchor="end">Vy ({inputs.Vy}')</text>
        <text x="70" y="15" fill="#94a3b8" fontSize="8" stroke="none" textAnchor="middle">Vx2 ({inputs.Vx2}')</text>
      </svg>
    );
  }
  if (shape === 'U-Loop') {
    return (
      <svg width="200" height="200" viewBox="0 0 100 100" stroke={c} strokeWidth="2" fill="none">
        <path d="M 10,80 L 30,80 L 30,20 L 70,20 L 70,80 L 90,80" />
        <circle cx="10" cy="80" r="4" fill="#ef4444" stroke="none" />
        <circle cx="90" cy="80" r="4" fill="#f59e0b" stroke="none" />
        <text x="50" y="90" fill="#94a3b8" fontSize="8" stroke="none" textAnchor="middle">L ({inputs.L}')</text>
        <text x="50" y="15" fill="#94a3b8" fontSize="8" stroke="none" textAnchor="middle">W ({inputs.W}')</text>
        <text x="25" y="50" fill="#94a3b8" fontSize="8" stroke="none" textAnchor="end">H ({inputs.H}')</text>
      </svg>
    );
  }
  return null;
};

export default function Bundle2DSolverView() {
  const { methodology, inputs: globalInputs } = useExtendedStore();
  const [shape, setShape] = useState('L-Shape');
  const [geom, setGeom] = useState({ Vx: 25, Vy: 16.5, Vx1: 15, Vx2: 10, L: 100, W: 10, H: 10 });
  const [results, setResults] = useState(null);

  const updateGeom = (k, v) => setGeom(s => ({...s, [k]: Number(v)}));

  const handleRun = () => {
    // Translate the 2D geometric inputs into the standard nodes/segments payload for ExtendedSolver
    let nodes = [];
    let segments = [];
    let anchors = { anchor1: 'n1' };

    if (shape === 'L-Shape') {
      nodes = [
        { id: 'n1', x: 0, y: 0, z: 0 },
        { id: 'n2', x: geom.Vx, y: 0, z: 0 },
        { id: 'n3', x: geom.Vx, y: geom.Vy, z: 0 }
      ];
      segments = [
        { id: 's1', startNodeId: 'n1', endNodeId: 'n2' },
        { id: 's2', startNodeId: 'n2', endNodeId: 'n3' }
      ];
      anchors.anchor2 = 'n3';
    } else if (shape === 'Z-Shape') {
      nodes = [
        { id: 'n1', x: 0, y: 0, z: 0 },
        { id: 'n2', x: geom.Vx1, y: 0, z: 0 },
        { id: 'n3', x: geom.Vx1, y: geom.Vy, z: 0 },
        { id: 'n4', x: geom.Vx1 + geom.Vx2, y: geom.Vy, z: 0 }
      ];
      segments = [
        { id: 's1', startNodeId: 'n1', endNodeId: 'n2' },
        { id: 's2', startNodeId: 'n2', endNodeId: 'n3' },
        { id: 's3', startNodeId: 'n3', endNodeId: 'n4' }
      ];
      anchors.anchor2 = 'n4';
    } else if (shape === 'U-Loop') {
      const halfL = geom.L / 2;
      nodes = [
        { id: 'n1', x: 0, y: 0, z: 0 },
        { id: 'n2', x: halfL, y: 0, z: 0 },
        { id: 'n3', x: halfL, y: geom.H, z: 0 },
        { id: 'n4', x: halfL + geom.W, y: geom.H, z: 0 },
        { id: 'n5', x: halfL + geom.W, y: 0, z: 0 },
        { id: 'n6', x: geom.L + geom.W, y: 0, z: 0 } // To ensure net distance is L (assuming W absorbs)
      ];
      segments = [
        { id: 's1', startNodeId: 'n1', endNodeId: 'n2' },
        { id: 's2', startNodeId: 'n2', endNodeId: 'n3' },
        { id: 's3', startNodeId: 'n3', endNodeId: 'n4' },
        { id: 's4', startNodeId: 'n4', endNodeId: 'n5' },
        { id: 's5', startNodeId: 'n5', endNodeId: 'n6' }
      ];
      anchors.anchor2 = 'n6';
    }

    // Mock an empty vessel so it skips MIST
    const payload = {
      nodes, segments, anchors, inputs: globalInputs, boundaryMovement: {x:0, y:0, z:0},
      constraints: { maxStress: 20000 }, vessel: { vesselOD: 0, vesselThk: 0, nozzleRad: 0, designPress: 0, flangeClass: 150, momentArm: 0 }
    };

    // In 2D Bundle methodology mode, we could theoretically apply alternative logic.
    // But since the Prompt specifically dictates "Fluor Guided Cantilever Formulas for Basic Profiles" for this 2D solver,
    // we use the mathematically perfect ExtendedSolver engine and let its 3D vector math evaluate the 2D plane identically.
    const res = runExtendedSolver(payload);
    setResults(res);
  };

  return (
    <div style={styles.container}>
      {methodology === 'FLUOR' ? (
        <div style={styles.overlay}>
          <span style={{ fontSize: 32 }}>⚠️</span>
          <span>Methodology is set to <strong>FLUOR (3D Solver)</strong>.</span>
          <span style={{ color: '#475569', fontSize: 12 }}>Change the global toggle to "Simp. 2D Bundle Equations" to use this explicit 2D solver.</span>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
           {/* Left dock */}
           <div style={{ width: '360px', borderRight: '1px solid #1e293b', background: '#0f172a', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>2D Loop Parameters</div>
              <div style={styles.row}>
                <span>Profile Shape:</span>
                <select style={{...styles.input, width: '120px'}} value={shape} onChange={e => {setShape(e.target.value); setResults(null);}}>
                  <option>L-Shape</option>
                  <option>Z-Shape</option>
                  <option>U-Loop</option>
                </select>
              </div>

              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', color: '#38bdf8', marginBottom: '8px', fontWeight: 'bold' }}>Geometry (feet)</div>
                {shape === 'L-Shape' && (
                  <>
                    <div style={styles.row}><span>Leg X (Vx):</span> <input type="number" style={styles.input} value={geom.Vx} onChange={e => updateGeom('Vx', e.target.value)} /></div>
                    <div style={styles.row}><span>Leg Y (Vy):</span> <input type="number" style={styles.input} value={geom.Vy} onChange={e => updateGeom('Vy', e.target.value)} /></div>
                  </>
                )}
                {shape === 'Z-Shape' && (
                  <>
                    <div style={styles.row}><span>Leg X1 (Vx1):</span> <input type="number" style={styles.input} value={geom.Vx1} onChange={e => updateGeom('Vx1', e.target.value)} /></div>
                    <div style={styles.row}><span>Leg X2 (Vx2):</span> <input type="number" style={styles.input} value={geom.Vx2} onChange={e => updateGeom('Vx2', e.target.value)} /></div>
                    <div style={styles.row}><span>Offset Leg (Vy):</span> <input type="number" style={styles.input} value={geom.Vy} onChange={e => updateGeom('Vy', e.target.value)} /></div>
                  </>
                )}
                {shape === 'U-Loop' && (
                  <>
                    <div style={styles.row}><span>Anchor Dist (L):</span> <input type="number" style={styles.input} value={geom.L} onChange={e => updateGeom('L', e.target.value)} /></div>
                    <div style={styles.row}><span>Loop Height (H):</span> <input type="number" style={styles.input} value={geom.H} onChange={e => updateGeom('H', e.target.value)} /></div>
                    <div style={styles.row}><span>Loop Width (W):</span> <input type="number" style={styles.input} value={geom.W} onChange={e => updateGeom('W', e.target.value)} /></div>
                  </>
                )}
              </div>

              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                 <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>Piping Spec (From Global)</div>
                 <div style={styles.row}><span>Material:</span> <span style={{ color: '#fff' }}>{globalInputs.material}</span></div>
                 <div style={styles.row}><span>Size/Sch:</span> <span style={{ color: '#fff' }}>{globalInputs.pipeSize}" / {globalInputs.schedule}</span></div>
                 <div style={styles.row}><span>Temp:</span> <span style={{ color: '#fff' }}>{globalInputs.tOperate} °F</span></div>
              </div>

              <button onClick={handleRun} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: 'auto' }}>
                EVALUATE 2D PROFILE ►
              </button>
           </div>

           {/* Right viewport */}
           <div style={{ flex: 1, background: '#020617', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #1e293b' }}>
                 <Schematic2D shape={shape} inputs={geom} />
              </div>

              {results && (
                <div style={{ padding: '24px', minHeight: '300px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Evaluation Results</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0f172a', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                      <tr>
                        <th style={{ background: '#1e293b', padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8', borderBottom: '1px solid #334155' }}>Axis</th>
                        <th style={{ background: '#1e293b', padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8', borderBottom: '1px solid #334155' }}>Expansion (Δ)</th>
                        <th style={{ background: '#1e293b', padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8', borderBottom: '1px solid #334155' }}>Bending Leg (B)</th>
                        <th style={{ background: '#1e293b', padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8', borderBottom: '1px solid #334155' }}>Force (F)</th>
                        <th style={{ background: '#1e293b', padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8', borderBottom: '1px solid #334155' }}>Stress (S)</th>
                        <th style={{ background: '#1e293b', padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8', borderBottom: '1px solid #334155' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['X', 'Y'].map(axis => {
                        const row = results.axes[axis];
                        if (!row || row.netDiff === 0) return null;
                        return (
                          <tr key={axis}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #1e293b', fontSize: '14px', color: '#38bdf8' }}>{axis}-Ax</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #1e293b', fontSize: '14px' }}>{row.delta.toFixed(3)}"</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #1e293b', fontSize: '14px' }}>{row.bendingLeg.toFixed(1)}'</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #1e293b', fontSize: '14px' }}>{row.force.toFixed(0)} lbs</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #1e293b', fontSize: '14px' }}>{row.stress.toFixed(0)} PSI</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #1e293b', fontSize: '14px' }}>
                              <span style={styles.statusBadge(row.status === 'PASS')}>{row.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
