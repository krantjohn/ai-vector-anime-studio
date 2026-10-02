/**
 * Tier 3: Cross-Feature Interactions Test Suite (Pairwise Combinations)
 *
 * Verifies complex interactions between subsystems:
 * Canvas Math ↔ Timeline ↔ Playback ↔ Layers ↔ Diff Engine ↔ Inspector ↔ Export/Import.
 * >= 25 pairwise combination tests.
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

describe('Tier 3: Pairwise Cross-Feature Interactions', () => {
  let driver: StudioDriver;

  beforeEach(() => {
    driver = new StudioDriver();
  });

  // 1. F1 (Canvas) × F2 (Pan & Zoom)
  it('Pair 1 [F1 × F2]: Canvas viewBox coordinate stability while zooming and panning', () => {
    expect(driver.getProject().viewBox).toBe('0 0 800 1000');
    driver.panBy(200, 300);
    driver.zoomAt(400, 500, -250);
    // Pan and zoom change container transform matrix, but underlying SVG viewBox remains constant
    expect(driver.getProject().viewBox).toBe('0 0 800 1000');
    expect(driver.getFullSvgSource()).toContain('viewBox="0 0 800 1000"');
  });

  // 2. F2 (Pan & Zoom) × F3 (Reset View)
  it('Pair 2 [F2 × F3]: Zooming 5x and panning 300px then resetView returns cleanly to origin', () => {
    driver.zoomAt(400, 500, -2000);
    driver.panBy(300, -150);
    expect(driver.getTransform().scale).toBeGreaterThan(3.0);

    driver.resetView();
    expect(driver.getTransform()).toEqual({ x: 0, y: 0, scale: 1.0 });
  });

  // 3. F2 (Pan & Zoom) × F4 (4x6 Grid)
  it('Pair 3 [F2 × F4]: Grid subdivision coordinates maintain proportion when zoom is active', () => {
    driver.toggleGrid();
    expect(driver.isGridVisible()).toBeTruthy();

    driver.zoomAt(400, 500, -500);
    const grid = CanvasMathEngine.get4x6GridLines(800, 1000);
    expect(grid.verticalLines).toEqual([200, 400, 600]);
    expect(grid.horizontalLines).toHaveLength(5);
  });

  // 4. F2 (Pan & Zoom) × F11 (Playback)
  it('Pair 4 [F2 × F11]: Pan and zoom gestures do not disrupt active playback loop', () => {
    driver.goToStep(5);
    driver.play();
    expect(driver.getIsPlaying()).toBeTruthy();

    // User pans and zooms while animation is running
    driver.panBy(40, -60);
    driver.zoomAt(300, 400, -100);
    driver.tick(3);

    expect(driver.getIsPlaying()).toBeTruthy();
    expect(driver.getCurrentStep()).toBe(8);
    expect(driver.getTransform().x).not.toBe(0);
  });

  // 5. F3 (Fit Screen) × F21 (Responsive Studio UI)
  it('Pair 5 [F3 × F21]: Resizing viewport container calculates centered fit-to-screen transform', () => {
    driver.fitToScreen(1600, 900, 24);
    const t = driver.getTransform();
    // 900 height constrained: (900 - 48) / 1000 = 0.852
    expect(t.scale).toBeCloseTo(0.852, 2);
    expect(t.x).toBeGreaterThan(0);
    expect(t.y).toBe(24);
  });

  // 6. F4 (4x6 Grid) × F5 (Layer Visibility)
  it('Pair 6 [F4 × F5]: Toggling grid does not mutate or shift layer group hierarchy in SVG', () => {
    driver.setLayerVisibility('clothes', false);
    driver.toggleGrid();
    const svg1 = driver.getFullSvgSource();

    driver.toggleGrid();
    const svg2 = driver.getFullSvgSource();

    expect(svg1).toBe(svg2);
    expect(svg1).not.toContain('<g id="layer-clothes"');
  });

  // 7. F5 (Layer Visibility) × F6 (Solo Mode)
  it('Pair 7 [F5 × F6]: Hidden layer stays hidden when solo mode is activated and deactivated', () => {
    driver.setLayerVisibility('clothes', false);
    expect(driver.isLayerVisible('clothes')).toBeFalsy();

    driver.setSoloLayer('hair');
    expect(driver.getLayerFilterStyle('clothes').opacity).toBe(0);

    driver.setSoloLayer(null);
    expect(driver.isLayerVisible('clothes')).toBeFalsy();
    expect(driver.getLayerFilterStyle('clothes').opacity).toBe(0);
  });

  // 8. F5 (Layer Visibility) × F14 (Full SVG Source)
  it('Pair 8 [F5 × F14]: Disabling layer dynamically strips layer group from SVG source view', () => {
    driver.goToStep(43);
    expect(driver.getFullSvgSource()).toContain('<g id="layer-hair"');

    driver.setLayerVisibility('hair', false);
    expect(driver.getFullSvgSource()).not.toContain('<g id="layer-hair"');

    driver.setLayerVisibility('hair', true);
    expect(driver.getFullSvgSource()).toContain('<g id="layer-hair"');
  });

  // 9. F5 (Layer Visibility) × F16 (DOM Tree)
  it('Pair 9 [F5 × F16]: Layer toggling does not corrupt virtual DOM tree step provenance', () => {
    driver.goToStep(43);
    driver.setLayerVisibility('shadow_highlight', false);

    const tree = driver.getDomTree();
    const hairGroup = tree.find((g) => g.id === 'group-hair');
    expect(hairGroup).toBeDefined();
    for (const child of hairGroup?.children || []) {
      expect(child.step).toBeGreaterThan(0);
    }
  });

  // 10. F5 (Layer Visibility) × F18 (SVG Export)
  it('Pair 10 [F5 × F18]: Standalone SVG export reflects exact current layer visibility state', () => {
    driver.setLayerVisibility('iris', false);
    const exp = driver.exportStandaloneSvg();
    expect(exp.content).not.toContain('<g id="layer-iris"');
    expect(exp.content).toContain('<g id="layer-clothes"');
  });

  // 11. F6 (Solo Mode) × F8 (5-Stage Evolution)
  it('Pair 11 [F6 × F8]: Solo mode persists across stage jump navigation', () => {
    driver.setSoloLayer('iris');
    driver.goToStage('stage-4'); // Iris stage
    expect(driver.getSoloLayer()).toBe('iris');
    expect(driver.getCurrentStage().id).toBe('stage-4');

    driver.goToStage('stage-1'); // Sketch stage
    expect(driver.getSoloLayer()).toBe('iris');
  });

  // 12. F6 (Solo Mode) × F17 (Canvas-DOM Sync)
  it('Pair 12 [F6 × F17]: Solo mode and node selection co-exist harmoniously', () => {
    driver.setSoloLayer('hair');
    driver.selectNode('hair-ahoge');

    expect(driver.getSoloLayer()).toBe('hair');
    expect(driver.getSelectedNodeId()).toBe('hair-ahoge');
    expect(driver.getLayerFilterStyle('hair').opacity).toBe(1.0);
    expect(driver.getLayerFilterStyle('iris').opacity).toBe(0.15);
  });

  // 13. F7 (Anime Character Data) × F9 (43 Micro-Steps)
  it('Pair 13 [F7 × F9]: All 43 micro-steps in built-in dataset map to existing stages', () => {
    const project = driver.getProject();
    const stageIds = new Set(project.stages.map((s) => s.id));
    for (const step of project.steps) {
      expect(stageIds.has(step.stageId)).toBeTruthy();
    }
  });

  // 14. F8 (5-Stage Evolution) × F10 (Timeline Controller)
  it('Pair 14 [F8 × F10]: Stage navigation updates timeline step and fraction display', () => {
    driver.goToStage('stage-2');
    expect(driver.getCurrentStep()).toBe(8);
    expect(driver.getStepProgressFraction()).toBe('8/43 步');

    driver.goToStage('stage-5');
    expect(driver.getCurrentStep()).toBe(36);
    expect(driver.getStepProgressFraction()).toBe('36/43 步');
  });

  // 15. F8 (5-Stage Evolution) × F13 (Real-Time Diff)
  it('Pair 15 [F8 × F13]: Stage jump immediately updates diff view to stage initial step', () => {
    driver.goToStage('stage-4'); // Step 27: iris-base-left
    const diff = driver.getStepDiff();
    expect(diff.patchXml).toContain('iris-base-left');
  });

  // 16. F9 (43 Micro-Steps) × F14 (Full SVG Source)
  it('Pair 16 [F9 × F14]: Scrubbing from step 1 to 43 shows monotonic growth in SVG content', () => {
    driver.goToStep(5);
    const len5 = driver.getFullSvgSource().length;

    driver.goToStep(20);
    const len20 = driver.getFullSvgSource().length;

    driver.goToStep(43);
    const len43 = driver.getFullSvgSource().length;

    expect(len20).toBeGreaterThan(len5);
    expect(len43).toBeGreaterThan(len20);
  });

  // 17. F10 (Timeline Controller) × F11 (Playback State Machine)
  it('Pair 17 [F10 × F11]: Discrete step jump while playing updates playback frame cleanly', () => {
    driver.play();
    driver.goToStep(25);
    expect(driver.getCurrentStep()).toBe(25);
    expect(driver.getIsPlaying()).toBeTruthy();

    driver.tick(1);
    expect(driver.getCurrentStep()).toBe(26);
  });

  // 18. F10 (Timeline Controller) × F16 (DOM Tree)
  it('Pair 18 [F10 × F16]: Scrubbing to step 18 renders exactly 18 nodes in virtual DOM', () => {
    driver.goToStep(18);
    const tree = driver.getDomTree();
    const count = tree.reduce((acc, g) => acc + (g.children?.length || 0), 0);
    expect(count).toBe(18);
  });

  // 19. F11 (Playback State Machine) × F12 (Speed Switcher)
  it('Pair 19 [F11 × F12]: Changing speed during playback preserves playback state and stops at 43', () => {
    driver.goToStep(40);
    driver.play();
    driver.setSpeed(4);

    driver.tick(3); // reaches 43
    expect(driver.getCurrentStep()).toBe(43);
    driver.tick(1); // tries to advance past 43 in non-loop mode -> stops
    expect(driver.getCurrentStep()).toBe(43);
    expect(driver.getIsPlaying()).toBeFalsy();
  });

  // 20. F11 (Playback State Machine) × F13 (Real-Time Diff)
  it('Pair 20 [F11 × F13]: Playback tick progression updates diff view at every frame', () => {
    driver.goToStep(19);
    driver.play();

    driver.tick(1); // step 20: hair-ahoge
    expect(driver.getStepDiff().patchXml).toContain('hair-ahoge');

    driver.tick(1); // step 21: eyelashes-upper-left
    expect(driver.getStepDiff().patchXml).toContain('eyelashes-upper-left');
  });

  // 21. F13 (Real-Time Diff) × F15 (1-Click Code Copy)
  it('Pair 21 [F13 × F15]: Copying diff during step inspection captures exact patchXml', () => {
    driver.goToStep(33); // star sparkle
    driver.copyCurrentStepDiff();
    expect(driver.getClipboardContent()).toContain('star-sparkle-l');
    expect(driver.getToastMessage()).toContain('已复制');
  });

  // 22. F14 (Full SVG Source) × F15 (1-Click Code Copy)
  it('Pair 22 [F14 × F15]: Copying SVG source captures exact full SVG document', () => {
    driver.goToStep(43);
    driver.copyCurrentSvgSource();
    expect(driver.getClipboardContent()).toBe(driver.getFullSvgSource());
  });

  // 23. F16 (DOM Tree) × F17 (Canvas-DOM Sync)
  it('Pair 23 [F16 × F17]: Node selected from DOM tree is tracked and can be deselected', () => {
    driver.goToStep(25);
    const tree = driver.getDomTree();
    const lineArt = tree.find((g) => g.id === 'group-line_art');
    const firstNode = lineArt?.children?.[0];
    expect(firstNode).toBeDefined();

    driver.selectNode(firstNode!.id);
    expect(driver.getSelectedNodeId()).toBe(firstNode!.id);

    driver.selectNode(null);
    expect(driver.getSelectedNodeId()).toBeNull();
  });

  // 24. F18 (SVG Export) × F19 (PNG Export)
  it('Pair 24 [F18 × F19]: Consecutive SVG and PNG export at step 30 share consistent step index', () => {
    driver.goToStep(30);
    const svgExp = driver.exportStandaloneSvg();
    const pngExp = driver.exportPng(2);

    expect(svgExp.filename).toContain('step30.svg');
    expect(pngExp.filename).toContain('step30.png');
    expect(pngExp.width).toBe(1600);
  });

  // 25. F20 (Custom JSON Import) × F5 (Layer Visibility)
  it('Pair 25 [F20 × F5]: Importing custom project preserves master layer visibility config', () => {
    driver.setLayerVisibility('clothes', false);
    const customProject = {
      title: 'Imported Hero',
      stages: [{ id: 's1', name: 'S1', description: '', startStep: 1, endStep: 1 }],
      steps: [{ id: 1, stageId: 's1', layerId: 'line_art', title: 'Line', description: '', xmlPatch: '<path />' }],
    };
    driver.importProject(JSON.stringify(customProject));
    expect(driver.isLayerVisible('line_art')).toBeTruthy();
  });

  // 26. F20 (Custom JSON Import) × F11 (Playback State Machine)
  it('Pair 26 [F20 × F11]: Importing project halts any ongoing playback from previous project', () => {
    driver.goToStep(10);
    driver.play();
    expect(driver.getIsPlaying()).toBeTruthy();

    const customProject = {
      title: 'Import While Playing',
      stages: [{ id: 's1', name: 'S1', description: '', startStep: 1, endStep: 1 }],
      steps: [{ id: 1, stageId: 's1', layerId: 'hair', title: 'Hair', description: '', xmlPatch: '<circle />' }],
    };
    driver.importProject(JSON.stringify(customProject));
    expect(driver.getIsPlaying()).toBeFalsy();
    expect(driver.getCurrentStep()).toBe(1);
  });

  // 27. F21 (Responsive Studio UI) × Inspector Tabs
  it('Pair 27 [F21 × Inspector]: Switching tabs between Diff, Source, and DOM preserves timeline state', () => {
    driver.goToStep(35);
    driver.setActiveInspectorTab('diff');
    expect(driver.getCurrentStep()).toBe(35);

    driver.setActiveInspectorTab('dom');
    expect(driver.getCurrentStep()).toBe(35);

    driver.setActiveInspectorTab('source');
    expect(driver.getCurrentStep()).toBe(35);
  });
});
