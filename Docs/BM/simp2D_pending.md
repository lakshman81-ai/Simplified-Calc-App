# Simplified 2D Bundle - Missing Features Report

Based on a review of the `spl2-bundle/spl2_master.html` application, the following features, inputs, and graphics options are currently implemented in the standalone 2D Bundle but are **missing** from our modernized "Extended Calc" / React Walled Garden integration.

## 1. Missing Input Options
*   **Insulation Properties:**
    *   `Insulation Density` (e.g., 8.112)
    *   `Insulation Thickness` (currently mocked or missing in some solver paths)
*   **Environmental Parameters:**
    *   `Ambient Temperature` (e.g., 70°F default)
*   **Mechanical Parameters (Applicable to 2D Bundle Method Only):**
    *   `Friction Factor (μ)` (e.g., 0.3)
*   **Corrosion/Manufacturing Constraints:**
    *   `Corrosion Allowance`
    *   `Mill Tolerance (%)`

### 1.1 Impact Analysis & Incorporation Strategy (Inputs)
Since the `Extended Calc` module uses a master methodology toggle to switch between the mathematical engines (Fluor vs. 2D Bundle), adding these new inputs must be handled carefully so as not to pollute or break equations that do not require them.

*   **Environmental Parameters (Ambient Temp):**
    *   *Impact:* Low.
    *   *Strategy:* The code currently bases thermal expansion solely on the operating temperature lookup (assuming installation at 70°F). We can lock the base `Ambient Temperature` to 21°C / 70°F globally in the `useExtendedStore`. This avoids UI clutter and has zero impact on either the Fluor or 2D Bundle background calculations.
*   **Mechanical Parameters (Friction):**
    *   *Impact:* Medium. The Fluor Guided Cantilever method ignores frictional support resistance in its baseline thermal expansion calculations, whereas the 2D Bundle may account for it.
    *   *Strategy:* Add this input to the `useExtendedStore`, but in the UI, dynamically hide or grey out the `Friction Factor` input when the master toggle is set to `FLUOR`. Add a tooltip or legend indicating: *"Applicable to 2D Bundle Method Only"*.
*   **Corrosion/Manufacturing Constraints:**
    *   *Impact:* High. Fluor's stress evaluation ($S = 3ED\Delta / 144B^2$) relies on the Outside Diameter ($D$) and Moment of Inertia ($I$). While $D$ remains constant, corrosion allowance and mill tolerance significantly reduce the internal pipe wall thickness over time, which reduces the Area and $I$, thereby increasing the overall stress.
    *   *Strategy:* These inputs **must be implemented** into the `ExtendedSolver` (Fluor calc) as well. The solver should mathematically subtract the `Corrosion Allowance` and `(Thickness * Mill Tolerance)` from the nominal thickness provided by the `pipe_properties.json` database *before* calculating $I$ and evaluating the final stress ratios.

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

### 3.1 Impact Analysis & Incorporation Strategy (Databases)
Because the new Walled Garden module requires a strict, interpolated JSON array for expansion coefficients and modulus values (Fluor engine) but the 2D bundle has its own legacy set, merging them presents a UI challenge.

*   **Dropdown Strategy:**
    *   Do *not* create two separate dropdowns. Maintain a single "Material" dropdown in the UI.
    *   *Action Plan:* We should migrate all legacy materials from the 2D Bundle into the new `expansion_coefficients.json` and `modulus_elasticity.json` formats.
    *   If a user selects a material that lacks full temperature-interpolation data, the UI will display a warning: *"Detailed Fluor data missing for this material. Reverting to basic 2D Bundle logic or theoretical defaults."*

## 4. Next Steps for Full Integration
To achieve 100% parity with the simplified 2D bundle within the modern Walled Garden:
1.  Expand `useExtendedStore.js` to include the Environmental, Mechanical, and Insulation parameters.
2.  Update the `Bundle2DSolverView.jsx` SVG schematic to be fully interactive (clicking to place guides/anchors on specific coordinates).
3.  Implement a global unit conversion utility within the Zustand store that recalculates and re-renders the UI seamlessly.