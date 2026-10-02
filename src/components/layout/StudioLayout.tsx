import React, { useState } from 'react';
import { Header } from './Header';
import { Code2, PlaySquare } from 'lucide-react';
import { VectorCanvas } from '../canvas/VectorCanvas';
import { TimelineConsole } from '../timeline/TimelineConsole';
import { InspectorTabs } from '../inspector/InspectorTabs';
import { ExportSvgModal } from '../modals/ExportSvgModal';
import { ExportPngModal } from '../modals/ExportPngModal';
import { ImportJsonModal } from '../modals/ImportJsonModal';
import { ShortcutsModal } from '../modals/ShortcutsModal';
import { AiPromptModal } from '../modals/AiPromptModal';
import { ImageVectorizerModal } from '../modals/ImageVectorizerModal';

export const StudioLayout: React.FC = () => {
  // Mobile / compact tab switcher (active on viewports < 1024px)
  const [mobileTab, setMobileTab] = useState<'canvas' | 'inspector'>('canvas');

  // Modals state
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const [isVectorizerOpen, setIsVectorizerOpen] = useState(false);
  const [isExportSvgOpen, setIsExportSvgOpen] = useState(false);
  const [isExportPngOpen, setIsExportPngOpen] = useState(false);
  const [isImportJsonOpen, setIsImportJsonOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-studio-bg select-none">
      {/* Top Studio Header */}
      <Header
        onOpenAiPrompt={() => setIsAiPromptOpen(true)}
        onOpenVectorizer={() => setIsVectorizerOpen(true)}
        onOpenExportSvg={() => setIsExportSvgOpen(true)}
        onOpenExportPng={() => setIsExportPngOpen(true)}
        onOpenImportJson={() => setIsImportJsonOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Mobile / Tablet Tab Switcher (< 1024px) */}
      <div className="lg:hidden flex border-b border-studio-border bg-studio-panel">
        <button
          onClick={() => setMobileTab('canvas')}
          className={`flex-1 py-2 text-xs font-medium flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            mobileTab === 'canvas'
              ? 'border-violet-500 text-violet-300 bg-violet-500/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PlaySquare className="w-4 h-4" />
          <span>矢量画布与回放</span>
        </button>
        <button
          onClick={() => setMobileTab('inspector')}
          className={`flex-1 py-2 text-xs font-medium flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            mobileTab === 'inspector'
              ? 'border-violet-500 text-violet-300 bg-violet-500/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>代码与 DOM 检查器</span>
        </button>
      </div>

      {/* Main Studio Dual-Pane Split (62% Left : 38% Right on Desktop) */}
      <main className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Pane (62%): Canvas Viewport + Docked Bottom Timeline Console */}
        <section
          data-testid="studio-left-pane"
          className={`flex flex-col h-full bg-studio-bg overflow-hidden transition-all duration-200 ${
            mobileTab === 'canvas' ? 'w-full' : 'hidden'
          } lg:flex lg:basis-[62%] lg:max-w-[62%] lg:min-w-[500px] border-r border-studio-border`}
        >
          {/* Canvas Viewport (flex-1) */}
          <div 
            data-testid="canvas-viewport"
            className="flex-1 relative overflow-hidden flex items-center justify-center canvas-grid-pattern"
          >
            <VectorCanvas />
          </div>

          {/* Docked Timeline Playback Console (h-[148px]) */}
          <div 
            data-testid="timeline-dock"
            className="h-[148px] min-h-[148px] bg-studio-panel border-t border-studio-border overflow-hidden"
          >
            <TimelineConsole />
          </div>
        </section>

        {/* Right Pane (38%): Code Diff, Full SVG, and DOM Hierarchy Inspector */}
        <aside
          data-testid="studio-right-pane"
          className={`flex flex-col h-full bg-studio-panel overflow-hidden transition-all duration-200 ${
            mobileTab === 'inspector' ? 'w-full' : 'hidden'
          } lg:flex lg:basis-[38%] lg:max-w-[38%] lg:min-w-[360px]`}
        >
          <InspectorTabs />
        </aside>
      </main>

      {/* Modals */}
      <AiPromptModal isOpen={isAiPromptOpen} onClose={() => setIsAiPromptOpen(false)} />
      <ImageVectorizerModal isOpen={isVectorizerOpen} onClose={() => setIsVectorizerOpen(false)} />
      <ExportSvgModal isOpen={isExportSvgOpen} onClose={() => setIsExportSvgOpen(false)} />
      <ExportPngModal isOpen={isExportPngOpen} onClose={() => setIsExportPngOpen(false)} />
      <ImportJsonModal isOpen={isImportJsonOpen} onClose={() => setIsImportJsonOpen(false)} />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
};
