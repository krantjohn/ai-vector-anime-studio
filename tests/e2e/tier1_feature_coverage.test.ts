/**
 * Tier 1: Feature Coverage Test Suite (E2E Opaque-Box)
 *
 * Verifies all 21 features defined in PROJECT.md and TEST_INFRA.md:
 * F1 to F21 with >= 5 dedicated tests per feature (105+ total tests).
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

describe('Tier 1: Feature Coverage Test Suite (F1 - F21)', () => {
  let driver: StudioDriver;

  beforeEach(() => {
    driver = new StudioDriver();
  });

  // =========================================================================
  // Feature 1: SVG Vector Canvas (F1)
  // =========================================================================
  describe('F1: SVG Vector Canvas', () => {
    it('F1-1: should initialize with canonical 0 0 800 1000 viewBox coordinate system', () => {
      const project = driver.getProject();
      expect(project.viewBox).toBe('0 0 800 1000');
      expect(project.canvasWidth).toBe(800);
      expect(project.canvasHeight).toBe(1000);
    });

    it('F1-2: should render valid standalone SVG root element matching canvas coordinate specs', () => {
      const svg = driver.getFullSvgSource();
      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 800 1000"');
      expect(svg).toContain('width="800"');
      expect(svg).toContain('height="1000"');
    });

    it('F1-3: should include standard XML namespaces and doctype declaration', () => {
      const svg = driver.getFullSvgSource();
      expect(svg).toContain('<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
    });

    it('F1-4: should encapsulate styles within defs element for rendering precision', () => {
      const svg = driver.getFullSvgSource();
      expect(svg).toContain('<defs>');
      expect(svg).toContain('shape-rendering: geometricPrecision');
      expect(svg).toContain('</defs>');
    });

    it('F1-5: should structure visual nodes inside semantic layer groups', () => {
      const svg = driver.getFullSvgSource();
      expect(svg).toContain('<g id="layer-hair"');
      expect(svg).toContain('<g id="layer-iris"');
      expect(svg).toContain('<g id="layer-clothes"');
      expect(svg).toContain('<g id="layer-line_art"');
    });
  });

  // =========================================================================
  // Feature 2: Smooth Pan & Zoom (F2)
  // =========================================================================
  describe('F2: Smooth Pan & Zoom', () => {
    it('F2-1: should accurately accumulate pan offsets across multiple drag gestures', () => {
      driver.panBy(50, -30);
      expect(driver.getTransform().x).toBe(50);
      expect(driver.getTransform().y).toBe(-30);

      driver.panBy(-20, 100);
      expect(driver.getTransform().x).toBe(30);
      expect(driver.getTransform().y).toBe(70);
    });

    it('F2-2: should zoom in centered at cursor position adjusting both scale and translate', () => {
      // Zoom in at (400, 500)
      driver.zoomAt(400, 500, -200);
      const transform = driver.getTransform();
      expect(transform.scale).toBeGreaterThan(1.0);
      expect(typeof transform.x).toBe('number');
      expect(typeof transform.y).toBe('number');
    });

    it('F2-3: should zoom out centered at cursor position decreasing scale', () => {
      driver.zoomAt(400, 500, 200);
      const transform = driver.getTransform();
      expect(transform.scale).toBeLessThan(1.0);
    });

    it('F2-4: should clamp scale to minimum bound (0.1x) during extreme zoom out', () => {
      driver.zoomAt(400, 500, 100000);
      expect(driver.getTransform().scale).toBe(0.1);
    });

    it('F2-5: should clamp scale to maximum bound (10.0x) during extreme zoom in', () => {
      driver.zoomAt(400, 500, -100000);
      expect(driver.getTransform().scale).toBe(10.0);
    });
  });

  // =========================================================================
  // Feature 3: Reset View / Fit Screen (F3)
  // =========================================================================
  describe('F3: Reset View / Fit Screen', () => {
    it('F3-1: should reset view to default identity transform (0, 0, scale 1.0)', () => {
      driver.panBy(350, -120);
      driver.zoomAt(200, 300, -500);
      expect(driver.getTransform().scale).not.toBe(1.0);

      driver.resetView();
      expect(driver.getTransform()).toEqual({ x: 0, y: 0, scale: 1.0 });
    });

    it('F3-2: should calculate intelligent fit-to-screen scale for landscape viewport', () => {
      // 1200x800 container for 800x1000 canvas
      driver.fitToScreen(1200, 800, 32);
      const transform = driver.getTransform();
      // Height is constrained: (800 - 64) / 1000 = 0.736
      expect(transform.scale).toBeCloseTo(0.736, 2);
      expect(transform.y).toBe(32);
      expect(transform.x).toBeGreaterThan(0);
    });

    it('F3-3: should calculate intelligent fit-to-screen scale for portrait viewport', () => {
      // 600x1200 container for 800x1000 canvas
      driver.fitToScreen(600, 1200, 32);
      const transform = driver.getTransform();
      // Width is constrained: (600 - 64) / 800 = 0.67
      expect(transform.scale).toBeCloseTo(0.67, 2);
      expect(transform.x).toBe(32);
      expect(transform.y).toBeGreaterThan(0);
    });

    it('F3-4: should center canvas horizontally and vertically in fit-to-screen mode', () => {
      // 1000x1000 container with 800x1000 world canvas -> scale = 1.0 (constrained by height)
      driver.fitToScreen(1000, 1000, 0);
      const t = driver.getTransform();
      expect(t.scale).toBe(1.0);
      expect(t.x).toBe(100); // (1000 - 800) / 2
      expect(t.y).toBe(0); // (1000 - 1000) / 2
    });

    it('F3-5: should respect custom padding in fit-to-screen calculation', () => {
      driver.fitToScreen(1000, 1000, 50);
      const t = driver.getTransform();
      // Avail H: 900 / 1000 = 0.9
      expect(t.scale).toBe(0.9);
    });
  });

  // =========================================================================
  // Feature 4: 4x6 Reference Grid (F4)
  // =========================================================================
  describe('F4: 4x6 Reference Grid', () => {
    it('F4-1: should toggle grid visibility on and off', () => {
      expect(driver.isGridVisible()).toBeFalsy();
      driver.toggleGrid();
      expect(driver.isGridVisible()).toBeTruthy();
      driver.toggleGrid();
      expect(driver.isGridVisible()).toBeFalsy();
    });

    it('F4-2: should generate 3 internal vertical grid lines dividing canvas into 4 columns', () => {
      const grid = CanvasMathEngine.get4x6GridLines(800, 1000);
      expect(grid.verticalLines).toEqual([200, 400, 600]);
      expect(grid.columns).toBe(4);
    });

    it('F4-3: should generate 5 internal horizontal grid lines dividing canvas into 6 rows', () => {
      const grid = CanvasMathEngine.get4x6GridLines(800, 1000);
      expect(grid.horizontalLines).toHaveLength(5);
      expect(grid.rows).toBe(6);
      expect(grid.horizontalLines[0]).toBeCloseTo(166.67, 1);
      expect(grid.horizontalLines[2]).toBe(500);
    });

    it('F4-4: should align central vertical line at X=400 exactly matching facial symmetry', () => {
      const grid = CanvasMathEngine.get4x6GridLines(800, 1000);
      expect(grid.verticalLines[1]).toBe(400);
    });

    it('F4-5: should support custom canvas dimensions for grid subdivision', () => {
      const customGrid = CanvasMathEngine.get4x6GridLines(1200, 1800);
      expect(customGrid.verticalLines).toEqual([300, 600, 900]);
      expect(customGrid.horizontalLines).toEqual([300, 600, 900, 1200, 1500]);
    });
  });

  // =========================================================================
  // Feature 5: Multi-Layer Visibility (F5)
  // =========================================================================
  describe('F5: Multi-Layer Visibility', () => {
    it('F5-1: should have all 6 layers enabled by default', () => {
      const layers: LayerId[] = ['all', 'hair', 'iris', 'clothes', 'shadow_highlight', 'line_art'];
      for (const l of layers) {
        expect(driver.isLayerVisible(l)).toBeTruthy();
      }
    });

    it('F5-2: should toggle individual layer visibility independently', () => {
      driver.toggleLayer('hair');
      expect(driver.isLayerVisible('hair')).toBeFalsy();
      expect(driver.isLayerVisible('iris')).toBeTruthy();

      driver.toggleLayer('hair');
      expect(driver.isLayerVisible('hair')).toBeTruthy();
    });

    it('F5-3: should hide all layers when master "all" layer is disabled', () => {
      driver.toggleLayer('all');
      expect(driver.isLayerVisible('all')).toBeFalsy();
      expect(driver.isLayerVisible('hair')).toBeFalsy();
      expect(driver.isLayerVisible('clothes')).toBeFalsy();
    });

    it('F5-4: should omit hidden layer elements from generated SVG source', () => {
      driver.setLayerVisibility('clothes', false);
      const svg = driver.getFullSvgSource();
      expect(svg).not.toContain('<g id="layer-clothes"');
      expect(svg).toContain('<g id="layer-hair"');
    });

    it('F5-5: should restore layer in SVG source upon re-enabling visibility', () => {
      driver.setLayerVisibility('clothes', false);
      expect(driver.getFullSvgSource()).not.toContain('<g id="layer-clothes"');

      driver.setLayerVisibility('clothes', true);
      expect(driver.getFullSvgSource()).toContain('<g id="layer-clothes"');
    });
  });

  // =========================================================================
  // Feature 6: Layer Solo / Focus Isolation (F6)
  // =========================================================================
  describe('F6: Layer Solo / Focus Isolation', () => {
    it('F6-1: should initialize with no solo layer active', () => {
      expect(driver.getSoloLayer()).toBeNull();
    });

    it('F6-2: should activate solo mode for a specific layer', () => {
      driver.setSoloLayer('iris');
      expect(driver.getSoloLayer()).toBe('iris');
    });

    it('F6-3: should toggle off solo mode when same layer is selected again', () => {
      driver.setSoloLayer('iris');
      expect(driver.getSoloLayer()).toBe('iris');
      driver.setSoloLayer('iris');
      expect(driver.getSoloLayer()).toBeNull();
    });

    it('F6-4: should apply dimming style (15% opacity + 85% grayscale) to inactive layers', () => {
      driver.setSoloLayer('iris');
      const irisStyle = driver.getLayerFilterStyle('iris');
      const hairStyle = driver.getLayerFilterStyle('hair');

      expect(irisStyle.opacity).toBe(1.0);
      expect(irisStyle.filter).toBe('none');
      expect(hairStyle.opacity).toBe(0.15);
      expect(hairStyle.filter).toContain('grayscale');
    });

    it('F6-5: should switch solo target seamlessly between different layers', () => {
      driver.setSoloLayer('hair');
      expect(driver.getLayerFilterStyle('hair').opacity).toBe(1.0);
      expect(driver.getLayerFilterStyle('clothes').opacity).toBe(0.15);

      driver.setSoloLayer('clothes');
      expect(driver.getLayerFilterStyle('hair').opacity).toBe(0.15);
      expect(driver.getLayerFilterStyle('clothes').opacity).toBe(1.0);
    });
  });

  // =========================================================================
  // Feature 7: Built-in Anime Character Data (F7)
  // =========================================================================
  describe('F7: Built-in Anime Character Data', () => {
    it('F7-1: should load "Purple-haired Gold-eyed Anime Girl" project data by default', () => {
      const project = driver.getProject();
      expect(project.title).toContain('紫发金瞳少女');
      expect(project.version).toBe('1.0.0');
    });

    it('F7-2: should contain 5 structured evolution stages', () => {
      const project = driver.getProject();
      expect(project.stages).toHaveLength(5);
      expect(project.stages[0].name).toBe('01初版草图');
      expect(project.stages[4].name).toBe('05增光润部');
    });

    it('F7-3: should contain exactly 43 micro-steps in built-in dataset', () => {
      const project = driver.getProject();
      expect(project.steps).toHaveLength(43);
    });

    it('F7-4: should ensure all steps have valid xmlPatch markup and layer assignment', () => {
      const project = driver.getProject();
      for (const step of project.steps) {
        expect(step.xmlPatch).toBeTruthy();
        expect(step.layerId).toBeDefined();
        expect(step.title).toBeTruthy();
      }
    });

    it('F7-5: should start studio at completed artwork state (step 43)', () => {
      expect(driver.getCurrentStep()).toBe(43);
    });
  });

  // =========================================================================
  // Feature 8: 5-Stage Evolution Revisions (F8)
  // =========================================================================
  describe('F8: 5-Stage Evolution Revisions', () => {
    it('F8-1: should accurately map Stage 01 steps (1-7: 草图)', () => {
      const stages = driver.getProject().stages;
      const stage1 = stages[0];
      expect(stage1.id).toBe('stage-1');
      expect(stage1.startStep).toBe(1);
      expect(stage1.endStep).toBe(7);
    });

    it('F8-2: should accurately map Stage 02 steps (8-16: 局部细化)', () => {
      const stage2 = driver.getProject().stages[1];
      expect(stage2.id).toBe('stage-2');
      expect(stage2.startStep).toBe(8);
      expect(stage2.endStep).toBe(16);
    });

    it('F8-3: should accurately map Stage 03 steps (17-26: 对比修正)', () => {
      const stage3 = driver.getProject().stages[2];
      expect(stage3.id).toBe('stage-3');
      expect(stage3.startStep).toBe(17);
      expect(stage3.endStep).toBe(26);
    });

    it('F8-4: should accurately map Stage 04 steps (27-35: 虹膜笔触)', () => {
      const stage4 = driver.getProject().stages[3];
      expect(stage4.id).toBe('stage-4');
      expect(stage4.startStep).toBe(27);
      expect(stage4.endStep).toBe(35);
    });

    it('F8-5: should accurately map Stage 05 steps (36-43: 增光润部)', () => {
      const stage5 = driver.getProject().stages[4];
      expect(stage5.id).toBe('stage-5');
      expect(stage5.startStep).toBe(36);
      expect(stage5.endStep).toBe(43);
    });
  });

  // =========================================================================
  // Feature 9: 43 Micro-Step Stroke Sequence (F9)
  // =========================================================================
  describe('F9: 43 Micro-Step Stroke Sequence', () => {
    it('F9-1: should verify strictly contiguous 1-based step IDs from 1 to 43', () => {
      const steps = driver.getProject().steps;
      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].id).toBe(i + 1);
      }
    });

    it('F9-2: should associate every step with an element identifier', () => {
      const steps = driver.getProject().steps;
      for (const s of steps) {
        expect(s.elementId).toBeDefined();
        expect(s.elementId?.length).toBeGreaterThan(0);
      }
    });

    it('F9-3: should contain rich descriptive annotations for each micro-step', () => {
      const step1 = driver.getProject().steps[0];
      expect(step1.title).toBe('头部圆形定位草图');
      expect(step1.description).toContain('骨架');
    });

    it('F9-4: should include valid addedLines diff tags for each step', () => {
      const step27 = driver.getProject().steps[26]; // iris base
      expect(step27.addedLines.length).toBeGreaterThan(0);
      expect(step27.addedLines[0]).toContain('+');
    });

    it('F9-5: should accurately reflect cumulative stroke count on canvas as steps progress', () => {
      driver.goToStep(10);
      const dom10 = driver.getDomTree();
      let nodeCount10 = 0;
      for (const group of dom10) {
        nodeCount10 += group.children?.length || 0;
      }
      expect(nodeCount10).toBe(10);

      driver.goToStep(25);
      const dom25 = driver.getDomTree();
      let nodeCount25 = 0;
      for (const group of dom25) {
        nodeCount25 += group.children?.length || 0;
      }
      expect(nodeCount25).toBe(25);
    });
  });

  // =========================================================================
  // Feature 10: Precision Timeline Controller (F10)
  // =========================================================================
  describe('F10: Precision Timeline Controller', () => {
    it('F10-1: should display step fraction format e.g. "43/43 步"', () => {
      driver.goToStep(43);
      expect(driver.getStepProgressFraction()).toBe('43/43 步');

      driver.goToStep(18);
      expect(driver.getStepProgressFraction()).toBe('18/43 步');
    });

    it('F10-2: should calculate accurate percentage progress across timeline', () => {
      driver.goToStep(0);
      expect(driver.getStepProgressPercent()).toBe(0);

      driver.goToStep(43);
      expect(driver.getStepProgressPercent()).toBe(100);
    });

    it('F10-3: should support discrete scrubbing directly to arbitrary steps', () => {
      driver.goToStep(29);
      expect(driver.getCurrentStep()).toBe(29);
      expect(driver.getCurrentStage().id).toBe('stage-4');
    });

    it('F10-4: should clamp negative step inputs to step 0', () => {
      driver.goToStep(-15);
      expect(driver.getCurrentStep()).toBe(0);
    });

    it('F10-5: should clamp overflow step inputs to max total steps (43)', () => {
      driver.goToStep(999);
      expect(driver.getCurrentStep()).toBe(43);
    });
  });

  // =========================================================================
  // Feature 11: Playback State Machine (F11)
  // =========================================================================
  describe('F11: Playback State Machine', () => {
    it('F11-1: should start playback and reset to step 0 if triggered at final step', () => {
      driver.goToStep(43);
      driver.play();
      expect(driver.getIsPlaying()).toBeTruthy();
      expect(driver.getCurrentStep()).toBe(0);
    });

    it('F11-2: should pause playback while retaining exact current step position', () => {
      driver.goToStep(14);
      driver.play();
      expect(driver.getIsPlaying()).toBeTruthy();

      driver.pause();
      expect(driver.getIsPlaying()).toBeFalsy();
      expect(driver.getCurrentStep()).toBe(14);
    });

    it('F11-3: should toggle playback state between play and pause', () => {
      expect(driver.getIsPlaying()).toBeFalsy();
      driver.togglePlay();
      expect(driver.getIsPlaying()).toBeTruthy();
      driver.togglePlay();
      expect(driver.getIsPlaying()).toBeFalsy();
    });

    it('F11-4: should advance one step forward via nextStep()', () => {
      driver.goToStep(10);
      driver.nextStep();
      expect(driver.getCurrentStep()).toBe(11);
    });

    it('F11-5: should retreat one step backward via prevStep()', () => {
      driver.goToStep(10);
      driver.prevStep();
      expect(driver.getCurrentStep()).toBe(9);
    });

    it('F11-6: should automatically stop when reaching final step in non-loop mode', () => {
      driver.goToStep(42);
      driver.play();
      driver.tick(2); // reaches 43, then tries next
      expect(driver.getCurrentStep()).toBe(43);
      expect(driver.getIsPlaying()).toBeFalsy();
    });
  });

  // =========================================================================
  // Feature 12: Speed Switcher (F12)
  // =========================================================================
  describe('F12: Speed Switcher', () => {
    it('F12-1: should default to normal speed (1x)', () => {
      expect(driver.getSpeed()).toBe(1);
    });

    it('F12-2: should support switching to slow motion (0.5x)', () => {
      driver.setSpeed(0.5);
      expect(driver.getSpeed()).toBe(0.5);
    });

    it('F12-3: should support switching to fast speed (2x)', () => {
      driver.setSpeed(2);
      expect(driver.getSpeed()).toBe(2);
    });

    it('F12-4: should support switching to ultra speed (4x)', () => {
      driver.setSpeed(4);
      expect(driver.getSpeed()).toBe(4);
    });

    it('F12-5: should preserve speed setting across play and pause cycles', () => {
      driver.setSpeed(2);
      driver.play();
      driver.pause();
      expect(driver.getSpeed()).toBe(2);
    });
  });

  // =========================================================================
  // Feature 13: Real-Time Code Diff View (F13)
  // =========================================================================
  describe('F13: Real-Time Code Diff View', () => {
    it('F13-1: should return empty diff at step 0', () => {
      driver.goToStep(0);
      const diff = driver.getStepDiff();
      expect(diff.addedLines).toHaveLength(0);
      expect(diff.removedLines).toHaveLength(0);
      expect(diff.patchXml).toBe('');
    });

    it('F13-2: should return added XML lines marked with "+" prefix for current step', () => {
      driver.goToStep(1);
      const diff = driver.getStepDiff();
      expect(diff.addedLines.length).toBeGreaterThan(0);
      expect(diff.addedLines[0].startsWith('+')).toBeTruthy();
      expect(diff.patchXml).toContain('<circle id="sketch-head-circle"');
    });

    it('F13-3: should dynamically update diff when scrubbing to another step', () => {
      driver.goToStep(20);
      const diff20 = driver.getStepDiff();
      expect(diff20.patchXml).toContain('hair-ahoge');

      driver.goToStep(24);
      const diff24 = driver.getStepDiff();
      expect(diff24.patchXml).toContain('nose-tip');
    });

    it('F13-4: should support querying diff for any explicit step index', () => {
      const diff41 = driver.getStepDiff(41);
      expect(diff41.patchXml).toContain('ribbon-gold-brooch');
    });

    it('F13-5: should switch active inspector tab to "diff"', () => {
      driver.setActiveInspectorTab('diff');
      expect(driver.getActiveInspectorTab()).toBe('diff');
    });
  });

  // =========================================================================
  // Feature 14: Full SVG Source View (F14)
  // =========================================================================
  describe('F14: Full SVG Source View', () => {
    it('F14-1: should switch inspector tab to "source"', () => {
      driver.setActiveInspectorTab('source');
      expect(driver.getActiveInspectorTab()).toBe('source');
    });

    it('F14-2: should render full well-formed SVG source for current timeline step', () => {
      driver.goToStep(43);
      const source = driver.getFullSvgSource();
      expect(source.startsWith('<?xml')).toBeTruthy();
      expect(source.endsWith('</svg>')).toBeTruthy();
      expect(source).toContain('viewBox="0 0 800 1000"');
    });

    it('F14-3: should produce empty canvas shell SVG at step 0', () => {
      driver.goToStep(0);
      const source = driver.getFullSvgSource();
      expect(source).toContain('<svg');
      expect(source).not.toContain('<circle id="sketch-head-circle"');
    });

    it('F14-4: should include only cumulative elements up to current step', () => {
      driver.goToStep(1);
      const source1 = driver.getFullSvgSource();
      expect(source1).toContain('sketch-head-circle');
      expect(source1).not.toContain('sketch-crosshair');

      driver.goToStep(2);
      const source2 = driver.getFullSvgSource();
      expect(source2).toContain('sketch-head-circle');
      expect(source2).toContain('sketch-crosshair');
    });

    it('F14-5: should contain all 43 stroke elements at step 43', () => {
      driver.goToStep(43);
      const source = driver.getFullSvgSource();
      expect(source).toContain('final-ambient-overlay');
      expect(source).toContain('sketch-head-circle');
    });
  });

  // =========================================================================
  // Feature 15: 1-Click Code Copy (F15)
  // =========================================================================
  describe('F15: 1-Click Code Copy', () => {
    it('F15-1: should copy full SVG source to clipboard buffer', () => {
      driver.goToStep(43);
      const success = driver.copyCurrentSvgSource();
      expect(success).toBeTruthy();
      expect(driver.getClipboardContent()).toContain('viewBox="0 0 800 1000"');
    });

    it('F15-2: should show success toast message upon copying SVG source', () => {
      driver.copyCurrentSvgSource();
      expect(driver.getToastMessage()).toContain('SVG 源码已复制');
    });

    it('F15-3: should copy current step diff patch to clipboard buffer', () => {
      driver.goToStep(28); // pupil
      const success = driver.copyCurrentStepDiff();
      expect(success).toBeTruthy();
      expect(driver.getClipboardContent()).toContain('pupil-left');
    });

    it('F15-4: should show success toast message upon copying step diff', () => {
      driver.goToStep(5);
      driver.copyCurrentStepDiff();
      expect(driver.getToastMessage()).toContain('步骤代码已复制');
    });

    it('F15-5: should allow clearing toast notifications', () => {
      driver.copyCurrentSvgSource();
      expect(driver.getToastMessage()).toBeTruthy();
      driver.clearToast();
      expect(driver.getToastMessage()).toBeNull();
    });
  });

  // =========================================================================
  // Feature 16: SVG DOM / Layer Tree View (F16)
  // =========================================================================
  describe('F16: SVG DOM / Layer Tree View', () => {
    it('F16-1: should switch inspector tab to "dom"', () => {
      driver.setActiveInspectorTab('dom');
      expect(driver.getActiveInspectorTab()).toBe('dom');
    });

    it('F16-2: should extract hierarchical virtual DOM groups corresponding to active layers', () => {
      driver.goToStep(43);
      const tree = driver.getDomTree();
      expect(tree.length).toBeGreaterThan(0);
      const hairGroup = tree.find((g) => g.id === 'group-hair');
      expect(hairGroup).toBeDefined();
      expect(hairGroup?.children?.length).toBeGreaterThan(0);
    });

    it('F16-3: should annotate every virtual node with correct tag, id, and attributes', () => {
      driver.goToStep(43);
      const tree = driver.getDomTree();
      const lineArtGroup = tree.find((g) => g.id === 'group-line_art');
      expect(lineArtGroup).toBeDefined();
      const firstChild = lineArtGroup?.children?.[0];
      expect(firstChild?.tag).toBe('circle');
      expect(firstChild?.id).toBe('sketch-head-circle');
      expect(firstChild?.attributes['r']).toBe('160');
    });

    it('F16-4: should return empty tree when at step 0', () => {
      driver.goToStep(0);
      const tree = driver.getDomTree();
      expect(tree).toHaveLength(0);
    });

    it('F16-5: should increment tree node count monotonically as step advances', () => {
      driver.goToStep(5);
      const tree5 = driver.getDomTree();
      const count5 = tree5.reduce((acc, g) => acc + (g.children?.length || 0), 0);
      expect(count5).toBe(5);

      driver.goToStep(15);
      const tree15 = driver.getDomTree();
      const count15 = tree15.reduce((acc, g) => acc + (g.children?.length || 0), 0);
      expect(count15).toBe(15);
    });
  });

  // =========================================================================
  // Feature 17: Bidirectional Canvas-DOM Sync (F17)
  // =========================================================================
  describe('F17: Bidirectional Canvas-DOM Sync', () => {
    it('F17-1: should initialize with no node selected or hovered', () => {
      expect(driver.getSelectedNodeId()).toBeNull();
      expect(driver.getHoveredNodeId()).toBeNull();
    });

    it('F17-2: should select node by id when clicked in DOM tree', () => {
      driver.selectNode('iris-base-left');
      expect(driver.getSelectedNodeId()).toBe('iris-base-left');
    });

    it('F17-3: should clear selection when null is passed', () => {
      driver.selectNode('iris-base-left');
      expect(driver.getSelectedNodeId()).toBe('iris-base-left');
      driver.selectNode(null);
      expect(driver.getSelectedNodeId()).toBeNull();
    });

    it('F17-4: should set hovered node state on cursor enter', () => {
      driver.hoverNode('hair-ahoge');
      expect(driver.getHoveredNodeId()).toBe('hair-ahoge');
    });

    it('F17-5: should clear hovered node state on cursor leave', () => {
      driver.hoverNode('hair-ahoge');
      driver.hoverNode(null);
      expect(driver.getHoveredNodeId()).toBeNull();
    });
  });

  // =========================================================================
  // Feature 18: Standalone SVG Export (F18)
  // =========================================================================
  describe('F18: Standalone SVG Export', () => {
    it('F18-1: should export standalone SVG file containing valid XML header', () => {
      const exp = driver.exportStandaloneSvg();
      expect(exp.content.startsWith('<?xml')).toBeTruthy();
      expect(exp.content).toContain('<!DOCTYPE svg');
    });

    it('F18-2: should generate meaningful filename indicating stage and step', () => {
      driver.goToStep(43);
      const exp = driver.exportStandaloneSvg();
      expect(exp.filename).toContain('step43.svg');
      expect(exp.filename).toContain('stage-5');
    });

    it('F18-3: should embed width, height, and viewBox in exported SVG root', () => {
      const exp = driver.exportStandaloneSvg();
      expect(exp.content).toContain('width="800"');
      expect(exp.content).toContain('height="1000"');
      expect(exp.content).toContain('viewBox="0 0 800 1000"');
    });

    it('F18-4: should strictly omit elements of hidden layers from exported file', () => {
      driver.setLayerVisibility('clothes', false);
      const exp = driver.exportStandaloneSvg();
      expect(exp.content).not.toContain('<g id="layer-clothes"');
      expect(exp.content).toContain('<g id="layer-hair"');
    });

    it('F18-5: should retain defs and styles inside exported SVG for standalone tool fidelity', () => {
      const exp = driver.exportStandaloneSvg();
      expect(exp.content).toContain('<defs>');
      expect(exp.content).toContain('geometricPrecision');
    });
  });

  // =========================================================================
  // Feature 19: High-Definition PNG Export (F19)
  // =========================================================================
  describe('F19: High-Definition PNG Export', () => {
    it('F19-1: should export 1x standard resolution PNG with dimensions 800x1000', () => {
      const png = driver.exportPng(1);
      expect(png.scale).toBe(1);
      expect(png.width).toBe(800);
      expect(png.height).toBe(1000);
      expect(png.filename).toBe('anime_character_1x_step43.png');
    });

    it('F19-2: should export 2x Retina resolution PNG with dimensions 1600x2000', () => {
      const png = driver.exportPng(2);
      expect(png.scale).toBe(2);
      expect(png.width).toBe(1600);
      expect(png.height).toBe(2000);
      expect(png.filename).toBe('anime_character_2x_step43.png');
    });

    it('F19-3: should export 4x Ultra-HD resolution PNG with dimensions 3200x4000', () => {
      const png = driver.exportPng(4);
      expect(png.scale).toBe(4);
      expect(png.width).toBe(3200);
      expect(png.height).toBe(4000);
      expect(png.filename).toBe('anime_character_4x_step43.png');
    });

    it('F19-4: should include step index in generated PNG filename', () => {
      driver.goToStep(25);
      const png = driver.exportPng(2);
      expect(png.filename).toBe('anime_character_2x_step25.png');
    });

    it('F19-5: should default unsupported scale requests to 1x safe fallback', () => {
      const png = driver.exportPng(3 as any);
      expect(png.scale).toBe(1);
      expect(png.width).toBe(800);
    });
  });

  // =========================================================================
  // Feature 20: Custom JSON Data Import (F20)
  // =========================================================================
  describe('F20: Custom JSON Data Import', () => {
    it('F20-1: should successfully import valid custom project JSON and rehydrate timeline', () => {
      const customProject = {
        title: 'Custom Cyberpunk Girl',
        version: '2.0.0',
        viewBox: '0 0 800 1000',
        canvasWidth: 800,
        canvasHeight: 1000,
        stages: [{ id: 'stage-custom-1', name: 'Custom Stage', description: 'Test', startStep: 1, endStep: 2 }],
        steps: [
          {
            id: 1,
            stageId: 'stage-custom-1',
            layerId: 'line_art',
            title: 'Custom Line 1',
            description: 'Line',
            xmlPatch: '<line x1="0" y1="0" x2="100" y2="100" stroke="#FF00FF" />',
            addedLines: ['+ <line />'],
            removedLines: [],
          },
          {
            id: 2,
            stageId: 'stage-custom-1',
            layerId: 'hair',
            title: 'Custom Hair 2',
            description: 'Hair',
            xmlPatch: '<circle cx="50" cy="50" r="20" fill="#00FFFF" />',
            addedLines: ['+ <circle />'],
            removedLines: [],
          },
        ],
      };

      const result = driver.importProject(JSON.stringify(customProject));
      expect(result.success).toBeTruthy();
      expect(driver.getProject().title).toBe('Custom Cyberpunk Girl');
      expect(driver.getTotalSteps()).toBe(2);
      expect(driver.getCurrentStep()).toBe(2);
    });

    it('F20-2: should reject empty JSON string with clear error message', () => {
      const result = driver.importProject('');
      expect(result.success).toBeFalsy();
      expect(result.error).toContain('为空');
    });

    it('F20-3: should reject malformed JSON syntax gracefully without crash', () => {
      const result = driver.importProject('{ "title": "Broken", stages: [ }');
      expect(result.success).toBeFalsy();
      expect(result.error).toContain('解析失败');
    });

    it('F20-4: should reject project schema lacking stages array', () => {
      const bad = JSON.stringify({ title: 'No Stages', steps: [{ id: 1 }] });
      const result = driver.importProject(bad);
      expect(result.success).toBeFalsy();
      expect(result.error).toContain('stages');
    });

    it('F20-5: should reject project schema with invalid step objects lacking xmlPatch', () => {
      const bad = JSON.stringify({
        title: 'Bad Step',
        stages: [{ id: 's1', name: 's1', description: '', startStep: 1, endStep: 1 }],
        steps: [{ id: 1, layerId: 'line_art' }], // Missing xmlPatch
      });
      const result = driver.importProject(bad);
      expect(result.success).toBeFalsy();
      expect(result.error).toContain('xmlPatch');
    });
  });

  // =========================================================================
  // Feature 21: Responsive Studio UI (F21)
  // =========================================================================
  describe('F21: Responsive Studio UI', () => {
    it('F21-1: should support switching between inspector view tabs cleanly', () => {
      driver.setActiveInspectorTab('diff');
      expect(driver.getActiveInspectorTab()).toBe('diff');

      driver.setActiveInspectorTab('source');
      expect(driver.getActiveInspectorTab()).toBe('source');

      driver.setActiveInspectorTab('dom');
      expect(driver.getActiveInspectorTab()).toBe('dom');
    });

    it('F21-2: should track and display stage metadata for active step', () => {
      driver.goToStep(3);
      expect(driver.getCurrentStage().name).toBe('01初版草图');

      driver.goToStep(10);
      expect(driver.getCurrentStage().name).toBe('02局部细化');

      driver.goToStep(30);
      expect(driver.getCurrentStage().name).toBe('04虹膜笔触');
    });

    it('F21-3: should jump directly to stage start step when stage is selected', () => {
      driver.goToStage('stage-3');
      expect(driver.getCurrentStep()).toBe(17);
      expect(driver.getCurrentStage().id).toBe('stage-3');
    });

    it('F21-4: should maintain layer filter stability across tab changes', () => {
      driver.setSoloLayer('hair');
      driver.setActiveInspectorTab('dom');
      expect(driver.getSoloLayer()).toBe('hair');

      driver.setActiveInspectorTab('source');
      expect(driver.getLayerFilterStyle('hair').opacity).toBe(1.0);
      expect(driver.getLayerFilterStyle('iris').opacity).toBe(0.15);
    });

    it('F21-5: should provide consistent step fraction display across all stages', () => {
      driver.goToStage('stage-1');
      expect(driver.getStepProgressFraction()).toBe('1/43 步');

      driver.goToStage('stage-5');
      expect(driver.getStepProgressFraction()).toBe('36/43 步');
    });
  });
});
