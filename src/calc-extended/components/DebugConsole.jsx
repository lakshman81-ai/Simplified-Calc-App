import React from 'react';
import { useExtendedStore } from '../store';

export const DebugConsole = () => {
  const logs = useExtendedStore((state) => state.logs);
  const clearLogs = useExtendedStore((state) => state.clearLogs);

  return (
    <div style={{ backgroundColor: '#0f172a', padding: '10px', height: '200px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ color: '#cbd5e1', margin: 0 }}>Debug Console</h3>
        <button
          onClick={clearLogs}
          style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Clear
        </button>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#10b981' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#64748b' }}>No logs available...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '4px', whiteSpace: 'pre-wrap' }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
