import React from 'react';
import { useExtendedStore } from '../store/useExtendedStore';
import { runExtendedSolver } from '../solver/ExtendedSolver';

const styles = {
  layout: { display: 'flex', width: '100%', height: '100%', overflow: 'hidden' },
  leftDock: { width: '280px', background: '#0f172a', borderRight: '1px solid #1e293b', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' },
  mainContent: { flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  section: { background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155' },
  header: { fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' },
  input: { background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', padding: '4px', borderRadius: '4px', width: '120px' },
  button: { width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px', background: '#0f172a', borderRadius: '8px', overflow: 'hidden' },
  th: { background: '#1e293b', padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8', borderBottom: '1px solid #334155' },
  td: { padding: '12px', borderBottom: '1px solid #1e293b', fontSize: '14px' },
  statusBadge: (pass) => ({ background: pass ? '#064e3b' : '#7f1d1d', color: pass ? '#34d399' : '#fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' })
};

export default function DashboardView() {
  const { setActiveView, calculationStatus, inputs, vessel, boundaryMovement, constraints, results, nodes, segments, anchors, setResults } = useExtendedStore();

  const handleRun = () => {
    if (calculationStatus !== 'READY' && calculationStatus !== 'CALCULATED') return;
    const payload = { nodes, segments, anchors, inputs, vessel, boundaryMovement, constraints };
    const res = runExtendedSolver(payload);
    setResults(res);
  };

  return (
    <div style={styles.layout}>
      {/* LEFT DOCK */}
      <div style={styles.leftDock}>
        <div style={styles.section}>
          <div style={styles.header}>Piping Inputs</div>
          <div style={styles.row}><span>Material:</span> <select style={styles.input} value={inputs.material} onChange={e => useExtendedStore.getState().updateInput('material', e.target.value)}><option>Carbon Steel</option><option>Austenitic Stainless Steel 18 Cr 8 Ni</option></select></div>
          <div style={styles.row}><span>Size (in):</span> <input type="number" style={styles.input} value={inputs.pipeSize} onChange={e => useExtendedStore.getState().updateInput('pipeSize', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Schedule:</span> <select style={styles.input} value={inputs.schedule} onChange={e => useExtendedStore.getState().updateInput('schedule', e.target.value)}><option>40</option><option>80</option></select></div>
          <div style={styles.row}><span>T_Operate (°F):</span> <input type="number" style={styles.input} value={inputs.tOperate} onChange={e => useExtendedStore.getState().updateInput('tOperate', Number(e.target.value))} /></div>
        </div>

        <div style={styles.section}>
          <div style={styles.header}>Boundary Movement (Anchor 1)</div>
          <div style={styles.row}><span>X (in):</span> <input type="number" step="0.1" style={styles.input} value={boundaryMovement.x} onChange={e => useExtendedStore.getState().updateBoundaryMovement('x', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Y (in):</span> <input type="number" step="0.1" style={styles.input} value={boundaryMovement.y} onChange={e => useExtendedStore.getState().updateBoundaryMovement('y', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Z (in):</span> <input type="number" step="0.1" style={styles.input} value={boundaryMovement.z} onChange={e => useExtendedStore.getState().updateBoundaryMovement('z', Number(e.target.value))} /></div>
        </div>

        <div style={styles.section}>
          <div style={styles.header}>Vessel & Nozzle (MIST)</div>
          <div style={styles.row}><span>Vessel OD (in):</span> <input type="number" step="0.1" style={styles.input} value={vessel.vesselOD} onChange={e => useExtendedStore.getState().updateVessel('vesselOD', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Vessel Thk (in):</span> <input type="number" step="0.1" style={styles.input} value={vessel.vesselThk} onChange={e => useExtendedStore.getState().updateVessel('vesselThk', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Nozzle Rad (in):</span> <input type="number" step="0.1" style={styles.input} value={vessel.nozzleRad} onChange={e => useExtendedStore.getState().updateVessel('nozzleRad', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Design Prs (PSI):</span> <input type="number" step="1" style={styles.input} value={vessel.designPress} onChange={e => useExtendedStore.getState().updateVessel('designPress', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Flange Cls (#):</span> <select style={styles.input} value={vessel.flangeClass} onChange={e => useExtendedStore.getState().updateVessel('flangeClass', Number(e.target.value))}><option>150</option><option>300</option><option>600</option></select></div>
        </div>

        <div style={styles.section}>
          <div style={styles.header}>Import Geometry</div>
          <button style={{...styles.button, background: '#1e293b', color: '#38bdf8', padding: '8px', marginBottom: '8px', fontSize: '12px', border: '1px solid #38bdf8'}} onClick={() => useExtendedStore.getState().importFrom3DViewer()}>
            ↓ Pull from 3D Viewer
          </button>
          <button style={{...styles.button, background: '#1e293b', color: '#a78bfa', padding: '8px', fontSize: '12px', border: '1px solid #a78bfa'}} onClick={() => useExtendedStore.getState().importFrom2DSketcher()}>
            ↓ Pull from 2D Sketcher
          </button>
        </div>

        <button style={{...styles.button, background: '#10b981'}} onClick={() => setActiveView('3d-solver')}>
          OPEN 3D SOLVER [↗]
        </button>
        <button
          style={{...styles.button, opacity: calculationStatus === 'AWAITING_ANCHORS' ? 0.5 : 1, cursor: calculationStatus === 'AWAITING_ANCHORS' ? 'not-allowed' : 'pointer'}}
          onClick={handleRun}
          disabled={calculationStatus === 'AWAITING_ANCHORS'}
        >
          {calculationStatus === 'AWAITING_ANCHORS' ? 'AWAITING ANCHORS' : 'RUN CALCULATION ►'}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Stress Engine Results</div>
        <div style={{ color: '#94a3b8', marginBottom: '24px' }}>Calculation Status: <span style={{ color: '#38bdf8' }}>[{calculationStatus}]</span></div>

        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '8px' }}>1. PIPING STRESS (Fluor Guided Cantilever)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div>Max Pipe Stress: <span style={{ color: '#e2e8f0' }}>{Math.max(results.axes.X.stress, results.axes.Y.stress, results.axes.Z.stress).toFixed(0)} PSI</span></div>
                <div>Limit: <span style={{ color: '#94a3b8' }}>20,000 PSI</span></div>
                <div>STATUS: <span style={styles.statusBadge(Math.max(results.axes.X.stress, results.axes.Y.stress, results.axes.Z.stress) <= 20000)}>
                  {Math.max(results.axes.X.stress, results.axes.Y.stress, results.axes.Z.stress) <= 20000 ? 'PASS' : 'FAIL'}
                </span></div>
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a78bfa', marginBottom: '8px' }}>2. VESSEL SHELL LOAD (MIST / Yardstick Method)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div>Moment-Factor K: <span style={{ color: '#e2e8f0' }}>{results.mist.K.toFixed(0)}</span></div>
                <div>Interaction Ratio: <span style={{ color: '#e2e8f0' }}>{results.mist.interactionRatio.toFixed(3)}</span></div>
                <div>STATUS: <span style={styles.statusBadge(results.mist.status === 'PASS')}>{results.mist.status}</span></div>
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>3. FLANGE LEAKAGE (Modified Kellogg Equivalent Pressure)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div>Equivalent Load: <span style={{ color: '#e2e8f0' }}>{results.flange.equivalentLoad.toExponential(2)}</span></div>
                <div>Allow Capacity: <span style={{ color: '#94a3b8' }}>{results.flange.allowableCapacity.toExponential(2)}</span></div>
                <div>STATUS: <span style={styles.statusBadge(results.flange.status === 'PASS')}>{results.flange.status}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
