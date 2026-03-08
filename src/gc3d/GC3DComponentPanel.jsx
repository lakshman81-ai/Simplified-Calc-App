import React from 'react';
import { useGC3DStore } from './GC3DStore';

export const GC3DComponentPanel = () => {
  const selectedSegmentId = useGC3DStore(s => s.selectedSegmentId);
  const segments = useGC3DStore(s => s.segments);
  const fittingData = useGC3DStore(s => s.fittingData);

  const selectedNodeId = useGC3DStore(s => s.selectedNodeId);
  const nodes = useGC3DStore(s => s.nodes);
  const nodeResults = useGC3DStore(s => s.nodeResults);

  if (selectedSegmentId) {
    const seg = segments.find(s => s.id === selectedSegmentId);
    if (!seg) return null;
    const data = fittingData[seg.id];

    return (
      <div style={{ width: '300px', background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column', color: '#f8fafc' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #334155', fontWeight: 'bold' }}>Segment Properties</div>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          <p>ID: <span style={{ color: '#38bdf8' }}>{seg.id}</span></p>
          <p>Type: {seg.compType}</p>
          <p>Material: {seg.material}</p>
          <p>Length: {seg.length_in.toFixed(2)} in</p>
          <p>Axis: {seg.axis}</p>
          <p>OD: {seg.od_in.toFixed(3)} in</p>
          <p>WT: {seg.wt_in.toFixed(3)} in</p>

          {data && (
            <>
              <div style={{ marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '16px', fontWeight: 'bold' }}>SIF Data</div>
              <p>Flexibility h: {data.h.toFixed(3)}</p>
              <p>In-plane SIF (i_i): {data.i_i.toFixed(3)}</p>
              <p>Flexibility factor k: {data.k.toFixed(3)}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (selectedNodeId) {
    const n = nodes[selectedNodeId];
    if (!n) return null;
    const res = nodeResults.find(r => r.nodeId === selectedNodeId);

    return (
      <div style={{ width: '300px', background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column', color: '#f8fafc' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #334155', fontWeight: 'bold' }}>Node Properties</div>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          <p>ID: <span style={{ color: '#38bdf8' }}>{selectedNodeId}</span></p>
          <p>Type: {n.type}</p>
          <p>Pos: [{n.pos.map(p => p.toFixed(1)).join(', ')}] mm</p>

          {res && (
            <>
              <div style={{ marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '16px', fontWeight: 'bold' }}>Analysis Result</div>
              <p>Combined Stress SE: {res.SE_psi.toFixed(0)} psi</p>
              <p>Allowable SA: {res.SA_psi.toFixed(0)} psi</p>
              <p>Ratio: {res.ratio.toFixed(3)}</p>
              <p>Status: <span style={{ color: res.result === 'PASS' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{res.result}</span></p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '300px', background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column', color: '#f8fafc', padding: '16px' }}>
      <p style={{ color: '#94a3b8' }}>Select a segment or node to view properties.</p>
    </div>
  );
};
