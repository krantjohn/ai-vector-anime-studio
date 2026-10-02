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
} from '../../src/engine/canvasMath';

describe('Canvas Math Engine Unit Tests', () => {
  describe('clampZoom & clampScale', () => {
    it('should maintain values within [0.1, 10.0]', () => {
      expect(clampZoom(1.0)).toBe(1.0);
      expect(clampZoom(2.5)).toBe(2.5);
      expect(clampZoom(0.5)).toBe(0.5);
      expect(clampScale(1.0)).toBe(1.0);
    });

    it('should clamp values below min scale to 0.1', () => {
      expect(clampZoom(0.05)).toBe(0.1);
      expect(clampZoom(0)).toBe(0.1);
      expect(clampZoom(-5)).toBe(0.1);
    });

    it('should clamp values above max scale to 10.0', () => {
      expect(clampZoom(10.5)).toBe(10.0);
      expect(clampZoom(100)).toBe(10.0);
    });

    it('should safely fallback to default on NaN or Infinity', () => {
      expect(clampZoom(NaN)).toBe(1.0);
      expect(clampZoom(Infinity)).toBe(10.0);
      expect(clampZoom(-Infinity)).toBe(0.1);
    });
  });

  describe('calculatePan', () => {
    it('should translate coordinates linearly with dx and dy numbers', () => {
      const initial = { x: 100, y: 150, scale: 1.5 };
      const updated = calculatePan(initial, 30, -20);
      expect(updated).toEqual({ x: 130, y: 130, scale: 1.5 });
    });

    it('should translate coordinates with Point object { x, y }', () => {
      const initial = { x: 100, y: 150, scale: 1.5 };
      const updated = calculatePan(initial, { x: 40, y: 25 });
      expect(updated).toEqual({ x: 140, y: 175, scale: 1.5 });
    });

    it('should return identical coordinates when delta is zero', () => {
      const initial = { x: 50, y: 50, scale: 2.0 };
      expect(calculatePan(initial, 0, 0)).toEqual(initial);
    });
  });

  describe('calculateFocalZoom & calculateZoomAt (Cursor-Anchored Focal Zoom)', () => {
    it('should preserve world SVG coordinates under cursor anchor', () => {
      const initial = { x: 50, y: 80, scale: 1.0 };
      const cursorX = 400;
      const cursorY = 300;

      // World point under cursor before zoom:
      // Wx = (400 - 50) / 1.0 = 350
      // Wy = (300 - 80) / 1.0 = 220
      const worldBefore = screenToSvg({ x: cursorX, y: cursorY }, initial);
      expect(worldBefore.x).toBeCloseTo(350);
      expect(worldBefore.y).toBeCloseTo(220);

      // Zoom in by factor ~1.2 (wheel delta -120)
      const updated = calculateZoomAt(initial, cursorX, cursorY, -120);

      // World point under cursor after zoom must remain identical
      const worldAfter = screenToSvg({ x: cursorX, y: cursorY }, updated);
      expect(worldAfter.x).toBeCloseTo(worldBefore.x, 2);
      expect(worldAfter.y).toBeCloseTo(worldBefore.y, 2);
    });

    it('should enforce zoom limits even during cursor focal zoom', () => {
      const initial = { x: 0, y: 0, scale: 9.8 };
      const zoomedPastMax = calculateZoomAt(initial, 400, 500, -1000);
      expect(zoomedPastMax.scale).toBe(10.0);

      const initialMin = { x: 0, y: 0, scale: 0.15 };
      const zoomedPastMin = calculateZoomAt(initialMin, 400, 500, 1000);
      expect(zoomedPastMin.scale).toBe(0.1);
    });

    it('should support calculateWheelZoom with exponential scaling', () => {
      const initial = { x: 100, y: 100, scale: 1.0 };
      const zoomed = calculateWheelZoom({ x: 200, y: 200 }, initial, -100);
      expect(zoomed.scale).toBeGreaterThan(1.0);
    });

    it('should support calculateStepZoom in and out', () => {
      const initial = { x: 0, y: 0, scale: 1.0 };
      const center = { x: 400, y: 500 };
      const zoomedIn = calculateStepZoom(center, initial, 'in');
      expect(zoomedIn.scale).toBeCloseTo(1.25);
      const zoomedOut = calculateStepZoom(center, initial, 'out');
      expect(zoomedOut.scale).toBeCloseTo(0.8);
    });
  });

  describe('calculateFitToScreen', () => {
    it('should compute correct scale and centering for landscape viewport', () => {
      // Container 1200x800, SVG 800x1000, padding 32
      // Avail width: 1200 - 64 = 1136, scale = 1136/800 = 1.42
      // Avail height: 800 - 64 = 736, scale = 736/1000 = 0.736
      // Fitted scale = min(1.42, 0.736) = 0.736
      const fit = calculateFitToScreen(1200, 800, 800, 1000, 32);
      expect(fit.scale).toBeCloseTo(0.736);
      expect(fit.x).toBeCloseTo((1200 - 800 * 0.736) / 2);
      expect(fit.y).toBeCloseTo((800 - 1000 * 0.736) / 2);
    });

    it('should compute correct scale and centering for portrait viewport', () => {
      // Container 600x1200, SVG 800x1000, padding 20
      // Avail width: 560, scale = 560/800 = 0.7
      // Avail height: 1160, scale = 1160/1000 = 1.16
      const fit = calculateFitToScreen(600, 1200, 800, 1000, 20);
      expect(fit.scale).toBeCloseTo(0.7);
      expect(fit.x).toBeCloseTo((600 - 800 * 0.7) / 2);
      expect(fit.y).toBeCloseTo((1200 - 1000 * 0.7) / 2);
    });

    it('should fallback safely on zero or negative container dimensions', () => {
      const fallback = calculateFitToScreen(0, 0);
      expect(fallback).toEqual({ x: 0, y: 0, scale: 1.0 });
    });
  });

  describe('calculateResetView', () => {
    it('should return scale 1.0 and center canvas in container', () => {
      const reset = calculateResetView(1000, 1200, 800, 1000);
      expect(reset.scale).toBe(1.0);
      expect(reset.x).toBe((1000 - 800) / 2);
      expect(reset.y).toBe((1200 - 1000) / 2);
    });
  });

  describe('svgToScreen and screenToSvg Bi-Directional Invertibility', () => {
    it('should be exact inverses of each other', () => {
      const transform = { x: 125, y: -45, scale: 2.35 };
      const originalSvgPoint = { x: 385, y: 492 };

      const screenPoint = svgToScreen(originalSvgPoint, transform);
      const invertedSvgPoint = screenToSvg(screenPoint, transform);

      expect(invertedSvgPoint.x).toBeCloseTo(originalSvgPoint.x, 4);
      expect(invertedSvgPoint.y).toBeCloseTo(originalSvgPoint.y, 4);

      const worldPoint = worldToScreen(originalSvgPoint, transform);
      const invertedWorld = screenToWorld(worldPoint, transform);
      expect(invertedWorld.x).toBeCloseTo(originalSvgPoint.x, 4);
      expect(invertedWorld.y).toBeCloseTo(originalSvgPoint.y, 4);
    });
  });

  describe('getGridLines (4x6 Anime Reference Grid)', () => {
    it('should generate 3 internal vertical lines and 5 internal horizontal lines', () => {
      const grid = getGridLines(4, 6, 800, 1000);
      expect(grid.verticalLines).toEqual([200, 400, 600]);
      expect(grid.horizontalLines.length).toBe(5);
      expect(grid.horizontalLines[0]).toBeCloseTo(1000 / 6 * 1);
      expect(grid.horizontalLines[2]).toBeCloseTo(500);
    });
  });

  describe('formatZoomPercentage & toHardwareTransformStyle', () => {
    it('should format percentage accurately', () => {
      expect(formatZoomPercentage(1.0)).toBe('100%');
      expect(formatZoomPercentage(1.45)).toBe('145%');
      expect(formatZoomPercentage(0.852)).toBe('85%');
    });

    it('should create hardware accelerated CSS style', () => {
      const style = toHardwareTransformStyle({ x: 25, y: -10, scale: 1.5 });
      expect(style.transform).toBe('translate3d(25px, -10px, 0px) scale(1.5)');
      expect(style.transformOrigin).toBe('0 0');
      expect(style.willChange).toBe('transform');
      expect(style.width).toBe(`${CANVAS_WIDTH}px`);
      expect(style.height).toBe(`${CANVAS_HEIGHT}px`);
    });
  });
});
