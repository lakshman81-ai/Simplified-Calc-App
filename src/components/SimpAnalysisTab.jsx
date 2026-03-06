import React, { useEffect } from 'react';
import { SimpAnalysisCanvas } from '../simp-analysis/SimpAnalysisCanvas';
import { CalculationsPanel } from '../simp-analysis/CalculationsPanel';
import { useSimpStore } from '../simp-analysis/store';
import { extractSubGraph } from '../simp-analysis/smart2Dconverter';

export const SimpAnalysisTab = ({ geometryData }) => {
  const setNodes = useSimpStore(state => state.setNodes);
  const setSegments = useSimpStore(state => state.setSegments);
  const setPlane = useSimpStore(state => state.setPlane);
  const plane = useSimpStore(state => state.plane);

  // Load real geometry data
  useEffect(() => {
    if (geometryData && geometryData.length > 0) {
      const graph = extractSubGraph(geometryData);
      setNodes(graph.nodes);
      setSegments(graph.segments);
    }
  }, [geometryData, setNodes, setSegments]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden relative">
      <div className="flex items-center gap-4 px-4 py-3 bg-slate-800 border-b border-slate-700 z-10 w-full shrink-0">
        <h2 className="text-[17px] m-0 font-semibold text-slate-100 whitespace-nowrap">Smart 2D Analyzer (GCM)</h2>
        <div className="flex items-center gap-2 ml-4">
          <label className="text-sm text-slate-400 whitespace-nowrap">Analysis Plane:</label>
          <select
            value={plane}
            onChange={(e) => setPlane(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-[13px] text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="XY">XY Plane (Plan)</option>
            <option value="XZ">XZ Plane (Elevation)</option>
            <option value="YZ">YZ Plane (Elevation)</option>
          </select>
        </div>
      </div>
      <div className="flex flex-1 w-full overflow-hidden relative">
        <div className="flex-1 relative h-full">
          <SimpAnalysisCanvas />
        </div>
        <div className="w-80 shrink-0 border-l border-slate-700 bg-slate-800 h-full overflow-y-auto">
          <CalculationsPanel />
        </div>
      </div>
    </div>
  );
};

export default SimpAnalysisTab;
