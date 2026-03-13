import { create } from 'zustand';
import { useAppStore } from '../../store/appStore';
import { useSketchStore } from '../../sketcher/SketcherStore';

const initialState = {
  // UI State
  activeView: 'dashboard', // 'dashboard' | '3d-solver'
  calculationStatus: 'AWAITING_ANCHORS', // 'AWAITING_ANCHORS' | 'READY' | 'CALCULATED'
  heatmapMode: 'STRESS', // 'STRESS' | 'FORCE'

  // Geometry (Walled Garden - isolated clone)
  nodes: [],
  segments: [],
  anchors: { anchor1: null, anchor2: null },

  // Piping Inputs
  inputs: {
    material: 'Carbon Steel',
    pipeSize: 8.0,
    schedule: '40',
    tInstall: 70,
    tOperate: 300,
  },

  // Boundary Movement
  boundaryMovement: {
    x: 0,
    y: 0,
    z: 0,
  },

  // System Limits
  constraints: {
    equipmentMaterial: 'Steel',
    maxStress: 20000,
  },

  // Calculation Results
  results: null,
};

export const useExtendedStore = create((set) => ({
  ...initialState,

  setActiveView: (view) => set({ activeView: view }),
  setHeatmapMode: (mode) => set({ heatmapMode: mode }),

  updateInput: (key, value) => set((state) => ({
    inputs: { ...state.inputs, [key]: value }
  })),

  updateBoundaryMovement: (key, value) => set((state) => ({
    boundaryMovement: { ...state.boundaryMovement, [key]: value }
  })),

  updateConstraint: (key, value) => set((state) => ({
    constraints: { ...state.constraints, [key]: value }
  })),

  // One-way hydration from global store
  importFromGlobal: (globalNodes, globalSegments) => set(() => {
    // Deep clone to ensure walled garden
    const nodesClone = JSON.parse(JSON.stringify(globalNodes || []));
    const segmentsClone = JSON.parse(JSON.stringify(globalSegments || []));

    return {
      nodes: nodesClone,
      segments: segmentsClone,
      anchors: { anchor1: null, anchor2: null }, // Reset anchors on import
      calculationStatus: 'AWAITING_ANCHORS',
      results: null
    };
  }),

  importFrom3DViewer: () => {
    const appState = useAppStore.getState();
    const components = appState.components;
    const selectedIds = appState.selectedIds;

    const filtered = components.filter(c => selectedIds.has(c.id));
    if (filtered.length === 0) {
      alert("No components selected in 3D Viewer. Please select geometry first.");
      return;
    }

    // Transform 3D PCF components to nodes/segments for the solver
    const parsedNodes = [];
    const parsedSegments = [];
    let nodeIdCounter = 1;

    // Helper to get or create a node at a coordinate
    // Note: 3D coordinates might be in mm, but standard expects ft/inches or unitless ratios depending on parsing.
    // Scaling assumption: 1 unit = 1 foot. Convert mm to ft if necessary.
    // 1 mm = 0.00328084 ft.
    const getOrCreateNode = (x, y, z) => {
      const tol = 0.001;
      const ftX = x * 0.00328084;
      const ftY = y * 0.00328084;
      const ftZ = z * 0.00328084;

      const existing = parsedNodes.find(n => Math.abs(n.x - ftX) < tol && Math.abs(n.y - ftY) < tol && Math.abs(n.z - ftZ) < tol);
      if (existing) return existing.id;

      const newId = `N${nodeIdCounter++}`;
      parsedNodes.push({ id: newId, x: ftX, y: ftY, z: ftZ });
      return newId;
    };

    filtered.forEach((comp, idx) => {
      if (comp.type === 'PIPE' && comp.points && comp.points.length >= 2) {
        const startPt = comp.points[0];
        const endPt = comp.points[1];
        const sId = getOrCreateNode(startPt.x, startPt.y, startPt.z);
        const eId = getOrCreateNode(endPt.x, endPt.y, endPt.z);
        parsedSegments.push({ id: `S${idx}`, startNodeId: sId, endNodeId: eId });
      }
    });

    set({
      nodes: parsedNodes,
      segments: parsedSegments,
      anchors: { anchor1: null, anchor2: null },
      calculationStatus: 'AWAITING_ANCHORS',
      results: null
    });
    alert(`Imported ${parsedNodes.length} nodes and ${parsedSegments.length} segments from 3D Viewer.`);
  },

  importFrom2DSketcher: () => {
    const sketchState = useSketchStore.getState();
    const sNodes = sketchState.nodes;
    const sSegments = sketchState.segments;

    if (Object.keys(sNodes).length === 0) {
      alert("No geometry found in 2D Sketcher.");
      return;
    }

    const parsedNodes = Object.keys(sNodes).map(key => {
       const n = sNodes[key];
       // Assuming 2D sketcher grid size = 100 units = 100 ft or inches?
       // Standardize to feet. If 100 = 10 ft, scale by 0.1
       return { id: key, x: n.pos[0] * 0.1, y: n.pos[1] * 0.1, z: n.pos[2] * 0.1 };
    });

    const parsedSegments = sSegments.map(s => ({
      id: s.id,
      startNodeId: s.startNode,
      endNodeId: s.endNode
    }));

    set({
      nodes: parsedNodes,
      segments: parsedSegments,
      anchors: { anchor1: null, anchor2: null },
      calculationStatus: 'AWAITING_ANCHORS',
      results: null
    });
    alert(`Imported ${parsedNodes.length} nodes and ${parsedSegments.length} segments from 2D Sketcher.`);
  },

  // Anchor Assignment
  setAnchor: (anchorNum, nodeId) => set((state) => {
    const newAnchors = { ...state.anchors, [`anchor${anchorNum}`]: nodeId };
    const status = (newAnchors.anchor1 && newAnchors.anchor2) ? 'READY' : 'AWAITING_ANCHORS';
    return { anchors: newAnchors, calculationStatus: status };
  }),

  // Set Results from Solver
  setResults: (results) => set({
    results,
    calculationStatus: 'CALCULATED'
  }),

  // Reset module
  reset: () => set(initialState)
}));
