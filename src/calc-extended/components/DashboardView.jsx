import React from 'react';
import { useExtendedStore } from '../store/useExtendedStore';
import { runExtendedSolver } from '../solver/ExtendedSolver';

const styles = {
  layout: { display: 'flex', width: '100%', height: '100%' },
  leftDock: { width: '280px', background: '#0f172a', borderRight: '1px solid #1e293b', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' },
  mainContent: { flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' },
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
  const { setActiveView, calculationStatus, inputs, boundaryMovement, constraints, results, nodes, segments, anchors, setResults } = useExtendedStore();

  const handleRun = () => {
    if (calculationStatus !== 'READY' && calculationStatus !== 'CALCULATED') return;
    const payload = { nodes, segments, anchors, inputs, boundaryMovement, constraints };
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
          <div style={styles.header}>System Limits</div>
          <div style={styles.row}><span>Eq Mat:</span> <select style={styles.input} value={constraints.equipmentMaterial} onChange={e => useExtendedStore.getState().updateConstraint('equipmentMaterial', e.target.value)}><option>Steel</option><option>Cast Iron</option></select></div>
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
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Axis</th>
                <th style={styles.th}>Net Diff</th>
                <th style={styles.th}>Bending Leg</th>
                <th style={styles.th}>Free Exp</th>
                <th style={styles.th}>Therm Force</th>
                <th style={styles.th}>Bend Stress</th>
                <th style={styles.th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {['X', 'Y', 'Z'].map(axis => {
                const row = results.axes[axis];
                return (
                  <tr key={axis}>
                    <td style={styles.td}>{axis}-Ax</td>
                    <td style={styles.td}>{row.netDiff.toFixed(1)} ft</td>
                    <td style={styles.td}>{row.bendingLeg.toFixed(1)} ft</td>
                    <td style={styles.td}>{row.delta.toFixed(3)}"</td>
                    <td style={styles.td}>{row.force.toFixed(0)} lbs</td>
                    <td style={styles.td}>{row.stress.toFixed(0)} PSI</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(row.status === 'PASS')}>{row.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {results && (
          <div style={{ marginTop: '24px', color: '#94a3b8', fontSize: '12px' }}>
            {"> "} {nodes.length} nodes, {segments.length} elements detected.<br/>
            {"> "} {results.meta.shortDropsIgnored} short vertical drops (&lt; 3ft) ignored for flexibility.
          </div>
        )}
      </div>
    </div>
  );
}
