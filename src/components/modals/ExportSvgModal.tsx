import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode } from 'lucide-react';
import { useStudio } from '../../store/studioContext';
import { ExporterEngine } from '../../engine/exporter';

export interface ExportSvgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportSvgModal: React.FC<ExportSvgModalProps> = ({ isOpen, onClose }) => {
  const { standaloneSvgSource, currentStep, currentStage } = useStudio();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (standaloneSvgSource && navigator.clipboard) {
      navigator.clipboard.writeText(standaloneSvgSource).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (standaloneSvgSource) {
      const filename = `anime-girl-step${currentStep}.svg`;
      ExporterEngine.downloadSvg(standaloneSvgSource, filename);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">导出独立 SVG 矢量文件</h3>
              <p className="text-xs text-zinc-400">
                当前快照: {currentStage?.title || '完成版'} (第 {currentStep} 步)
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
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            导出的 SVG 包含标准的 XML 命名空间、独立渐变色定义（Defs）、800×1000 规范尺寸及当前处于显示状态的图层结构，可直接导入 Figma、Illustrator、Inkscape 或浏览器中无损查看。
          </p>

          <div className="relative">
            <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-[11px] font-mono text-zinc-300 max-h-64 overflow-auto leading-relaxed select-all">
              {standaloneSvgSource || '<!-- SVG 生成中... -->'}
            </pre>
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors shadow"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制代码' : '复制代码'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800 bg-zinc-950/50">
          <span className="text-[11px] text-zinc-500 font-mono">
            {standaloneSvgSource ? `${(standaloneSvgSource.length / 1024).toFixed(1)} KB` : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5 shadow-lg shadow-violet-900/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 .svg 文件</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
