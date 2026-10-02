import { LayerId } from './studio';

export interface VirtualDomNode {
  id: string;
  tag: string;
  layer: LayerId;
  step: number;
  attributes: Record<string, string>;
  children?: VirtualDomNode[];
}

export interface StepDiff {
  step: number;
  title: string;
  actionType: 'add' | 'modify' | 'remove';
  addedLines: string[];
  removedLines: string[];
  patchXml: string;
}

export type DiffLineType = 'add' | 'del' | 'context';

export interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export type SyntaxTokenType =
  | 'tag'
  | 'attr-name'
  | 'attr-value'
  | 'punctuation'
  | 'comment'
  | 'text'
  | 'whitespace';

export interface SyntaxToken {
  type: SyntaxTokenType;
  value: string;
}

export type PngResolution = 1 | 2 | 4;

export interface ExportOptions {
  filename?: string;
  scale?: PngResolution;
  transparentBackground?: boolean;
  activeLayersOnly?: boolean;
}

export interface ImportResult {
  success: boolean;
  error?: string;
  warnings?: string[];
}
