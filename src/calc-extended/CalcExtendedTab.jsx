import React from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { DebugConsole } from './components/DebugConsole';
import { GeometryAssigner } from './components/GeometryAssigner';
import { useExtendedStore } from './store';

export const CalcExtendedTab = () => {
  const results = useExtendedStore((state) => state.results);

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ color: 'white', margin: 0 }}>Calc Extended (Fluor Method)</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ConfigPanel />
          <GeometryAssigner />
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <DebugConsole />

          <div style={{ padding: '15px', backgroundColor: '#1e293b', borderRadius: '8px', color: 'white' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Solver Results</h3>
            <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto', backgroundColor: '#0f172a', padding: '10px', borderRadius: '4px' }}>
              {results ? JSON.stringify(results, null, 2) : 'No results yet. Assign a geometry and run solver.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
