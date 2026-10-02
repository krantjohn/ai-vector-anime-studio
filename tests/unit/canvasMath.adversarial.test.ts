import { describe, it, expect } from 'vitest';
import {
  clampZoom,
  clampScale,
  calculatePan,
  calculateZoomAt,
  calculateFocalZoom,
  calculateWheelZoom,
  calculateStepZoom,
  calculateFitToScreen,
  calculateResetView,
  svgToScreen,
  screenToSvg,
  worldToScreen,
  screenToWorld,
  getGridLines,
  formatZoomPercentage,
  toHardwareTransformStyle,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MIN_SCALE,
  MAX_SCALE,
  CanvasTransform,
  Point,
} from '../../src/engine/canvasMath';

describe('Adversarial & Empirical Stress Tests: Canvas Math & Pan/Zoom Invariants', () => {
  // =========================================================================
  // SUITE 1: Extreme Zoom Bounds, NaN & Infinity Injection
  // =========================================================================
  describe('Suite 1: Extreme Bounds, NaN & Infinity Injection', () => {
    it('should clamp extreme floats and non-finite values in clampScale', () => {
      // Finite extremes
      expect(clampScale(1e15)).toBe(10.0);
      expect(clampScale(-1e15)).toBe(0.1);
      expect(clampScale(Number.MAX_VALUE)).toBe(10.0);
      expect(clampScale(-Number.MAX_VALUE)).toBe(0.1);
      expect(clampScale(Number.MIN_VALUE)).toBe(0.1);
      expect(clampScale(0)).toBe(0.1);
      expect(clampScale(-0)).toBe(0.1);

      // Non-finite values
      expect(clampScale(NaN)).toBe(1.0);
      expect(clampScale(Infinity)).toBe(10.0);
      expect(clampScale(-Infinity)).toBe(0.1);

      // Boundary points
      expect(clampScale(0.1)).toBe(0.1);
      expect(clampScale(10.0)).toBe(10.0);
      expect(clampScale(0.10000001)).toBe(0.10000001);
      expect(clampScale(9.99999999)).toBe(9.99999999);
    });

    it('should handle NaN / Infinity injection in calculatePan without corrupting state', () => {
      const initial: CanvasTransform = { x: 100, y: 100, scale: 2.0 };

      // Number NaN / Infinity
      const panNaN = calculatePan(initial, NaN, 50);
      expect(Number.isFinite(panNaN.x)).toBe(true);
      expect(Number.isFinite(panNaN.y)).toBe(true);
      expect(panNaN.x).toBe(100);
      expect(panNaN.y).toBe(150);

      const panInf = calculatePan(initial, Infinity, -Infinity);
      expect(panInf.x).toBe(100);
      expect(panInf.y).toBe(100);

      // Point object with NaN / Infinity
      const panPointNaN = calculatePan(initial, { x: NaN, y: NaN });
      expect(panPointNaN.x).toBe(100);
      expect(panPointNaN.y).toBe(100);

      const panPointInf = calculatePan(initial, { x: Infinity, y: -Infinity });
      expect(panPointInf.x).toBe(100);
      expect(panPointInf.y).toBe(100);
    });

    it('should handle zero or negative initial scale in calculateFocalZoom gracefully', () => {
      const cursor: Point = { x: 300, y: 400 };

      // Scale = 0 (degenerate state)
      const degenerateZero: CanvasTransform = { x: 50, y: 50, scale: 0 };
      const resZero = calculateFocalZoom(cursor, degenerateZero, 2.0);
      expect(resZero.scale).toBe(2.0);
      expect(resZero.x).toBe(50);
      expect(resZero.y).toBe(50);

      // Negative scale
      const degenerateNegative: CanvasTransform = { x: 50, y: 50, scale: -2 };
      const resNeg = calculateFocalZoom(cursor, degenerateNegative, 1.5);
      expect(resNeg.scale).toBe(1.5);
      expect(resNeg.x).toBe(50);
      expect(resNeg.y).toBe(50);
    });

    it('should clamp newScaleCandidate in calculateFocalZoom even with extreme inputs', () => {
      const cursor: Point = { x: 400, y: 500 };
      const current: CanvasTransform = { x: 0, y: 0, scale: 1.0 };

      const zoomedHuge = calculateFocalZoom(cursor, current, 1e9);
      expect(zoomedHuge.scale).toBe(10.0);
      expect(Number.isFinite(zoomedHuge.x)).toBe(true);
      expect(Number.isFinite(zoomedHuge.y)).toBe(true);

      const zoomedTiny = calculateFocalZoom(cursor, current, -1e9);
      expect(zoomedTiny.scale).toBe(0.1);
      expect(Number.isFinite(zoomedTiny.x)).toBe(true);
      expect(Number.isFinite(zoomedTiny.y)).toBe(true);

      const zoomedNaN = calculateFocalZoom(cursor, current, NaN);
      expect(zoomedNaN.scale).toBe(1.0);
      expect(Number.isFinite(zoomedNaN.x)).toBe(true);
      expect(Number.isFinite(zoomedNaN.y)).toBe(true);
    });

    it('should handle extreme wheel delta in calculateWheelZoom without overflow or NaN', () => {
      const cursor: Point = { x: 200, y: 200 };
      const current: CanvasTransform = { x: 10, y: 20, scale: 1.0 };

      // Colossal wheel roll down (zoom out)
      const hugeZoomOut = calculateWheelZoom(cursor, current, 1000000);
      expect(hugeZoomOut.scale).toBe(MIN_SCALE);
      expect(Number.isFinite(hugeZoomOut.x)).toBe(true);
      expect(Number.isFinite(hugeZoomOut.y)).toBe(true);

      // Colossal wheel roll up (zoom in)
      const hugeZoomIn = calculateWheelZoom(cursor, current, -1000000);
      expect(hugeZoomIn.scale).toBe(MAX_SCALE);
      expect(Number.isFinite(hugeZoomIn.x)).toBe(true);
      expect(Number.isFinite(hugeZoomIn.y)).toBe(true);
    });
  });

  // =========================================================================
  // SUITE 2: Fixed-Point Cursor Invariant Across Rapid Zoom Cycles
  // =========================================================================
  describe('Suite 2: Cursor Fixed-Point Invariance & Multi-Cycle Zoom Stability', () => {
    it('should maintain stationary world point under cursor during arbitrary zoom', () => {
      const initial: CanvasTransform = { x: -142.5, y: 88.2, scale: 1.4 };
      const cursor: Point = { x: 450.8, y: 320.1 };

      const worldBefore = screenToWorld(cursor, initial);

      // Test multiple target scales
      const targetScales = [0.2, 0.5, 1.0, 2.5, 4.8, 8.0, 10.0];
      for (const scale of targetScales) {
        const transformed = calculateFocalZoom(cursor, initial, scale);
        const worldAfter = screenToWorld(cursor, transformed);

        // Discrepancy between world coords under cursor must be within sub-pixel rounding tolerance (< 0.05px)
        expect(Math.abs(worldAfter.x - worldBefore.x)).toBeLessThan(0.05);
        expect(Math.abs(worldAfter.y - worldBefore.y)).toBeLessThan(0.05);
      }
    });

    it('should survive 100 rapid zoom-in and zoom-out cycles with bounded cumulative drift', () => {
      let current: CanvasTransform = { x: 100, y: 50, scale: 1.0 };
      const cursor: Point = { x: 412.35, y: 523.82 };
      const initialWorld = screenToWorld(cursor, current);

      // 100 cycles of zoom in (+15%) and zoom out (-13.04%)
      for (let i = 0; i < 100; i++) {
        // Zoom in
        current = calculateFocalZoom(cursor, current, current.scale * 1.15);
        // Zoom out
        current = calculateFocalZoom(cursor, current, current.scale / 1.15);
      }

      const finalWorld = screenToWorld(cursor, current);

      // Cumulative drift over 100 back-and-forth cycles must remain minimal (< 0.5px world units)
      expect(Math.abs(finalWorld.x - initialWorld.x)).toBeLessThan(0.5);
      expect(Math.abs(finalWorld.y - initialWorld.y)).toBeLessThan(0.5);
      expect(Math.abs(current.scale - 1.0)).toBeLessThan(0.05);
    });

    it('should maintain world coordinate when cursor is at extreme canvas boundaries', () => {
      const transform: CanvasTransform = { x: 200, y: -100, scale: 2.5 };

      const corners: Point[] = [
        { x: 0, y: 0 },
        { x: CANVAS_WIDTH, y: 0 },
        { x: 0, y: CANVAS_HEIGHT },
        { x: CANVAS_WIDTH, y: CANVAS_HEIGHT },
        { x: -500, y: -500 }, // Far outside screen
        { x: 2500, y: 3000 }, // Far outside screen
      ];

      for (const cursor of corners) {
        const worldBefore = screenToWorld(cursor, transform);
        const updated = calculateFocalZoom(cursor, transform, 4.0);
        const worldAfter = screenToWorld(cursor, updated);

        expect(Math.abs(worldAfter.x - worldBefore.x)).toBeLessThan(0.05);
        expect(Math.abs(worldAfter.y - worldBefore.y)).toBeLessThan(0.05);
      }
    });

    it('should preserve cursor invariance when hitting zoom limits', () => {
      const nearMax: CanvasTransform = { x: 100, y: 100, scale: 9.5 };
      const cursor: Point = { x: 300, y: 400 };

      // Zooming to 15.0 will clamp to 10.0
      const clampedMax = calculateFocalZoom(cursor, nearMax, 15.0);
      expect(clampedMax.scale).toBe(10.0);

      const worldBefore = screenToWorld(cursor, nearMax);
      const worldAfter = screenToWorld(cursor, clampedMax);
      expect(Math.abs(worldAfter.x - worldBefore.x)).toBeLessThan(0.05);
      expect(Math.abs(worldAfter.y - worldBefore.y)).toBeLessThan(0.05);
    });
  });

  // =========================================================================
  // SUITE 3: Container Dimensions & calculateFitToScreen Stress
  // =========================================================================
  describe('Suite 3: Colossal and Degenerate calculateFitToScreen Handling', () => {
    it('should return safe finite transform for degenerate container sizes (0, negative, 1x1)', () => {
      // 0x0
      const fitZero = calculateFitToScreen(0, 0);
      expect(fitZero).toEqual({ x: 0, y: 0, scale: 1.0 });

      // Negative dimensions
      const fitNeg = calculateFitToScreen(-800, -600);
      expect(fitNeg).toEqual({ x: 0, y: 0, scale: 1.0 });

      // Degenerate negative container inputs
      const fitMixedNeg = calculateFitToScreen(-100, 500);
      expect(fitMixedNeg).toEqual({ x: 0, y: 0, scale: 1.0 });

      // Microscopic 1x1 container
      const fitMicro = calculateFitToScreen(1, 1);
      expect(Number.isFinite(fitMicro.x)).toBe(true);
      expect(Number.isFinite(fitMicro.y)).toBe(true);
      expect(Number.isFinite(fitMicro.scale)).toBe(true);
      expect(fitMicro.scale).toBe(MIN_SCALE);

      // Microscopic 10x10 container
      const fitTen = calculateFitToScreen(10, 10);
      expect(Number.isFinite(fitTen.x)).toBe(true);
      expect(Number.isFinite(fitTen.y)).toBe(true);
      expect(fitTen.scale).toBe(MIN_SCALE);
    });

    it('should sanitize NaN container dimensions in calculateFitToScreen', () => {
      const fitWithNaN = calculateFitToScreen(NaN, 500);
      expect(Number.isFinite(fitWithNaN.x)).toBe(true);
      expect(Number.isFinite(fitWithNaN.y)).toBe(true);
      expect(fitWithNaN).toEqual({ x: 0, y: 0, scale: 1.0 });
    });

    it('should safely handle NaN cursor coordinates in calculateFocalZoom', () => {
      const current: CanvasTransform = { x: 100, y: 100, scale: 1.0 };
      const result = calculateFocalZoom({ x: NaN, y: NaN }, current, 1.5);
      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
      expect(result.scale).toBe(1.5);
    });

    it('should sanitize NaN container dimensions in calculateResetView', () => {
      const result = calculateResetView(NaN, 1000);
      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
      expect(result.scale).toBe(1.0);
    });

    it('should maintain monotonic smooth zoom-out on positive trackpad delta=3 in calculateZoomAt', () => {
      const current: CanvasTransform = { x: 0, y: 0, scale: 1.0 };
      const result = calculateZoomAt(current, 400, 500, 3.0);
      expect(result.scale).toBeLessThan(1.0);
      expect(result.scale).toBeCloseTo(Math.exp(-3.0 * 0.0015), 4);
    });

    it('should handle colossal container dimensions (100000x100000) within scale bounds', () => {
      const colossal = calculateFitToScreen(100000, 100000);
      expect(colossal.scale).toBe(MAX_SCALE);
      expect(Number.isFinite(colossal.x)).toBe(true);
      expect(Number.isFinite(colossal.y)).toBe(true);

      // Centered verification:
      // SVG width at 10x = 8000, height at 10x = 10000
      // x should be (100000 - 8000) / 2 = 46000
      // y should be (100000 - 10000) / 2 = 45000
      expect(colossal.x).toBe(46000);
      expect(colossal.y).toBe(45000);
    });

    it('should properly letterbox ultra-wide aspect ratios', () => {
      // 5000 wide x 500 high (10:1 ratio)
      const ultraWide = calculateFitToScreen(5000, 500, 800, 1000, 32);
      // Avail height = 500 - 64 = 436. scale = 436 / 1000 = 0.436
      expect(ultraWide.scale).toBeCloseTo(0.436, 3);
      // Perfect centering
      expect(ultraWide.y).toBeCloseTo((500 - 1000 * ultraWide.scale) / 2, 1);
      expect(ultraWide.x).toBeCloseTo((5000 - 800 * ultraWide.scale) / 2, 1);
    });

    it('should properly pillarbox ultra-tall aspect ratios', () => {
      // 500 wide x 5000 high (1:10 ratio)
      const ultraTall = calculateFitToScreen(500, 5000, 800, 1000, 32);
      // Avail width = 500 - 64 = 436. scale = 436 / 800 = 0.545
      expect(ultraTall.scale).toBeCloseTo(0.545, 3);
      // Perfect centering
      expect(ultraTall.x).toBeCloseTo((500 - 800 * ultraTall.scale) / 2, 1);
      expect(ultraTall.y).toBeCloseTo((5000 - 1000 * ultraTall.scale) / 2, 1);
    });

    it('should handle custom padding including zero or huge padding', () => {
      // Zero padding
      const zeroPad = calculateFitToScreen(800, 1000, 800, 1000, 0);
      expect(zeroPad.scale).toBe(1.0);
      expect(zeroPad.x).toBe(0);
      expect(zeroPad.y).toBe(0);

      // Huge padding larger than container width/height
      const hugePad = calculateFitToScreen(200, 200, 800, 1000, 500);
      expect(hugePad.scale).toBe(MIN_SCALE);
      expect(Number.isFinite(hugePad.x)).toBe(true);
      expect(Number.isFinite(hugePad.y)).toBe(true);
    });
  });

  // =========================================================================
  // SUITE 4: Bi-Directional Invertibility & Monte Carlo Residual Stress
  // =========================================================================
  describe('Suite 4: Bi-Directional Invertibility & Monte Carlo Stress', () => {
    it('should satisfy screenToWorld(worldToScreen(P)) === P across 10,000 random points', () => {
      const numTests = 10000;
      let maxResidual = 0;

      // Deterministic PRNG seed for reproducible test run
      let seed = 42;
      const pseudoRandom = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      for (let i = 0; i < numTests; i++) {
        // Point in wide world space [-5000, 5000]
        const worldP: Point = {
          x: (pseudoRandom() - 0.5) * 10000,
          y: (pseudoRandom() - 0.5) * 10000,
        };

        // Transform with scale in [0.1, 10.0] and translation in [-5000, 5000]
        const transform: CanvasTransform = {
          x: (pseudoRandom() - 0.5) * 10000,
          y: (pseudoRandom() - 0.5) * 10000,
          scale: 0.1 + pseudoRandom() * 9.9,
        };

        const screenP = worldToScreen(worldP, transform);
        const invertedWorldP = screenToWorld(screenP, transform);

        const dx = Math.abs(invertedWorldP.x - worldP.x);
        const dy = Math.abs(invertedWorldP.y - worldP.y);
        const residual = Math.max(dx, dy);

        if (residual > maxResidual) {
          maxResidual = residual;
        }
      }

      // Maximum residual over 10,000 points must be below floating point precision limits (1e-10)
      expect(maxResidual).toBeLessThan(1e-10);
    });

    it('should return {x: 0, y: 0} when inverting with scale = 0', () => {
      const res = screenToWorld({ x: 500, y: 800 }, { x: 100, y: 100, scale: 0 });
      expect(res).toEqual({ x: 0, y: 0 });
    });
  });

  // =========================================================================
  // SUITE 5: Grid Line Precision & Golden Ratio Landmarks
  // =========================================================================
  describe('Suite 5: 4x6 Grid Precision & Anime Anatomy Invariants', () => {
    it('should generate exact 4x6 proportion boundaries for 800x1000 canvas', () => {
      const grid = getGridLines(4, 6, 800, 1000);

      // Vertical line verification (3 internal lines for 4 columns)
      expect(grid.verticalLines).toEqual([200, 400, 600]);
      expect(grid.columns).toBe(4);

      // Horizontal line verification (5 internal lines for 6 rows)
      expect(grid.horizontalLines.length).toBe(5);
      expect(grid.rows).toBe(6);
      expect(grid.horizontalLines[0]).toBe(166.67);
      expect(grid.horizontalLines[1]).toBe(333.33);
      expect(grid.horizontalLines[2]).toBe(500.0);
      expect(grid.horizontalLines[3]).toBe(666.67);
      expect(grid.horizontalLines[4]).toBe(833.33);

      // Uniformity check
      const colStep = grid.verticalLines[1] - grid.verticalLines[0];
      expect(colStep).toBe(200);
      const rowStep = grid.horizontalLines[2] - grid.horizontalLines[1];
      expect(rowStep).toBeCloseTo(166.67, 1);
    });

    it('should verify golden eye horizon and eye focal points match anime anatomical rules', () => {
      // Constants defined in ReferenceGrid specification
      const goldenYTop = 382.0;    // 1000 * (1 - 0.618)
      const goldenXLeft = 305.6;   // 800 * (1 - 0.618)
      const goldenXRight = 494.4;  // 800 * 0.618
      const centerAxisX = 400.0;   // 800 / 2

      // Golden Eye Horizon Y: 382.0 must fall strictly in Row 3 (333.33 - 500.0)
      expect(goldenYTop).toBeGreaterThan(333.33);
      expect(goldenYTop).toBeLessThan(500.0);

      // Left Eye Focal Center X: 305.6 must fall strictly in Col 2 (200 - 400)
      expect(goldenXLeft).toBeGreaterThan(200);
      expect(goldenXLeft).toBeLessThan(400);

      // Right Eye Focal Center X: 494.4 must fall strictly in Col 3 (400 - 600)
      expect(goldenXRight).toBeGreaterThan(400);
      expect(goldenXRight).toBeLessThan(600);

      // Left and right eyes must be equidistant from facial symmetry line (X = 400)
      const distLeft = centerAxisX - goldenXLeft;
      const distRight = goldenXRight - centerAxisX;
      expect(distLeft).toBeCloseTo(distRight, 2);
      expect(distLeft).toBeCloseTo(94.4, 1);

      // Inter-pupillary distance ratio
      const ipd = goldenXRight - goldenXLeft;
      const ipdRatio = ipd / CANVAS_WIDTH;
      // In anime aesthetic theory, eye separation is typically 22% - 25% of head bounding width
      expect(ipdRatio).toBeGreaterThan(0.22);
      expect(ipdRatio).toBeLessThan(0.25);
    });

    it('should handle zero or degenerate grid parameters safely', () => {
      const gridZero = getGridLines(0, 0, 800, 1000);
      expect(gridZero.verticalLines).toEqual([]);
      expect(gridZero.horizontalLines).toEqual([]);

      const gridOne = getGridLines(1, 1, 800, 1000);
      expect(gridOne.verticalLines).toEqual([]);
      expect(gridOne.horizontalLines).toEqual([]);

      const gridNegative = getGridLines(-4, -6, 800, 1000);
      expect(gridNegative.verticalLines).toEqual([]);
      expect(gridNegative.horizontalLines).toEqual([]);
    });
  });

  // =========================================================================
  // SUITE 6: Hardware Transform CSS Generation & Zoom Formatter
  // =========================================================================
  describe('Suite 6: CSS Style Generator & Percentage Formatter Precision', () => {
    it('should format extreme zoom percentages without crashing or displaying NaN%', () => {
      expect(formatZoomPercentage(0.1)).toBe('10%');
      expect(formatZoomPercentage(1.0)).toBe('100%');
      expect(formatZoomPercentage(10.0)).toBe('1000%');
      expect(formatZoomPercentage(0.736)).toBe('74%');
      expect(formatZoomPercentage(0.0001)).toBe('0%');
    });

    it('should produce GPU hardware accelerated transform style with translate3d', () => {
      const style = toHardwareTransformStyle({ x: 38.52, y: -94.11, scale: 2.45 });
      expect(style.transform).toBe('translate3d(38.52px, -94.11px, 0px) scale(2.45)');
      expect(style.transformOrigin).toBe('0 0');
      expect(style.willChange).toBe('transform');
      expect(style.width).toBe('800px');
      expect(style.height).toBe('1000px');
    });
  });
});
