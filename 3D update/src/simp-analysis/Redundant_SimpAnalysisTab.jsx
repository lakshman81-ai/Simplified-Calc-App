import React, { useEffect } from 'react';
import { Redundant_SimpAnalysisCanvas } from './Redundant_SimpAnalysisCanvas';
import { CalculationsPanel } from './CalculationsPanel';
import { useSimpStore } from './store';
import { extractSubGraph } from './smart2Dconverter';

export const Redundant_SimpAnalysisTab = () => {
  const setNodes = useSimpStore(state => state.setNodes);
  const setSegments = useSimpStore(state => state.setSegments);
  const setPlane = useSimpStore(state => state.setPlane);
  const plane = useSimpStore(state => state.plane);

  // Load real geometry data
  useEffect(() => {
    // Read the current global state (populated by the vanilla parser)
    // NOTE: In a full app, this might subscribe to state changes or a global event bus.
    const tryExtract = () => {
      let comps = [];
      if (window._state && window._state.viewer3dComponents) {
        comps = window._state.viewer3dComponents;
      }
<<<<<<< Updated upstream

=======
      
>>>>>>> Stashed changes
      const graph = extractSubGraph(comps);
      setNodes(graph.nodes);
      setSegments(graph.segments);
    };

    tryExtract();
<<<<<<< Updated upstream

=======
    
>>>>>>> Stashed changes
    // Check periodically in case data arrives later (simple integration fallback)
    const interval = setInterval(tryExtract, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
<<<<<<< Updated upstream

=======
      
>>>>>>> Stashed changes
      {/* Top Bar */}
      <div style={{ height: '50px', background: '#1e1e1e', color: 'white', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #333' }}>
        <h2 style={{ margin: 0, fontSize: '18px', marginRight: '20px' }}>Smart 2D Analyzer (GCM)</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>Analysis Plane:</label>
<<<<<<< Updated upstream
          <select
            value={plane}
=======
          <select 
            value={plane} 
>>>>>>> Stashed changes
            onChange={(e) => setPlane(e.target.value)}
            style={{ padding: '5px', background: '#2c2c2c', color: 'white', border: '1px solid #555' }}
          >
            <option value="XY">XY Plane (Plan)</option>
            <option value="XZ">XZ Plane (Elevation)</option>
            <option value="YZ">YZ Plane (Elevation)</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}><Redundant_SimpAnalysisCanvas /></div>
        </div>
        <CalculationsPanel />
      </div>

    </div>
  );
};

export default Redundant_SimpAnalysisTab;
