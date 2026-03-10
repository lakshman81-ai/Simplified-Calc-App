import React from 'react';
import { useGC3DStore } from './GC3DStore';

export const GC3DComponentPanel = () => {
  const selectedSegmentId = useGC3DStore(s => s.selectedSegmentId);
  const segments = useGC3DStore(s => s.segments);
  const fittingData = useGC3DStore(s => s.fittingData);
  const updateSegmentProperty = useGC3DStore(s => s.updateSegmentProperty);

  const selectedNodeId = useGC3DStore(s => s.selectedNodeId);
  const nodes = useGC3DStore(s => s.nodes);
  const nodeResults = useGC3DStore(s => s.nodeResults);

  if (selectedSegmentId) {
    const seg = segments.find(s => s.id === selectedSegmentId);
    if (!seg) return null;
    const data = fittingData[seg.id];

    const handleChange = (e) => {
      const { name, value } = e.target;
      let val = value;
      if (name === 'od_in' || name === 'wt_in') {
        val = parseFloat(value);
        if (isNaN(val)) return;
      }
      updateSegmentProperty(seg.id, { [name]: val });
    };

    const inputStyle = {
      width: '100%',
      background: '#0f172a',
      border: '1px solid #334155',
      color: '#f8fafc',
      padding: '4px 8px',
      borderRadius: '4px',
      marginTop: '4px',
      fontSize: '12px'
    };

    return (
      <div style={{ width: '300px', background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column', color: '#f8fafc' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #334155', fontWeight: 'bold' }}>Segment Properties</div>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          <p style={{ marginBottom: '8px' }}>ID: <span style={{ color: '#38bdf8' }}>{seg.id}</span></p>
          <p style={{ marginBottom: '8px' }}>Type: {seg.compType}</p>
          <p style={{ marginBottom: '8px' }}>Length: {seg.length_in.toFixed(2)} in</p>
          <p style={{ marginBottom: '16px' }}>Axis: {seg.axis}</p>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>Material</label>
            <input name="material" value={seg.material || ''} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>Outside Diameter (in)</label>
            <input type="number" step="0.1" name="od_in" value={seg.od_in || ''} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>Wall Thickness (in)</label>
            <input type="number" step="0.01" name="wt_in" value={seg.wt_in || ''} onChange={handleChange} style={inputStyle} />
          </div>

          {data && (
            <>
              <div style={{ marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '16px', fontWeight: 'bold', marginBottom: '8px' }}>SIF Data</div>
              <p style={{ fontSize: '13px', color: '#cbd5e1' }}>Flexibility h: {data.h?.toFixed(3)}</p>
              <p style={{ fontSize: '13px', color: '#cbd5e1' }}>In-plane SIF (i_i): {data.i_i?.toFixed(3)}</p>
              <p style={{ fontSize: '13px', color: '#cbd5e1' }}>Flexibility factor k: {data.k?.toFixed(3)}</p>
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
