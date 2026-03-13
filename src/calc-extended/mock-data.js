export const mockGeometries = {
  // L-Bend: Node 1 -> Bend 2 -> Node 3
  // Leg 1: (0,0,0) to (120,0,0) (10 feet = 120 inches)
  // Leg 2: (120,0,0) to (120,120,0) (10 feet = 120 inches)
  LBend: [
    { id: "node1", x: 0, y: 0, z: 0, type: "anchor", materialId: "A106-B", nps: "4", schedule: "STD", tempDelta_F: 400 },
    { id: "node2", x: 120, y: 0, z: 0, type: "bend", materialId: "A106-B", nps: "4", schedule: "STD", tempDelta_F: 400 },
    { id: "node3", x: 120, y: 120, z: 0, type: "anchor", materialId: "A106-B", nps: "4", schedule: "STD", tempDelta_F: 400 }
  ],

  // Z-Bend: Node 1 -> Bend 2 -> Bend 3 -> Node 4
  // Leg 1: (0,0,0) to (120,0,0)
  // Leg 2: (120,0,0) to (120,120,0)
  // Leg 3: (120,120,0) to (240,120,0)
  ZBend: [
    { id: "node1", x: 0, y: 0, z: 0, type: "anchor", materialId: "A106-B", nps: "4", schedule: "STD", tempDelta_F: 400 },
    { id: "node2", x: 120, y: 0, z: 0, type: "bend", materialId: "A106-B", nps: "4", schedule: "STD", tempDelta_F: 400 },
    { id: "node3", x: 120, y: 120, z: 0, type: "bend", materialId: "A106-B", nps: "4", schedule: "STD", tempDelta_F: 400 },
    { id: "node4", x: 240, y: 120, z: 0, type: "anchor", materialId: "A106-B", nps: "4", schedule: "STD", tempDelta_F: 400 }
  ],

  // 3D U-Loop (Expansion Loop)
  ExpansionU: [
    { id: "node1", x: 0, y: 0, z: 0, type: "anchor", materialId: "A312-TP304", nps: "6", schedule: "STD", tempDelta_F: 500 },
    { id: "node2", x: 240, y: 0, z: 0, type: "node", materialId: "A312-TP304", nps: "6", schedule: "STD", tempDelta_F: 500 }, // Leg 1
    { id: "node3", x: 240, y: 120, z: 0, type: "bend", materialId: "A312-TP304", nps: "6", schedule: "STD", tempDelta_F: 500 }, // Leg 2 (Up)
    { id: "node4", x: 240, y: 120, z: -120, type: "bend", materialId: "A312-TP304", nps: "6", schedule: "STD", tempDelta_F: 500 }, // Leg 3 (Back)
    { id: "node5", x: 240, y: 0, z: -120, type: "bend", materialId: "A312-TP304", nps: "6", schedule: "STD", tempDelta_F: 500 }, // Leg 4 (Down)
    { id: "node6", x: 480, y: 0, z: -120, type: "anchor", materialId: "A312-TP304", nps: "6", schedule: "STD", tempDelta_F: 500 }, // Leg 5
  ]
};
