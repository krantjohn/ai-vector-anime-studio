import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useStudio } from '../../store/studioContext';

interface StageButton {
  id: string;
  name: string;
  range: string;
}

export const TimelineConsole: React.FC = () => {
  const {
    currentStep,
    totalSteps,
    isPlaying,
    playbackSpeed,
    togglePlay,
    setCurrentStep,
    nextStep,
    prevStep,
    setPlaybackSpeed,
    currentStage,
    currentStepData,
    project,
  } = useStudio();

  const stages: StageButton[] = (project?.stages && project.stages.length > 0)
    ? project.stages.map((st: any) => ({
        id: st.id,
        name: st.name,
        range: `${st.startStep}-${st.endStep}`,
      }))
    : [
        { id: 'stage-1', name: '01初版草图', range: '1-7' },
        { id: 'stage-2', name: '02局部细化', range: '8-16' },
        { id: 'stage-3', name: '03对比修正', range: '17-26' },
        { id: 'stage-4', name: '04虹膜笔触', range: '27-35' },
        { id: 'stage-5', name: '05增光润部', range: '36-43' },
      ];

  const stepJump = (delta: number) => {
    setCurrentStep(Math.max(0, Math.min(totalSteps, currentStep + delta)));
  };

  return (
    <div
      className="h-full flex flex-col justify-between p-3 select-none bg-studio-panel"
      data-testid="timeline-console"
    >
      {/* Top Row: Stages and Speed */}
      <div className="flex items-center justify-between gap-2 border-b border-studio-border/60 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {stages.map((st) => {
            const isActive = currentStage?.name.startsWith(st.name.substring(0, 2));
            return (
              <button
                key={st.id}
                onClick={() => {
                  const targetStep = parseInt(st.range.split('-')[0], 10);
                  setCurrentStep(targetStep);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80'
                }`}
              >
                {st.name} <span className="text-[10px] opacity-70">({st.range})</span>
              </button>
            );
          })}
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-studio-border rounded-lg p-0.5 text-xs font-mono">
          {[0.5, 1, 2, 4].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                playbackSpeed === spd
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Middle Row: Progress Slider and Step Badge */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex items-center gap-1 min-w-[90px] text-xs font-mono">
          <span className="text-zinc-500 font-sans text-[11px]">笔触</span>
          <span className="font-semibold text-amber-400">
            {currentStep}/{totalSteps}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={totalSteps}
          value={currentStep}
          onChange={(e) => setCurrentStep(parseInt(e.target.value, 10))}
          className="flex-1 accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          data-testid="timeline-slider"
        />
        <span className="text-xs font-mono text-zinc-400 min-w-[40px] text-right">
          {Math.round((currentStep / (totalSteps || 1)) * 100)}%
        </span>
      </div>

      {/* Bottom Row: Transport Controls & Fine-Stepping */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setCurrentStep(0)}
            title="重置到初始步骤"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Quick jump -50 */}
          {totalSteps > 100 && (
            <button
              onClick={() => stepJump(-50)}
              disabled={currentStep <= 0}
              title="后退 50 笔"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors text-[10px] font-mono hidden md:inline-flex items-center"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
              <span>-50</span>
            </button>
          )}

          <button
            onClick={prevStep}
            disabled={currentStep <= 0}
            title="单笔微退 (-1 笔)"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            title={isPlaying ? '暂停' : '播放绘制回放'}
            data-testid="play-pause-button"
            className="px-3.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-violet-950/40"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>暂停</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>回放绘制</span>
              </>
            )}
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep >= totalSteps}
            title="单笔步进 (+1 笔)"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Quick jump +50 */}
          {totalSteps > 100 && (
            <button
              onClick={() => stepJump(50)}
              disabled={currentStep >= totalSteps}
              title="前进 50 笔"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors text-[10px] font-mono hidden md:inline-flex items-center"
            >
              <span>+50</span>
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-[11px] text-zinc-400 truncate max-w-[340px] font-sans flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
          <span className="font-semibold text-zinc-300 truncate">
            {currentStepData ? currentStepData.title : `${currentStage?.title}: 第 ${currentStep} 步`}
          </span>
          {currentStepData && (
            <span className="text-[10px] text-zinc-500 hidden lg:inline truncate">
              — {currentStepData.description}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
