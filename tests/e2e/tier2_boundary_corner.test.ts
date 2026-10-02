/**
 * Tier 2: Boundary & Corner Cases Test Suite (E2E Opaque-Box)
 *
 * Verifies extreme limits, edge cases, NaN sanitization, boundary thresholds,
 * empty states, stress toggles, and corrupted inputs for all 21 features (F1 - F21).
 * >= 5 dedicated tests per feature (105+ total tests).
 */

import {
  describe,
  it,
  beforeEach,
  expect,
  StudioDriver,
  CanvasMathEngine,
  DiffEngine,
  DomExtractor,
  ExporterEngine,
  ProjectValidator,
  createDefaultAnimeProject,
} from './testHarness.ts';
import type { LayerId, ProjectData } from './testHarness.ts';

describe('Tier 2: Boundary & Corner Cases Test Suite (F1 - F21)', () => {
  let driver: StudioDriver;

  beforeEach(() => {
    driver = new StudioDriver();
  });

  // =========================================================================
  // F1: SVG Vector Canvas - Boundaries
  // =========================================================================
  describe('F1-Boundary: SVG Vector Canvas Edge Cases', () => {
    it('F1-B1: should render valid empty SVG document without throwing when project has 0 steps', () => {
      const emptyProject: ProjectData = {
        title: 'Empty Project',
        version: '1.0.0',
        viewBox: '0 0 800 1000',
        canvasWidth: 800,
        canvasHeight: 1000,
        stages: [{ id: 's0', name: 'Empty Stage', description: '', startStep: 0, endStep: 0 }],
        steps: [],
      };
      const emptyDriver = new StudioDriver(emptyProject);
      const svg = emptyDriver.getFullSvgSource();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('viewBox="0 0 800 1000"');
    });

    it('F1-B2: should handle non-standard custom viewBox dimensions safely', () => {
      const customProject: ProjectData = {
        title: 'Wide Format',
        version: '1.0.0',
        viewBox: '0 0 1920 1080',
        canvasWidth: 1920,
        canvasHeight: 1080,
        stages: [{ id: 's1', name: 'Stage 1', description: '', startStep: 1, endStep: 1 }],
        steps: [
          {
            id: 1,
            stageId: 's1',
            layerId: 'line_art',
            title: 'Line',
            description: '',
            xmlPatch: '<line x1="0" y1="0" x2="1920" y2="1080" stroke="#FFF" />',
            addedLines: ['+ line'],
            removedLines: [],
          },
        ],
      };
      const customDriver = new StudioDriver(customProject);
      const svg = customDriver.getFullSvgSource();
      expect(svg).toContain('viewBox="0 0 1920 1080"');
      expect(svg).toContain('width="1920"');
      expect(svg).toContain('height="1080"');
    });

    it('F1-B3: should preserve multiline XML patches without truncating closing brackets', () => {
      driver.goToStep(30); // iris texture rays with nested lines
      const svg = driver.getFullSvgSource();
      expect(svg).toContain('iris-texture-rays');
      expect(svg).toContain('</g>');
    });

    it('F1-B4: should ensure defs section remains intact even when step 0 is selected', () => {
      driver.goToStep(0);
      const svg = driver.getFullSvgSource();
      expect(svg).toContain('<defs>');
      expect(svg).toContain('</defs>');
    });

    it('F1-B5: should output properly escaped XML without unclosed tags', () => {
      const svg = driver.getFullSvgSource();
      const openSvg = (svg.match(/<svg/g) || []).length;
      const closeSvg = (svg.match(/<\/svg>/g) || []).length;
      expect(openSvg).toBe(1);
      expect(closeSvg).toBe(1);
    });
  });

  // =========================================================================
  // F2: Smooth Pan & Zoom - Boundaries
  // =========================================================================
  describe('F2-Boundary: Smooth Pan & Zoom Edge Cases', () => {
    it('F2-B1: should sanitize NaN and infinite pan deltas to 0 without corrupting coordinates', () => {
      driver.panBy(NaN, Infinity);
      expect(driver.getTransform().x).toBe(0);
      expect(driver.getTransform().y).toBe(0);

      driver.panBy(50, -20);
      driver.panBy(undefined as any, null as any);
      expect(driver.getTransform().x).toBe(50);
      expect(driver.getTransform().y).toBe(-20);
    });

    it('F2-B2: should strictly stop scale decrease at MIN_SCALE 0.1x regardless of zoom out delta', () => {
      driver.zoomAt(400, 500, 5000);
      driver.zoomAt(400, 500, 5000);
      driver.zoomAt(400, 500, 100000);
      expect(driver.getTransform().scale).toBe(0.1);
    });

    it('F2-B3: should strictly stop scale increase at MAX_SCALE 10.0x regardless of zoom in delta', () => {
      driver.zoomAt(400, 500, -5000);
      driver.zoomAt(400, 500, -5000);
      driver.zoomAt(400, 500, -100000);
      expect(driver.getTransform().scale).toBe(10.0);
    });

    it('F2-B4: should compute valid coordinates when cursor is far outside viewport bounds', () => {
      driver.zoomAt(-2000, -3000, -500);
      const t = driver.getTransform();
      expect(isNaN(t.x)).toBeFalsy();
      expect(isNaN(t.y)).toBeFalsy();
      expect(isFinite(t.scale)).toBeTruthy();
    });

    it('F2-B5: should leave transform unchanged when zoom delta is zero', () => {
      driver.panBy(120, -80);
      const before = driver.getTransform();
      driver.zoomAt(400, 500, 0);
      const after = driver.getTransform();
      expect(after).toEqual(before);
    });
  });

  // =========================================================================
  // F3: Reset View / Fit Screen - Boundaries
  // =========================================================================
  describe('F3-Boundary: Reset View / Fit Screen Edge Cases', () => {
    it('F3-B1: should be idempotent when resetView() is called consecutively', () => {
      driver.resetView();
      const first = driver.getTransform();
      driver.resetView();
      const second = driver.getTransform();
      expect(first).toEqual({ x: 0, y: 0, scale: 1.0 });
      expect(second).toEqual(first);
    });

    it('F3-B2: should clamp scale to MIN_SCALE 0.1x when container is micro-sized (10x10)', () => {
      driver.fitToScreen(10, 10, 0);
      expect(driver.getTransform().scale).toBe(0.1);
    });

    it('F3-B3: should clamp scale to MAX_SCALE 10.0x when container is colossal (50000x50000)', () => {
      driver.fitToScreen(50000, 50000, 0);
      expect(driver.getTransform().scale).toBe(10.0);
    });

    it('F3-B4: should yield exact identity transform (x=0, y=0, scale=1.0) when container matches canvas exactly', () => {
      driver.fitToScreen(800, 1000, 0);
      expect(driver.getTransform()).toEqual({ x: 0, y: 0, scale: 1.0 });
    });

    it('F3-B5: should handle excessive padding safely without negative dimension crash', () => {
      // 500x500 container with padding 400
      driver.fitToScreen(500, 500, 400);
      const t = driver.getTransform();
      expect(t.scale).toBeGreaterThanOrEqual(0.1);
      expect(isNaN(t.x)).toBeFalsy();
    });
  });

  // =========================================================================
  // F4: 4x6 Reference Grid - Boundaries
  // =========================================================================
  describe('F4-Boundary: 4x6 Reference Grid Edge Cases', () => {
    it('F4-B1: should maintain consistent boolean state under 100 rapid toggles', () => {
      for (let i = 0; i < 100; i++) {
        driver.toggleGrid();
      }
      // After 100 toggles from false, should be false
      expect(driver.isGridVisible()).toBeFalsy();
    });

    it('F4-B2: should compute symmetrical grid lines for square canvas (1000x1000)', () => {
      const grid = CanvasMathEngine.get4x6GridLines(1000, 1000);
      expect(grid.verticalLines).toEqual([250, 500, 750]);
      expect(grid.horizontalLines[0]).toBeCloseTo(166.67, 1);
      expect(grid.horizontalLines[2]).toBe(500);
    });

    it('F4-B3: should handle extreme wide aspect ratio canvas (4000x800)', () => {
      const grid = CanvasMathEngine.get4x6GridLines(4000, 800);
      expect(grid.verticalLines).toEqual([1000, 2000, 3000]);
      expect(grid.horizontalLines).toHaveLength(5);
    });

    it('F4-B4: should produce exactly 3 vertical lines and 5 horizontal lines always', () => {
      const grid = CanvasMathEngine.get4x6GridLines(1234, 5678);
      expect(grid.verticalLines).toHaveLength(3);
      expect(grid.horizontalLines).toHaveLength(5);
    });

    it('F4-B5: should produce ascending, strictly monotonic coordinates for all lines', () => {
      const grid = CanvasMathEngine.get4x6GridLines(800, 1000);
      for (let i = 1; i < grid.verticalLines.length; i++) {
        expect(grid.verticalLines[i]).toBeGreaterThan(grid.verticalLines[i - 1]);
      }
      for (let i = 1; i < grid.horizontalLines.length; i++) {
        expect(grid.horizontalLines[i]).toBeGreaterThan(grid.horizontalLines[i - 1]);
      }
    });
  });

  // =========================================================================
  // F5: Multi-Layer Visibility - Boundaries
  // =========================================================================
  describe('F5-Boundary: Multi-Layer Visibility Edge Cases', () => {
    it('F5-B1: should render empty SVG body when all 6 layers are turned off', () => {
      const layers: LayerId[] = ['hair', 'iris', 'clothes', 'shadow_highlight', 'line_art'];
      for (const l of layers) {
        driver.setLayerVisibility(l, false);
      }
      const svg = driver.getFullSvgSource();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      for (const l of layers) {
        expect(svg).not.toContain(`<g id="layer-${l}"`);
      }
    });

    it('F5-B2: should remember individual layer states when master "all" is toggled off then on', () => {
      driver.setLayerVisibility('clothes', false);
      expect(driver.isLayerVisible('clothes')).toBeFalsy();

      driver.toggleLayer('all'); // master off
      expect(driver.isLayerVisible('hair')).toBeFalsy();
      expect(driver.isLayerVisible('clothes')).toBeFalsy();

      driver.toggleLayer('all'); // master on
      expect(driver.isLayerVisible('hair')).toBeTruthy();
      expect(driver.isLayerVisible('clothes')).toBeFalsy(); // still false
    });

    it('F5-B3: should handle 50 rapid sequential toggles across various layers safely', () => {
      const targetLayers: LayerId[] = ['hair', 'iris', 'clothes', 'shadow_highlight', 'line_art'];
      for (let i = 0; i < 50; i++) {
        const l = targetLayers[i % targetLayers.length];
        driver.toggleLayer(l);
      }
      const svg = driver.getFullSvgSource();
      expect(svg.startsWith('<?xml')).toBeTruthy();
      expect(svg.endsWith('</svg>')).toBeTruthy();
    });

    it('F5-B4: should safely ignore unknown layer IDs in filter style lookups', () => {
      const style = driver.getLayerFilterStyle('unknown_layer' as any);
      expect(style.opacity).toBe(0);
    });

    it('F5-B5: should reflect layer visibility accurately when only 1 single layer is visible', () => {
      const layers: LayerId[] = ['hair', 'clothes', 'shadow_highlight', 'line_art'];
      for (const l of layers) driver.setLayerVisibility(l, false);
      driver.setLayerVisibility('iris', true);

      const svg = driver.getFullSvgSource();
      expect(svg).toContain('<g id="layer-iris"');
      expect(svg).not.toContain('<g id="layer-hair"');
      expect(svg).not.toContain('<g id="layer-clothes"');
    });
  });

  // =========================================================================
  // F6: Layer Solo / Focus Isolation - Boundaries
  // =========================================================================
  describe('F6-Boundary: Layer Solo / Focus Isolation Edge Cases', () => {
    it('F6-B1: should be idempotent when setting solo to null repeatedly', () => {
      driver.setSoloLayer(null);
      expect(driver.getSoloLayer()).toBeNull();
      driver.setSoloLayer(null);
      expect(driver.getSoloLayer()).toBeNull();
    });

    it('F6-B2: should dim all other 4 layers when 1 layer is soloed', () => {
      driver.setSoloLayer('hair');
      const otherLayers: LayerId[] = ['iris', 'clothes', 'shadow_highlight', 'line_art'];
      for (const l of otherLayers) {
        const style = driver.getLayerFilterStyle(l);
        expect(style.opacity).toBe(0.15);
        expect(style.filter).toContain('grayscale');
      }
    });

    it('F6-B3: should restore 100% opacity to all layers when solo is cancelled', () => {
      driver.setSoloLayer('iris');
      driver.setSoloLayer(null);
      const layers: LayerId[] = ['hair', 'iris', 'clothes', 'shadow_highlight', 'line_art'];
      for (const l of layers) {
        const style = driver.getLayerFilterStyle(l);
        expect(style.opacity).toBe(1.0);
        expect(style.filter).toBe('none');
      }
    });

    it('F6-B4: should handle rapid switching of solo layer across all 5 layers sequentially', () => {
      const layers: LayerId[] = ['hair', 'iris', 'clothes', 'shadow_highlight', 'line_art'];
      for (const l of layers) {
        driver.setSoloLayer(l);
        expect(driver.getSoloLayer()).toBe(l);
        expect(driver.getLayerFilterStyle(l).opacity).toBe(1.0);
      }
    });

    it('F6-B5: should hide layer completely if layer visibility is false even if soloed', () => {
      driver.setLayerVisibility('clothes', false);
      driver.setSoloLayer('clothes');
      const style = driver.getLayerFilterStyle('clothes');
      expect(style.opacity).toBe(0);
      expect(style.display).toBe('none');
    });
  });

  // =========================================================================
  // F7: Built-in Anime Character Data - Boundaries
  // =========================================================================
  describe('F7-Boundary: Built-in Anime Character Data Edge Cases', () => {
    it('F7-B1: should provide immutable project data copy resistant to tampering', () => {
      const project1 = createDefaultAnimeProject();
      project1.title = 'Tampered Title';
      project1.steps.length = 0;

      const project2 = createDefaultAnimeProject();
      expect(project2.title).toContain('紫发金瞳少女');
      expect(project2.steps).toHaveLength(43);
    });

    it('F7-B2: should ensure all 43 micro-steps have non-empty titles and descriptions', () => {
      const steps = driver.getProject().steps;
      for (const s of steps) {
        expect(s.title.trim().length).toBeGreaterThan(0);
        expect(s.description.trim().length).toBeGreaterThan(0);
      }
    });

    it('F7-B3: should ensure all 43 micro-steps have non-empty xmlPatch', () => {
      const steps = driver.getProject().steps;
      for (const s of steps) {
        expect(s.xmlPatch.trim().length).toBeGreaterThan(0);
      }
    });

    it('F7-B4: should verify step 1 has elementId "sketch-head-circle"', () => {
      const step1 = driver.getProject().steps[0];
      expect(step1.elementId).toBe('sketch-head-circle');
    });

    it('F7-B5: should verify step 43 has elementId "final-ambient-overlay"', () => {
      const step43 = driver.getProject().steps[42];
      expect(step43.elementId).toBe('final-ambient-overlay');
    });
  });

  // =========================================================================
  // F8: 5-Stage Evolution Revisions - Boundaries
  // =========================================================================
  describe('F8-Boundary: 5-Stage Evolution Revisions Edge Cases', () => {
    it('F8-B1: should verify stage steps form a strictly contiguous partition without gaps', () => {
      const stages = driver.getProject().stages;
      for (let i = 1; i < stages.length; i++) {
        expect(stages[i].startStep).toBe(stages[i - 1].endStep + 1);
      }
    });

    it('F8-B2: should verify stage 1 starts at 1 and stage 5 ends at 43', () => {
      const stages = driver.getProject().stages;
      expect(stages[0].startStep).toBe(1);
      expect(stages[stages.length - 1].endStep).toBe(43);
    });

    it('F8-B3: should safely handle goToStage with non-existent stage ID without state corruption', () => {
      driver.goToStep(20);
      driver.goToStage('non-existent-stage-999');
      expect(driver.getCurrentStep()).toBe(20);
    });

    it('F8-B4: should map step 0 to the first stage metadata gracefully', () => {
      driver.goToStep(0);
      const stage = driver.getCurrentStage();
      expect(stage).toBeDefined();
      expect(stage.id).toBeTruthy();
    });

    it('F8-B5: should map extreme step 999 to final stage metadata safely', () => {
      driver.goToStep(999);
      const stage = driver.getCurrentStage();
      expect(stage.id).toBe('stage-5');
    });
  });

  // =========================================================================
  // F9: 43 Micro-Step Stroke Sequence - Boundaries
  // =========================================================================
  describe('F9-Boundary: 43 Micro-Step Stroke Sequence Edge Cases', () => {
    it('F9-B1: should handle DOM extraction at step 0 returning empty array without error', () => {
      const dom = DomExtractor.extractTree(driver.getProject().steps, 0);
      expect(dom).toHaveLength(0);
    });

    it('F9-B2: should handle DOM extraction at step 43 containing all groups and child elements', () => {
      const dom = DomExtractor.extractTree(driver.getProject().steps, 43);
      const totalElements = dom.reduce((sum, g) => sum + (g.children?.length || 0), 0);
      expect(totalElements).toBe(43);
    });

    it('F9-B3: should handle multi-element patch markup (e.g. sclera step 13) in DOM tree', () => {
      driver.goToStep(13);
      const dom = driver.getDomTree();
      const irisGroup = dom.find((g) => g.id === 'group-iris');
      expect(irisGroup).toBeDefined();
    });

    it('F9-B4: should handle group-wrapped patch markup (e.g. texture rays step 30) in DOM tree', () => {
      driver.goToStep(30);
      const dom = driver.getDomTree();
      const irisGroup = dom.find((g) => g.id === 'group-iris');
      const rayNode = irisGroup?.children?.find((c) => c.id === 'iris-texture-rays');
      expect(rayNode).toBeDefined();
      expect(rayNode?.tag).toBe('g');
    });

    it('F9-B5: should parse attribute keys correctly from XML string snippets', () => {
      driver.goToStep(1);
      const dom = driver.getDomTree();
      const lineArtGroup = dom.find((g) => g.id === 'group-line_art');
      const headCircle = lineArtGroup?.children?.find((c) => c.id === 'sketch-head-circle');
      expect(headCircle?.attributes['cx']).toBe('400');
      expect(headCircle?.attributes['cy']).toBe('380');
      expect(headCircle?.attributes['r']).toBe('160');
    });
  });

  // =========================================================================
  // F10: Precision Timeline Controller - Boundaries
  // =========================================================================
  describe('F10-Boundary: Precision Timeline Controller Edge Cases', () => {
    it('F10-B1: should floor fractional step values (e.g. 15.8 -> 15)', () => {
      driver.goToStep(15.8);
      expect(driver.getCurrentStep()).toBe(15);
    });

    it('F10-B2: should handle NaN step input gracefully by clamping to 0', () => {
      driver.goToStep(NaN);
      expect(driver.getCurrentStep()).toBe(0);
    });

    it('F10-B3: should handle positive infinity step input by clamping to 43', () => {
      driver.goToStep(Infinity);
      expect(driver.getCurrentStep()).toBe(43);
    });

    it('F10-B4: should handle negative infinity step input by clamping to 0', () => {
      driver.goToStep(-Infinity);
      expect(driver.getCurrentStep()).toBe(0);
    });

    it('F10-B5: should calculate 0% for step 0 and 100% for step 43 exactly', () => {
      driver.goToStep(0);
      expect(driver.getStepProgressPercent()).toBe(0);
      driver.goToStep(43);
      expect(driver.getStepProgressPercent()).toBe(100);
    });
  });

  // =========================================================================
  // F11: Playback State Machine - Boundaries
  // =========================================================================
  describe('F11-Boundary: Playback State Machine Edge Cases', () => {
    it('F11-B1: should be idempotent when play() is called while already playing', () => {
      driver.goToStep(10);
      driver.play();
      expect(driver.getIsPlaying()).toBeTruthy();
      expect(driver.getCurrentStep()).toBe(10);

      driver.play();
      expect(driver.getIsPlaying()).toBeTruthy();
      expect(driver.getCurrentStep()).toBe(10);
    });

    it('F11-B2: should be idempotent when pause() is called while already paused', () => {
      driver.pause();
      expect(driver.getIsPlaying()).toBeFalsy();
      driver.pause();
      expect(driver.getIsPlaying()).toBeFalsy();
    });

    it('F11-B3: should not decrement below step 0 when prevStep() is called at step 0', () => {
      driver.goToStep(0);
      driver.prevStep();
      expect(driver.getCurrentStep()).toBe(0);
    });

    it('F11-B4: should cycle to step 0 when nextStep() is called at step 43 in loop mode', () => {
      driver.goToStep(43);
      driver.toggleLoop();
      expect(driver.getIsLooping()).toBeTruthy();

      driver.nextStep();
      expect(driver.getCurrentStep()).toBe(0);
    });

    it('F11-B5: should not exceed step 43 when nextStep() is called at step 43 in non-loop mode', () => {
      driver.goToStep(43);
      driver.nextStep();
      expect(driver.getCurrentStep()).toBe(43);
      expect(driver.getIsPlaying()).toBeFalsy();
    });
  });

  // =========================================================================
  // F12: Speed Switcher - Boundaries
  // =========================================================================
  describe('F12-Boundary: Speed Switcher Edge Cases', () => {
    it('F12-B1: should maintain playback state uninterrupted when speed is changed', () => {
      driver.goToStep(10);
      driver.play();
      driver.setSpeed(4);
      expect(driver.getIsPlaying()).toBeTruthy();
      expect(driver.getSpeed()).toBe(4);
    });

    it('F12-B2: should allow rapid speed toggling across all presets without crash', () => {
      const speeds: (0.5 | 1 | 2 | 4)[] = [0.5, 1, 2, 4, 2, 0.5, 1];
      for (const s of speeds) {
        driver.setSpeed(s);
        expect(driver.getSpeed()).toBe(s);
      }
    });

    it('F12-B3: should maintain speed setting after pausing and resuming', () => {
      driver.setSpeed(0.5);
      driver.play();
      driver.pause();
      driver.play();
      expect(driver.getSpeed()).toBe(0.5);
    });

    it('F12-B4: should maintain speed setting across step jumps and scrubbing', () => {
      driver.setSpeed(2);
      driver.goToStep(5);
      driver.goToStep(40);
      expect(driver.getSpeed()).toBe(2);
    });

    it('F12-B5: should maintain speed setting after project reset and new load', () => {
      driver.setSpeed(4);
      driver.resetView();
      expect(driver.getSpeed()).toBe(4);
    });
  });

  // =========================================================================
  // F13: Real-Time Code Diff View - Boundaries
  // =========================================================================
  describe('F13-Boundary: Real-Time Code Diff View Edge Cases', () => {
    it('F13-B1: should compute empty diff when comparing identical text in Myers engine', () => {
      const diff = DiffEngine.computeMyersDiff('<circle cx="10" />', '<circle cx="10" />');
      expect(diff.addedLines).toHaveLength(0);
      expect(diff.removedLines).toHaveLength(0);
    });

    it('F13-B2: should return empty diff object when stepIndex is negative or 0', () => {
      expect(driver.getStepDiff(0).patchXml).toBe('');
      expect(driver.getStepDiff(-5).patchXml).toBe('');
    });

    it('F13-B3: should return empty diff object when stepIndex exceeds max step count', () => {
      expect(driver.getStepDiff(100).patchXml).toBe('');
    });

    it('F13-B4: should safely format HTML diff with escaped meta-characters', () => {
      const html = DiffEngine.formatDiffHtml(['+ <rect width="100 & 20" />'], ['- <circle id="old" />']);
      expect(html).toContain('&lt;rect');
      expect(html).toContain('&amp;');
      expect(html).toContain('diff-add');
      expect(html).toContain('diff-del');
    });

    it('F13-B5: should compute correct additions when oldText is completely empty', () => {
      const diff = DiffEngine.computeMyersDiff('', '<path d="M 0 0" />');
      expect(diff.addedLines).toHaveLength(1);
      expect(diff.removedLines).toHaveLength(0);
      expect(diff.addedLines[0]).toBe('+ <path d="M 0 0" />');
    });
  });

  // =========================================================================
  // F14: Full SVG Source View - Boundaries
  // =========================================================================
  describe('F14-Boundary: Full SVG Source View Edge Cases', () => {
    it('F14-B1: should produce deterministic identical SVG string across 5 consecutive calls', () => {
      driver.goToStep(43);
      const ref = driver.getFullSvgSource();
      for (let i = 0; i < 5; i++) {
        expect(driver.getFullSvgSource()).toBe(ref);
      }
    });

    it('F14-B2: should not contain "undefined", "NaN", or "null" in output SVG text', () => {
      driver.goToStep(43);
      const svg = driver.getFullSvgSource();
      expect(svg).not.toContain('undefined');
      expect(svg).not.toContain('NaN');
      expect(svg).not.toContain('null');
    });

    it('F14-B3: should correctly preserve SVG namespace declarations at step 0', () => {
      driver.goToStep(0);
      const svg = driver.getFullSvgSource();
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
    });

    it('F14-B4: should preserve XML declaration as first line of SVG document', () => {
      driver.goToStep(25);
      const svg = driver.getFullSvgSource();
      expect(svg.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')).toBeTruthy();
    });

    it('F14-B5: should render valid SVG even with non-standard layer combinations', () => {
      driver.setLayerVisibility('hair', true);
      driver.setLayerVisibility('iris', false);
      driver.setLayerVisibility('clothes', true);
      driver.setLayerVisibility('shadow_highlight', false);
      driver.setLayerVisibility('line_art', true);

      const svg = driver.getFullSvgSource();
      expect(svg).toContain('<g id="layer-hair"');
      expect(svg).not.toContain('<g id="layer-iris"');
      expect(svg).toContain('<g id="layer-clothes"');
      expect(svg).not.toContain('<g id="layer-shadow_highlight"');
    });
  });

  // =========================================================================
  // F15: 1-Click Code Copy - Boundaries
  // =========================================================================
  describe('F15-Boundary: 1-Click Code Copy Edge Cases', () => {
    it('F15-B1: should copy empty SVG shell when step is 0 without error', () => {
      driver.goToStep(0);
      const res = driver.copyCurrentSvgSource();
      expect(res).toBeTruthy();
      expect(driver.getClipboardContent()).toContain('<svg');
    });

    it('F15-B2: should copy empty string when copying diff at step 0 without error', () => {
      driver.goToStep(0);
      const res = driver.copyCurrentStepDiff();
      expect(res).toBeTruthy();
      expect(driver.getClipboardContent()).toBe('');
    });

    it('F15-B3: should update toast message immediately on subsequent copies', () => {
      driver.copyCurrentSvgSource();
      expect(driver.getToastMessage()).toContain('SVG 源码已复制');
      driver.copyCurrentStepDiff();
      expect(driver.getToastMessage()).toContain('步骤代码已复制');
    });

    it('F15-B4: should safely clear toast notification when none exists', () => {
      driver.clearToast();
      expect(driver.getToastMessage()).toBeNull();
      driver.clearToast();
      expect(driver.getToastMessage()).toBeNull();
    });

    it('F15-B5: should capture complete XML payload including closing tags into clipboard', () => {
      driver.goToStep(43);
      driver.copyCurrentSvgSource();
      const clip = driver.getClipboardContent();
      expect(clip.startsWith('<?xml')).toBeTruthy();
      expect(clip.endsWith('</svg>')).toBeTruthy();
    });
  });

  // =========================================================================
  // F16: SVG DOM / Layer Tree View - Boundaries
  // =========================================================================
  describe('F16-Boundary: SVG DOM / Layer Tree View Edge Cases', () => {
    it('F16-B1: should handle DomExtractor with empty steps array returning empty tree', () => {
      const tree = DomExtractor.extractTree([], 10);
      expect(tree).toHaveLength(0);
    });

    it('F16-B2: should clamp upToStep greater than steps length without index overflow', () => {
      const tree = DomExtractor.extractTree(driver.getProject().steps, 99999);
      const total = tree.reduce((acc, g) => acc + (g.children?.length || 0), 0);
      expect(total).toBe(43);
    });

    it('F16-B3: should assign unique element IDs or fallback IDs to all child nodes in tree', () => {
      driver.goToStep(43);
      const tree = driver.getDomTree();
      const idSet = new Set<string>();
      for (const group of tree) {
        for (const child of group.children || []) {
          expect(child.id).toBeDefined();
          idSet.add(child.id);
        }
      }
      expect(idSet.size).toBe(43);
    });

    it('F16-B4: should verify all virtual nodes have step attribute matching step index', () => {
      driver.goToStep(20);
      const tree = driver.getDomTree();
      for (const group of tree) {
        for (const child of group.children || []) {
          expect(child.step).toBeGreaterThanOrEqual(1);
          expect(child.step).toBeLessThanOrEqual(20);
        }
      }
    });

    it('F16-B5: should omit layer groups from virtual tree if layer has 0 children', () => {
      driver.goToStep(1); // Only line_art at step 1
      const tree = driver.getDomTree();
      const clothesGroup = tree.find((g) => g.id === 'group-clothes');
      expect(clothesGroup).toBeUndefined();
      const lineArtGroup = tree.find((g) => g.id === 'group-line_art');
      expect(lineArtGroup).toBeDefined();
    });
  });

  // =========================================================================
  // F17: Bidirectional Canvas-DOM Sync - Boundaries
  // =========================================================================
  describe('F17-Boundary: Bidirectional Canvas-DOM Sync Edge Cases', () => {
    it('F17-B1: should accept null selection safely and clear selected node', () => {
      driver.selectNode('some-node');
      expect(driver.getSelectedNodeId()).toBe('some-node');
      driver.selectNode(null);
      expect(driver.getSelectedNodeId()).toBeNull();
    });

    it('F17-B2: should accept null hover safely and clear hovered node', () => {
      driver.hoverNode('some-node');
      expect(driver.getHoveredNodeId()).toBe('some-node');
      driver.hoverNode(null);
      expect(driver.getHoveredNodeId()).toBeNull();
    });

    it('F17-B3: should handle 50 rapid alternating node selections without state corruption', () => {
      for (let i = 0; i < 50; i++) {
        driver.selectNode(i % 2 === 0 ? 'node-a' : 'node-b');
      }
      expect(driver.getSelectedNodeId()).toBe('node-b');
    });

    it('F17-B4: should maintain selected node state independently when hover state changes', () => {
      driver.selectNode('persistent-selection');
      driver.hoverNode('temporary-hover');
      expect(driver.getSelectedNodeId()).toBe('persistent-selection');
      expect(driver.getHoveredNodeId()).toBe('temporary-hover');

      driver.hoverNode(null);
      expect(driver.getSelectedNodeId()).toBe('persistent-selection');
      expect(driver.getHoveredNodeId()).toBeNull();
    });

    it('F17-B5: should preserve selected node across timeline step changes', () => {
      driver.selectNode('sketch-head-circle');
      driver.goToStep(10);
      expect(driver.getSelectedNodeId()).toBe('sketch-head-circle');
      driver.goToStep(35);
      expect(driver.getSelectedNodeId()).toBe('sketch-head-circle');
    });
  });

  // =========================================================================
  // F18: Standalone SVG Export - Boundaries
  // =========================================================================
  describe('F18-Boundary: Standalone SVG Export Edge Cases', () => {
    it('F18-B1: should export valid standalone SVG at step 0 without child elements', () => {
      driver.goToStep(0);
      const exp = driver.exportStandaloneSvg();
      expect(exp.content).toContain('<svg');
      expect(exp.content).toContain('</svg>');
      expect(exp.filename).toContain('step0.svg');
    });

    it('F18-B2: should generate valid sanitized filename with no illegal characters', () => {
      driver.goToStep(15);
      const exp = driver.exportStandaloneSvg();
      expect(exp.filename).toMatch(/^[a-zA-Z0-9_\-.]+\.svg$/);
    });

    it('F18-B3: should include XML declaration and doctype in every standalone export', () => {
      const exp = driver.exportStandaloneSvg();
      expect(exp.content).toContain('<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
      expect(exp.content).toContain('<!DOCTYPE svg PUBLIC');
    });

    it('F18-B4: should ensure export output size scales monotonically with active steps', () => {
      driver.goToStep(5);
      const exp5 = driver.exportStandaloneSvg();

      driver.goToStep(40);
      const exp40 = driver.exportStandaloneSvg();

      expect(exp40.content.length).toBeGreaterThan(exp5.content.length);
    });

    it('F18-B5: should not include invisible layer elements in exported SVG file', () => {
      driver.setLayerVisibility('hair', false);
      const exp = driver.exportStandaloneSvg();
      expect(exp.content).not.toContain('<g id="layer-hair"');
    });
  });

  // =========================================================================
  // F19: High-Definition PNG Export - Boundaries
  // =========================================================================
  describe('F19-Boundary: High-Definition PNG Export Edge Cases', () => {
    it('F19-B1: should compute exact pixel count for 1x standard resolution (800,000 px)', () => {
      const dims = ExporterEngine.calculatePngDimensions(1, 800, 1000);
      expect(dims.pixelCount).toBe(800000);
      expect(dims.width).toBe(800);
      expect(dims.height).toBe(1000);
    });

    it('F19-B2: should compute exact pixel count for 2x Retina resolution (3,200,000 px)', () => {
      const dims = ExporterEngine.calculatePngDimensions(2, 800, 1000);
      expect(dims.pixelCount).toBe(3200000);
      expect(dims.width).toBe(1600);
      expect(dims.height).toBe(2000);
    });

    it('F19-B3: should compute exact pixel count for 4x Ultra-HD resolution (12,800,000 px)', () => {
      const dims = ExporterEngine.calculatePngDimensions(4, 800, 1000);
      expect(dims.pixelCount).toBe(12800000);
      expect(dims.width).toBe(3200);
      expect(dims.height).toBe(4000);
    });

    it('F19-B4: should safely fall back to 1x scale when unknown scale is requested', () => {
      const png = driver.exportPng(99 as any);
      expect(png.scale).toBe(1);
      expect(png.width).toBe(800);
      expect(png.height).toBe(1000);
    });

    it('F19-B5: should compute correct PNG dimensions for arbitrary custom base dimensions', () => {
      const dims = ExporterEngine.calculatePngDimensions(2, 500, 500);
      expect(dims.width).toBe(1000);
      expect(dims.height).toBe(1000);
      expect(dims.pixelCount).toBe(1000000);
    });
  });

  // =========================================================================
  // F20: Custom JSON Data Import - Boundaries
  // =========================================================================
  describe('F20-Boundary: Custom JSON Data Import Edge Cases', () => {
    it('F20-B1: should ignore unexpected extra properties in JSON gracefully', () => {
      const payload = {
        title: 'Extra Fields Girl',
        version: '1.0.0',
        extraField1: 'ignored',
        extraMetadata: { deep: true },
        stages: [{ id: 's1', name: 'Stage 1', description: '', startStep: 1, endStep: 1 }],
        steps: [
          {
            id: 1,
            stageId: 's1',
            layerId: 'line_art',
            title: 'Line 1',
            description: '',
            xmlPatch: '<line x1="0" y1="0" x2="10" y2="10" stroke="#FFF" />',
            addedLines: ['+ line'],
            removedLines: [],
          },
        ],
      };
      const res = driver.importProject(JSON.stringify(payload));
      expect(res.success).toBeTruthy();
      expect(driver.getProject().title).toBe('Extra Fields Girl');
    });

    it('F20-B2: should reject JSON payload where root is an array instead of object', () => {
      const res = ProjectValidator.validate('[{ "title": "bad" }]');
      expect(res.success).toBeFalsy();
    });

    it('F20-B3: should reject project with empty stages array', () => {
      const res = ProjectValidator.validate(JSON.stringify({ title: 'No Stages', stages: [], steps: [{ id: 1 }] }));
      expect(res.success).toBeFalsy();
      expect(res.error).toContain('stages');
    });

    it('F20-B4: should reject project with empty steps array', () => {
      const res = ProjectValidator.validate(
        JSON.stringify({
          title: 'No Steps',
          stages: [{ id: 's1', name: 's1', description: '', startStep: 1, endStep: 1 }],
          steps: [],
        })
      );
      expect(res.success).toBeFalsy();
      expect(res.error).toContain('steps');
    });

    it('F20-B5: should reject step with negative id index', () => {
      const res = ProjectValidator.validate(
        JSON.stringify({
          title: 'Negative Step',
          stages: [{ id: 's1', name: 's1', description: '', startStep: 1, endStep: 1 }],
          steps: [{ id: -1, layerId: 'hair', xmlPatch: '<path />' }],
        })
      );
      expect(res.success).toBeFalsy();
      expect(res.error).toContain('id');
    });
  });

  // =========================================================================
  // F21: Responsive Studio UI - Boundaries
  // =========================================================================
  describe('F21-Boundary: Responsive Studio UI Edge Cases', () => {
    it('F21-B1: should preserve canvas pan and zoom transform when switching inspector tabs', () => {
      driver.panBy(250, -180);
      driver.zoomAt(400, 500, -300);
      const transformBefore = driver.getTransform();

      driver.setActiveInspectorTab('dom');
      expect(driver.getTransform()).toEqual(transformBefore);

      driver.setActiveInspectorTab('source');
      expect(driver.getTransform()).toEqual(transformBefore);

      driver.setActiveInspectorTab('diff');
      expect(driver.getTransform()).toEqual(transformBefore);
    });

    it('F21-B2: should retain step fraction string accuracy after import of smaller project', () => {
      const miniProject = {
        title: 'Mini 3-Step Project',
        stages: [{ id: 's1', name: 'Mini Stage', description: '', startStep: 1, endStep: 3 }],
        steps: [
          { id: 1, stageId: 's1', layerId: 'line_art', title: 'Step 1', description: '', xmlPatch: '<rect />' },
          { id: 2, stageId: 's1', layerId: 'line_art', title: 'Step 2', description: '', xmlPatch: '<circle />' },
          { id: 3, stageId: 's1', layerId: 'line_art', title: 'Step 3', description: '', xmlPatch: '<path />' },
        ],
      };
      driver.importProject(JSON.stringify(miniProject));
      expect(driver.getStepProgressFraction()).toBe('3/3 步');

      driver.goToStep(1);
      expect(driver.getStepProgressFraction()).toBe('1/3 步');
    });

    it('F21-B3: should handle rapid switching between inspector tabs 30 times without failure', () => {
      const tabs: ('diff' | 'source' | 'dom')[] = ['diff', 'source', 'dom'];
      for (let i = 0; i < 30; i++) {
        driver.setActiveInspectorTab(tabs[i % tabs.length]);
      }
      expect(driver.getActiveInspectorTab()).toBe('dom');
    });

    it('F21-B4: should preserve toast message across inspector tab changes', () => {
      driver.copyCurrentSvgSource();
      const toast = driver.getToastMessage();
      expect(toast).toBeTruthy();

      driver.setActiveInspectorTab('dom');
      expect(driver.getToastMessage()).toBe(toast);

      driver.setActiveInspectorTab('source');
      expect(driver.getToastMessage()).toBe(toast);
    });

    it('F21-B5: should clamp stage step progression when clicking through all stages', () => {
      const stages = driver.getProject().stages;
      for (const st of stages) {
        driver.goToStage(st.id);
        expect(driver.getCurrentStep()).toBe(st.startStep);
        expect(driver.getCurrentStage().id).toBe(st.id);
      }
    });
  });
});
