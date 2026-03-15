import React from 'react';

const styles = {
  container: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' },
  header: { fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }
};

import { usePipeRackStore } from '../store/usePipeRackStore';
import { solvePipeRack } from '../solver/PipeRackSolver';

import { useExtendedStore } from '../../calc-extended/store/useExtendedStore';
import { useAppStore } from '../../store/appStore';
import { getUnitLabel, formatUnit, MetricToImperial } from '../../calc-extended/utils/units';

export default function RackInputsDock() {
  const { globalSettings, lines, updateGlobalSetting, updateLine, addLine, removeLine, setResults, toggleSectionCreator } = usePipeRackStore();
  const methodology = useExtendedStore(state => state.methodology);
  const globalInputs = useExtendedStore(state => state.inputs);
  const unitSystem = useAppStore(state => state.unitSystem);

  const handleRun = () => {
    const res = solvePipeRack(lines, globalSettings, methodology, globalInputs);
    res.methodologyUsed = methodology === '2D_BUNDLE' ? 'SIMPLIFIED_RACK_METHOD' : 'KELLOGG_MIST';
    setResults(res);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>Global Rack Parameters</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
        <span>Anchor Dist ({getUnitLabel(unitSystem, 'length')}):</span>
        <input type="number" style={{ width: '80px', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '2px' }}
               value={unitSystem === 'Imperial' ? globalSettings.anchorDistanceFt : formatUnit(unitSystem, 'length', globalSettings.anchorDistanceFt, 2)}
               onChange={e => updateGlobalSetting('anchorDistanceFt', unitSystem === 'Imperial' ? Number(e.target.value) : MetricToImperial.m_to_ft(Number(e.target.value)))} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
        <span>Spacing Step ({getUnitLabel(unitSystem, 'length')}):</span>
        <input type="number" style={{ width: '80px', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '2px' }}
               value={unitSystem === 'Imperial' ? globalSettings.defaultSpacingFt : formatUnit(unitSystem, 'length', globalSettings.defaultSpacingFt, 2)}
               onChange={e => updateGlobalSetting('defaultSpacingFt', unitSystem === 'Imperial' ? Number(e.target.value) : MetricToImperial.m_to_ft(Number(e.target.value)))} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
        <span>Allow Stress ({getUnitLabel(unitSystem, 'pressure')}):</span>
        <input type="number" style={{ width: '80px', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '2px' }}
               value={unitSystem === 'Imperial' ? globalSettings.allowableStressPsi : formatUnit(unitSystem, 'pressure', globalSettings.allowableStressPsi, 2)}
               onChange={e => updateGlobalSetting('allowableStressPsi', unitSystem === 'Imperial' ? Number(e.target.value) : MetricToImperial.MPa_to_psi(Number(e.target.value)))} />
      </div>

      <div style={{ ...styles.header, marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Piping Lines ({lines.length})</span>
        <button onClick={addLine} style={{ background: '#38bdf8', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 8px' }}>+ Add</button>
      </div>

      {lines.map((line) => (
        <div key={line.id} style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#a78bfa' }}>
            <span>Line {line.id}</span>
            <button onClick={() => removeLine(line.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}>X</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Size (NPS):</span>
            <input type="number" style={{ width: '60px', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '2px' }}
                   value={line.sizeNps} onChange={e => updateLine(line.id, 'sizeNps', Number(e.target.value))} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Material:</span>
            <select style={{ width: '120px', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '2px' }}
                    value={line.material} onChange={e => updateLine(line.id, 'material', e.target.value)}>
              <option>Carbon Steel</option>
              <option>Austenitic Stainless Steel 18 Cr 8 Ni</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Service:</span>
            <select style={{ width: '120px', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '2px' }}
                    value={line.service} onChange={e => updateLine(line.id, 'service', e.target.value)}>
              <option value="Process-Liquid">Process-Liquid</option>
              <option value="Process-Gas">Process-Gas</option>
              <option value="Utilities">Utilities</option>
              <option value="Flare">Flare</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Temp ({getUnitLabel(unitSystem, 'temp')}):</span>
            <input type="number" style={{ width: '60px', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '2px' }}
                   value={unitSystem === 'Imperial' ? line.tOperate : formatUnit(unitSystem, 'temp', line.tOperate, 1)}
                   onChange={e => updateLine(line.id, 'tOperate', unitSystem === 'Imperial' ? Number(e.target.value) : MetricToImperial.C_to_F(Number(e.target.value)))} />
          </div>

        </div>
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
        <button onClick={() => toggleSectionCreator(true)} style={{ background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '4px', padding: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
          📐 DESIGN PIPE RACK SECTION
        </button>
        <button onClick={handleRun} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
          RUN LOOP NESTING ►
        </button>
      </div>

    </div>
  );
}
