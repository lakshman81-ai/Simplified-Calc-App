import React from 'react';
import { useGC3DStore } from './GC3DStore';
import { GC3DCanvas } from './GC3DCanvas';
import { GC3DComponentPanel } from './GC3DComponentPanel';
import { GC3DDebugConsole } from './GC3DDebugConsole';
import { GC3DDebugTable } from './GC3DDebugTable';
import { GC3DConfigPanel } from './GC3DConfigPanel';
import { Activity } from 'lucide-react';

import { ChevronDown, ChevronUp } from 'lucide-react';

export const GC3DTab = () => {
  const { includeSIF, setIncludeSIF, colorMode, setColorMode, dataGridCollapsed, toggleDataGrid } = useGC3DStore();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      <div style={{ height: '56px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#f8fafc', fontWeight: 'bold', fontSize: '18px' }}>
          <Activity size={24} color="#3b82f6" />
          GC 3D Analyzer
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal', marginLeft: '8px' }}>
            Ver {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} (1)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontSize: '12px' }}>
                <span style={{ color: '#94a3b8' }}>Color Mode:</span>
                <select
                    value={colorMode}
                    onChange={e => setColorMode(e.target.value)}
                    style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: '4px', padding: '4px' }}
                >
                    <option value="type">Component Type</option>
                    <option value="stress">Stress Heatmap</option>
                </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', cursor: 'pointer', fontSize: '12px' }}>
                <input type="checkbox" checked={includeSIF} onChange={e => setIncludeSIF(e.target.checked)} />
                Include SIF & k
            </label>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <GC3DCanvas />
            <GC3DComponentPanel />
        </div>

        {/* CAESAR II Paradigm: Permanently Docked DataGrid Panel */}
        <div style={{ height: dataGridCollapsed ? '40px' : '30%', minHeight: dataGridCollapsed ? '40px' : '200px', borderTop: '2px solid #334155', background: '#0f172a', display: 'flex', flexDirection: 'column', transition: 'height 0.3s, min-height 0.3s' }}>
            <div
               style={{ padding: '8px 16px', background: '#1e293b', borderBottom: '1px solid #334155', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
               onClick={toggleDataGrid}
            >
                Results DataGrid
                {dataGridCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {!dataGridCollapsed && (
              <div style={{ flex: 1, overflow: 'auto' }}>
                  <GC3DDebugTable />
              </div>
            )}
        </div>
      </div>

      <GC3DDebugConsole />
    </div>
  );
};
