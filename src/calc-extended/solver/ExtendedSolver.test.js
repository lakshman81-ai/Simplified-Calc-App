import { runExtendedSolver } from './ExtendedSolver';
import { MultiPlane_10Leg_GM } from '../mocks/mock-data';

describe('ExtendedSolver Math Engine', () => {

  it('calculates 10-leg GM correctly with short drop ignored', () => {
    const results = runExtendedSolver(MultiPlane_10Leg_GM);

    // Verify Meta Data (Material Properties)
    expect(results.meta.shortDropsIgnored).toBe(1); // The 2' drop (V3)

    // Using closeTo for float approximations (within 1%)
    expect(results.meta.e).toBeCloseTo(0.0182, 3);
    expect(results.meta.E).toBeCloseTo(28300000, 0); // 28.3 million PSI
    expect(results.meta.OD).toBe(8.625);
    expect(results.meta.I_eff).toBeCloseTo(72.5, 0); // Should equal nominal if corrosion/mill is 0

    // Verify X Axis
    const xRes = results.axes.X;
    expect(Math.abs(xRes.netDiff)).toBe(50);
    expect(xRes.bendingLeg).toBe(67);
    expect(xRes.delta).toBeCloseTo(0.910, 3);
    // 129 lbs roughly
    expect(xRes.force).toBeGreaterThan(125);
    expect(xRes.force).toBeLessThan(135);
    // 1030 PSI roughly
    expect(xRes.stress).toBeGreaterThan(1000);
    expect(xRes.stress).toBeLessThan(1060);
    expect(xRes.status).toBe('PASS');

    // Verify Y Axis
    const yRes = results.axes.Y;
    expect(Math.abs(yRes.netDiff)).toBe(30);
    expect(yRes.bendingLeg).toBe(77);
    expect(yRes.delta).toBeCloseTo(0.546, 3);
    // 51 lbs roughly
    expect(yRes.force).toBeGreaterThan(45);
    expect(yRes.force).toBeLessThan(55);
    // 468 PSI roughly
    expect(yRes.stress).toBeGreaterThan(450);
    expect(yRes.stress).toBeLessThan(480);
    expect(yRes.status).toBe('PASS');

    // Verify Z Axis
    const zRes = results.axes.Z;
    expect(Math.abs(zRes.netDiff)).toBe(1); // 15 down - 12 up - 2 up = 1 net
    expect(zRes.bendingLeg).toBe(90);
    expect(zRes.delta).toBeCloseTo(0.018, 3);
    expect(zRes.force).toBeLessThan(5); // ~1 lb
    expect(zRes.stress).toBeLessThan(20); // ~11 PSI
    expect(zRes.status).toBe('PASS');
  });

  it('calculates 10-leg GM correctly with Corrosion and Mill Tolerance reducing I_eff', () => {
    // Clone GM and apply manufacturing constraints
    const gm_with_corrosion = JSON.parse(JSON.stringify(MultiPlane_10Leg_GM));
    gm_with_corrosion.inputs.corrosionAllowance = 0.125;
    gm_with_corrosion.inputs.millTolerance = 12.5;

    const results = runExtendedSolver(gm_with_corrosion);

    // I_eff should be significantly lower than nominal 72.5
    expect(results.meta.I_eff).toBeLessThan(72.5);

    // Lower I_eff means less stiffness, which means less force exerted on equipment
    // Nominal force was ~129 lbs.
    const xRes = results.axes.X;
    expect(xRes.force).toBeLessThan(129);
  });

});
