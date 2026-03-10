/**
 * The Graph Translation Layer
 * Converts between the flat 3D Viewer PCF array and the topological Sketcher Graph.
 */

// Tolerance for merging nodes (mm)
const TOLERANCE = 1.0;

const distance = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));

export const buildGraphFromComponents = (components) => {
    const nodes = {};
    const segments = [];
    let nodeCounter = 1;

    const findOrAddNode = (pt) => {
        // Search existing nodes within tolerance
        for (const [id, node] of Object.entries(nodes)) {
            const nPt = { x: node.pos[0], y: node.pos[1], z: node.pos[2] };
            if (distance(pt, nPt) < TOLERANCE) {
                return id;
            }
        }

        // Add new node
        const newId = `N${nodeCounter++}`;
        nodes[newId] = { pos: [pt.x, pt.y, pt.z], type: 'free' };
        return newId;
    };

    // Filter to only structural piping components for now
    const structuralComps = components.filter(c => ['PIPE', 'ELBOW', 'BEND', 'TEE'].includes(c.type));

    structuralComps.forEach(comp => {
        if (!comp.points || comp.points.length < 2) return;

        const startId = findOrAddNode(comp.points[0]);
        const endId = findOrAddNode(comp.points[1]);

        if (comp.type === 'PIPE') {
            segments.push({
                id: comp.id || `S${Date.now()}_${Math.random()}`,
                startNode: startId,
                endNode: endId,
                properties: {
                    type: 'PIPE',
                    bore: comp.bore || 100, // standard fallback
                    material: comp.attributes?.MATERIAL || 'UNKNOWN'
                }
            });
        } else if (comp.type === 'ELBOW' || comp.type === 'BEND') {
            // Upgrade nodes if they are fittings
            nodes[startId].type = 'fitting';
            nodes[endId].type = 'fitting';
            if (comp.centrePoint) {
                 const centerId = findOrAddNode(comp.centrePoint);
                 nodes[centerId].type = 'elbow';

                 // In a fully robust system, we would map the elbows perfectly,
                 // but for sketching simplicity, we often reduce it to straight line intersections.
                 // For now, we will draw two invisible segments to the center to maintain topology
                 segments.push({
                     id: `${comp.id}-leg1`,
                     startNode: startId,
                     endNode: centerId,
                     properties: { type: 'FITTING_LEG', bore: comp.bore }
                 });
                 segments.push({
                     id: `${comp.id}-leg2`,
                     startNode: centerId,
                     endNode: endId,
                     properties: { type: 'FITTING_LEG', bore: comp.bore }
                 });
            }
        }
    });

    return { nodes, segments };
};

export const buildComponentsFromGraph = (nodes, segments) => {
    const components = [];
    let idCounter = 1000; // start high to avoid collision if appending

    // Convert segments back to PIPE components
    segments.forEach(seg => {
        const n1 = nodes[seg.startNode];
        const n2 = nodes[seg.endNode];

        if (!n1 || !n2) return;

        // Skip abstract fitting legs for now, we'll auto-generate fittings in a future pass
        if (seg.properties?.type === 'FITTING_LEG') return;

        components.push({
            id: seg.id || `P-${idCounter++}`,
            type: 'PIPE',
            points: [
                { x: n1.pos[0], y: n1.pos[1], z: n1.pos[2] },
                { x: n2.pos[0], y: n2.pos[1], z: n2.pos[2] }
            ],
            bore: seg.properties?.bore || 100,
            attributes: {
                MATERIAL: seg.properties?.material || 'CARBON STEEL'
            }
        });
    });

    // TODO: Auto-Fittings Pass
    // 1. Iterate over all nodes.
    // 2. Count how many segments connect to the node.
    // 3. If connections == 2 and vectors are not parallel -> generate ELBOW component.
    // 4. If connections == 3 -> generate TEE component.

    return components;
};
