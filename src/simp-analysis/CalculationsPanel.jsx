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
    <div className="flex flex-col gap-6 p-6 h-full text-slate-200">
      
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-700">Process Parameters</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(params).map(([key, val]) => (
            <div key={key}>
              <label className="block text-xs text-slate-500 mb-1">{key}</label>
              <input 
                type="number" 
                value={val} 
                onChange={(e) => setParams({ [key]: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-700">Flexibility Analysis</h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between items-center"><span className="text-slate-400">Gen. Leg (L1):</span> <strong className="font-mono">{stats.genLeg.toFixed(1)} mm</strong></div>
          <div className="flex justify-between items-center"><span className="text-slate-400">Abs. Leg (L2):</span> <strong className="font-mono">{stats.absLeg.toFixed(1)} mm</strong></div>
          <div className="flex justify-between items-center"><span className="text-slate-400">Expansion (dx):</span> <strong className="font-mono">{stats.dx.toFixed(2)} mm</strong></div>
          <hr className="border-slate-700 border-dashed my-2" />
          <div className="flex justify-between items-center"><span className="text-slate-400">Required Length:</span> <strong className="font-mono">{stats.Lreq.toFixed(1)} mm</strong></div>
          <div className="flex justify-between items-center"><span className="text-slate-400">Actual Stress:</span> <strong className="font-mono">{stats.Scalc.toFixed(2)} MPa</strong></div>
          <div className="flex justify-between items-center"><span className="text-slate-400">Allowable Stress:</span> <strong className="font-mono">{params.Sa.toFixed(2)} MPa</strong></div>
        </div>
      </div>

      <div className="mt-auto p-4 rounded-lg text-center font-bold text-lg" style={{ backgroundColor: statusColor }}>
        {ratio === 0 ? 'Awaiting Data...' : statusText}
      </div>

    </div>
  );
};
