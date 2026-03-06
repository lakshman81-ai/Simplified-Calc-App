import { create } from 'zustand';

export const useSimpStore = create((set, get) => ({
  nodes: {},
  segments: [],
  plane: 'XY',
  orbitEnabled: true,
  params: { deltaT: 148.9, od: 273.05, E: 199948, alpha: 0.00001116, Sa: 137.9 },
  stats: { Lreq: 0, Scalc: 0, ratio: 0, genLeg: 0, absLeg: 0, dx: 0 },

  setOrbitEnabled: (enabled) => set({ orbitEnabled: enabled }),
  setPlane: (plane) => set({ plane }),
  setParams: (newParams) => {
    set((state) => ({ params: { ...state.params, ...newParams } }));
    get().recalc();
  },
  setNodes: (nodes) => set({ nodes }),
  setSegments: (segments) => {
    set({ segments });
    get().recalc();
  },
  moveNode: (id, pos) => {
    set((state) => {
      const newNodes = { ...state.nodes, [id]: { ...state.nodes[id], pos } };
      return { nodes: newNodes };
    });
    get().recalc();
  },
  recalc: () => {
    const { nodes, segments, params } = get();
    if (segments.length < 2) return;
    
    // Quick L-Bend assuming segment 0 is Generator, segment 1 is Absorber for mock
    const n0 = nodes[segments[0].start].pos;
    const n1 = nodes[segments[0].end].pos;
    const n2 = nodes[segments[1].end].pos;
    
    const l1 = Math.hypot(n1[0] - n0[0], n1[1] - n0[1], n1[2] - n0[2]);
    const l2 = Math.hypot(n2[0] - n1[0], n2[1] - n1[1], n2[2] - n1[2]);
    
    const dx = l1 * params.alpha * params.deltaT;
    const lReqSq = (3 * params.E * params.od * dx) / params.Sa;
    const lReq = Math.sqrt(lReqSq);
    const Scalc = (3 * params.E * params.od * dx) / (l2 * l2);
    
    set({ stats: { Lreq: lReq, Scalc, ratio: Scalc/params.Sa, genLeg: l1, absLeg: l2, dx } });
  }
}));
