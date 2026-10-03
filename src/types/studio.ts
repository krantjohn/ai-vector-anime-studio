import React from 'react';

// ==========================================
// 1. Layer Identifiers & Taxonomy
// ==========================================
export type ConcreteLayerId = 'background' | 'skin_body' | 'hair' | 'iris' | 'clothes' | 'shadow_highlight' | 'line_art';
export type LayerId = 'all' | ConcreteLayerId;

export interface LayerDefinition {
  id: LayerId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
  badgeClass: string;
  defaultVisible: boolean;
  defaultCount: number;
}

export interface LayerItemState {
  id: LayerId;
  visible: boolean;
}

export type LayersState = Record<LayerId, LayerItemState>;

export const LAYER_DEFINITIONS: Record<LayerId, LayerDefinition> = {
  all: {
    id: 'all',
    name: '全图 (All Layers)',
    shortName: '全图',
    icon: 'Layers',
    color: '#38BDF8',
    description: '全局画布主控与所有图元总览',
    badgeClass: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    defaultVisible: true,
    defaultCount: 43,
  },
  background: {
    id: 'background',
    name: '背景特效 (Background & VFX)',
    shortName: '背景特效',
    icon: 'Image',
    color: '#6366F1',
    description: '环境氛围、背景板、浮空微粒与神圣光环',
    badgeClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    defaultVisible: true,
    defaultCount: 2,
  },
  skin_body: {
    id: 'skin_body',
    name: '身体肤色 (Skin & Body)',
    shortName: '身体肤色',
    icon: 'User',
    color: '#F97316',
    description: '面部底色、颈部结构、锁骨胸膛与肢体肌肤',
    badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    defaultVisible: true,
    defaultCount: 2,
  },
  hair: {
    id: 'hair',
    name: '发型 (Hair)',
    shortName: '发型',
    icon: 'Sparkles',
    color: '#A855F7',
    description: '后发深紫底色、齐眉刘海、双侧修颜鬓角与头顶呆毛',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    defaultVisible: true,
    defaultCount: 7,
  },
  iris: {
    id: 'iris',
    name: '五官眼眸 (Eyes & Facial Features)',
    shortName: '五官眼眸',
    icon: 'Eye',
    color: '#F59E0B',
    description: '明亮眼白、琥珀金渐变球盘、曜黑瞳孔与星芒高光',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    defaultVisible: true,
    defaultCount: 9,
  },
  clothes: {
    id: 'clothes',
    name: '服饰配饰 (Clothing & Accessories)',
    shortName: '服饰配饰',
    icon: 'Shirt',
    color: '#3B82F6',
    description: '经典海军蓝水手翻领、白衬衫、暗红丝带结与金色纽扣',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    defaultVisible: true,
    defaultCount: 5,
  },
  shadow_highlight: {
    id: 'shadow_highlight',
    name: '光影阴影 (Shading & Highlights)',
    shortName: '光影阴影',
    icon: 'SunMedium',
    color: '#EC4899',
    description: '颈部环境闭塞阴影、粉桃晕染腮红与天使光环发圈',
    badgeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    defaultVisible: true,
    defaultCount: 6,
  },
  line_art: {
    id: 'line_art',
    name: '线条勾勒 (Line Art)',
    shortName: '线条勾勒',
    icon: 'PenTool',
    color: '#10B981',
    description: '面部起稿骨架、下颌贝塞尔曲线、浓密睫毛与微笑唇线',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    defaultVisible: true,
    defaultCount: 12,
  },
};

// ==========================================
// 2. Canvas Transform & Viewport
// ==========================================
export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface Point {
  x: number;
  y: number;
}

// ==========================================
// 3. Central Studio State
// ==========================================
export interface StudioState {
  // Canvas
  transform: CanvasTransform;
  gridVisible: boolean;

  // Layer System
  layers: LayersState;
  soloLayer: LayerId | null;

  // Playback & Timeline
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;

  // Live2D Dissection & Occlusion (Explode View & Overdraw)
  isLive2dExploded: boolean;
  live2dExplodeRatio: number;
  dissectionOffsets: Record<string, { x: number; y: number }>;
  activeDissectPart: string | null;

  // Code & DOM Inspector
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
}

// ==========================================
// 4. Studio Context Actions
// ==========================================
export interface StudioContextType extends StudioState {
  // Aliases for convenience & compatibility
  currentStepIndex: number;
  currentStage: { id: string; title: string; index: number; name: string } | null;
  project?: any;
  currentStepData?: any;
  standaloneSvgSource?: string;
  domTree?: any[];
  setProject?: (project: any) => void;

  // Live2D Dissection & Explode View Actions
  toggleLive2dExplode: () => void;
  setLive2dExplode: (exploded: boolean) => void;
  setLive2dExplodeRatio: (ratio: number) => void;
  setPartOffset: (partId: string, offset: { x: number; y: number }) => void;
  resetDissectionOffsets: () => void;

  // Layer Actions
  toggleLayer: (id: LayerId) => void;
  setLayerVisibility: (id: LayerId, visible: boolean) => void;
  toggleSoloLayer: (id: LayerId) => void;
  setSoloLayer: (id: LayerId | null) => void;
  resetAllLayers: () => void;
  isLayerVisible: (id: LayerId) => boolean;
  isLayerSoloed: (id: LayerId) => boolean;
  getLayerFilterStyle: (id: LayerId) => React.CSSProperties;

  // Canvas Actions
  setTransform: React.Dispatch<React.SetStateAction<CanvasTransform>>;
  panTo: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  zoomAt: (cursorX: number, cursorY: number, delta: number) => void;
  setZoom: (newScale: number) => void;
  resetView: () => void;
  fitToScreen: (containerWidth?: number, containerHeight?: number) => void;
  toggleGrid: () => void;
  setGridVisible: (visible: boolean) => void;

  // Playback Actions (M1 stubs, ready for M2)
  setCurrentStep: (step: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextStep: () => void;
  prevStep: () => void;

  // Node Selection Actions (M1 stubs, ready for M3)
  selectNode: (id: string | null) => void;
  hoverNode: (id: string | null) => void;
}
