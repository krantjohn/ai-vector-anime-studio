import React, { useState } from 'react';
import {
  Code2,
  FileCode,
  FolderTree,
  Layers,
  Copy,
  Check,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useStudio } from '../../store/studioContext';
import { LayerFilterPanel } from '../layers/LayerFilterPanel';
import { AiChatPanel } from '../chat/AiChatPanel';

export type InspectorTabId = 'layers' | 'chat' | 'diff' | 'source' | 'dom';

export const InspectorTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InspectorTabId>('layers');
  const [copied, setCopied] = useState(false);
  const { currentStep, soloLayer, currentStepData, standaloneSvgSource, domTree, currentStage } = useStudio();

  const handleCopy = () => {
    if (standaloneSvgSource && navigator.clipboard) {
      navigator.clipboard.writeText(standaloneSvgSource).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: InspectorTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'layers', label: '图层过滤', icon: Layers },
    { id: 'chat', label: 'AI 创意工坊', icon: Sparkles },
    { id: 'diff', label: '本次代码变化', icon: Code2 },
    { id: 'source', label: '完整 SVG 源码', icon: FileCode },
    { id: 'dom', label: 'DOM 树', icon: FolderTree },
  ];

  return (
    <div className="flex flex-col h-full bg-studio-panel select-none overflow-hidden" data-testid="inspector-tabs">
      {/* Tab Headers */}
      <div className="flex items-center border-b border-studio-border bg-studio-panel px-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`inspector-tab-${tab.id}`}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-violet-500 text-violet-300 bg-violet-500/10 font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.id === 'chat' ? 'text-amber-400' : ''}`} />
              <span>{tab.label}</span>
              {tab.id === 'layers' && soloLayer && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'layers' && (
          <div className="h-full">
            <LayerFilterPanel />
          </div>
        )}

        {/* AI Chat Copilot Tab */}
        {activeTab === 'chat' && (
          <div className="h-full -m-4">
            <AiChatPanel onSwitchTab={(tab) => setActiveTab(tab)} />
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            {/* Live Code Banner Header */}
            <div className="space-y-1 pb-2 border-b border-studio-border">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-xs font-sans">当前微步代码增量 (Live Diff)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  +{currentStepData?.addedLines?.length || 1} 行新增
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 font-sans font-medium">
                {currentStepData?.title || '正在加载笔触微步...'}
              </p>
              <p className="text-[10px] text-zinc-400 font-sans">
                {currentStepData?.description || '阶段性矢量图元更新'}
              </p>
            </div>

            {/* XML Incremental Patch View */}
            <div className="bg-zinc-950/80 rounded-lg p-3 border border-zinc-800 space-y-1">
              <div className="text-[11px] text-zinc-400 pb-1 mb-1 border-b border-zinc-800/80 flex items-center justify-between">
                <span>节点变更: &lt;{currentStepData?.layerId || 'layer'}&gt;</span>
                <span className="text-violet-400">{currentStepData?.elementId || 'node'}</span>
              </div>
              {currentStepData?.addedLines && currentStepData.addedLines.length > 0 ? (
                currentStepData.addedLines.map((line: string, idx: number) => (
                  <div key={idx} className="text-emerald-400 bg-emerald-950/20 px-1 rounded break-all whitespace-pre-wrap leading-relaxed">
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-emerald-400 bg-emerald-950/20 px-1 rounded break-all whitespace-pre-wrap leading-relaxed">
                  + {currentStepData?.xmlPatch || '<path ... />'}
                </div>
              )}
            </div>

            {/* Precision Geometry & Spline Metrics */}
            {(() => {
              const xml = currentStepData?.xmlPatch || '';
              const fillMatch = xml.match(/fill="([^"]+)"/);
              const strokeMatch = xml.match(/stroke="([^"]+)"/);
              const dMatch = xml.match(/d="([^"]+)"/);
              const fill = fillMatch ? fillMatch[1] : null;
              const stroke = strokeMatch ? strokeMatch[1] : null;
              const d = dMatch ? dMatch[1] : '';
              const bezierCount = d ? (d.match(/[csqtCSQT]/g) || []).length : 0;

              return (
                <div className="p-2.5 rounded bg-zinc-900/70 border border-zinc-800 text-[11px] font-sans space-y-1.5">
                  <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>📐</span>
                      <span>几何曲线精度分析</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                      亚像素 0.1 精度
                    </span>
                  </div>

                  {fill && !fill.startsWith('url(') && (
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-zinc-400 font-sans">填充色彩:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded border border-zinc-700 inline-block shadow-sm"
                          style={{ backgroundColor: fill }}
                        />
                        <span className="text-zinc-200">{fill}</span>
                      </div>
                    </div>
                  )}

                  {bezierCount > 0 && (
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-zinc-400 font-sans">贝塞尔拟合阶数:</span>
                      <span className="text-amber-400">{bezierCount} 个控制节点</span>
                    </div>
                  )}

                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-zinc-400 font-sans">渲染抗锯齿引擎:</span>
                    <span className="text-emerald-400">geometricPrecision</span>
                  </div>
                </div>
              );
            })()}

            {/* Metadata Summary */}
            <div className="p-2.5 rounded bg-zinc-900/50 border border-zinc-800 text-[11px] font-sans text-zinc-400 space-y-1">
              <div className="flex justify-between">
                <span>所属创作阶段:</span>
                <span className="text-amber-400 font-medium">{currentStage?.title || '01 初版草图'}</span>
              </div>
              <div className="flex justify-between">
                <span>目标渲染图层:</span>
                <span className="text-violet-400 font-medium">{currentStepData?.layerId || 'line_art'}</span>
              </div>
              <div className="flex justify-between">
                <span>累积 DOM 节点:</span>
                <span className="text-zinc-300 font-mono">{currentStep} 个图元</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'source' && (
          <div className="flex flex-col h-full gap-2 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-studio-border">
              <span className="text-zinc-400 text-xs font-sans">当前快照独立 SVG 源码</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors border border-zinc-700 font-sans"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制完整代码'}</span>
              </button>
            </div>
            <pre className="flex-1 bg-zinc-950/90 rounded-lg p-3 border border-zinc-800 text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed select-text text-[11px]">
              <code>{standaloneSvgSource}</code>
            </pre>
          </div>
        )}

        {activeTab === 'dom' && (
          <div className="flex flex-col gap-2 font-mono text-xs">
            <div className="pb-2 border-b border-studio-border text-zinc-400 text-xs font-sans">
              SVG 结构树与图元层级关系 ({domTree?.length || 0} 个节点)
            </div>
            <div className="space-y-1 text-zinc-300">
              <div className="text-violet-400">&lt;svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"&gt;</div>
              <div className="pl-3 border-l border-zinc-800 space-y-1.5">
                <div className="text-zinc-500">&lt;!-- 辅助与底衬图层 --&gt;</div>
                <div className="text-amber-300/80">&lt;rect id="bg-fill" width="800" height="1000" /&gt;</div>
                
                {(domTree || []).map((node) => (
                  <div key={node.id} className="pl-2 flex items-center justify-between group hover:bg-zinc-800/30 py-0.5 rounded px-1">
                    <span className="text-zinc-300">
                      &lt;<span className="text-sky-400">{node.tag}</span> <span className="text-violet-300">id</span>="<span className="text-emerald-300">{node.id}</span>" /&gt;
                    </span>
                    <span className="text-[10px] text-zinc-600 font-sans group-hover:text-zinc-400">
                      图层: {node.layerId}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-violet-400">&lt;/svg&gt;</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
