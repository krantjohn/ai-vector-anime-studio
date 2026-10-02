import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  CanvasTransform,
  Point,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  calculatePan,
  calculateWheelZoom,
  calculateStepZoom,
  calculateFitToScreen,
  calculateResetView,
  formatZoomPercentage,
} from '../../engine/canvasMath';
import { ReferenceGrid } from './ReferenceGrid';
import { CanvasControls } from './CanvasControls';
import { useStudio } from '../../store/studioContext';

export interface VectorCanvasProps {
  /** Optional external transform state (controlled) */
  transform?: CanvasTransform;
  /** Optional transform change handler */
  onTransformChange?: (transform: CanvasTransform) => void;
  /** Reference grid visibility toggle */
  gridVisible?: boolean;
  /** On grid visibility toggle handler */
  onToggleGrid?: () => void;
  /** SVG artwork content (layers, paths, groups) */
  children?: React.ReactNode;
  /** SVG defs content (gradients, clipPaths, filters) */
  defs?: React.ReactNode;
  /** Additional container styling */
  className?: string;
}

/**
 * Interactive Vector Canvas Component
 * 
 * Provides:
 * 1. Hardware-accelerated SVG viewport in canonical 800x1000 coordinate space.
 * 2. PointerEvents drag-to-pan with PointerCapture for seamless dragging past borders.
 * 3. Cursor-anchored non-passive wheel zoom.
 * 4. 4x6 anime reference grid with golden ratio overlays.
 * 5. Floating controls HUD and hotkeys (0: fit, 1: 100%, +/-: zoom, G: grid).
 */
export const VectorCanvas: React.FC<VectorCanvasProps> = ({
  transform: controlledTransform,
  onTransformChange,
  gridVisible: controlledGridVisible,
  onToggleGrid: controlledOnToggleGrid,
  children,
  defs,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const studio = useStudio();

  // State resolution (controlled prop -> studio context fallback)
  const transform = controlledTransform ?? studio.transform;
  const gridVisible = controlledGridVisible ?? studio.gridVisible;

  const updateTransform = useCallback(
    (next: CanvasTransform | ((prev: CanvasTransform) => CanvasTransform)) => {
      if (typeof next === 'function') {
        const updated = next(transform);
        if (onTransformChange) onTransformChange(updated);
        else studio.setTransform(updated);
      } else {
        if (onTransformChange) onTransformChange(next);
        else studio.setTransform(next);
      }
    },
    [transform, onTransformChange, studio]
  );

  const toggleGrid = useCallback(() => {
    if (controlledOnToggleGrid) controlledOnToggleGrid();
    else studio.toggleGrid();
  }, [controlledOnToggleGrid, studio]);

  // Pan dragging state
  const [isPanning, setIsPanning] = useState(false);
  const lastPointerRef = useRef<Point>({ x: 0, y: 0 });
  const isPointerDownRef = useRef(false);

  // Pointer Down: Acquire pointer capture
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag on left (0) or middle (1) mouse button
    if (e.button !== 0 && e.button !== 1) return;

    // Do not initiate pan if clicking on an interactive control button
    if ((e.target as HTMLElement).closest('button, input, [role="toolbar"]')) {
      return;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Graceful fallback if pointer capture fails
    }

    isPointerDownRef.current = true;
    setIsPanning(true);
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  // Pointer Move: Pan canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    updateTransform((prev) => calculatePan(prev, { x: dx, y: dy }));
  };

  // Pointer Up / Cancel: Release pointer capture
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      setIsPanning(false);
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Safe catch
      }
    }
  };

  // Native non-passive wheel event listener for cursor-anchored zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Stop default browser scrolling
      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      updateTransform((prev) =>
        calculateWheelZoom({ x: cursorX, y: cursorY }, prev, e.deltaY)
      );
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [updateTransform]);

  // Viewport action handlers
  const handleFitToScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { clientWidth, clientHeight } = container;
    if (clientWidth > 0 && clientHeight > 0) {
      updateTransform(calculateFitToScreen(clientWidth, clientHeight));
    }
  }, [updateTransform]);

  const handleResetView = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { clientWidth, clientHeight } = container;
    updateTransform(calculateResetView(clientWidth, clientHeight));
  }, [updateTransform]);

  const handleZoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const center = {
      x: container.clientWidth / 2,
      y: container.clientHeight / 2,
    };
    updateTransform((prev) => calculateStepZoom(center, prev, 'in'));
  }, [updateTransform]);

  const handleZoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const center = {
      x: container.clientWidth / 2,
      y: container.clientHeight / 2,
    };
    updateTransform((prev) => calculateStepZoom(center, prev, 'out'));
  }, [updateTransform]);

  // Initial Auto-Fit on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        updateTransform(calculateFitToScreen(container.clientWidth, container.clientHeight));
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if (e.key === '0') {
        e.preventDefault();
        handleFitToScreen();
      } else if (e.key === '1') {
        e.preventDefault();
        handleResetView();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        toggleGrid();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFitToScreen, handleResetView, handleZoomIn, handleZoomOut, toggleGrid]);

  // Focal zoom to key anatomical regions for micro-inspection
  const handleFocusRegion = useCallback(
    (region: 'face' | 'hair' | 'wings') => {
      const cw = containerRef.current?.clientWidth || 800;
      const ch = containerRef.current?.clientHeight || 800;
      let tx = 400, ty = 380, sc = 2.6;
      if (region === 'face') {
        tx = 400; ty = 380; sc = 2.6;
      } else if (region === 'hair') {
        tx = 370; ty = 180; sc = 2.2;
      } else if (region === 'wings') {
        tx = 470; ty = 520; sc = 2.0;
      }
      updateTransform({
        x: Math.round(cw / 2 - tx * sc),
        y: Math.round(ch / 2 - ty * sc),
        scale: sc,
      });
    },
    [updateTransform]
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none touch-none bg-studio-bg ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      } ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="region"
      aria-label="二次元矢量绘制画布 (Vector Canvas)"
      tabIndex={0}
      data-testid="vector-canvas"
    >
      {/* Hardware-Accelerated SVG Artboard Wrapper */}
      <div
        className="absolute top-0 left-0 transition-transform duration-0 ease-linear origin-top-left"
        style={{
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0px) scale(${transform.scale})`,
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          willChange: 'transform',
        }}
      >
        <svg
          id="studio-vector-canvas"
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] rounded-sm bg-white border border-zinc-800/80"
          style={{ overflow: 'visible', shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision' }}
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Reusable Defs */}
          <defs>
            <style type="text/css">
              {`
                .vector-layer { transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                ${studio.currentStep > (studio.project?.stages?.[0]?.endStep ?? 10) ? '[data-sketch="true"] { display: none !important; opacity: 0 !important; }' : ''}
              `}
            </style>
            {/* Gradients */}
            <linearGradient id="purple-hair-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="60%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#2E1065" />
            </linearGradient>
            <radialGradient id="gold-iris-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#1C1917" />
            </radialGradient>
            <radialGradient id="cheek-blush-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FB7185" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
            </radialGradient>
            {/* Master Mika Gradients */}
            <radialGradient id="canvas-celestial-bg" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#FFFBFB" />
              <stop offset="100%" stopColor="#FAF5FF" />
            </radialGradient>
            <linearGradient id="mika-hair-pink-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FCE7F3" />
              <stop offset="45%" stopColor="#F472B6" />
              <stop offset="85%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
            <radialGradient id="mika-eye-gold-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF9C3" />
              <stop offset="35%" stopColor="#FDE047" />
              <stop offset="70%" stopColor="#EAB308" />
              <stop offset="92%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#451A03" />
            </radialGradient>
            <linearGradient id="mika-halo-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
            <linearGradient id="mika-wing-feather-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E0E7FF" />
            </linearGradient>
            <linearGradient id="mika-trinity-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <radialGradient id="mika-galaxy-scrunchie-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#312E81" />
              <stop offset="60%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#0F172A" />
            </radialGradient>
            <radialGradient id="mika-blush-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FB7185" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
            </radialGradient>
            {defs}
          </defs>

          {/* Base Artboard Paper: luminous celestial anime backdrop */}
          <rect
            id="canvas-paper-bg"
            x="0"
            y="0"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="url(#canvas-celestial-bg)"
          />

          {/* SVG Artwork Content */}
          <g id="vector-artwork-root">
            {children ? (
              children
            ) : studio.project && studio.project.title !== '紫发金瞳少女 (Purple-haired Gold-eyed Anime Girl)' ? (
              /* Dynamic Multi-Step Project (Sylphie / Master Mika / AI Generated / Vectorized) */
              <>
                {(() => {
                  const stage1End = studio.project?.stages?.[0]?.endStep ?? 10;
                  const isPastSketch = studio.currentStep > stage1End;
                  const isSoloActive = studio.soloLayer !== null && studio.soloLayer !== 'all';
                  const visibleSteps = (studio.project?.steps || [])
                    .slice(0, studio.currentStep)
                    .filter((s: any) => !isPastSketch || !s.xmlPatch?.includes('data-sketch="true"'))
                    .filter((s: any) => studio.isLayerVisible(s.layerId));

                  const htmlContent = visibleSteps.map((s: any) => {
                    const layerAttr = s.layerId ? ` data-layer="${s.layerId}"` : '';
                    if (isSoloActive && s.layerId !== studio.soloLayer) {
                      return `<g${layerAttr} style="opacity: 0.15; filter: grayscale(85%); transition: opacity 0.2s ease;">${s.xmlPatch}</g>`;
                    }
                    return `<g${layerAttr}>${s.xmlPatch}</g>`;
                  }).join('\n');

                  return (
                    <g
                      id="dynamic-vector-artwork"
                      dangerouslySetInnerHTML={{
                        __html: htmlContent,
                      }}
                    />
                  );
                })()}
              </>
            ) : (
              /* Built-in Canonical Layer Grouping with Studio Filter Hook */
              <>
                {/* 0. Sketch Construction Lines (Active during early steps) */}
                {studio.currentStep <= 12 && (
                  <g id="layer-sketch-guides" data-layer="line_art" style={studio.getLayerFilterStyle('line_art')}>
                    {studio.currentStep >= 1 && (
                      <circle id="sketch-head-circle" cx="400" cy="380" r="160" stroke="#38BDF8" strokeDasharray="4,4" fill="none" opacity={studio.currentStep <= 7 ? 0.7 : 0.25} strokeWidth="1.5" />
                    )}
                    {studio.currentStep >= 2 && (
                      <path id="sketch-crosshair" d="M 400 200 L 400 560 M 240 395 L 560 395" stroke="#38BDF8" strokeDasharray="4,4" opacity={studio.currentStep <= 7 ? 0.7 : 0.25} strokeWidth="1.5" />
                    )}
                    {studio.currentStep >= 3 && (
                      <path id="sketch-jawline" d="M 270 370 Q 280 470 400 530 Q 520 470 530 370" stroke="#38BDF8" fill="none" opacity={studio.currentStep <= 7 ? 0.7 : 0.25} strokeWidth="1.5" />
                    )}
                    {studio.currentStep >= 4 && (
                      <>
                        <rect id="sketch-eye-box-l" x="310" y="375" width="60" height="40" stroke="#38BDF8" fill="none" opacity={studio.currentStep <= 7 ? 0.6 : 0.2} />
                        <rect id="sketch-eye-box-r" x="430" y="375" width="60" height="40" stroke="#38BDF8" fill="none" opacity={studio.currentStep <= 7 ? 0.6 : 0.2} />
                      </>
                    )}
                    {studio.currentStep >= 5 && (
                      <path id="sketch-hair-mass" d="M 230 360 C 230 180 570 180 570 360" stroke="#38BDF8" strokeDasharray="4,4" fill="none" opacity={studio.currentStep <= 7 ? 0.6 : 0.2} />
                    )}
                    {studio.currentStep >= 6 && (
                      <path id="sketch-torso-guide" d="M 370 520 L 370 590 M 430 520 L 430 590 M 260 670 Q 400 600 540 670" stroke="#38BDF8" fill="none" opacity={studio.currentStep <= 7 ? 0.6 : 0.2} />
                    )}
                  </g>
                )}

                {/* 0. Background & Ambient VFX */}
                <g
                  id="layer-background"
                  data-layer="background"
                  className="vector-layer"
                  style={studio.getLayerFilterStyle('background')}
                >
                  <g id="ambient-particles" fill="#FDE047" opacity={studio.currentStep >= 42 ? 0.75 : 0} style={{ transition: 'opacity 0.2s ease' }}>
                    <circle cx="230" cy="310" r="2.5" />
                    <circle cx="560" cy="340" r="3" />
                    <circle cx="210" cy="510" r="2" />
                    <circle cx="580" cy="530" r="2.5" />
                  </g>
                  <rect id="final-ambient-overlay" x="0" y="0" width="800" height="1000" fill="#FDF4FF" opacity={studio.currentStep >= 43 ? 0.04 : 0} style={{ transition: 'opacity 0.2s ease' }} />
                </g>

                {/* 1. Hair Back */}
                <g
                  id="layer-hair-back"
                  data-layer="hair"
                  className="vector-layer"
                  style={studio.getLayerFilterStyle('hair')}
                >
                  <path
                    id="hair-back-volume"
                    d="M 220 320 C 180 440 190 620 220 720 C 260 760 320 780 400 780 C 480 780 540 760 580 720 C 610 620 620 440 580 320 Z"
                    fill="url(#purple-hair-grad)"
                    style={{ opacity: studio.currentStep >= 9 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                </g>

                {/* 2. Clothes */}
                <g
                  id="layer-clothes"
                  data-layer="clothes"
                  className="vector-layer"
                  style={studio.getLayerFilterStyle('clothes')}
                >
                  {/* Blouse */}
                  <path
                    id="clothes-blouse-body"
                    d="M 320 540 L 480 540 L 530 680 L 270 680 Z"
                    fill="#F8FAFC"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    style={{ opacity: studio.currentStep >= 11 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                  {/* Sailor Collar */}
                  <path
                    id="clothes-sailor-collar"
                    d="M 320 540 L 250 630 L 330 635 L 360 565 Z M 480 540 L 550 630 L 470 635 L 440 565 Z"
                    fill="#1E1B4B"
                    style={{ opacity: studio.currentStep >= 10 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                  {/* Crimson Ribbon */}
                  <polygon
                    id="clothes-crimson-ribbon"
                    points="400,580 370,640 400,620 430,640"
                    fill="#DC2626"
                    style={{ opacity: studio.currentStep >= 12 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                  <circle
                    id="clothes-ribbon-brooch"
                    cx="400"
                    cy="580"
                    r="6"
                    fill="#F59E0B"
                    stroke="#FEF3C7"
                    strokeWidth="1"
                    style={{ opacity: studio.currentStep >= 41 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                </g>

                {/* 3. Face & Skin */}
                <g
                  id="layer-face-skin"
                  data-layer="skin_body"
                  className="vector-layer"
                  style={studio.getLayerFilterStyle('skin_body')}
                >
                  {/* Neck */}
                  <path
                    id="skin-neck"
                    d="M 365 480 L 365 550 L 435 550 L 435 480 Z"
                    fill="#FFF7ED"
                    style={{ opacity: studio.currentStep >= 8 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                  {/* Face Base */}
                  <path
                    id="skin-face-base"
                    d="M 270 340 C 265 420 290 480 340 515 C 370 535 400 540 400 540 C 400 540 430 535 460 515 C 510 480 535 420 530 340 Z"
                    fill="#FFF7ED"
                    style={{ opacity: studio.currentStep >= 8 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                </g>

                {/* 4. Iris (Golden Eyes) */}
                <g
                  id="layer-iris"
                  data-layer="iris"
                  className="vector-layer"
                  style={studio.getLayerFilterStyle('iris')}
                >
                  {/* Sclera (Left & Right Eye) */}
                  <ellipse id="sclera-left" cx="340" cy="405" rx="26" ry="18" fill="#FFFFFF" style={{ opacity: studio.currentStep >= 13 ? 1 : 0, transition: 'opacity 0.2s ease' }} />
                  <ellipse id="sclera-right" cx="460" cy="405" rx="26" ry="18" fill="#FFFFFF" style={{ opacity: studio.currentStep >= 13 ? 1 : 0, transition: 'opacity 0.2s ease' }} />

                  {/* Golden Iris Discs */}
                  <ellipse id="iris-disc-left" cx="342" cy="405" rx="17" ry="17" fill="url(#gold-iris-grad)" style={{ opacity: studio.currentStep >= 27 ? 1 : 0, transition: 'opacity 0.2s ease' }} />
                  <ellipse id="iris-disc-right" cx="458" cy="405" rx="17" ry="17" fill="url(#gold-iris-grad)" style={{ opacity: studio.currentStep >= 27 ? 1 : 0, transition: 'opacity 0.2s ease' }} />

                  {/* Pupils */}
                  <circle id="pupil-left" cx="342" cy="405" r="7" fill="#1C1917" style={{ opacity: studio.currentStep >= 28 ? 1 : 0, transition: 'opacity 0.2s ease' }} />
                  <circle id="pupil-right" cx="458" cy="405" r="7" fill="#1C1917" style={{ opacity: studio.currentStep >= 28 ? 1 : 0, transition: 'opacity 0.2s ease' }} />

                  {/* Highlights & Catchlights */}
                  <circle id="catchlight-left-1" cx="337" cy="398" r="4.5" fill="#FFFFFF" style={{ opacity: studio.currentStep >= 31 ? 1 : 0, transition: 'opacity 0.2s ease' }} />
                  <circle id="catchlight-right-1" cx="453" cy="398" r="4.5" fill="#FFFFFF" style={{ opacity: studio.currentStep >= 31 ? 1 : 0, transition: 'opacity 0.2s ease' }} />
                  <circle id="catchlight-left-2" cx="348" cy="412" r="2" fill="#FFFFFF" opacity="0.9" style={{ opacity: studio.currentStep >= 32 ? 0.9 : 0, transition: 'opacity 0.2s ease' }} />
                  <circle id="catchlight-right-2" cx="464" cy="412" r="2" fill="#FFFFFF" opacity="0.9" style={{ opacity: studio.currentStep >= 32 ? 0.9 : 0, transition: 'opacity 0.2s ease' }} />
                </g>

                {/* 5. Hair Front (Bangs & Cowlick) */}
                <g
                  id="layer-hair-front"
                  data-layer="hair"
                  className="vector-layer"
                  style={studio.getLayerFilterStyle('hair')}
                >
                  {/* Bangs */}
                  <path
                    id="hair-bangs"
                    d="M 265 330 C 280 400 305 410 330 360 C 350 410 380 415 400 365 C 420 415 450 410 470 360 C 495 410 520 400 535 330 C 510 260 290 260 265 330 Z"
                    fill="#7C3AED"
                    style={{ opacity: studio.currentStep >= 14 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                  {/* Sidelocks */}
                  <path
                    id="hair-sidelocks"
                    d="M 260 360 C 250 480 270 560 280 600 C 285 540 280 440 290 370 M 540 360 C 550 480 530 560 520 600 C 515 540 520 440 510 370"
                    fill="#6D28D9"
                    style={{ opacity: studio.currentStep >= 19 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                  {/* Ahoge (Cowlick) */}
                  <path
                    id="hair-ahoge"
                    d="M 400 250 Q 430 160 465 180 Q 435 195 405 255"
                    fill="#8B5CF6"
                    style={{ opacity: studio.currentStep >= 20 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                </g>

                {/* 6. Shadow & Highlight */}
                <g
                  id="layer-shadow_highlight"
                  data-layer="shadow_highlight"
                  className="vector-layer"
                  style={studio.getLayerFilterStyle('shadow_highlight')}
                >
                  {/* Neck Shadow */}
                  <polygon
                    id="neck-shadow"
                    points="365,490 400,525 435,490 400,495"
                    fill="#E9D5FF"
                    opacity="0.6"
                    style={{ opacity: studio.currentStep >= 17 ? 0.6 : 0, transition: 'opacity 0.2s ease' }}
                  />
                  {/* Cheek Blush */}
                  <ellipse cx="308" cy="440" rx="20" ry="10" fill="url(#cheek-blush-grad)" style={{ opacity: studio.currentStep >= 36 ? 1 : 0, transition: 'opacity 0.2s ease' }} />
                  <ellipse cx="492" cy="440" rx="20" ry="10" fill="url(#cheek-blush-grad)" style={{ opacity: studio.currentStep >= 36 ? 1 : 0, transition: 'opacity 0.2s ease' }} />
                  {/* Angel Ring Specular */}
                  <path
                    id="hair-angel-ring"
                    d="M 285 285 Q 400 305 515 285"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    strokeDasharray="14,6,20,5,10"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                    style={{ opacity: studio.currentStep >= 38 ? 0.8 : 0, transition: 'opacity 0.2s ease' }}
                  />
                </g>

                {/* 7. Line Art */}
                <g
                  id="layer-line_art"
                  data-layer="line_art"
                  className="vector-layer"
                  style={studio.getLayerFilterStyle('line_art')}
                >
                  {/* Upper Eyelashes */}
                  <path
                    id="eyelashes-left"
                    d="M 314 394 Q 340 376 366 390"
                    stroke="#1E1B4B"
                    strokeWidth="3.5"
                    fill="none"
                    strokeLinecap="round"
                    style={{ opacity: studio.currentStep >= 21 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                  <path
                    id="eyelashes-right"
                    d="M 434 390 Q 460 376 486 394"
                    stroke="#1E1B4B"
                    strokeWidth="3.5"
                    fill="none"
                    strokeLinecap="round"
                    style={{ opacity: studio.currentStep >= 21 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                  {/* Eyebrows */}
                  <path
                    id="eyebrow-left"
                    d="M 318 360 Q 340 350 365 362"
                    stroke="#6D28D9"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                    style={{ opacity: studio.currentStep >= 23 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                  <path
                    id="eyebrow-right"
                    d="M 435 362 Q 460 350 482 360"
                    stroke="#6D28D9"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                    style={{ opacity: studio.currentStep >= 23 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                  {/* Nose Tip & Smile */}
                  <circle id="nose-tip" cx="400" cy="445" r="1.5" fill="#B45309" style={{ opacity: studio.currentStep >= 24 ? 1 : 0, transition: 'opacity 0.2s ease' }} />
                  <path
                    id="mouth-smile"
                    d="M 388 478 Q 400 486 412 478"
                    stroke="#991B1B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    style={{ opacity: studio.currentStep >= 25 ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                </g>
              </>
            )}
          </g>

          {/* 4x6 Anime Reference Grid Overlay */}
          <ReferenceGrid visible={gridVisible} />
        </svg>
      </div>

      {/* Floating Status Badge (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/80 text-[11px] font-mono text-zinc-400">
        <span className="text-amber-400/90 font-semibold">800×1000</span>
        <span className="text-zinc-600">|</span>
        <span>{formatZoomPercentage(transform.scale)}</span>
        <span className="text-zinc-600">|</span>
        <span>
          X: {Math.round(transform.x)} Y: {Math.round(transform.y)}
        </span>
      </div>

      {/* Floating Canvas Controls HUD (Bottom-Right) */}
      <CanvasControls
        transform={transform}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onFitToScreen={handleFitToScreen}
        gridVisible={gridVisible}
        onToggleGrid={toggleGrid}
        onFocusRegion={handleFocusRegion}
      />
    </div>
  );
};
