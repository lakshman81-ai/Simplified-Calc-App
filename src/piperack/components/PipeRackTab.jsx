import React from 'react';
import RackInputsDock from './RackInputsDock';
import RackVisualizer from './RackVisualizer';
import RackResultsGrid from './RackResultsGrid';
import SectionCreatorTab from './SectionCreatorTab';

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#020617', color: '#e2e8f0', overflow: 'hidden' },
  topHalf: { display: 'flex', flex: 1, borderBottom: '1px solid #1e293b', overflow: 'hidden' },
  leftDock: { width: '360px', borderRight: '1px solid #1e293b', background: '#0f172a', overflowY: 'auto' },
  rightViewport: { flex: 1, position: 'relative' },
  bottomHalf: { height: '30%', minHeight: '250px', background: '#0f172a', overflowY: 'auto', padding: '16px' }
};

export default function PipeRackTab() {
  return (
    <div style={styles.container}>
      <div style={styles.topHalf}>
        <div style={styles.leftDock}>
          <RackInputsDock />
        </div>
        <div style={styles.rightViewport}>
          <RackVisualizer />
        </div>
      </div>
      <div style={styles.bottomHalf}>
        <RackResultsGrid />
      </div>
      <SectionCreatorTab />
    </div>
  );
}
