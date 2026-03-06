import React, { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { TopNav } from './components/TopNav';
import { Viewer3DTab } from './components/Viewer3DTab';
import { TransformTab } from './components/TransformTab';
import { SimpAnalysisTab } from './components/SimpAnalysisTab';
import { Spl2BundleTab } from './spl2-bundle';
import { ConfigTab } from './config/ConfigTab';
import { mockPipingSystem } from './utils/mockData';
import './App.css';

function App() {
  const activeTab = useAppStore(state => state.activeTab);
  const setComponents = useAppStore(state => state.setComponents);

  useEffect(() => {
    setComponents(mockPipingSystem);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', background: '#0f172a' }}>
      <TopNav />
      {activeTab === 'viewer' && <Viewer3DTab />}
      {activeTab === 'transform' && <TransformTab />}
      {activeTab === 'simpAnalysis' && <SimpAnalysisTab geometryData={useAppStore.getState().components} />}
      {activeTab === 'spl2bundle' && <Spl2BundleTab />}
      {activeTab === 'config' && <ConfigTab />}
    </div>
  );
}

export default App;
