import React from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';

export interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      group: '画布与视图导航',
      items: [
        { key: '拖拽 / 中键', desc: '画布任意方向自由平移 (Pan)' },
        { key: '滚轮 (Wheel)', desc: '以光标为中心平滑无级缩放 (Zoom)' },
        { key: '0', desc: '适应屏幕 (Fit to Screen)' },
        { key: '1', desc: '重置 100% 原始比例 (1:1)' },
        { key: '+ / -', desc: '步进放大 / 缩小' },
        { key: 'G', desc: '显隐 4×6 动漫比例参考网格' },
      ],
    },
    {
      group: '回放与时间轴控制',
      items: [
        { key: 'Space (空格)', desc: '播放 / 暂停绘制过程回放' },
        { key: '← / →', desc: '上一步 / 下一步笔画演进' },
        { key: '01 ~ 05 按钮', desc: '快速跳转到对应阶段起始步' },
        { key: '倍速切换', desc: '0.5x, 1x, 2x, 4x 播放速率' },
      ],
    },
    {
      group: '图层与代码联动',
      items: [
        { key: '图层标签点击', desc: '显隐对应图层 (全图/发型/虹膜/服饰/光影/线稿)' },
        { key: 'Solo (独占)', desc: '只显示当前图层，其余淡化' },
        { key: '代码 Diff', desc: '实时高亮当前步骤的 XML 增量' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">快捷键与操作指南</h3>
              <p className="text-xs text-zinc-400">提高矢量图研习与绘制效率</p>
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
        <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[65vh]">
          {shortcutGroups.map((grp) => (
            <div key={grp.group} className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{grp.group}</span>
              </h4>
              <div className="grid grid-cols-1 gap-1.5 bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/80">
                {grp.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-xs py-1">
                    <span className="text-zinc-400">{item.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[11px] font-semibold">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3.5 border-t border-zinc-800 bg-zinc-950/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};
