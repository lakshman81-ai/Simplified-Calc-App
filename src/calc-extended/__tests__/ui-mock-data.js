// Mock data representing what the UI/Graphics engine would pass to the solver
export const mockUIGeometries = {
  selectedConfiguration: 'LBend',
  geometries: {
    LBend: {
      systemParams: { ambientTemp: 21, operatingTemp: 150, material: 'A106-B', pipeSize: 'NPS6', schedule: 'sch40' },
      nodes: [
        { id: 'n1', x: 0, y: 0, z: 0, type: 'anchor' },
        { id: 'n2', x: 3000, y: 0, z: 0, type: 'corner' },
        { id: 'n3', x: 3000, y: 3000, z: 0, type: 'anchor' }
      ],
      elements: [
        { id: 'e1', startNode: 'n1', endNode: 'n2' },
        { id: 'e2', startNode: 'n2', endNode: 'n3' }
      ]
    },
    ZBend: {
      systemParams: { ambientTemp: 21, operatingTemp: 150, material: 'A106-B', pipeSize: 'NPS6', schedule: 'sch40' },
      nodes: [
        { id: 'n1', x: 0, y: 0, z: 0, type: 'anchor' },
        { id: 'n2', x: 2000, y: 0, z: 0, type: 'corner' },
        { id: 'n3', x: 2000, y: 1500, z: 0, type: 'corner' },
        { id: 'n4', x: 4000, y: 1500, z: 0, type: 'anchor' }
      ],
      elements: [
        { id: 'e1', startNode: 'n1', endNode: 'n2' },
        { id: 'e2', startNode: 'n2', endNode: 'n3' },
        { id: 'e3', startNode: 'n3', endNode: 'n4' }
      ]
    },
    ULoop: {
      systemParams: { ambientTemp: 21, operatingTemp: 150, material: 'A106-B', pipeSize: 'NPS6', schedule: 'sch40' },
      nodes: [
        { id: 'n1', x: 0, y: 0, z: 0, type: 'anchor' },
        { id: 'n2', x: 5000, y: 0, z: 0, type: 'corner' },
        { id: 'n3', x: 5000, y: 2000, z: 0, type: 'corner' },
        { id: 'n4', x: 6000, y: 2000, z: 0, type: 'corner' },
        { id: 'n5', x: 6000, y: 0, z: 0, type: 'corner' },
        { id: 'n6', x: 11000, y: 0, z: 0, type: 'anchor' }
      ],
      elements: [
        { id: 'e1', startNode: 'n1', endNode: 'n2' },
        { id: 'e2', startNode: 'n2', endNode: 'n3' },
        { id: 'e3', startNode: 'n3', endNode: 'n4' },
        { id: 'e4', startNode: 'n4', endNode: 'n5' },
        { id: 'e5', startNode: 'n5', endNode: 'n6' }
      ]
    }
  }
};
