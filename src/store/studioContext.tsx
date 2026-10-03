import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  LayerId,
  ConcreteLayerId,
  LayersState,
  CanvasTransform,
  StudioContextType,
  LAYER_DEFINITIONS,
} from '../types/studio';
import {
  calculatePan,
  calculateZoomAt,
  calculateFitToScreen,
  calculateResetView,
  clampZoom,
} from '../engine/canvasMath';
import { DEFAULT_ANIME_PROJECT } from '../data/defaultAnimeProject';
import { createMasterMikaBaseProject, createMasterMika10kProject } from '../data/masterMikaProject';
import { createSylphieProject, createSylphie10kProject } from '../data/sylphieProject';
import { createDeocinProject, createDeocin10kProject, DEOCIN_PROJECT } from '../data/deocinProject';
import { ExporterEngine } from '../engine/exporter';
import { ProjectData } from '../types/anime';

const CONCRETE_LAYERS: ConcreteLayerId[] = [
  'background',
  'skin_body',
  'hair',
  'iris',
  'clothes',
  'shadow_highlight',
  'line_art',
];

const DEFAULT_LAYERS_STATE: LayersState = {
  all: { id: 'all', visible: true },
  background: { id: 'background', visible: true },
  skin_body: { id: 'skin_body', visible: true },
  hair: { id: 'hair', visible: true },
  iris: { id: 'iris', visible: true },
  clothes: { id: 'clothes', visible: true },
  shadow_highlight: { id: 'shadow_highlight', visible: true },
  line_art: { id: 'line_art', visible: true },
};

const DEFAULT_TRANSFORM: CanvasTransform = {
  x: 0,
  y: 0,
  scale: 1,
};

const StudioContext = createContext<StudioContextType | null>(null);

export interface StudioProviderProps {
  children: React.ReactNode;
  initialStep?: number;
  totalSteps?: number;
}

export const StudioProvider: React.FC<StudioProviderProps> = ({
  children,
  initialStep = 43,
  totalSteps: totalStepsProp,
}) => {
  // Project Data State with optional URL parameter initialization
  const [project, setProjectState] = useState<ProjectData>(() => {
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      const proj = params.get('project');
      if (proj === 'deocin10k') return createDeocin10kProject();
      if (proj === 'deocin' || proj === 'live2d') return createDeocinProject();
      if (proj === 'sylphie10k') return createSylphie10kProject();
      if (proj === 'sylphie' || proj === 'original') return createSylphieProject();
      if (proj === 'mika10k') return createMasterMika10kProject();
      if (proj === 'mika') return createMasterMikaBaseProject();
    }
    return DEFAULT_ANIME_PROJECT;
  });
  const totalSteps = totalStepsProp ?? project.steps.length;

  const setProject = useCallback((newProject: ProjectData, targetStep?: number) => {
    setProjectState(newProject);
    const stepToSet = targetStep !== undefined ? targetStep : newProject.steps.length;
    setCurrentStepState(Math.max(0, Math.min(newProject.steps.length, stepToSet)));
  }, []);

  // Canvas Transform State
  const [transform, setTransform] = useState<CanvasTransform>(DEFAULT_TRANSFORM);
  const [gridVisible, setGridVisible] = useState<boolean>(false);

  // Layer System State
  const [layers, setLayers] = useState<LayersState>(DEFAULT_LAYERS_STATE);
  const [soloLayer, setSoloLayer] = useState<LayerId | null>(null);

  // Live2D Dissection & Occlusion State
  const [isLive2dExploded, setIsLive2dExploded] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      return params.get('exploded') === 'true' || params.get('dissect') === 'true';
    }
    return false;
  });
  const [live2dExplodeRatio, setLive2dExplodeRatioState] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('exploded') === 'true' || params.get('dissect') === 'true') return 1.0;
    }
    return 0;
  });
  const [dissectionOffsets, setDissectionOffsets] = useState<Record<string, { x: number; y: number }>>(() => {
    const res: Record<string, { x: number; y: number }> = {};
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('exploded') === 'true' || params.get('dissect') === 'true') {
        const dx = parseFloat(params.get('dx') || '280');
        const dy = parseFloat(params.get('dy') || '35');
        res['hair_front'] = { x: dx, y: dy };
        res['hair_back'] = { x: -120, y: 15 };
        res['clothes'] = { x: 0, y: 40 };
      }
    }
    return res;
  });
  const [activeDissectPart, setActiveDissectPart] = useState<string | null>(null);

  // Playback & Timeline State
  const [currentStep, setCurrentStepState] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      const proj = params.get('project');
      if (proj === 'deocin10k') return 10000;
      if (proj === 'deocin' || proj === 'live2d') return 139;
      if (proj === 'sylphie10k') return 10000;
      if (proj === 'sylphie' || proj === 'original') return 1963;
      if (proj === 'mika10k') return 10000;
      if (proj === 'mika') return 745;
    }
    return initialStep;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Inspector State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Playback Ticker Hook
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(50, Math.floor(400 / playbackSpeed));
    const stepIncrement = totalSteps > 2000 ? Math.max(1, Math.floor(totalSteps / 200)) : 1;
    const timer = setInterval(() => {
      setCurrentStepState((prev) => {
        if (prev >= totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        return Math.min(totalSteps, prev + stepIncrement);
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, totalSteps]);

  // Current Step MicroStep Data
  const currentStepData = useMemo(() => {
    if (currentStep > 0 && currentStep <= project.steps.length) {
      return project.steps[currentStep - 1];
    }
    return null;
  }, [project.steps, currentStep]);

  // Dynamic Standalone SVG Source
  const standaloneSvgSource = useMemo(() => {
    const visibleMap: Record<LayerId, boolean> = {
      all: layers.all.visible,
      background: layers.background.visible,
      skin_body: layers.skin_body.visible,
      hair: layers.hair.visible,
      iris: layers.iris.visible,
      clothes: layers.clothes.visible,
      shadow_highlight: layers.shadow_highlight.visible,
      line_art: layers.line_art.visible,
    };
    return ExporterEngine.generateStandaloneSvg(project, currentStep, visibleMap);
  }, [project, currentStep, layers]);

  // Dynamic DOM Tree Structure
  const domTree = useMemo(() => {
    return ExporterEngine.extractDomTree(project.steps, currentStep);
  }, [project.steps, currentStep]);

  // Computed Stage Metadata for Header / Status
  const currentStage = useMemo(() => {
    const stage = project.stages.find((st) => currentStep >= st.startStep && currentStep <= st.endStep);
    if (stage) {
      const idx = project.stages.indexOf(stage) + 1;
      return {
        id: stage.id,
        index: idx,
        name: stage.name,
        title: stage.title || stage.name,
      };
    }
    if (currentStep <= 7) {
      return { id: 'stage-1', index: 1, name: '01初版草图', title: '01 初版草图' };
    } else if (currentStep <= 16) {
      return { id: 'stage-2', index: 2, name: '02局部细化', title: '02 局部细化' };
    } else if (currentStep <= 26) {
      return { id: 'stage-3', index: 3, name: '03对比修正', title: '03 对比修正' };
    } else if (currentStep <= 35) {
      return { id: 'stage-4', index: 4, name: '04虹膜笔触', title: '04 虹膜笔触' };
    } else {
      return { id: 'stage-5', index: 5, name: '05增光润部', title: '05 增光润部' };
    }
  }, [project.stages, currentStep]);

  // ----------------------------------------------------
  // Layer System Handlers
  // ----------------------------------------------------
  const toggleLayer = useCallback((id: LayerId) => {
    setLayers((prev) => {
      if (id === 'all') {
        const anyHidden = CONCRETE_LAYERS.some((key) => !prev[key]?.visible);
        const newVisible = anyHidden;
        const next: LayersState = {
          all: { id: 'all', visible: newVisible },
          background: { id: 'background', visible: newVisible },
          skin_body: { id: 'skin_body', visible: newVisible },
          hair: { id: 'hair', visible: newVisible },
          iris: { id: 'iris', visible: newVisible },
          clothes: { id: 'clothes', visible: newVisible },
          shadow_highlight: { id: 'shadow_highlight', visible: newVisible },
          line_art: { id: 'line_art', visible: newVisible },
        };
        return next;
      }

      const nextConcreteVisible = !prev[id].visible;
      const next: LayersState = {
        ...prev,
        [id]: { id, visible: nextConcreteVisible },
      };

      // Master 'all' is true only if all concrete layers are visible
      const allConcreteVisible = CONCRETE_LAYERS.every((key) =>
        key === id ? nextConcreteVisible : next[key]?.visible
      );
      next.all = { id: 'all', visible: allConcreteVisible };

      return next;
    });

    if (id === 'all') {
      setSoloLayer(null);
    } else {
      // If the individual layer being hidden was currently soloed, cancel solo mode
      setSoloLayer((prevSolo) => (prevSolo === id ? null : prevSolo));
    }
  }, []);

  const setLayerVisibility = useCallback((id: LayerId, visible: boolean) => {
    setLayers((prev) => {
      if (id === 'all') {
        return {
          all: { id: 'all', visible },
          background: { id: 'background', visible },
          skin_body: { id: 'skin_body', visible },
          hair: { id: 'hair', visible },
          iris: { id: 'iris', visible },
          clothes: { id: 'clothes', visible },
          shadow_highlight: { id: 'shadow_highlight', visible },
          line_art: { id: 'line_art', visible },
        };
      }

      const next: LayersState = {
        ...prev,
        [id]: { id, visible },
      };
      const allConcreteVisible = CONCRETE_LAYERS.every((key) =>
        key === id ? visible : next[key]?.visible
      );
      next.all = { id: 'all', visible: allConcreteVisible };
      return next;
    });

    if (!visible) {
      if (id === 'all') {
        setSoloLayer(null);
      } else {
        setSoloLayer((prevSolo) => (prevSolo === id ? null : prevSolo));
      }
    }
  }, []);

  const toggleSoloLayer = useCallback((id: LayerId) => {
    if (id === 'all') {
      setSoloLayer(null);
      return;
    }

    setSoloLayer((currentSolo) => {
      if (currentSolo === id) {
        return null;
      }
      return id;
    });

    // When soloing a concrete layer, ensure it is made visible
    setLayers((prev) => {
      if (prev[id].visible) return prev;
      const next: LayersState = {
        ...prev,
        [id]: { id, visible: true },
      };
      const allConcreteVisible = CONCRETE_LAYERS.every((key) =>
        key === id ? true : next[key].visible
      );
      next.all = { id: 'all', visible: allConcreteVisible };
      return next;
    });
  }, []);

  const resetAllLayers = useCallback(() => {
    setLayers(DEFAULT_LAYERS_STATE);
    setSoloLayer(null);
  }, []);

  const isLayerVisible = useCallback(
    (id: LayerId): boolean => {
      return layers[id]?.visible ?? true;
    },
    [layers]
  );

  const isLayerSoloed = useCallback(
    (id: LayerId): boolean => {
      return soloLayer !== null && soloLayer !== 'all' && soloLayer === id;
    },
    [soloLayer]
  );

  const getLayerFilterStyle = useCallback(
    (id: LayerId): React.CSSProperties => {
      const isVisible = layers[id]?.visible ?? true;

      // 1. Fully hidden layer
      if (!isVisible) {
        return {
          display: 'none',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        };
      }

      // 2. Solo / Focus mode active
      const isSoloActive = soloLayer !== null && soloLayer !== 'all';
      if (isSoloActive) {
        if (soloLayer === id) {
          return {
            opacity: 1,
            filter: 'none',
            pointerEvents: 'auto',
            transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          };
        } else {
          return {
            opacity: 0.15,
            filter: 'grayscale(85%)',
            pointerEvents: 'none',
            transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          };
        }
      }

      // 3. Normal visible layer
      return {
        opacity: 1,
        filter: 'none',
        pointerEvents: 'auto',
        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    },
    [layers, soloLayer]
  );

  // ----------------------------------------------------
  // Live2D Dissection & Explode View Handlers
  // ----------------------------------------------------
  const toggleLive2dExplode = useCallback(() => {
    setIsLive2dExploded((prev) => {
      const next = !prev;
      if (next) {
        setLive2dExplodeRatioState(1.0);
        setDissectionOffsets({
          hair_front: { x: 280, y: 35 },
          hair_back: { x: -120, y: 15 },
          clothes: { x: 0, y: 40 },
        });
      } else {
        setLive2dExplodeRatioState(0);
        setDissectionOffsets({});
      }
      return next;
    });
  }, []);

  const setLive2dExplode = useCallback((exploded: boolean) => {
    setIsLive2dExploded(exploded);
    if (exploded) {
      setLive2dExplodeRatioState(1.0);
      setDissectionOffsets({
        hair_front: { x: 280, y: 35 },
        hair_back: { x: -120, y: 15 },
        clothes: { x: 0, y: 40 },
      });
    } else {
      setLive2dExplodeRatioState(0);
      setDissectionOffsets({});
    }
  }, []);

  const setLive2dExplodeRatio = useCallback((ratio: number) => {
    const clamped = Math.max(0, Math.min(1, ratio));
    setLive2dExplodeRatioState(clamped);
    if (clamped <= 0.001) {
      setIsLive2dExploded(false);
      setDissectionOffsets({});
    } else {
      setIsLive2dExploded(true);
      setDissectionOffsets({
        hair_front: { x: Math.round(280 * clamped), y: Math.round(35 * clamped) },
        hair_back: { x: Math.round(-120 * clamped), y: Math.round(15 * clamped) },
        clothes: { x: 0, y: Math.round(40 * clamped) },
      });
    }
  }, []);

  const setPartOffset = useCallback((partId: string, offset: { x: number; y: number }) => {
    setDissectionOffsets((prev) => ({
      ...prev,
      [partId]: offset,
    }));
    setActiveDissectPart(partId);
    if (Math.abs(offset.x) > 3 || Math.abs(offset.y) > 3) {
      setIsLive2dExploded(true);
    }
  }, []);

  const resetDissectionOffsets = useCallback(() => {
    setIsLive2dExploded(false);
    setLive2dExplodeRatioState(0);
    setDissectionOffsets({});
    setActiveDissectPart(null);
  }, []);

  // ----------------------------------------------------
  // Canvas Transform Handlers
  // ----------------------------------------------------
  const panTo = useCallback((x: number, y: number) => {
    setTransform((prev) => ({ ...prev, x, y }));
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setTransform((prev) => calculatePan(prev, dx, dy));
  }, []);

  const zoomAt = useCallback((cursorX: number, cursorY: number, delta: number) => {
    setTransform((prev) => calculateZoomAt(prev, cursorX, cursorY, delta));
  }, []);

  const setZoom = useCallback((newScale: number) => {
    setTransform((prev) => ({
      ...prev,
      scale: clampZoom(newScale),
    }));
  }, []);

  const resetView = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM);
  }, []);

  const fitToScreen = useCallback((containerWidth?: number, containerHeight?: number) => {
    if (containerWidth && containerHeight) {
      setTransform(calculateFitToScreen(containerWidth, containerHeight));
    } else {
      // Default fallback viewport
      setTransform(calculateFitToScreen(900, 700));
    }
  }, []);

  const toggleGrid = useCallback(() => {
    setGridVisible((prev) => !prev);
  }, []);

  // ----------------------------------------------------
  // Playback & Timeline Handlers (M1 Stubs, ready for M2)
  // ----------------------------------------------------
  const setCurrentStep = useCallback(
    (step: number) => {
      const max = project?.steps?.length ?? totalSteps;
      const clamped = Math.max(0, Math.min(max, step));
      setCurrentStepState(clamped);
    },
    [project, totalSteps]
  );

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);
  const nextStep = useCallback(
    () => setCurrentStepState((s) => Math.min(totalSteps, s + 1)),
    [totalSteps]
  );
  const prevStep = useCallback(
    () => setCurrentStepState((s) => Math.max(0, s - 1)),
    []
  );

  // ----------------------------------------------------
  // Selection Handlers (M1 Stubs, ready for M3)
  // ----------------------------------------------------
  const selectNode = useCallback((id: string | null) => setSelectedNodeId(id), []);
  const hoverNode = useCallback((id: string | null) => setHoveredNodeId(id), []);

  const value: StudioContextType = useMemo(
    () => ({
      transform,
      gridVisible,
      layers,
      soloLayer,
      isLive2dExploded,
      live2dExplodeRatio,
      dissectionOffsets,
      activeDissectPart,
      currentStep,
      totalSteps,
      currentStepIndex: Math.max(0, currentStep - 1),
      currentStage,
      isPlaying,
      playbackSpeed,
      selectedNodeId,
      hoveredNodeId,
      project,
      setProject,
      currentStepData,
      standaloneSvgSource,
      domTree,
      toggleLive2dExplode,
      setLive2dExplode,
      setLive2dExplodeRatio,
      setPartOffset,
      resetDissectionOffsets,
      toggleLayer,
      setLayerVisibility,
      toggleSoloLayer,
      setSoloLayer,
      resetAllLayers,
      isLayerVisible,
      isLayerSoloed,
      getLayerFilterStyle,
      setTransform,
      panTo,
      panBy,
      zoomAt,
      setZoom,
      resetView,
      fitToScreen,
      toggleGrid,
      setGridVisible,
      setCurrentStep,
      setIsPlaying,
      setPlaybackSpeed,
      play,
      pause,
      togglePlay,
      nextStep,
      prevStep,
      selectNode,
      hoverNode,
    }),
    [
      transform,
      gridVisible,
      layers,
      soloLayer,
      isLive2dExploded,
      live2dExplodeRatio,
      dissectionOffsets,
      activeDissectPart,
      currentStep,
      totalSteps,
      currentStage,
      isPlaying,
      playbackSpeed,
      selectedNodeId,
      hoveredNodeId,
      project,
      currentStepData,
      standaloneSvgSource,
      domTree,
      toggleLive2dExplode,
      setLive2dExplode,
      setLive2dExplodeRatio,
      setPartOffset,
      resetDissectionOffsets,
      toggleLayer,
      setLayerVisibility,
      toggleSoloLayer,
      resetAllLayers,
      isLayerVisible,
      isLayerSoloed,
      getLayerFilterStyle,
      panTo,
      panBy,
      zoomAt,
      setZoom,
      resetView,
      fitToScreen,
      toggleGrid,
      setCurrentStep,
      play,
      pause,
      togglePlay,
      nextStep,
      prevStep,
      selectNode,
      hoverNode,
    ]
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
};

export const useStudio = (): StudioContextType => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
