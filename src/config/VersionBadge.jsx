/**
 * VersionBadge.jsx — Displays the active build timestamp in bottom-right.
 * Format: ver.dd-mm-yy HH:mm
 */

import React from 'react';

// Deep Architect Version Protocol per AGENTS.md
const VERSION_STRING = "Ver 13-03-2024 12.00"; // Updated version as requested

const style = {
    position: 'fixed',
    bottom: 8,
    right: 12,
    fontSize: 10,
    color: '#475569',
    pointerEvents: 'none',
    userSelect: 'none',
    fontFamily: 'monospace',
    zIndex: 9999,
};

export function VersionBadge() {
    return <span style={style}>{VERSION_STRING}</span>;
}
