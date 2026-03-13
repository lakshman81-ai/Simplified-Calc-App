# Simplified 2D Bundle - Missing Features Report

Based on a review of the `spl2-bundle/spl2_master.html` application, the following features, inputs, and graphics options are currently implemented in the standalone 2D Bundle but are **missing** from our modernized "Extended Calc" / React Walled Garden integration.

## 1. Missing Input Options
*   **Insulation Properties:**
    *   `Insulation Density` (e.g., 8.112)
    *   `Insulation Thickness` (currently mocked or missing in some solver paths)
*   **Environmental Parameters:**
    *   `Ambient Temperature` (e.g., 70°F default)
*   **Mechanical Parameters:**
    *   `Friction Factor (μ)` (e.g., 0.3)
*   **Corrosion/Manufacturing Constraints:**
    *   `Corrosion Allowance`
    *   `Mill Tolerance (%)`

## 2. Missing Graphical & Interactive Features
*   **Graphic Overlays:**
    *   Placing specific Anchor types visually.
    *   Placing Guide types visually on the 2D schematic.
    *   Displaying internal line fluid density/weight visualizations.
*   **Unit Toggles:**
    *   Ability to dynamically switch between Imperial (inches, lbs, PSI) and Metric (mm, N, MPa) at runtime across the entire UI.

## 3. Missing Database/Configuration
*   **Extended Materials:** The current DB limits to standard Carbon Steel and one Austenitic SS. The 2D bundle appears to support a wider array of materials or custom material input fields.
*   **Export/Report Gen:** Generating a PDF or CSV report directly from the 2D solver UI.

## 4. Next Steps for Full Integration
To achieve 100% parity with the simplified 2D bundle within the modern Walled Garden:
1.  Expand `useExtendedStore.js` to include the Environmental, Mechanical, and Insulation parameters.
2.  Update the `Bundle2DSolverView.jsx` SVG schematic to be fully interactive (clicking to place guides/anchors on specific coordinates).
3.  Implement a global unit conversion utility within the Zustand store that recalculates and re-renders the UI seamlessly.