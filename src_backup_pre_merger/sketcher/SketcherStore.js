import { create } from 'zustand';
import { buildGraphFromComponents, buildComponentsFromGraph } from './GraphTranslator';

export const useSketchStore = create((set, get) => ({
  nodes: {},
  segments: [],
  workingPlane: 'XY', // 'XY', 'XZ', 'YZ'
  workingElevation: 0,
  activeTool: 'select', // 'select', 'draw_pipe', 'add_node'
  snapToGrid: true,

  draftingState: { isDrawing: false, startNodeId: null, currentPos: null },
  snapNodeId: null, // OSnap feature: ID of the node currently hovered for snapping
  setSnapNodeId: (id) => set({ snapNodeId: id }),
  gridSize: 100,

  setWorkingPlane: (plane) => set({ workingPlane: plane, draftingState: { isDrawing: false, startNodeId: null, currentPos: null } }),
  setActiveTool: (tool) => set({ activeTool: tool, draftingState: { isDrawing: false, startNodeId: null, currentPos: null } }),
  setDraftingState: (newState) => set(s => ({ draftingState: { ...s.draftingState, ...newState } })),
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
  importFromComponents: (components) => {
      const { nodes, segments } = buildGraphFromComponents(components);
      set({ nodes, segments });
  },

  exportToComponents: () => {
      const { nodes, segments } = get();
      return buildComponentsFromGraph(nodes, segments);
  },

  // Geometric Actions
  createNode: (pos, type = 'free') => {
      const id = `N${Date.now()}`;
      set(s => ({ nodes: { ...s.nodes, [id]: { pos, type } } }));
      return id;
  },

  createSegment: (startNodeId, endNodeId, properties = {}) => {
      const id = `S${Date.now()}`;
      set(s => ({ segments: [...s.segments, { id, startNode: startNodeId, endNode: endNodeId, ...properties }] }));
      return id;
  },

  snapCoordinate: (val) => {
      const { snapToGrid, gridSize } = get();
      if (!snapToGrid) return val;
      return Math.round(val / gridSize) * gridSize;
  },

  resolve3DPoint: (point2D) => {
      const { workingPlane, workingElevation, snapCoordinate } = get();
      const x = snapCoordinate(point2D.x);
      const y = snapCoordinate(point2D.y);
      const z = snapCoordinate(point2D.z);
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
      if (workingPlane === 'XY') return [x, y, workingElevation];
      if (workingPlane === 'XZ') return [x, workingElevation, -z]; // R3F Z maps to -Z for standard elevation view
      if (workingPlane === 'YZ') return [workingElevation, y, -z];
      return [x, y, z];
  },
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
  clearSketch: () => set({ nodes: {}, segments: [] })
}));
