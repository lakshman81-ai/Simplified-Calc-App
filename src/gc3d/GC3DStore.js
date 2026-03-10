import { create } from 'zustand';
import { sectionProperties, thermalDisplacement, gcBasic, gcWithFlexibility, intensifiedStress, combineStressAtNode, allowableStress, requiredLegLength, stressCheck } from './GC3DCalcEngine';
import { getSIFData } from './GC3DSIFEngine';
import { getMaterialProperties } from '../utils/materialUtils';

export const useGC3DStore = create((set, get) => ({
  nodes: {},
  segments: [],
  includeSIF: true,
  params: {
    deltaT_F: 380,
    installTemp_F: 70,
    designTemp_F: 450,
    E_psi: 27000000,
    alpha_in_in_F: 6.72e-6,
    Sc_psi: 20000,
    Sh_psi: 19400,
    f: 1.0,
    Sa_psi: 29850,
  },
  fittingData: {},
  legResults: [],
  nodeResults: [],
  criticalNode: null,
  overallResult: null,
  debugLog: [],
  selectedSegmentIds: new Set(),
  selectedNodeId: null,
  activeSubTab: '3dview',
  unitSystem: 'imperial',
  consoleCollapsed: false,
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool, selectedSegmentIds: new Set(), selectedNodeId: null }),
  cameraViewMode: 'auto',
  setCameraViewMode: (mode) => set({ cameraViewMode: mode }),
  config: {
    gridSnap_mm: 100,
    displayPrecision: { stress: 0, sif: 3, length: 1, force: 0 },
    defaultMaterial: 'Carbon steels, C ≤ 0.3%',
    sifMinimum: 1.0,
  },

  setNodes: (nodes) => set({ nodes }),
  setSegments: (segments) => { set({ segments }); get().runAnalysis(); },
  setIncludeSIF: (val) => { set({ includeSIF: val }); get().runAnalysis(); },
  setParams: (p) => {
    set(s => ({ params: { ...s.params, ...p } }));
    const { f, Sc_psi, Sh_psi } = { ...get().params, ...p };
    set(s => ({ params: { ...s.params, Sa_psi: f * (1.25 * Sc_psi + 0.25 * Sh_psi) } }));
    get().runAnalysis();
  },
  setSelectedSegment: (id) => set({ selectedSegmentIds: new Set([id]), selectedNodeId: null }),
  toggleSegmentSelection: (id, multi) => set(s => {
      const newSet = new Set(multi ? s.selectedSegmentIds : []);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return { selectedSegmentIds: newSet, selectedNodeId: null };
  }),
  setSelectedNode: (id) => set({ selectedNodeId: id, selectedSegmentIds: new Set() }),
  clearSelection: () => set({ selectedSegmentIds: new Set(), selectedNodeId: null }),
  setActiveSubTab: (tab) => set({ activeSubTab: tab }),
  setUnitSystem: (sys) => set({ unitSystem: sys }),
  toggleConsole: () => set(s => ({ consoleCollapsed: !s.consoleCollapsed })),
  log: (step, msg) => set(s => ({ debugLog: [...s.debugLog, { step, msg, timestamp: Date.now() }] })),
  clearLog: () => set({ debugLog: [] }),

  moveNode: (id, newPos) => {
    set(s => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], pos: newPos } } }));
    get().recalcSegmentLengths();
    get().runAnalysis();
  },

  recalcSegmentLengths: () => {
    const { nodes, segments } = get();
    const updated = segments.map(seg => {
      const n1 = nodes[seg.startNode]?.pos;
      const n2 = nodes[seg.endNode]?.pos;
      if (!n1 || !n2) return seg;
      const dx = n2[0]-n1[0], dy = n2[1]-n1[1], dz = n2[2]-n1[2];
      const length_mm = Math.sqrt(dx*dx + dy*dy + dz*dz);
      return { ...seg, length_in: length_mm / 25.4 };
    });
    set({ segments: updated });
  },

  updateSegmentProperty: (segId, updates) => {
    const { segments, fittingData } = get();
    const segIdx = segments.findIndex(s => s.id === segId);
    if (segIdx === -1) return;

    const newSegments = [...segments];
    const seg = newSegments[segIdx];

    // Apply updates (od_in, wt_in, material, etc.)
    newSegments[segIdx] = { ...seg, ...updates };

    // If geometry changed, recalculate SIF data for this fitting
    const newFittingData = { ...fittingData };
    if (updates.od_in !== undefined || updates.wt_in !== undefined) {
      newFittingData[segId] = getSIFData(
        seg.compType,
        newSegments[segIdx].od_in,
        newSegments[segIdx].wt_in,
        true,
        'LR'
      );
    }

    set({ segments: newSegments, fittingData: newFittingData });

    // If material changed, attempt to update global params (simplified assumption: system uses 1 material)
    if (updates.material) {
        const tempC = (get().params.designTemp_F - 32) * 5 / 9;
        const props = getMaterialProperties(
            updates.material,
            tempC,
            newSegments[segIdx].od_in * 25.4,
            newSegments[segIdx].wt_in * 25.4
        );
        if (props && props.E) {
            const E_psi = parseFloat(props.E) / 0.00689476;
            const alpha_F = parseFloat(props.alpha) / 1.8;
            const Sa_psi = parseFloat(props.Sa) / 0.00689476;
            set(s => ({
                params: {
                    ...s.params,
                    E_psi,
                    alpha_in_in_F: alpha_F,
                    Sa_psi
                }
            }));
        }
    }

    get().runAnalysis();
  },

  adjustSegmentDelta: (segId, dx, dy, dz) => {
    const { nodes, segments } = get();
    const segIdx = segments.findIndex(s => s.id === segId);
    if (segIdx === -1) return;

    const seg = segments[segIdx];
    const startNode = nodes[seg.startNode];
    const endNode = nodes[seg.endNode];

    if (!startNode || !endNode) return;

    const newEndPos = [
        startNode.pos[0] + dx,
        startNode.pos[1] + dy,
        startNode.pos[2] + dz
    ];

    const deltaNode = {
        x: newEndPos[0] - endNode.pos[0],
        y: newEndPos[1] - endNode.pos[1],
        z: newEndPos[2] - endNode.pos[2]
    };

    // Shift endNode and all downstream nodes
    const newNodes = { ...nodes };

    // Simple graph traversal to find downstream nodes
    const visited = new Set();
    const toVisit = [seg.endNode];

    while (toVisit.length > 0) {
        const curr = toVisit.pop();
        if (visited.has(curr)) continue;
        visited.add(curr);

        newNodes[curr] = {
            ...newNodes[curr],
            pos: [
                newNodes[curr].pos[0] + deltaNode.x,
                newNodes[curr].pos[1] + deltaNode.y,
                newNodes[curr].pos[2] + deltaNode.z
            ]
        };

        // Find segments starting from this node
        segments.forEach(s => {
            if (s.startNode === curr && !visited.has(s.endNode)) {
                toVisit.push(s.endNode);
            }
        });
    }

    // Recalculate lengths for affected segments
    const newSegments = segments.map(s => {
        if (visited.has(s.startNode) || visited.has(s.endNode) || s.id === segId) {
            const n1 = newNodes[s.startNode];
            const n2 = newNodes[s.endNode];
            if (n1 && n2) {
                const ldx = n2.pos[0] - n1.pos[0];
                const ldy = n2.pos[1] - n1.pos[1];
                const ldz = n2.pos[2] - n1.pos[2];
                const newLen = Math.sqrt(ldx*ldx + ldy*ldy + ldz*ldz) / 25.4; // to inches
                return { ...s, length_in: newLen };
            }
        }
        return s;
    });

    set({ nodes: newNodes, segments: newSegments });
    get().runAnalysis();
  },

  splitSegmentAtPoint: (segId, point) => {
    const { nodes, segments, fittingData } = get();
    const segIdx = segments.findIndex(s => s.id === segId);
    if (segIdx === -1) return;

    const origSeg = segments[segIdx];
    const startNode = nodes[origSeg.startNode];
    const endNode = nodes[origSeg.endNode];

    if (!startNode || !endNode) return;

    // Calculate direction vector to create a visual gap
    const dir = {
        x: endNode.pos[0] - startNode.pos[0],
        y: endNode.pos[1] - startNode.pos[1],
        z: endNode.pos[2] - startNode.pos[2]
    };
    const totalLen = Math.sqrt(dir.x*dir.x + dir.y*dir.y + dir.z*dir.z);

    dir.x /= totalLen; dir.y /= totalLen; dir.z /= totalLen;

    // Gap size
    const gapHalf = 50;

    const t = Date.now();
    const nId1 = `N${t}-A`;
    const nId2 = `N${t}-B`;

    const pos1 = [point.x - dir.x * gapHalf, point.y - dir.y * gapHalf, point.z - dir.z * gapHalf];
    const pos2 = [point.x + dir.x * gapHalf, point.y + dir.y * gapHalf, point.z + dir.z * gapHalf];

    const newNodes = {
        ...nodes,
        [nId1]: { pos: pos1, type: 'anchor', label: 'Anchor A' },
        [nId2]: { pos: pos2, type: 'anchor', label: 'Anchor B' }
    };

    const dx1 = pos1[0] - startNode.pos[0];
    const dy1 = pos1[1] - startNode.pos[1];
    const dz1 = pos1[2] - startNode.pos[2];
    const len1_in = Math.sqrt(dx1*dx1 + dy1*dy1 + dz1*dz1) / 25.4;

    const dx2 = endNode.pos[0] - pos2[0];
    const dy2 = endNode.pos[1] - pos2[1];
    const dz2 = endNode.pos[2] - pos2[2];
    const len2_in = Math.sqrt(dx2*dx2 + dy2*dy2 + dz2*dz2) / 25.4;

    const seg1 = { ...origSeg, id: `${origSeg.id}-A`, endNode: nId1, length_in: len1_in };
    const seg2 = { ...origSeg, id: `${origSeg.id}-B`, startNode: nId2, length_in: len2_in };

    const newSegments = [...segments];
    newSegments.splice(segIdx, 1, seg1, seg2);

    const newFittingData = { ...fittingData };
    if (newFittingData[origSeg.id]) {
        newFittingData[seg1.id] = { ...newFittingData[origSeg.id] };
        newFittingData[seg2.id] = { ...newFittingData[origSeg.id] };
        delete newFittingData[origSeg.id];
    } else {
        newFittingData[seg1.id] = getSIFData(seg1.compType, seg1.od_in, seg1.wt_in, true, 'LR');
        newFittingData[seg2.id] = getSIFData(seg2.compType, seg2.od_in, seg2.wt_in, true, 'LR');
    }

    set({ nodes: newNodes, segments: newSegments, fittingData: newFittingData, activeTool: 'select' });
    get().runAnalysis();
  },

  runAnalysis: () => {
    get().clearLog();
    const { nodes, segments, params, includeSIF, fittingData } = get();
    get().log(0, "Starting GC 3D analysis...");

    if (!nodes || Object.keys(nodes).length < 2 || !segments || segments.length === 0) {
      get().log(1, "Validation failed: Need >=2 nodes and >=1 segment.");
      return;
    }
    const E = params.E_psi;
    const alpha = params.alpha_in_in_F;
    const deltaT = params.deltaT_F;

    get().log(1, `Validated: ${segments.length} segments, ${Object.keys(nodes).length} nodes`);

    // We assume uniform pipe for simplicity, take first segment's pipe
    const mainSeg = segments[0];
    const D_o = mainSeg.od_in;
    const t_n = mainSeg.wt_in;
    const { I, Z } = sectionProperties(D_o, t_n);
    const unitSystem = get().unitSystem;
    const isSI = unitSystem === 'si';

    // Formatting helpers
    const fIn = val => isSI ? `${(val * 25.4).toFixed(1)} mm` : `${val.toFixed(3)} in`;
    const fStress = val => isSI ? `${(val * 0.00689476).toFixed(0)} MPa` : `${val.toFixed(0)} psi`;
    const fForce = val => isSI ? `${(val * 4.44822).toFixed(0)} N` : `${val.toFixed(0)} lbf`;
    const fMoment = val => isSI ? `${(val * 112.985 / 1000).toFixed(0)} N·m` : `${val.toFixed(0)} in·lbf`;

    get().log(2, `Section: D_o=${fIn(D_o)}, t=${fIn(t_n)}, I=${I.toFixed(2)}in⁴, Z=${Z.toFixed(2)}in³`);

    // Determine displacements per axis
    const totalRuns = { X: 0, Y: 0, Z: 0 };
    segments.forEach(seg => {
      if (seg.axis === 'X') totalRuns.X += seg.length_in;
      if (seg.axis === 'Y') totalRuns.Y += seg.length_in;
      if (seg.axis === 'Z') totalRuns.Z += seg.length_in;
    });

    const deltas = {
      X: thermalDisplacement(alpha, totalRuns.X, deltaT),
      Y: thermalDisplacement(alpha, totalRuns.Y, deltaT),
      Z: thermalDisplacement(alpha, totalRuns.Z, deltaT)
    };
    get().log(4, `Thermal displacements: δ_X=${fIn(deltas.X)}, δ_Y=${fIn(deltas.Y)}, δ_Z=${fIn(deltas.Z)}`);

    const legResults = [];
    segments.forEach(seg => {
       const perpAxes = ['X', 'Y', 'Z'].filter(a => a !== seg.axis);
       let Sb_components = [];
       const data = fittingData[seg.id] || { k: 1.0, i_i: 1.0, R_e: 0 };
       const k = includeSIF ? data.k : 1.0;
       const i_i = includeSIF ? data.i_i : 1.0;
       const R_e = data.R_e;

       let totalF = 0, totalM = 0;
       perpAxes.forEach(p => {
          const d = deltas[p];
          if (d <= 0) return;
          let F, M, Sb;
          if (k > 1.0 && R_e > 0) {
             const res = gcWithFlexibility(E, I, Z, D_o, d, seg.length_in, k, R_e);
             F = res.F_lbf; M = res.M_inlbf; Sb = res.Sb_psi;
          } else {
             const res = gcBasic(E, I, Z, D_o, d, seg.length_in);
             F = res.F_lbf; M = res.M_inlbf; Sb = res.Sb_psi;
          }
          const SE = i_i * Sb;
          Sb_components.push(SE);
          totalF += F; totalM += M;
       });

       const Sb_combined = combineStressAtNode(Sb_components);
       legResults.push({
           legId: seg.id, axis: seg.axis, L_in: seg.length_in,
           F_lbf: totalF, M_inlbf: totalM, Sb_psi: Sb_combined
       });
       get().log(5, `Leg ${seg.id}: F=${fForce(totalF)}, M=${fMoment(totalM)}, Sb=${fStress(Sb_combined)}`);
    });

    const SA = allowableStress(params.f, params.Sc_psi, params.Sh_psi);
    const nodeResults = [];
    let critical = null; let maxRatio = 0; let overAll = 'PASS';

    Object.keys(nodes).forEach(nId => {
       const connectedLegs = legResults.filter(l =>
          segments.find(s => s.id === l.legId)?.startNode === nId ||
          segments.find(s => s.id === l.legId)?.endNode === nId
       );
       const combined = combineStressAtNode(connectedLegs.map(l => l.Sb_psi));
       const { ratio, result } = stressCheck(combined, SA);
       if (ratio > maxRatio) { maxRatio = ratio; critical = nId; }
       if (result === 'FAIL') overAll = 'FAIL';
       nodeResults.push({ nodeId: nId, SE_psi: combined, SA_psi: SA, ratio, result });
       get().log(6, `Node ${nId}: SE=${fStress(combined)}`);
    });

    get().log(7, `RESULT: ${overAll}. Critical: ${critical} (ratio=${maxRatio.toFixed(3)})`);

    set({ legResults, nodeResults, criticalNode: critical, overallResult: overAll });
  },

  importFromViewer: (selectedComps, globalParams) => {
     const nodes = {}; const segments = []; const fittingData = {};

     // Hash function to combine nodes that share the same coordinate (within 1mm tolerance)
     const getHash = (x, y, z) => `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
     const nodeMap = new Map(); // hash -> nodeId
     let nodeCounter = 0;

     const addOrGetNode = (x, y, z) => {
         const hash = getHash(x, y, z);
         if (nodeMap.has(hash)) {
             return nodeMap.get(hash);
         }
         const nodeId = `N${nodeCounter++}`;
         nodeMap.set(hash, nodeId);
         nodes[nodeId] = { pos: [x, y, z], type: 'free', label: nodeId, connections: 0, compTypes: [] };
         return nodeId;
     };

     // Step 1: Filter to relevant types
     const pipingComps = selectedComps.filter(c => ['PIPE', 'ELBOW', 'BEND', 'TEE'].includes(c.type));

     // Step 2 & 4: Build nodes and segments
     pipingComps.forEach((c) => {
        if (!c.points || c.points.length < 2) return;

        let n1Id, n2Id;

        const od_in = (c.bore || 273.05) / 25.4;
        const wt_in = 0.322; // approx 8" sch40
        const materialName = c.attributes?.MATERIAL || get().config.defaultMaterial;

        if (c.type === 'ELBOW' || c.type === 'BEND') {
             // For elbows/bends we connect up to the center point to maintain corner topology properly
             if (c.centrePoint) {
                 n1Id = addOrGetNode(c.points[0].x, c.points[0].y, c.points[0].z);
                 const centerNodeId = addOrGetNode(c.centrePoint.x, c.centrePoint.y, c.centrePoint.z);
                 n2Id = addOrGetNode(c.points[1].x, c.points[1].y, c.points[1].z);

                 nodes[n1Id].connections++; nodes[n1Id].compTypes.push(c.type);
                 nodes[centerNodeId].connections += 2; nodes[centerNodeId].compTypes.push(c.type, c.type);
                 nodes[n2Id].connections++; nodes[n2Id].compTypes.push(c.type);

                 const getAxis = (p1, p2) => {
                     const dx = p2.x - p1.x; const dy = p2.y - p1.y; const dz = p2.z - p1.z;
                     if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) return 'Y';
                     if (Math.abs(dz) > Math.abs(dx) && Math.abs(dz) > Math.abs(dy)) return 'Z';
                     return 'X';
                 };

                 // Add two segments to corner
                 const s1_len = Math.sqrt(Math.pow(c.centrePoint.x - c.points[0].x, 2) + Math.pow(c.centrePoint.y - c.points[0].y, 2) + Math.pow(c.centrePoint.z - c.points[0].z, 2)) / 25.4;
                 const s2_len = Math.sqrt(Math.pow(c.points[1].x - c.centrePoint.x, 2) + Math.pow(c.points[1].y - c.centrePoint.y, 2) + Math.pow(c.points[1].z - c.centrePoint.z, 2)) / 25.4;

                 segments.push({
                     id: `${c.id}-1`, startNode: n1Id, endNode: centerNodeId, compType: c.type,
                     axis: getAxis(c.points[0], c.centrePoint), length_in: s1_len, od_in, wt_in, material: materialName
                 });
                 segments.push({
                     id: `${c.id}-2`, startNode: centerNodeId, endNode: n2Id, compType: c.type,
                     axis: getAxis(c.centrePoint, c.points[1]), length_in: s2_len, od_in, wt_in, material: materialName
                 });

                 // Continue, but skip standard segment push
                 fittingData[c.id] = getSIFData(c.type, od_in, wt_in, true, 'LR');
                 return;
             } else {
                 n1Id = addOrGetNode(c.points[0].x, c.points[0].y, c.points[0].z);
                 n2Id = addOrGetNode(c.points[1].x, c.points[1].y, c.points[1].z);
             }
        } else {
            n1Id = addOrGetNode(c.points[0].x, c.points[0].y, c.points[0].z);
            n2Id = addOrGetNode(c.points[1].x, c.points[1].y, c.points[1].z);
        }

        nodes[n1Id].connections++; nodes[n1Id].compTypes.push(c.type);
        nodes[n2Id].connections++; nodes[n2Id].compTypes.push(c.type);

        const dx = c.points[1].x - c.points[0].x;
        const dy = c.points[1].y - c.points[0].y;
        const dz = c.points[1].z - c.points[0].z;
        let axis = 'X';
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) axis = 'Y';
        if (Math.abs(dz) > Math.abs(dx) && Math.abs(dz) > Math.abs(dy)) axis = 'Z';

        const len_in = Math.sqrt(dx*dx + dy*dy + dz*dz) / 25.4;

        segments.push({
           id: c.id, startNode: n1Id, endNode: n2Id, compType: c.type,
           axis, length_in: len_in, od_in, wt_in, material: materialName
        });

        // Step 6
        fittingData[c.id] = getSIFData(c.type, od_in, wt_in, true, 'LR');
     });

     // Step 5: Look up material properties for the first encountered segment to set global params
     if (segments.length > 0) {
        const tempC = (get().params.designTemp_F - 32) * 5 / 9;
        const firstSeg = segments[0];
        const props = getMaterialProperties(firstSeg.material, tempC, firstSeg.od_in * 25.4, firstSeg.wt_in * 25.4);
        if (props && props.E) {
            const E_psi = parseFloat(props.E) / 0.00689476;
            const alpha_F = parseFloat(props.alpha) / 1.8;
            const Sa_psi = parseFloat(props.Sa) / 0.00689476;
            set(s => ({
                params: {
                    ...s.params,
                    E_psi,
                    alpha_in_in_F: alpha_F,
                    Sa_psi
                }
            }));
        }
     }

     // Step 3: Classify nodes
     Object.keys(nodes).forEach(nodeId => {
         const node = nodes[nodeId];
         if (node.connections === 1) {
             node.type = 'anchor';
         } else if (node.connections === 2 && (node.compTypes.includes('ELBOW') || node.compTypes.includes('BEND'))) {
             node.type = 'elbow';
         } else if (node.connections >= 3 && node.compTypes.includes('TEE')) {
             node.type = 'tee';
         } else {
             node.type = 'free';
         }
         // Clean up temp mapping data
         delete node.connections;
         delete node.compTypes;
     });

     set({ nodes, segments, fittingData });
     get().runAnalysis();
  }
}));

// PLACEHOLDERS
export function splitSegment(segId, ratio) { console.warn('[GC3D] PLACEHOLDER: splitSegment() called but not implemented'); return null; }
export function joinSegments(segId1, segId2) { console.warn('[GC3D] PLACEHOLDER: joinSegments() called but not implemented'); return null; }
export function addNode(pos, type) { console.warn('[GC3D] PLACEHOLDER: addNode() called but not implemented'); return null; }
export function deleteNode(nodeId) { console.warn('[GC3D] PLACEHOLDER: deleteNode() called but not implemented'); return null; }
export function editProperty(segId, propName, newValue) { console.warn('[GC3D] PLACEHOLDER: editProperty() called but not implemented'); return null; }
export function exportToCAESAR(format) { console.warn('[GC3D] PLACEHOLDER: exportToCAESAR() called but not implemented'); return null; }
export function importFromCSV(csvText) { console.warn('[GC3D] PLACEHOLDER: importFromCSV() called but not implemented'); return null; }
export function undoAction() { console.warn('[GC3D] PLACEHOLDER: undoAction() called but not implemented'); return null; }
export function redoAction() { console.warn('[GC3D] PLACEHOLDER: redoAction() called but not implemented'); return null; }
