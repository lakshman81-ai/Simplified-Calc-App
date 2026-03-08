import React from 'react';
import { useGC3DStore } from './GC3DStore';

export const GC3DDebugTable = () => {
  const segments = useGC3DStore(s => s.segments);
  const nodes = useGC3DStore(s => s.nodes);
  const fittingData = useGC3DStore(s => s.fittingData);
  const legResults = useGC3DStore(s => s.legResults);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#0f172a', color: '#f8fafc', padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Debug Table: Geometry & Results</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead style={{ borderBottom: '2px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
          <tr>
            <th style={{ padding: '12px 8px' }}>ID</th>
            <th style={{ padding: '12px 8px' }}>Type</th>
            <th style={{ padding: '12px 8px' }}>Node A</th>
            <th style={{ padding: '12px 8px' }}>Node B</th>
            <th style={{ padding: '12px 8px' }}>L (in)</th>
            <th style={{ padding: '12px 8px' }}>Axis</th>
            <th style={{ padding: '12px 8px' }}>OD (in)</th>
            <th style={{ padding: '12px 8px' }}>WT (in)</th>
            <th style={{ padding: '12px 8px' }}>h</th>
            <th style={{ padding: '12px 8px' }}>i_i</th>
            <th style={{ padding: '12px 8px' }}>k</th>
            <th style={{ padding: '12px 8px' }}>F (lbf)</th>
            <th style={{ padding: '12px 8px' }}>M (in·lbf)</th>
            <th style={{ padding: '12px 8px' }}>Sb (psi)</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((s, i) => {
            const data = fittingData[s.id] || { h: 0, i_i: 1.0, k: 1.0 };
            const res = legResults.find(r => r.legId === s.id) || { F_lbf: 0, M_inlbf: 0, Sb_psi: 0 };
            return (
              <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 8px', color: '#38bdf8' }}>{s.id}</td>
                <td style={{ padding: '12px 8px' }}>{s.compType}</td>
                <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>{s.startNode}</td>
                <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>{s.endNode}</td>
                <td style={{ padding: '12px 8px' }}>{s.length_in.toFixed(1)}</td>
                <td style={{ padding: '12px 8px' }}>{s.axis}</td>
                <td style={{ padding: '12px 8px' }}>{s.od_in.toFixed(3)}</td>
                <td style={{ padding: '12px 8px' }}>{s.wt_in.toFixed(3)}</td>
                <td style={{ padding: '12px 8px', color: '#10b981' }}>{data.h.toFixed(3)}</td>
                <td style={{ padding: '12px 8px', color: '#10b981' }}>{data.i_i.toFixed(3)}</td>
                <td style={{ padding: '12px 8px', color: '#10b981' }}>{data.k.toFixed(3)}</td>
                <td style={{ padding: '12px 8px', color: '#f59e0b' }}>{res.F_lbf.toFixed(0)}</td>
                <td style={{ padding: '12px 8px', color: '#f59e0b' }}>{res.M_inlbf.toFixed(0)}</td>
                <td style={{ padding: '12px 8px', color: '#f59e0b', fontWeight: 'bold' }}>{res.Sb_psi.toFixed(0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
