import React from 'react';
import { useExtendedStore } from '../store/useExtendedStore';

export default function ConfigDatabaseTab() {
  const { unitSystem, toggleUnitSystem } = useExtendedStore();

  return (
    <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>

      <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '16px', color: '#f8fafc', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>Global Configuration</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#94a3b8' }}>Unit System:</span>
          <select
            value={unitSystem}
            onChange={e => toggleUnitSystem(e.target.value)}
            style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}
          >
            <option value="Imperial">Imperial (in, lbs, PSI, °F)</option>
            <option value="Metric">Metric (mm, N, MPa, °C)</option>
          </select>
          <span style={{ color: '#f59e0b', fontSize: '12px' }}>
            Note: The solver engine inherently calculates in Imperial. Setting to Metric uses pre/post processors.
          </span>
        </div>
      </div>

      <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', flex: 1 }}>
        <h2 style={{ fontSize: '16px', color: '#f8fafc', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>Database Viewer</h2>
        <div style={{ color: '#64748b', fontSize: '13px' }}>
          The solver dynamically pulls values from the following hardcoded JSON arrays based on your inputs:
          <ul style={{ marginTop: '8px', lineHeight: '1.6' }}>
            <li><strong style={{ color: '#38bdf8' }}>expansion_coefficients.json</strong> (Linear thermal expansion 'e' per 100ft)</li>
            <li><strong style={{ color: '#38bdf8' }}>modulus_elasticity.json</strong> (Young's Modulus 'E' in ksi)</li>
            <li><strong style={{ color: '#38bdf8' }}>pipe_properties.json</strong> (Nominal size, schedule, OD, Area, Moment of Inertia)</li>
            <li><strong style={{ color: '#a78bfa' }}>flange_ratings.json</strong> (Class pressure limits by temp for Kellogg leakage checks)</li>
            <li><strong style={{ color: '#a78bfa' }}>design_stress.json</strong> (Allowable 'f' limits for MIST shakedown calculations)</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
