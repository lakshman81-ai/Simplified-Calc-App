=== Running Benchmark Test ===
2026-03-07T02:26:14.148Z [SPL2][projection] Bounding lengths - X: 6000, Y: 6000, Z: 4000
2026-03-07T02:26:14.148Z [SPL2][projection] Detected best fit plane: XY
2026-03-07T02:26:14.148Z [SPL2][projection] Transforming 4 segments to XY plane.

--- BENCHMARK ---
Expected Plane: XZ
Expected Lgen: 6000
Expected Labs: 4000

--- MATRIX PROJECTION (NEW ENGINE) ---
Detected Plane: XY
Segments:
  PIPE_1: Start [0.0, 0.0, 0.0] -> End [0.0, 3000.0, 0.0] | TrueL = 3000
  PIPE_2: Start [0.0, 3000.0, 0.0] -> End [6000.0, 3000.0, 0.0] | TrueL = 6000
  PIPE_3: Start [6000.0, 3000.0, 0.0] -> End [6000.0, 0.0, 0.0] | TrueL = 3000
  PIPE_4: Start [6000.0, 0.0, 0.0] -> End [10000.0, 0.0, 0.0] | TrueL = 4000

--- SMART 2D CONVERTER (LOGIC ENGINE) ---
Active Processed Legs: 4
  Leg Axis: Y, Length: 3000
  Leg Axis: X, Length: 6000
  Leg Axis: Y, Length: 3000
  Leg Axis: Z, Length: 4000
Calculations: {
  lBendDetected: true,
  Lgen: 6000,
  Labs: 4000,
  OD: 273,
  delta: 72,
  C: 20,
  Lreq: 2803.9971469315014,
  isSafe: true
}
