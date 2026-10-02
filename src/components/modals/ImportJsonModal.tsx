import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle2, FileJson } from 'lucide-react';
import { useStudio } from '../../store/studioContext';
import { ExporterEngine } from '../../engine/exporter';

export interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportJsonModal: React.FC<ImportJsonModalProps> = ({ isOpen, onClose }) => {
  const { setProject, setCurrentStep } = useStudio();
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      setErrorMsg(null);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const result = ExporterEngine.validateProjectJson(jsonText);
    if (!result.success || !result.data) {
      setErrorMsg(result.error || '数据校验失败');
      return;
    }

    if (setProject) {
      setProject(result.data);
      setCurrentStep(result.data.steps.length);
      setSuccessMsg(`成功导入角色工程: "${result.data.title}"，共 ${result.data.steps.length} 步！`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">导入二次元演进 JSON 数据</h3>
              <p className="text-xs text-zinc-400">支持导入 AI 生成的自定义工程文件</p>
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
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300">粘贴 JSON 内容或上传文件</label>
            <label className="cursor-pointer text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-violet-400" />
              <span>选择 .json 文件</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setErrorMsg(null);
            }}
            placeholder='{ "title": "自定义角色", "stages": [...], "steps": [...] }'
            className="w-full h-56 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-300 leading-relaxed focus:border-violet-500 focus:outline-none resize-none"
          />

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-800/60 rounded p-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/60 rounded p-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
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
            onClick={handleImport}
            disabled={!jsonText.trim()}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5 shadow-lg shadow-violet-900/30 transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>确认导入</span>
          </button>
        </div>
      </div>
    </div>
  );
};
