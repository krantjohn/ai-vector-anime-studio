import React from 'react';
import {
  Layers,
  Image,
  User,
  Sparkles,
  Eye,
  EyeOff,
  Shirt,
  SunMedium,
  PenTool,
  RotateCcw,
  Target,
} from 'lucide-react';
import { useStudio } from '../../store/studioContext';
import { LayerId, LAYER_DEFINITIONS } from '../../types/studio';

const LAYER_ICON_MAP: Record<LayerId, React.ComponentType<{ className?: string }>> = {
  all: Layers,
  background: Image,
  skin_body: User,
  hair: Sparkles,
  iris: Eye,
  clothes: Shirt,
  shadow_highlight: SunMedium,
  line_art: PenTool,
};

const ORDERED_LAYERS: LayerId[] = [
  'all',
  'background',
  'skin_body',
  'hair',
  'iris',
  'clothes',
  'shadow_highlight',
  'line_art',
];

export interface LayerFilterPanelProps {
  className?: string;
}

export const LayerFilterPanel: React.FC<LayerFilterPanelProps> = ({ className = '' }) => {
  const {
    project,
    layers,
    soloLayer,
    toggleLayer,
    toggleSoloLayer,
    resetAllLayers,
    isLayerVisible,
    isLayerSoloed,
  } = useStudio();

  const layerStrokeCounts = React.useMemo(() => {
    if (!project?.steps || project.steps.length === 0) return null;
    const counts: Record<string, number> = { all: project.steps.length };
    for (const step of project.steps) {
      counts[step.layerId] = (counts[step.layerId] || 0) + 1;
    }
    return counts;
  }, [project]);

  const concreteLayers = ORDERED_LAYERS.filter((id) => id !== 'all');
  const visibleCount = concreteLayers.filter((id) => layers[id]?.visible).length;

  return (
    <div
      className={`bg-studio-panel border border-studio-border rounded-xl p-4 shadow-xl flex flex-col gap-3 ${className}`}
      data-testid="layer-filter-panel"
    >
      {/* Header with Title and Reset Action */}
      <div className="flex items-center justify-between pb-2 border-b border-studio-border">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-zinc-100">图层过滤</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-studio-card text-zinc-400 border border-studio-border">
            {visibleCount}/{concreteLayers.length} 可见
          </span>
        </div>
        <button
          onClick={resetAllLayers}
          title="重置所有图层显示并清除聚焦"
          className="text-xs px-2 py-1 rounded bg-studio-card hover:bg-zinc-800 text-zinc-300 hover:text-white border border-studio-border flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500"
          data-testid="reset-layers-button"
        >
          <RotateCcw className="w-3 h-3" />
          <span>重置</span>
        </button>
      </div>

      {/* Solo Mode Notification Banner */}
      {soloLayer && soloLayer !== 'all' && (
        <div
          className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 flex items-center justify-between text-xs text-amber-300 animate-fadeIn"
          data-testid="solo-mode-banner"
        >
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>
              已聚焦: <strong>{LAYER_DEFINITIONS[soloLayer].name}</strong> (背景已暗化 85%)
            </span>
          </div>
          <button
            onClick={() => toggleSoloLayer(soloLayer)}
            className="text-amber-400 hover:text-amber-200 underline font-medium focus:outline-none"
            data-testid="exit-solo-button"
          >
            退出聚焦
          </button>
        </div>
      )}

      {/* Layer List Cards */}
      <div className="flex flex-col gap-2" role="list">
        {ORDERED_LAYERS.map((layerId) => {
          const def = LAYER_DEFINITIONS[layerId];
          const Icon = LAYER_ICON_MAP[layerId];
          const visible = isLayerVisible(layerId);
          const solo = isLayerSoloed(layerId);
          const isMaster = layerId === 'all';

          return (
            <React.Fragment key={layerId}>
              {isMaster && (
                <div className="text-[11px] font-medium text-zinc-400 px-1 pt-1 flex items-center justify-between">
                  <span>主控图层</span>
                  <span className="text-[10px] text-zinc-500">点击全显/全隐</span>
                </div>
              )}
              <div
                role="listitem"
                data-testid={`layer-item-${layerId}`}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-150 ${
                  solo
                    ? 'bg-amber-950/20 border-amber-500/60 shadow-sm shadow-amber-500/10'
                    : isMaster
                    ? visible
                      ? 'bg-zinc-900 border-zinc-700/80 shadow-sm'
                      : 'bg-zinc-900/70 border-studio-border/80'
                    : !visible
                    ? 'bg-zinc-950/40 border-studio-border/60 opacity-50'
                    : 'bg-zinc-900/60 border-studio-border hover:bg-zinc-800/70 hover:border-zinc-700'
                }`}
              >
                {/* Left: Swatch, Icon & Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: def.color }}
                    title={`颜色标记: ${def.color}`}
                  />
                  <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-zinc-200 truncate">
                        {def.name}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.2 rounded bg-studio-card text-zinc-400 border border-studio-border font-mono"
                        title={`${layerStrokeCounts?.[layerId] ?? def.defaultCount} 个图元笔触`}
                      >
                        {layerStrokeCounts?.[layerId] ?? def.defaultCount} 笔
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 truncate max-w-[170px]" title={def.description}>
                      {def.description}
                    </span>
                  </div>
                </div>

                {/* Right: Actions (Eye Visibility Toggle + Solo Focus Toggle) */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {/* Solo / Focus Mode Toggle (Only on concrete layers) */}
                  {!isMaster ? (
                    <button
                      onClick={() => toggleSoloLayer(layerId)}
                      title={solo ? '退出聚焦模式' : '独占聚焦此图层 (背景图层暗化 85%)'}
                      aria-label={`聚焦 ${def.name}`}
                      aria-pressed={solo}
                      data-testid={`solo-toggle-${layerId}`}
                      className={`p-1.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        solo
                          ? 'text-amber-400 bg-amber-500/20 ring-1 ring-amber-500/40'
                          : 'text-zinc-500 hover:text-amber-300 hover:bg-zinc-800'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="w-6" /> /* Spacing alignment */
                  )}

                  {/* Visibility Eye Toggle */}
                  <button
                    onClick={() => toggleLayer(layerId)}
                    title={visible ? '点击隐藏图层' : '点击显示图层'}
                    aria-label={`切换 ${def.name} 显隐`}
                    aria-pressed={visible}
                    data-testid={`visibility-toggle-${layerId}`}
                    className={`p-1.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      visible
                        ? 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900'
                    }`}
                  >
                    {visible ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </button>
                </div>
              </div>
              {isMaster && (
                <div className="border-t border-studio-border my-1 flex items-center justify-between px-1">
                  <span className="text-[11px] font-medium text-zinc-400">细分图层</span>
                  <span className="text-[10px] text-zinc-500">支持独立显隐与聚焦</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
