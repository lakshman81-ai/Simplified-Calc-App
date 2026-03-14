import expansionCoeffs from '../../calc-extended/db/expansion_coefficients.json';
import pipeProps from '../../calc-extended/db/pipe_properties.json';

// DB Lookup
const getExp = (material, temp) => {
    const sorted = [...expansionCoeffs].sort((a, b) => a.temp_F - b.temp_F);
    if (temp <= sorted[0].temp_F) return sorted[0].e_in_per_100ft;
    if (temp >= sorted[sorted.length - 1].temp_F) return sorted[sorted.length - 1].e_in_per_100ft;
    for (let i = 0; i < sorted.length - 1; i++) {
        if (temp >= sorted[i].temp_F && temp <= sorted[i + 1].temp_F) {
            const ratio = (temp - sorted[i].temp_F) / (sorted[i + 1].temp_F - sorted[i].temp_F);
            return sorted[i].e_in_per_100ft + ratio * (sorted[i + 1].e_in_per_100ft - sorted[i].e_in_per_100ft);
        }
    }
    return 0;
};

const getPipe = (nps, sch) => {
    return pipeProps.find(p => p.nominal_size === nps && p.schedule === sch) || pipeProps[0];
};

const getFlangeRad = (nps, rating) => {
    // Rough estimate for flange diameter based on class
    const multiplier = rating === '150#' ? 1.5 : (rating === '300#' ? 1.75 : 2.0);
    return (nps * multiplier) / 2;
};

// Main Export pure function
export const generateSectionLayout = (lines, globalSettings, structSettings) => {
    const runLength_ft = globalSettings.anchorDistanceFt;

    // 1. Process Lines (Calculate Loop Order and Tiers)
    const processed = lines.map(line => {
        const pipe = getPipe(line.sizeNps, line.schedule);
        const e = getExp(line.material, line.tOperate);
        const delta_in = (e / 100) * runLength_ft;
        const I = pipe.I;
        const loopOrder = I * delta_in; // Stiffness * Growth

        let tier = 1;
        if (line.service.includes('Flare')) tier = 3;
        else if (line.service.includes('Utility') || line.service.includes('Gas')) tier = 2;

        return {
            ...line,
            delta_in,
            I,
            loopOrder,
            tier,
            OD_in: pipe.OD,
            flgRad_in: getFlangeRad(line.sizeNps, line.flange)
        };
    });

    // 2. Separate into Tiers and Sort
    const tiers = { 1: [], 2: [], 3: [] };
    processed.forEach(p => tiers[p.tier].push(p));

    // Sort heavily expanding lines to the OUTSIDE.
    // We will place odd indexes on the left edge, even indexes on the right edge.
    // If a line has a userOrderIndex, we respect it, otherwise auto-berth.
    Object.keys(tiers).forEach(t => {
        const tierLines = tiers[t];
        const userSorted = tierLines.filter(l => l.userOrderIndex !== null).sort((a,b) => a.userOrderIndex - b.userOrderIndex);
        const autoSorted = tierLines.filter(l => l.userOrderIndex === null).sort((a,b) => b.loopOrder - a.loopOrder);

        // Distribute auto-sorted (Heavy outside, light inside)
        const leftArr = [];
        const rightArr = [];
        autoSorted.forEach((line, idx) => {
            if (idx % 2 === 0) leftArr.push(line);
            else rightArr.push(line);
        });

        // Final tier array (Left to Right)
        const combined = [...leftArr, ...userSorted, ...rightArr.reverse()];

        // Update user order indexes for consistency in UI
        combined.forEach((line, idx) => line.userOrderIndex = idx);
        tiers[t] = combined;
    });

    // 3. Spacing Calculation & X-Coordinate Assignment (in mm for UI rendering)
    const layout = [];
    let maxOccupiedWidth_mm = 0;

    Object.keys(tiers).forEach(t => {
        const tierGroup = tiers[t];
        if (tierGroup.length === 0) return;

        let currentX_mm = structSettings.beamWidth_mm / 2 + structSettings.gussetGap_mm;

        tierGroup.forEach((line, idx) => {
            const ins_mm = line.insulationThk * 25.4;
            const od_mm = line.OD_in * 25.4;
            const flgRad_mm = line.flgRad_in * 25.4;

            if (idx === 0) {
                // First pipe starts from left edge
                currentX_mm += ins_mm + flgRad_mm;
            } else {
                // Calculate spacing from previous pipe
                const prev = tierGroup[idx - 1];
                const prev_ins = prev.insulationThk * 25.4;
                const prev_od = prev.OD_in * 25.4;
                const prev_flgRad = prev.flgRad_in * 25.4;

                const physGap = (prev_od/2) + prev_ins + (od_mm/2) + ins_mm;
                const flgAllow = (prev.stagger && line.stagger) ? Math.max(prev_flgRad, flgRad_mm) : (prev_flgRad + flgRad_mm);
                const bowing = Math.max(prev.delta_in, line.delta_in) * 25.4 * 0.15;
                const standardGap = 75; // 50mm Guide + 25mm Air Gap

                const S_pipe = physGap + flgAllow + bowing + standardGap;
                currentX_mm += S_pipe;
            }

            // Assign X and Y
            const y_mm = structSettings.minClearanceGrade_mm + ((Number(t) - 1) * structSettings.tierGap_mm);

            layout.push({
                ...line,
                x_mm: currentX_mm,
                y_mm: y_mm
            });
        });

        // Track max width
        if (tierGroup.length > 0) {
            const lastPipe = layout[layout.length - 1];
            const end_X = lastPipe.x_mm + (lastPipe.insulationThk * 25.4) + (structSettings.beamWidth_mm / 2) + structSettings.gussetGap_mm;
            maxOccupiedWidth_mm = Math.max(maxOccupiedWidth_mm, end_X);
        }
    });

    const finalWidth_mm = maxOccupiedWidth_mm * (1 + (structSettings.futureSpacePct / 100));

    // Shift everything so the origin (X=0) is the center of the beam
    const offset = finalWidth_mm / 2;
    layout.forEach(l => l.x_mm = l.x_mm - offset);

    return {
        layout,
        width_mm: finalWidth_mm,
        tiers
    };
};
