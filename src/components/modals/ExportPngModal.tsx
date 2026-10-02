import React, { useState } from 'react';
import { X, Download, Image as ImageIcon, Check } from 'lucide-react';
import { useStudio } from '../../store/studioContext';
import { ExporterEngine } from '../../engine/exporter';

export interface ExportPngModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportPngModal: React.FC<ExportPngModalProps> = ({ isOpen, onClose }) => {
  const { standaloneSvgSource, currentStep } = useStudio();
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolutions = [
    { scale: 1 as const, label: '标准 (1x)', dims: '800 × 1000 px', desc: '适合网页展示与轻量预览' },
    { scale: 2 as const, label: '高清 (2x)', dims: '1600 × 2000 px', desc: '视网膜屏标准清晰度，推荐' },
    { scale: 4 as const, label: '超清 (4x)', dims: '3200 × 4000 px', desc: '印刷级与壁纸画质，极致细节' },
  ];

  const handleDownload = async () => {
    if (!standaloneSvgSource) return;
    setIsExporting(true);
    setErrorMsg(null);
    try {
      const filename = `anime-girl-step${currentStep}-${scale}x.png`;
      await ExporterEngine.downloadPng(standaloneSvgSource, filename, scale);
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || '导出 PNG 失败');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">导出高清 PNG 栅格图</h3>
              <p className="text-xs text-zinc-400">选择渲染倍率并导出位图</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <label className="text-xs font-semibold text-zinc-300 block">选择分辨率等级</label>
          <div className="space-y-2">
            {resolutions.map((res) => {
              const isSelected = scale === res.scale;
              return (
                <div
                  key={res.scale}
                  onClick={() => setScale(res.scale)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500/60 bg-amber-500/10 text-white'
                      : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{res.label}</span>
                      <span className="text-[11px] font-mono text-amber-400/90">{res.dims}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{res.desc}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <div className="text-xs text-red-400 bg-red-950/30 border border-red-800/60 rounded p-2">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-800 bg-zinc-950/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-lg shadow-amber-900/30 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? '正在渲染...' : '生成并下载 PNG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
