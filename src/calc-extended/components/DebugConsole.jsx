import React from 'react';
import { useExtendedStore } from '../store/useExtendedStore';

const DebugConsole = () => {
  const store = useExtendedStore();
  const verbose = false; // Add toggle to store later if needed

  if (!verbose) return null;

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, width: '400px', height: '300px', background: 'rgba(2, 6, 23, 0.95)', borderLeft: '1px solid #1e293b', borderTop: '1px solid #1e293b', padding: '16px', color: '#10b981', fontFamily: 'monospace', fontSize: '10px', overflowY: 'auto', zIndex: 999 }}>
      <h3>VERBOSE DEBUG</h3>
      <pre>{JSON.stringify(store.results, null, 2)}</pre>
    </div>
  );
};

export default DebugConsole;