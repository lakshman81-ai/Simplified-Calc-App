import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { TransformControls } from './TransformControls';
import { CheckCircle, AlertCircle, Settings2, Database, ArrowRight } from 'lucide-react';
import { transformTo2D } from '../transform/projection';
import { extractSubGraph, analyzePipingSystem } from '../simp-analysis/smart2Dconverter';
import { log } from '../utils/logger';

// Very simple 2D Wireframe render
const GhostProjectionCanvas = ({ segments2D, plane }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !segments2D || segments2D.length === 0) return;
        const ctx = canvasRef.current.getContext('2d');
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        ctx.clearRect(0, 0, width, height);

        // Find bounding box to scale and center
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        segments2D.forEach(seg => {
            minX = Math.min(minX, seg.start2D[0], seg.end2D[0]);
            maxX = Math.max(maxX, seg.start2D[0], seg.end2D[0]);
            minY = Math.min(minY, seg.start2D[1], seg.end2D[1]);
            maxY = Math.max(maxY, seg.start2D[1], seg.end2D[1]);
        });

        const padding = 40;
        const dX = maxX - minX || 1;
        const dY = maxY - minY || 1;

        const scale = Math.min((width - padding*2) / dX, (height - padding*2) / dY);

        ctx.strokeStyle = '#38bdf8'; // Light blue wireframe
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        segments2D.forEach((seg, i) => {
            const x1 = padding + (seg.start2D[0] - minX) * scale;
            const y1 = height - (padding + (seg.start2D[1] - minY) * scale); // Flip Y
            const x2 = padding + (seg.end2D[0] - minX) * scale;
            const y2 = height - (padding + (seg.end2D[1] - minY) * scale);

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        });
        ctx.stroke();

        // Draw nodes
        ctx.fillStyle = '#f8fafc';
        segments2D.forEach((seg, i) => {
             const x1 = padding + (seg.start2D[0] - minX) * scale;
             const y1 = height - (padding + (seg.start2D[1] - minY) * scale);
             const x2 = padding + (seg.end2D[0] - minX) * scale;
             const y2 = height - (padding + (seg.end2D[1] - minY) * scale);

             ctx.beginPath(); ctx.arc(x1, y1, 4, 0, 2*Math.PI); ctx.fill();
             ctx.beginPath(); ctx.arc(x2, y2, 4, 0, 2*Math.PI); ctx.fill();
        });

    }, [segments2D, plane]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '250px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 8, left: 12, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>
                Ghost Projection ({plane})
            </div>
            <canvas ref={canvasRef} width={600} height={250} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};


export const TransformTab = () => {
  const selectedIds = useAppStore(state => state.selectedIds);
  const components = useAppStore(state => state.components);
  const mode = useAppStore(state => state.transformMode);
  const setActiveTab = useAppStore(state => state.setActiveTab);

  const smart2DConversionEnabled = useAppStore(state => state.smart2DConversionEnabled);
  const setSmart2DConversionEnabled = useAppStore(state => state.setSmart2DConversionEnabled);

  const materialMapping = useAppStore(state => state.materialMapping);
  const updateMaterialMapping = useAppStore(state => state.updateMaterialMapping);

  const setProcessingStage = useAppStore(state => state.setProcessingStage);
  const setAnalysisPayload = useAppStore(state => state.setAnalysisPayload);

  const selectedComps = useMemo(() => components.filter(c => selectedIds.has(c.id)), [components, selectedIds]);
  
  // Basic classification
  let resultType = 'None';
  if (selectedComps.length > 0) {
     if (mode === 'L') resultType = 'L-Bend';
     else if (mode === 'Z') resultType = 'Z-Bend';
     else if (mode === 'Loop') resultType = 'Loop';
     else resultType = selectedComps.length === 2 ? 'L-Bend' : selectedComps.length === 3 ? 'Z-Bend' : 'Complex';
  }

  // Find unique materials to map
  const uniqueMaterials = useMemo(() => {
    const mats = new Set();
    selectedComps.forEach(c => {
      const mat = c.attributes?.MATERIAL || c.attributes?.['ITEM-CODE'];
      if (mat) mats.add(mat);
    });
    return Array.from(mats);
  }, [selectedComps]);

  // Compute the 2D transformation data
  const { transformedData, logs } = useMemo(() => {
    if (selectedComps.length === 0) return { transformedData: null, logs: [] };

    let result;
    if (smart2DConversionEnabled) {
       // Old legacy logical approach
       // First, extract generic segments to run the logic on
       const graph = extractSubGraph(selectedComps);

       // map start and end back to coordinates for analyzePipingSystem
       const rawLegs = graph.segments.map(seg => {
           const n1 = graph.nodes[seg.start];
           const n2 = graph.nodes[seg.end];
           if(!n1 || !n2) return null;

           const dx = n2.pos[0] - n1.pos[0];
           const dy = n2.pos[1] - n1.pos[1];
           const dz = n2.pos[2] - n1.pos[2];

           let axis = 'X'; let sign = '+';
           if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > Math.abs(dz)) { axis = 'X'; sign = dx > 0 ? '+' : '-'; }
           else if (Math.abs(dy) > Math.abs(dz)) { axis = 'Y'; sign = dy > 0 ? '+' : '-'; }
           else { axis = 'Z'; sign = dz > 0 ? '+' : '-'; }

           return {
               start: n1.pos,
               end: n2.pos,
               axis,
               sign,
               length: Math.sqrt(dx*dx + dy*dy + dz*dz),
               hasGuide: false
           };
       }).filter(Boolean);

       result = analyzePipingSystem(rawLegs);
       // Construct a fake transformed payload for compatibility

       // Build sequential 2D coordinates for visual preview
       let curX = 0; let curY = 0;
       const projectedSegs = result.processedGeometry.map((leg, i) => {
            const l = leg.length;
            const start2D = [curX, curY, 0];
            if (leg.axis === 'X') curX += (leg.sign === '+' ? l : -l);
            else if (leg.axis === 'Y' || leg.axis === 'Z') curY += (leg.sign === '+' ? l : -l);
            const end2D = [curX, curY, 0];

            return {
                id: `Leg-${i}`,
                start2D,
                end2D,
                trueLength: l,
                axis: leg.axis
            };
       });

       return {
           transformedData: {
               plane: 'Auto (Logical)',
               segments2D: projectedSegs
           },
           logs: result.logs
       };

    } else {
       // Matrix Projection approach
       const segments = selectedComps.filter(c => c.type === 'PIPE').map(c => {
           return {
               id: c.id,
               start: [c.points[0].x, c.points[0].y, c.points[0].z],
               end: [c.points[1].x, c.points[1].y, c.points[1].z],
               material: c.attributes?.MATERIAL || c.attributes?.['ITEM-CODE']
           };
       });
       const targetPlane = mode === 'Auto' ? 'Auto' : (mode === 'L' || mode === 'Z') ? 'XZ' : 'XY'; // simplify mode translation
       const proj = transformTo2D(segments, targetPlane);

       return { transformedData: proj, logs: ['Matrix projection successful.'] };
    }
  }, [selectedComps, smart2DConversionEnabled, mode]);

  useEffect(() => {
     if(transformedData) {
         setProcessingStage('stage2', transformedData);
     }
  }, [transformedData, setProcessingStage]);

  const handleProceed = () => {
    if (!transformedData) return;

    const payload = {
        plane: transformedData.plane,
        segments: transformedData.segments2D || [],
        matrix: transformedData.matrix, // may be undefined for smart2D
        materials: materialMapping,
        timestamp: Date.now()
    };
    setAnalysisPayload(payload);
    setActiveTab('simpAnalysis');
    log('info', 'TransformTab', 'Proceeded to Analysis with payload', payload);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', color: '#f8fafc', background: '#0f172a' }}>
      <TransformControls />
      <div style={{ padding: '32px', flex: 1, overflowY: 'auto', display: 'flex', gap: '24px' }}>

        {/* LEFT COLUMN: Settings & Mapping */}
        <div style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', margin: '0 0 16px 0' }}>
                    <Settings2 size={18} /> Processing Engine
                </h3>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={smart2DConversionEnabled}
                        onChange={e => setSmart2DConversionEnabled(e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500' }}>Smart 2D Conversion</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Use logical reduction (L/Z detection, negligible leg removal). If off, uses strict matrix projection.</span>
                    </div>
                </label>
            </div>

            <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', margin: '0 0 16px 0' }}>
                    <Database size={18} /> Material Database Mapping
                </h3>
                {uniqueMaterials.length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#64748b' }}>No materials found in selection.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {uniqueMaterials.map(mat => (
                            <div key={mat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', color: '#cbd5e1' }}>3D CA: <b>{mat}</b></label>
                                <input
                                    type="text"
                                    placeholder="2D Bundle Material Name"
                                    value={materialMapping[mat] || ''}
                                    onChange={e => updateMaterialMapping(mat, e.target.value)}
                                    style={{ padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={handleProceed}
                disabled={selectedComps.length === 0}
                style={{
                    marginTop: 'auto',
                    padding: '16px',
                    background: selectedComps.length > 0 ? '#10b981' : '#334155',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: selectedComps.length > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                Proceed to Analysis <ArrowRight size={18} />
            </button>
        </div>

        {/* RIGHT COLUMN: Table & Preview */}
        <div style={{ flex: 1, background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0', color: '#f8fafc' }}>
                Transformation Status
              </h2>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                {selectedComps.length} active segments analyzed. Projection Plane: <b style={{color: '#38bdf8'}}>{transformedData?.plane || 'None'}</b>
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

          <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
            {selectedComps.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
                <p>Please select segments in the 3D Viewer first.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* 2D Ghost Preview Canvas */}
                <GhostProjectionCanvas segments2D={transformedData?.segments2D} plane={transformedData?.plane} />

                {/* 2D Transformation Table */}
                <div>
                    <h4 style={{ margin: '0 0 12px 0', color: '#e2e8f0' }}>2D Transformation Table</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8' }}>
                                <th style={{ padding: '12px 8px' }}>Leg / ID</th>
                                <th style={{ padding: '12px 8px' }}>Start 2D [X, Y, Z]</th>
                                <th style={{ padding: '12px 8px' }}>End 2D [X, Y, Z]</th>
                                <th style={{ padding: '12px 8px' }}>True L.</th>
                                <th style={{ padding: '12px 8px' }}>Mapped Material</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transformedData?.segments2D?.map((seg, i) => {
                                const matRaw = seg.material || 'Unknown';
                                const mapped = materialMapping[matRaw] || 'Not Mapped';
                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                                        <td style={{ padding: '12px 8px', color: '#38bdf8', fontWeight: '500' }}>{seg.id || `Leg-${i+1}`}</td>
                                        <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>
                                            {seg.start2D ? `[${seg.start2D.map(n=>n.toFixed(1)).join(', ')}]` : 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>
                                            {seg.end2D ? `[${seg.end2D.map(n=>n.toFixed(1)).join(', ')}]` : 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 8px' }}>{seg.trueLength?.toFixed(1) || '0.0'}</td>
                                        <td style={{ padding: '12px 8px' }}>
                                            <span style={{
                                                background: mapped === 'Not Mapped' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: mapped === 'Not Mapped' ? '#f87171' : '#34d399',
                                                padding: '2px 6px', borderRadius: '4px'
                                            }}>
                                                {mapped}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Engine Logs */}
                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' }}>Processing Engine Logs</h4>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {logs.length > 0 ? logs.map((l, i) => <div key={i}>{l}</div>) : 'No logs generated.'}
                    </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
