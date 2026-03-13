import React, { useEffect } from 'react';
import { useExtendedStore } from '../store/useExtendedStore';
import { useAppStore } from '../../store/appStore';
import DashboardView from './DashboardView';
import Viewport3DView from './Viewport3DView';
import PipeRackTab from '../../piperack/components/PipeRackTab';
import Bundle2DSolverView from './Bundle2DSolverView';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 49px)', // Accounting for TopNav
    width: '100%',
    backgroundColor: '#020617', // Slate 950
    color: '#e2e8f0',
    overflow: 'hidden',
  },
  subNav: {
    display: 'flex',
    alignItems: 'center',
    background: '#1e293b',
    borderBottom: '1px solid #334155',
    padding: '0 24px',
    height: '50px',
    flexShrink: 0
  },
  subTab: (isActive) => ({
    padding: '0 24px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: isActive ? '#38bdf8' : '#94a3b8',
    borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
    fontWeight: isActive ? 'bold' : 'normal',
    fontSize: '13px',
    userSelect: 'none'
  }),
  toggleWrapper: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#94a3b8'
  },
  select: {
    background: '#0f172a',
    color: '#fff',
    border: '1px solid #334155',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '12px'
  }
};

export default function CalcExtendedTab() {
  const { activeView, activeSubTab, setActiveSubTab, methodology, setMethodology, importFromGlobal } = useExtendedStore();
  const globalNodes = useAppStore(state => state.nodes);
  const globalSegments = useAppStore(state => state.segments);

  // Auto-import geometry from global store when this tab loads
  // Use useEffect to ensure it only happens once and deep clones
  useEffect(() => {
    importFromGlobal(globalNodes, globalSegments);
  }, [importFromGlobal, globalNodes, globalSegments]);

  return (
    <div style={styles.container}>
      <div style={styles.subNav}>
        <div style={styles.subTab(activeSubTab === '2d')} onClick={() => setActiveSubTab('2d')}>2D Solver</div>
        <div style={styles.subTab(activeSubTab === '3d')} onClick={() => setActiveSubTab('3d')}>3D Solver</div>
        <div style={styles.subTab(activeSubTab === 'piperack')} onClick={() => setActiveSubTab('piperack')}>Pipe Rack Calc</div>

        <div style={styles.toggleWrapper}>
          Methodology:
          <select style={styles.select} value={methodology} onChange={e => setMethodology(e.target.value)}>
            <option value="FLUOR">Fluor (Guided Cantilever + MIST)</option>
            <option value="2D_BUNDLE">Simp. 2D Bundle Equations</option>
          </select>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeSubTab === '2d' && <Bundle2DSolverView />}
        {activeSubTab === '3d' && (activeView === 'dashboard' ? <DashboardView /> : <Viewport3DView />)}
        {activeSubTab === 'piperack' && <PipeRackTab />}
      </div>
    </div>
  );
}
