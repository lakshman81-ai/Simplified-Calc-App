/**
 * VersionBadge.jsx — Displays the active build timestamp in bottom-right.
 * Format: ver.dd-mm-yy HH:mm
 */

import React from 'react';

// Injected at build time by Vite via define; falls back to runtime date.
const BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString();

function formatVersion(isoString) {
    const d = new Date(isoString);
    const pad = n => String(n).padStart(2, '0');
    const dd = pad(d.getDate());
    const mm = pad(d.getMonth() + 1);
    const yy = String(d.getFullYear()).slice(2);
    const HH = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `ver.${dd}-${mm}-${yy} ${HH}:${min}`;
}

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
    return <span style={style}>{formatVersion(BUILD_TIME)}</span>;
}
