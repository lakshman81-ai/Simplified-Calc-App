import React from 'react';
import { useExtendedStore } from '../store/useExtendedStore';
import { useAppStore } from '../../store/appStore';
import { useSketchStore } from '../../sketcher/SketcherStore';
import { solveStressAndForce } from '../solver/ExtendedSolver';

const Dashboard = () => {
  const store = useExtendedStore();
  const appStore = useAppStore();
  const sketchStore = useSketchStore();

  const handleInputChange = (e, field) => {
    store[`set${field}`](e.target.value);
  };

  const handlePull3DViewer = () => {
    const { components, selectedIds } = appStore;
    const selectedComps = components.filter((_, idx) => selectedIds.has(idx));
    if (selectedComps.length === 0) {
      alert("No components selected in 3D Viewer.");
      return;
    }
    store.importFromGlobal(selectedComps);
    store.setCalculationStatus('READY');
  };

  const handlePull2DSketcher = () => {
    const components = sketchStore.exportToComponents();
    if (!components || components.length === 0) {
      alert("No geometry found in 2D Sketcher.");
      return;
    }
    store.importFromGlobal(components);
    store.setCalculationStatus('READY');
  };

  const handleRunCalculation = () => {
    const { material, nominalSize, schedule, tempOperate, tempInstall, equipMaterial, boundaryMovement, geometryVectors } = store;

    if (geometryVectors.length === 0) {
      alert("No geometry imported. Please pull from 3D Viewer or 2D Sketcher first.");
      return;
    }

    try {
      const payload = { material, nominalSize, schedule, tempOperate, tempInstall, equipMaterial, boundaryMovement, vectors: geometryVectors };
      const results = solveStressAndForce(payload);

      store.setCalculationStatus('CALCULATED');
      store.setResults(results);
    } catch (e) {
      console.error(e);
      alert("Error running calculation. See console for details.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
      {/* Left Dock */}
      <div style={{ width: '20%', borderRight: '1px solid #1e293b', padding: '16px', background: '#0f172a', overflowY: 'auto' }}>
        <h3 style={{ color: '#f8fafc', fontSize: '14px', marginBottom: '12px' }}>[ IMPORT GEOMETRY ]</h3>
        <button onClick={handlePull3DViewer} style={{ width: '100%', padding: '6px', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer', marginBottom: '6px', fontSize: '12px' }}>
          Pull from 3D Viewer (Selected)
        </button>
        <button onClick={handlePull2DSketcher} style={{ width: '100%', padding: '6px', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer', marginBottom: '16px', fontSize: '12px' }}>
          Pull from 2D Sketcher (All)
        </button>
        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '24px' }}>Detected Elements: {store.geometryVectors.length}</div>

        <h3 style={{ color: '#f8fafc', fontSize: '14px', marginBottom: '12px' }}>[ PIPING INPUTS ]</h3>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
          Material:
          <select value={store.material} onChange={(e) => handleInputChange(e, 'Material')} style={{ width: '100%', marginTop: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', padding: '4px' }}>
            <option value="Carbon Steel">C.S.</option>
            <option value="Austenitic Stainless Steel 18 Cr 8 Ni">S.S.</option>
          </select>
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <label style={{ color: '#94a3b8', fontSize: '12px', flex: 1 }}>
            Size:
            <input type="number" value={store.nominalSize} onChange={(e) => handleInputChange(e, 'NominalSize')} style={{ width: '100%', marginTop: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', padding: '4px' }} />
          </label>
          <label style={{ color: '#94a3b8', fontSize: '12px', flex: 1 }}>
            Sch:
            <select value={store.schedule} onChange={(e) => handleInputChange(e, 'Schedule')} style={{ width: '100%', marginTop: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', padding: '4px' }}>
              <option value="40">40</option>
              <option value="80">80</option>
            </select>
          </label>
        </div>

        <h3 style={{ color: '#f8fafc', fontSize: '14px', marginBottom: '12px', marginTop: '24px' }}>[ BOUNDARY MOVEMENT ]</h3>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
          Anchor 1 X (in):
          <input type="number" value={store.boundaryMovement.x} onChange={(e) => store.setBoundaryMovement('x', e.target.value)} style={{ width: '100%', marginTop: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', padding: '4px' }} />
        </label>

        <h3 style={{ color: '#f8fafc', fontSize: '14px', marginBottom: '12px', marginTop: '24px' }}>[ SYSTEM LIMITS ]</h3>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
          Eq Mat:
          <select value={store.equipMaterial} onChange={(e) => handleInputChange(e, 'EquipMaterial')} style={{ width: '100%', marginTop: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', padding: '4px' }}>
            <option value="Steel">Steel</option>
            <option value="Cast Iron">Cast Iron</option>
          </select>
        </label>
        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Max Force: {store.results ? store.results.maxForce : '-'} lbs</div>
        <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '24px' }}>Max Stress: {store.maxStressLimit} PSI</div>

        <button onClick={() => store.setActiveView('3D_VIEW')} style={{ width: '100%', padding: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '8px' }}>
          OPEN 3D SOLVER [↗]
        </button>
        <button onClick={handleRunCalculation} style={{ width: '100%', padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          RUN CALCULATION ►
        </button>
      </div>

      {/* Main Content (DataGrid) */}
      <div style={{ flex: 1, padding: '24px', background: '#020617', overflowY: 'auto' }}>
        <h2 style={{ color: '#f8fafc', fontSize: '18px', marginBottom: '16px' }}>Calculation Status: [{store.calculationStatus}]</h2>

        {store.results && (
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '8px' }}>Axis</th>
                <th style={{ padding: '8px' }}>Net Diff</th>
                <th style={{ padding: '8px' }}>Bending Leg</th>
                <th style={{ padding: '8px' }}>Free Exp</th>
                <th style={{ padding: '8px' }}>Therm Force</th>
                <th style={{ padding: '8px' }}>Bend Stress</th>
                <th style={{ padding: '8px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {['X', 'Y', 'Z'].map(axis => {
                const res = store.results[axis];
                const statusColor = res.status === 'PASS' ? '#10b981' : '#ef4444';
                return (
                  <tr key={axis} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '8px' }}>{axis}-Ax</td>
                    <td style={{ padding: '8px' }}>{res.netDiff.toFixed(2)} ft</td>
                    <td style={{ padding: '8px' }}>{res.bendingLeg.toFixed(2)} ft</td>
                    <td style={{ padding: '8px' }}>{res.freeExp.toFixed(3)}"</td>
                    <td style={{ padding: '8px' }}>{res.force} lbs</td>
                    <td style={{ padding: '8px' }}>{res.stress} PSI</td>
                    <td style={{ padding: '8px', color: statusColor, fontWeight: 'bold' }}>[{res.status}]</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;