# Simplified 2D Calc Bundle Explainer

## 1. System Architecture & Component Interactions
The SPL2 bundle integrates three primary calculation suites (Loop, Pipe Rack, Simplified 3D) interconnected through a centralized `spl2_master.js` DOM controller. This allows a continuous flow of parameters like temperature (T) and Modulus (E) across all independent visualizations.

### Core Modules:
- **`spl2_master.js`**: DOM manipulation, tabular mapping, event binding, and Imperial ↔ SI metric wrappers.
- **`spl2_database.js`**: Hosts nested B31.3 standardized expansion metrics and ASME pipe dimensions.
- **`spl2_*_algo.js`**: Separate stateless pure math algorithms for processing standard mechanics.
- **`spl2_*_canvas.js`**: Vector-based rendering engines powered by `spl2_canvas.js` prototypes.

## 2. Global Metric Injection Wrapper (Imperial vs SI)
To preserve the legacy verification constraints mapping exactly to existing B31.3 tables structured around `100ft` limits and `°F`, all computational math must inherently stay in Imperial bases internally.

**Intercept Methodology Pattern:**
```javascript
// Pre-Process SI values backwards to Imperial for computation:
const T_F = isSI ? (T_user * 9/5) + 32 : T_user; 
const Sa_psi = isSI ? Sa_MPa * 145.038 : Sa_psi;

// ... Execution Pipeline computes in Native Imperial ...

// Post-Process output force explicitly back to SI:
const F_render = isSI ? F_out * 4.44822 : F_out; // lbs to N
```

## 3. Mathematical Methodologies & Core Equations

### 3.1 Loop Calculations 
Uses Kellogg's semi-analytic symmetric Guided Cantilever derivation. 

- **Equation 1**: Thermal Expansion Delta 
  ΔL = (L_total / 100) × α_rate
  Where `α_rate` is specific thermal expansion coefficient interpolated per material at temperature T.

- **Equation 2**: Area Moment of Inertia
  I = (π / 64) × (D_o⁴ - D_i⁴)

- **Equation 3**: Displacement Stress (Simplified Guided)
  S_e = (3 × E × D_o × ΔL) / (2 × L_leg²)
  Used to solve required flexible length mapping against max allowable yield bounds.

**Example Calculation**: 
NPS 10" Sch STD, W=15 ft, H=25 ft. α_rate = 1.15 in/100ft. 
ΔL for 100ft span = `1.15 inches`. 
I = `160.7 in⁴`. E = `27.9 × 10⁶ psi`.

### 3.2 Pipe Rack Calculations
Solves parallel physical gravitational static bounds alongside environmental metrics.

- **Equation 4**: Span Operational Dead Weight 
  W_op = W_pipe + W_contents + W_insulation
  Where Insulation Weight: 
  W_ins = (π × ρ_ins / 144) × [(R_out + t_ins)² - R_out²]

- **Equation 5**: Sliding Transverse Friction Force
  F_fric = W_op × μ × N_bents
  Where `μ` is the configuration Friction Factor and `N_bents` solves spatial node distributions.

- **Equation 6**: Classical Span Natural Frequency
  f_n = (C × π / 2) × √[ (E × I × g) / (W_op_per_inch × L_span⁴) ]
  Where `g = 386.4 in/s²`.

**Example Calculation**: 
NPS 10" Sch STD, 20 ft span, water filled (SG 1.0).
W_pipe = `40.5 lb/ft`. W_cont = `34.1 lb/ft`. 
W_op = `74.6 lb/ft`. Total operating load per 20ft bent = `1,492 lbs`.

### 3.3 Simplified Analysis (3D Expansion)
Analyzes complex orthogonal equipment paths mapped to continuous boundary dimensions.

- **Equation 7**: Component Displacement Check
  [ D × Δy / (L - U)² ] ≤ K_1
  Evaluates 3-axis bounding expansions mapped logically to physical routing limits.

- **Equation 8**: Segment Summation
  Σ L³ = L_x³ + L_y³ + L_z³
  Ensures spatial inertia profiles are physically sufficient to buffer thermal node thrust prior to boundary anchoring.
