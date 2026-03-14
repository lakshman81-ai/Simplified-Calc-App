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
    if (!segments || segments.length < 2 || !nodes) return;

    try {
      // Find valid points, falling back safely
      const s0 = segments[0];
      const s1 = segments[1];

      if (!nodes[s0.start] || !nodes[s0.end] || !nodes[s1.end]) return;

      const n0 = nodes[s0.start].pos;
      const n1 = nodes[s0.end].pos;
      const n2 = nodes[s1.end].pos;

      const l1 = Math.hypot(n1[0] - n0[0], n1[1] - n0[1], n1[2] - n0[2]);
      const l2 = Math.hypot(n2[0] - n1[0], n2[1] - n1[1], n2[2] - n1[2]);

      const dx = l1 * params.alpha * params.deltaT;
      const lReqSq = (3 * params.E * params.od * dx) / params.Sa;
      const lReq = lReqSq > 0 ? Math.sqrt(lReqSq) : 0;
      const Scalc = l2 > 0 ? (3 * params.E * params.od * dx) / (l2 * l2) : 0;

      set({ stats: { Lreq: lReq, Scalc, ratio: params.Sa > 0 ? Scalc/params.Sa : 0, genLeg: l1, absLeg: l2, dx } });
    } catch(e) {
      console.error("Simplified Analysis Recalc Error:", e);
    }
  }
}));
