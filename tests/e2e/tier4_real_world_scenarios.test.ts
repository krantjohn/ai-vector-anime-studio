/**
 * Tier 4: Real-World Application Scenarios Test Suite
 *
 * Verifies 12 complete end-to-end user workflows defined in TEST_INFRA.md:
 * - Scenario 1: Full Drawing Process Playback
 * - Scenario 2: Iris Layer Fine-Tuning & Solo Focus
 * - Scenario 3: Fast Scrubbing & Instant Diff Sync
 * - Scenario 4: Standalone SVG Export & Verification
 * - Scenario 5: High-Res 4x PNG Export Integrity
 * - Scenario 6: Custom JSON Character Data Import
 * - Scenario 7: Malformed JSON Import Graceful Handling
 * - Scenario 8: Complex Zoom & Pan with Grid Alignment
 * - Scenario 9: 1-Click Code Copy to Clipboard
 * - Scenario 10: Cross-Stage Rapid Switching
 * - Scenario 11: Layer Visibility Multi-Toggle Stress Test
 * - Scenario 12: Playback Speed Dynamics (0.5x -> 4x -> Pause)
 */

import {
  describe,
  it,
  beforeEach,
  expect,
  StudioDriver,
  CanvasMathEngine,
  createDefaultAnimeProject,
} from './testHarness.ts';
import type { LayerId } from './testHarness.ts';

describe('Tier 4: Real-World Application Scenarios (12 Scenarios)', () => {
  let driver: StudioDriver;

  beforeEach(() => {
    driver = new StudioDriver();
  });

  // =========================================================================
  // Scenario 1: Full Drawing Process Playback
  // =========================================================================
  it('Scenario 1: Full Drawing Process Playback (F8, F9, F10, F11, F12, F13)', () => {
    // 1. User starts at finished artwork, sets speed to 2x, and starts playback
    expect(driver.getCurrentStep()).toBe(43);
    driver.setSpeed(2);
    driver.play();

    // Playback resets to step 0 when triggered at the end
    expect(driver.getCurrentStep()).toBe(0);
    expect(driver.getIsPlaying()).toBeTruthy();
    expect(driver.getStepDiff().patchXml).toBe('');

    // 2. Play through Stage 01 (Steps 1 to 7)
    driver.tick(7);
    expect(driver.getCurrentStep()).toBe(7);
    expect(driver.getCurrentStage().id).toBe('stage-1');
    expect(driver.getStepDiff().patchXml).toContain('sketch-lock-mark');

    // 3. Play through Stage 02, 03, 04, 05 (Steps 8 to 43)
    driver.tick(36);
    expect(driver.getCurrentStep()).toBe(43);
    expect(driver.getCurrentStage().id).toBe('stage-5');
    expect(driver.getStepDiff().patchXml).toContain('final-ambient-overlay');

    // 4. One more tick attempts to pass 43 -> stops playback
    driver.tick(1);
    expect(driver.getCurrentStep()).toBe(43);
    expect(driver.getIsPlaying()).toBeFalsy();
    expect(driver.getStepProgressFraction()).toBe('43/43 步');
  });

  // =========================================================================
  // Scenario 2: Iris Layer Fine-Tuning & Solo Focus
  // =========================================================================
  it('Scenario 2: Iris Layer Fine-Tuning & Solo Focus (F5, F6, F8, F9, F16, F17)', () => {
    // 1. User wants to inspect the golden iris detailing in Stage 04
    driver.goToStage('stage-4'); // Step 27
    expect(driver.getCurrentStep()).toBe(27);
    expect(driver.getCurrentStage().name).toBe('04虹膜笔触');

    // 2. Activate Solo Mode on Iris Layer
    driver.setSoloLayer('iris');
    expect(driver.getSoloLayer()).toBe('iris');

    // Verify iris is 100% opacity, all other layers are dimmed to 15% opacity + 85% grayscale
    expect(driver.getLayerFilterStyle('iris').opacity).toBe(1.0);
    expect(driver.getLayerFilterStyle('hair').opacity).toBe(0.15);
    expect(driver.getLayerFilterStyle('clothes').filter).toContain('grayscale(85%)');

    // 3. Step through micro-strokes in iris stage: pupil (28), golden crescent (29), sparkles (33)
    driver.goToStep(28);
    expect(driver.getStepDiff().patchXml).toContain('pupil-left');

    driver.goToStep(33);
    expect(driver.getStepDiff().patchXml).toContain('star-sparkle-l');

    // 4. Select the star sparkle node in the DOM tree
    driver.selectNode('star-sparkle-l');
    expect(driver.getSelectedNodeId()).toBe('star-sparkle-l');

    // 5. Untoggle Solo mode to return to full composition
    driver.setSoloLayer('iris'); // toggles off
    expect(driver.getSoloLayer()).toBeNull();
    expect(driver.getLayerFilterStyle('hair').opacity).toBe(1.0);
    expect(driver.getSelectedNodeId()).toBe('star-sparkle-l'); // selection preserved
  });

  // =========================================================================
  // Scenario 3: Fast Scrubbing & Instant Diff Sync
  // =========================================================================
  it('Scenario 3: Fast Scrubbing & Instant Diff Sync (F2, F9, F10, F13, F14)', () => {
    // Rapidly jump slider: 0 -> 25 -> 43 -> 10 -> 38
    driver.goToStep(0);
    expect(driver.getCurrentStep()).toBe(0);
    expect(driver.getStepDiff().patchXml).toBe('');
    expect(driver.getFullSvgSource()).not.toContain('sketch-head-circle');

    driver.goToStep(25);
    expect(driver.getCurrentStep()).toBe(25);
    expect(driver.getStepDiff().patchXml).toContain('mouth-smile');
    expect(driver.getFullSvgSource()).toContain('mouth-smile');

    driver.goToStep(43);
    expect(driver.getCurrentStep()).toBe(43);
    expect(driver.getStepDiff().patchXml).toContain('final-ambient-overlay');

    driver.goToStep(10);
    expect(driver.getCurrentStep()).toBe(10);
    expect(driver.getStepDiff().patchXml).toContain('uniform-sailor-collar');
    expect(driver.getFullSvgSource()).not.toContain('final-ambient-overlay');

    driver.goToStep(38);
    expect(driver.getCurrentStep()).toBe(38);
    expect(driver.getStepDiff().patchXml).toContain('hair-angel-ring');
  });

  // =========================================================================
  // Scenario 4: Standalone SVG Export & Verification
  // =========================================================================
  it('Scenario 4: Standalone SVG Export & Verification (F7, F9, F18)', () => {
    // 1. Move to final completed step (43)
    driver.goToStep(43);

    // 2. Perform standalone SVG export
    const { filename, content } = driver.exportStandaloneSvg();

    // 3. Verify filename and XML headers
    expect(filename).toContain('step43.svg');
    expect(content.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')).toBeTruthy();
    expect(content).toContain('<!DOCTYPE svg PUBLIC');
    expect(content).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(content).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');

    // 4. Verify coordinate attributes
    expect(content).toContain('viewBox="0 0 800 1000"');
    expect(content).toContain('width="800"');
    expect(content).toContain('height="1000"');

    // 5. Verify character visual features are present
    expect(content).toContain('sketch-head-circle'); // sketch layer
    expect(content).toContain('iris-base-left'); // iris layer
    expect(content).toContain('hair-angel-ring'); // hair highlight
    expect(content).toContain('uniform-sailor-collar'); // clothes
    expect(content.endsWith('</svg>')).toBeTruthy();
  });

  // =========================================================================
  // Scenario 5: High-Res 4x PNG Export Integrity
  // =========================================================================
  it('Scenario 5: High-Res 4x PNG Export Integrity (F7, F9, F19)', () => {
    driver.goToStep(43);

    // 1. Export standard 1x PNG
    const png1x = driver.exportPng(1);
    expect(png1x.width).toBe(800);
    expect(png1x.height).toBe(1000);
    expect(png1x.filename).toBe('anime_character_1x_step43.png');

    // 2. Export 2x Retina PNG
    const png2x = driver.exportPng(2);
    expect(png2x.width).toBe(1600);
    expect(png2x.height).toBe(2000);
    expect(png2x.filename).toBe('anime_character_2x_step43.png');

    // 3. Export 4x Ultra-HD PNG
    const png4x = driver.exportPng(4);
    expect(png4x.width).toBe(3200);
    expect(png4x.height).toBe(4000);
    expect(png4x.filename).toBe('anime_character_4x_step43.png');
  });

  // =========================================================================
  // Scenario 6: Custom JSON Character Data Import
  // =========================================================================
  it('Scenario 6: Custom JSON Character Data Import (F7, F9, F10, F11, F20)', () => {
    const customProjectJson = JSON.stringify({
      title: 'Neon Valkyrie (新机甲女武神)',
      version: '1.2.0',
      viewBox: '0 0 1000 1250',
      canvasWidth: 1000,
      canvasHeight: 1250,
      stages: [
        { id: 'custom-stage-1', name: '01机甲线框', description: '线框草稿', startStep: 1, endStep: 2 },
        { id: 'custom-stage-2', name: '02等离子光刃', description: '武器涂装', startStep: 3, endStep: 3 },
      ],
      steps: [
        {
          id: 1,
          stageId: 'custom-stage-1',
          layerId: 'line_art',
          title: '面甲外壳轮廓',
          description: '流线型头盔线框',
          xmlPatch: '<polygon id="mecha-helm" points="500,200 400,350 600,350" stroke="#00FFFF" fill="none" />',
          addedLines: ['+ <polygon id="mecha-helm" />'],
          removedLines: [],
          elementId: 'mecha-helm',
        },
        {
          id: 2,
          stageId: 'custom-stage-1',
          layerId: 'iris',
          title: '电子眼传感器',
          description: '青绿激光扫描眼',
          xmlPatch: '<circle id="cyber-eye" cx="500" cy="300" r="15" fill="#10B981" />',
          addedLines: ['+ <circle id="cyber-eye" />'],
          removedLines: [],
          elementId: 'cyber-eye',
        },
        {
          id: 3,
          stageId: 'custom-stage-2',
          layerId: 'shadow_highlight',
          title: '等离子光晕',
          description: '高能粒子散溢光辉',
          xmlPatch: '<ellipse id="plasma-glow" cx="500" cy="300" rx="40" ry="25" fill="#34D399" opacity="0.5" />',
          addedLines: ['+ <ellipse id="plasma-glow" />'],
          removedLines: [],
          elementId: 'plasma-glow',
        },
      ],
    });

    // 1. Import new dataset
    const result = driver.importProject(customProjectJson);
    expect(result.success).toBeTruthy();

    // 2. Timeline rehydrates to new total steps (3) and starts at step 3
    expect(driver.getProject().title).toContain('Neon Valkyrie');
    expect(driver.getTotalSteps()).toBe(3);
    expect(driver.getCurrentStep()).toBe(3);
    expect(driver.getStepProgressFraction()).toBe('3/3 步');

    // 3. Verify newly rendered SVG contains imported elements
    const svg = driver.getFullSvgSource();
    expect(svg).toContain('viewBox="0 0 1000 1250"');
    expect(svg).toContain('mecha-helm');
    expect(svg).toContain('cyber-eye');
    expect(svg).toContain('plasma-glow');

    // 4. Scrubbing custom timeline works accurately
    driver.goToStep(1);
    expect(driver.getStepDiff().patchXml).toContain('mecha-helm');
  });

  // =========================================================================
  // Scenario 7: Malformed JSON Import Graceful Handling
  // =========================================================================
  it('Scenario 7: Malformed JSON Import Graceful Handling (F20)', () => {
    // 1. Record state before import
    const titleBefore = driver.getProject().title;
    const totalStepsBefore = driver.getTotalSteps();

    // 2. Attempt corrupted JSON syntax
    const corrupted = '{ title: "Unquoted Keys", steps: [ { id: 1 } ';
    const res1 = driver.importProject(corrupted);
    expect(res1.success).toBeFalsy();
    expect(res1.error).toContain('解析失败');
    expect(driver.getToastMessage()).toContain('导入失败');

    // 3. Attempt schema missing steps array
    const missingSteps = JSON.stringify({
      title: 'No Steps Project',
      stages: [{ id: 's1', name: 's1', description: '', startStep: 1, endStep: 1 }],
    });
    const res2 = driver.importProject(missingSteps);
    expect(res2.success).toBeFalsy();
    expect(res2.error).toContain('steps');

    // 4. Attempt step missing xmlPatch
    const invalidStep = JSON.stringify({
      title: 'Invalid Step Project',
      stages: [{ id: 's1', name: 's1', description: '', startStep: 1, endStep: 1 }],
      steps: [{ id: 1, layerId: 'line_art' }],
    });
    const res3 = driver.importProject(invalidStep);
    expect(res3.success).toBeFalsy();
    expect(res3.error).toContain('xmlPatch');

    // 5. Existing studio data and timeline remain fully functional and uncorrupted
    expect(driver.getProject().title).toBe(titleBefore);
    expect(driver.getTotalSteps()).toBe(totalStepsBefore);
  });

  // =========================================================================
  // Scenario 8: Complex Zoom & Pan with Grid Alignment
  // =========================================================================
  it('Scenario 8: Complex Zoom & Pan with Grid Alignment (F1, F2, F3, F4)', () => {
    // 1. User toggles 4x6 reference grid
    driver.toggleGrid();
    expect(driver.isGridVisible()).toBeTruthy();

    // 2. User zooms into iris region around (400, 395)
    driver.zoomAt(400, 395, -1500);
    const zoomTransform = driver.getTransform();
    expect(zoomTransform.scale).toBeGreaterThan(2.0);

    // 3. User pans canvas slightly to the left
    driver.panBy(-80, 40);
    expect(driver.getTransform().x).toBe(zoomTransform.x - 80);
    expect(driver.getTransform().y).toBe(zoomTransform.y + 40);

    // 4. 4x6 grid lines remain perfectly anchored to coordinate space
    const grid = CanvasMathEngine.get4x6GridLines(800, 1000);
    expect(grid.verticalLines[1]).toBe(400); // Central axis

    // 5. User clicks "Reset View / Fit Screen"
    driver.resetView();
    expect(driver.getTransform()).toEqual({ x: 0, y: 0, scale: 1.0 });
    expect(driver.isGridVisible()).toBeTruthy(); // Grid toggle preserved
  });

  // =========================================================================
  // Scenario 9: 1-Click Code Copy to Clipboard
  // =========================================================================
  it('Scenario 9: 1-Click Code Copy to Clipboard (F14, F15)', () => {
    driver.goToStep(43);

    // 1. Copy full SVG source
    driver.setActiveInspectorTab('source');
    const copySvgSuccess = driver.copyCurrentSvgSource();
    expect(copySvgSuccess).toBeTruthy();
    expect(driver.getClipboardContent()).toContain('<?xml');
    expect(driver.getClipboardContent()).toContain('viewBox="0 0 800 1000"');
    expect(driver.getToastMessage()).toContain('SVG 源码已复制');

    // 2. Switch to Diff tab and copy current step diff patch
    driver.setActiveInspectorTab('diff');
    driver.goToStep(20); // hair ahoge
    const copyDiffSuccess = driver.copyCurrentStepDiff();
    expect(copyDiffSuccess).toBeTruthy();
    expect(driver.getClipboardContent()).toContain('hair-ahoge');
    expect(driver.getToastMessage()).toContain('步骤代码已复制');

    // 3. Clear toast
    driver.clearToast();
    expect(driver.getToastMessage()).toBeNull();
  });

  // =========================================================================
  // Scenario 10: Cross-Stage Rapid Switching
  // =========================================================================
  it('Scenario 10: Cross-Stage Rapid Switching (F8, F9, F10, F13)', () => {
    // Rapidly navigate between stages: 01 -> 03 -> 05 -> 02 -> 04
    driver.goToStage('stage-1');
    expect(driver.getCurrentStep()).toBe(1);
    expect(driver.getCurrentStage().name).toBe('01初版草图');
    expect(driver.getStepDiff().patchXml).toContain('sketch-head-circle');

    driver.goToStage('stage-3');
    expect(driver.getCurrentStep()).toBe(17);
    expect(driver.getCurrentStage().name).toBe('03对比修正');
    expect(driver.getStepDiff().patchXml).toContain('neck-drop-shadow');

    driver.goToStage('stage-5');
    expect(driver.getCurrentStep()).toBe(36);
    expect(driver.getCurrentStage().name).toBe('05增光润部');
    expect(driver.getStepDiff().patchXml).toContain('blush-soft-left');

    driver.goToStage('stage-2');
    expect(driver.getCurrentStep()).toBe(8);
    expect(driver.getCurrentStage().name).toBe('02局部细化');
    expect(driver.getStepDiff().patchXml).toContain('base-skin-mesh');

    driver.goToStage('stage-4');
    expect(driver.getCurrentStep()).toBe(27);
    expect(driver.getCurrentStage().name).toBe('04虹膜笔触');
    expect(driver.getStepDiff().patchXml).toContain('iris-base-left');
  });

  // =========================================================================
  // Scenario 11: Layer Visibility Multi-Toggle Stress Test
  // =========================================================================
  it('Scenario 11: Layer Visibility Multi-Toggle Stress Test (F1, F5, F6)', () => {
    const layers: LayerId[] = ['hair', 'iris', 'clothes', 'shadow_highlight', 'line_art'];

    // 1. Sequentially turn off all layers
    for (const l of layers) {
      driver.setLayerVisibility(l, false);
      expect(driver.isLayerVisible(l)).toBeFalsy();
    }

    // Canvas SVG now has no layer elements
    const emptySvg = driver.getFullSvgSource();
    for (const l of layers) {
      expect(emptySvg).not.toContain(`<g id="layer-${l}"`);
    }

    // 2. Sequentially turn all layers back on
    for (const l of layers) {
      driver.setLayerVisibility(l, true);
      expect(driver.isLayerVisible(l)).toBeTruthy();
    }

    // Full SVG restores all layer groups
    const fullSvg = driver.getFullSvgSource();
    for (const l of layers) {
      expect(fullSvg).toContain(`<g id="layer-${l}"`);
    }

    // 3. Toggle master "all" off then on
    driver.toggleLayer('all');
    expect(driver.isLayerVisible('hair')).toBeFalsy();
    driver.toggleLayer('all');
    expect(driver.isLayerVisible('hair')).toBeTruthy();
  });

  // =========================================================================
  // Scenario 12: Playback Speed Dynamics (0.5x -> 4x -> Pause)
  // =========================================================================
  it('Scenario 12: Playback Speed Dynamics (0.5x -> 4x -> Pause) (F11, F12)', () => {
    // 1. Start playback in slow motion (0.5x)
    driver.goToStep(10);
    driver.setSpeed(0.5);
    driver.play();
    expect(driver.getSpeed()).toBe(0.5);
    expect(driver.getIsPlaying()).toBeTruthy();

    // Advance 2 steps in 0.5x
    driver.tick(2);
    expect(driver.getCurrentStep()).toBe(12);

    // 2. Shift dynamically to ultra speed (4x)
    driver.setSpeed(4);
    expect(driver.getSpeed()).toBe(4);
    expect(driver.getIsPlaying()).toBeTruthy();

    // Advance 8 steps rapidly in 4x
    driver.tick(8);
    expect(driver.getCurrentStep()).toBe(20);

    // 3. Pause playback at step 20
    driver.pause();
    expect(driver.getIsPlaying()).toBeFalsy();
    expect(driver.getCurrentStep()).toBe(20);
    expect(driver.getStepProgressFraction()).toBe('20/43 步');

    // 4. Resume playback at normal speed (1x)
    driver.setSpeed(1);
    driver.play();
    driver.tick(3);
    expect(driver.getCurrentStep()).toBe(23);
    expect(driver.getIsPlaying()).toBeTruthy();
  });
});
