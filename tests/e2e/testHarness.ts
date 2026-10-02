/**
 * AI Vector Anime Studio - Comprehensive E2E Test Harness & Driver
 *
 * Provides opaque-box simulation, DOM fixtures, SVG validator, state machines,
 * diff verifiers, export/import testers, and assertion matchers for all 21 features.
 */

import * as nodeTest from 'node:test';
import * as nodeAssert from 'node:assert/strict';

export type LayerId = 'all' | 'background' | 'skin_body' | 'hair' | 'iris' | 'clothes' | 'shadow_highlight' | 'line_art';

export interface StageMetadata {
  id: string;
  name: string;
  description: string;
  startStep: number;
  endStep: number;
}

export interface MicroStep {
  id: number;
  stageId: string;
  layerId: LayerId;
  title: string;
  description: string;
  xmlPatch: string;
  addedLines: string[];
  removedLines: string[];
  elementId?: string;
  strokeColor?: string;
}

export interface VirtualDomNode {
  id: string;
  tag: string;
  layer: LayerId;
  step: number;
  attributes: Record<string, string>;
  children?: VirtualDomNode[];
}

export interface TransformState {
  x: number;
  y: number;
  scale: number;
}

export interface ProjectData {
  title: string;
  version: string;
  viewBox: string;
  canvasWidth: number;
  canvasHeight: number;
  stages: StageMetadata[];
  steps: MicroStep[];
}

/**
 * Built-in Canonical 43-Step 5-Stage "Purple-haired Gold-eyed Anime Girl" Data
 */
export function createDefaultAnimeProject(): ProjectData {
  const stages: StageMetadata[] = [
    { id: 'stage-1', name: '01初版草图', description: '头部轮廓与十字定位网格', startStep: 1, endStep: 7 },
    { id: 'stage-2', name: '02局部细化', description: '面部基底、发型主干与水手服领口', startStep: 8, endStep: 16 },
    { id: 'stage-3', name: '03对比修正', description: '深色发影、颈部投影与线条勾勒', startStep: 17, endStep: 26 },
    { id: 'stage-4', name: '04虹膜笔触', description: '琥珀金瞳、放射瞳纹与星芒高光', startStep: 27, endStep: 35 },
    { id: 'stage-5', name: '05增光润部', description: '元气腮红、发顶天使光环与整体氛围高光', startStep: 36, endStep: 43 },
  ];

  const steps: MicroStep[] = [
    // Stage 1: Sketch (1-7)
    {
      id: 1,
      stageId: 'stage-1',
      layerId: 'line_art',
      title: '头部圆形定位草图',
      description: '绘制头部基础圆形骨架',
      xmlPatch: '<circle id="sketch-head-circle" cx="400" cy="380" r="160" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.4" />',
      addedLines: ['+ <circle id="sketch-head-circle" cx="400" cy="380" r="160" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.4" />'],
      removedLines: [],
      elementId: 'sketch-head-circle',
    },
    {
      id: 2,
      stageId: 'stage-1',
      layerId: 'line_art',
      title: '面部十字基准中轴线',
      description: '确定面部正侧倾角与三庭五眼对齐轴',
      xmlPatch: '<path id="sketch-crosshair" d="M 400 200 L 400 560 M 240 395 L 560 395" stroke="#38BDF8" stroke-dasharray="4,4" opacity="0.4" />',
      addedLines: ['+ <path id="sketch-crosshair" d="M 400 200 L 400 560 M 240 395 L 560 395" stroke="#38BDF8" stroke-dasharray="4,4" opacity="0.4" />'],
      removedLines: [],
      elementId: 'sketch-crosshair',
    },
    {
      id: 3,
      stageId: 'stage-1',
      layerId: 'line_art',
      title: '下颌与下巴轮廓辅助线',
      description: 'V字形柔和下颌弧线骨架',
      xmlPatch: '<path id="sketch-jawline" d="M 270 370 Q 280 470 400 530 Q 520 470 530 370" stroke="#38BDF8" fill="none" opacity="0.4" />',
      addedLines: ['+ <path id="sketch-jawline" d="M 270 370 Q 280 470 400 530 Q 520 470 530 370" stroke="#38BDF8" fill="none" opacity="0.4" />'],
      removedLines: [],
      elementId: 'sketch-jawline',
    },
    {
      id: 4,
      stageId: 'stage-1',
      layerId: 'iris',
      title: '眼眶外切定位框',
      description: '左右双眼黄金分割定位矩形',
      xmlPatch: '<rect id="sketch-eye-box-l" x="310" y="375" width="60" height="40" stroke="#38BDF8" fill="none" opacity="0.3" /><rect id="sketch-eye-box-r" x="430" y="375" width="60" height="40" stroke="#38BDF8" fill="none" opacity="0.3" />',
      addedLines: [
        '+ <rect id="sketch-eye-box-l" x="310" y="375" width="60" height="40" stroke="#38BDF8" fill="none" opacity="0.3" />',
        '+ <rect id="sketch-eye-box-r" x="430" y="375" width="60" height="40" stroke="#38BDF8" fill="none" opacity="0.3" />',
      ],
      removedLines: [],
      elementId: 'sketch-eye-box-l',
    },
    {
      id: 5,
      stageId: 'stage-1',
      layerId: 'hair',
      title: '发际线与呆毛草图',
      description: '头顶发卷与侧发体块草稿',
      xmlPatch: '<path id="sketch-hair-mass" d="M 230 360 C 230 180 570 180 570 360" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.3" />',
      addedLines: ['+ <path id="sketch-hair-mass" d="M 230 360 C 230 180 570 180 570 360" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.3" />'],
      removedLines: [],
      elementId: 'sketch-hair-mass',
    },
    {
      id: 6,
      stageId: 'stage-1',
      layerId: 'clothes',
      title: '颈部与锁骨肩膀结构',
      description: '上半身姿态结构引导线',
      xmlPatch: '<path id="sketch-torso-guide" d="M 370 520 L 370 590 M 430 520 L 430 590 M 260 670 Q 400 600 540 670" stroke="#38BDF8" fill="none" opacity="0.3" />',
      addedLines: ['+ <path id="sketch-torso-guide" d="M 370 520 L 370 590 M 430 520 L 430 590 M 260 670 Q 400 600 540 670" stroke="#38BDF8" fill="none" opacity="0.3" />'],
      removedLines: [],
      elementId: 'sketch-torso-guide',
    },
    {
      id: 7,
      stageId: 'stage-1',
      layerId: 'line_art',
      title: '草图收敛校准',
      description: '全貌草图线稿锁定，准备进入局部细化',
      xmlPatch: '<path id="sketch-lock-mark" d="M 400 200 L 400 210" stroke="#0284C7" stroke-width="2" />',
      addedLines: ['+ <path id="sketch-lock-mark" d="M 400 200 L 400 210" stroke="#0284C7" stroke-width="2" />'],
      removedLines: [],
      elementId: 'sketch-lock-mark',
    },

    // Stage 2: Contours & Structure (8-16)
    {
      id: 8,
      stageId: 'stage-2',
      layerId: 'shadow_highlight',
      title: '面部与颈部基色底板',
      description: '柔白肌肤色彩填充层',
      xmlPatch: '<polygon id="base-skin-mesh" points="275,370 285,465 400,525 515,465 525,370" fill="#FFF7ED" />',
      addedLines: ['+ <polygon id="base-skin-mesh" points="275,370 285,465 400,525 515,465 525,370" fill="#FFF7ED" />'],
      removedLines: [],
      elementId: 'base-skin-mesh',
    },
    {
      id: 9,
      stageId: 'stage-2',
      layerId: 'hair',
      title: '后发披肩体块',
      description: '深紫后发底色填充',
      xmlPatch: '<path id="back-hair-silhouette" d="M 210 350 C 190 520 220 700 250 750 C 300 700 500 700 550 750 C 580 700 610 520 590 350 Z" fill="#2E1065" />',
      addedLines: ['+ <path id="back-hair-silhouette" d="M 210 350 C 190 520 220 700 250 750 C 300 700 500 700 550 750 C 580 700 610 520 590 350 Z" fill="#2E1065" />'],
      removedLines: [],
      elementId: 'back-hair-silhouette',
    },
    {
      id: 10,
      stageId: 'stage-2',
      layerId: 'clothes',
      title: '水手服深蓝翻领',
      description: '经典学院风格翻领轮廓',
      xmlPatch: '<polygon id="uniform-sailor-collar" points="300,580 400,670 500,580 540,680 260,680" fill="#1E1B4B" />',
      addedLines: ['+ <polygon id="uniform-sailor-collar" points="300,580 400,670 500,580 540,680 260,680" fill="#1E1B4B" />'],
      removedLines: [],
      elementId: 'uniform-sailor-collar',
    },
    {
      id: 11,
      stageId: 'stage-2',
      layerId: 'clothes',
      title: '纯白衬衣前襟',
      description: '平整白色衬衣胸前区域',
      xmlPatch: '<polygon id="uniform-shirt-chest" points="360,560 440,560 420,660 380,660" fill="#F8FAFC" />',
      addedLines: ['+ <polygon id="uniform-shirt-chest" points="360,560 440,560 420,660 380,660" fill="#F8FAFC" />'],
      removedLines: [],
      elementId: 'uniform-shirt-chest',
    },
    {
      id: 12,
      stageId: 'stage-2',
      layerId: 'clothes',
      title: '猩红领结丝带',
      description: '领口中心红色领结主体',
      xmlPatch: '<path id="uniform-red-ribbon" d="M 390 620 L 360 660 L 400 645 L 440 660 L 410 620 Z" fill="#DC2626" />',
      addedLines: ['+ <path id="uniform-red-ribbon" d="M 390 620 L 360 660 L 400 645 L 440 660 L 410 620 Z" fill="#DC2626" />'],
      removedLines: [],
      elementId: 'uniform-red-ribbon',
    },
    {
      id: 13,
      stageId: 'stage-2',
      layerId: 'iris',
      title: '眼白巩膜弧面',
      description: '柔和白色巩膜与微弱天蓝底色',
      xmlPatch: '<ellipse id="sclera-left" cx="340" cy="395" rx="26" ry="18" fill="#F1F5F9" /><ellipse id="sclera-right" cx="460" cy="395" rx="26" ry="18" fill="#F1F5F9" />',
      addedLines: [
        '+ <ellipse id="sclera-left" cx="340" cy="395" rx="26" ry="18" fill="#F1F5F9" />',
        '+ <ellipse id="sclera-right" cx="460" cy="395" rx="26" ry="18" fill="#F1F5F9" />',
      ],
      removedLines: [],
      elementId: 'sclera-left',
    },
    {
      id: 14,
      stageId: 'stage-2',
      layerId: 'hair',
      title: '前额碎刘海基底',
      description: '轻盈修饰脸型的碎发分簇',
      xmlPatch: '<path id="front-bangs-base" d="M 270 300 Q 340 370 360 340 Q 400 375 420 335 Q 460 370 530 300 Z" fill="#6D28D9" />',
      addedLines: ['+ <path id="front-bangs-base" d="M 270 300 Q 340 370 360 340 Q 400 375 420 335 Q 460 370 530 300 Z" fill="#6D28D9" />'],
      removedLines: [],
      elementId: 'front-bangs-base',
    },
    {
      id: 15,
      stageId: 'stage-2',
      layerId: 'line_art',
      title: '精致下颌线勾勒',
      description: '少女秀丽的面部下巴轮廓精细描边',
      xmlPatch: '<path id="line-jaw" d="M 280 370 Q 290 460 400 520 Q 510 460 520 370" stroke="#7C2D12" stroke-width="2" fill="none" stroke-linecap="round" />',
      addedLines: ['+ <path id="line-jaw" d="M 280 370 Q 290 460 400 520 Q 510 460 520 370" stroke="#7C2D12" stroke-width="2" fill="none" stroke-linecap="round" />'],
      removedLines: [],
      elementId: 'line-jaw',
    },
    {
      id: 16,
      stageId: 'stage-2',
      layerId: 'line_art',
      title: '耳朵与耳廓线条',
      description: '两侧小巧耳轮线条',
      xmlPatch: '<path id="line-ears" d="M 278 385 Q 265 410 278 435 M 522 385 Q 535 410 522 435" stroke="#7C2D12" stroke-width="1.8" fill="none" />',
      addedLines: ['+ <path id="line-ears" d="M 278 385 Q 265 410 278 435 M 522 385 Q 535 410 522 435" stroke="#7C2D12" stroke-width="1.8" fill="none" />'],
      removedLines: [],
      elementId: 'line-ears',
    },

    // Stage 3: Flat Colors & Shadows (17-26)
    {
      id: 17,
      stageId: 'stage-3',
      layerId: 'shadow_highlight',
      title: '颈部下颌投射阴影',
      description: '下巴在颈部投下的柔和淡紫暗部',
      xmlPatch: '<polygon id="neck-drop-shadow" points="365,520 400,555 435,520 400,522" fill="#E9D5FF" opacity="0.65" />',
      addedLines: ['+ <polygon id="neck-drop-shadow" points="365,520 400,555 435,520 400,522" fill="#E9D5FF" opacity="0.65" />'],
      removedLines: [],
      elementId: 'neck-drop-shadow',
    },
    {
      id: 18,
      stageId: 'stage-3',
      layerId: 'shadow_highlight',
      title: '前额刘海落影',
      description: '发丝在额头留下的半透明层次阴影',
      xmlPatch: '<path id="forehead-bangs-shadow" d="M 290 320 Q 350 380 400 350 Q 450 380 510 320" fill="#F3E8FF" opacity="0.5" />',
      addedLines: ['+ <path id="forehead-bangs-shadow" d="M 290 320 Q 350 380 400 350 Q 450 380 510 320" fill="#F3E8FF" opacity="0.5" />'],
      removedLines: [],
      elementId: 'forehead-bangs-shadow',
    },
    {
      id: 19,
      stageId: 'stage-3',
      layerId: 'hair',
      title: '鬓角两缕侧发',
      description: '垂落胸前的柔亮侧发',
      xmlPatch: '<path id="hair-sidelocks" d="M 260 360 C 250 480 270 560 280 600 C 285 540 280 440 290 370 M 540 360 C 550 480 530 560 520 600 C 515 540 520 440 510 370" fill="#7C3AED" />',
      addedLines: ['+ <path id="hair-sidelocks" d="M 260 360 C 250 480 270 560 280 600 C 285 540 280 440 290 370 M 540 360 C 550 480 530 560 520 600 C 515 540 520 440 510 370" fill="#7C3AED" />'],
      removedLines: [],
      elementId: 'hair-sidelocks',
    },
    {
      id: 20,
      stageId: 'stage-3',
      layerId: 'hair',
      title: '头顶元气呆毛',
      description: '俏皮灵动的弧线头顶呆毛',
      xmlPatch: '<path id="hair-ahoge" d="M 400 230 Q 430 150 460 170 Q 430 185 405 235" fill="#8B5CF6" />',
      addedLines: ['+ <path id="hair-ahoge" d="M 400 230 Q 430 150 460 170 Q 430 185 405 235" fill="#8B5CF6" />'],
      removedLines: [],
      elementId: 'hair-ahoge',
    },
    {
      id: 21,
      stageId: 'stage-3',
      layerId: 'line_art',
      title: '上眼睑浓密睫毛轮廓',
      description: '富有二次元张力的深褐色浓密上睫毛',
      xmlPatch: '<path id="eyelashes-upper-left" d="M 314 394 Q 340 376 366 390" stroke="#1E1B4B" stroke-width="3.5" fill="none" stroke-linecap="round" /><path id="eyelashes-upper-right" d="M 434 390 Q 460 376 486 394" stroke="#1E1B4B" stroke-width="3.5" fill="none" stroke-linecap="round" />',
      addedLines: [
        '+ <path id="eyelashes-upper-left" d="M 314 394 Q 340 376 366 390" stroke="#1E1B4B" stroke-width="3.5" fill="none" stroke-linecap="round" />',
        '+ <path id="eyelashes-upper-right" d="M 434 390 Q 460 376 486 394" stroke="#1E1B4B" stroke-width="3.5" fill="none" stroke-linecap="round" />',
      ],
      removedLines: [],
      elementId: 'eyelashes-upper-left',
    },
    {
      id: 22,
      stageId: 'stage-3',
      layerId: 'line_art',
      title: '灵动双眼皮线条',
      description: '纤细双眼皮褶皱折线',
      xmlPatch: '<path id="double-eyelids" d="M 322 382 Q 340 373 358 382 M 442 382 Q 460 373 478 382" stroke="#9A3412" stroke-width="1.2" fill="none" />',
      addedLines: ['+ <path id="double-eyelids" d="M 322 382 Q 340 373 358 382 M 442 382 Q 460 373 478 382" stroke="#9A3412" stroke-width="1.2" fill="none" />'],
      removedLines: [],
      elementId: 'double-eyelids',
    },
    {
      id: 23,
      stageId: 'stage-3',
      layerId: 'line_art',
      title: '温柔淡紫眉毛',
      description: '弯弯细眉与发色呼应',
      xmlPatch: '<path id="eyebrows" d="M 318 360 Q 340 350 365 362 M 435 362 Q 460 350 482 360" stroke="#6D28D9" stroke-width="2.2" stroke-linecap="round" fill="none" />',
      addedLines: ['+ <path id="eyebrows" d="M 318 360 Q 340 350 365 362 M 435 362 Q 460 350 482 360" stroke="#6D28D9" stroke-width="2.2" stroke-linecap="round" fill="none" />'],
      removedLines: [],
      elementId: 'eyebrows',
    },
    {
      id: 24,
      stageId: 'stage-3',
      layerId: 'line_art',
      title: '小巧鼻尖点缀',
      description: '微型点线表现精致鼻尖与鼻影',
      xmlPatch: '<circle id="nose-tip" cx="400" cy="445" r="1.5" fill="#B45309" />',
      addedLines: ['+ <circle id="nose-tip" cx="400" cy="445" r="1.5" fill="#B45309" />'],
      removedLines: [],
      elementId: 'nose-tip',
    },
    {
      id: 25,
      stageId: 'stage-3',
      layerId: 'line_art',
      title: '微笑嘴唇轮廓',
      description: '微扬的淡红樱桃唇线',
      xmlPatch: '<path id="mouth-smile" d="M 388 478 Q 400 486 412 478" stroke="#BE123C" stroke-width="2" stroke-linecap="round" fill="none" />',
      addedLines: ['+ <path id="mouth-smile" d="M 388 478 Q 400 486 412 478" stroke="#BE123C" stroke-width="2" stroke-linecap="round" fill="none" />'],
      removedLines: [],
      elementId: 'mouth-smile',
    },
    {
      id: 26,
      stageId: 'stage-3',
      layerId: 'clothes',
      title: '水手领口白色条纹装饰',
      description: '经典双白条纹滚边',
      xmlPatch: '<path id="collar-white-stripes" d="M 305 600 L 400 680 L 495 600" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity="0.9" />',
      addedLines: ['+ <path id="collar-white-stripes" d="M 305 600 L 400 680 L 495 600" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity="0.9" />'],
      removedLines: [],
      elementId: 'collar-white-stripes',
    },

    // Stage 4: Iris Details & Golden Gaze (27-35)
    {
      id: 27,
      stageId: 'stage-4',
      layerId: 'iris',
      title: '金色虹膜基础椭圆',
      description: '饱满深琥珀金眼瞳底色',
      xmlPatch: '<ellipse id="iris-base-left" cx="340" cy="397" rx="16" ry="18" fill="#D97706" /><ellipse id="iris-base-right" cx="460" cy="397" rx="16" ry="18" fill="#D97706" />',
      addedLines: [
        '+ <ellipse id="iris-base-left" cx="340" cy="397" rx="16" ry="18" fill="#D97706" />',
        '+ <ellipse id="iris-base-right" cx="460" cy="397" rx="16" ry="18" fill="#D97706" />',
      ],
      removedLines: [],
      elementId: 'iris-base-left',
    },
    {
      id: 28,
      stageId: 'stage-4',
      layerId: 'iris',
      title: '深邃瞳孔核心',
      description: '黑褐色深邃瞳心吸睛点',
      xmlPatch: '<ellipse id="pupil-left" cx="340" cy="397" rx="7" ry="9" fill="#1C1917" /><ellipse id="pupil-right" cx="460" cy="397" rx="7" ry="9" fill="#1C1917" />',
      addedLines: [
        '+ <ellipse id="pupil-left" cx="340" cy="397" rx="7" ry="9" fill="#1C1917" />',
        '+ <ellipse id="pupil-right" cx="460" cy="397" rx="7" ry="9" fill="#1C1917" />',
      ],
      removedLines: [],
      elementId: 'pupil-left',
    },
    {
      id: 29,
      stageId: 'stage-4',
      layerId: 'iris',
      title: '金辉下弦月渐变',
      description: '眼眸下半部明快亮黄璀璨月牙辉光',
      xmlPatch: '<path id="iris-golden-crescent" d="M 326 400 A 14 14 0 0 0 354 400 Q 340 414 326 400 M 446 400 A 14 14 0 0 0 474 400 Q 460 414 446 400" fill="#FBBF24" opacity="0.9" />',
      addedLines: ['+ <path id="iris-golden-crescent" d="M 326 400 A 14 14 0 0 0 354 400 Q 340 414 326 400 M 446 400 A 14 14 0 0 0 474 400 Q 460 414 446 400" fill="#FBBF24" opacity="0.9" />'],
      removedLines: [],
      elementId: 'iris-golden-crescent',
    },
    {
      id: 30,
      stageId: 'stage-4',
      layerId: 'iris',
      title: '精细放射状瞳孔纹理',
      description: '微小放射光纹提升眼眸通透感',
      xmlPatch: '<g id="iris-texture-rays" stroke="#FEF08A" stroke-width="0.75" opacity="0.7"><line x1="334" y1="404" x2="337" y2="401" /><line x1="346" y1="404" x2="343" y2="401" /><line x1="454" y1="404" x2="457" y2="401" /><line x1="466" y1="404" x2="463" y2="401" /></g>',
      addedLines: ['+ <g id="iris-texture-rays" stroke="#FEF08A" stroke-width="0.75" opacity="0.7">...4 lines...</g>'],
      removedLines: [],
      elementId: 'iris-texture-rays',
    },
    {
      id: 31,
      stageId: 'stage-4',
      layerId: 'iris',
      title: '主光源大高光光斑',
      description: '十点钟方向明亮纯白主聚光斑',
      xmlPatch: '<circle id="highlight-primary-l" cx="334" cy="390" r="5" fill="#FFFFFF" /><circle id="highlight-primary-r" cx="454" cy="390" r="5" fill="#FFFFFF" />',
      addedLines: [
        '+ <circle id="highlight-primary-l" cx="334" cy="390" r="5" fill="#FFFFFF" />',
        '+ <circle id="highlight-primary-r" cx="454" cy="390" r="5" fill="#FFFFFF" />',
      ],
      removedLines: [],
      elementId: 'highlight-primary-l',
    },
    {
      id: 32,
      stageId: 'stage-4',
      layerId: 'iris',
      title: '天蓝色环境反光',
      description: '四点钟方向天空漫反射微弱淡蓝高光',
      xmlPatch: '<circle id="highlight-ambient-l" cx="347" cy="406" r="3.2" fill="#BAE6FD" opacity="0.85" /><circle id="highlight-ambient-r" cx="467" cy="406" r="3.2" fill="#BAE6FD" opacity="0.85" />',
      addedLines: [
        '+ <circle id="highlight-ambient-l" cx="347" cy="406" r="3.2" fill="#BAE6FD" opacity="0.85" />',
        '+ <circle id="highlight-ambient-r" cx="467" cy="406" r="3.2" fill="#BAE6FD" opacity="0.85" />',
      ],
      removedLines: [],
      elementId: 'highlight-ambient-l',
    },
    {
      id: 33,
      stageId: 'stage-4',
      layerId: 'iris',
      title: '璀璨星芒微型闪光点',
      description: '瞳孔边缘微型十字星光斑',
      xmlPatch: '<polygon id="star-sparkle-l" points="340,387 342,390 345,390 342,392 340,395 338,392 335,390 338,390" fill="#FFFFFF" opacity="0.95" />',
      addedLines: ['+ <polygon id="star-sparkle-l" points="340,387 342,390 345,390 342,392 340,395 338,392 335,390 338,390" fill="#FFFFFF" opacity="0.95" />'],
      removedLines: [],
      elementId: 'star-sparkle-l',
    },
    {
      id: 34,
      stageId: 'stage-4',
      layerId: 'line_art',
      title: '下眼睑细软睫毛',
      description: '点缀眼睑下缘的轻柔睫毛线条',
      xmlPatch: '<path id="eyelashes-lower" d="M 330 412 L 328 416 M 346 414 L 348 418 M 450 414 L 448 418 M 466 412 L 468 416" stroke="#451A03" stroke-width="1.2" />',
      addedLines: ['+ <path id="eyelashes-lower" d="M 330 412 L 328 416 M 346 414 L 348 418 M 450 414 L 448 418 M 466 412 L 468 416" stroke="#451A03" stroke-width="1.2" />'],
      removedLines: [],
      elementId: 'eyelashes-lower',
    },
    {
      id: 35,
      stageId: 'stage-4',
      layerId: 'iris',
      title: '眼眶深色阴影收束',
      description: '上眼皮对眼球上半部的遮蔽暗带',
      xmlPatch: '<path id="eyeball-top-shadow" d="M 314 394 Q 340 382 366 390 Z M 434 390 Q 460 382 486 394 Z" fill="#312E81" opacity="0.25" />',
      addedLines: ['+ <path id="eyeball-top-shadow" d="M 314 394 Q 340 382 366 390 Z M 434 390 Q 460 382 486 394 Z" fill="#312E81" opacity="0.25" />'],
      removedLines: [],
      elementId: 'eyeball-top-shadow',
    },

    // Stage 5: Gloss, Atmosphere & Polish (36-43)
    {
      id: 36,
      stageId: 'stage-5',
      layerId: 'shadow_highlight',
      title: '粉嫩元气腮红底色',
      description: '两颊少女元气蜜桃粉晕染',
      xmlPatch: '<ellipse id="blush-soft-left" cx="308" cy="438" rx="24" ry="12" fill="#FDA4AF" opacity="0.45" /><ellipse id="blush-soft-right" cx="492" cy="438" rx="24" ry="12" fill="#FDA4AF" opacity="0.45" />',
      addedLines: [
        '+ <ellipse id="blush-soft-left" cx="308" cy="438" rx="24" ry="12" fill="#FDA4AF" opacity="0.45" />',
        '+ <ellipse id="blush-soft-right" cx="492" cy="438" rx="24" ry="12" fill="#FDA4AF" opacity="0.45" />',
      ],
      removedLines: [],
      elementId: 'blush-soft-left',
    },
    {
      id: 37,
      stageId: 'stage-5',
      layerId: 'shadow_highlight',
      title: '娇羞斜线纹理腮红笔触',
      description: '日系经典害羞斜线条',
      xmlPatch: '<g id="blush-hatch-marks" stroke="#F43F5E" stroke-width="1.5" stroke-linecap="round" opacity="0.6"><line x1="300" y1="432" x2="308" y2="442" /><line x1="308" y1="432" x2="316" y2="442" /><line x1="484" y1="432" x2="492" y2="442" /><line x1="492" y1="432" x2="500" y2="442" /></g>',
      addedLines: ['+ <g id="blush-hatch-marks" stroke="#F43F5E" stroke-width="1.5" stroke-linecap="round" opacity="0.6">...4 lines...</g>'],
      removedLines: [],
      elementId: 'blush-hatch-marks',
    },
    {
      id: 38,
      stageId: 'stage-5',
      layerId: 'hair',
      title: '发顶天使光环弧段',
      description: '紫色秀发顶部的纯白高光带（天使之环）',
      xmlPatch: '<path id="hair-angel-ring" d="M 280 270 Q 400 290 520 270" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="16,8,24,6,12" stroke-linecap="round" fill="none" opacity="0.85" />',
      addedLines: ['+ <path id="hair-angel-ring" d="M 280 270 Q 400 290 520 270" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="16,8,24,6,12" stroke-linecap="round" fill="none" opacity="0.85" />'],
      removedLines: [],
      elementId: 'hair-angel-ring',
    },
    {
      id: 39,
      stageId: 'stage-5',
      layerId: 'shadow_highlight',
      title: '呆毛边缘轮廓光',
      description: '灵动呆毛的边缘发丝透亮反光',
      xmlPatch: '<path id="ahoge-rim-light" d="M 405 230 Q 432 155 458 172" stroke="#E9D5FF" stroke-width="1.8" fill="none" />',
      addedLines: ['+ <path id="ahoge-rim-light" d="M 405 230 Q 432 155 458 172" stroke="#E9D5FF" stroke-width="1.8" fill="none" />'],
      removedLines: [],
      elementId: 'ahoge-rim-light',
    },
    {
      id: 40,
      stageId: 'stage-5',
      layerId: 'shadow_highlight',
      title: '樱桃润泽唇蜜反光',
      description: '下唇中心圆润高光点',
      xmlPatch: '<ellipse id="lip-gloss-glint" cx="400" cy="483" rx="2" ry="1.2" fill="#FFFFFF" opacity="0.9" />',
      addedLines: ['+ <ellipse id="lip-gloss-glint" cx="400" cy="483" rx="2" ry="1.2" fill="#FFFFFF" opacity="0.9" />'],
      removedLines: [],
      elementId: 'lip-gloss-glint',
    },
    {
      id: 41,
      stageId: 'stage-5',
      layerId: 'clothes',
      title: '金色领结宝石胸针',
      description: '领结中央八角璀璨纯金胸针',
      xmlPatch: '<circle id="ribbon-gold-brooch" cx="400" cy="625" r="7" fill="#F59E0B" stroke="#FEF3C7" stroke-width="1.5" />',
      addedLines: ['+ <circle id="ribbon-gold-brooch" cx="400" cy="625" r="7" fill="#F59E0B" stroke="#FEF3C7" stroke-width="1.5" />'],
      removedLines: [],
      elementId: 'ribbon-gold-brooch',
    },
    {
      id: 42,
      stageId: 'stage-5',
      layerId: 'shadow_highlight',
      title: '梦幻星光环境粒子',
      description: '漂浮在身侧的微型金黄光晕点',
      xmlPatch: '<g id="ambient-particles" fill="#FDE047" opacity="0.75"><circle cx="230" cy="310" r="2.5" /><circle cx="560" cy="340" r="3" /><circle cx="210" cy="510" r="2" /><circle cx="580" cy="530" r="2.5" /></g>',
      addedLines: ['+ <g id="ambient-particles" fill="#FDE047" opacity="0.75">...4 circles...</g>'],
      removedLines: [],
      elementId: 'ambient-particles',
    },
    {
      id: 43,
      stageId: 'stage-5',
      layerId: 'shadow_highlight',
      title: '最终全图氛围融合调色',
      description: '全图顶部微弱洋红/金黄渐变光照覆盖',
      xmlPatch: '<rect id="final-ambient-overlay" x="0" y="0" width="800" height="1000" fill="#FDF4FF" opacity="0.04" />',
      addedLines: ['+ <rect id="final-ambient-overlay" x="0" y="0" width="800" height="1000" fill="#FDF4FF" opacity="0.04" />'],
      removedLines: [],
      elementId: 'final-ambient-overlay',
    },
  ];

  return {
    title: '紫发金瞳少女 (Purple-haired Gold-eyed Anime Girl)',
    version: '1.0.0',
    viewBox: '0 0 800 1000',
    canvasWidth: 800,
    canvasHeight: 1000,
    stages,
    steps,
  };
}

/**
 * Coordinate Math for Canvas Pan, Zoom, Reset, and Fit
 */
export class CanvasMathEngine {
  static readonly MIN_SCALE = 0.1;
  static readonly MAX_SCALE = 10.0;
  static readonly DEFAULT_WIDTH = 800;
  static readonly DEFAULT_HEIGHT = 1000;

  static clampScale(scale: number): number {
    if (isNaN(scale) || !isFinite(scale)) return 1.0;
    return Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, scale));
  }

  static reset(): TransformState {
    return { x: 0, y: 0, scale: 1.0 };
  }

  static pan(current: TransformState, dx: number, dy: number): TransformState {
    const validDx = !isFinite(dx) ? 0 : dx;
    const validDy = !isFinite(dy) ? 0 : dy;
    return {
      x: current.x + validDx,
      y: current.y + validDy,
      scale: current.scale,
    };
  }

  static zoomAt(
    current: TransformState,
    cursorX: number,
    cursorY: number,
    delta: number,
    zoomFactor = 0.0015
  ): TransformState {
    const cX = isNaN(cursorX) ? 400 : cursorX;
    const cY = isNaN(cursorY) ? 500 : cursorY;
    const oldScale = current.scale;
    // delta > 0 is zoom out, delta < 0 is zoom in
    const scaleFactor = Math.exp(-delta * zoomFactor);
    const newScale = this.clampScale(oldScale * scaleFactor);

    if (newScale === oldScale) {
      return current;
    }

    const ratio = newScale / oldScale;
    const newX = cX - (cX - current.x) * ratio;
    const newY = cY - (cY - current.y) * ratio;

    return {
      x: Math.round(newX * 100) / 100,
      y: Math.round(newY * 100) / 100,
      scale: Math.round(newScale * 1000) / 1000,
    };
  }

  static fitToScreen(
    containerWidth: number,
    containerHeight: number,
    worldWidth = 800,
    worldHeight = 1000,
    padding = 32
  ): TransformState {
    const availW = Math.max(10, containerWidth - padding * 2);
    const availH = Math.max(10, containerHeight - padding * 2);

    const scaleW = availW / worldWidth;
    const scaleH = availH / worldHeight;
    const fitScale = this.clampScale(Math.min(scaleW, scaleH));

    const renderedW = worldWidth * fitScale;
    const renderedH = worldHeight * fitScale;

    const x = Math.round(((containerWidth - renderedW) / 2) * 100) / 100;
    const y = Math.round(((containerHeight - renderedH) / 2) * 100) / 100;

    return {
      x,
      y,
      scale: Math.round(fitScale * 1000) / 1000,
    };
  }

  static get4x6GridLines(width = 800, height = 1000) {
    const verticalLines: number[] = [];
    const horizontalLines: number[] = [];

    // 4 columns -> 3 inner lines
    for (let col = 1; col < 4; col++) {
      verticalLines.push(Math.round((width / 4) * col * 100) / 100);
    }

    // 6 rows -> 5 inner lines
    for (let row = 1; row < 6; row++) {
      horizontalLines.push(Math.round((height / 6) * row * 100) / 100);
    }

    return {
      verticalLines, // [200, 400, 600]
      horizontalLines, // [166.67, 333.33, 500, 666.67, 833.33]
      columns: 4,
      rows: 6,
    };
  }
}

/**
 * Myers Line Diff & Delta Tokenizer
 */
export class DiffEngine {
  static computeMyersDiff(oldText: string, newText: string): { addedLines: string[]; removedLines: string[] } {
    const oldLines = oldText ? oldText.split('\n') : [];
    const newLines = newText ? newText.split('\n') : [];

    const addedLines: string[] = [];
    const removedLines: string[] = [];

    // Fast path for empty
    if (oldLines.length === 0) {
      return { addedLines: newLines.map((l) => `+ ${l}`), removedLines: [] };
    }
    if (newLines.length === 0) {
      return { addedLines: [], removedLines: oldLines.map((l) => `- ${l}`) };
    }

    // Line difference comparison
    const oldSet = new Set(oldLines);
    const newSet = new Set(newLines);

    for (const line of newLines) {
      if (!oldSet.has(line)) {
        addedLines.push(`+ ${line}`);
      }
    }
    for (const line of oldLines) {
      if (!newSet.has(line)) {
        removedLines.push(`- ${line}`);
      }
    }

    return { addedLines, removedLines };
  }

  static formatDiffHtml(addedLines: string[], removedLines: string[]): string {
    const parts: string[] = [];
    for (const r of removedLines) {
      parts.push(`<div class="diff-line diff-del text-red-400 bg-red-950/30">${escapeXml(r)}</div>`);
    }
    for (const a of addedLines) {
      parts.push(`<div class="diff-line diff-add text-emerald-400 bg-emerald-950/30">${escapeXml(a)}</div>`);
    }
    return parts.join('\n');
  }
}

/**
 * DOM Tree Extractor
 */
export class DomExtractor {
  static extractTree(steps: MicroStep[], upToStep: number): VirtualDomNode[] {
    const rootNodes: VirtualDomNode[] = [];
    const layerMap: Record<LayerId, VirtualDomNode> = {
      all: { id: 'group-all', tag: 'g', layer: 'all', step: 0, attributes: { id: 'layer-all' }, children: [] },
      background: { id: 'group-background', tag: 'g', layer: 'background', step: 0, attributes: { id: 'layer-background' }, children: [] },
      skin_body: { id: 'group-skin_body', tag: 'g', layer: 'skin_body', step: 0, attributes: { id: 'layer-skin_body' }, children: [] },
      hair: { id: 'group-hair', tag: 'g', layer: 'hair', step: 0, attributes: { id: 'layer-hair' }, children: [] },
      iris: { id: 'group-iris', tag: 'g', layer: 'iris', step: 0, attributes: { id: 'layer-iris' }, children: [] },
      clothes: { id: 'group-clothes', tag: 'g', layer: 'clothes', step: 0, attributes: { id: 'layer-clothes' }, children: [] },
      shadow_highlight: { id: 'group-shadow_highlight', tag: 'g', layer: 'shadow_highlight', step: 0, attributes: { id: 'layer-shadow_highlight' }, children: [] },
      line_art: { id: 'group-line_art', tag: 'g', layer: 'line_art', step: 0, attributes: { id: 'layer-line_art' }, children: [] },
    };

    for (let i = 0; i < Math.min(upToStep, steps.length); i++) {
      const step = steps[i];
      const targetLayer = layerMap[step.layerId] || layerMap['line_art'];
      const elemId = step.elementId || `step-elem-${step.id}`;

      const node: VirtualDomNode = {
        id: elemId,
        tag: parseTagFromXml(step.xmlPatch),
        layer: step.layerId,
        step: step.id,
        attributes: parseAttributesFromXml(step.xmlPatch),
      };

      if (!targetLayer.children) targetLayer.children = [];
      targetLayer.children.push(node);
    }

    // Only return layers that have children
    for (const layerId of ['background', 'skin_body', 'hair', 'iris', 'clothes', 'shadow_highlight', 'line_art'] as LayerId[]) {
      const layerNode = layerMap[layerId];
      if (layerNode && layerNode.children && layerNode.children.length > 0) {
        rootNodes.push(layerNode);
      }
    }

    return rootNodes;
  }
}

/**
 * Standalone SVG and PNG Exporter
 */
export class ExporterEngine {
  static generateStandaloneSvg(project: ProjectData, activeStep: number, visibleLayers: Record<LayerId, boolean>): string {
    const stepsToRender = project.steps.slice(0, activeStep);
    const layerSnippets: Record<LayerId, string[]> = {
      all: [],
      background: [],
      skin_body: [],
      hair: [],
      iris: [],
      clothes: [],
      shadow_highlight: [],
      line_art: [],
    };

    for (const step of stepsToRender) {
      if (visibleLayers['all'] && visibleLayers[step.layerId]) {
        if (!layerSnippets[step.layerId]) {
          layerSnippets[step.layerId] = [];
        }
        layerSnippets[step.layerId].push(step.xmlPatch);
      }
    }

    const lines: string[] = [];
    lines.push('<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
    lines.push('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">');
    lines.push(
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${project.viewBox}" width="${project.canvasWidth}" height="${project.canvasHeight}">`
    );
    lines.push('  <defs>');
    lines.push('    <style>');
    lines.push('      .studio-node { shape-rendering: geometricPrecision; text-rendering: geometricPrecision; }');
    lines.push('    </style>');
    lines.push('  </defs>');

    // Standard layer order
    const orderedLayers: LayerId[] = ['background', 'skin_body', 'clothes', 'shadow_highlight', 'hair', 'iris', 'line_art'];
    for (const layerId of orderedLayers) {
      const patches = layerSnippets[layerId];
      if (patches && patches.length > 0) {
        lines.push(`  <g id="layer-${layerId}" data-layer="${layerId}">`);
        for (const p of patches) {
          lines.push(`    ${p}`);
        }
        lines.push('  </g>');
      }
    }

    lines.push('</svg>');
    return lines.join('\n');
  }

  static calculatePngDimensions(scale: 1 | 2 | 4, baseWidth = 800, baseHeight = 1000) {
    const validScale = scale === 4 ? 4 : scale === 2 ? 2 : 1;
    return {
      scale: validScale,
      width: baseWidth * validScale,
      height: baseHeight * validScale,
      pixelCount: baseWidth * validScale * baseHeight * validScale,
    };
  }
}

/**
 * JSON Schema Validator for Custom Projects
 */
export class ProjectValidator {
  static validate(jsonString: string): { success: boolean; data?: ProjectData; error?: string } {
    if (!jsonString || typeof jsonString !== 'string') {
      return { success: false, error: '输入内容为空或非字符串' };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e: any) {
      return { success: false, error: `JSON 语法解析失败: ${e.message}` };
    }

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'JSON 根元素必须为对象' };
    }

    if (!parsed.title || typeof parsed.title !== 'string') {
      return { success: false, error: '缺失或非法的 title 属性' };
    }

    if (!parsed.stages || !Array.isArray(parsed.stages) || parsed.stages.length === 0) {
      return { success: false, error: 'stages 必须为包含至少一个阶段的数组' };
    }

    if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      return { success: false, error: 'steps 必须为包含至少一个步骤的数组' };
    }

    for (let i = 0; i < parsed.steps.length; i++) {
      const s = parsed.steps[i];
      if (typeof s.id !== 'number' || s.id < 0) {
        return { success: false, error: `步骤索引 [${i}] 缺失有效的数字 id` };
      }
      if (!s.layerId || typeof s.layerId !== 'string') {
        return { success: false, error: `步骤 [${s.id}] 缺失有效的 layerId` };
      }
      if (!s.xmlPatch || typeof s.xmlPatch !== 'string') {
        return { success: false, error: `步骤 [${s.id}] 缺失有效的 xmlPatch 字符串` };
      }
    }

    const validated: ProjectData = {
      title: parsed.title,
      version: parsed.version || '1.0.0',
      viewBox: parsed.viewBox || '0 0 800 1000',
      canvasWidth: parsed.canvasWidth || 800,
      canvasHeight: parsed.canvasHeight || 1000,
      stages: parsed.stages,
      steps: parsed.steps,
    };

    return { success: true, data: validated };
  }
}

/**
 * Interactive Studio State Machine Driver (Opaque-box E2E Engine)
 */
export class StudioDriver {
  private project: ProjectData;
  private currentStep: number;
  private isPlaying: boolean;
  private speed: 0.5 | 1 | 2 | 4;
  private isLooping: boolean;
  private transform: TransformState;
  private gridVisible: boolean;
  private layerVisibility: Record<LayerId, boolean>;
  private soloLayer: LayerId | null;
  private selectedNodeId: string | null;
  private hoveredNodeId: string | null;
  private activeInspectorTab: 'diff' | 'source' | 'dom';
  private clipboardContent: string;
  private toastMessage: string | null;
  private playbackTimer: any = null;

  constructor(customProject?: ProjectData) {
    this.project = customProject || createDefaultAnimeProject();
    this.currentStep = this.project.steps.length; // Default to finished artwork (step 43)
    this.isPlaying = false;
    this.speed = 1;
    this.isLooping = false;
    this.transform = CanvasMathEngine.reset();
    this.gridVisible = false;
    this.layerVisibility = {
      all: true,
      background: true,
      skin_body: true,
      hair: true,
      iris: true,
      clothes: true,
      shadow_highlight: true,
      line_art: true,
    };
    this.soloLayer = null;
    this.selectedNodeId = null;
    this.hoveredNodeId = null;
    this.activeInspectorTab = 'diff';
    this.clipboardContent = '';
    this.toastMessage = null;
  }

  // --- Getters ---
  getProject(): ProjectData {
    return this.project;
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  getTotalSteps(): number {
    return this.project.steps.length;
  }

  getStepProgressFraction(): string {
    return `${this.currentStep}/${this.getTotalSteps()} 步`;
  }

  getStepProgressPercent(): number {
    if (this.getTotalSteps() === 0) return 0;
    return Math.round((this.currentStep / this.getTotalSteps()) * 100);
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getSpeed(): 0.5 | 1 | 2 | 4 {
    return this.speed;
  }

  getIsLooping(): boolean {
    return this.isLooping;
  }

  getTransform(): TransformState {
    return { ...this.transform };
  }

  isGridVisible(): boolean {
    return this.gridVisible;
  }

  isLayerVisible(layerId: LayerId): boolean {
    if (layerId === 'all') return this.layerVisibility.all;
    return this.layerVisibility.all && this.layerVisibility[layerId];
  }

  getSoloLayer(): LayerId | null {
    return this.soloLayer;
  }

  getLayerFilterStyle(layerId: LayerId): { opacity: number; filter: string; display?: string } {
    if (layerId === 'all') {
      return { opacity: 1, filter: 'none' };
    }

    if (!this.layerVisibility.all || !this.layerVisibility[layerId]) {
      return { opacity: 0, filter: 'none', display: 'none' };
    }

    if (this.soloLayer !== null) {
      if (this.soloLayer === layerId) {
        return { opacity: 1, filter: 'none' };
      } else {
        return { opacity: 0.15, filter: 'grayscale(85%)' };
      }
    }

    return { opacity: 1, filter: 'none' };
  }

  getSelectedNodeId(): string | null {
    return this.selectedNodeId;
  }

  getHoveredNodeId(): string | null {
    return this.hoveredNodeId;
  }

  getActiveInspectorTab(): 'diff' | 'source' | 'dom' {
    return this.activeInspectorTab;
  }

  getClipboardContent(): string {
    return this.clipboardContent;
  }

  getToastMessage(): string | null {
    return this.toastMessage;
  }

  getCurrentStage(): StageMetadata {
    const step = this.currentStep;
    for (const stage of this.project.stages) {
      if (step >= stage.startStep && step <= stage.endStep) {
        return stage;
      }
    }
    return this.project.stages[this.project.stages.length - 1] || {
      id: 'default',
      name: 'Default',
      description: '',
      startStep: 1,
      endStep: 1,
    };
  }

  // --- Actions: Canvas Controls ---
  panBy(dx: number, dy: number): void {
    this.transform = CanvasMathEngine.pan(this.transform, dx, dy);
  }

  zoomAt(cursorX: number, cursorY: number, delta: number): void {
    this.transform = CanvasMathEngine.zoomAt(this.transform, cursorX, cursorY, delta);
  }

  resetView(): void {
    this.transform = CanvasMathEngine.reset();
  }

  fitToScreen(containerWidth = 1000, containerHeight = 800, padding = 32): void {
    this.transform = CanvasMathEngine.fitToScreen(containerWidth, containerHeight, this.project.canvasWidth, this.project.canvasHeight, padding);
  }

  toggleGrid(): void {
    this.gridVisible = !this.gridVisible;
  }

  // --- Actions: Layer Management ---
  toggleLayer(layerId: LayerId): void {
    if (layerId === 'all') {
      const nextAll = !this.layerVisibility.all;
      this.layerVisibility.all = nextAll;
    } else {
      this.layerVisibility[layerId] = !this.layerVisibility[layerId];
    }
  }

  setLayerVisibility(layerId: LayerId, visible: boolean): void {
    this.layerVisibility[layerId] = visible;
  }

  setSoloLayer(layerId: LayerId | null): void {
    if (this.soloLayer === layerId) {
      this.soloLayer = null; // Toggle off if already soloed
    } else {
      this.soloLayer = layerId;
    }
  }

  // --- Actions: Timeline & Playback ---
  goToStep(step: number): void {
    if (isNaN(step)) {
      this.currentStep = 0;
      return;
    }
    if (step === Infinity) {
      this.currentStep = this.project.steps.length;
      return;
    }
    if (step === -Infinity) {
      this.currentStep = 0;
      return;
    }
    const clamped = Math.max(0, Math.min(this.project.steps.length, Math.floor(step)));
    this.currentStep = clamped;
  }

  nextStep(): void {
    if (this.currentStep < this.project.steps.length) {
      this.currentStep += 1;
    } else if (this.isLooping) {
      this.currentStep = 0;
    } else {
      this.isPlaying = false;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
    }
  }

  goToStage(stageId: string): void {
    const stage = this.project.stages.find((s) => s.id === stageId);
    if (stage) {
      this.currentStep = stage.startStep;
    }
  }

  play(): void {
    if (this.currentStep >= this.project.steps.length) {
      this.currentStep = 0;
    }
    this.isPlaying = true;
  }

  pause(): void {
    this.isPlaying = false;
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setSpeed(speed: 0.5 | 1 | 2 | 4): void {
    this.speed = speed;
  }

  toggleLoop(): void {
    this.isLooping = !this.isLooping;
  }

  // Simulate tick progression for testing playback state machine
  tick(steps = 1): void {
    if (!this.isPlaying) return;
    for (let i = 0; i < steps; i++) {
      this.nextStep();
    }
  }

  // --- Actions: Inspector & Diff ---
  setActiveInspectorTab(tab: 'diff' | 'source' | 'dom'): void {
    this.activeInspectorTab = tab;
  }

  getStepDiff(stepIndex = this.currentStep): { addedLines: string[]; removedLines: string[]; patchXml: string } {
    if (stepIndex <= 0 || stepIndex > this.project.steps.length) {
      return { addedLines: [], removedLines: [], patchXml: '' };
    }
    const step = this.project.steps[stepIndex - 1];
    return {
      addedLines: step.addedLines || [],
      removedLines: step.removedLines || [],
      patchXml: step.xmlPatch || '',
    };
  }

  getFullSvgSource(): string {
    return ExporterEngine.generateStandaloneSvg(this.project, this.currentStep, this.layerVisibility);
  }

  getDomTree(): VirtualDomNode[] {
    return DomExtractor.extractTree(this.project.steps, this.currentStep);
  }

  selectNode(id: string | null): void {
    this.selectedNodeId = id;
  }

  hoverNode(id: string | null): void {
    this.hoveredNodeId = id;
  }

  // --- Actions: Clipboard & Copy ---
  copyCurrentSvgSource(): boolean {
    const source = this.getFullSvgSource();
    this.clipboardContent = source;
    this.toastMessage = 'SVG 源码已复制到剪贴板';
    return true;
  }

  copyCurrentStepDiff(): boolean {
    const diff = this.getStepDiff();
    this.clipboardContent = diff.patchXml;
    this.toastMessage = '步骤代码已复制到剪贴板';
    return true;
  }

  clearToast(): void {
    this.toastMessage = null;
  }

  // --- Actions: Export & Import ---
  exportStandaloneSvg(): { filename: string; content: string } {
    const content = this.getFullSvgSource();
    const stage = this.getCurrentStage();
    const filename = `anime_character_${stage.id}_step${this.currentStep}.svg`;
    return { filename, content };
  }

  exportPng(scale: 1 | 2 | 4): { filename: string; width: number; height: number; scale: number } {
    const dims = ExporterEngine.calculatePngDimensions(scale, this.project.canvasWidth, this.project.canvasHeight);
    const filename = `anime_character_${scale}x_step${this.currentStep}.png`;
    return {
      filename,
      width: dims.width,
      height: dims.height,
      scale: dims.scale,
    };
  }

  importProject(jsonString: string): { success: boolean; error?: string } {
    const result = ProjectValidator.validate(jsonString);
    if (!result.success || !result.data) {
      this.toastMessage = `导入失败: ${result.error}`;
      return { success: false, error: result.error };
    }

    this.project = result.data;
    this.currentStep = this.project.steps.length;
    this.isPlaying = false;
    this.toastMessage = '新角色工程导入成功';
    return { success: true };
  }
}

/**
 * Utility Helpers
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseTagFromXml(xml: string): string {
  const match = xml.match(/<([a-zA-Z0-9]+)[\s>]/);
  return match ? match[1] : 'g';
}

function parseAttributesFromXml(xml: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const regex = /([a-zA-Z0-9\-_]+)="([^"]*)"/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

/**
 * Test Assertion Matchers
 */
export function expectValidXml(xml: string): void {
  if (!xml || typeof xml !== 'string') {
    throw new Error(`Expected valid XML string, received ${typeof xml}`);
  }
  if (!xml.startsWith('<?xml') && !xml.startsWith('<svg')) {
    throw new Error(`XML string does not start with standard XML or SVG declaration: ${xml.slice(0, 40)}`);
  }
  if (!xml.endsWith('</svg>')) {
    throw new Error(`XML string does not properly close with </svg>: ${xml.slice(-30)}`);
  }
}

export function expectValidViewBox(xml: string, expectedBox = '0 0 800 1000'): void {
  if (!xml.includes(`viewBox="${expectedBox}"`)) {
    throw new Error(`Expected SVG to contain viewBox="${expectedBox}"`);
  }
}

/**
 * Universal Test Runner Exports
 * Compatible with both Vitest / Jest and Node.js built-in runner.
 */
export const describe = (globalThis as any).describe || nodeTest.describe;
export const it = (globalThis as any).it || nodeTest.it;
export const test = (globalThis as any).test || nodeTest.test;
export const beforeEach = (globalThis as any).beforeEach || nodeTest.beforeEach;
export const afterEach = (globalThis as any).afterEach || nodeTest.afterEach;

export interface Expectation {
  toBe(expected: any): void;
  toEqual(expected: any): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toBeGreaterThan(expected: number): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toBeLessThan(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
  toBeCloseTo(expected: number, precision?: number): void;
  toContain(item: any): void;
  toHaveLength(len: number): void;
  toMatch(regex: RegExp | string): void;
  toThrow(expected?: string | RegExp): void;
  not: {
    toBe(expected: any): void;
    toEqual(expected: any): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeNull(): void;
    toContain(item: any): void;
    toThrow(): void;
  };
}

export function expect(actual: any): Expectation {
  if (typeof (globalThis as any).expect === 'function' && (globalThis as any).expect !== expect) {
    return (globalThis as any).expect(actual);
  }

  const createAssertion = (isNot = false): any => ({
    toBe: (expected: any) => {
      if (isNot) {
        nodeAssert.notStrictEqual(actual, expected);
      } else {
        nodeAssert.strictEqual(actual, expected);
      }
    },
    toEqual: (expected: any) => {
      if (isNot) {
        nodeAssert.notDeepStrictEqual(actual, expected);
      } else {
        nodeAssert.deepStrictEqual(actual, expected);
      }
    },
    toBeTruthy: () => {
      if (isNot) {
        nodeAssert.ok(!actual);
      } else {
        nodeAssert.ok(actual);
      }
    },
    toBeFalsy: () => {
      if (isNot) {
        nodeAssert.ok(actual);
      } else {
        nodeAssert.ok(!actual);
      }
    },
    toBeNull: () => {
      if (isNot) {
        nodeAssert.notStrictEqual(actual, null);
      } else {
        nodeAssert.strictEqual(actual, null);
      }
    },
    toBeDefined: () => {
      nodeAssert.notStrictEqual(actual, undefined);
    },
    toBeUndefined: () => {
      nodeAssert.strictEqual(actual, undefined);
    },
    toBeGreaterThan: (expected: number) => {
      nodeAssert.ok(actual > expected, `Expected ${actual} > ${expected}`);
    },
    toBeGreaterThanOrEqual: (expected: number) => {
      nodeAssert.ok(actual >= expected, `Expected ${actual} >= ${expected}`);
    },
    toBeLessThan: (expected: number) => {
      nodeAssert.ok(actual < expected, `Expected ${actual} < ${expected}`);
    },
    toBeLessThanOrEqual: (expected: number) => {
      nodeAssert.ok(actual <= expected, `Expected ${actual} <= ${expected}`);
    },
    toBeCloseTo: (expected: number, precision = 2) => {
      const diff = Math.abs(actual - expected);
      nodeAssert.ok(diff < Math.pow(10, -precision) / 2, `Expected ${actual} to be close to ${expected}`);
    },
    toContain: (item: any) => {
      if (typeof actual === 'string') {
        const contains = actual.includes(item);
        if (isNot) {
          nodeAssert.ok(!contains, `Expected string not to contain "${item}"`);
        } else {
          nodeAssert.ok(contains, `Expected string to contain "${item}"`);
        }
      } else if (Array.isArray(actual)) {
        const contains = actual.includes(item);
        if (isNot) {
          nodeAssert.ok(!contains, `Expected array not to contain ${JSON.stringify(item)}`);
        } else {
          nodeAssert.ok(contains, `Expected array to contain ${JSON.stringify(item)}`);
        }
      } else if (actual instanceof Set) {
        const contains = actual.has(item);
        if (isNot) {
          nodeAssert.ok(!contains, `Expected Set not to contain ${item}`);
        } else {
          nodeAssert.ok(contains, `Expected Set to contain ${item}`);
        }
      } else {
        throw new Error(`toContain unsupported on type ${typeof actual}`);
      }
    },
    toHaveLength: (len: number) => {
      nodeAssert.strictEqual(actual.length, len, `Expected length ${len}, got ${actual?.length}`);
    },
    toMatch: (regex: RegExp | string) => {
      const re = typeof regex === 'string' ? new RegExp(regex) : regex;
      nodeAssert.ok(re.test(String(actual)), `Expected "${actual}" to match ${re}`);
    },
    toThrow: (expected?: string | RegExp) => {
      if (typeof actual !== 'function') {
        throw new Error('actual must be a function for toThrow assertion');
      }
      if (isNot) {
        nodeAssert.doesNotThrow(actual);
      } else if (expected) {
        const re = typeof expected === 'string' ? new RegExp(expected) : expected;
        nodeAssert.throws(actual, re);
      } else {
        nodeAssert.throws(actual);
      }
    },
  });

  const assertion: any = createAssertion(false);
  assertion.not = createAssertion(true);
  return assertion;
}

