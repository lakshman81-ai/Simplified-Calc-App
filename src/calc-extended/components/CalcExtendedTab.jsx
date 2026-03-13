import React, { useEffect } from 'react';
import { useExtendedStore } from '../store/useExtendedStore';
import { useAppStore } from '../../store/appStore';
import DashboardView from './DashboardView';
import Viewport3DView from './Viewport3DView';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 49px)', // Accounting for TopNav
    width: '100%',
    backgroundColor: '#020617', // Slate 950
    color: '#e2e8f0',
    overflow: 'hidden',
  }
};

export default function CalcExtendedTab() {
  const { activeView, importFromGlobal } = useExtendedStore();
  const globalNodes = useAppStore(state => state.nodes);
  const globalSegments = useAppStore(state => state.segments);

  // Auto-import geometry from global store when this tab loads
  // Use useEffect to ensure it only happens once and deep clones
  useEffect(() => {
    importFromGlobal(globalNodes, globalSegments);
  }, [importFromGlobal, globalNodes, globalSegments]);

  return (
    <div style={styles.container}>
      {activeView === 'dashboard' ? <DashboardView /> : <Viewport3DView />}
    </div>
  );
}
