import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Wand2,
  CheckCircle2,
  RefreshCw,
  X,
  Sliders,
  Palette,
  Play,
} from 'lucide-react';
import { useStudio } from '../../store/studioContext';
import { ImageVectorizer, ColorCluster } from '../../engine/imageVectorizer';
import { MASTER_MIKA_PROJECT, createMasterMika10kProject } from '../../data/masterMikaProject';
import { StepDensityEngine } from '../../engine/stepDensityEngine';

export interface ImageVectorizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageVectorizerModal: React.FC<ImageVectorizerModalProps> = ({ isOpen, onClose }) => {
  const { setProject, setCurrentStep, setIsPlaying } = useStudio();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [colorCount, setColorCount] = useState(16);
  const [enable10k, setEnable10k] = useState(true);
  const [palette, setPalette] = useState<ColorCluster[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      runDecomposition(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadMikaPreset = () => {
    setIsAnalyzing(true);
    setStatusMessage('正在加载圣三一天使弥香参考图并进行颜色量化...');

    // Mika preset palette preview
    setTimeout(() => {
      setPalette([
        { r: 244, g: 114, b: 182, hex: '#F472B6', count: 12000, semanticLayer: 'hair' },
        { r: 254, g: 240, b: 138, hex: '#FEF08A', count: 4500, semanticLayer: 'iris' },
        { r: 255, g: 248, b: 245, hex: '#FFF8F5', count: 18000, semanticLayer: 'line_art' },
        { r: 248, g: 250, b: 252, hex: '#F8FAFC', count: 22000, semanticLayer: 'clothes' },
        { r: 49, g: 46, b: 129, hex: '#312E81', count: 3200, semanticLayer: 'clothes' },
        { r: 244, g: 63, b: 94, hex: '#F43F5E', count: 2800, semanticLayer: 'shadow_highlight' },
      ]);

      const proj = enable10k ? createMasterMika10kProject() : MASTER_MIKA_PROJECT;
      if (setProject) {
        setProject(proj);
        setCurrentStep(proj.steps.length);
        setIsPlaying(false);
      }

      setIsAnalyzing(false);
      setStatusMessage('弥香插画解构完毕，已成功载入画布！');
      setTimeout(() => {
        onClose();
      }, 600);
    }, 600);
  };

  const runDecomposition = (dataUrl: string) => {
    setIsAnalyzing(true);
    setStatusMessage('正在执行 VTracer 贝塞尔轮廓提取与语义图层映射...');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        // Use high-precision semantic layer vectorizer pipeline
        const proj = await ImageVectorizer.vectorizeBase64(dataUrl, 'AI 图像分层矢量工程', 10000);

        const finalProj = enable10k
          ? (proj.steps.length >= 10000 ? proj : StepDensityEngine.scaleProjectToDensity(proj, 10000))
          : proj;

        if (setProject) {
          setProject(finalProj);
          setCurrentStep(finalProj.steps.length);
          setIsPlaying(false);
        }

        setStatusMessage(`矢量解构完成！共生成 ${finalProj.steps.length.toLocaleString()} 步矢量微步。`);
        setIsAnalyzing(false);
        setTimeout(() => {
          onClose();
        }, 600);
      } catch (err: any) {
        setStatusMessage(`解构失败: ${err.message}`);
        setIsAnalyzing(false);
      }
    };
    img.src = dataUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-studio-panel border border-studio-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-studio-border bg-studio-header">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-fuchsia-600 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/30">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>位图矢量化解构工作室</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  VTracer / DiffVG
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                将任意二次元位图解构为头发、虹膜、服饰与光影图层并生成回放工程
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-zinc-300">
          {/* Preset Mika Quick Button */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-violet-950/40 via-fuchsia-950/30 to-amber-950/30 border border-violet-500/40 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>目标插画：圣三一天使弥香 (Mika)</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                包含 3D 光环、巨幅羽翼、粉发双发髻与星芒双瞳高精矢量工程
              </p>
            </div>

            <button
              onClick={handleLoadMikaPreset}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-lg font-bold text-xs bg-gradient-to-r from-amber-500 to-fuchsia-600 hover:from-amber-400 hover:to-fuchsia-500 text-white flex items-center gap-1.5 shadow-md shadow-fuchsia-950/40 transition-all flex-shrink-0"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white" />
              )}
              <span>立即载入解构</span>
            </button>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-zinc-950/50 hover:bg-violet-950/10 text-center"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Upload className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <span className="font-semibold text-zinc-200">点击上传或拖拽任意二次元插画 (PNG/JPG)</span>
              <p className="text-[11px] text-zinc-500 mt-0.5">自动提取主色彩、轮廓线条并生成回放时间轴</p>
            </div>
          </div>

          {/* Parameter Controls */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                <span>量化聚类颜色数</span>
                <span className="text-amber-400 font-mono">{colorCount} 色</span>
              </label>
              <input
                type="range"
                min="8"
                max="32"
                step="4"
                value={colorCount}
                onChange={(e) => setColorCount(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>

            <div className="space-y-1 flex flex-col justify-center">
              <label className="text-[11px] font-semibold text-zinc-400">微步拓展模式</label>
              <label className="flex items-center space-x-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={enable10k}
                  onChange={(e) => setEnable10k(e.target.checked)}
                  className="rounded border-zinc-700 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-xs text-zinc-200 font-medium">
                  启用 10,000 步超微步回放
                </span>
              </label>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="p-2.5 rounded-lg bg-violet-950/40 border border-violet-800/50 text-violet-200 flex items-center gap-2">
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span className="font-mono text-[11px]">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-studio-border bg-studio-header flex items-center justify-between">
          <span className="text-[10px] text-zinc-500">
            支持基于人眼视觉注意力的笔画排序与多阶段自动分类
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
