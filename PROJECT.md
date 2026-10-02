# Project: AI Vector Anime Studio

## Architecture
Web-based vector drawing, layer inspection, process playback, and code diff platform.
- **Client Architecture**: Pure client-side Single Page Application (SPA), zero external backend dependencies, instant loading.
- **Technology Stack**:
  - Runtime: Node.js (Windows PowerShell uses `npm.cmd` / `npx.cmd`)
  - Framework: React 19 + TypeScript + Vite 6
  - Styling: Tailwind CSS (modern dark studio theme)
  - Icons: Lucide React
  - Unit/Integration Testing: Vitest + React Testing Library + jsdom
  - E2E Test Runner: Node.js / Playwright / Vitest test harness with browser & DOM simulation
- **Core Subsystems**:
  1. `CanvasSubsystem`: SVG rendering engine (`viewBox="0 0 800 1000"`), PointerEvents pan handler, cursor-anchored wheel zoom, fit-to-screen transform matrix, 4x6 anime reference grid.
  2. `LayerSubsystem`: 6 layers (`all`, `hair`, `iris`, `clothes`, `shadow_highlight`, `line_art`), binary visibility toggle, contextual Solo/Focus isolation mode (15% opacity + 85% grayscale on background layers).
  3. `PlaybackEngine`: RAF-coalesced time accumulator, deterministic cumulative stroke projection `renderSVG(stepIndex, activeLayers, soloLayer)`, 0.5x/1x/2x/4x playback speeds, instant scrubbing.
  4. `DiffAndDOMSubsystem`: Pre-indexed step delta calculator + Myers line/token diff, XML syntax tokenizer with line numbers, 1-click clipboard copy, virtual SVG DOM tree hierarchy with bidirectional canvas highlighting.
  5. `DataAndIOEngine`: Built-in 43-step 5-stage "Purple-haired Gold-eyed Anime Girl" vector dataset, standalone `.svg` XML exporter, 1x/2x/4x `.png` HTML5 Canvas rasterizer, and JSON schema validator/importer.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | SVG Vector Canvas | Interactive SVG rendering in standard `0 0 800 1000` coordinate space | M1 | R1 |
| 2 | Smooth Pan & Zoom | Drag to pan, wheel zoom anchored to cursor, clamped scale range (0.1x - 10x) | M1 | R1 |
| 3 | Reset View / Fit Screen | 1-click zoom reset and intelligent fit-to-screen centering with padding | M1 | R1 |
| 4 | 4x6 Reference Grid | Togglable 4x6 anime proportion rule grid overlay with coordinate markers | M1 | R1 |
| 5 | Multi-Layer Visibility | 6 layer toggles (`all`, `hair`, `iris`, `clothes`, `shadow_highlight`, `line_art`) with zero layout shift | M1 | R1 |
| 6 | Layer Solo / Focus Isolation | Dim non-focused layers to 15% opacity + 85% grayscale while focusing active layer | M1 | R1 |
| 7 | Built-in Anime Character Data | Exquisite "Purple-haired Gold-eyed Anime Girl" full vector artwork dataset | M4 | R4 |
| 8 | 5-Stage Evolution Revisions | 5 distinct phases: 01草图 -> 02细化 -> 03修正 -> 04虹膜 -> 05润部 | M2 | R2 |
| 9 | 43 Micro-Step Stroke Sequence | 43 discrete micro-strokes with title, description, layer, and cumulative geometry | M2 | R2 |
| 10 | Precision Timeline Controller | Continuous/discrete slider (0%-100%), step fraction display (e.g. 43/43 步), stage chips | M2 | R2 |
| 11 | Playback State Machine | Play, pause, loop, step forward, step backward, stage jump navigation | M2 | R2 |
| 12 | Speed Switcher | Normal (1x), fast (2x), ultra (4x), and slow-motion (0.5x) playback speeds | M2 | R2 |
| 13 | Real-Time Code Diff View | "本次代码变化" panel showing additions (+ green) and deletions (- red) for current step | M3 | R3 |
| 14 | Full SVG Source View | "完整 SVG 源码" panel with XML syntax highlighting and line numbers | M3 | R3 |
| 15 | 1-Click Code Copy | Resilient clipboard copy with toast feedback for full SVG and step diffs | M3 | R3 |
| 16 | SVG DOM / Layer Tree View | Hierarchical tree view of SVG nodes with layer tags and attribute inspection | M3 | R3 |
| 17 | Bidirectional Canvas-DOM Sync | Hovering/selecting DOM node highlights it on canvas with accent bounding box | M3 | R3 |
| 18 | Standalone SVG Export | Clean, valid `.svg` file download with XML declarations, namespaces, and viewBox | M4 | R4 |
| 19 | High-Definition PNG Export | HTML5 Canvas rasterization at 1x, 2x, 4x resolutions with PNG download | M4 | R4 |
| 20 | Custom JSON Data Import | Schema-validated JSON file upload / dropzone, rehydrating timeline and canvas | M4 | R4 |
| 21 | Responsive Studio UI | Dual-pane studio layout (62:38), dark mode theme, header stats, responsive controls | M1 | R1 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Studio Shell, Canvas & Layer System | UI Shell, Pan/Zoom/Grid/Fit canvas engine, 6-layer visibility & solo mode (F1-F6, F21) | none | DONE |
| M2 | Playback Engine & 5-Stage Timeline | 43-step cumulative projection, 5-stage timeline controller, play/pause/speed (F8-F12) | M1 | IN_PROGRESS |
| M3 | Code Diff, Syntax Highlighter & DOM Tree | Real-time diff panel, full SVG viewer with copy, DOM tree with bidirectional sync (F13-F17) | M1, M2 | PLANNED |
| M4 | Built-in Anime Sample & Export/Import | Exquisite character dataset, standalone SVG export, high-res PNG export, JSON import (F7, F18-F20) | M1, M2, M3 | PLANNED |
| M5 | Final E2E Test Pass & Adversarial Hardening | Phase 1: 100% pass of E2E test suite (Tiers 1-4); Phase 2: Adversarial hardening (Tier 5) | M1-M4, E2E | PLANNED |
| E2E | E2E Testing Track | Independent requirement-driven test suite (Tiers 1-4: 250+ tests), publish TEST_READY.md | none | DONE |

## Interface Contracts

### Canvas ↔ State Store
- `transform: { x: number, y: number, scale: number }`
- `panTo(x: number, y: number): void`
- `zoomAt(cursorX: number, cursorY: number, delta: number): void`
- `resetView(): void`
- `fitToScreen(): void`
- `gridVisible: boolean, toggleGrid(): void`

### Layer System ↔ Playback & Renderer
- `LayerId`: `'all' | 'hair' | 'iris' | 'clothes' | 'shadow_highlight' | 'line_art'`
- `layers: Record<LayerId, { visible: boolean }>`
- `soloLayer: LayerId | null`
- `toggleLayer(id: LayerId): void`
- `setSoloLayer(id: LayerId | null): void`
- `isLayerVisible(id: LayerId): boolean`
- `getLayerFilterStyle(id: LayerId): React.CSSProperties`

### Playback Engine ↔ Timeline
- `currentStep: number` (0 to `steps.length`)
- `totalSteps: number`
- `isPlaying: boolean`
- `speed: 0.5 | 1 | 2 | 4`
- `currentStage: StageMetadata`
- `play(): void`, `pause(): void`, `togglePlay(): void`
- `goToStep(step: number): void`
- `goToStage(stageId: string): void`
- `nextStep(): void`, `prevStep(): void`
- `setSpeed(speed: number): void`

### Diff & DOM Engine ↔ Code Inspector
- `getStepDiff(stepIndex: number): { addedLines: string[], removedLines: string[], patchXml: string }`
- `getFullSvgSource(stepIndex: number, layers: Record<LayerId, boolean>): string`
- `getDomTree(stepIndex: number): VirtualDomNode[]`
- `selectedNodeId: string | null`, `hoveredNodeId: string | null`
- `selectNode(id: string | null): void`, `hoverNode(id: string | null): void`

### Export/Import Engine ↔ Studio
- `exportSvg(filename?: string): void`
- `exportPng(scale: 1 | 2 | 4, filename?: string): Promise<void>`
- `importProjectJson(jsonString: string): { success: boolean, error?: string }`

## Code Layout
```
ai_vector_anime_studio/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   ├── studio.ts         # Types for layers, stages, steps, state
│   │   ├── anime.ts          # Anime character vector data schemas
│   │   └── diff.ts           # Code diff & DOM tree types
│   ├── data/
│   │   ├── purpleHairedGirl.ts # Built-in 43-step 5-stage anime dataset
│   │   └── defaultProject.ts   # Canonical project config
│   ├── engine/
│   │   ├── canvasMath.ts     # Pan/zoom/fit/grid coordinate math
│   │   ├── playbackEngine.ts # RAF playback loop and time accumulator
│   │   ├── diffEngine.ts     # Pre-indexed delta & Myers diff calculator
│   │   ├── xmlTokenizer.ts   # Pure TS syntax highlighter
│   │   ├── domExtractor.ts   # Virtual DOM tree generator
│   │   ├── svgExporter.ts    # Standalone SVG normalizer & download
│   │   ├── pngExporter.ts    # High-res Canvas rasterizer & download
│   │   └── importValidator.ts# JSON schema validation & hydration
│   ├── store/
│   │   └── studioContext.tsx # Central studio state management
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── StudioLayout.tsx
│   │   ├── canvas/
│   │   │   ├── VectorCanvas.tsx
│   │   │   ├── ReferenceGrid.tsx
│   │   │   └── CanvasControls.tsx
│   │   ├── timeline/
│   │   │   ├── TimelineConsole.tsx
│   │   │   ├── StageNavigation.tsx
│   │   │   ├── PlaybackControls.tsx
│   │   │   └── MicroStepList.tsx
│   │   ├── layers/
│   │   │   └── LayerFilterPanel.tsx
│   │   ├── inspector/
│   │   │   ├── InspectorTabs.tsx
│   │   │   ├── CodeDiffView.tsx
│   │   │   ├── FullSvgSourceView.tsx
│   │   │   └── DomTreeView.tsx
│   │   └── dialogs/
│   │       ├── ExportDialog.tsx
│   │       └── ImportDialog.tsx
├── tests/
│   ├── unit/
│   │   ├── canvasMath.test.ts
│   │   ├── playbackEngine.test.ts
│   │   ├── diffEngine.test.ts
│   │   └── importValidator.test.ts
│   └── e2e/
│       ├── testHarness.ts
│       ├── tier1_feature_coverage.test.ts
│       ├── tier2_boundary_corner.test.ts
│       ├── tier3_cross_feature.test.ts
│       └── tier4_real_world_scenarios.test.ts
└── .agents/teamwork/
```
