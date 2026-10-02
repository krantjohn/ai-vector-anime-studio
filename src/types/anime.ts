import { LayerId } from './studio';

export type StageId = 'stage-1' | 'stage-2' | 'stage-3' | 'stage-4' | 'stage-5';

export interface StageMetadata {
  id: string;
  index?: number;
  stageNumber?: number;
  code?: string;
  name: string;
  title?: string;
  description: string;
  subtitle?: string;
  startStep: number;
  endStep: number;
  themeColor?: string;
}

export type ActionType = 'add' | 'modify' | 'replace' | 'remove';

export interface StrokeMicroStep {
  id: number;
  step?: number;
  stageId: string;
  stageName?: string;
  layerId: LayerId;
  layerName?: string;
  title: string;
  description: string;
  actionType?: ActionType;
  targetElementId?: string;
  elementId?: string;
  xmlPatch: string;
  svgSnippet?: string;
  addedLines: string[];
  removedLines: string[];
  strokeColor?: string;
  diff?: {
    type: 'add' | 'modify' | 'remove';
    addedLines: string[];
    removedLines?: string[];
  };
  metadata?: {
    colorHex?: string;
    strokeWidth?: number;
    fillColor?: string;
    opacity?: number;
    focusPoint?: { x: number; y: number };
    tag?: string;
  };
}

export type MicroStep = StrokeMicroStep;

export interface ProjectData {
  title: string;
  version: string;
  viewBox: string;
  canvasWidth: number;
  canvasHeight: number;
  stages: StageMetadata[];
  steps: StrokeMicroStep[];
}

export type AnimeCharacterData = ProjectData;

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'scrubbing' | 'completed';
export type PlaybackSpeed = 0.5 | 1 | 2 | 4;
