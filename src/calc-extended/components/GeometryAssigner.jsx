import React from 'react';
import { useExtendedStore } from '../store';
import { mockGeometries } from '../mock-data';

export const GeometryAssigner = () => {
  const setNodes = useExtendedStore((state) => state.setNodes);
  const runSolver = useExtendedStore((state) => state.runSolver);

  const handleAssignGeometry = (geometryKey) => {
    const geometry = mockGeometries[geometryKey];
    if (geometry) {
      setNodes(geometry);
      // Let the user know it was assigned
      const store = useExtendedStore.getState();
      store.appendLog(`Geometry "${geometryKey}" assigned to solver.`);
      runSolver();
    }
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#334155', borderRadius: '8px', color: 'white', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ margin: 0 }}>Assign Geometry to Solver</h3>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => handleAssignGeometry('LBend')}
          style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          L-Bend
        </button>
        <button
          onClick={() => handleAssignGeometry('ZBend')}
          style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Z-Bend
        </button>
        <button
          onClick={() => handleAssignGeometry('ExpansionU')}
          style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          3D Expansion U-Loop
        </button>
      </div>
    </div>
  );
};
