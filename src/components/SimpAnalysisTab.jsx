import React, { useEffect, useState } from 'react';
import { SimpAnalysisCanvas } from '../simp-analysis/SimpAnalysisCanvas';
import { CalculationsPanel } from '../simp-analysis/CalculationsPanel';
import { useSimpStore } from '../simp-analysis/store';
import { extractSubGraph } from '../simp-analysis/smart2Dconverter';
import { useAppStore } from '../store/appStore';

export const SimpAnalysisTab = () => {
  const setNodes = useSimpStore(state => state.setNodes);
  const setSegments = useSimpStore(state => state.setSegments);
  const setPlane = useSimpStore(state => state.setPlane);
  const plane = useSimpStore(state => state.plane);
  const batchAnalysisData = useAppStore(state => state.batchAnalysisData);

  const [activeGeoTab, setActiveGeoTab] = useState('');

  // Set initial active tab when batch data arrives
  useEffect(() => {
    if (batchAnalysisData && batchAnalysisData.length > 0 && !activeGeoTab) {
      setActiveGeoTab(batchAnalysisData[0].name);
    } else if (!batchAnalysisData || batchAnalysisData.length === 0) {
      setActiveGeoTab('');
    }
  }, [batchAnalysisData]);

  // Load transformed geometry payload from the batch into SimpStore
  useEffect(() => {
    const payload = batchAnalysisData?.find(b => b.name === activeGeoTab);

    if (payload && payload.segments && payload.segments.length > 0) {
      const pSegments = payload.segments;
      const nodes = {};
      const segments = [];
      let nid = 0;

      // Ensure plane aligns with what was transformed
      if (payload.plane && payload.plane !== 'Auto (Logical)') {
         setPlane(payload.plane);
      }

      // Convert the mapped 2D segments into the nodes/segments expected by SimpStore
      const getOrAddNode = (pt) => {
         const hash = `${pt[0].toFixed(2)},${pt[1].toFixed(2)}`;
         if (!nodes[hash]) {
             nodes[hash] = { id: `N${nid++}`, pos: [pt[0], pt[1], 0], type: 'node' };
         }
         return nodes[hash].id;
      };

      pSegments.forEach(seg => {
         const id1 = getOrAddNode(seg.start2D);
         const id2 = getOrAddNode(seg.end2D);
         segments.push({
             start: id1,
             end: id2,
             type: 'PIPE',
             length: seg.trueLength,
             material: payload.materials[seg.material] || 'Unknown'
         });
      });

      // Format final nodes object
      const finalNodes = {};
      Object.values(nodes).forEach(n => finalNodes[n.id] = n);

      setNodes(finalNodes);
      setSegments(segments);
    } else {
        // Fallback or empty state
        setNodes({});
        setSegments([]);
    }
  }, [activeGeoTab, batchAnalysisData, setNodes, setSegments, setPlane]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden relative">
      <div className="flex items-center gap-4 px-4 py-3 bg-slate-800 border-b border-slate-700 z-10 w-full shrink-0">
        <h2 className="text-[17px] m-0 font-semibold text-slate-100 whitespace-nowrap">Smart 2D Analyzer (GCM)</h2>

        {/* Batch Sub-Navigation Tabs */}
        {batchAnalysisData && batchAnalysisData.length > 1 && (
            <div className="flex items-center gap-2 ml-6">
                {batchAnalysisData.map(geo => (
                    <button
                        key={geo.name}
                        onClick={() => setActiveGeoTab(geo.name)}
                        className={`px-3 py-1 text-sm font-semibold rounded transition-colors ${activeGeoTab === geo.name ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        {geo.name}
                    </button>
                ))}
            </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
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
