import React from 'react';

const styles = {
  header: { fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }
};

import { usePipeRackStore } from '../store/usePipeRackStore';

export default function RackResultsGrid() {
  const { results } = usePipeRackStore();

  return (
    <div>
      <div style={styles.header}>Pipe Rack Analysis Data (Kellogg Loop Sizing & Nesting Hierarchy)</div>

      {!results && <div style={{color: '#64748b'}}>Awaiting loop calculation...</div>}

      {results && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Line ID</th>
              <th style={{ padding: '8px' }}>Size</th>
              <th style={{ padding: '8px' }}>Temp</th>
              <th style={{ padding: '8px' }}>Free Exp (Δ)</th>
              <th style={{ padding: '8px' }}>Loop Order</th>
              <th style={{ padding: '8px' }}>Nesting Pos</th>
              <th style={{ padding: '8px' }}>Loop Width (W)</th>
              <th style={{ padding: '8px' }}>Loop Height (H)</th>
              <th style={{ padding: '8px' }}>Req. Leg (L)</th>
              <th style={{ padding: '8px' }}>Guide 1 (4D)</th>
              <th style={{ padding: '8px' }}>Guide 2 (14D)</th>
            </tr>
          </thead>
          <tbody>
            {results.lines.map((line, i) => (
              <tr key={line.id} style={{ borderBottom: '1px solid #1e293b', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '8px', color: '#38bdf8', fontWeight: 'bold' }}>{line.id}</td>
                <td style={{ padding: '8px' }}>{line.sizeNps}"</td>
                <td style={{ padding: '8px' }}>{line.tOperate}°F</td>
                <td style={{ padding: '8px' }}>{line.deltaIn.toFixed(2)}"</td>
                <td style={{ padding: '8px', color: '#a78bfa' }}>{line.loopOrder.toFixed(1)}</td>
                <td style={{ padding: '8px' }}>
                  {line.nestingPosition === 1 ? 'Outermost (1)' : line.nestingPosition === results.lines.length ? `Innermost (${line.nestingPosition})` : `Pos ${line.nestingPosition}`}
                </td>
                <td style={{ padding: '8px' }}>{line.dimensions.W_ft.toFixed(1)}'</td>
                <td style={{ padding: '8px' }}>{line.dimensions.H_ft.toFixed(1)}'</td>
                <td style={{ padding: '8px' }}>{line.dimensions.L_req_ft.toFixed(1)}'</td>
                <td style={{ padding: '8px', color: '#f59e0b' }}>{line.dimensions.G1_ft.toFixed(2)}'</td>
                <td style={{ padding: '8px', color: '#f59e0b' }}>{line.dimensions.G2_ft.toFixed(2)}'</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
