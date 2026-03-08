import React from 'react';
import { useGC3DStore } from './GC3DStore';

export const GC3DConfigPanel = () => {
  const params = useGC3DStore(s => s.params);
  const setParams = useGC3DStore(s => s.setParams);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#0f172a', color: '#f8fafc', padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Configuration</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Process Parameters</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
              Temperature Change (°F):
              <input type="number" value={params.deltaT_F} onChange={e => setParams({ deltaT_F: Number(e.target.value) })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
              Young's Modulus (psi):
              <input type="number" value={params.E_psi} onChange={e => setParams({ E_psi: Number(e.target.value) })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
              Thermal Expansion Coeff (in/in/°F):
              <input type="number" step="1e-7" value={params.alpha_in_in_F} onChange={e => setParams({ alpha_in_in_F: Number(e.target.value) })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
              Cold Allowable Stress (psi):
              <input type="number" value={params.Sc_psi} onChange={e => setParams({ Sc_psi: Number(e.target.value) })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
              Hot Allowable Stress (psi):
              <input type="number" value={params.Sh_psi} onChange={e => setParams({ Sh_psi: Number(e.target.value) })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
              Cycle Factor f:
              <input type="number" step="0.1" value={params.f} onChange={e => setParams({ f: Number(e.target.value) })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }} />
            </label>
            <div style={{ marginTop: '16px', fontWeight: 'bold', color: '#10b981' }}>
              Computed Allowable SA: {params.Sa_psi.toFixed(0)} psi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
