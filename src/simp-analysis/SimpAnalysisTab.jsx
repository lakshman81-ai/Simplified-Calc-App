import React, { useEffect } from 'react';
import { SimpAnalysisCanvas } from './SimpAnalysisCanvas';
import { CalculationsPanel } from './CalculationsPanel';
import { useSimpStore } from './store';
import { extractSubGraph } from './smart2Dconverter';
import { useAppStore } from '../store/appStore';

export const SimpAnalysisTab = () => {
  const setNodes = useSimpStore(state => state.setNodes);
  const setSegments = useSimpStore(state => state.setSegments);
  const setPlane = useSimpStore(state => state.setPlane);
  const plane = useSimpStore(state => state.plane);

  // Directly subscribe to the central Zustand store for viewer components
  const components = useAppStore(state => state.components);

  // Load real geometry data reactively when components change
  useEffect(() => {
    let compsToProcess = components;
    
    // Fallback just in case they are still in window._state but not in Zustand
    if ((!compsToProcess || compsToProcess.length === 0) && window._state && window._state.viewer3dComponents) {
      compsToProcess = window._state.viewer3dComponents;
    }

    const graph = extractSubGraph(compsToProcess);
    setNodes(graph.nodes);
    setSegments(graph.segments);
  }, [components, setNodes, setSegments]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Top Bar */}
      <div style={{ height: '50px', background: '#1e1e1e', color: 'white', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #333' }}>
        <h2 style={{ margin: 0, fontSize: '18px', marginRight: '20px' }}>Smart 2D Analyzer (GCM)</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>Analysis Plane:</label>
          <select 
            value={plane} 
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
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}><SimpAnalysisCanvas /></div>
        </div>
        <CalculationsPanel />
      </div>

    </div>
  );
};

export default SimpAnalysisTab;
