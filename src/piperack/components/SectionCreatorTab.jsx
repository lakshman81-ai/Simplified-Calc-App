import React, { useEffect, useState } from 'react';
import { usePipeRackStore } from '../store/usePipeRackStore';
import { useAppStore } from '../../store/appStore';
import { generateSectionLayout } from '../solver/AdvancedLayoutSolver';
import { formatUnit } from '../../calc-extended/utils/units';
import SectionCanvas from './SectionCanvas';
import SectionMiniMap from './SectionMiniMap';

const styles = {
    overlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#020617', zIndex: 1000, display: 'flex', flexDirection: 'column' },
    header: { padding: '16px 24px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' },
    closeBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    main: { flex: 1, display: 'flex', overflow: 'hidden' },
    leftPanel: { width: '300px', background: '#0f172a', borderRight: '1px solid #1e293b', padding: '16px', overflowY: 'auto' },
    viewport: { flex: 1, position: 'relative', background: '#000', display: 'flex', flexDirection: 'row' },
    miniMapContainer: { width: '250px', background: '#0f172a', borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', overflowY: 'auto' }
};

export default function SectionCreatorTab() {
    const { isSectionCreatorOpen, toggleSectionCreator, lines, globalSettings, structuralSettings, setSectionLayout, movePipeTier, addTier, logStream } = usePipeRackStore();
    const unitSystem = useAppStore(s => s.unitSystem);
    const [terminalOpen, setTerminalOpen] = useState(true);

    // Derive sectionLayout dynamically instead of using useEffect to prevent infinite render loops
    const sectionLayout = React.useMemo(() => {
        if (!isSectionCreatorOpen) return null;
        const layout = generateSectionLayout(lines, globalSettings, structuralSettings);

        // Push to store asynchronously to avoid React render phase warnings
        setTimeout(() => {
            setSectionLayout(layout);
        }, 0);

        return layout;
    }, [isSectionCreatorOpen, lines, globalSettings, structuralSettings, setSectionLayout]);

    if (!isSectionCreatorOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.header}>
                <div style={styles.title}>Advanced Pipe Rack Section Creator</div>
                <button style={styles.closeBtn} onClick={() => toggleSectionCreator(false)}>Close Designer</button>
            </div>
            <div style={styles.main}>
                <div style={styles.leftPanel}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>STRUCTURAL CONSTRAINTS</div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '16px' }}>Configure the physical dimensions of the rack.</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                        <span>Future Space (%):</span>
                        <input type="number" style={{ width: '60px', background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '2px' }} value={structuralSettings.futureSpacePct} onChange={(e) => usePipeRackStore.getState().updateStructuralSetting('futureSpacePct', Number(e.target.value))} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                        <span>Gusset Gap (mm):</span>
                        <input type="number" style={{ width: '60px', background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '2px' }} value={structuralSettings.gussetGap_mm} onChange={(e) => usePipeRackStore.getState().updateStructuralSetting('gussetGap_mm', Number(e.target.value))} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                        <span>Tier Spacing (mm):</span>
                        <input type="number" style={{ width: '60px', background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '2px' }} value={structuralSettings.tierGap_mm} onChange={(e) => usePipeRackStore.getState().updateStructuralSetting('tierGap_mm', Number(e.target.value))} />
                    </div>

                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', marginTop: '24px', marginBottom: '8px' }}>TIER CONFIGURATION</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                        <span>Tiers:</span>
                        <input type="number" min="1" max="5" style={{ width: '60px', background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '2px' }} value={structuralSettings.numTiers || 3} onChange={(e) => usePipeRackStore.getState().updateStructuralSetting('numTiers', Number(e.target.value))} />
                    </div>
                    <button onClick={addTier} style={{ width: '100%', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '6px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>+ Add Tier</button>

                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>PIPE TIER CARDS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {lines.map((line) => (
                            <div key={line.id} style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #334155' }}>
                                <button onClick={() => movePipeTier(line.id, 1)} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
                                <div style={{ flex: 1, padding: '0 8px', textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '2px' }}>{line.id} · {line.sizeNps}" {line.service.split('-')[0]}</div>
                                    <div style={{ color: '#cbd5e1', fontSize: '10px', marginBottom: '2px' }}>{line.material} | {line.tOperate}°F</div>
                                    <div style={{ color: '#94a3b8', fontSize: '10px' }}>Tier: {line.tier} | Loop: {line.loop_order?.toFixed(1) || 0}</div>
                                </div>
                                <button onClick={() => movePipeTier(line.id, -1)} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↓</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.viewport}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <SectionCanvas layout={sectionLayout?.layout} width_mm={sectionLayout?.width_mm} tiers={sectionLayout?.tiers || {}} />
                        <div style={{ position: 'absolute', top: '16px', left: '16px', color: '#f8fafc', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '4px' }}>
                            Rack Width: {sectionLayout ? formatUnit(unitSystem, 'length', sectionLayout.width_mm / 25.4 / 12) : '-'}
                        </div>
                    </div>

                    <div style={styles.miniMapContainer}>
                        <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>PLAN VIEW THUMBNAILS</div>
                        {Array.from({ length: structuralSettings.numTiers || 3 }).map((_, i) => {
                            const tierNum = i + 1;
                            const tierLayout = sectionLayout?.layout?.filter(l => l.tier === tierNum);
                            return (
                                <div key={tierNum} style={{ background: '#020617', padding: '8px', borderRadius: '8px', border: '1px solid #334155' }}>
                                    <div style={{ fontSize: '10px', color: '#cbd5e1', marginBottom: '4px' }}>Tier {tierNum} Plan</div>
                                    <SectionMiniMap tier={tierNum} layout={tierLayout} width_mm={sectionLayout?.width_mm} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div style={{ height: terminalOpen ? '200px' : '34px', transition: '0.2s ease', background: '#020617', borderTop: '1px solid #1e293b', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ background: '#0f172a', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', cursor: 'pointer', borderBottom: '1px solid #1e293b', userSelect: 'none' }} onClick={() => setTerminalOpen(!terminalOpen)}>
                    {terminalOpen ? '▼' : '▲'} CALCULATION TERMINAL
                </div>
                {terminalOpen && (
                    <div style={{ overflowY: 'auto', height: '166px', fontFamily: 'monospace', fontSize: '11px', padding: '8px' }}>
                        {logStream.slice().reverse().map((log, i) => (
                            <div key={i} style={{ color: log.includes('FAIL') ? '#ef4444' : (log.includes('WARN') ? '#facc15' : '#10b981'), padding: '1px 8px' }}>
                                {log}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
