import React from 'react';
import { useAppStore } from '../store/appStore';
import { TransformControls } from './TransformControls';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const TransformTab = () => {
  const selectedIds = useAppStore(state => state.selectedIds);
  const components = useAppStore(state => state.components);
  const mode = useAppStore(state => state.transformMode);

  const selectedComps = components.filter(c => selectedIds.has(c.id));
  
  // Basic classification
  let resultType = 'None';
  if (selectedComps.length > 0) {
     if (mode === 'L') resultType = 'L-Bend';
     else if (mode === 'Z') resultType = 'Z-Bend';
     else if (mode === 'Loop') resultType = 'Loop';
     else resultType = selectedComps.length === 2 ? 'L-Bend' : selectedComps.length === 3 ? 'Z-Bend' : 'Complex';
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', color: '#f8fafc', background: '#0f172a' }}>
      <TransformControls />
      <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0', color: '#f8fafc' }}>
                Transformation Status
              </h2>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                {selectedComps.length} active segments analyzed
              </p>
            </div>
            {resultType !== 'None' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '999px', fontWeight: '600', fontSize: '14px' }}>
                <CheckCircle size={18} />
                {resultType} Detected
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '999px', fontWeight: '600', fontSize: '14px' }}>
                <AlertCircle size={18} />
                No selection
              </div>
            )}
          </div>

          <div style={{ padding: '32px' }}>
            {selectedComps.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
                <p>Please select segments in the 3D Viewer first.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedComps.map(c => (
                  <div key={c.id} style={{ padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                      <span style={{ fontWeight: '600', color: '#e2e8f0', minWidth: '80px' }}>ID: {c.id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontFamily: 'monospace', color: '#94a3b8', fontSize: '13px' }}>
                      <span><span style={{color: '#64748b'}}>Start:</span> [{c.start?.join(', ') || 'N/A'}]</span>
                      <span><span style={{color: '#64748b'}}>End:</span> [{c.end?.join(', ') || 'N/A'}]</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
