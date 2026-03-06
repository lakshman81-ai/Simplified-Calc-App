import React from 'react';
import { useAppStore } from './store/appStore';
import { TopNav } from './components/TopNav';
import { Viewer3DTab } from './components/Viewer3DTab';
import { DataTableTab } from './components/DataTableTab';
import { TransformTab } from './components/TransformTab';
import { SimpAnalysisTab } from './components/SimpAnalysisTab';
import { Spl2BundleTab } from './spl2-bundle';
import { ConfigTab } from './config/ConfigTab';
import './App.css';

function App() {
  const activeTab = useAppStore(state => state.activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', background: '#0f172a' }}>
      <TopNav />
      {activeTab === 'viewer' && <Viewer3DTab />}
      {activeTab === 'datatable' && <DataTableTab />}
      {activeTab === 'transform' && <TransformTab />}
      {activeTab === 'simpAnalysis' && <SimpAnalysisTab />}
      {activeTab === 'spl2bundle' && <Spl2BundleTab />}
      {activeTab === 'config' && <ConfigTab />}
    </div>
  );
}

export default App;
