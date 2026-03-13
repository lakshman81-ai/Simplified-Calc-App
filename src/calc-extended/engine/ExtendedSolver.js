import { validatePayload, getBaseProperties } from './utils';
import { solveLBend } from './solvers/lBendSolver';
import { solveZBend } from './solvers/zBendSolver';
import { solveULoop } from './solvers/uLoopSolver';

export const solveSystem = (payload, config = {}) => {
  try {
    validatePayload(payload);

    let logs = [];
    const log = (msg) => { if (config.verboseDebugMode) logs.push(msg); };

    const properties = getBaseProperties(payload, config);

    log(`Starting routing calculation...`);
    log(`OD: ${properties.OD}mm, wt: ${properties.wt}mm, I: ${properties.I.toFixed(2)}mm^4, E: ${properties.E}MPa, tempDiff: ${properties.tempDiff}°C`);
    log(`SIF (i): ${properties.i.toFixed(3)}`);

    const { nodes, elements } = payload;
    let solverResults = {};

    // Routing logic based on geometry signature
    if (elements.length === 2 && nodes.length === 3) {
      solverResults = solveLBend(payload, properties, log);
    } else if (elements.length === 3 && nodes.length === 4) {
      solverResults = solveZBend(payload, properties, log);
    } else if (elements.length === 5 && nodes.length === 6) {
      solverResults = solveULoop(payload, properties, log);
    } else {
      throw new Error(`Geometry not supported in simplified guided cantilever solver yet (Nodes: ${nodes.length}, Elements: ${elements.length}).`);
    }

    return {
      nodeResults: solverResults.nodeResults,
      elementResults: solverResults.elementResults,
      maxStress: solverResults.maxStress,
      logs
    };

  } catch (error) {
    return {
      error: error.message,
      nodeResults: {},
      elementResults: {}
    };
  }
};
