import React, { useState } from 'react';
import { solveSystem } from '../engine/ExtendedSolver';
import { mockUIGeometries } from '../__tests__/ui-mock-data';
import { useExtendedStore } from '../store/useExtendedStore';

/**
 * Placeholder UI component simulating the graphical assignment of a 3D geometry
 * to a desired configuration, invoking the derived extended solver.
 */
export const ConfigSelector = () => {
  const [selectedConfig, setSelectedConfig] = useState('LBend');
  const [results, setResults] = useState(null);

  // Access global config (e.g., debug toggles, temp overrides) from isolated store
  const { config } = useExtendedStore();

  const handleCalculate = () => {
    // 1. Get the mocked 3D geometry payload from the "graphics engine"
    const payload = mockUIGeometries.geometries[selectedConfig];

    // 2. Pass it to the routing ExtendedSolver
    // The solver will automatically detect the node/element signature
    // and route it to lBendSolver, zBendSolver, or uLoopSolver.
    const solverResults = solveSystem(payload, config);

    // 3. Update local UI state with results
    setResults(solverResults);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h2>Graphic Geometry Configuration Selector</h2>
      <p>Simulates a user dragging/assigning a 3D layout to test the modular solver.</p>

      <select
        value={selectedConfig}
        onChange={(e) => setSelectedConfig(e.target.value)}
        style={{ padding: '8px', marginRight: '10px' }}
      >
        <option value="LBend">L-Bend Geometry (3 Nodes, 2 Elements)</option>
        <option value="ZBend">Z-Bend Geometry (4 Nodes, 3 Elements)</option>
        <option value="ULoop">3D U-Loop Geometry (6 Nodes, 5 Elements)</option>
      </select>

      <button onClick={handleCalculate} style={{ padding: '8px 16px' }}>
        Run Extended Solver
      </button>

      {results && (
        <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '10px', color: '#000' }}>
          <h3 style={{ color: '#000' }}>Solver Results</h3>
          {results.error ? (
            <p style={{ color: 'red' }}>Error: {results.error}</p>
          ) : (
            <>
              <p style={{ color: '#000' }}><strong>Max Stress:</strong> {results.maxStress.toFixed(2)} MPa</p>
              <h4 style={{ color: '#000' }}>Logs:</h4>
              <ul style={{ fontSize: '12px', color: '#555' }}>
                {results.logs && results.logs.map((log, idx) => <li key={idx}>{log}</li>)}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigSelector;
