import React from 'react';

// An SVG-based MiniMap plotting the X positions relative to the beam center
// This is exactly the "Plan View Thumbnail" requested in the engineering report.

export default function SectionMiniMap({ layout, width_mm, tiers }) {
    if (!layout || layout.length === 0) return (
        <div style={{ color: '#64748b', fontSize: '10px' }}>No lines mapped.</div>
    );

    const svgW = 230;
    const svgH = 140;
    const padding = 10;
    const drawW = svgW - (padding * 2);

    // Scale X-coordinates from Real world (mm) to SVG pixels
    const maxRealW = width_mm;
    const scale = drawW / maxRealW;

    return (
        <svg width={svgW} height={svgH} style={{ background: '#020617', borderRadius: '4px' }}>
            {/* Draw Column Bounds */}
            <rect x={padding} y={0} width={2} height={svgH} fill="#334155" />
            <rect x={padding + drawW} y={0} width={2} height={svgH} fill="#334155" />
            <text x={padding + drawW / 2} y={15} fill="#475569" fontSize="8" textAnchor="middle">Centerline</text>

            {/* Draw Pipes as long lines moving across the plan view */}
            {layout.map((pipe) => {
                // Pipe X is relative to center. Convert center to 0-based for SVG
                const svgX = padding + (drawW / 2) + (pipe.x_mm * scale);

                // Color by Tier
                const strokeColor = pipe.tier === 3 ? '#ef4444' : (pipe.tier === 2 ? '#3b82f6' : '#10b981');
                const lineW = Math.max(1, pipe.OD_in * 25.4 * scale);

                return (
                    <g key={pipe.id}>
                        <line x1={svgX} y1={25} x2={svgX} y2={svgH - 25} stroke={strokeColor} strokeWidth={lineW} opacity={0.7} />
                        <text x={svgX} y={svgH - 10} fill="#94a3b8" fontSize="8" textAnchor="middle">{pipe.id}</text>
                    </g>
                );
            })}
        </svg>
    );
}
