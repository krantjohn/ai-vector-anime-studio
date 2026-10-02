import { ProjectData, StrokeMicroStep, StageMetadata } from '../types/anime';
import { LayerId } from '../types/studio';

export interface HighDensityConfig {
  targetSteps: number; // e.g. 10000
  enableSubPathDivision: boolean;
  enableStrokeReveal: boolean;
}

/**
 * Step Density Engine
 * 
 * Scalably expands semantic anime vector artwork into high-density micro-steps
 * (up to 10,000 steps) for ultra-fine-grained Live Code playback, matching the
 * viral 'LIVE CODE 笔画写代码同步 / 10,000步精修' anime drawing demos.
 */
export class StepDensityEngine {
  /**
   * Scale a project into high-density micro-steps (e.g. 1,000 to 10,000 steps)
   */
  static scaleProjectToDensity(
    baseProject: ProjectData,
    targetTotalSteps: number = 10000
  ): ProjectData {
    if (baseProject.steps.length >= targetTotalSteps) {
      return baseProject;
    }

    const baseCount = baseProject.steps.length;
    const expansionFactor = Math.floor(targetTotalSteps / baseCount);
    const remainder = targetTotalSteps % baseCount;

    const scaledSteps: StrokeMicroStep[] = [];
    let currentGlobalStepId = 1;

    // We will expand each base step into multiple sub-steps
    for (let i = 0; i < baseCount; i++) {
      const baseStep = baseProject.steps[i];
      const subStepCount = expansionFactor + (i < remainder ? 1 : 0);

      for (let sub = 0; sub < subStepCount; sub++) {
        const progress = (sub + 1) / subStepCount;
        const isFinalSub = sub === subStepCount - 1;
        const subId = currentGlobalStepId++;

        // Calculate micro-step metadata and patch
        const subTitle = subStepCount > 1 
          ? `${baseStep.title} (细分微步 ${sub + 1}/${subStepCount})`
          : baseStep.title;

        const subDesc = isFinalSub
          ? baseStep.description
          : `${baseStep.description} · 笔触插值计算 ${Math.round(progress * 100)}%`;

        // Generate high-density micro XML patch
        const microPatch = isFinalSub
          ? baseStep.xmlPatch
          : this.generateMicroPatch(baseStep.xmlPatch, progress, subId);

        scaledSteps.push({
          id: subId,
          step: subId,
          stageId: baseStep.stageId,
          stageName: baseStep.stageName,
          layerId: baseStep.layerId,
          layerName: baseStep.layerName,
          title: subTitle,
          description: subDesc,
          elementId: `${baseStep.elementId || 'elem'}-p${sub + 1}`,
          xmlPatch: microPatch,
          addedLines: [`+ ${microPatch}`],
          removedLines: [],
          diff: {
            type: 'add',
            addedLines: [`+ ${microPatch}`],
          },
          metadata: {
            ...baseStep.metadata,
            opacity: progress,
            tag: isFinalSub ? 'complete' : 'interpolating',
          },
        });
      }
    }

    // Remap stages to the new 10,000 step range
    const scaledStages: StageMetadata[] = baseProject.stages.map((stage, sIdx) => {
      // Find the start and end steps in the new scaled array
      const matchingSteps = scaledSteps.filter((s) => s.stageId === stage.id);
      const start = matchingSteps.length > 0 ? matchingSteps[0].id : 1;
      const end = matchingSteps.length > 0 ? matchingSteps[matchingSteps.length - 1].id : targetTotalSteps;

      return {
        ...stage,
        startStep: start,
        endStep: end,
        subtitle: `${stage.name} (共 ${matchingSteps.length} 微步)`,
      };
    });

    return {
      ...baseProject,
      title: baseProject.title.includes('10,000') 
        ? baseProject.title 
        : `${baseProject.title} (10,000步精修版)`,
      version: '2.0.0-density-10k',
      stages: scaledStages,
      steps: scaledSteps,
    };
  }

  /**
   * Generates a progressive micro-step XML patch for a sub-step
   */
  private static generateMicroPatch(originalPatch: string, progress: number, subId: number): string {
    // If it's a path with 'd="M..."', we can simulate stroke drawing via stroke-dasharray/dashoffset or opacity
    if (originalPatch.includes('<path')) {
      const opacity = Math.max(0.15, Number(progress.toFixed(2)));
      return originalPatch.replace(
        /<path\s/,
        `<path data-micro-step="${subId}" opacity="${opacity}" `
      );
    }

    if (originalPatch.includes('<circle') || originalPatch.includes('<ellipse')) {
      const opacity = Math.max(0.2, Number(progress.toFixed(2)));
      return originalPatch.replace(
        /<(circle|ellipse)\s/,
        `<$1 data-micro-step="${subId}" opacity="${opacity}" `
      );
    }

    return originalPatch;
  }
}
