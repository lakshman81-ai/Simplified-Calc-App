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

import { getUnitLabel, formatUnit, MetricToImperial } from '../utils/units';

export default function DashboardView() {
  const { unitSystem, methodology, setActiveView, calculationStatus, inputs, vessel, boundaryMovement, constraints, results, nodes, segments, anchors, setResults } = useExtendedStore();

  const handleRun = () => {
    if (calculationStatus !== 'READY' && calculationStatus !== 'CALCULATED') return;

    // PRE-PROCESSOR: Engine expects Imperial. If UI is Metric, convert inputs down to Imperial before running.
    const engineInputs = { ...inputs };
    const engineVessel = { ...vessel };
    const engineBounds = { ...boundaryMovement };

    if (unitSystem === 'Metric') {
      engineInputs.tOperate = MetricToImperial.C_to_F(inputs.tOperate);
      engineInputs.corrosionAllowance = MetricToImperial.mm_to_in(inputs.corrosionAllowance);
      engineVessel.vesselOD = MetricToImperial.mm_to_in(vessel.vesselOD);
      engineVessel.vesselThk = MetricToImperial.mm_to_in(vessel.vesselThk);
      engineVessel.nozzleRad = MetricToImperial.mm_to_in(vessel.nozzleRad);
      engineVessel.designPress = MetricToImperial.MPa_to_psi(vessel.designPress);
      engineBounds.x = MetricToImperial.mm_to_in(boundaryMovement.x);
      engineBounds.y = MetricToImperial.mm_to_in(boundaryMovement.y);
      engineBounds.z = MetricToImperial.mm_to_in(boundaryMovement.z);
    }

    const payload = { nodes, segments, anchors, inputs: engineInputs, vessel: engineVessel, boundaryMovement: engineBounds, constraints, methodology };

    const res = runExtendedSolver(payload);
    res.meta.methodologyUsed = methodology === '2D_BUNDLE' ? 'SIMPLIFIED_3D_METHOD' : 'FLUOR_MIST';
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
          <div style={styles.row}><span>T_Operate ({getUnitLabel(unitSystem, 'temp')}):</span> <input type="number" style={styles.input} value={inputs.tOperate} onChange={e => useExtendedStore.getState().updateInput('tOperate', Number(e.target.value))} /></div>
        </div>

        <div style={styles.section}>
          <div style={styles.header}>Mechanical & Mfg</div>
          <div style={styles.row}>
            <span>Friction (μ):</span>
            <input type="number" step="0.01"
                   style={{...styles.input, opacity: methodology === 'FLUOR' ? 0.5 : 1}}
                   disabled={methodology === 'FLUOR'}
                   title={methodology === 'FLUOR' ? "Only applicable in 2D Bundle Method" : ""}
                   value={inputs.frictionFactor} onChange={e => useExtendedStore.getState().updateInput('frictionFactor', Number(e.target.value))} />
          </div>
          <div style={styles.row}><span>Corr. Allow ({getUnitLabel(unitSystem, 'shortLength')}):</span> <input type="number" step="0.01" style={styles.input} value={inputs.corrosionAllowance} onChange={e => useExtendedStore.getState().updateInput('corrosionAllowance', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Mill Tol (%):</span> <input type="number" step="0.1" style={styles.input} value={inputs.millTolerance} onChange={e => useExtendedStore.getState().updateInput('millTolerance', Number(e.target.value))} /></div>
        </div>

        <div style={styles.section}>
          <div style={styles.header}>Boundary Movement (Anchor 1)</div>
          <div style={styles.row}><span>X ({getUnitLabel(unitSystem, 'shortLength')}):</span> <input type="number" step="0.1" style={styles.input} value={boundaryMovement.x} onChange={e => useExtendedStore.getState().updateBoundaryMovement('x', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Y ({getUnitLabel(unitSystem, 'shortLength')}):</span> <input type="number" step="0.1" style={styles.input} value={boundaryMovement.y} onChange={e => useExtendedStore.getState().updateBoundaryMovement('y', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Z ({getUnitLabel(unitSystem, 'shortLength')}):</span> <input type="number" step="0.1" style={styles.input} value={boundaryMovement.z} onChange={e => useExtendedStore.getState().updateBoundaryMovement('z', Number(e.target.value))} /></div>
        </div>

        <div style={styles.section}>
          <div style={styles.header}>Vessel & Nozzle (MIST)</div>
          <div style={styles.row}><span>Vessel OD ({getUnitLabel(unitSystem, 'shortLength')}):</span> <input type="number" step="0.1" style={styles.input} value={vessel.vesselOD} onChange={e => useExtendedStore.getState().updateVessel('vesselOD', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Vessel Thk ({getUnitLabel(unitSystem, 'shortLength')}):</span> <input type="number" step="0.1" style={styles.input} value={vessel.vesselThk} onChange={e => useExtendedStore.getState().updateVessel('vesselThk', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Nozzle Rad ({getUnitLabel(unitSystem, 'shortLength')}):</span> <input type="number" step="0.1" style={styles.input} value={vessel.nozzleRad} onChange={e => useExtendedStore.getState().updateVessel('nozzleRad', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Design Prs ({getUnitLabel(unitSystem, 'pressure')}):</span> <input type="number" step="1" style={styles.input} value={vessel.designPress} onChange={e => useExtendedStore.getState().updateVessel('designPress', Number(e.target.value))} /></div>
          <div style={styles.row}><span>Flange Cls (#):</span> <select style={styles.input} value={vessel.flangeClass} onChange={e => useExtendedStore.getState().updateVessel('flangeClass', Number(e.target.value))}><option>150</option><option>300</option><option>600</option></select></div>
        </div>

        <div style={styles.section}>
          <div style={styles.header}>Import Geometry</div>
          <button style={{...styles.button, background: '#1e293b', color: '#38bdf8', padding: '8px', marginBottom: '8px', fontSize: '12px', border: '1px solid #38bdf8'}} onClick={() => useExtendedStore.getState().importFrom3DViewer()}>
            ↓ Pull from 3D Viewer
          </button>
          <button style={{...styles.button, background: '#1e293b', color: '#a78bfa', padding: '8px', marginBottom: '8px', fontSize: '12px', border: '1px solid #a78bfa'}} onClick={() => useExtendedStore.getState().importFrom2DSketcher()}>
            ↓ Pull from 2D Sketcher
          </button>
          <button style={{...styles.button, background: '#1e293b', color: '#f59e0b', padding: '8px', fontSize: '12px', border: '1px solid #f59e0b'}} onClick={() => {
              import('../mocks/mock-data').then(m => useExtendedStore.getState().loadMockData(m.MultiPlane_10Leg_GM));
            }}>
            🧪 Load Golden Master Mock
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
        <div style={{ color: '#94a3b8', marginBottom: '24px' }}>
          Calculation Status: <span style={{ color: '#38bdf8' }}>[{calculationStatus}]</span>
          {results && <span style={{ marginLeft: '12px', color: '#10b981' }}>— Method: {results.meta.methodologyUsed}</span>}
        </div>

        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Axis</th>
                  <th style={styles.th}>Net Diff ({getUnitLabel(unitSystem, 'length')})</th>
                  <th style={styles.th}>Bending Leg ({getUnitLabel(unitSystem, 'length')})</th>
                  <th style={styles.th}>Free Exp ({getUnitLabel(unitSystem, 'shortLength')})</th>
                  <th style={styles.th}>Therm Force ({getUnitLabel(unitSystem, 'force')})</th>
                  <th style={styles.th}>Bend Stress ({getUnitLabel(unitSystem, 'pressure')})</th>
                  <th style={styles.th}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {['X', 'Y', 'Z'].map(axis => {
                  const row = results.axes[axis];
                  return (
                    <tr key={axis}>
                      <td style={styles.td}>{axis}-Ax</td>
                      <td style={styles.td}>{formatUnit(unitSystem, 'length', row.netDiff, 1)}</td>
                      <td style={styles.td}>{formatUnit(unitSystem, 'length', row.bendingLeg, 1)}</td>
                      <td style={styles.td}>{formatUnit(unitSystem, 'shortLength', row.delta, 3)}</td>
                      <td style={styles.td}>{formatUnit(unitSystem, 'force', row.force, 0)}</td>
                      <td style={styles.td}>{formatUnit(unitSystem, 'pressure', row.stress, 0)}</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge(row.status === 'PASS')}>{row.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '8px' }}>1. PIPING STRESS (Fluor Guided Cantilever)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div>Max Pipe Stress: <span style={{ color: '#e2e8f0' }}>{formatUnit(unitSystem, 'pressure', Math.max(results.axes.X.stress, results.axes.Y.stress, results.axes.Z.stress), 0)} {getUnitLabel(unitSystem, 'pressure')}</span></div>
                <div>Limit: <span style={{ color: '#94a3b8' }}>{formatUnit(unitSystem, 'pressure', 20000, 0)} {getUnitLabel(unitSystem, 'pressure')}</span></div>
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
