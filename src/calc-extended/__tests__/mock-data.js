export const goldenMasters = {
  LBend: {
    payload: {
      systemParams: {
        ambientTemp: 21,
        operatingTemp: 150, // Delta T = 129
        material: 'A106-B',
        pipeSize: 'NPS6', // OD: 168.3mm, t: 7.11mm
        schedule: 'sch40'
      },
      nodes: [
        { id: 'n1', x: 0, y: 0, z: 0, type: 'anchor' },
        { id: 'n2', x: 3000, y: 0, z: 0, type: 'corner' }, // L1 = 3000mm
        { id: 'n3', x: 3000, y: 3000, z: 0, type: 'anchor' } // L2 = 3000mm
      ],
      elements: [
        { id: 'e1', startNode: 'n1', endNode: 'n2' },
        { id: 'e2', startNode: 'n2', endNode: 'n3' }
      ]
    },
    // We expect certain values based on the formulas in ExtendedSolver.js
    // I = (pi/64) * (168.3^4 - (168.3-2*7.11)^4) = 1.17e7 mm^4
    // delta = 3000 * 1.17e-5 * 129 = 4.53mm
    // M = (6 * 190000 * 1.17e7 * 4.53) / 3000^2 = 6.7e6 N*mm
    // P = (12 * 190000 * 1.17e7 * 4.53) / 3000^3 = 4.47e3 N
    // Sb = M * (168.3/2) / 1.17e7 = 48.2 MPa
    // i = 0.9 / (h^(2/3)), h = (7.11 * 1.5*168.3) / ((168.3-7.11)/2)^2 = 0.276
    // i = 0.9 / (0.276^(2/3)) = 2.12
    // stress = Sb * i = 48.2 * 2.12 = 102.2 MPa
    expectedResults: {
      maxStress: 102.2, // MPa
      anchorForces: { P: 4470 }, // N (approx)
      anchorMoments: { M: 6700000 } // N*mm (approx)
    }
  },
  ZBend: {
    payload: {
      systemParams: {
        ambientTemp: 21,
        operatingTemp: 150, // Delta T = 129
        material: 'A106-B',
        pipeSize: 'NPS6', // OD: 168.3mm, t: 7.11mm
        schedule: 'sch40'
      },
      nodes: [
        { id: 'n1', x: 0, y: 0, z: 0, type: 'anchor' },
        { id: 'n2', x: 2000, y: 0, z: 0, type: 'corner' }, // Outer 1 (2000mm)
        { id: 'n3', x: 2000, y: 1500, z: 0, type: 'corner' }, // Offset (1500mm)
        { id: 'n4', x: 4000, y: 1500, z: 0, type: 'anchor' } // Outer 2 (2000mm)
      ],
      elements: [
        { id: 'e1', startNode: 'n1', endNode: 'n2' },
        { id: 'e2', startNode: 'n2', endNode: 'n3' },
        { id: 'e3', startNode: 'n3', endNode: 'n4' }
      ]
    },
    // We expect certain values based on the formulas in ExtendedSolver.js
    // I = 1.17e7 mm^4
    // alpha * tempDiff = 1.17e-5 * 129 = 1.5093e-3
    // deltaOuter1 = 2000 * 1.5093e-3 = 3.0186 mm
    // deltaOuter2 = 2000 * 1.5093e-3 = 3.0186 mm
    // totalDeltaOuter = 6.0372 mm
    // M_mid = (6 * 190000 * 1.17e7 * 6.0372) / 1500^2 = 35.77e6 N*mm
    // Sb_mid = (35.77e6 * (168.3/2)) / 1.17e7 = 257.3 MPa
    // i = 2.12
    // stress_mid = 257.3 * 2.12 = 545.4 MPa
    expectedResults: {
      maxStress: 545.4, // MPa
    }
  },
  ULoop: {
    payload: {
      systemParams: {
        ambientTemp: 21,
        operatingTemp: 150, // Delta T = 129
        material: 'A106-B',
        pipeSize: 'NPS6', // OD: 168.3mm, t: 7.11mm
        schedule: 'sch40'
      },
      nodes: [
        { id: 'n1', x: 0, y: 0, z: 0, type: 'anchor' },
        { id: 'n2', x: 5000, y: 0, z: 0, type: 'corner' }, // Run 1 (5000mm)
        { id: 'n3', x: 5000, y: 2000, z: 0, type: 'corner' }, // W1 (2000mm)
        { id: 'n4', x: 6000, y: 2000, z: 0, type: 'corner' }, // H (1000mm)
        { id: 'n5', x: 6000, y: 0, z: 0, type: 'corner' }, // W2 (2000mm)
        { id: 'n6', x: 11000, y: 0, z: 0, type: 'anchor' } // Run 2 (5000mm)
      ],
      elements: [
        { id: 'e1', startNode: 'n1', endNode: 'n2' },
        { id: 'e2', startNode: 'n2', endNode: 'n3' },
        { id: 'e3', startNode: 'n3', endNode: 'n4' },
        { id: 'e4', startNode: 'n4', endNode: 'n5' },
        { id: 'e5', startNode: 'n5', endNode: 'n6' }
      ]
    },
    // We expect certain values based on the formulas in ExtendedSolver.js
    // I = 1.17e7 mm^4
    // alpha * tempDiff = 1.17e-5 * 129 = 1.5093e-3
    // deltaRun = (5000 + 5000) * 1.5093e-3 = 15.093 mm
    // delta_per_side = 7.5465 mm
    // L_absorb_effective = 2000 mm (W1)
    // M_loop = (6 * 190000 * 1.17e7 * 7.5465) / 2000^2 = 25.16e6 N*mm
    // Sb_loop = (25.16e6 * (168.3/2)) / 1.17e7 = 181.0 MPa
    // i = 2.12
    // stress_loop = 181.0 * 2.12 = 383.7 MPa
    expectedResults: {
      maxStress: 383.7, // MPa
    }
  }
};
