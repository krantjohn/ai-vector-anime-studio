import React from 'react';
import { CanvasTransform, Point } from '../types/studio';

export type { CanvasTransform, Point };

export interface Dimensions {
  width: number;
  height: number;
}

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 1000;
export const MIN_SCALE = 0.1;
export const MAX_SCALE = 10.0;
export const DEFAULT_SCALE = 1.0;
export const DEFAULT_PADDING = 32;
export const ZOOM_STEP_FACTOR = 1.25;
export const WHEEL_ZOOM_SENSITIVITY = 0.0015;

/**
 * Clamps a scale factor within [0.1, 10.0].
 */
export function clampScale(scale: number, min = MIN_SCALE, max = MAX_SCALE): number {
  if (isNaN(scale)) return DEFAULT_SCALE;
  if (scale > max) return max;
  if (scale < min) return min;
  return scale;
}

export const clampZoom = clampScale;

/**
 * Converts a point in world coordinates [0, 800]x[0, 1000] to screen coordinates.
 */
export function worldToScreen(worldPoint: Point, transform: CanvasTransform): Point {
  return {
    x: worldPoint.x * transform.scale + transform.x,
    y: worldPoint.y * transform.scale + transform.y,
  };
}

export const svgToScreen = worldToScreen;

/**
 * Inverse conversion from screen coordinates to world SVG coordinates.
 */
export function screenToWorld(screenPoint: Point, transform: CanvasTransform): Point {
  if (transform.scale === 0) return { x: 0, y: 0 };
  return {
    x: (screenPoint.x - transform.x) / transform.scale,
    y: (screenPoint.y - transform.y) / transform.scale,
  };
}

export const screenToSvg = screenToWorld;

/**
 * Calculates cursor-anchored focal zoom keeping the point beneath the cursor stationary.
 * Sanitizes cursor coordinates and previous transform against NaN or Infinity.
 */
export function calculateFocalZoom(
  cursor: Point,
  currentTransform: CanvasTransform,
  newScaleCandidate: number,
  minScale = MIN_SCALE,
  maxScale = MAX_SCALE
): CanvasTransform {
  const safeCurrentX = Number.isFinite(currentTransform?.x) ? currentTransform.x : 0;
  const safeCurrentY = Number.isFinite(currentTransform?.y) ? currentTransform.y : 0;
  const safeCurrentScale = Number.isFinite(currentTransform?.scale) && currentTransform.scale > 0
    ? currentTransform.scale
    : 1.0;

  const targetScale = clampScale(newScaleCandidate, minScale, maxScale);
  const finalScale = Math.round(targetScale * 10000) / 10000;

  if (!Number.isFinite(currentTransform?.scale) || currentTransform.scale <= 0) {
    return { x: safeCurrentX, y: safeCurrentY, scale: finalScale };
  }

  // If cursor coordinate is non-finite, default to current transform origin (zooms in-place without shift)
  const cursorX = Number.isFinite(cursor?.x) ? cursor.x : safeCurrentX;
  const cursorY = Number.isFinite(cursor?.y) ? cursor.y : safeCurrentY;

  const scaleRatio = finalScale / safeCurrentScale;
  const newX = cursorX - (cursorX - safeCurrentX) * scaleRatio;
  const newY = cursorY - (cursorY - safeCurrentY) * scaleRatio;

  return {
    x: Math.round((Number.isFinite(newX) ? newX : safeCurrentX) * 100) / 100,
    y: Math.round((Number.isFinite(newY) ? newY : safeCurrentY) * 100) / 100,
    scale: finalScale,
  };
}

/**
 * Focal zoom helper supporting smooth, monotonic, direction-preserving wheel/trackpad input.
 * Positive delta zooms out (scrolling down), negative delta zooms in (scrolling up).
 */
export function calculateZoomAt(
  current: CanvasTransform,
  cursorX: number,
  cursorY: number,
  delta: number,
  zoomFactor = WHEEL_ZOOM_SENSITIVITY
): CanvasTransform {
  const safeDelta = Number.isFinite(delta) ? delta : 0;
  const safeZoomFactor = Number.isFinite(zoomFactor) && zoomFactor > 0 ? zoomFactor : WHEEL_ZOOM_SENSITIVITY;
  const factor = Math.exp(-safeDelta * safeZoomFactor);
  const safeScale = Number.isFinite(current?.scale) && current.scale > 0 ? current.scale : 1.0;
  const targetScale = safeScale * factor;
  return calculateFocalZoom({ x: cursorX, y: cursorY }, current, targetScale);
}

/**
 * Wheel zoom helper using exponential sensitivity.
 */
export function calculateWheelZoom(
  cursor: Point,
  currentTransform: CanvasTransform,
  deltaY: number,
  sensitivity = WHEEL_ZOOM_SENSITIVITY
): CanvasTransform {
  const factor = Math.exp(-deltaY * sensitivity);
  const targetScale = currentTransform.scale * factor;
  return calculateFocalZoom(cursor, currentTransform, targetScale);
}

/**
 * Step zoom helper for Zoom In / Zoom Out buttons.
 */
export function calculateStepZoom(
  center: Point,
  currentTransform: CanvasTransform,
  direction: 'in' | 'out',
  factor = ZOOM_STEP_FACTOR
): CanvasTransform {
  const multiplier = direction === 'in' ? factor : 1 / factor;
  return calculateFocalZoom(center, currentTransform, currentTransform.scale * multiplier);
}

/**
 * Pan calculation supporting both (transform, {x, y}) and (transform, dx, dy).
 */
export function calculatePan(
  currentTransform: CanvasTransform,
  deltaOrDx: Point | number,
  maybeDy?: number
): CanvasTransform {
  const dx = typeof deltaOrDx === 'number' ? deltaOrDx : deltaOrDx.x;
  const dy = typeof maybeDy === 'number' ? maybeDy : (deltaOrDx as Point).y;
  const validDx = !isFinite(dx) ? 0 : dx;
  const validDy = !isFinite(dy) ? 0 : dy;
  return {
    ...currentTransform,
    x: Math.round((currentTransform.x + validDx) * 100) / 100,
    y: Math.round((currentTransform.y + validDy) * 100) / 100,
  };
}

/**
 * Centers the 800x1000 canvas in container while preserving aspect ratio.
 * Strictly guards against non-finite or degenerate container dimensions.
 */
export function calculateFitToScreen(
  containerWidth: number,
  containerHeight: number,
  worldWidth = CANVAS_WIDTH,
  worldHeight = CANVAS_HEIGHT,
  padding = DEFAULT_PADDING
): CanvasTransform {
  if (
    !Number.isFinite(containerWidth) ||
    !Number.isFinite(containerHeight) ||
    containerWidth <= 0 ||
    containerHeight <= 0
  ) {
    return { x: 0, y: 0, scale: 1.0 };
  }

  const safeWorldWidth = Number.isFinite(worldWidth) && worldWidth > 0 ? worldWidth : CANVAS_WIDTH;
  const safeWorldHeight = Number.isFinite(worldHeight) && worldHeight > 0 ? worldHeight : CANVAS_HEIGHT;
  const safePadding = Number.isFinite(padding) && padding >= 0 ? padding : DEFAULT_PADDING;

  const availableWidth = Math.max(10, containerWidth - safePadding * 2);
  const availableHeight = Math.max(10, containerHeight - safePadding * 2);

  const scaleX = availableWidth / safeWorldWidth;
  const scaleY = availableHeight / safeWorldHeight;
  const fitScale = clampScale(Math.min(scaleX, scaleY));

  const x = Math.round(((containerWidth - safeWorldWidth * fitScale) / 2) * 100) / 100;
  const y = Math.round(((containerHeight - safeWorldHeight * fitScale) / 2) * 100) / 100;

  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    scale: Math.round(fitScale * 10000) / 10000,
  };
}

/**
 * Resets canvas to 100% scale and centers it.
 * Safely guards against non-finite container or world dimensions.
 */
export function calculateResetView(
  containerWidth = CANVAS_WIDTH,
  containerHeight = CANVAS_HEIGHT,
  worldWidth = CANVAS_WIDTH,
  worldHeight = CANVAS_HEIGHT
): CanvasTransform {
  const safeWorldWidth = Number.isFinite(worldWidth) && worldWidth > 0 ? worldWidth : CANVAS_WIDTH;
  const safeWorldHeight = Number.isFinite(worldHeight) && worldHeight > 0 ? worldHeight : CANVAS_HEIGHT;
  const safeContainerWidth = Number.isFinite(containerWidth) && containerWidth > 0 ? containerWidth : safeWorldWidth;
  const safeContainerHeight = Number.isFinite(containerHeight) && containerHeight > 0 ? containerHeight : safeWorldHeight;

  return {
    x: Math.round((safeContainerWidth - safeWorldWidth) / 2),
    y: Math.round((safeContainerHeight - safeWorldHeight) / 2),
    scale: 1.0,
  };
}

/**
 * Computes grid line offsets for 4x6 anime reference grid.
 */
export function getGridLines(
  columns = 4,
  rows = 6,
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT
) {
  const verticalLines: number[] = [];
  const horizontalLines: number[] = [];

  for (let col = 1; col < columns; col++) {
    verticalLines.push(Math.round((width / columns) * col * 100) / 100);
  }

  for (let row = 1; row < rows; row++) {
    horizontalLines.push(Math.round((height / rows) * row * 100) / 100);
  }

  return {
    verticalLines,
    horizontalLines,
    columns,
    rows,
  };
}

export function formatZoomPercentage(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}

export function toHardwareTransformStyle(transform: CanvasTransform): React.CSSProperties {
  const safeX = Number.isFinite(transform?.x) ? transform.x : 0;
  const safeY = Number.isFinite(transform?.y) ? transform.y : 0;
  const safeScale = Number.isFinite(transform?.scale) && transform.scale > 0 ? transform.scale : 1.0;
  return {
    transform: `translate3d(${safeX}px, ${safeY}px, 0px) scale(${safeScale})`,
    transformOrigin: '0 0',
    willChange: 'transform',
    width: `${CANVAS_WIDTH}px`,
    height: `${CANVAS_HEIGHT}px`,
  };
}
