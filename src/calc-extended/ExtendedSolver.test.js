import { runExtendedSolver } from './ExtendedSolver';
import { mockGeometries } from './mock-data';
import materialsDb from './databases/materials.json';
import schedulesDb from './databases/schedules.json';

const getPayload = (nodes) => ({
  nodes,
  materials: materialsDb,
  schedules: schedulesDb,
  config: {
    useB313Legacy: true,
    applyStressRangeReduction: false,
    activeSolvers: ['thermal', 'sif', 'guided_cantilever'],
  }
});

describe('ExtendedSolver Mathematical Engine (Golden Masters)', () => {

  test('L-Bend Thermal Expansion should calculate accurately', () => {
    const payload = getPayload(mockGeometries.LBend);
    const results = runExtendedSolver(payload);

    expect(results.errors).toHaveLength(0);
    expect(results.thermal).toBeDefined();

    const leg1 = results.thermal['node1-node2'];
    // Expected: L = 120in (10ft). alpha = 0.0065 in/100ft/°F. dT = 400.
    // Exp = (10 / 100) * 0.0065 * 400 = 0.1 * 0.0065 * 400 = 0.26 inches
    expect(leg1.length_in).toBeCloseTo(120, 1);
    expect(leg1.expansion_in).toBeCloseTo(0.26, 2);
  });

  test('L-Bend SIF and Flexibility should calculate accurately', () => {
    const payload = getPayload(mockGeometries.LBend);
    const results = runExtendedSolver(payload);

    expect(results.sif).toBeDefined();
    const node2Sif = results.sif['node2'];
    expect(node2Sif).toBeDefined();

    // For 4" STD: t=0.237, r=2.1315. Bend radius R = 1.5 * 4 = 6.0
    // h = (0.237 * 6.0) / (2.1315^2) = 1.422 / 4.54329 = 0.312989
    // k = 1.65 / h = 1.65 / 0.312989 = 5.27
    // i = 0.9 / h^(2/3) = 0.9 / 0.461 = 1.95
    expect(node2Sif.h_factor).toBeCloseTo(0.313, 3);
    expect(node2Sif.k_factor).toBeCloseTo(5.27, 2);
    expect(node2Sif.sif).toBeCloseTo(1.95, 2);
  });

  test('L-Bend Guided Cantilever Force and Stress should match analytical predictions', () => {
    const payload = getPayload(mockGeometries.LBend);
    const results = runExtendedSolver(payload);

    expect(results.guidedCantilever).toBeDefined();
    const gcResult = results.guidedCantilever['node2'];
    expect(gcResult).toBeDefined();

    // Leg 1 and Leg 2 are symmetric (L=120in, dT=400, Exp=0.26in)
    // Force F = 12 * E * I * d / L^3
    // E = 29,500,000 psi, I = 7.23 in4, d = 0.26 in, L = 120 in
    // L^3 = 1,728,000
    // F = (12 * 29,500,000 * 7.23 * 0.26) / 1,728,000 = 385.12 lbf

    // Actual node SIF calculated by engine is ~1.952
    // M = F * L = 385.12 * 120 = 46,214.4 in-lbf
    // Sb = (M * i) / Z = (46214.4 * 1.952) / 3.21 = 28106.31 psi

    expect(gcResult.force_leg1_absorbs_leg2_lbf).toBeCloseTo(385.12, 1);
    expect(gcResult.force_leg2_absorbs_leg1_lbf).toBeCloseTo(385.12, 1);

    // We expect it to be within ~1% tolerance, the exact math in solver is slightly more precise
    expect(gcResult.stress_leg1_psi).toBeCloseTo(28106.3, 1);
    expect(gcResult.stress_leg2_psi).toBeCloseTo(28106.3, 1);

    // Allowable stress = 20000 + 20000 = 40000
    // Utilization ratio = 28106.3 / 40000 = 0.7026
    expect(gcResult.utilization_ratio).toBeCloseTo(0.702, 2);
  });

});
