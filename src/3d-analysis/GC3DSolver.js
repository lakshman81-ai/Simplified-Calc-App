import { sectionProperties, thermalDisplacement, gcBasic, gcWithFlexibility, combineStressAtNode, allowableStress, stressCheck } from './GC3DCalcEngine';

/**
 * Pure function to solve Guided Cantilever 3D Piping Analysis.
 * Mathematically isolates calculation logic from React/Zustand UI layers.
<<<<<<< Updated upstream
 *
=======
 *
>>>>>>> Stashed changes
 * @param {Object} payload Strict JSON input payload.
 * @param {Object} payload.nodes `{ [id]: { pos: [x,y,z], type: 'free'|'anchor'|'elbow'|'tee' } }`
 * @param {Array} payload.segments `[{ id, startNode, endNode, length_in, od_in, wt_in, axis, compType }]`
 * @param {Object} payload.params `{ deltaT_F, E_psi, alpha_in_in_F, Sc_psi, Sh_psi, f, Sa_psi }`
 * @param {Object} payload.fittingData `{ [segId]: { k, i_i, R_e } }`
<<<<<<< Updated upstream
 * @param {boolean} payload.includeSIF
=======
 * @param {boolean} payload.includeSIF
>>>>>>> Stashed changes
 * @returns {Object} `{ legResults, nodeResults, criticalNode, overallResult, debugLog }`
 */
export function solveGC3D(payload) {
    const { nodes, segments, params, fittingData, includeSIF } = payload;
    const debugLog = [];
    const log = (step, msg) => debugLog.push({ step, msg, timestamp: Date.now() });

    log(0, "Starting GC 3D analysis in Deep Architect Solver...");

    if (!nodes || Object.keys(nodes).length < 2 || !segments || segments.length === 0) {
        log(1, "Validation failed: Need >=2 nodes and >=1 segment.");
        return { legResults: [], nodeResults: [], criticalNode: null, overallResult: 'FAIL', debugLog };
    }

    // Strict Archetypal Casting: Ensure inputs are numbers before any physics operations.
    const E = parseFloat(params.E_psi);
    const alpha = parseFloat(params.alpha_in_in_F);
    const deltaT = parseFloat(params.deltaT_F);
    const fFactor = parseFloat(params.f);
    const Sc = parseFloat(params.Sc_psi);
    const Sh = parseFloat(params.Sh_psi);

    if (isNaN(E) || isNaN(alpha) || isNaN(deltaT) || isNaN(fFactor) || isNaN(Sc) || isNaN(Sh)) {
        log(1, "Validation failed: Critical parameters are NaN.");
        return { legResults: [], nodeResults: [], criticalNode: null, overallResult: 'FAIL', debugLog };
    }

    const SA = allowableStress(fFactor, Sc, Sh);
    log(1, `Validated parameters. E=${E}, alpha=${alpha}, dT=${deltaT}, SA=${SA}`);

    // Determine orthogonal displacements across the entire run
    const totalRuns = { X: 0, Y: 0, Z: 0 };
    segments.forEach(seg => {
        const len = parseFloat(seg.length_in);
        if (!isNaN(len)) {
            if (seg.axis === 'X') totalRuns.X += len;
            if (seg.axis === 'Y') totalRuns.Y += len;
            if (seg.axis === 'Z') totalRuns.Z += len;
        }
    });

    const deltas = {
        X: thermalDisplacement(alpha, totalRuns.X, deltaT),
        Y: thermalDisplacement(alpha, totalRuns.Y, deltaT),
        Z: thermalDisplacement(alpha, totalRuns.Z, deltaT)
    };
    log(4, `Thermal displacements (in): dX=${deltas.X.toFixed(4)}, dY=${deltas.Y.toFixed(4)}, dZ=${deltas.Z.toFixed(4)}`);

    const legResults = [];
    segments.forEach(seg => {
        const L_in = parseFloat(seg.length_in);
        const D_o = parseFloat(seg.od_in);
        const t_n = parseFloat(seg.wt_in);
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
        if (isNaN(L_in) || isNaN(D_o) || isNaN(t_n) || L_in <= 0) {
            legResults.push({ legId: seg.id, axis: seg.axis, L_in, F_lbf: 0, M_inlbf: 0, Sb_psi: 0, error: 'Invalid Dimensions' });
            return;
        }

        const { I, Z } = sectionProperties(D_o, t_n);
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
        const data = fittingData[seg.id] || { k: 1.0, i_i: 1.0, R_e: 0 };
        const k = includeSIF ? parseFloat(data.k || 1.0) : 1.0;
        const i_i = includeSIF ? parseFloat(data.i_i || 1.0) : 1.0;
        const R_e = parseFloat(data.R_e || 0);

        const perpAxes = ['X', 'Y', 'Z'].filter(a => a !== seg.axis);
        let Sb_components = [];
        let totalF = 0, totalM = 0;

        // Note: The GC Method implies that an orthogonal leg absorbs the displacement of its perpendicular legs.
        // A leg running along X absorbs displacement generated along Y and Z.
        perpAxes.forEach(p => {
            const d = deltas[p];
            if (d <= 0) return;
<<<<<<< Updated upstream

=======

>>>>>>> Stashed changes
            let F, M, Sb;
            if (k > 1.0 && R_e > 0) {
                const res = gcWithFlexibility(E, I, Z, D_o, d, L_in, k, R_e);
                F = res.F_lbf; M = res.M_inlbf; Sb = res.Sb_psi;
            } else {
                const res = gcBasic(E, I, Z, D_o, d, L_in);
                F = res.F_lbf; M = res.M_inlbf; Sb = res.Sb_psi;
            }
            // SIF applies to the bending stress component
            const SE = i_i * Sb;
            Sb_components.push(SE);
            totalF += F; totalM += M;
        });

        const Sb_combined = combineStressAtNode(Sb_components);
        legResults.push({
<<<<<<< Updated upstream
            legId: seg.id,
            axis: seg.axis,
            L_in: L_in,
            F_lbf: totalF,
            M_inlbf: totalM,
=======
            legId: seg.id,
            axis: seg.axis,
            L_in: L_in,
            F_lbf: totalF,
            M_inlbf: totalM,
>>>>>>> Stashed changes
            Sb_psi: Sb_combined
        });
        log(5, `Leg ${seg.id}: F=${totalF.toFixed(0)}lbf, M=${totalM.toFixed(0)}in-lbf, Sb_combined=${Sb_combined.toFixed(0)}psi`);
    });

    const nodeResults = [];
<<<<<<< Updated upstream
    let critical = null;
    let maxRatio = 0;
=======
    let critical = null;
    let maxRatio = 0;
>>>>>>> Stashed changes
    let overAll = 'PASS';

    // Calculate nodal stress by combining stresses from attached segments.
    // In a pure GC analysis, nodal stress is often taken as the highest segment stress entering it,
    // or properly combined if multiple segments are deflecting. We combine them vectorially.
    Object.keys(nodes).forEach(nId => {
        // Find legs connected to this node
        const connectedLegs = legResults.filter(l => {
            const legSeg = segments.find(s => s.id === l.legId);
            return legSeg && (legSeg.startNode === nId || legSeg.endNode === nId);
        });

        // Sum the component stresses vectorially
        const combined = combineStressAtNode(connectedLegs.map(l => l.Sb_psi || 0));
        const { ratio, result } = stressCheck(combined, SA);
<<<<<<< Updated upstream

        if (ratio > maxRatio) {
            maxRatio = ratio;
            critical = nId;
        }
        if (result === 'FAIL') overAll = 'FAIL';

        nodeResults.push({
            nodeId: nId,
            SE_psi: combined,
            SA_psi: SA,
            ratio,
            result
=======

        if (ratio > maxRatio) {
            maxRatio = ratio;
            critical = nId;
        }
        if (result === 'FAIL') overAll = 'FAIL';

        nodeResults.push({
            nodeId: nId,
            SE_psi: combined,
            SA_psi: SA,
            ratio,
            result
>>>>>>> Stashed changes
        });
    });

    log(7, `RESULT: ${overAll}. Critical Node: ${critical} (ratio=${maxRatio.toFixed(3)})`);

    return { legResults, nodeResults, criticalNode: critical, overallResult: overAll, debugLog };
}
