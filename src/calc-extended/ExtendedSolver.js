import { solveThermal } from './solvers/ThermalExpansion.js';
import { solveSIF } from './solvers/FlexibilitySif.js';
import { solveGuidedCantilever } from './solvers/GuidedCantilever.js';
import { systemPayloadSchema } from './schemas.js';

export const runExtendedSolver = (payload) => {
  // Validate Boundaries: Check inputs at entry points
  const parseResult = systemPayloadSchema.safeParse(payload);

  if (!parseResult.success) {
    throw new Error(`Validation Error: ${JSON.stringify(parseResult.error.issues)}`);
  }

  const validatedPayload = parseResult.data;
  const config = validatedPayload.config;

  const results = {
    thermal: {},
    sif: {},
    guidedCantilever: {},
    errors: [],
  };

  try {
    if (config.activeSolvers.includes("thermal")) {
      results.thermal = solveThermal(validatedPayload);
    }

    if (config.activeSolvers.includes("sif")) {
      results.sif = solveSIF(validatedPayload);
    }

    if (config.activeSolvers.includes("guided_cantilever")) {
      results.guidedCantilever = solveGuidedCantilever(validatedPayload, results.thermal, results.sif);
    }
  } catch (err) {
    results.errors.push(err.message);
  }

  return results;
};
