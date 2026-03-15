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
    const numTiers = parseInt(structSettings.numTiers || 3, 10);

    // 1. Process Lines (Calculate Loop Order and Tiers)
    const processed = lines.map(line => {
        const pipe = getPipe(line.sizeNps, line.schedule);
        const e = getExp(line.material, line.tOperate);
        const delta_in = (e / 100) * runLength_ft;
        const I = pipe.I;
        const loopOrder = I * delta_in; // Stiffness * Growth

        let solverTier = 1;
        if (line.service.includes('Flare')) solverTier = 3;
        else if (line.service.includes('Utility') || line.service.includes('Gas')) solverTier = 2;

        // User override wins; clamp to numTiers
        const finalTier = Math.max(1, Math.min(numTiers, parseInt(line.tier ?? solverTier, 10)));

        return {
            ...line,
            delta_in,
            I,
            loopOrder,
            tier: finalTier,
            OD_in: pipe.OD,
            flgRad_in: getFlangeRad(line.sizeNps, line.flange)
        };
    });

    // 2. Separate into Tiers and Sort
    const tiers = {};
    for (let t = 1; t <= numTiers; t++) tiers[t] = [];
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

        // Future Space - CENTER GAP INSERT
        // Calculate the current occupied width of the tier elements approximately to insert a proportional gap
        let currentOccupied_beforeGap = structSettings.beamWidth_mm + structSettings.gussetGap_mm * 2;
        combined.forEach((line, idx) => {
            const ins_mm = line.insulationThk * 25.4;
            const od_mm = line.OD_in * 25.4;
            const flgRad_mm = line.flgRad_in * 25.4;
            currentOccupied_beforeGap += ins_mm + flgRad_mm * 2 + od_mm + 75; // Approx add per pipe
        });

        const gapWidth_mm = currentOccupied_beforeGap * (structSettings.futureSpacePct / 100);
        const midPoint = Math.floor(combined.length / 2);

        // Only insert gap if there are pipes on the tier, otherwise the tier is just empty beam
        if (combined.length > 0) {
            const FUTURE_SLOT = {
                id: `FUTURE_${t}`,
                isFutureSlot: true,
                gapWidth_mm: Math.round(parseFloat(gapWidth_mm) / 50) * 50,
                tier: parseInt(t, 10)
            };
            combined.splice(midPoint, 0, FUTURE_SLOT);
        }

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
            const y_mm = structSettings.minClearanceGrade_mm + ((Number(t) - 1) * structSettings.tierGap_mm);

            if (line.isFutureSlot) {
                currentX_mm += parseFloat(line.gapWidth_mm); // Advance X by the gap width
                layout.push({ ...line, x_mm: currentX_mm - parseFloat(line.gapWidth_mm) / 2, y_mm });
                return;
            }

            if (line.spacing_override !== null && line.spacing_override !== undefined) {
                // User has manually placed this pipe
                layout.push({ ...line, x_mm: parseInt(line.spacing_override, 10), y_mm });
                return;
            }

            const ins_mm = line.insulationThk * 25.4;
            const od_mm = line.OD_in * 25.4;
            const flgRad_mm = line.flgRad_in * 25.4;

            if (idx === 0) {
                // First pipe starts from left edge
                currentX_mm += ins_mm + flgRad_mm;
            } else {
                // Calculate spacing from previous pipe (skip if previous was future slot, or base it on previous real pipe)
                let prevIdx = idx - 1;
                while(prevIdx >= 0 && tierGroup[prevIdx].isFutureSlot) prevIdx--;
                const prev = prevIdx >= 0 ? tierGroup[prevIdx] : null;

                if (prev) {
                    const prev_ins = prev.insulationThk * 25.4;
                    const prev_od = prev.OD_in * 25.4;
                    const prev_flgRad = prev.flgRad_in * 25.4;

                    const physGap = (prev_od/2) + prev_ins + (od_mm/2) + ins_mm;
                    const flgAllow = (prev.stagger && line.stagger) ? Math.max(prev_flgRad, flgRad_mm) : (prev_flgRad + flgRad_mm);
                    const bowing = Math.max(prev.delta_in, line.delta_in) * 25.4 * 0.15;
                    const standardGap = 75; // 50mm Guide + 25mm Air Gap

                    const S_pipe = physGap + flgAllow + bowing + standardGap;

                    // Only add S_pipe if we didn't just advance for a future slot
                    if(tierGroup[idx - 1].isFutureSlot) {
                        currentX_mm += (S_pipe / 2); // Roughly add half spacing after gap
                    } else {
                        currentX_mm += S_pipe;
                    }
                } else {
                    currentX_mm += ins_mm + flgRad_mm;
                }
            }

            layout.push({
                ...line,
                x_mm: currentX_mm,
                y_mm: y_mm
            });
        });

        // Shift everything so the origin (X=0) is the center of the beam initially to calculate true extent
        const tierLayout = layout.filter(l => l.tier === parseInt(t, 10));
        if (tierLayout.length > 0) {
            // Find the maximum span occupied by this tier's layout (from leftmost to rightmost edge)
            const minX = Math.min(...tierLayout.map(l => l.x_mm - (l.OD_in * 25.4 / 2) - (l.insulationThk * 25.4 || 0)));
            const maxX = Math.max(...tierLayout.map(l => l.x_mm + (l.OD_in * 25.4 / 2) + (l.insulationThk * 25.4 || 0)));

            // The occupied width of this tier
            const tierWidth = maxX - minX;
            maxOccupiedWidth_mm = Math.max(maxOccupiedWidth_mm, tierWidth);
        }
    });

    // Ensure width is at least the base structural minimum (e.g., 5000mm)
    // plus a small buffer so pipes don't hang exactly on the edge
    let finalWidth_mm = Math.max(5000, maxOccupiedWidth_mm + (structSettings.gussetGap_mm || 100) * 2);

    // After manual drags, a pipe might have an extreme X value.
    // We must ensure the structural beam is wide enough to support it.
    layout.forEach(l => {
        if (l.spacing_override !== null && l.spacing_override !== undefined) {
            const absX = Math.abs(l.spacing_override);
            const requiredHalfWidth = absX + (l.OD_in * 25.4 / 2) + (l.insulationThk * 25.4 || 0) + (structSettings.gussetGap_mm || 100);
            if (requiredHalfWidth * 2 > finalWidth_mm) {
                finalWidth_mm = requiredHalfWidth * 2;
            }
        }
    });

    // Final pass to shift auto-berthed pipes based on the final width,
    // so they are centered properly on the beam.
    Object.keys(tiers).forEach(t => {
        const tierLayout = layout.filter(l => l.tier === parseInt(t, 10) && (l.spacing_override === null || l.spacing_override === undefined));
        if (tierLayout.length > 0) {
            const minX = Math.min(...tierLayout.map(l => l.x_mm));
            const maxX = Math.max(...tierLayout.map(l => l.x_mm));
            const currentCenter = (minX + maxX) / 2;

            // Shift group to center (0)
            tierLayout.forEach(l => {
                l.x_mm = l.x_mm - currentCenter;
            });
        }
    });

    const logs = [
        `[SOLVER] ${lines.length} pipes processed across ${numTiers} tiers`,
        `[SOLVER] Rack Width dynamically sized to ${finalWidth_mm.toFixed(0)}mm`,
        `[SOLVER] Future Space: ${(structSettings.futureSpacePct)}% inserted at beam center`,
        ...processed.map(p => `[PIPE] ${p.id}: LoopOrder=${p.loopOrder.toFixed(1)}, Tier=${p.tier}`)
    ];

    return {
        layout,
        width_mm: finalWidth_mm,
        tiers,
        logs
    };
};
