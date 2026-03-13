import React from 'react';
import { useExtendedStore } from '../store';

export const ConfigPanel = () => {
  const config = useExtendedStore((state) => state.config);
  const updateConfig = useExtendedStore((state) => state.updateConfig);

  const toggleSolver = (solverName) => {
    const currentSolvers = config.activeSolvers;
    if (currentSolvers.includes(solverName)) {
      updateConfig({ activeSolvers: currentSolvers.filter(s => s !== solverName) });
    } else {
      updateConfig({ activeSolvers: [...currentSolvers, solverName] });
    }
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#1e293b', borderRadius: '8px', color: 'white' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Calc Extended Config</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label>
          <input
            type="checkbox"
            checked={config.useB313Legacy}
            onChange={(e) => updateConfig({ useB313Legacy: e.target.checked })}
          />
          Use B31.3 Legacy App D
        </label>

        <label>
          <input
            type="checkbox"
            checked={config.applyStressRangeReduction}
            onChange={(e) => updateConfig({ applyStressRangeReduction: e.target.checked })}
          />
          Apply Stress Range Reduction (f)
        </label>

        <label>
          <input
            type="checkbox"
            checked={config.verboseDebug}
            onChange={(e) => updateConfig({ verboseDebug: e.target.checked })}
          />
          Verbose Debug Mode
        </label>

        <h4 style={{ margin: '10px 0 5px 0' }}>Active Solvers</h4>
        <label>
          <input
            type="checkbox"
            checked={config.activeSolvers.includes('thermal')}
            onChange={() => toggleSolver('thermal')}
          />
          Thermal Expansion
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.activeSolvers.includes('sif')}
            onChange={() => toggleSolver('sif')}
          />
          Flexibility & SIF
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.activeSolvers.includes('guided_cantilever')}
            onChange={() => toggleSolver('guided_cantilever')}
          />
          Guided Cantilever
        </label>
      </div>
    </div>
  );
};
