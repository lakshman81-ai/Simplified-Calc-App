import React, { useState } from 'react';

const styles = {
  header: { cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }
};

import { usePipeRackStore } from '../store/usePipeRackStore';
import { useAppStore } from '../../store/appStore';
import { getUnitLabel, formatUnit } from '../../calc-extended/utils/units';

export default function RackResultsGrid({ expanded, onToggle }) {
  const { results } = usePipeRackStore();
  const unitSystem = useAppStore(state => state.unitSystem);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={styles.header} onClick={onToggle}>
        <span style={{ marginRight: '8px' }}>{expanded ? '▼' : '▶'}</span>
        Pipe Rack Analysis Data
        {results && <span style={{ marginLeft: '12px', color: '#10b981', fontSize: '12px' }}>— Method: {results.methodologyUsed}</span>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: expanded ? 'block' : 'none' }}>
        {!results && <div style={{color: '#64748b'}}>Awaiting loop calculation...</div>}

        {results && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Line ID</th>
              <th style={{ padding: '8px' }}>Size</th>
              <th style={{ padding: '8px' }}>Temp ({getUnitLabel(unitSystem, 'temp')})</th>
              <th style={{ padding: '8px' }}>Free Exp ({getUnitLabel(unitSystem, 'shortLength')})</th>
              <th style={{ padding: '8px' }}>Loop Order</th>
              <th style={{ padding: '8px' }}>Nesting Pos</th>
              <th style={{ padding: '8px' }}>Loop Width ({getUnitLabel(unitSystem, 'length')})</th>
              <th style={{ padding: '8px' }}>Loop Height ({getUnitLabel(unitSystem, 'length')})</th>
              <th style={{ padding: '8px' }}>Req. Leg ({getUnitLabel(unitSystem, 'length')})</th>
              <th style={{ padding: '8px' }}>Guide 1 ({getUnitLabel(unitSystem, 'length')})</th>
              <th style={{ padding: '8px' }}>Guide 2 ({getUnitLabel(unitSystem, 'length')})</th>
            </tr>
          </thead>
          <tbody>
            {results.lines.map((line, i) => (
              <tr key={line.id} style={{ borderBottom: '1px solid #1e293b', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '8px', color: '#38bdf8', fontWeight: 'bold' }}>{line.id}</td>
                <td style={{ padding: '8px' }}>{line.sizeNps}"</td>
                <td style={{ padding: '8px' }}>{formatUnit(unitSystem, 'temp', line.tOperate, 1)}</td>
                <td style={{ padding: '8px' }}>{formatUnit(unitSystem, 'shortLength', line.deltaIn, 2)}</td>
                <td style={{ padding: '8px', color: '#a78bfa' }}>{line.loopOrder.toFixed(1)}</td>
                <td style={{ padding: '8px' }}>
                  {line.nestingPosition === 1 ? 'Outermost (1)' : line.nestingPosition === results.lines.length ? `Innermost (${line.nestingPosition})` : `Pos ${line.nestingPosition}`}
                </td>
                <td style={{ padding: '8px' }}>{formatUnit(unitSystem, 'length', line.dimensions.W_ft, 1)}</td>
                <td style={{ padding: '8px' }}>{formatUnit(unitSystem, 'length', line.dimensions.H_ft, 1)}</td>
                <td style={{ padding: '8px' }}>{formatUnit(unitSystem, 'length', line.dimensions.L_req_ft, 1)}</td>
                <td style={{ padding: '8px', color: '#f59e0b' }}>{formatUnit(unitSystem, 'length', line.dimensions.G1_ft, 2)}</td>
                <td style={{ padding: '8px', color: '#f59e0b' }}>{formatUnit(unitSystem, 'length', line.dimensions.G2_ft, 2)}</td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
