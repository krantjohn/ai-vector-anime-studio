import React from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Grid, 
  Download, 
  Image as ImageIcon, 
  Upload, 
  HelpCircle,
  Eye,
  Wand2,
  UnfoldVertical,
} from 'lucide-react';
import { useStudio } from '../../store/studioContext';
import { createMasterMikaBaseProject, createMasterMika10kProject } from '../../data/masterMikaProject';
import { createSylphieProject } from '../../data/sylphieProject';
import { createDeocinProject } from '../../data/deocinProject';
import { DEFAULT_ANIME_PROJECT } from '../../data/defaultAnimeProject';
import { StepDensityEngine } from '../../engine/stepDensityEngine';
import { AiAnimeGenerator } from '../../engine/aiAnimeGenerator';

export interface HeaderProps {
  onOpenAiPrompt?: () => void;
  onOpenVectorizer?: () => void;
  onOpenExportSvg?: () => void;
  onOpenExportPng?: () => void;
  onOpenImportJson?: () => void;
  onOpenShortcuts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAiPrompt,
  onOpenVectorizer,
  onOpenExportSvg,
  onOpenExportPng,
  onOpenImportJson,
  onOpenShortcuts,
}) => {
  const { 
    gridVisible, 
    toggleGrid, 
    resetView, 
    currentStepIndex,
    totalSteps,
    currentStage,
    soloLayer,
    isLive2dExploded,
    toggleLive2dExplode,
    project,
    setProject,
    setCurrentStep,
    setIsPlaying,
  } = useStudio();

  return (
    <header className="h-14 min-h-[56px] bg-studio-header border-b border-studio-border px-4 flex items-center justify-between z-20 select-none">
      {/* Brand & Project Status */}
      <div className="flex items-center space-x-2.5 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-violet-900/30 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-white text-sm md:text-base">
                AI Vector Anime Studio
              </span>
              <span className="text-[10px] bg-violet-950 text-violet-300 border border-violet-800 px-1.5 py-0.5 rounded font-mono">
                v1.0
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center space-x-1.5">
              <span className="hidden sm:inline">二次元代码矢量演进平台</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-amber-400 font-medium truncate max-w-[150px] sm:max-w-none">
                {project?.title?.includes('德奥欣') || project?.title?.includes('Deocin') || project?.title?.includes('Live2D')
                  ? '幻梦航标 · 德奥欣 (Live2D拆件)'
                  : project?.title?.includes('希尔菲') || project?.title?.includes('Sylphie') || project?.title?.includes('星辉蝶愿')
                  ? '星辉蝶愿 · 希尔菲 (原创粉毛金瞳)'
                  : project?.title?.includes('Penia') || project?.title?.includes('手绘墨线')
                  ? '手绘墨线 · Penia粉发原画'
                  : project?.title?.includes('伸懒腰') || project?.title?.includes('晨光舒展')
                  ? '晨光舒展 · 伸懒腰少女'
                  : project?.title?.includes('露背') || project?.title?.includes('晚礼服') || project?.title?.includes('回眸')
                  ? '高贵晚宴 · 露背礼服回眸'
                  : project?.title?.includes('网球') || project?.title?.includes('活力')
                  ? '青春活力 · 网球运动少女'
                  : project?.title?.includes('悬浮') || project?.title?.includes('抱膝') || project?.title?.includes('精灵')
                  ? '空灵幻梦 · 悬浮抱膝精灵'
                  : project?.title?.includes('遮面') || project?.title?.includes('玛奇玛') || project?.title?.includes('支配')
                  ? '支配恶魔 · 单手遮面魔眼'
                  : project?.title?.includes('初音') || project?.title?.includes('Miku')
                  ? '清爽夏日 · 初音双马尾泳装'
                  : project?.title?.includes('兽耳') || project?.title?.includes('花海') || project?.title?.includes('田园')
                  ? '田园花海 · 金发兽耳少女'
                  : project?.title?.includes('妃姬') || project?.title?.includes('Kisaki')
                  ? '玄龙门主 · 龙华妃姬'
                  : project?.title?.includes('普拉娜') || project?.title?.includes('Plana')
                  ? '什亭之匣 · 普拉娜'
                  : project?.title?.includes('白子') || project?.title?.includes('Shiroko')
                  ? '阿拜多斯 · 砂狼白子'
                  : project?.title?.includes('苹果') || project?.title?.includes('Rico')
                  ? '光影交错 · 苹果少女'
                  : project?.title?.includes('弥香')
                  ? '圣园弥香 · 天使之翼'
                  : project?.title?.includes('吸血鬼')
                  ? '银发赤瞳吸血鬼少女'
                  : project?.title?.includes('赛博朋克')
                  ? '赛博朋克猫耳娘'
                  : project?.title?.includes('巫女')
                  ? '黑长直和服巫女'
                  : project?.title?.includes('魔法少女')
                  ? '星之魔法少女'
                  : '紫发金瞳少女'}
              </span>
              <select
                aria-label="选择演示作品"
                value={
                  project?.title?.includes('德奥欣') || project?.title?.includes('Deocin') || project?.title?.includes('Live2D')
                    ? 'deocin'
                    : project?.title?.includes('希尔菲') || project?.title?.includes('Sylphie') || project?.title?.includes('星辉蝶愿')
                    ? 'sylphie'
                    : project?.title?.includes('Penia') || project?.title?.includes('手绘墨线')
                    ? 'penia'
                    : project?.title?.includes('伸懒腰') || project?.title?.includes('晨光舒展')
                    ? 'stretch'
                    : project?.title?.includes('露背') || project?.title?.includes('晚礼服') || project?.title?.includes('回眸')
                    ? 'glance'
                    : project?.title?.includes('网球') || project?.title?.includes('活力')
                    ? 'tennis'
                    : project?.title?.includes('悬浮') || project?.title?.includes('抱膝') || project?.title?.includes('精灵')
                    ? 'ethereal'
                    : project?.title?.includes('遮面') || project?.title?.includes('玛奇玛') || project?.title?.includes('支配')
                    ? 'makima'
                    : project?.title?.includes('初音') || project?.title?.includes('Miku')
                    ? 'miku'
                    : project?.title?.includes('兽耳') || project?.title?.includes('花海') || project?.title?.includes('田园')
                    ? 'foxear'
                    : project?.title?.includes('妃姬') || project?.title?.includes('Kisaki')
                    ? 'kisaki'
                    : project?.title?.includes('普拉娜') || project?.title?.includes('Plana')
                    ? 'plana'
                    : project?.title?.includes('白子') || project?.title?.includes('Shiroko')
                    ? 'shiroko'
                    : project?.title?.includes('苹果') || project?.title?.includes('Rico')
                    ? 'rico'
                    : project?.title?.includes('吸血鬼')
                    ? 'vampire'
                    : project?.title?.includes('赛博朋克')
                    ? 'cyberpunk'
                    : project?.title?.includes('巫女')
                    ? 'shrine'
                    : project?.title?.includes('魔法少女')
                    ? 'magical'
                    : project?.title?.includes('弥香')
                    ? 'mika'
                    : 'default'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'deocin') {
                    setProject?.(createDeocinProject());
                  } else if (val === 'sylphie') {
                    setProject?.(createSylphieProject());
                  } else if (val === 'penia') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '手绘墨线 Penia 粉发原画' }));
                  } else if (val === 'stretch') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '晨光舒展 伸懒腰少女 居家衬衫' }));
                  } else if (val === 'glance') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '高贵晚宴 露背礼服回眸 紫花发饰' }));
                  } else if (val === 'tennis') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '青春活力 网球运动少女 挥拍擦汗' }));
                  } else if (val === 'ethereal') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '空灵幻梦 悬浮抱膝精灵 赤足白裙' }));
                  } else if (val === 'makima') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '支配恶魔 单手遮面狂气魔眼 玛奇玛' }));
                  } else if (val === 'miku') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '清爽夏日 初音双马尾泳装原画' }));
                  } else if (val === 'foxear') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '田园花海 金发兽耳抚花少女 麻花辫' }));
                  } else if (val === 'kisaki') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '玄龙门主 龙华妃姬 沙滩椅' }));
                  } else if (val === 'plana') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '什亭之匣 普拉娜 泳装海滩' }));
                  } else if (val === 'shiroko') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '阿拜多斯 砂狼白子·恐怖 狼耳' }));
                  } else if (val === 'rico') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '光影交错 苹果少女 蓝发蕾丝' }));
                  } else if (val === 'mika') {
                    setProject?.(createMasterMikaBaseProject());
                  } else if (val === 'vampire') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '银发赤瞳吸血鬼少女' }));
                  } else if (val === 'cyberpunk') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '赛博朋克猫耳机械娘' }));
                  } else if (val === 'shrine') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '黑长直和服巫女' }));
                  } else if (val === 'magical') {
                    setProject?.(AiAnimeGenerator.generateProject({ prompt: '星之魔法少女' }));
                  } else {
                    setProject?.(DEFAULT_ANIME_PROJECT);
                  }
                }}
                className="inline-block max-w-[210px] truncate bg-zinc-900/90 border border-violet-600/70 rounded px-2 py-0.5 text-[11px] text-amber-300 focus:outline-none focus:border-violet-400 font-sans ml-1.5 cursor-pointer shadow-sm shadow-violet-950/50"
              >
                <option value="deocin">✨ 幻梦航标 · 德奥欣 (Live2D 拆件级 · 水手服紫发金瞳)</option>
                <option value="sylphie">🦋 星辉蝶愿 · 希尔菲 (原创粉毛金瞳 · 流光星蝶浮空少女)</option>
                <option value="stretch">🌅 晨光舒展 · 伸懒腰少女 (仰头舒展晨曦治愈姿态)</option>
                <option value="glance">💃 高贵晚宴 · 露背礼服回眸 (优雅大露背侧颜高贵姿态)</option>
                <option value="tennis">🎾 青春活力 · 网球少女 (挥拍擦汗红白短裙跃动)</option>
                <option value="ethereal">🕊️ 空灵幻梦 · 悬浮抱膝精灵 (失重白裙赤足陪伴小幽灵)</option>
                <option value="makima">👁️ 支配恶魔 · 单手遮面魔眼 (玛奇玛单手遮脸同心圆瞳)</option>
                <option value="miku">🌊 清爽夏日 · 初音双马尾泳装 (及膝长双马尾手绘签名)</option>
                <option value="foxear">🌾 田园花海 · 金发兽耳少女 (抚弄花瓣麻花辫暖阳田园)</option>
                <option value="kisaki">🖤 玄龙门主 · 龙华妃姬 (沙滩躺椅侧卧推墨镜)</option>
                <option value="plana">🌊 什亭之匣 · 普拉娜 (海滩泳装荷叶边微俯身)</option>
                <option value="shiroko">🐺 阿拜多斯 · 砂狼白子·恐怖 (狼耳战术立领俯视)</option>
                <option value="rico">🍎 光影交错 · 苹果少女 (双手捧苹果斜切强烈光影)</option>
                <option value="penia">🎨 手绘墨线 · Penia 粉发原画 (真实日系漫画墨线笔触)</option>
                <option value="mika">🌸 圣园弥香 · 天使之翼 (圣三一立体光环与羽翼)</option>
                <option value="vampire">🧛 银发赤瞳吸血鬼少女 (暗夜蝠翼与哥特洛丽塔)</option>
                <option value="cyberpunk">🐱 赛博朋克猫耳机械娘 (霓虹全息六边形机能战衣)</option>
                <option value="shrine">🌸 极黑长直和服巫女 (神道祈愿千早白衣绯袴)</option>
                <option value="magical">💫 星之双马尾魔法少女 (星辰双马尾星光权杖)</option>
                <option value="default">💜 紫发金瞳少女 (43 步基础线稿原型)</option>
              </select>

              {/* 1-Click Live2D Flagship Deocin Recommendation Pill */}
              <button
                type="button"
                onClick={() => setProject?.(createDeocinProject())}
                title="1键载入Live2D拆件旗舰杰作: 幻梦航标 · 德奥欣 (水手服紫发金瞳 · 完整闭合头骨脸模与独立可拆前发)"
                aria-label="Live2D推荐: 德奥欣"
                className="hidden sm:inline-flex items-center gap-1 ml-1.5 px-2 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-teal-500/20 hover:from-amber-500/30 hover:to-teal-500/30 border border-amber-500/40 text-[11px] text-amber-300 hover:text-amber-100 transition-colors cursor-pointer shadow-sm shadow-amber-950/40"
              >
                <span>✨</span>
                <span className="font-medium">Live2D推荐: 德奥欣</span>
              </button>

              {/* 1-Click Original Masterpiece Recommendation Pill */}
              <button
                type="button"
                onClick={() => setProject?.(createSylphieProject())}
                title="1键快速载入原创杰作: 星辉蝶愿 · 希尔菲 (粉毛金瞳少女身材 · 1963真实矢量步)"
                aria-label="原创推荐: 希尔菲"
                className="hidden md:inline-flex items-center gap-1 ml-1.5 px-2 py-0.5 rounded bg-gradient-to-r from-pink-500/20 to-amber-500/20 hover:from-pink-500/30 hover:to-amber-500/30 border border-pink-500/40 text-[11px] text-pink-300 hover:text-pink-100 transition-colors cursor-pointer shadow-sm shadow-pink-950/40"
              >
                <span>🦋</span>
                <span className="font-medium">原创推荐: 希尔菲</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Central Indicator Badge */}
      <div className="hidden xl:flex items-center space-x-3 bg-studio-bg/80 border border-studio-border px-3 py-1 rounded-full text-xs flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-zinc-300 font-medium">
            {currentStage?.title || '01 初版草图'}
          </span>
          <span className="text-zinc-500 font-mono">
            ({currentStepIndex + 1}/{totalSteps || 43} 步)
          </span>
          {totalSteps > 100 && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono flex items-center gap-1">
              <span>💎</span>
              <span>亚像素高精矢量 (geometricPrecision)</span>
            </span>
          )}
        </div>
        {soloLayer && (
          <div className="flex items-center space-x-1 pl-2 border-l border-zinc-700 text-amber-300 font-medium">
            <Eye className="w-3 h-3" />
            <span>聚焦图层: {soloLayer}</span>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button
          onClick={toggleGrid}
          title="切换参考网格 (G)"
          aria-label="切换参考网格"
          aria-pressed={gridVisible}
          className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1 border transition-colors ${
            gridVisible
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span className="hidden lg:inline">网格</span>
        </button>

        <button
          onClick={resetView}
          title="重置视图 / 适应屏幕 (R/1)"
          aria-label="重置视图"
          className="p-2 rounded-lg text-xs font-medium flex items-center space-x-1 bg-zinc-800/60 text-zinc-400 border border-zinc-700 hover:text-zinc-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden lg:inline">重置</span>
        </button>

        <button
          onClick={toggleLive2dExplode}
          title="切换 Live2D 拆解视图 (移开前发露出完整闭合脸模与双眼)"
          aria-label="Live2D 拆解视图"
          aria-pressed={isLive2dExploded}
          data-testid="header-live2d-explode-button"
          className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
            isLive2dExploded
              ? 'bg-gradient-to-r from-amber-500/30 to-pink-500/30 text-amber-200 border-amber-500/60 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400/40'
              : 'bg-zinc-800/60 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <UnfoldVertical className="w-4 h-4 text-amber-400" />
          <span className="hidden lg:inline">{isLive2dExploded ? 'Live2D 拆解中' : 'Live2D 拆解'}</span>
        </button>

        <div className="h-4 w-[1px] bg-zinc-800 mx-1 hidden sm:block" />

        <button
          onClick={onOpenVectorizer}
          title="位图矢量化解构工作室 (VTracer / DiffVG)"
          aria-label="位图矢量化"
          className="p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 bg-gradient-to-r from-amber-600/30 to-fuchsia-600/30 text-amber-200 border border-amber-500/40 hover:bg-amber-600/40 transition-colors"
        >
          <Wand2 className="w-4 h-4 text-amber-300" />
          <span className="hidden xl:inline">位图矢量化</span>
        </button>

        <button
          onClick={onOpenAiPrompt}
          title="AI 提示词代码绘图"
          aria-label="AI 提示词绘图"
          className="p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white shadow-md shadow-violet-900/30 border border-violet-400/30 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span className="hidden md:inline">AI 提示词绘图</span>
        </button>

        <button
          onClick={onOpenImportJson}
          title="导入演进 JSON 数据"
          aria-label="导入 JSON 数据"
          className="p-2 rounded-lg text-xs font-medium flex items-center space-x-1 bg-zinc-800/60 text-zinc-300 border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <Upload className="w-4 h-4 text-violet-400" />
          <span className="hidden xl:inline">导入</span>
        </button>

        <button
          onClick={onOpenExportSvg}
          title="导出独立 SVG 矢量图"
          aria-label="导出 SVG"
          className="p-2 rounded-lg text-xs font-medium flex items-center space-x-1 bg-violet-600/30 text-violet-200 border border-violet-500/40 hover:bg-violet-600/50 transition-colors"
        >
          <Download className="w-4 h-4 text-violet-300" />
          <span className="hidden sm:inline">导出 SVG</span>
        </button>

        <button
          onClick={onOpenExportPng}
          title="导出高清 PNG 图片"
          aria-label="导出 PNG"
          className="p-2 rounded-lg text-xs font-medium flex items-center space-x-1 bg-amber-600/30 text-amber-200 border border-amber-500/40 hover:bg-amber-600/50 transition-colors"
        >
          <ImageIcon className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">导出 PNG</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          title="键盘快捷键与帮助"
          aria-label="快捷键帮助"
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
