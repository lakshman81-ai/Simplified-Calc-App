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
  selectedSegmentId: null,
  selectedNodeId: null,
  activeSubTab: '3dview',
  unitSystem: 'imperial',
  consoleCollapsed: false,
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
  setSelectedSegment: (id) => set({ selectedSegmentId: id, selectedNodeId: null }),
  setSelectedNode: (id) => set({ selectedNodeId: id, selectedSegmentId: null }),
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
    get().log(2, `Section: D_o=${D_o.toFixed(3)}in, t=${t_n.toFixed(3)}in, I=${I.toFixed(2)}in⁴, Z=${Z.toFixed(2)}in³`);

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
    get().log(4, `Thermal displacements: δ_X=${deltas.X.toFixed(3)}in, δ_Y=${deltas.Y.toFixed(3)}in, δ_Z=${deltas.Z.toFixed(3)}in`);

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
       get().log(5, `Leg ${seg.id}: F=${totalF.toFixed(0)}lbf, M=${totalM.toFixed(0)}in·lbf, Sb=${Sb_combined.toFixed(0)}psi`);
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
       get().log(6, `Node ${nId}: SE=${combined.toFixed(0)}psi`);
    });

    get().log(7, `RESULT: ${overAll}. Critical: ${critical} (ratio=${maxRatio.toFixed(3)})`);

    set({ legResults, nodeResults, criticalNode: critical, overallResult: overAll });
  },

  importFromViewer: (selectedComps, globalParams) => {
     const nodes = {}; const segments = []; const fittingData = {};
     selectedComps.filter(c => ['PIPE', 'ELBOW', 'BEND', 'TEE'].includes(c.type)).forEach((c, idx) => {
        const n1Id = `N${idx}-1`;
        const n2Id = `N${idx}-2`;
        if (!nodes[n1Id]) nodes[n1Id] = { pos: [c.points[0].x, c.points[0].y, c.points[0].z], type: 'free', label: n1Id };
        if (!nodes[n2Id]) nodes[n2Id] = { pos: [c.points[1].x, c.points[1].y, c.points[1].z], type: 'free', label: n2Id };

        const dx = c.points[1].x - c.points[0].x;
        const dy = c.points[1].y - c.points[0].y;
        const dz = c.points[1].z - c.points[0].z;
        let axis = 'X';
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) axis = 'Y';
        if (Math.abs(dz) > Math.abs(dx) && Math.abs(dz) > Math.abs(dy)) axis = 'Z';

        const len_in = Math.sqrt(dx*dx + dy*dy + dz*dz) / 25.4;
        const od_in = (c.bore || 273.05) / 25.4;
        const wt_in = 0.322; // approx 8" sch40

        segments.push({
           id: c.id, startNode: n1Id, endNode: n2Id, compType: c.type,
           axis, length_in: len_in, od_in, wt_in, material: c.attributes?.MATERIAL || 'Unknown'
        });

        fittingData[c.id] = getSIFData(c.type, od_in, wt_in, true, 'LR');
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
