import { ProjectData, StrokeMicroStep, StageMetadata } from '../types/anime';
import { LayerId } from '../types/studio';
import { StepDensityEngine } from '../engine/stepDensityEngine';
import compactData from './masterMikaCompact.json';

const layerNameMap: Record<string, string> = {
  background: '背景特效',
  skin_body: '身体肤色',
  hair: '发型轮廓',
  clothes: '服饰层次',
  iris: '五官眼眸',
  shadow_highlight: '阴影高光',
  line_art: '线条勾勒',
};

const stageNameMap: Record<string, string> = {
  'stage-1': '01初版草图',
  'stage-2': '02底色铺设',
  'stage-3': '03结构阴影',
  'stage-4': '04细部雕琢',
  'stage-5': '05神圣光晕',
};

/**
 * Master Commercial-Grade Artwork Dataset: 圣三一的天使 · 圣园弥香 (Misono Mika - Blue Archive)
 * 
 * High-fidelity anime vector illustration faithfully matching the reference artwork:
 * - 3/4 angled face with porcelain ivory skin & soft peach-pink blushing cheeks
 * - Tilted anime cat-eyes with radiant amber-gold iris & Mika's signature 4-point yellow star pupils
 * - Playful parted lips smiling with index finger in classic "shh" secret pose
 * - Voluminous sakura-pink windswept hair, twin buns (odango) with blue/white ruffled lace scrunchies
 * - Wrist wrapped in deep indigo galaxy scrunchie dotted with miniature gold stars
 * - Majestic feathered angel wing sweeping up to top-right with layered feathers & glowing celestial beads
 * - 3D perspective floating halo with concentric rings & glowing cross-star crystals
 * - Elegant Trinity Tea Party uniform with white capelet, gold insignia, double-breasted buttons & blue ribbons
 * - Luminous airy background with floating pastel cross-star sparkles & stardust
 */
export function createMasterMikaBaseProject(): ProjectData {
  const steps: StrokeMicroStep[] = compactData.steps.map((s) => ({
    id: s.i,
    step: s.i,
    stageId: s.s,
    stageName: stageNameMap[s.s] || s.s,
    layerId: s.l as LayerId,
    layerName: layerNameMap[s.l] || s.l,
    title: s.t,
    description: s.d,
    elementId: s.e,
    xmlPatch: s.x,
    addedLines: [`+ ${s.x}`],
    removedLines: [],
    diff: {
      type: 'add' as const,
      addedLines: [`+ ${s.x}`],
    },
    metadata: {},
  }));

  return {
    title: '圣三一的天使 · 圣园弥香 (Misono Mika - Blue Archive)',
    version: '2.0.0-master',
    canvasWidth: 800,
    canvasHeight: 1000,
    viewBox: '0 0 800 1000',
    stages: compactData.stages as StageMetadata[],
    steps,
  };
}

/**
 * Creates the ultra-high-density 10,000 micro-steps version of Master Mika project (legacy scaling)
 */
export function createMasterMika10kProject(): ProjectData {
  const base = createMasterMikaBaseProject();
  return StepDensityEngine.scaleProjectToDensity(base, 10000);
}

/**
 * Singleton instance of Master Mika Project for immediate loading and copilot integration:
 * Defaults to the authentic, high-precision vector artwork with 2,584 genuine artistic strokes.
 */
export const MASTER_MIKA_PROJECT: ProjectData = createMasterMikaBaseProject();

