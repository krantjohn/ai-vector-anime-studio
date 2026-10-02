import React, { useState } from 'react';
import { X, Sparkles, Wand2, Copy, Check, Play, RefreshCw, Layers } from 'lucide-react';
import { useStudio } from '../../store/studioContext';
import { AiAnimeGenerator, AnimeGenerationOptions } from '../../engine/aiAnimeGenerator';

export interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiPromptModal: React.FC<AiPromptModalProps> = ({ isOpen, onClose }) => {
  const { setProject, setCurrentStep, setIsPlaying } = useStudio();
  const [activeTab, setActiveTab] = useState<'generate' | 'template'>('generate');
  const [promptText, setPromptText] = useState('原创粉毛金瞳少女，流光星蝶魔法少女希尔菲，浮空召唤姿态与星空洛丽塔法裙');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const presets = AiAnimeGenerator.getPresetPrompts();

  const handleStartGeneration = () => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    setProgressStep(1);

    // Simulated multi-step AI reasoning & vector code synthesis
    setTimeout(() => setProgressStep(2), 350);
    setTimeout(() => setProgressStep(3), 700);
    setTimeout(() => {
      setProgressStep(4);
      const parsedOptions = AiAnimeGenerator.parsePrompt(promptText);
      const newProject = AiAnimeGenerator.generateProject(parsedOptions);

      if (setProject) {
        setProject(newProject);
        // Start from step 0 and automatically start replay!
        setCurrentStep(0);
        setIsPlaying(true);
      }

      setTimeout(() => {
        setIsGenerating(false);
        setProgressStep(0);
        onClose();
      }, 500);
    }, 1100);
  };

  const handleCopySystemPrompt = () => {
    const text = AiAnimeGenerator.getSystemPromptForLlm();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const poseChips = [
    { label: '🦋 原创星辉流光', val: '原创粉毛金瞳少女 流光星蝶浮空召唤 洛丽塔法裙' },
    { label: '🌅 晨光伸懒腰', val: '晨光伸懒腰少女 居家白衬衫' },
    { label: '💃 露背礼服回眸', val: '高贵露背晚礼服回眸 紫花发饰' },
    { label: '🎾 活力网球挥拍', val: '活力网球运动少女 挥拍擦汗' },
    { label: '🕊️ 空灵悬浮精灵', val: '空灵悬浮抱膝精灵少女 赤足飘逸白裙' },
    { label: '👁️ 支配恶魔遮面', val: '玛奇玛单手遮面 金色同心圆魔眼' },
    { label: '🌊 初音双马尾泳装', val: '初音未来长双马尾泳装 手绘签名' },
    { label: '🌾 麦田花海兽耳', val: '田园花海金发兽耳少女 抚花微笑' },
    { label: '🖤 沙滩椅侧卧', val: '沙滩躺椅侧卧推墨镜 优雅黑金旗袍' },
    { label: '🍎 托腮捧苹果', val: '双手托腮捧苹果 强烈斜切光影' },
    { label: '🐺 狼耳战术立领', val: '银发狼耳战术立领 俯视冷酷猫瞳' },
    { label: '🎨 手绘墨线签名', val: '手绘墨线粉发原画 真实笔墨签名' },
  ];

  const tagChips = [
    { label: '粉毛', val: '粉毛' },
    { label: '金瞳', val: '金瞳' },
    { label: '少女身材', val: '少女身材' },
    { label: '原创设计', val: '原创设计' },
    { label: '银发', val: '银发' },
    { label: '金发', val: '金发' },
    { label: '赤瞳', val: '赤瞳' },
    { label: '蓝瞳', val: '蓝瞳' },
    { label: '猫耳', val: '猫耳' },
    { label: '双马尾', val: '双马尾' },
    { label: '水手服', val: '水手服' },
    { label: '天使羽翼', val: '天使羽翼' },
  ];

  const addTag = (tag: string) => {
    if (promptText.includes(tag)) return;
    setPromptText((prev) => (prev ? `${prev}，${tag}` : tag));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span>AI 提示词代码绘图工坊</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                  Prompt Studio
                </span>
              </h3>
              <p className="text-xs text-zinc-400">输入提示词，让 AI 编写 5 轮次矢量贝塞尔代码与笔画动画</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'generate'
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>智能提示词生成</span>
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'template'
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>导出大模型 Prompt 模板</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {activeTab === 'generate' ? (
            <>
              {/* Prompt Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>角色设定提示词 (Prompt)</span>
                  <span className="text-[11px] text-zinc-500 font-normal">支持中英文二次元属性</span>
                </label>
                <div className="relative">
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    rows={3}
                    placeholder="输入你想让 AI 绘制的角色，例如：银发赤瞳猫耳少女，水手服，呆毛，害羞腮红..."
                    className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all leading-relaxed resize-none font-sans"
                  />
                  {promptText && (
                    <button
                      onClick={() => setPromptText('')}
                      className="absolute top-3 right-3 text-[11px] text-zinc-500 hover:text-zinc-300"
                    >
                      清空
                    </button>
                  )}
                </div>
              </div>

              {/* Pose & Action Chips */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">经典动作与姿态预设（点击追加）</label>
                <div className="flex flex-wrap gap-1.5">
                  {poseChips.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => setPromptText(chip.val)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-violet-950/40 hover:bg-violet-900/60 text-violet-200 border border-violet-800/60 transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Chips */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">常用特征词标签（点击追加）</label>
                <div className="flex flex-wrap gap-1.5">
                  {tagChips.map((chip) => (
                    <button
                      key={chip.val}
                      onClick={() => addTag(chip.val)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-colors"
                    >
                      + {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset Gallery */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">精品预设样例（点击直接填入）</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.label}
                      onClick={() => setPromptText(preset.prompt)}
                      className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-violet-500/50 hover:bg-violet-950/10 cursor-pointer transition-all text-xs"
                    >
                      <div className="font-semibold text-zinc-200">{preset.label}</div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">{preset.prompt}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generation Progress Indicator */}
              {isGenerating && (
                <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/60 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-violet-300 font-semibold flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      {progressStep === 1 && 'AI 正在解析人物形象设定与动作姿态...'}
                      {progressStep === 2 && 'AI 正在规划 5 个演进阶段与墨线骨架...'}
                      {progressStep === 3 && 'AI 正在编写高精度矢量贝塞尔曲线 (DoG墨线为骨，纯净赛璐璐平涂)...'}
                      {progressStep === 4 && '生成完成！正在注入画布与回放引擎...'}
                    </span>
                    <span className="text-[11px] font-mono text-amber-400">
                      {Math.round((progressStep / 4) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400 h-full transition-all duration-300"
                      style={{ width: `${(progressStep / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* System Prompt Template Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">大模型 System Prompt 提示词规范</h4>
                  <p className="text-[11px] text-zinc-400">可将此模板直接复制发给 ChatGPT、Claude 或 Gemini 获得代码</p>
                </div>
                <button
                  onClick={handleCopySystemPrompt}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors shadow"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '已复制模板' : '一键复制提示词'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-300 leading-relaxed overflow-auto max-h-72 select-all">
                {AiAnimeGenerator.getSystemPromptForLlm()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/60">
          <span className="text-xs text-zinc-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>自动生成 5 阶段 · 43 微步 · 分层 SVG 矢量图</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleStartGeneration}
              disabled={isGenerating || !promptText.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white flex items-center gap-2 shadow-lg shadow-violet-900/40 transition-all disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isGenerating ? 'AI 正在绘制中...' : '✨ 开始 AI 代码矢量绘制'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
