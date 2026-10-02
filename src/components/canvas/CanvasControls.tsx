import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Grid,
} from 'lucide-react';
import {
  CanvasTransform,
  formatZoomPercentage,
  MIN_SCALE,
  MAX_SCALE,
} from '../../engine/canvasMath';

export interface CanvasControlsProps {
  /** Current canvas transform */
  transform: CanvasTransform;
  /** Zoom in handler */
  onZoomIn: () => void;
  /** Zoom out handler */
  onZoomOut: () => void;
  /** Reset view to 100% actual size */
  onResetView: () => void;
  /** Fit canvas to container */
  onFitToScreen: () => void;
  /** Focal zoom to anatomical regions */
  onFocusRegion?: (region: 'face' | 'hair' | 'wings') => void;
  /** Grid visibility state */
  gridVisible: boolean;
  /** Toggle grid visibility */
  onToggleGrid: () => void;
  /** Optional extra CSS classes for positioning */
  className?: string;
}

/**
 * Floating Canvas Controls HUD
 * 
 * Provides quick access to zoom in/out, fit to screen, reset view,
 * 4x6 anime reference grid toggle, and zoom percentage indicator.
 */
export const CanvasControls: React.FC<CanvasControlsProps> = ({
  transform,
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitToScreen,
  onFocusRegion,
  gridVisible,
  onToggleGrid,
  className = '',
}) => {
  const isMinZoom = transform.scale <= MIN_SCALE;
  const isMaxZoom = transform.scale >= MAX_SCALE;

  return (
    <div
      className={`absolute bottom-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-900/85 backdrop-blur-md border border-zinc-800 shadow-2xl transition-all ${className}`}
      role="toolbar"
      aria-label="画布交互控制栏 (Canvas Controls)"
      data-testid="canvas-controls-hud"
    >
      {/* Zoom Out Button */}
      <button
        type="button"
        onClick={onZoomOut}
        disabled={isMinZoom}
        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
        title="缩小画布 (快捷键: -)"
        aria-label="缩小画布"
        data-testid="zoom-out-button"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Current Zoom Percentage Badge (Clickable to Reset) */}
      <button
        type="button"
        onClick={onResetView}
        className="px-2 py-0.5 min-w-[54px] text-center text-xs font-mono font-medium rounded text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors border border-zinc-700/50"
        title="当前缩放率 (点击重置为 100%, 快捷键: 1)"
        aria-label={`当前缩放比例 ${formatZoomPercentage(transform.scale)}，点击重置为 100%`}
        data-testid="zoom-percentage-badge"
      >
        {formatZoomPercentage(transform.scale)}
      </button>

      {/* Zoom In Button */}
      <button
        type="button"
        onClick={onZoomIn}
        disabled={isMaxZoom}
        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
        title="放大画布 (快捷键: +)"
        aria-label="放大画布"
        data-testid="zoom-in-button"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Vertical Separator */}
      <div className="w-px h-4 bg-zinc-800 mx-0.5" />

      {/* Fit to Screen Button */}
      <button
        type="button"
        onClick={onFitToScreen}
        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        title="适应屏幕居中 (快捷键: 0)"
        aria-label="适应屏幕居中"
        data-testid="fit-screen-button"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Reset View (1:1) Button */}
      <button
        type="button"
        onClick={onResetView}
        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        title="重置为实际尺寸 100% (快捷键: 1)"
        aria-label="重置视图实际尺寸 100%"
        data-testid="reset-view-button"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Focal Inspection Presets */}
      {onFocusRegion && (
        <>
          <div className="w-px h-4 bg-zinc-800 mx-0.5" />
          <button
            type="button"
            onClick={() => onFocusRegion('face')}
            className="px-2 py-1 rounded text-[11px] text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors flex items-center gap-1 font-sans"
            title="五官与瞳孔微距特写 (260% 缩放)"
            data-testid="focus-face-button"
          >
            <span>👁️</span>
            <span className="hidden sm:inline">五官特写</span>
          </button>
          <button
            type="button"
            onClick={() => onFocusRegion('hair')}
            className="px-2 py-1 rounded text-[11px] text-zinc-400 hover:text-pink-300 hover:bg-zinc-800 transition-colors flex items-center gap-1 font-sans"
            title="发丝与光环微距特写 (220% 缩放)"
            data-testid="focus-hair-button"
          >
            <span>💇</span>
            <span className="hidden sm:inline">发丝特写</span>
          </button>
          <button
            type="button"
            onClick={() => onFocusRegion('wings')}
            className="px-2 py-1 rounded text-[11px] text-zinc-400 hover:text-sky-300 hover:bg-zinc-800 transition-colors flex items-center gap-1 font-sans"
            title="服饰与羽翼特写 (200% 缩放)"
            data-testid="focus-wings-button"
          >
            <span>👗</span>
            <span className="hidden sm:inline">服饰特写</span>
          </button>
        </>
      )}

      {/* Vertical Separator */}
      <div className="w-px h-4 bg-zinc-800 mx-0.5" />

      {/* 4x6 Reference Grid Toggle Button */}
      <button
        type="button"
        onClick={onToggleGrid}
        className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${
          gridVisible
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-transparent'
        }`}
        title="4x6 二次元构图参考网格 (快捷键: G)"
        aria-label="切换4x6参考网格"
        aria-pressed={gridVisible}
        data-testid="grid-toggle-button"
      >
        <Grid className="w-4 h-4" />
        <span className="text-[11px] font-medium pr-0.5 hidden sm:inline">4x6网格</span>
      </button>
    </div>
  );
};
