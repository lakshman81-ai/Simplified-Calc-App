import { solveSystem } from '../engine/ExtendedSolver';
import { goldenMasters } from './mock-data';

describe('ExtendedSolver', () => {
  it('should calculate L-Bend stresses within < 1% tolerance of Golden Master', () => {
    const master = goldenMasters.LBend;
    const result = solveSystem(master.payload, { verboseDebugMode: true });
    expect(result.error).toBeUndefined();
    const expectedStress = master.expectedResults.maxStress;
    const actualStress = result.maxStress;
    const tolerance = 0.01;
    const stressDiff = Math.abs(actualStress - expectedStress) / expectedStress;
    expect(stressDiff).toBeLessThan(tolerance);
  });

  it('should calculate Z-Bend stresses within < 1% tolerance of Golden Master', () => {
    const master = goldenMasters.ZBend;
    const result = solveSystem(master.payload, { verboseDebugMode: true });
    expect(result.error).toBeUndefined();
    const expectedStress = master.expectedResults.maxStress;
    const actualStress = result.maxStress;
    const tolerance = 0.01;
    const stressDiff = Math.abs(actualStress - expectedStress) / expectedStress;
    expect(stressDiff).toBeLessThan(tolerance);
  });

  it('should calculate U-Loop stresses within < 1% tolerance of Golden Master', () => {
    const master = goldenMasters.ULoop;
    const result = solveSystem(master.payload, { verboseDebugMode: true });
    expect(result.error).toBeUndefined();
    const expectedStress = master.expectedResults.maxStress;
    const actualStress = result.maxStress;
    const tolerance = 0.01;
    const stressDiff = Math.abs(actualStress - expectedStress) / expectedStress;
    expect(stressDiff).toBeLessThan(tolerance);
  });
});
