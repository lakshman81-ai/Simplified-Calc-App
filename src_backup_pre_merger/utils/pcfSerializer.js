export function serializePcf(components) {
    let lines = [];
    components.forEach(item => {
        // Standard Component Formatting
        lines.push("MESSAGE-SQUARE");
        const type = item.type || 'PIPE';
        const mat = item.attributes?.['COMPONENT-ATTRIBUTE3'] || 'A106-B';
        const ref = item.attributes?.['REFNO'] || item.attributes?.['COMPONENT-ATTRIBUTE97'] || 'UNKNOWN';

        let lenStr = "";
        let dirStr = "EAST";
        if (item.points && item.points.length >= 2) {
            const dx = item.points[1].x - item.points[0].x;
            const dy = item.points[1].y - item.points[0].y;
            const dz = item.points[1].z - item.points[0].z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(0);
            lenStr = `, LENGTH=${dist}MM`;

            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > Math.abs(dz)) dirStr = dx > 0 ? "EAST" : "WEST";
            else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) dirStr = dy > 0 ? "NORTH" : "SOUTH";
            else dirStr = dz > 0 ? "UP" : "DOWN";
        }

        lines.push(`    ${type}, ${mat}${lenStr}, ${dirStr}, RefNo:=${ref}`);
        lines.push(type);

        if (item.points) {
            item.points.forEach(p => {
                lines.push(`    END-POINT    ${Number(p.x).toFixed(4)} ${Number(p.y).toFixed(4)} ${Number(p.z).toFixed(4)} ${Number(p.bore || item.bore || 0).toFixed(4)}`);
            });
        }

        const pipelineRef = (item.attributes?.['PIPELINE-REFERENCE'] || '').trim();
        if (pipelineRef) {
            lines.push(`    PIPELINE-REFERENCE ${pipelineRef}`);
        }

        if (item.centrePoint) {
            const cp = item.centrePoint;
            lines.push(`    CENTRE-POINT    ${Number(cp.x).toFixed(4)} ${Number(cp.y).toFixed(4)} ${Number(cp.z).toFixed(4)} ${Number(cp.bore || item.bore || 0).toFixed(4)}`);
        }

        if (item.branch1Point) {
            const bp = item.branch1Point;
            lines.push(`    BRANCH1-POINT    ${Number(bp.x).toFixed(4)} ${Number(bp.y).toFixed(4)} ${Number(bp.z).toFixed(4)} ${Number(bp.bore || item.bore || 0).toFixed(4)}`);
        }

        if (item.attributes) {
            const sortedEntries = Object.entries(item.attributes).sort(([a], [b]) => {
                const ma = a.match(/COMPONENT-ATTRIBUTE(\d+)/);
                const mb = b.match(/COMPONENT-ATTRIBUTE(\d+)/);
                if (ma && mb) return parseInt(ma[1], 10) - parseInt(mb[1], 10);
                if (ma) return 1;
                if (mb) return -1;
                return 0;
            });

            sortedEntries.forEach(([k, v]) => {
                if (k.startsWith("END-POINT-") || k === 'REFNO' || k === 'PIPELINE-REFERENCE') return;
                if (k.startsWith("<SUPPORT")) return;
                if (!v || String(v).trim() === "") return;
                lines.push(`    ${k}    ${v}`);
            });
        }
        lines.push("");
    });
    return lines.join('\n');
}
