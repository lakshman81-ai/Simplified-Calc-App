import React from 'react';
import { useSimpStore } from './store';

export const CalculationsPanel = () => {
  const stats = useSimpStore(state => state.stats);
  const params = useSimpStore(state => state.params);
  const setParams = useSimpStore(state => state.setParams);

  const ratio = stats.ratio;
  const statusColor = ratio > 1 ? '#d32f2f' : '#2e7d32';
  const statusText = ratio > 1 ? 'FAIL (Ratio > 1.0)' : 'SAFE (Ratio < 1.0)';

  return (
    <div style={{ width: '400px', background: '#2c2c2c', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
      
      <div>
        <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #555', paddingBottom: '5px' }}>Process Parameters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {Object.entries(params).map(([key, val]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '2px' }}>{key}</label>
              <input 
                type="number" 
                value={val} 
                onChange={(e) => setParams({ [key]: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '5px', boxSizing: 'border-box', background: '#1e1e1e', color: 'white', border: '1px solid #555' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #555', paddingBottom: '5px' }}>Flexibility Analysis</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Gen. Leg (L1):</span> <strong>{stats.genLeg.toFixed(1)} mm</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Abs. Leg (L2):</span> <strong>{stats.absLeg.toFixed(1)} mm</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Expansion (dx):</span> <strong>{stats.dx.toFixed(2)} mm</strong></div>
          <hr style={{ borderColor: '#444', borderStyle: 'dashed', margin: '5px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Required Length:</span> <strong>{stats.Lreq.toFixed(1)} mm</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Actual Stress:</span> <strong>{stats.Scalc.toFixed(2)} MPa</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Allowable Stress:</span> <strong>{params.Sa.toFixed(2)} MPa</strong></div>
        </div>
      </div>

      <div style={{ 
        background: statusColor, padding: '15px', textAlign: 'center', 
        fontWeight: 'bold', fontSize: '18px', borderRadius: '4px', marginTop: 'auto'
      }}>
        {ratio === 0 ? 'Awaiting Data...' : statusText}
      </div>

    </div>
  );
};
