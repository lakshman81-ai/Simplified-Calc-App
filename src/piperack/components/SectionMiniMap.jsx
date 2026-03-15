import React from 'react';
import { usePipeRackStore } from '../store/usePipeRackStore';

// An SVG-based MiniMap plotting the X positions relative to the beam center
// This is exactly the "Plan View Thumbnail" requested in the engineering report.

export default function SectionMiniMap({ layout, width_mm, tiers }) {
    const lines = usePipeRackStore(state => state.lines);

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

    // Sort layout purely for dimension calculation without using hooks
    const sortedLayout = layout ? [...layout].sort((a, b) => a.x_mm - b.x_mm) : [];

    return (
        <svg width={svgW} height={svgH} style={{ background: '#020617', borderRadius: '4px' }}>
            {/* Draw Column Bounds */}
            <rect x={padding} y={0} width={2} height={svgH} fill="#334155" />
            <rect x={padding + drawW} y={0} width={2} height={svgH} fill="#334155" />
            <text x={padding + drawW / 2} y={15} fill="#475569" fontSize="8" textAnchor="middle">Centerline</text>

            {/* Draw Dimensions */}
            {sortedLayout.map((pipe, index) => {
                const currentRealX = pipe.x_mm + (maxRealW / 2); // 0-based mm from left column
                const prevRealX = index === 0 ? 0 : sortedLayout[index - 1].x_mm + (maxRealW / 2);

                const distance_mm = (currentRealX - prevRealX).toFixed(0);

                const svgPrevX = index === 0 ? padding : padding + (drawW / 2) + (sortedLayout[index - 1].x_mm * scale);
                const svgCurrentX = padding + (drawW / 2) + (pipe.x_mm * scale);
                const midX = (svgPrevX + svgCurrentX) / 2;

                return (
                    <g key={`dim-left-${pipe.id}`}>
                        <line x1={svgPrevX + 2} y1={svgH - 24} x2={svgCurrentX - 2} y2={svgH - 24} stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1={svgPrevX + 2} y1={svgH - 26} x2={svgPrevX + 2} y2={svgH - 22} stroke="#475569" strokeWidth="1" />
                        <line x1={svgCurrentX - 2} y1={svgH - 26} x2={svgCurrentX - 2} y2={svgH - 22} stroke="#475569" strokeWidth="1" />
                        <text x={midX} y={svgH - 28} fill="#64748b" fontSize="7" textAnchor="middle">{distance_mm}mm</text>
                    </g>
                );
            })}

            {/* Render Final Dimension to Right Column */}
            {sortedLayout.length > 0 && (() => {
                const lastPipe = sortedLayout[sortedLayout.length - 1];
                const lastRealX = lastPipe.x_mm + (maxRealW / 2);
                const distance_mm = (maxRealW - lastRealX).toFixed(0);

                const svgLastX = padding + (drawW / 2) + (lastPipe.x_mm * scale);
                const endX = padding + drawW;
                const midX = (svgLastX + endX) / 2;

                return (
                    <g key="dim-right-end">
                        <line x1={svgLastX + 2} y1={svgH - 24} x2={endX - 2} y2={svgH - 24} stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1={svgLastX + 2} y1={svgH - 26} x2={svgLastX + 2} y2={svgH - 22} stroke="#475569" strokeWidth="1" />
                        <line x1={endX - 2} y1={svgH - 26} x2={endX - 2} y2={svgH - 22} stroke="#475569" strokeWidth="1" />
                        <text x={midX} y={svgH - 28} fill="#64748b" fontSize="7" textAnchor="middle">{distance_mm}mm</text>
                    </g>
                );
            })()}

            {/* Draw Pipes as long lines moving across the plan view */}
            {sortedLayout.map((pipe) => {
                // Pipe X is relative to center. Convert center to 0-based for SVG
                const svgX = padding + (drawW / 2) + (pipe.x_mm * scale);

                // Color by Tier
                const strokeColor = pipe.tier === 3 ? '#ef4444' : (pipe.tier === 2 ? '#3b82f6' : '#10b981');
                const lineW = Math.max(1, pipe.OD_in * 25.4 * scale);

                const lineData = lines.find(l => l.id === (pipe.lineId || pipe.id));
                const tooltipText = lineData ? `${lineData.id}: NPS ${lineData.sizeNps} ${lineData.service} ${lineData.material}` : pipe.id;

                return (
                    <g key={pipe.id}>
                        <title>{tooltipText}</title>
                        <line x1={svgX} y1={25} x2={svgX} y2={svgH - 35} stroke={strokeColor} strokeWidth={lineW} opacity={0.7} />
                        <text x={svgX} y={svgH - 10} fill="#94a3b8" fontSize="8" textAnchor="middle">{pipe.id}</text>
                    </g>
                );
            })}
        </svg>
    );
}
