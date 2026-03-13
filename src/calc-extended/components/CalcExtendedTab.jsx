import React from 'react';
import { useExtendedStore } from '../store/useExtendedStore';
import Dashboard from './Dashboard';
import Viewport3D from './Viewport3D';
import DebugConsole from './DebugConsole';

const CalcExtendedTab = () => {
  const activeView = useExtendedStore((state) => state.activeView);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {activeView === 'DASHBOARD' ? <Dashboard /> : <Viewport3D />}
      <DebugConsole />
    </div>
  );
};

export default CalcExtendedTab;