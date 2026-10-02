# E2E Test Infra: AI Vector Anime Studio

## Test Philosophy
- Opaque-box, requirement-driven. Derived strictly from `ORIGINAL_REQUEST.md` (R1-R4) and user acceptance criteria, independent of internal UI component hierarchies.
- Methodology: Category-Partition (Tier 1) + Boundary Value Analysis (Tier 2) + Pairwise Combinatorial Testing (Tier 3) + Real-World Workload Testing (Tier 4).
- High repeatability, fast test runner execution, clean assertions without flaky delays.

## Feature Inventory Coverage Map
| # | Feature | Requirement Source | Tier 1 (Count) | Tier 2 (Count) | Tier 3 (Pairwise) | Tier 4 (Scenario) |
|---|---------|-------------------|:--------------:|:--------------:|:-----------------:|:-----------------:|
| 1 | SVG Vector Canvas | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Smooth Pan & Zoom | R1 | 5 | 5 | ✓ | ✓ |
| 3 | Reset View / Fit Screen | R1 | 5 | 5 | ✓ | ✓ |
| 4 | 4x6 Reference Grid | R1 | 5 | 5 | ✓ | ✓ |
| 5 | Multi-Layer Visibility | R1 | 5 | 5 | ✓ | ✓ |
| 6 | Layer Solo / Focus Mode | R1 | 5 | 5 | ✓ | ✓ |
| 7 | Built-in Anime Character Data | R4 | 5 | 5 | ✓ | ✓ |
| 8 | 5-Stage Evolution Revisions | R2 | 5 | 5 | ✓ | ✓ |
| 9 | 43 Micro-Step Stroke Sequence | R2 | 5 | 5 | ✓ | ✓ |
| 10 | Precision Timeline Controller | R2 | 5 | 5 | ✓ | ✓ |
| 11 | Playback State Machine | R2 | 5 | 5 | ✓ | ✓ |
| 12 | Speed Switcher (0.5x, 1x, 2x, 4x) | R2 | 5 | 5 | ✓ | ✓ |
| 13 | Real-Time Code Diff View | R3 | 5 | 5 | ✓ | ✓ |
| 14 | Full SVG Source View | R3 | 5 | 5 | ✓ | ✓ |
| 15 | 1-Click Code Copy | R3 | 5 | 5 | ✓ | ✓ |
| 16 | SVG DOM / Layer Tree View | R3 | 5 | 5 | ✓ | ✓ |
| 17 | Bidirectional Canvas-DOM Sync | R3 | 5 | 5 | ✓ | ✓ |
| 18 | Standalone SVG Export | R4 | 5 | 5 | ✓ | ✓ |
| 19 | High-Definition PNG Export | R4 | 5 | 5 | ✓ | ✓ |
| 20 | Custom JSON Data Import | R4 | 5 | 5 | ✓ | ✓ |
| 21 | Responsive Studio UI | R1 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Test Runner**: Node.js + Vitest (with DOM / jsdom environment).
- **Execution Command**: `npm.cmd test -- --run` or `npx.cmd vitest run`
- **Pass/Fail Semantics**: All test suites must exit with code 0; 0 failures, 0 skipped.
- **Test Files**:
  - `tests/e2e/tier1_feature_coverage.test.ts` (Tier 1: Feature Coverage, 105+ tests)
  - `tests/e2e/tier2_boundary_corner.test.ts` (Tier 2: Boundary & Corner Cases, 105+ tests)
  - `tests/e2e/tier3_cross_feature.test.ts` (Tier 3: Pairwise Cross-Feature Interactions, 25+ tests)
  - `tests/e2e/tier4_real_world_scenarios.test.ts` (Tier 4: Realistic User Workflows, 12+ scenarios)

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Expected Outcome |
|---|----------|--------------------|------------------|
| 1 | Full Drawing Process Playback | F8, F9, F10, F11, F12, F13 | Complete playback from 0 to 43 steps, diff changes at each step, stops at end |
| 2 | Iris Layer Fine-Tuning & Solo Focus | F5, F6, F8, F9, F16, F17 | Solo iris layer, step through Stage 04, observe dimming on non-iris and DOM node sync |
| 3 | Fast Scrubbing & Instant Diff Sync | F2, F9, F10, F13, F14 | Fast scrub slider 0 -> 25 -> 43 -> 10, verifies zero latency and correct XML/Diff |
| 4 | Standalone SVG Export & Verification | F7, F9, F18 | Export at step 43, parse exported XML, verify valid namespaces, elements, and styles |
| 5 | High-Res 4x PNG Export Integrity | F7, F9, F19 | Export 4x PNG at final step, verify dimensions match 3200x4000, canvas buffer populated |
| 6 | Custom JSON Character Data Import | F7, F9, F10, F11, F20 | Import new JSON dataset with 3 stages and 15 steps, verify timeline rehydrates correctly |
| 7 | Malformed JSON Import Graceful Handling | F20 | Attempt to import invalid schema or corrupted JSON, verify error toast and no crash |
| 8 | Complex Zoom & Pan with Grid Alignment | F1, F2, F3, F4 | Zoom in 5x to iris, pan to corner, toggle 4x6 grid, verify grid aligns with viewBox |
| 9 | 1-Click Code Copy to Clipboard | F14, F15 | Copy full SVG source, verify clipboard text matches current rendered SVG DOM |
| 10 | Cross-Stage Rapid Switching | F8, F9, F10, F13 | Jump between Stage 01, 03, 05, verify step snapshot and diff match stage boundaries |
| 11 | Layer Visibility Multi-Toggle Stress Test | F5, F6, F1 | Rapidly toggle all 6 layers on/off in sequence, verify SVG DOM reflects state exactly |
| 12 | Playback Speed Dynamics (0.5x -> 4x -> Pause) | F11, F12 | Change speed during playback, verify tick intervals scale and pause holds exact step |

## Coverage Thresholds
- Tier 1: ≥5 per feature (21 features × 5 = 105 tests)
- Tier 2: ≥5 per feature (21 features × 5 = 105 tests)
- Tier 3: ≥21 pairwise feature interaction tests
- Tier 4: ≥10 realistic application scenarios
- **Total Minimum Threshold: ≥241 test cases**
