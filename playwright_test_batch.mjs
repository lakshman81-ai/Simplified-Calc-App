import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  // Set up store so we bypass transformation UI and just inject batchAnalysisData directly to test SimpAnalysisTab
  await page.evaluate(() => {
    const store = window.useAppStore.getState();
    const batch = [
      {
        name: 'Geo 1',
        plane: 'XY',
        segments: [
          { start2D: [0, 0, 0], end2D: [1000, 0, 0], trueLength: 1000, material: 'A106-B' }
        ],
        matrix: [[1,0,0],[0,1,0],[0,0,1]],
        materials: { 'A106-B': 'A106-B (Metric)' },
        timestamp: Date.now()
      },
      {
        name: 'Geo 2',
        plane: 'XY',
        segments: [
          { start2D: [1000, 0, 0], end2D: [1000, 1000, 0], trueLength: 1000, material: 'A106-B' }
        ],
        matrix: [[1,0,0],[0,1,0],[0,0,1]],
        materials: { 'A106-B': 'A106-B (Metric)' },
        timestamp: Date.now()
      }
    ];
    store.setBatchAnalysisData(batch);
    // Backward compatibility trigger
    store.setAnalysisPayload(batch[0]);
    store.setActiveTab('simpAnalysis');
  });

  await page.waitForTimeout(2000);

  // Take screenshot of Simp Analysis with Batch Tabs
  await page.screenshot({ path: '/home/jules/verification/mock_simp_batch_tabs_geo1.png' });

  // Try to click Geo 2 tab
  try {
     await page.click('text=Geo 2');
     await page.waitForTimeout(1000);
     await page.screenshot({ path: '/home/jules/verification/mock_simp_batch_tabs_geo2.png' });
  } catch(e) {
     console.log("Could not click Geo 2 tab", e);
  }

  await browser.close();
})();
