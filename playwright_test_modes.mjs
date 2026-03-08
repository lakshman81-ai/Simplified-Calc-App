import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  // Expose function or simply update Zustand.
  // wait for window.useAppStore
  await page.waitForFunction(() => window.useAppStore !== undefined);

  await page.evaluate(() => {
    const store = window.useAppStore.getState();
    const mockComps = [
      { id: '1', type: 'PIPE', attributes: { LENGTH: 1000, 'OUTSIDE-DIAMETER': 273.05, 'WALL-THICKNESS': 9.27, 'ITEM-CODE': 'A106-B', TEMP1: 150 }, points: [{x:0,y:0,z:0}, {x:1000,y:0,z:0}] },
      { id: '2', type: 'PIPE', attributes: { LENGTH: 1000, 'OUTSIDE-DIAMETER': 273.05, 'WALL-THICKNESS': 9.27, 'ITEM-CODE': 'A106-B', TEMP1: 150 }, points: [{x:1000,y:0,z:0}, {x:1000,y:1000,z:0}] },
      { id: '3', type: 'PIPE', attributes: { LENGTH: 1000, 'OUTSIDE-DIAMETER': 273.05, 'WALL-THICKNESS': 9.27, 'ITEM-CODE': 'A106-B', TEMP1: 150 }, points: [{x:1000,y:1000,z:0}, {x:2000,y:1000,z:0}] }
    ];
    store.setComponents(mockComps);
    mockComps.forEach(c => store.toggleSelection(c.id));
  });

  await page.click('text=3D to 2D Transformation');
  await page.waitForTimeout(2000);

  // Disable smart 2D so we use strict matrix projection which cares about 'L', 'Z', etc modes
  await page.evaluate(() => {
    const store = window.useAppStore.getState();
    store.setSmart2DConversionEnabled(false);
  });

  await page.waitForTimeout(500);

  // Click on the canvas center to create an anchor and split into Geo 1 and Geo 2
  const canvas = await page.$('canvas');
  if (canvas) {
      const box = await canvas.boundingBox();
      if (box) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      }
  }

  await page.waitForTimeout(1000);

  // Click Geo 1 Tab
  try {
     await page.click('text=GEO1');
     await page.waitForTimeout(500);

     // Click Force Z profile for GEO1
     await page.click('text=Force Z');
     await page.waitForTimeout(500);
  } catch(e) {
     console.log("Could not click GEO1 tab or Force Z", e);
  }

  // Click Geo 2 Tab
  try {
     await page.click('text=GEO2');
     await page.waitForTimeout(500);

     // Click Force L profile for GEO2
     await page.click('text=Force L');
     await page.waitForTimeout(500);
  } catch(e) {
     console.log("Could not click GEO2 tab or Force L", e);
  }

  await page.screenshot({ path: '/home/jules/verification/mock_transform_modes.png' });
  await browser.close();
})();
