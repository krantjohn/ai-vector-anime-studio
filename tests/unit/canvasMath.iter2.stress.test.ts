import { describe, it, expect } from 'vitest';
import {
  calculateFitToScreen,
  calculateZoomAt,
  calculateFocalZoom,
  calculateResetView,
  toHardwareTransformStyle,
  calculatePan,
  clampScale,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MIN_SCALE,
  MAX_SCALE,
  CanvasTransform,
  Point,
} from '../../src/engine/canvasMath';

describe('Challenger 1 Iteration 2: Deep Stress & Invariant Verification', () => {
  // =========================================================================
  // SECTION 1: calculateFitToScreen Guard Exhaustion
  // =========================================================================
  describe('calculateFitToScreen non-finite and degenerate boundary matrix', () => {
    const nonFiniteCases = [
      { name: 'NaN width', w: NaN, h: 600 },
      { name: 'NaN height', w: 800, h: NaN },
      { name: 'both NaN', w: NaN, h: NaN },
      { name: 'Infinity width', w: Infinity, h: 600 },
      { name: 'Infinity height', w: 800, h: Infinity },
      { name: '-Infinity width', w: -Infinity, h: 600 },
      { name: '-Infinity height', w: 800, h: -Infinity },
      { name: 'both Infinity', w: Infinity, h: Infinity },
      { name: 'Zero width', w: 0, h: 600 },
      { name: 'Zero height', w: 800, h: 0 },
      { name: 'both Zero', w: 0, h: 0 },
      { name: 'Negative width', w: -100, h: 600 },
      { name: 'Negative height', w: 800, h: -100 },
      { name: 'Sub-normal microscopic positive width (1e-300)', w: 1e-300, h: 600 },
      { name: 'Sub-normal microscopic positive height (1e-300)', w: 800, h: 1e-300 },
    ];

    for (const testCase of nonFiniteCases) {
      it(`safely handles ${testCase.name} without producing NaN or Infinity`, () => {
        const result = calculateFitToScreen(testCase.w, testCase.h);
        expect(Number.isFinite(result.x), `result.x finite check for ${testCase.name}`).toBe(true);
        expect(Number.isFinite(result.y), `result.y finite check for ${testCase.name}`).toBe(true);
        expect(Number.isFinite(result.scale), `result.scale finite check for ${testCase.name}`).toBe(true);
        expect(result.scale).toBeGreaterThanOrEqual(MIN_SCALE);
        expect(result.scale).toBeLessThanOrEqual(MAX_SCALE);

        // Degenerate/non-positive/non-finite must return canonical identity
        if (!Number.isFinite(testCase.w) || !Number.isFinite(testCase.h) || testCase.w <= 0 || testCase.h <= 0) {
          expect(result).toEqual({ x: 0, y: 0, scale: 1.0 });
        }
      });
    }

    it('safely handles non-finite world dimensions and padding in calculateFitToScreen', () => {
      const normalContainerW = 1200;
      const normalContainerH = 900;

      // Non-finite worldWidth
      const resNaNWorld = calculateFitToScreen(normalContainerW, normalContainerH, NaN, 1000);
      expect(Number.isFinite(resNaNWorld.x)).toBe(true);
      expect(Number.isFinite(resNaNWorld.y)).toBe(true);
      expect(Number.isFinite(resNaNWorld.scale)).toBe(true);

      // Non-finite padding
      const resNaNPadding = calculateFitToScreen(normalContainerW, normalContainerH, 800, 1000, NaN);
      expect(Number.isFinite(resNaNPadding.x)).toBe(true);
      expect(Number.isFinite(resNaNPadding.y)).toBe(true);
      expect(Number.isFinite(resNaNPadding.scale)).toBe(true);

      // Negative padding
      const resNegPadding = calculateFitToScreen(normalContainerW, normalContainerH, 800, 1000, -100);
      expect(Number.isFinite(resNegPadding.x)).toBe(true);
      expect(Number.isFinite(resNegPadding.y)).toBe(true);
      expect(Number.isFinite(resNegPadding.scale)).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 2: calculateZoomAt Smooth Monotonicity & Trackpad Normalization
  // =========================================================================
  describe('calculateZoomAt trackpad normalization and monotonic zoom behavior', () => {
    it('is strictly monotonic: positive delta zooms out, negative delta zooms in', () => {
      const current: CanvasTransform = { x: 100, y: 100, scale: 2.0 };
      const cursorX = 400;
      const cursorY = 500;

      // Fine delta progression from -10 to +10 with step 0.1
      let prevScale = Infinity;
      for (let delta = -10; delta <= 10; delta += 0.1) {
        const roundedDelta = Math.round(delta * 10) / 10;
        const res = calculateZoomAt(current, cursorX, cursorY, roundedDelta);

        expect(Number.isFinite(res.x)).toBe(true);
        expect(Number.isFinite(res.y)).toBe(true);
        expect(Number.isFinite(res.scale)).toBe(true);

        // Monotonic decreasing property: larger delta -> smaller or equal scale (due to clamping)
        expect(res.scale).toBeLessThanOrEqual(prevScale + 1e-9);
        prevScale = res.scale;
      }
    });

    it('has zero discontinuity jump at the previous defect threshold (delta = 5.0 vs 5.1)', () => {
      const current: CanvasTransform = { x: 0, y: 0, scale: 1.0 };
      const cursorX = 400;
      const cursorY = 500;

      const res49 = calculateZoomAt(current, cursorX, cursorY, 4.9);
      const res50 = calculateZoomAt(current, cursorX, cursorY, 5.0);
      const res51 = calculateZoomAt(current, cursorX, cursorY, 5.1);

      // Both should zoom out slightly (~0.7% zoom out)
      expect(res49.scale).toBeLessThan(1.0);
      expect(res50.scale).toBeLessThan(1.0);
      expect(res51.scale).toBeLessThan(1.0);

      // Relative change between 5.0 and 5.1 must be minuscule (< 0.1%)
      const jumpRatio = Math.abs(res51.scale - res50.scale) / res50.scale;
      expect(jumpRatio).toBeLessThan(0.001); // smooth, no 600% jump!
    });

    it('correctly handles small fractional trackpad scroll deltas (0.1, 0.5, 1.0, 2.5, 3.0)', () => {
      const current: CanvasTransform = { x: 0, y: 0, scale: 1.0 };
      const cursorX = 400;
      const cursorY = 500;

      const trackpadDeltas = [0.1, 0.5, 1.0, 2.5, 3.0, 4.2];
      for (const d of trackpadDeltas) {
        // Positive wheel scroll = scroll down = zoom out
        const resDown = calculateZoomAt(current, cursorX, cursorY, d);
        expect(resDown.scale).toBeLessThan(1.0);
        expect(resDown.scale).toBeCloseTo(Math.exp(-d * 0.0015), 4);

        // Negative wheel scroll = scroll up = zoom in
        const resUp = calculateZoomAt(current, cursorX, cursorY, -d);
        expect(resUp.scale).toBeGreaterThan(1.0);
        expect(resUp.scale).toBeCloseTo(Math.exp(d * 0.0015), 4);
      }
    });

    it('safely handles non-finite inputs to calculateZoomAt', () => {
      const current: CanvasTransform = { x: 0, y: 0, scale: 1.0 };

      // NaN delta
      const resNaNDelta = calculateZoomAt(current, 400, 500, NaN);
      expect(Number.isFinite(resNaNDelta.scale)).toBe(true);
      expect(resNaNDelta.scale).toBe(1.0); // exp(0) = 1

      // Infinity delta: Number.isFinite(Infinity) is false, so it safely defaults safeDelta to 0 (no-op)
      const resInfDelta = calculateZoomAt(current, 400, 500, Infinity);
      expect(resInfDelta.scale).toBe(1.0);

      // -Infinity delta: safely defaults safeDelta to 0 (no-op)
      const resNegInfDelta = calculateZoomAt(current, 400, 500, -Infinity);
      expect(resNegInfDelta.scale).toBe(1.0);

      // Degenerate transform scale
      const degenerateTransform: CanvasTransform = { x: 10, y: 10, scale: NaN };
      const resDegenerate = calculateZoomAt(degenerateTransform, 400, 500, 10);
      expect(Number.isFinite(resDegenerate.scale)).toBe(true);
      expect(Number.isFinite(resDegenerate.x)).toBe(true);
      expect(Number.isFinite(resDegenerate.y)).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 3: Focal Zoom & CSS Style Generator Stress
  // =========================================================================
  describe('calculateFocalZoom and toHardwareTransformStyle non-finite robustness', () => {
    it('safely handles Infinity, -Infinity, and NaN in cursor coordinates for calculateFocalZoom', () => {
      const current: CanvasTransform = { x: 100, y: 200, scale: 2.0 };

      const infCursorRes = calculateFocalZoom({ x: Infinity, y: -Infinity }, current, 3.0);
      expect(Number.isFinite(infCursorRes.x)).toBe(true);
      expect(Number.isFinite(infCursorRes.y)).toBe(true);
      expect(Number.isFinite(infCursorRes.scale)).toBe(true);
      expect(infCursorRes.scale).toBe(3.0);
      expect(infCursorRes.x).toBe(100);
      expect(infCursorRes.y).toBe(200);

      const nanCursorRes = calculateFocalZoom({ x: NaN, y: NaN }, current, 1.5);
      expect(Number.isFinite(nanCursorRes.x)).toBe(true);
      expect(Number.isFinite(nanCursorRes.y)).toBe(true);
      expect(nanCursorRes.scale).toBe(1.5);
      expect(nanCursorRes.x).toBe(100);
      expect(nanCursorRes.y).toBe(200);
    });

    it('toHardwareTransformStyle never generates NaNpx or Infinitypx in CSS', () => {
      const degenerateTransforms: CanvasTransform[] = [
        { x: NaN, y: NaN, scale: NaN },
        { x: Infinity, y: -Infinity, scale: Infinity },
        { x: -100, y: NaN, scale: 0 },
        { x: 50, y: 50, scale: -5 },
      ];

      for (const t of degenerateTransforms) {
        const style = toHardwareTransformStyle(t);
        expect(style.transform).not.toContain('NaN');
        expect(style.transform).not.toContain('Infinity');
        expect(style.transform).toMatch(/^translate3d\(-?\d+(\.\d+)?px, -?\d+(\.\d+)?px, 0px\) scale\(\d+(\.\d+)?\)$/);
      }
    });

    it('calculateResetView handles non-finite container and world sizes safely', () => {
      const resNaN = calculateResetView(NaN, NaN, NaN, NaN);
      expect(Number.isFinite(resNaN.x)).toBe(true);
      expect(Number.isFinite(resNaN.y)).toBe(true);
      expect(resNaN.scale).toBe(1.0);
      expect(resNaN.x).toBe(0);
      expect(resNaN.y).toBe(0);

      const resZero = calculateResetView(0, -100, 0, -200);
      expect(Number.isFinite(resZero.x)).toBe(true);
      expect(Number.isFinite(resZero.y)).toBe(true);
      expect(resZero.scale).toBe(1.0);
    });
  });
});
