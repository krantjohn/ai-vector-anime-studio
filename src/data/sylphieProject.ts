import { ProjectData, StrokeMicroStep, StageMetadata } from '../types/anime';
import { LayerId } from '../types/studio';
import { StepDensityEngine } from '../engine/stepDensityEngine';
import compactData from './sylphieCompact.json';

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
 * Original Masterpiece Vector Dataset: 星辉蝶愿 · 希尔菲 (Sylphie - Starlight Chrysalis)
 * 
 * 100% Original Anime Heroine Design:
 * - 核心特征: 【粉毛、金瞳、少女身材】与零重力浮空身段
 * - 飘逸动感樱粉色长发与双侧星蝶发饰 (Sakura Pink Voluminous Hair & Star Butterfly Hairpins)
 * - 晶莹璀璨星辉金瞳与四角星芒黄色瞳孔 (Glowing Radiant Celestial Gold Iris & Star Pupils)
 * - 纤细灵动的少女身材骨架与平展召唤姿态 (Slender zero-g floating teenage silhouette)
 * - 星空渐变洛丽塔法裙、金丝蕾丝花纹与飞舞流光星蝶 (Starry Gradient Twilight Gown & Luminous Celestial Butterflies)
 * - 纯净赛璐璐硬边切面 + DoG加重黑墨线骨架，拒绝油画杂乱碎斑
 * - 1,963 组真实贝塞尔三次样条高精度矢量微步
 */
export function createSylphieProject(): ProjectData {
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
    title: '星辉蝶愿 · 希尔菲 (Sylphie - Starlight Chrysalis Original Masterpiece)',
    version: '3.0.0-original',
    canvasWidth: 800,
    canvasHeight: 1000,
    viewBox: '0 0 800 1000',
    stages: compactData.stages as StageMetadata[],
    steps,
  };
}

/**
 * Creates the ultra-high-density 10,000 micro-steps version of Sylphie project
 */
export function createSylphie10kProject(): ProjectData {
  const base = createSylphieProject();
  return StepDensityEngine.scaleProjectToDensity(base, 10000);
}

/**
 * Singleton instance of Sylphie Original Project for immediate loading and copilot integration
 */
export const SYLPHIE_PROJECT: ProjectData = createSylphieProject();
