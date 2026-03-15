import React, { useEffect, useState } from 'react';
import { usePipeRackStore } from '../store/usePipeRackStore';
import { useAppStore } from '../../store/appStore';
import { generateSectionLayout } from '../solver/AdvancedLayoutSolver';
import { formatUnit } from '../../calc-extended/utils/units';
import SectionCanvas from './SectionCanvas';
import SectionMiniMap from './SectionMiniMap';

const styles = {
    overlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#020617', zIndex: 50, display: 'flex', flexDirection: 'column' },
    header: { padding: '16px 24px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' },
    closeBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    main: { flex: 1, display: 'flex', overflow: 'hidden' },
    leftPanel: { width: '300px', background: '#0f172a', borderRight: '1px solid #1e293b', padding: '16px', overflowY: 'auto' },
    viewport: { flex: 1, position: 'relative', background: '#000' },
    miniMap: { position: 'absolute', bottom: '16px', right: '16px', width: '250px', height: '180px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', borderRadius: '8px', padding: '8px' }
};

export default function SectionCreatorTab() {
    const { isSectionCreatorOpen, toggleSectionCreator, lines, globalSettings, structuralSettings, sectionLayout, setSectionLayout } = usePipeRackStore();
    const unitSystem = useAppStore(s => s.unitSystem);

    useEffect(() => {
        if (isSectionCreatorOpen) {
            // Auto-run the solver layout
            const newLayout = generateSectionLayout(lines, globalSettings, structuralSettings);
            setSectionLayout(newLayout);
        }
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

                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', marginTop: '24px', marginBottom: '8px' }}>AUTO-BERTHING ALGORITHM</div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                        The engine sorts hot/heavy lines to the outside edges and leaves the center open for future expansion.
                    </div>
                </div>

                <div style={styles.viewport}>
                    <SectionCanvas layout={sectionLayout?.layout} width_mm={sectionLayout?.width_mm} tiers={sectionLayout?.tiers || {}} />

                    <div style={{ position: 'absolute', top: '16px', left: '16px', color: '#f8fafc', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '4px' }}>
                        Rack Width: {sectionLayout ? formatUnit(unitSystem, 'length', sectionLayout.width_mm / 25.4 / 12) : '-'}
                    </div>

                    <div style={styles.miniMap}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}>PLAN VIEW THUMBNAIL</div>
                        <SectionMiniMap layout={sectionLayout?.layout} width_mm={sectionLayout?.width_mm} tiers={sectionLayout?.tiers} />
                    </div>
                </div>
            </div>
        </div>
    );
}
