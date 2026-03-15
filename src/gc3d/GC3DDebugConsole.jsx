import React, { useRef, useEffect } from 'react';
import { useGC3DStore } from './GC3DStore';
import { Terminal, ChevronUp, ChevronDown, Trash2, Copy } from 'lucide-react';

export const GC3DDebugConsole = () => {
  const { debugLog, consoleCollapsed, toggleConsole, clearLog } = useGC3DStore();
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [debugLog]);

  const height = consoleCollapsed ? '48px' : '200px';

  const getColor = (step) => {
    if (step <= 4) return '#38bdf8'; // Blue
    if (step <= 6) return '#f8fafc'; // White
    if (step === 7) return '#10b981'; // Green
    return '#94a3b8'; // Grey
  };

  return (
    <div style={{ height, transition: 'height 0.3s ease', display: 'flex', flexDirection: 'column', background: '#0f172a', borderTop: '1px solid #1e293b' }}>
      <div
         style={{ height: '48px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', background: '#020617', cursor: 'pointer' }}
         onClick={toggleConsole}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontWeight: 'bold' }}>
          <Terminal size={18} /> Engine Debug Console
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {!consoleCollapsed && (
            <>
              <button onClick={() => navigator.clipboard.writeText(debugLog.map(l => `[Step ${l.step}] ${l.msg}`).join('\n'))} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Copy size={14} /> Copy All
              </button>
              <button onClick={(e) => { e.stopPropagation(); clearLog(); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={14} /> Clear
              </button>
            </>
          )}
          <div style={{ color: '#f8fafc', display: 'flex', alignItems: 'center' }}>
            {consoleCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>
      {!consoleCollapsed && (
        <div ref={logRef} style={{ flex: 1, padding: '16px 24px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px' }}>
          {debugLog.length === 0 ? <div style={{ color: '#64748b' }}>No logs generated yet. Run analysis to see output.</div> : null}
          {debugLog.map((log, i) => (
            <div key={i} style={{ color: getColor(log.step), marginBottom: '4px', whiteSpace: 'pre-wrap' }}>
              <span style={{ color: '#64748b' }}>{new Date(log.timestamp).toISOString().split('T')[1].slice(0, 12)}</span>
              <span style={{ margin: '0 8px' }}>[Step {log.step}]</span>
              {log.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
