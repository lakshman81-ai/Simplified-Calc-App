# Simplified Calculation App - Benchmark Suite

This document defines the expected inputs and calculated outputs to test the accuracy of the `Simplified-Calc-App`. The benchmark matrix covers standard geometric shapes across varying temperature, material, and methodology profiles.

## Section 1: 2D & Standard Geometry Benchmarks

### 1. L-Bend Benchmark (SI Units)
* **Geometry Setup:** 
  * Anchor A at (0, 0, 0)
  * Node B at (10, 0, 0) [m] -> Generator Leg: 10m
  * Anchor C at (10, 5, 0) [m] -> Absorber Leg: 5m
* **Material & Condition:** Carbon Steel (CS), $T_{oper} = 150^\circ C$
* **Methodology Divergence:**
  * **Method 1 (Legacy/Fluor):** Assumes zero axial friction.
    * Expected $\Delta X$ Expansion: $\approx 10000 \times 1.2 \times 10^{-5} \times (150-21) = 15.48$ mm
    * Expected Stress ($S_A$): Should calculate pure bending stress against the 5m leg. (e.g., $18,500$ psi)
  * **Method 2 (2D_BUNDLE):** Considers friction factor (e.g., $\mu = 0.3$).
    * Expected Stress ($S_A$): Friction induces an axial additive stress, yielding higher overall stress (e.g., $18,500 \times 1.15 = 21,275$ psi).
* **Expected Result:** Passes Legacy, Fails 2D_BUNDLE.

### 2. Z-Bend Benchmark (Imperial Units)
* **Geometry Setup:** 
  * Anchor A at (0, 0, 0)
  * Node B at (0, 20, 0) [ft]
  * Node C at (10, 20, 0) [ft]
  * Anchor D at (10, 40, 0) [ft]
* **Material & Condition:** Stainless Steel (SS316), $T_{oper} = 400^\circ F$
* **Expected Result:**
  * Both methods calculate the offset leg (10ft) absorption against the combined thermal expansion of the 2x 20ft legs.
  * Expected Stress ($S_A$): $< 15,000$ psi. Pass both.

### 3. U-Bend & Nested Loop Benchmark
* **Geometry Setup (Nested Loop):** 
  * A system with a large outer expansion loop and a smaller nested loop.
  * Leg1: 50ft, Loop Depth: 20ft, Loop Width: 10ft, Leg2: 50ft.
* **Material & Condition:** CS, $T_{oper} = 300^\circ C$
* **Expected Result:**
  * The solver must aggregate the total flexural length (Absorber) vs the straight run length (Generator). 
  * Pass expected if loop depth is sufficient to absorb $\approx 4$ inches of thermal growth.

---

## Section 2: 3D Solver & Multi-Anchor Benchmarks

These benchmarks test the engine's capability to parse complex 3D coordinate graphs and accurately apply the Rule of Rigidity (filtering short drops) and 3D vector math.

### Benchmark 3D-A: Complex 3D Routing (BM_Calc_3DA.pcf)
* **Geometry Setup:** An 8-element pipeline spanning X, Y, and Z axes. Includes a specific short-drop on the Z-axis (2.5ft) which the engine's `Rule of Rigidity` *must* filter out and ignore for flexibility calculations.
* **Material & Condition:** Alloy Steel, $T_{oper} = 250^\circ C$
* **Expected Engine Action:** The solver's `parseGeometry` function must log `shortDropsIgnored: 1`. 
* **Expected Output:** The calculated `bendingLegs.z` must *exclude* the 2.5ft drop length.

### Benchmark 3D-B: Multi-Anchor System (BM_Calc_3DB_MultiAnchor.pcf)
* **Geometry Setup:** A header line bounded by two primary anchors (A1, A2), with a branch line dropping to a third anchor (A3).
* **Expected Engine Action:** The solver must successfully split the topology into two Sub-Systems (A1-A2 and Branch-A3) and run the `ExtendedSolver` independently for both paths. 

### Benchmark 3D-C: Vessel Nozzle MIST & Koves Flange (BM_Calc_3DC_Vessel.pcf)
* **Geometry Setup:** A short, rigid pipe routing heavily loaded by thermal expansion ($600^\circ F$) terminating at a pressure vessel nozzle (Anchor).
* **Inputs:** Vessel OD: 72", Thk: 0.5", Nozzle Rad: 6", Flange Class: 300#, Design Press: 450 psi.
* **Expected Engine Action:**
  * The pipe stress itself may pass, but the immense forces must be passed to the Phase 3 (MIST Shell Shakedown) and Phase 4 (Koves Flange Leakage) solvers.
  * **Expected Output:** The `flangeStatus` must return `FAIL` due to the equivalent load exceeding the allowable capacity at $600^\circ F$ for a 300# rating.
