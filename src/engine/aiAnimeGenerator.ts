import { ProjectData, StrokeMicroStep, StageMetadata } from '../types/anime';
import { LayerId } from '../types/studio';
import { StepDensityEngine } from './stepDensityEngine';
import { createMasterMikaBaseProject } from '../data/masterMikaProject';

// Core Master Datasets
import peniaData from '../data/peniaCompact.json';
import kisakiData from '../data/kisakiCompact.json';
import planaData from '../data/planaCompact.json';
import shirokoData from '../data/shirokoCompact.json';
import ricoData from '../data/ricoCompact.json';
import vampireData from '../data/vampireCompact.json';
import cyberpunkData from '../data/cyberpunkCompact.json';
import shrineData from '../data/shrineCompact.json';
import magicalData from '../data/magicalCompact.json';

// Newly learned Master Action & Character Datasets from D:\文档\图片\X
import stretchData from '../data/stretchCompact.json';
import glanceData from '../data/glanceCompact.json';
import tennisData from '../data/tennisCompact.json';
import etherealData from '../data/etherealCompact.json';
import makimaData from '../data/makimaCompact.json';
import mikuData from '../data/mikuCompact.json';
import foxearData from '../data/foxearCompact.json';

// Original Masterpiece: 100% Original Pink-haired Gold-eyed Anime Girl
import sylphieData from '../data/sylphieCompact.json';
import { createSylphieProject, createSylphie10kProject } from '../data/sylphieProject';

export type AnimeActionPose =
  | 'sylphie'       // 原创粉毛金瞳少女 · 星辉蝶愿 / 浮空召唤 / 希尔菲
  | 'stretch'       // 晨光伸懒腰 / 舒展微风 / 仰头闭目 / 居家白衬衫
  | 'glance'        // 露背晚礼服回眸 / 高贵侧视 / 宴会优雅
  | 'tennis'        // 活力网球挥拍 / 运动擦汗 / 动感跃动
  | 'ethereal'      // 空灵悬浮抱膝 / 赤足精灵 / 零重力飘逸
  | 'makima'        // 单手遮面狂气魔眼 / 支配恶魔 / 西装领带
  | 'miku'          // 双马尾夏日清爽 / 元气海滩 / 手绘签名
  | 'foxear'        // 田园麦田兽耳少女 / 抚花微笑 / 麻花辫
  | 'beach'         // 什亭之匣夏日海滩 / 遮阳伞俯身 / 普拉娜
  | 'lounge'        // 玄龙门主沙滩躺椅 / 侧卧推墨镜 / 妃姬
  | 'tactical'      // 战术狼耳立领 / 冷酷俯视 / 砂狼白子·恐怖
  | 'apple'         // 双手托腮捧苹果 / 斜切强烈光影 / Rico
  | 'sketch'        // 真实手绘墨线原画 / 漫画签名 / Penia
  | 'angel'         // 圣三一天使之翼 / 圣殿祈祷 / 圣园弥香
  | 'gothic'        // 哥特吸血鬼少女 / 暗夜蝠翼
  | 'cyber'         // 赛博机能猫耳娘 / 全息巡游
  | 'shrine'        // 极黑长直和服巫女 / 绯樱落瓣
  | 'magical';      // 星之魔法少女 / 星光权杖双马尾

export interface AnimeGenerationOptions {
  prompt: string;
  characterName?: string;
  actionPose?: AnimeActionPose;
  hairColor?: 'purple' | 'silver' | 'gold' | 'pink' | 'black' | 'blue' | 'green' | 'red' | 'brown';
  eyeColor?: 'gold' | 'red' | 'blue' | 'green' | 'violet' | 'amber';
  hasCatEars?: boolean;
  hasTwintails?: boolean;
  hasWings?: boolean;
  hasHalo?: boolean;
  outfitStyle?: 'sailor' | 'magical' | 'kimono' | 'gothic' | 'cyberpunk' | 'casual' | 'swimsuit' | 'sports' | 'evening_dress';
  density?: 1000 | 10000;
}

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

// High-precision Hair color palettes preserving anime shading & highlights
const HAIR_PALETTES: Record<string, { highlight: string; light: string; mid: string; deep: string }> = {
  silver: { highlight: '#FFFFFF', light: '#E2E8F0', mid: '#94A3B8', deep: '#475569' },
  gold:   { highlight: '#FEF9C3', light: '#FDE047', mid: '#EAB308', deep: '#854D0E' },
  pink:   { highlight: '#FCE7F3', light: '#F472B6', mid: '#DB2777', deep: '#831843' },
  black:  { highlight: '#64748B', light: '#334155', mid: '#1E293B', deep: '#0F172A' },
  blue:   { highlight: '#BAE6FD', light: '#38BDF8', mid: '#0284C7', deep: '#0369A1' },
  green:  { highlight: '#BBF7D0', light: '#4ADE80', mid: '#16A34A', deep: '#14532D' },
  red:    { highlight: '#FECACA', light: '#F87171', mid: '#DC2626', deep: '#7F1D1D' },
  purple: { highlight: '#DDD6FE', light: '#A78BFA', mid: '#7C3AED', deep: '#4C1D95' },
  brown:  { highlight: '#FED7AA', light: '#FB923C', mid: '#C2410C', deep: '#7C2D12' },
};

// High-precision Eye color palettes preserving specular glints & deep pupils
const EYE_PALETTES: Record<string, { highlight: string; light: string; mid: string; deep: string }> = {
  red:    { highlight: '#FCA5A5', light: '#EF4444', mid: '#B91C1C', deep: '#7F1D1D' },
  blue:   { highlight: '#7DD3FC', light: '#0EA5E9', mid: '#0369A1', deep: '#0C4A6E' },
  gold:   { highlight: '#FDE047', light: '#EAB308', mid: '#A16207', deep: '#713F12' },
  green:  { highlight: '#86EFAC', light: '#22C55E', mid: '#15803D', deep: '#14532D' },
  violet: { highlight: '#C4B5FD', light: '#8B5CF6', mid: '#6D28D9', deep: '#4C1D95' },
  amber:  { highlight: '#FED7AA', light: '#F59E0B', mid: '#B45309', deep: '#78350F' },
};

function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  if (hex.length === 6) {
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  return [255, 255, 255];
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Dynamically parse dataset and transmute palettes according to user's character and action specs
 */
function parseAndTransmuteDataset(
  data: any,
  defaultTitle: string,
  options: AnimeGenerationOptions
): ProjectData {
  const isSylphieDataset = data === sylphieData || defaultTitle.includes('希尔菲') || defaultTitle.includes('Sylphie');
  // Sylphie's native design is already authentic sakura-pink hair and celestial gold eyes.
  // Preserve full authentic artist shading palettes unless the user explicitly requests an alternative color.
  const shouldTransmuteHair = options.hairColor && (!isSylphieDataset || options.hairColor !== 'pink');
  const shouldTransmuteEye = options.eyeColor && (!isSylphieDataset || options.eyeColor !== 'gold');

  const targetHair = shouldTransmuteHair ? HAIR_PALETTES[options.hairColor!] : undefined;
  const targetEye = shouldTransmuteEye ? EYE_PALETTES[options.eyeColor!] : undefined;

  const steps: StrokeMicroStep[] = data.steps.map((s: any) => {
    let xmlPatch = s.x;

    // Palette Transmutation on Hair Layer
    if (s.l === 'hair' && targetHair) {
      xmlPatch = xmlPatch.replace(/fill="([^"]+)"/, (_match: string, hex: string) => {
        if (!hex.startsWith('#') || hex.length !== 7) return _match;
        const [r, g, b] = hexToRgb(hex);
        const lum = getLuminance(r, g, b);
        // Preserve deep black ink contours
        if (lum < 65) return `fill="${hex}"`;
        // Map to user-specified target hair palette
        if (lum > 200) return `fill="${targetHair.highlight}"`;
        if (lum > 145) return `fill="${targetHair.light}"`;
        if (lum > 95) return `fill="${targetHair.mid}"`;
        return `fill="${targetHair.deep}"`;
      });
    }

    // Palette Transmutation on Iris Layer
    if (s.l === 'iris' && targetEye) {
      xmlPatch = xmlPatch.replace(/fill="([^"]+)"/, (_match: string, hex: string) => {
        if (!hex.startsWith('#') || hex.length !== 7) return _match;
        const [r, g, b] = hexToRgb(hex);
        const lum = getLuminance(r, g, b);
        // Preserve specular highlight (>240) and pitch black pupil core (<20)
        if (lum > 240 || lum < 20) return `fill="${hex}"`;
        if (lum > 160) return `fill="${targetEye.highlight}"`;
        if (lum > 115) return `fill="${targetEye.light}"`;
        return `fill="${targetEye.mid}"`;
      });
    }

    return {
      id: s.i,
      step: s.i,
      stageId: s.s,
      stageName: stageNameMap[s.s] || s.s,
      layerId: s.l as LayerId,
      layerName: layerNameMap[s.l] || s.l,
      title: s.t,
      description: s.d,
      elementId: s.e,
      xmlPatch,
      addedLines: [`+ ${xmlPatch}`],
      removedLines: [],
      diff: {
        type: 'add' as const,
        addedLines: [`+ ${xmlPatch}`],
      },
      metadata: {},
    };
  });

  let finalTitle: string;
  if (!options.prompt?.trim()) {
    finalTitle = defaultTitle;
  } else if (
    options.prompt.trim().includes('希尔菲') ||
    options.prompt.trim().includes('Sylphie') ||
    options.prompt.trim().includes('星辉蝶愿')
  ) {
    finalTitle = options.prompt.trim();
  } else if (isSylphieDataset) {
    finalTitle = `星辉蝶愿 · 希尔菲 (原创) - ${options.prompt.trim()}`;
  } else {
    finalTitle = options.prompt.trim();
  }

  return {
    title: finalTitle,
    version: '2.5.0-dynamic-studio',
    canvasWidth: 800,
    canvasHeight: 1000,
    viewBox: '0 0 800 1000',
    stages: data.stages as StageMetadata[],
    steps,
  };
}

export class AiAnimeGenerator {
  /**
   * Parse natural language prompt into deep character and action parameters
   */
  static parsePrompt(prompt: string): AnimeGenerationOptions {
    const text = prompt.toLowerCase();

    // 1. Action & Pose Detection
    let actionPose: AnimeActionPose = 'beach';
    if (
      text.includes('希尔菲') ||
      text.includes('sylphie') ||
      text.includes('星蝶') ||
      text.includes('蝶愿') ||
      text.includes('原创') ||
      ((text.includes('粉毛') || text.includes('粉发') || text.includes('樱发')) && (text.includes('金瞳') || text.includes('黄瞳') || text.includes('金眼') || text.includes('琥珀'))) ||
      ((text.includes('粉毛') || text.includes('粉发') || text.includes('樱发')) && text.includes('少女身材')) ||
      ((text.includes('金瞳') || text.includes('黄瞳') || text.includes('金眼') || text.includes('琥珀')) && text.includes('少女身材'))
    ) {
      actionPose = 'sylphie';
    } else if (text.includes('伸懒腰') || text.includes('舒展') || text.includes('晨光') || text.includes('起床') || text.includes('仰头')) {
      actionPose = 'stretch';
    } else if (text.includes('回眸') || text.includes('露背') || text.includes('晚礼服') || text.includes('高贵') || text.includes('侧身')) {
      actionPose = 'glance';
    } else if (text.includes('网球') || text.includes('运动') || text.includes('挥拍') || text.includes('擦汗') || text.includes('奔跑') || text.includes('跃动')) {
      actionPose = 'tennis';
    } else if (text.includes('悬浮') || text.includes('抱膝') || text.includes('漂浮') || text.includes('精灵') || text.includes('赤足') || text.includes('零重力')) {
      actionPose = 'ethereal';
    } else if (text.includes('遮面') || text.includes('遮脸') || text.includes('玛奇玛') || text.includes('支配') || text.includes('魔眼') || text.includes('狂气')) {
      actionPose = 'makima';
    } else if (text.includes('初音') || text.includes('miku') || (text.includes('双马尾') && text.includes('泳装'))) {
      actionPose = 'miku';
    } else if (text.includes('麦田') || text.includes('花海') || text.includes('抚花') || text.includes('赫萝') || text.includes('田园') || (text.includes('兽耳') && text.includes('花'))) {
      actionPose = 'foxear';
    } else if (text.includes('躺椅') || text.includes('沙滩椅') || text.includes('侧卧') || text.includes('妃姬') || text.includes('kisaki') || text.includes('墨镜')) {
      actionPose = 'lounge';
    } else if (text.includes('战术') || text.includes('狼耳') || text.includes('白子') || text.includes('shiroko') || text.includes('俯视') || text.includes('战斗') || text.includes('拔剑')) {
      actionPose = 'tactical';
    } else if (text.includes('苹果') || text.includes('rico') || text.includes('托腮') || text.includes('强光') || text.includes('斜切')) {
      actionPose = 'apple';
    } else if (text.includes('手绘') || text.includes('原画') || text.includes('penia') || text.includes('线稿') || text.includes('签名')) {
      actionPose = 'sketch';
    } else if (text.includes('天使') || text.includes('弥香') || text.includes('mika') || text.includes('圣三一') || text.includes('羽翼')) {
      actionPose = 'angel';
    } else if (text.includes('吸血鬼') || text.includes('哥特') || text.includes('vampire') || text.includes('洛丽塔')) {
      actionPose = 'gothic';
    } else if (text.includes('赛博') || text.includes('机能') || text.includes('猫耳') || text.includes('cyber')) {
      actionPose = 'cyber';
    } else if (text.includes('巫女') || text.includes('和服') || text.includes('神社') || text.includes('黑长直')) {
      actionPose = 'shrine';
    } else if (text.includes('魔法少女') || text.includes('魔杖') || text.includes('星空')) {
      actionPose = 'magical';
    } else if (text.includes('普拉娜') || text.includes('plana') || text.includes('什亭之匣') || text.includes('泳装') || text.includes('遮阳伞')) {
      actionPose = 'beach';
    }

    // 2. Hair Color Detection
    let hairColor: AnimeGenerationOptions['hairColor'] = undefined;
    if (text.includes('银发') || text.includes('白发') || text.includes('silver') || text.includes('white')) hairColor = 'silver';
    else if (text.includes('金发') || text.includes('黄发') || text.includes('gold') || text.includes('blonde')) hairColor = 'gold';
    else if (text.includes('粉发') || text.includes('粉毛') || text.includes('pink') || text.includes('樱发')) hairColor = 'pink';
    else if (text.includes('黑发') || text.includes('black') || text.includes('乌发')) hairColor = 'black';
    else if (text.includes('蓝发') || text.includes('blue') || text.includes('青发') || text.includes('苍发')) hairColor = 'blue';
    else if (text.includes('绿发') || text.includes('green') || text.includes('碧发')) hairColor = 'green';
    else if (text.includes('红发') || text.includes('red') || text.includes('赤发')) hairColor = 'red';
    else if (text.includes('紫发') || text.includes('purple') || text.includes('violet')) hairColor = 'purple';
    else if (text.includes('棕发') || text.includes('茶发') || text.includes('brown')) hairColor = 'brown';

    // 3. Eye Color Detection
    let eyeColor: AnimeGenerationOptions['eyeColor'] = undefined;
    if (text.includes('红瞳') || text.includes('赤瞳') || text.includes('red') || text.includes('ruby') || text.includes('血瞳')) eyeColor = 'red';
    else if (text.includes('蓝瞳') || text.includes('碧蓝') || text.includes('blue') || text.includes('sapphire') || text.includes('苍瞳')) eyeColor = 'blue';
    else if (text.includes('绿瞳') || text.includes('碧瞳') || text.includes('green') || text.includes('emerald')) eyeColor = 'green';
    else if (text.includes('紫瞳') || text.includes('violet') || text.includes('purple')) eyeColor = 'violet';
    else if (text.includes('金瞳') || text.includes('琥珀') || text.includes('gold') || text.includes('amber') || text.includes('黄瞳') || text.includes('金眼')) eyeColor = 'gold';

    // 4. Character Traits
    const hasCatEars = text.includes('猫耳') || text.includes('兽耳') || text.includes('neko');
    const hasTwintails = text.includes('双马尾') || text.includes('twintail');
    const hasWings = text.includes('翼') || text.includes('翅膀') || text.includes('羽翼');
    const hasHalo = text.includes('光环') || text.includes('halo');

    // 5. Outfit Style
    let outfitStyle: AnimeGenerationOptions['outfitStyle'] = 'casual';
    if (text.includes('晚礼服') || text.includes('礼服')) outfitStyle = 'evening_dress';
    else if (text.includes('网球') || text.includes('运动')) outfitStyle = 'sports';
    else if (text.includes('泳装') || text.includes('沙滩') || text.includes('海滩')) outfitStyle = 'swimsuit';
    else if (text.includes('和服') || text.includes('巫女')) outfitStyle = 'kimono';
    else if (text.includes('哥特') || text.includes('吸血鬼')) outfitStyle = 'gothic';
    else if (text.includes('赛博') || text.includes('机能')) outfitStyle = 'cyberpunk';
    else if (text.includes('水手服') || text.includes('制服')) outfitStyle = 'sailor';
    else if (text.includes('魔法少女')) outfitStyle = 'magical';

    const density = (text.includes('10000') || text.includes('10,000') || text.includes('一万步') || text.includes('上万步')) ? 10000 : undefined;

    return {
      prompt,
      actionPose,
      hairColor,
      eyeColor,
      hasCatEars,
      hasTwintails,
      hasWings,
      hasHalo,
      outfitStyle,
      density,
    };
  }

  /**
   * Synthesize a complete high-fidelity anime vector project from options
   */
  static generateProject(options: AnimeGenerationOptions): ProjectData {
    const text = (options.prompt || '').toLowerCase();
    const pose = options.actionPose || this.parsePrompt(options.prompt).actionPose;

    let baseProject: ProjectData;

    // Direct Recognition of Original Sylphie / Original Anime Request
    if (
      pose === 'sylphie' ||
      text.includes('希尔菲') ||
      text.includes('sylphie') ||
      text.includes('星蝶') ||
      text.includes('蝶愿') ||
      text.includes('原创') ||
      ((text.includes('粉毛') || text.includes('粉发') || text.includes('樱发')) && (text.includes('金瞳') || text.includes('黄瞳') || text.includes('金眼') || text.includes('琥珀'))) ||
      ((text.includes('粉毛') || text.includes('粉发') || text.includes('樱发')) && text.includes('少女身材')) ||
      ((text.includes('金瞳') || text.includes('黄瞳') || text.includes('金眼') || text.includes('琥珀')) && text.includes('少女身材'))
    ) {
      baseProject = parseAndTransmuteDataset(sylphieData, '星辉蝶愿 · 希尔菲 (Sylphie - Starlight Chrysalis Original Masterpiece)', options);
    }
    // Direct Recognition of Master Mika
    else if (text.includes('弥香') || text.includes('mika') || (text.includes('天使') && text.includes('圣三一'))) {
      baseProject = createMasterMikaBaseProject();
    }
    // Action Pose Matching (Covering all poses from D:\文档\图片\X and classic styles)
    else if (pose === 'stretch') {
      baseProject = parseAndTransmuteDataset(stretchData, '晨光舒展 · 伸懒腰少女 (Morning Stretch - Soft Dawn Maiden)', options);
    } else if (pose === 'glance') {
      baseProject = parseAndTransmuteDataset(glanceData, '高贵晚宴 · 露背礼服回眸 (Backless Evening Gown Glance)', options);
    } else if (pose === 'tennis') {
      baseProject = parseAndTransmuteDataset(tennisData, '青春活力 · 银发红瞳网球少女 (Athletic Tennis Girl)', options);
    } else if (pose === 'ethereal') {
      baseProject = parseAndTransmuteDataset(etherealData, '空灵幻梦 · 悬浮抱膝精灵 (Ethereal Floating Spirit)', options);
    } else if (pose === 'makima') {
      baseProject = parseAndTransmuteDataset(makimaData, '支配恶魔 · 单手遮面狂气魔眼 (Makima - Dominant Gaze)', options);
    } else if (pose === 'miku') {
      baseProject = parseAndTransmuteDataset(mikuData, '清爽夏日 · 初音双马尾泳装原画 (Miku Summer Swimwear)', options);
    } else if (pose === 'foxear') {
      baseProject = parseAndTransmuteDataset(foxearData, '田园花海 · 金发兽耳抚花少女 (Fox-Ear Field Maiden)', options);
    } else if (pose === 'lounge') {
      baseProject = parseAndTransmuteDataset(kisakiData, '玄龙门主 · 龙华妃姬 (Kisaki - Blue Archive Summer Lounger)', options);
    } else if (pose === 'tactical') {
      baseProject = parseAndTransmuteDataset(shirokoData, '阿拜多斯 · 砂狼白子·恐怖 (Shiroko Terror - Blue Archive)', options);
    } else if (pose === 'apple') {
      baseProject = parseAndTransmuteDataset(ricoData, '光影交错 · 苹果少女 (Rico - Chiaroscuro Anime Girl)', options);
    } else if (pose === 'sketch') {
      baseProject = parseAndTransmuteDataset(peniaData, '手绘墨线 · Penia 粉发原画 (Authentic Manga Hand-drawn Sketch)', options);
    } else if (pose === 'gothic') {
      baseProject = parseAndTransmuteDataset(vampireData, '银发赤瞳哥特吸血鬼少女 · 绯月玫瑰', options);
    } else if (pose === 'cyber') {
      baseProject = parseAndTransmuteDataset(cyberpunkData, '赛博朋克猫耳机械娘 · 霓虹巡游', options);
    } else if (pose === 'shrine') {
      baseProject = parseAndTransmuteDataset(shrineData, '极黑长直和服巫女 · 绯樱祈愿', options);
    } else if (pose === 'magical') {
      baseProject = parseAndTransmuteDataset(magicalData, '星之魔法少女 · 璨星华章', options);
    } else {
      // Default to crisp beach Plana masterwork with optional transmutation
      baseProject = parseAndTransmuteDataset(planaData, '什亭之匣 · 普拉娜 (Plana - Blue Archive Summer Beach)', options);
    }

    // Deliver authentic high-precision vector strokes (or scale only if explicitly requested)
    if (options.density === 10000) {
      return StepDensityEngine.scaleProjectToDensity(baseProject, 10000);
    }
    return baseProject;
  }

  /**
   * Presets for instant creative exploration across all archetypes & actions
   */
  static getPresetPrompts() {
    return [
      { label: '🦋 星辉蝶愿 · 希尔菲 (原创)', prompt: '原创粉毛金瞳少女，流光星蝶魔法少女希尔菲，浮空召唤姿态与星空洛丽塔法裙' },
      { label: '🌅 晨光伸懒腰少女', prompt: '粉发晨光伸懒腰少女，微风白衬衫，仰头闭目治愈姿态' },
      { label: '✨ 高贵露背礼服回眸', prompt: '银紫发优雅大露背晚礼服回眸少女，紫花发饰高贵侧颜' },
      { label: '🎾 活力网球运动少女', prompt: '银发红瞳网球少女，运动挥拍擦汗，红白短裙活力跃动' },
      { label: '🕊️ 空灵悬浮抱膝精灵', prompt: '空灵悬浮抱膝精灵少女，赤足飘逸白裙，幽灵小精灵环绕' },
      { label: '👁️ 支配恶魔遮面狂气', prompt: '电锯人玛奇玛单手遮面，金色同心圆魔眼，西装领带狂气神情' },
      { label: '🌊 初音双马尾泳装手绘', prompt: '初音未来长双马尾泳装，清爽夏日海滩手绘签名原画' },
      { label: '🌾 田园花海狐耳少女', prompt: '金发兽耳花田抚花少女，麻花辫万寿菊暖阳田园风' },
      { label: '🖤 玄龙门主沙滩躺椅', prompt: '玄龙门主龙华妃姬沙滩躺椅，黑金长袍推墨镜' },
      { label: '🌊 什亭之匣普拉娜', prompt: '什亭之匣普拉娜泳装海滩，白发红瞳与霓虹光环' },
      { label: '🐺 砂狼白子狼耳战术', prompt: '阿拜多斯砂狼白子·恐怖，银发狼耳战术立领俯视' },
      { label: '🍎 蓝发蕾丝捧苹果', prompt: '光影交错苹果少女，双手托苹果，斜切晨曦强光' },
      { label: '🎨 手绘墨线 Penia 原画', prompt: '手绘墨线 Penia 粉发原画，真实漫画笔墨质感与原画签名' },
    ];
  }

  static getSystemPromptForLlm(): string {
    return `你是一个精通二次元动漫矢量图（SVG）与代码绘制的 AI 智能体。
根据用户设定的任意角色形象与动作姿态，生成符合平台高精度规范的矢量工程。
阶段规范：01初版草图 -> 02底色铺设 -> 03结构阴影 -> 04细部雕琢 -> 05神圣光晕。
特征规范：必须拥有 DoG 墨线勾勒（line_art）为骨架，大块面纯净赛璐璐平涂（hair, clothes, iris）为基底，拒绝油画杂乱碎斑。`;
  }
}
