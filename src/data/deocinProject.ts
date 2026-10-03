import { ProjectData, StrokeMicroStep, StageMetadata } from '../types/anime';
import { LayerId } from '../types/studio';
import { StepDensityEngine } from '../engine/stepDensityEngine';

/**
 * Flagship Masterpiece: 《幻梦航标 · 德奥欣 (Deocin)》
 * 
 * 100% Live2D 拆件级 · 穿透遮挡与完全闭合底模架构 (Live2D Dissection & Occlusion Masterpiece)
 * 
 * 深度解析与架构特色：
 * 1. 【底模完全闭合 (Full Occluded Head Dome)】:
 *    - 隐藏或移开前发时，露出的头部底模 (`head_base`) 是一个从下巴到额头穹顶完全闭合饱满的头骨穹顶 (y: 175 ~ 508)；
 *    - 完整画在脸上的双眉、完整眼白巩膜、琥珀金渐变虹膜、猫眼高光、双眼皮与睫毛，绝无镂空残缺！
 *    - 两颊带有元气腮红与三道日系经典害羞斜线 `///`，小巧鼻尖与轻咬下唇微露尖牙 (cute fang)。
 * 2. 【独立可拆前发 (Dissectable Front Hair & Ahoge)】:
 *    - 前发刘海、双侧长卷鬓角、头顶标志性大呆毛、粉红发夹与天使光环形成独立完整的闭合矢量群组 (`hair_front`)；
 *    - 平台支持一键 Live2D 拆解视图 (Explode View) 或按住 Shift / 交互拖拽发型，实时呈现 dx: 345pt, dy: 42.4pt 的移开效果！
 * 3. 【正统经典水手服 (Authentic Sailor Fuku)】:
 *    - 沉稳墨绿 (Forest Teal) 大翻领配双道明黄色细条纹滚边；
 *    - 亮黄与琥珀金松散领巾结与飘带；
 *    - 干净奶白衬衣与立体赛璐璐阴影折面。
 */
export function createDeocinProject(): ProjectData {
  const stages: StageMetadata[] = [
    {
        "id": "stage-1",
        "name": "01初版草图",
        "title": "01 初版草图",
        "description": "面部十字、透叠基准线与头部定位网格",
        "startStep": 1,
        "endStep": 12,
        "themeColor": "#38BDF8"
    },
    {
        "id": "stage-2",
        "name": "02底模铺设",
        "title": "02 底模铺设",
        "description": "完整闭合头骨脸模、后发底色与水手服前襟",
        "startStep": 13,
        "endStep": 35,
        "themeColor": "#818CF8"
    },
    {
        "id": "stage-3",
        "name": "03结构阴影",
        "title": "03 结构阴影",
        "description": "颈部投影、水手领双条纹与领巾立体切面",
        "startStep": 36,
        "endStep": 58,
        "themeColor": "#A78BFA"
    },
    {
        "id": "stage-4",
        "name": "04五官眼眸",
        "title": "04 五官眼眸",
        "description": "微忧双眉、璀璨金瞳、猫眼高光与咬唇虎牙",
        "startStep": 59,
        "endStep": 95,
        "themeColor": "#F59E0B"
    },
    {
        "id": "stage-5",
        "name": "05可拆发型与光影",
        "title": "05 可拆发型与光影",
        "description": "独立可拆前发呆毛、发顶天使光环、腮红与Live2D解构标注",
        "startStep": 96,
        "endStep": 139,
        "themeColor": "#EC4899"
    }
];

  const rawSteps = [
  {
    "id": 1,
    "step": 1,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "头部透叠定位草图圆",
    "description": "构建头部整体圆润轮廓定位基准",
    "elementId": "sketch-head-circle",
    "xmlPatch": "<circle id=\"sketch-head-circle\" cx=\"400\" cy=\"350\" r=\"160\" stroke=\"#38BDF8\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.4\" stroke-width=\"1.5\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <circle id=\"sketch-head-circle\" cx=\"400\" cy=\"350\" r=\"160\" stroke=\"#38BDF8\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.4\" stroke-width=\"1.5\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <circle id=\"sketch-head-circle\" cx=\"400\" cy=\"350\" r=\"160\" stroke=\"#38BDF8\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.4\" stroke-width=\"1.5\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 2,
    "step": 2,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "面部正侧基准中轴线",
    "description": "确立五官对齐与头部微倾中轴骨架",
    "elementId": "sketch-crosshair",
    "xmlPatch": "<path id=\"sketch-crosshair\" d=\"M 400 170 L 400 520 M 250 375 L 550 375\" stroke=\"#38BDF8\" stroke-dasharray=\"4,4\" opacity=\"0.4\" stroke-width=\"1.5\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <path id=\"sketch-crosshair\" d=\"M 400 170 L 400 520 M 250 375 L 550 375\" stroke=\"#38BDF8\" stroke-dasharray=\"4,4\" opacity=\"0.4\" stroke-width=\"1.5\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sketch-crosshair\" d=\"M 400 170 L 400 520 M 250 375 L 550 375\" stroke=\"#38BDF8\" stroke-dasharray=\"4,4\" opacity=\"0.4\" stroke-width=\"1.5\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 3,
    "step": 3,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "完整头骨闭合穹顶骨架",
    "description": "Live2D核心：预演完整无镂空颅骨闭合弧线",
    "elementId": "sketch-cranium-dome",
    "xmlPatch": "<path id=\"sketch-cranium-dome\" d=\"M 270 320 C 265 220 320 175 400 175 C 480 175 535 220 530 320\" stroke=\"#38BDF8\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.45\" stroke-width=\"1.5\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <path id=\"sketch-cranium-dome\" d=\"M 270 320 C 265 220 320 175 400 175 C 480 175 535 220 530 320\" stroke=\"#38BDF8\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.45\" stroke-width=\"1.5\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sketch-cranium-dome\" d=\"M 270 320 C 265 220 320 175 400 175 C 480 175 535 220 530 320\" stroke=\"#38BDF8\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.45\" stroke-width=\"1.5\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 4,
    "step": 4,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "秀气下颌与下巴轮廓线",
    "description": "萌系二次元微尖柔和下巴下颌折线",
    "elementId": "sketch-jawline",
    "xmlPatch": "<path id=\"sketch-jawline\" d=\"M 270 320 Q 280 440 400 508 Q 520 440 530 320\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.4\" stroke-width=\"1.5\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <path id=\"sketch-jawline\" d=\"M 270 320 Q 280 440 400 508 Q 520 440 530 320\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.4\" stroke-width=\"1.5\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sketch-jawline\" d=\"M 270 320 Q 280 440 400 508 Q 520 440 530 320\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.4\" stroke-width=\"1.5\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 5,
    "step": 5,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "左眼眶黄金定位框",
    "description": "左侧灵动猫眼对齐矩形与透视基准",
    "elementId": "sketch-eye-box-l",
    "xmlPatch": "<rect id=\"sketch-eye-box-l\" x=\"312\" y=\"350\" width=\"66\" height=\"52\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.35\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <rect id=\"sketch-eye-box-l\" x=\"312\" y=\"350\" width=\"66\" height=\"52\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.35\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <rect id=\"sketch-eye-box-l\" x=\"312\" y=\"350\" width=\"66\" height=\"52\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.35\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 6,
    "step": 6,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "右眼眶黄金定位框",
    "description": "右侧灵动猫眼对称矩形透视框",
    "elementId": "sketch-eye-box-r",
    "xmlPatch": "<rect id=\"sketch-eye-box-r\" x=\"422\" y=\"350\" width=\"66\" height=\"52\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.35\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <rect id=\"sketch-eye-box-r\" x=\"422\" y=\"350\" width=\"66\" height=\"52\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.35\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <rect id=\"sketch-eye-box-r\" x=\"422\" y=\"350\" width=\"66\" height=\"52\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.35\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 7,
    "step": 7,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "独立前发刘海分簇草图",
    "description": "前发群组独立闭合与发梢流向规划",
    "elementId": "sketch-bangs-flow",
    "xmlPatch": "<path id=\"sketch-bangs-flow\" d=\"M 265 310 C 290 400 330 410 350 360 C 370 410 400 415 420 365 C 450 410 500 400 535 310\" stroke=\"#A855F7\" stroke-dasharray=\"3,3\" fill=\"none\" opacity=\"0.4\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <path id=\"sketch-bangs-flow\" d=\"M 265 310 C 290 400 330 410 350 360 C 370 410 400 415 420 365 C 450 410 500 400 535 310\" stroke=\"#A855F7\" stroke-dasharray=\"3,3\" fill=\"none\" opacity=\"0.4\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sketch-bangs-flow\" d=\"M 265 310 C 290 400 330 410 350 360 C 370 410 400 415 420 365 C 450 410 500 400 535 310\" stroke=\"#A855F7\" stroke-dasharray=\"3,3\" fill=\"none\" opacity=\"0.4\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 8,
    "step": 8,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "头顶灵动呆毛抛物线草图",
    "description": "德奥欣专属大弧度向前卷曲呆毛动势",
    "elementId": "sketch-ahoge-curve",
    "xmlPatch": "<path id=\"sketch-ahoge-curve\" d=\"M 396 220 Q 380 130 445 120 Q 460 145 408 220\" stroke=\"#A855F7\" fill=\"none\" opacity=\"0.4\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <path id=\"sketch-ahoge-curve\" d=\"M 396 220 Q 380 130 445 120 Q 460 145 408 220\" stroke=\"#A855F7\" fill=\"none\" opacity=\"0.4\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sketch-ahoge-curve\" d=\"M 396 220 Q 380 130 445 120 Q 460 145 408 220\" stroke=\"#A855F7\" fill=\"none\" opacity=\"0.4\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 9,
    "step": 9,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "水手服深绿大翻领草图",
    "description": "经典水手服双侧披肩领轮廓线",
    "elementId": "sketch-sailor-collar",
    "xmlPatch": "<path id=\"sketch-sailor-collar\" d=\"M 330 515 L 235 630 L 320 635 L 360 555 M 470 515 L 565 630 L 480 635 L 440 555\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.35\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <path id=\"sketch-sailor-collar\" d=\"M 330 515 L 235 630 L 320 635 L 360 555 M 470 515 L 565 630 L 480 635 L 440 555\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.35\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sketch-sailor-collar\" d=\"M 330 515 L 235 630 L 320 635 L 360 555 M 470 515 L 565 630 L 480 635 L 440 555\" stroke=\"#38BDF8\" fill=\"none\" opacity=\"0.35\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 10,
    "step": 10,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "胸前松软领巾缎带草图",
    "description": "水手服芥末黄缎带系结下垂引导",
    "elementId": "sketch-tie-ribbon",
    "xmlPatch": "<path id=\"sketch-tie-ribbon\" d=\"M 385 558 L 375 710 M 415 558 L 425 710\" stroke=\"#F59E0B\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.4\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <path id=\"sketch-tie-ribbon\" d=\"M 385 558 L 375 710 M 415 558 L 425 710\" stroke=\"#F59E0B\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.4\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sketch-tie-ribbon\" d=\"M 385 558 L 375 710 M 415 558 L 425 710\" stroke=\"#F59E0B\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.4\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 11,
    "step": 11,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "后发蓬松微卷轮廓草图",
    "description": "肩膀后侧微卷发团外翻体块标定",
    "elementId": "sketch-back-hair",
    "xmlPatch": "<path id=\"sketch-back-hair\" d=\"M 230 320 C 160 400 170 530 200 620 C 270 660 530 660 600 620 C 630 530 640 400 570 320\" stroke=\"#818CF8\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.3\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <path id=\"sketch-back-hair\" d=\"M 230 320 C 160 400 170 530 200 620 C 270 660 530 660 600 620 C 630 530 640 400 570 320\" stroke=\"#818CF8\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.3\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sketch-back-hair\" d=\"M 230 320 C 160 400 170 530 200 620 C 270 660 530 660 600 620 C 630 530 640 400 570 320\" stroke=\"#818CF8\" stroke-dasharray=\"4,4\" fill=\"none\" opacity=\"0.3\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_back"
    }
  },
  {
    "id": 12,
    "step": 12,
    "stageId": "stage-1",
    "stageName": "01初版草图",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "Live2D透叠草图对齐锁定",
    "description": "全图定位完成，草图锁定并转入实体层构建",
    "elementId": "sketch-lock",
    "xmlPatch": "<circle id=\"sketch-lock-indicator\" cx=\"400\" cy=\"175\" r=\"4\" fill=\"#38BDF8\" opacity=\"0.6\" data-sketch=\"true\" />",
    "addedLines": [
      "+ <circle id=\"sketch-lock-indicator\" cx=\"400\" cy=\"175\" r=\"4\" fill=\"#38BDF8\" opacity=\"0.6\" data-sketch=\"true\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <circle id=\"sketch-lock-indicator\" cx=\"400\" cy=\"175\" r=\"4\" fill=\"#38BDF8\" opacity=\"0.6\" data-sketch=\"true\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 13,
    "step": 13,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "background",
    "layerName": "背景特效",
    "title": "画布纯净漫射基底",
    "description": "画板细腻纸张材质漫反射衬托",
    "elementId": "base-paper-backdrop",
    "xmlPatch": "<rect id=\"base-paper-backdrop\" x=\"0\" y=\"0\" width=\"800\" height=\"1000\" fill=\"#FFFFFF\" />",
    "addedLines": [
      "+ <rect id=\"base-paper-backdrop\" x=\"0\" y=\"0\" width=\"800\" height=\"1000\" fill=\"#FFFFFF\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <rect id=\"base-paper-backdrop\" x=\"0\" y=\"0\" width=\"800\" height=\"1000\" fill=\"#FFFFFF\" />"
      ]
    },
    "metadata": {
      "live2dPart": "background"
    }
  },
  {
    "id": 14,
    "step": 14,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "background",
    "layerName": "背景特效",
    "title": "左上角作者署名水印",
    "description": "还原原画 @O泡果奶Plus (Deocin) 水印标示",
    "elementId": "deocin-watermark-author",
    "xmlPatch": "<text id=\"deocin-watermark-author\" x=\"42\" y=\"72\" font-family=\"'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif\" font-size=\"22\" font-weight=\"700\" fill=\"#262626\" letter-spacing=\"0.5\">@O泡果奶Plus (Deocin)</text>",
    "addedLines": [
      "+ <text id=\"deocin-watermark-author\" x=\"42\" y=\"72\" font-family=\"'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif\" font-size=\"22\" font-weight=\"700\" fill=\"#262626\" letter-spacing=\"0.5\">@O泡果奶Plus (Deocin)</text>"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <text id=\"deocin-watermark-author\" x=\"42\" y=\"72\" font-family=\"'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif\" font-size=\"22\" font-weight=\"700\" fill=\"#262626\" letter-spacing=\"0.5\">@O泡果奶Plus (Deocin)</text>"
      ]
    },
    "metadata": {
      "live2dPart": "background"
    }
  },
  {
    "id": 15,
    "step": 15,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "background",
    "layerName": "背景特效",
    "title": "右侧优雅纵向设计排版",
    "description": "右侧淡灰透光 Deocin 字母艺术排版",
    "elementId": "deocin-watermark-typography",
    "xmlPatch": "<text id=\"deocin-watermark-typography\" x=\"725\" y=\"320\" font-family=\"'Helvetica Neue', Arial, sans-serif\" font-size=\"86\" font-weight=\"900\" fill=\"#E2E8F0\" opacity=\"0.7\" transform=\"rotate(90 725 320)\" letter-spacing=\"12\">Deocin</text>",
    "addedLines": [
      "+ <text id=\"deocin-watermark-typography\" x=\"725\" y=\"320\" font-family=\"'Helvetica Neue', Arial, sans-serif\" font-size=\"86\" font-weight=\"900\" fill=\"#E2E8F0\" opacity=\"0.7\" transform=\"rotate(90 725 320)\" letter-spacing=\"12\">Deocin</text>"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <text id=\"deocin-watermark-typography\" x=\"725\" y=\"320\" font-family=\"'Helvetica Neue', Arial, sans-serif\" font-size=\"86\" font-weight=\"900\" fill=\"#E2E8F0\" opacity=\"0.7\" transform=\"rotate(90 725 320)\" letter-spacing=\"12\">Deocin</text>"
      ]
    },
    "metadata": {
      "live2dPart": "background"
    }
  },
  {
    "id": 16,
    "step": 16,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "深灰紫后发整体背底色块",
    "description": "后发厚实发量背板，奠定头部轮廓深色对比",
    "elementId": "hair-back-mass",
    "xmlPatch": "<path id=\"hair-back-mass\" d=\"M 230 320 C 160 380 170 520 200 620 C 230 650 280 660 340 660 L 460 660 C 520 660 570 650 600 620 C 630 520 640 380 570 320 Z\" fill=\"#2C2638\" data-part=\"hair_back\" />",
    "addedLines": [
      "+ <path id=\"hair-back-mass\" d=\"M 230 320 C 160 380 170 520 200 620 C 230 650 280 660 340 660 L 460 660 C 520 660 570 650 600 620 C 630 520 640 380 570 320 Z\" fill=\"#2C2638\" data-part=\"hair_back\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-back-mass\" d=\"M 230 320 C 160 380 170 520 200 620 C 230 650 280 660 340 660 L 460 660 C 520 660 570 650 600 620 C 630 520 640 380 570 320 Z\" fill=\"#2C2638\" data-part=\"hair_back\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_back"
    }
  },
  {
    "id": 17,
    "step": 17,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "左侧肩后微卷外翘发梢",
    "description": "左侧垂落肩膀外翘饱满弧线发丝",
    "elementId": "hair-back-left-curl",
    "xmlPatch": "<path id=\"hair-back-left-curl\" d=\"M 210 500 C 170 550 185 620 220 640 C 230 610 230 560 240 520 Z\" fill=\"#3B3448\" data-part=\"hair_back\" />",
    "addedLines": [
      "+ <path id=\"hair-back-left-curl\" d=\"M 210 500 C 170 550 185 620 220 640 C 230 610 230 560 240 520 Z\" fill=\"#3B3448\" data-part=\"hair_back\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-back-left-curl\" d=\"M 210 500 C 170 550 185 620 220 640 C 230 610 230 560 240 520 Z\" fill=\"#3B3448\" data-part=\"hair_back\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_back"
    }
  },
  {
    "id": 18,
    "step": 18,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "右侧肩后微卷外翘发梢",
    "description": "右侧微卷外翘发梢对称层次",
    "elementId": "hair-back-right-curl",
    "xmlPatch": "<path id=\"hair-back-right-curl\" d=\"M 590 500 C 630 550 615 620 580 640 C 570 610 570 560 560 520 Z\" fill=\"#3B3448\" data-part=\"hair_back\" />",
    "addedLines": [
      "+ <path id=\"hair-back-right-curl\" d=\"M 590 500 C 630 550 615 620 580 640 C 570 610 570 560 560 520 Z\" fill=\"#3B3448\" data-part=\"hair_back\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-back-right-curl\" d=\"M 590 500 C 630 550 615 620 580 640 C 570 610 570 560 560 520 Z\" fill=\"#3B3448\" data-part=\"hair_back\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_back"
    }
  },
  {
    "id": 19,
    "step": 19,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "后脑勺发际线暗部交界",
    "description": "后脑勺底层至深发暗部过渡",
    "elementId": "hair-back-nape-shade",
    "xmlPatch": "<path id=\"hair-back-nape-shade\" d=\"M 330 460 C 370 480 430 480 470 460 Z\" fill=\"#1E1926\" data-part=\"hair_back\" />",
    "addedLines": [
      "+ <path id=\"hair-back-nape-shade\" d=\"M 330 460 C 370 480 430 480 470 460 Z\" fill=\"#1E1926\" data-part=\"hair_back\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-back-nape-shade\" d=\"M 330 460 C 370 480 430 480 470 460 Z\" fill=\"#1E1926\" data-part=\"hair_back\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_back"
    }
  },
  {
    "id": 20,
    "step": 20,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "skin_body",
    "layerName": "身体肤色",
    "title": "颈部圆柱体肤色底板",
    "description": "修长优雅少女颈部肤色基础块面",
    "elementId": "skin-neck-column",
    "xmlPatch": "<path id=\"skin-neck-column\" d=\"M 365 440 L 365 535 C 380 545 420 545 435 535 L 435 440 Z\" fill=\"#FFF7ED\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"skin-neck-column\" d=\"M 365 440 L 365 535 C 380 545 420 545 435 535 L 435 440 Z\" fill=\"#FFF7ED\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"skin-neck-column\" d=\"M 365 440 L 365 535 C 380 545 420 545 435 535 L 435 440 Z\" fill=\"#FFF7ED\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 21,
    "step": 21,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "skin_body",
    "layerName": "身体肤色",
    "title": "【核心透叠】完整闭合头骨面模穹顶",
    "description": "★Live2D核心：由下巴到头顶完全封闭的完整脸庞与额头骨架",
    "elementId": "head-base-solid-cranium",
    "xmlPatch": "<path id=\"head-base-solid-cranium\" d=\"M 270 320 C 265 240 320 175 400 175 C 480 175 535 240 530 320 C 532 375 515 440 460 480 C 430 502 400 508 400 508 C 400 508 370 502 340 480 C 285 440 268 375 270 320 Z\" fill=\"#FFF7ED\" stroke=\"#F6D5C2\" stroke-width=\"1.2\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"head-base-solid-cranium\" d=\"M 270 320 C 265 240 320 175 400 175 C 480 175 535 240 530 320 C 532 375 515 440 460 480 C 430 502 400 508 400 508 C 400 508 370 502 340 480 C 285 440 268 375 270 320 Z\" fill=\"#FFF7ED\" stroke=\"#F6D5C2\" stroke-width=\"1.2\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"head-base-solid-cranium\" d=\"M 270 320 C 265 240 320 175 400 175 C 480 175 535 240 530 320 C 532 375 515 440 460 480 C 430 502 400 508 400 508 C 400 508 370 502 340 480 C 285 440 268 375 270 320 Z\" fill=\"#FFF7ED\" stroke=\"#F6D5C2\" stroke-width=\"1.2\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 22,
    "step": 22,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "skin_body",
    "layerName": "身体肤色",
    "title": "额头饱满发际线渐变微影",
    "description": "额头上缘柔和浅桃色发根过渡阴影",
    "elementId": "head-forehead-hairline-shade",
    "xmlPatch": "<path id=\"head-forehead-hairline-shade\" d=\"M 285 280 C 330 220 470 220 515 280 C 470 240 330 240 285 280 Z\" fill=\"#FED7AA\" opacity=\"0.45\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"head-forehead-hairline-shade\" d=\"M 285 280 C 330 220 470 220 515 280 C 470 240 330 240 285 280 Z\" fill=\"#FED7AA\" opacity=\"0.45\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"head-forehead-hairline-shade\" d=\"M 285 280 C 330 220 470 220 515 280 C 470 240 330 240 285 280 Z\" fill=\"#FED7AA\" opacity=\"0.45\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 23,
    "step": 23,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "skin_body",
    "layerName": "身体肤色",
    "title": "左侧小巧耳廓基底",
    "description": "左耳圆润轮廓与耳垂自然结构",
    "elementId": "ear-left-base",
    "xmlPatch": "<path id=\"ear-left-base\" d=\"M 272 335 C 248 340 242 380 266 405 C 272 402 274 395 273 390 Z\" fill=\"#FFF7ED\" stroke=\"#E2B194\" stroke-width=\"1.5\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"ear-left-base\" d=\"M 272 335 C 248 340 242 380 266 405 C 272 402 274 395 273 390 Z\" fill=\"#FFF7ED\" stroke=\"#E2B194\" stroke-width=\"1.5\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"ear-left-base\" d=\"M 272 335 C 248 340 242 380 266 405 C 272 402 274 395 273 390 Z\" fill=\"#FFF7ED\" stroke=\"#E2B194\" stroke-width=\"1.5\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 24,
    "step": 24,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "skin_body",
    "layerName": "身体肤色",
    "title": "左耳耳蜗柔粉阴影",
    "description": "左耳内轮廓软组织粉色阴影",
    "elementId": "ear-left-inner-shade",
    "xmlPatch": "<path id=\"ear-left-inner-shade\" d=\"M 265 350 C 255 360 255 385 267 395\" stroke=\"#F472B6\" stroke-width=\"1.5\" fill=\"none\" opacity=\"0.55\" stroke-linecap=\"round\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"ear-left-inner-shade\" d=\"M 265 350 C 255 360 255 385 267 395\" stroke=\"#F472B6\" stroke-width=\"1.5\" fill=\"none\" opacity=\"0.55\" stroke-linecap=\"round\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"ear-left-inner-shade\" d=\"M 265 350 C 255 360 255 385 267 395\" stroke=\"#F472B6\" stroke-width=\"1.5\" fill=\"none\" opacity=\"0.55\" stroke-linecap=\"round\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 25,
    "step": 25,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "skin_body",
    "layerName": "身体肤色",
    "title": "右侧小巧耳廓基底",
    "description": "右耳对称圆润轮廓与耳垂结构",
    "elementId": "ear-right-base",
    "xmlPatch": "<path id=\"ear-right-base\" d=\"M 528 335 C 552 340 558 380 534 405 C 528 402 526 395 527 390 Z\" fill=\"#FFF7ED\" stroke=\"#E2B194\" stroke-width=\"1.5\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"ear-right-base\" d=\"M 528 335 C 552 340 558 380 534 405 C 528 402 526 395 527 390 Z\" fill=\"#FFF7ED\" stroke=\"#E2B194\" stroke-width=\"1.5\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"ear-right-base\" d=\"M 528 335 C 552 340 558 380 534 405 C 528 402 526 395 527 390 Z\" fill=\"#FFF7ED\" stroke=\"#E2B194\" stroke-width=\"1.5\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 26,
    "step": 26,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "skin_body",
    "layerName": "身体肤色",
    "title": "右耳耳蜗柔粉阴影",
    "description": "右耳内轮廓软组织粉色阴影",
    "elementId": "ear-right-inner-shade",
    "xmlPatch": "<path id=\"ear-right-inner-shade\" d=\"M 535 350 C 545 360 545 385 533 395\" stroke=\"#F472B6\" stroke-width=\"1.5\" fill=\"none\" opacity=\"0.55\" stroke-linecap=\"round\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"ear-right-inner-shade\" d=\"M 535 350 C 545 360 545 385 533 395\" stroke=\"#F472B6\" stroke-width=\"1.5\" fill=\"none\" opacity=\"0.55\" stroke-linecap=\"round\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"ear-right-inner-shade\" d=\"M 535 350 C 545 360 545 385 533 395\" stroke=\"#F472B6\" stroke-width=\"1.5\" fill=\"none\" opacity=\"0.55\" stroke-linecap=\"round\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 27,
    "step": 27,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服奶白衬衫主体",
    "description": "高品质纯棉白衬衣躯干平涂色块",
    "elementId": "clothes-shirt-torso",
    "xmlPatch": "<path id=\"clothes-shirt-torso\" d=\"M 270 540 L 320 515 L 480 515 L 530 540 L 580 640 L 590 850 L 210 850 L 220 640 Z\" fill=\"#FAF9F6\" stroke=\"#CBD5E1\" stroke-width=\"1.5\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"clothes-shirt-torso\" d=\"M 270 540 L 320 515 L 480 515 L 530 540 L 580 640 L 590 850 L 210 850 L 220 640 Z\" fill=\"#FAF9F6\" stroke=\"#CBD5E1\" stroke-width=\"1.5\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"clothes-shirt-torso\" d=\"M 270 540 L 320 515 L 480 515 L 530 540 L 580 640 L 590 850 L 210 850 L 220 640 Z\" fill=\"#FAF9F6\" stroke=\"#CBD5E1\" stroke-width=\"1.5\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 28,
    "step": 28,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服深墨绿领背披肩",
    "description": "沉稳深森绿 (Forest Teal) 水手翻领基底",
    "elementId": "clothes-collar-flap-base",
    "xmlPatch": "<path id=\"clothes-collar-flap-base\" d=\"M 330 515 L 235 630 L 320 635 L 360 555 L 440 555 L 480 635 L 565 630 L 470 515 Z\" fill=\"#0D4435\" stroke=\"#062F24\" stroke-width=\"1.5\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"clothes-collar-flap-base\" d=\"M 330 515 L 235 630 L 320 635 L 360 555 L 440 555 L 480 635 L 565 630 L 470 515 Z\" fill=\"#0D4435\" stroke=\"#062F24\" stroke-width=\"1.5\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"clothes-collar-flap-base\" d=\"M 330 515 L 235 630 L 320 635 L 360 555 L 440 555 L 480 635 L 565 630 L 470 515 Z\" fill=\"#0D4435\" stroke=\"#062F24\" stroke-width=\"1.5\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 29,
    "step": 29,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "领口黑色透气内衬护胸",
    "description": "水手服V字领口内深黑内衬",
    "elementId": "clothes-inner-modesty-panel",
    "xmlPatch": "<polygon id=\"clothes-inner-modesty-panel\" points=\"360,545 400,580 440,545\" fill=\"#0F172A\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <polygon id=\"clothes-inner-modesty-panel\" points=\"360,545 400,580 440,545\" fill=\"#0F172A\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <polygon id=\"clothes-inner-modesty-panel\" points=\"360,545 400,580 440,545\" fill=\"#0F172A\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 30,
    "step": 30,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "芥末金黄领巾结基座",
    "description": "领巾中间松散纽结厚实体块",
    "elementId": "clothes-scarf-knot-base",
    "xmlPatch": "<path id=\"clothes-scarf-knot-base\" d=\"M 385 558 C 385 550 415 550 415 558 L 418 578 C 418 585 382 585 382 578 Z\" fill=\"#F59E0B\" stroke=\"#D97706\" stroke-width=\"1.5\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"clothes-scarf-knot-base\" d=\"M 385 558 C 385 550 415 550 415 558 L 418 578 C 418 585 382 585 382 578 Z\" fill=\"#F59E0B\" stroke=\"#D97706\" stroke-width=\"1.5\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"clothes-scarf-knot-base\" d=\"M 385 558 C 385 550 415 550 415 558 L 418 578 C 418 585 382 585 382 578 Z\" fill=\"#F59E0B\" stroke=\"#D97706\" stroke-width=\"1.5\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 31,
    "step": 31,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "左侧垂落飘动领巾飘带",
    "description": "从胸结自然向左下倾泻飘舞的金色领巾",
    "elementId": "clothes-scarf-tail-left",
    "xmlPatch": "<path id=\"clothes-scarf-tail-left\" d=\"M 384 578 C 365 620 360 670 375 720 C 385 710 395 670 398 620 L 398 580 Z\" fill=\"#FBBF24\" stroke=\"#D97706\" stroke-width=\"1.2\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"clothes-scarf-tail-left\" d=\"M 384 578 C 365 620 360 670 375 720 C 385 710 395 670 398 620 L 398 580 Z\" fill=\"#FBBF24\" stroke=\"#D97706\" stroke-width=\"1.2\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"clothes-scarf-tail-left\" d=\"M 384 578 C 365 620 360 670 375 720 C 385 710 395 670 398 620 L 398 580 Z\" fill=\"#FBBF24\" stroke=\"#D97706\" stroke-width=\"1.2\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 32,
    "step": 32,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "右侧垂落飘动领巾飘带",
    "description": "从胸结向右下舒展飘舞的深黄领巾",
    "elementId": "clothes-scarf-tail-right",
    "xmlPatch": "<path id=\"clothes-scarf-tail-right\" d=\"M 416 578 C 435 620 440 670 425 720 C 415 710 405 670 402 620 L 402 580 Z\" fill=\"#EAB308\" stroke=\"#D97706\" stroke-width=\"1.2\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"clothes-scarf-tail-right\" d=\"M 416 578 C 435 620 440 670 425 720 C 415 710 405 670 402 620 L 402 580 Z\" fill=\"#EAB308\" stroke=\"#D97706\" stroke-width=\"1.2\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"clothes-scarf-tail-right\" d=\"M 416 578 C 435 620 440 670 425 720 C 415 710 405 670 402 620 L 402 580 Z\" fill=\"#EAB308\" stroke=\"#D97706\" stroke-width=\"1.2\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 33,
    "step": 33,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "skin_body",
    "layerName": "身体肤色",
    "title": "锁骨中线柔和骨架",
    "description": "胸骨上窝与锁骨优雅连线",
    "elementId": "skin-clavicle-bones",
    "xmlPatch": "<path id=\"skin-clavicle-bones\" d=\"M 350 535 Q 380 545 400 538 M 450 535 Q 420 545 400 538\" stroke=\"#E2B194\" stroke-width=\"1.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"skin-clavicle-bones\" d=\"M 350 535 Q 380 545 400 538 M 450 535 Q 420 545 400 538\" stroke=\"#E2B194\" stroke-width=\"1.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"skin-clavicle-bones\" d=\"M 350 535 Q 380 545 400 538 M 450 535 Q 420 545 400 538\" stroke=\"#E2B194\" stroke-width=\"1.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 34,
    "step": 34,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "下颌在颈部的落影",
    "description": "下巴在颈部投下的自然淡紫光影",
    "elementId": "shadow-neck-occlusion",
    "xmlPatch": "<polygon id=\"shadow-neck-occlusion\" points=\"365,455 400,510 435,455 400,465\" fill=\"#F2D5CE\" opacity=\"0.65\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <polygon id=\"shadow-neck-occlusion\" points=\"365,455 400,510 435,455 400,465\" fill=\"#F2D5CE\" opacity=\"0.65\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <polygon id=\"shadow-neck-occlusion\" points=\"365,455 400,510 435,455 400,465\" fill=\"#F2D5CE\" opacity=\"0.65\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 35,
    "step": 35,
    "stageId": "stage-2",
    "stageName": "02底模铺设",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "秀丽下颌轮廓精致加墨",
    "description": "面部精致V型下颌轮廓加深勾线",
    "elementId": "line-jawline-contour",
    "xmlPatch": "<path id=\"line-jawline-contour\" d=\"M 270 320 C 272 375 285 440 340 480 C 370 502 400 508 400 508 C 400 508 430 502 460 480 C 515 440 528 375 530 320\" stroke=\"#7C2D12\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"line-jawline-contour\" d=\"M 270 320 C 272 375 285 440 340 480 C 370 502 400 508 400 508 C 400 508 430 502 460 480 C 515 440 528 375 530 320\" stroke=\"#7C2D12\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"line-jawline-contour\" d=\"M 270 320 C 272 375 285 440 340 480 C 370 502 400 508 400 508 C 400 508 430 502 460 480 C 515 440 528 375 530 320\" stroke=\"#7C2D12\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 36,
    "step": 36,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服左翻领外侧金黄条纹",
    "description": "翻领边缘经典金黄滚边镶条",
    "elementId": "collar-stripe-left-outer",
    "xmlPatch": "<path id=\"collar-stripe-left-outer\" d=\"M 325 525 L 246 622 L 318 626\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"collar-stripe-left-outer\" d=\"M 325 525 L 246 622 L 318 626\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"collar-stripe-left-outer\" d=\"M 325 525 L 246 622 L 318 626\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 37,
    "step": 37,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服左翻领内侧金黄条纹",
    "description": "翻领内侧平行第二道精致金黄装饰条",
    "elementId": "collar-stripe-left-inner",
    "xmlPatch": "<path id=\"collar-stripe-left-inner\" d=\"M 335 535 L 260 614 L 316 618\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"collar-stripe-left-inner\" d=\"M 335 535 L 260 614 L 316 618\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"collar-stripe-left-inner\" d=\"M 335 535 L 260 614 L 316 618\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 38,
    "step": 38,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服右翻领外侧金黄条纹",
    "description": "右侧翻领对称金黄滚边外条纹",
    "elementId": "collar-stripe-right-outer",
    "xmlPatch": "<path id=\"collar-stripe-right-outer\" d=\"M 475 525 L 554 622 L 482 626\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"collar-stripe-right-outer\" d=\"M 475 525 L 554 622 L 482 626\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"collar-stripe-right-outer\" d=\"M 475 525 L 554 622 L 482 626\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 39,
    "step": 39,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服右翻领内侧金黄条纹",
    "description": "右侧翻领对称内侧金黄细条纹",
    "elementId": "collar-stripe-right-inner",
    "xmlPatch": "<path id=\"collar-stripe-right-inner\" d=\"M 465 535 L 540 614 L 484 618\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"collar-stripe-right-inner\" d=\"M 465 535 L 540 614 L 484 618\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"collar-stripe-right-inner\" d=\"M 465 535 L 540 614 L 484 618\" stroke=\"#FDE047\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 40,
    "step": 40,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "衬衣腋下与胸侧赛璐璐阴影",
    "description": "白衬衫侧腹自然布料受光遮挡暗部",
    "elementId": "shirt-fold-shading-left",
    "xmlPatch": "<path id=\"shirt-fold-shading-left\" d=\"M 220 640 L 270 540 L 290 600 L 250 690 Z\" fill=\"#E2E8F0\" opacity=\"0.8\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-fold-shading-left\" d=\"M 220 640 L 270 540 L 290 600 L 250 690 Z\" fill=\"#E2E8F0\" opacity=\"0.8\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-fold-shading-left\" d=\"M 220 640 L 270 540 L 290 600 L 250 690 Z\" fill=\"#E2E8F0\" opacity=\"0.8\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 41,
    "step": 41,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "衬衣右侧布料皱褶折面",
    "description": "右侧白衬衣受光阴影与褶皱切面",
    "elementId": "shirt-fold-shading-right",
    "xmlPatch": "<path id=\"shirt-fold-shading-right\" d=\"M 580 640 L 530 540 L 510 600 L 550 690 Z\" fill=\"#E2E8F0\" opacity=\"0.8\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-fold-shading-right\" d=\"M 580 640 L 530 540 L 510 600 L 550 690 Z\" fill=\"#E2E8F0\" opacity=\"0.8\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-fold-shading-right\" d=\"M 580 640 L 530 540 L 510 600 L 550 690 Z\" fill=\"#E2E8F0\" opacity=\"0.8\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 42,
    "step": 42,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手领背部转角阴影",
    "description": "领面下垂于前胸产生的软转折阴影",
    "elementId": "collar-drop-shadow-chest",
    "xmlPatch": "<path id=\"collar-drop-shadow-chest\" d=\"M 330 635 L 400 660 L 470 635 L 400 645 Z\" fill=\"#062F24\" opacity=\"0.4\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"collar-drop-shadow-chest\" d=\"M 330 635 L 400 660 L 470 635 L 400 645 Z\" fill=\"#062F24\" opacity=\"0.4\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"collar-drop-shadow-chest\" d=\"M 330 635 L 400 660 L 470 635 L 400 645 Z\" fill=\"#062F24\" opacity=\"0.4\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 43,
    "step": 43,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "金色领巾中间深色折痕",
    "description": "领结中央布料紧缩立体深影",
    "elementId": "scarf-knot-center-crease",
    "xmlPatch": "<path id=\"scarf-knot-center-crease\" d=\"M 398 558 L 402 578\" stroke=\"#B45309\" stroke-width=\"2\" stroke-linecap=\"round\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"scarf-knot-center-crease\" d=\"M 398 558 L 402 578\" stroke=\"#B45309\" stroke-width=\"2\" stroke-linecap=\"round\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"scarf-knot-center-crease\" d=\"M 398 558 L 402 578\" stroke=\"#B45309\" stroke-width=\"2\" stroke-linecap=\"round\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 44,
    "step": 44,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "左飘带立体受光折面",
    "description": "左飘带明亮金黄高光区",
    "elementId": "scarf-tail-left-highlight",
    "xmlPatch": "<path id=\"scarf-tail-left-highlight\" d=\"M 388 585 C 375 620 370 660 380 705\" stroke=\"#FEF08A\" stroke-width=\"2\" fill=\"none\" opacity=\"0.8\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"scarf-tail-left-highlight\" d=\"M 388 585 C 375 620 370 660 380 705\" stroke=\"#FEF08A\" stroke-width=\"2\" fill=\"none\" opacity=\"0.8\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"scarf-tail-left-highlight\" d=\"M 388 585 C 375 620 370 660 380 705\" stroke=\"#FEF08A\" stroke-width=\"2\" fill=\"none\" opacity=\"0.8\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 45,
    "step": 45,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "右飘带立体阴影折面",
    "description": "右飘带翻卷深琥珀阴影切面",
    "elementId": "scarf-tail-right-shadow",
    "xmlPatch": "<path id=\"scarf-tail-right-shadow\" d=\"M 405 585 C 420 630 425 670 415 710\" stroke=\"#92400E\" stroke-width=\"2\" fill=\"none\" opacity=\"0.8\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"scarf-tail-right-shadow\" d=\"M 405 585 C 420 630 425 670 415 710\" stroke=\"#92400E\" stroke-width=\"2\" fill=\"none\" opacity=\"0.8\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"scarf-tail-right-shadow\" d=\"M 405 585 C 420 630 425 670 415 710\" stroke=\"#92400E\" stroke-width=\"2\" fill=\"none\" opacity=\"0.8\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 46,
    "step": 46,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "后发深紫暗影微渐变",
    "description": "增强发丝深度感与空间体积感的加深暗面",
    "elementId": "hair-back-volume-shadow",
    "xmlPatch": "<path id=\"hair-back-volume-shadow\" d=\"M 200 600 C 240 645 280 655 340 655 L 460 655 C 520 655 560 645 600 600 C 580 645 540 660 480 660 L 320 660 C 260 660 220 645 200 600 Z\" fill=\"#18131E\" data-part=\"hair_back\" />",
    "addedLines": [
      "+ <path id=\"hair-back-volume-shadow\" d=\"M 200 600 C 240 645 280 655 340 655 L 460 655 C 520 655 560 645 600 600 C 580 645 540 660 480 660 L 320 660 C 260 660 220 645 200 600 Z\" fill=\"#18131E\" data-part=\"hair_back\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-back-volume-shadow\" d=\"M 200 600 C 240 645 280 655 340 655 L 460 655 C 520 655 560 645 600 600 C 580 645 540 660 480 660 L 320 660 C 260 660 220 645 200 600 Z\" fill=\"#18131E\" data-part=\"hair_back\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_back"
    }
  },
  {
    "id": 47,
    "step": 47,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "左侧后卷发丝明暗交界线",
    "description": "左侧发缕立体感分界线",
    "elementId": "hair-back-curl-line-l",
    "xmlPatch": "<path id=\"hair-back-curl-line-l\" d=\"M 215 520 Q 200 580 225 630\" stroke=\"#4A415A\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\" data-part=\"hair_back\" />",
    "addedLines": [
      "+ <path id=\"hair-back-curl-line-l\" d=\"M 215 520 Q 200 580 225 630\" stroke=\"#4A415A\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\" data-part=\"hair_back\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-back-curl-line-l\" d=\"M 215 520 Q 200 580 225 630\" stroke=\"#4A415A\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\" data-part=\"hair_back\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_back"
    }
  },
  {
    "id": 48,
    "step": 48,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "右侧后卷发丝明暗交界线",
    "description": "右侧发缕立体感分界线",
    "elementId": "hair-back-curl-line-r",
    "xmlPatch": "<path id=\"hair-back-curl-line-r\" d=\"M 585 520 Q 600 580 575 630\" stroke=\"#4A415A\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\" data-part=\"hair_back\" />",
    "addedLines": [
      "+ <path id=\"hair-back-curl-line-r\" d=\"M 585 520 Q 600 580 575 630\" stroke=\"#4A415A\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\" data-part=\"hair_back\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-back-curl-line-r\" d=\"M 585 520 Q 600 580 575 630\" stroke=\"#4A415A\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\" data-part=\"hair_back\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_back"
    }
  },
  {
    "id": 49,
    "step": 49,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服衬衣微织物漫射明暗切面 1",
    "description": "纯净赛璐璐衣物细微折皱切面 1",
    "elementId": "shirt-micro-fold-1",
    "xmlPatch": "<path id=\"shirt-micro-fold-1\" d=\"M 302 695 Q 320 720 312 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-micro-fold-1\" d=\"M 302 695 Q 320 720 312 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-micro-fold-1\" d=\"M 302 695 Q 320 720 312 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 50,
    "step": 50,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服衬衣微织物漫射明暗切面 2",
    "description": "纯净赛璐璐衣物细微折皱切面 2",
    "elementId": "shirt-micro-fold-2",
    "xmlPatch": "<path id=\"shirt-micro-fold-2\" d=\"M 324 710 Q 340 720 334 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-micro-fold-2\" d=\"M 324 710 Q 340 720 334 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-micro-fold-2\" d=\"M 324 710 Q 340 720 334 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 51,
    "step": 51,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服衬衣微织物漫射明暗切面 3",
    "description": "纯净赛璐璐衣物细微折皱切面 3",
    "elementId": "shirt-micro-fold-3",
    "xmlPatch": "<path id=\"shirt-micro-fold-3\" d=\"M 346 680 Q 360 720 356 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-micro-fold-3\" d=\"M 346 680 Q 360 720 356 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-micro-fold-3\" d=\"M 346 680 Q 360 720 356 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 52,
    "step": 52,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服衬衣微织物漫射明暗切面 4",
    "description": "纯净赛璐璐衣物细微折皱切面 4",
    "elementId": "shirt-micro-fold-4",
    "xmlPatch": "<path id=\"shirt-micro-fold-4\" d=\"M 368 695 Q 380 720 378 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-micro-fold-4\" d=\"M 368 695 Q 380 720 378 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-micro-fold-4\" d=\"M 368 695 Q 380 720 378 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 53,
    "step": 53,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服衬衣微织物漫射明暗切面 5",
    "description": "纯净赛璐璐衣物细微折皱切面 5",
    "elementId": "shirt-micro-fold-5",
    "xmlPatch": "<path id=\"shirt-micro-fold-5\" d=\"M 390 710 Q 400 720 400 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-micro-fold-5\" d=\"M 390 710 Q 400 720 400 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-micro-fold-5\" d=\"M 390 710 Q 400 720 400 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 54,
    "step": 54,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服衬衣微织物漫射明暗切面 6",
    "description": "纯净赛璐璐衣物细微折皱切面 6",
    "elementId": "shirt-micro-fold-6",
    "xmlPatch": "<path id=\"shirt-micro-fold-6\" d=\"M 412 680 Q 420 720 422 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-micro-fold-6\" d=\"M 412 680 Q 420 720 422 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-micro-fold-6\" d=\"M 412 680 Q 420 720 422 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 55,
    "step": 55,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服衬衣微织物漫射明暗切面 7",
    "description": "纯净赛璐璐衣物细微折皱切面 7",
    "elementId": "shirt-micro-fold-7",
    "xmlPatch": "<path id=\"shirt-micro-fold-7\" d=\"M 434 695 Q 440 720 444 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-micro-fold-7\" d=\"M 434 695 Q 440 720 444 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-micro-fold-7\" d=\"M 434 695 Q 440 720 444 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 56,
    "step": 56,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服衬衣微织物漫射明暗切面 8",
    "description": "纯净赛璐璐衣物细微折皱切面 8",
    "elementId": "shirt-micro-fold-8",
    "xmlPatch": "<path id=\"shirt-micro-fold-8\" d=\"M 456 710 Q 460 720 466 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-micro-fold-8\" d=\"M 456 710 Q 460 720 466 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-micro-fold-8\" d=\"M 456 710 Q 460 720 466 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 57,
    "step": 57,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服衬衣微织物漫射明暗切面 9",
    "description": "纯净赛璐璐衣物细微折皱切面 9",
    "elementId": "shirt-micro-fold-9",
    "xmlPatch": "<path id=\"shirt-micro-fold-9\" d=\"M 478 680 Q 480 720 488 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-micro-fold-9\" d=\"M 478 680 Q 480 720 488 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-micro-fold-9\" d=\"M 478 680 Q 480 720 488 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 58,
    "step": 58,
    "stageId": "stage-3",
    "stageName": "03结构阴影",
    "layerId": "clothes",
    "layerName": "服饰层次",
    "title": "水手服衬衣微织物漫射明暗切面 10",
    "description": "纯净赛璐璐衣物细微折皱切面 10",
    "elementId": "shirt-micro-fold-10",
    "xmlPatch": "<path id=\"shirt-micro-fold-10\" d=\"M 500 695 Q 500 720 510 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />",
    "addedLines": [
      "+ <path id=\"shirt-micro-fold-10\" d=\"M 500 695 Q 500 720 510 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"shirt-micro-fold-10\" d=\"M 500 695 Q 500 720 510 750\" stroke=\"#CBD5E1\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.6\" data-part=\"clothes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "clothes"
    }
  },
  {
    "id": 59,
    "step": 59,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "左眉温柔微忧下垂弧线",
    "description": "微挑后柔和下垂的惹人怜爱左眉毛",
    "elementId": "eyebrow-left-worried",
    "xmlPatch": "<path id=\"eyebrow-left-worried\" d=\"M 312 330 C 330 318 355 318 375 328\" stroke=\"#3B3448\" stroke-width=\"3.5\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"eyebrow-left-worried\" d=\"M 312 330 C 330 318 355 318 375 328\" stroke=\"#3B3448\" stroke-width=\"3.5\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"eyebrow-left-worried\" d=\"M 312 330 C 330 318 355 318 375 328\" stroke=\"#3B3448\" stroke-width=\"3.5\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 60,
    "step": 60,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "右眉温柔微忧下垂弧线",
    "description": "对称微蹙柔美右眉毛",
    "elementId": "eyebrow-right-worried",
    "xmlPatch": "<path id=\"eyebrow-right-worried\" d=\"M 425 328 C 445 318 470 318 488 330\" stroke=\"#3B3448\" stroke-width=\"3.5\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"eyebrow-right-worried\" d=\"M 425 328 C 445 318 470 318 488 330\" stroke=\"#3B3448\" stroke-width=\"3.5\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"eyebrow-right-worried\" d=\"M 425 328 C 445 318 470 318 488 330\" stroke=\"#3B3448\" stroke-width=\"3.5\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 61,
    "step": 61,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "双眉下缘浅棕阴影",
    "description": "增强眉骨深度与神态立体感",
    "elementId": "eyebrow-undershadows",
    "xmlPatch": "<path id=\"eyebrow-undershadows\" d=\"M 316 333 C 332 323 352 323 371 331 M 429 331 C 448 323 468 323 484 333\" stroke=\"#6D5A75\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.5\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"eyebrow-undershadows\" d=\"M 316 333 C 332 323 352 323 371 331 M 429 331 C 448 323 468 323 484 333\" stroke=\"#6D5A75\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.5\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"eyebrow-undershadows\" d=\"M 316 333 C 332 323 352 323 371 331 M 429 331 C 448 323 468 323 484 333\" stroke=\"#6D5A75\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.5\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 62,
    "step": 62,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "左眼杏仁形明亮眼白巩膜",
    "description": "左眼完整闭合眼白椭圆底板",
    "elementId": "sclera-left-solid",
    "xmlPatch": "<path id=\"sclera-left-solid\" d=\"M 312 375 C 322 352 368 352 378 375 C 370 398 322 398 312 375 Z\" fill=\"#FFFFFF\" stroke=\"#E2E8F0\" stroke-width=\"1\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"sclera-left-solid\" d=\"M 312 375 C 322 352 368 352 378 375 C 370 398 322 398 312 375 Z\" fill=\"#FFFFFF\" stroke=\"#E2E8F0\" stroke-width=\"1\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sclera-left-solid\" d=\"M 312 375 C 322 352 368 352 378 375 C 370 398 322 398 312 375 Z\" fill=\"#FFFFFF\" stroke=\"#E2E8F0\" stroke-width=\"1\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 63,
    "step": 63,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "左眼上眼睑投射眼白阴影",
    "description": "眼球上方受上睫毛遮盖的淡紫灰落影",
    "elementId": "sclera-left-top-shadow",
    "xmlPatch": "<path id=\"sclera-left-top-shadow\" d=\"M 314 372 C 324 358 366 358 376 372 C 365 378 325 378 314 372 Z\" fill=\"#CBD5E1\" opacity=\"0.55\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"sclera-left-top-shadow\" d=\"M 314 372 C 324 358 366 358 376 372 C 365 378 325 378 314 372 Z\" fill=\"#CBD5E1\" opacity=\"0.55\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sclera-left-top-shadow\" d=\"M 314 372 C 324 358 366 358 376 372 C 365 378 325 378 314 372 Z\" fill=\"#CBD5E1\" opacity=\"0.55\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 64,
    "step": 64,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "左眼璀璨金黄虹膜球盘",
    "description": "金黄向深琥珀过渡的猫眼大圆瞳盘",
    "elementId": "iris-disc-left-gold",
    "xmlPatch": "<ellipse id=\"iris-disc-left-gold\" cx=\"345\" cy=\"378\" rx=\"21\" ry=\"23\" fill=\"url(#deocin-iris-gold)\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <ellipse id=\"iris-disc-left-gold\" cx=\"345\" cy=\"378\" rx=\"21\" ry=\"23\" fill=\"url(#deocin-iris-gold)\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <ellipse id=\"iris-disc-left-gold\" cx=\"345\" cy=\"378\" rx=\"21\" ry=\"23\" fill=\"url(#deocin-iris-gold)\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 65,
    "step": 65,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "左眼深黑曜石瞳心",
    "description": "收敛竖直猫眼感深邃黑色瞳孔",
    "elementId": "pupil-left-deep",
    "xmlPatch": "<ellipse id=\"pupil-left-deep\" cx=\"345\" cy=\"378\" rx=\"6.5\" ry=\"10\" fill=\"#1C1917\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <ellipse id=\"pupil-left-deep\" cx=\"345\" cy=\"378\" rx=\"6.5\" ry=\"10\" fill=\"#1C1917\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <ellipse id=\"pupil-left-deep\" cx=\"345\" cy=\"378\" rx=\"6.5\" ry=\"10\" fill=\"#1C1917\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 66,
    "step": 66,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "左眼下弦月亮黄反光",
    "description": "虹膜下半部晶莹剔透柠檬亮黄高光月牙",
    "elementId": "iris-crescent-left",
    "xmlPatch": "<path id=\"iris-crescent-left\" d=\"M 329 382 A 16 16 0 0 0 361 382 Q 345 400 329 382\" fill=\"#FEF08A\" opacity=\"0.9\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"iris-crescent-left\" d=\"M 329 382 A 16 16 0 0 0 361 382 Q 345 400 329 382\" fill=\"#FEF08A\" opacity=\"0.9\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"iris-crescent-left\" d=\"M 329 382 A 16 16 0 0 0 361 382 Q 345 400 329 382\" fill=\"#FEF08A\" opacity=\"0.9\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 67,
    "step": 67,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "左眼微细放射光线纹理",
    "description": "4道精细金黄瞳纹提升水润透光感",
    "elementId": "iris-rays-left",
    "xmlPatch": "<g id=\"iris-rays-left\" stroke=\"#FFFBEB\" stroke-width=\"0.8\" opacity=\"0.8\" data-part=\"eyes\"><line x1=\"337\" y1=\"388\" x2=\"341\" y2=\"384\" /><line x1=\"353\" y1=\"388\" x2=\"349\" y2=\"384\" /><line x1=\"339\" y1=\"372\" x2=\"342\" y2=\"375\" /><line x1=\"351\" y1=\"372\" x2=\"348\" y2=\"375\" /></g>",
    "addedLines": [
      "+ <g id=\"iris-rays-left\" stroke=\"#FFFBEB\" stroke-width=\"0.8\" opacity=\"0.8\" data-part=\"eyes\"><line x1=\"337\" y1=\"388\" x2=\"341\" y2=\"384\" /><line x1=\"353\" y1=\"388\" x2=\"349\" y2=\"384\" /><line x1=\"339\" y1=\"372\" x2=\"342\" y2=\"375\" /><line x1=\"351\" y1=\"372\" x2=\"348\" y2=\"375\" /></g>"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <g id=\"iris-rays-left\" stroke=\"#FFFBEB\" stroke-width=\"0.8\" opacity=\"0.8\" data-part=\"eyes\"><line x1=\"337\" y1=\"388\" x2=\"341\" y2=\"384\" /><line x1=\"353\" y1=\"388\" x2=\"349\" y2=\"384\" /><line x1=\"339\" y1=\"372\" x2=\"342\" y2=\"375\" /><line x1=\"351\" y1=\"372\" x2=\"348\" y2=\"375\" /></g>"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 68,
    "step": 68,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "左眼主光源高光水泡",
    "description": "10点钟方向耀眼纯白主聚光圆点",
    "elementId": "catchlight-left-main",
    "xmlPatch": "<circle id=\"catchlight-left-main\" cx=\"338\" cy=\"367\" r=\"5.5\" fill=\"#FFFFFF\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <circle id=\"catchlight-left-main\" cx=\"338\" cy=\"367\" r=\"5.5\" fill=\"#FFFFFF\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <circle id=\"catchlight-left-main\" cx=\"338\" cy=\"367\" r=\"5.5\" fill=\"#FFFFFF\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 69,
    "step": 69,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "左眼4点钟微反光斑",
    "description": "下眼睑环境光二次漫反射白斑",
    "elementId": "catchlight-left-sub",
    "xmlPatch": "<circle id=\"catchlight-left-sub\" cx=\"354\" cy=\"388\" r=\"3.2\" fill=\"#FFFFFF\" opacity=\"0.9\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <circle id=\"catchlight-left-sub\" cx=\"354\" cy=\"388\" r=\"3.2\" fill=\"#FFFFFF\" opacity=\"0.9\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <circle id=\"catchlight-left-sub\" cx=\"354\" cy=\"388\" r=\"3.2\" fill=\"#FFFFFF\" opacity=\"0.9\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 70,
    "step": 70,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "左眼瞳孔内嵌四角星光",
    "description": "二次元高阶星芒晶莹十字高光点",
    "elementId": "catchlight-left-star",
    "xmlPatch": "<polygon id=\"catchlight-left-star\" points=\"345,368 346.5,371 349,371 347,372.5 348,375 345,373 342,375 343,372.5 341,371 343.5,371\" fill=\"#FFFFFF\" opacity=\"0.95\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <polygon id=\"catchlight-left-star\" points=\"345,368 346.5,371 349,371 347,372.5 348,375 345,373 342,375 343,372.5 341,371 343.5,371\" fill=\"#FFFFFF\" opacity=\"0.95\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <polygon id=\"catchlight-left-star\" points=\"345,368 346.5,371 349,371 347,372.5 348,375 345,373 342,375 343,372.5 341,371 343.5,371\" fill=\"#FFFFFF\" opacity=\"0.95\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 71,
    "step": 71,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "左眼浓密上睫毛主线",
    "description": "二次元张力深黑上眼线加粗勾勒",
    "elementId": "eyelash-left-upper",
    "xmlPatch": "<path id=\"eyelash-left-upper\" d=\"M 306 373 C 320 348 370 350 384 368\" stroke=\"#1F1A24\" stroke-width=\"4.2\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"eyelash-left-upper\" d=\"M 306 373 C 320 348 370 350 384 368\" stroke=\"#1F1A24\" stroke-width=\"4.2\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"eyelash-left-upper\" d=\"M 306 373 C 320 348 370 350 384 368\" stroke=\"#1F1A24\" stroke-width=\"4.2\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 72,
    "step": 72,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "左眼眼角上扬尖锐睫毛刺",
    "description": "左眼外眼角2簇经典上翘睫毛小倒刺",
    "elementId": "eyelash-left-spikes",
    "xmlPatch": "<g id=\"eyelash-left-spikes\" fill=\"#1F1A24\" data-part=\"eyes\"><polygon points=\"380,366 388,360 382,370\" /><polygon points=\"370,354 375,348 373,356\" /></g>",
    "addedLines": [
      "+ <g id=\"eyelash-left-spikes\" fill=\"#1F1A24\" data-part=\"eyes\"><polygon points=\"380,366 388,360 382,370\" /><polygon points=\"370,354 375,348 373,356\" /></g>"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <g id=\"eyelash-left-spikes\" fill=\"#1F1A24\" data-part=\"eyes\"><polygon points=\"380,366 388,360 382,370\" /><polygon points=\"370,354 375,348 373,356\" /></g>"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 73,
    "step": 73,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "左眼清晰双眼皮褶皱折线",
    "description": "优雅纤细双眼皮自然折痕",
    "elementId": "eyelid-left-fold",
    "xmlPatch": "<path id=\"eyelid-left-fold\" d=\"M 318 350 Q 345 342 372 350\" stroke=\"#854D0E\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"eyelid-left-fold\" d=\"M 318 350 Q 345 342 372 350\" stroke=\"#854D0E\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"eyelid-left-fold\" d=\"M 318 350 Q 345 342 372 350\" stroke=\"#854D0E\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 74,
    "step": 74,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "左眼下眼睑精致软睫毛",
    "description": "下眼睑点缀2根轻软下垂细睫毛",
    "elementId": "eyelash-left-lower",
    "xmlPatch": "<path id=\"eyelash-left-lower\" d=\"M 332 396 L 330 401 M 358 397 L 360 402\" stroke=\"#451A03\" stroke-width=\"1.3\" stroke-linecap=\"round\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"eyelash-left-lower\" d=\"M 332 396 L 330 401 M 358 397 L 360 402\" stroke=\"#451A03\" stroke-width=\"1.3\" stroke-linecap=\"round\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"eyelash-left-lower\" d=\"M 332 396 L 330 401 M 358 397 L 360 402\" stroke=\"#451A03\" stroke-width=\"1.3\" stroke-linecap=\"round\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 75,
    "step": 75,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "右眼杏仁形明亮眼白巩膜",
    "description": "右眼对称完整闭合眼白椭圆底板",
    "elementId": "sclera-right-solid",
    "xmlPatch": "<path id=\"sclera-right-solid\" d=\"M 422 375 C 432 352 478 352 488 375 C 480 398 432 398 422 375 Z\" fill=\"#FFFFFF\" stroke=\"#E2E8F0\" stroke-width=\"1\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"sclera-right-solid\" d=\"M 422 375 C 432 352 478 352 488 375 C 480 398 432 398 422 375 Z\" fill=\"#FFFFFF\" stroke=\"#E2E8F0\" stroke-width=\"1\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sclera-right-solid\" d=\"M 422 375 C 432 352 478 352 488 375 C 480 398 432 398 422 375 Z\" fill=\"#FFFFFF\" stroke=\"#E2E8F0\" stroke-width=\"1\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 76,
    "step": 76,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "右眼上眼睑投射眼白阴影",
    "description": "右眼球上方受上睫毛遮盖的淡紫灰落影",
    "elementId": "sclera-right-top-shadow",
    "xmlPatch": "<path id=\"sclera-right-top-shadow\" d=\"M 424 372 C 434 358 476 358 486 372 C 475 378 435 378 424 372 Z\" fill=\"#CBD5E1\" opacity=\"0.55\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"sclera-right-top-shadow\" d=\"M 424 372 C 434 358 476 358 486 372 C 475 378 435 378 424 372 Z\" fill=\"#CBD5E1\" opacity=\"0.55\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"sclera-right-top-shadow\" d=\"M 424 372 C 434 358 476 358 486 372 C 475 378 435 378 424 372 Z\" fill=\"#CBD5E1\" opacity=\"0.55\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 77,
    "step": 77,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "右眼璀璨金黄虹膜球盘",
    "description": "对称金黄向深琥珀渐变的大圆瞳盘",
    "elementId": "iris-disc-right-gold",
    "xmlPatch": "<ellipse id=\"iris-disc-right-gold\" cx=\"455\" cy=\"378\" rx=\"21\" ry=\"23\" fill=\"url(#deocin-iris-gold)\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <ellipse id=\"iris-disc-right-gold\" cx=\"455\" cy=\"378\" rx=\"21\" ry=\"23\" fill=\"url(#deocin-iris-gold)\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <ellipse id=\"iris-disc-right-gold\" cx=\"455\" cy=\"378\" rx=\"21\" ry=\"23\" fill=\"url(#deocin-iris-gold)\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 78,
    "step": 78,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "右眼深黑曜石瞳心",
    "description": "对称收敛猫眼感深邃黑色瞳孔",
    "elementId": "pupil-right-deep",
    "xmlPatch": "<ellipse id=\"pupil-right-deep\" cx=\"455\" cy=\"378\" rx=\"6.5\" ry=\"10\" fill=\"#1C1917\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <ellipse id=\"pupil-right-deep\" cx=\"455\" cy=\"378\" rx=\"6.5\" ry=\"10\" fill=\"#1C1917\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <ellipse id=\"pupil-right-deep\" cx=\"455\" cy=\"378\" rx=\"6.5\" ry=\"10\" fill=\"#1C1917\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 79,
    "step": 79,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "右眼下弦月亮黄反光",
    "description": "右眼下半部晶莹剔透柠檬亮黄高光月牙",
    "elementId": "iris-crescent-right",
    "xmlPatch": "<path id=\"iris-crescent-right\" d=\"M 439 382 A 16 16 0 0 0 471 382 Q 455 400 439 382\" fill=\"#FEF08A\" opacity=\"0.9\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"iris-crescent-right\" d=\"M 439 382 A 16 16 0 0 0 471 382 Q 455 400 439 382\" fill=\"#FEF08A\" opacity=\"0.9\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"iris-crescent-right\" d=\"M 439 382 A 16 16 0 0 0 471 382 Q 455 400 439 382\" fill=\"#FEF08A\" opacity=\"0.9\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 80,
    "step": 80,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "右眼微细放射光线纹理",
    "description": "对称4道精细金黄瞳纹",
    "elementId": "iris-rays-right",
    "xmlPatch": "<g id=\"iris-rays-right\" stroke=\"#FFFBEB\" stroke-width=\"0.8\" opacity=\"0.8\" data-part=\"eyes\"><line x1=\"447\" y1=\"388\" x2=\"451\" y2=\"384\" /><line x1=\"463\" y1=\"388\" x2=\"459\" y2=\"384\" /><line x1=\"449\" y1=\"372\" x2=\"452\" y2=\"375\" /><line x1=\"461\" y1=\"372\" x2=\"458\" y2=\"375\" /></g>",
    "addedLines": [
      "+ <g id=\"iris-rays-right\" stroke=\"#FFFBEB\" stroke-width=\"0.8\" opacity=\"0.8\" data-part=\"eyes\"><line x1=\"447\" y1=\"388\" x2=\"451\" y2=\"384\" /><line x1=\"463\" y1=\"388\" x2=\"459\" y2=\"384\" /><line x1=\"449\" y1=\"372\" x2=\"452\" y2=\"375\" /><line x1=\"461\" y1=\"372\" x2=\"458\" y2=\"375\" /></g>"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <g id=\"iris-rays-right\" stroke=\"#FFFBEB\" stroke-width=\"0.8\" opacity=\"0.8\" data-part=\"eyes\"><line x1=\"447\" y1=\"388\" x2=\"451\" y2=\"384\" /><line x1=\"463\" y1=\"388\" x2=\"459\" y2=\"384\" /><line x1=\"449\" y1=\"372\" x2=\"452\" y2=\"375\" /><line x1=\"461\" y1=\"372\" x2=\"458\" y2=\"375\" /></g>"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 81,
    "step": 81,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "右眼主光源高光水泡",
    "description": "右眼10点钟方向耀眼纯白主聚光圆点",
    "elementId": "catchlight-right-main",
    "xmlPatch": "<circle id=\"catchlight-right-main\" cx=\"448\" cy=\"367\" r=\"5.5\" fill=\"#FFFFFF\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <circle id=\"catchlight-right-main\" cx=\"448\" cy=\"367\" r=\"5.5\" fill=\"#FFFFFF\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <circle id=\"catchlight-right-main\" cx=\"448\" cy=\"367\" r=\"5.5\" fill=\"#FFFFFF\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 82,
    "step": 82,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "右眼4点钟微反光斑",
    "description": "右眼下眼睑二次漫反射白斑",
    "elementId": "catchlight-right-sub",
    "xmlPatch": "<circle id=\"catchlight-right-sub\" cx=\"464\" cy=\"388\" r=\"3.2\" fill=\"#FFFFFF\" opacity=\"0.9\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <circle id=\"catchlight-right-sub\" cx=\"464\" cy=\"388\" r=\"3.2\" fill=\"#FFFFFF\" opacity=\"0.9\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <circle id=\"catchlight-right-sub\" cx=\"464\" cy=\"388\" r=\"3.2\" fill=\"#FFFFFF\" opacity=\"0.9\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 83,
    "step": 83,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "iris",
    "layerName": "五官眼眸",
    "title": "右眼瞳孔内嵌四角星光",
    "description": "右侧晶莹十字星芒高光点",
    "elementId": "catchlight-right-star",
    "xmlPatch": "<polygon id=\"catchlight-right-star\" points=\"455,368 456.5,371 459,371 457,372.5 458,375 455,373 452,375 453,372.5 451,371 453.5,371\" fill=\"#FFFFFF\" opacity=\"0.95\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <polygon id=\"catchlight-right-star\" points=\"455,368 456.5,371 459,371 457,372.5 458,375 455,373 452,375 453,372.5 451,371 453.5,371\" fill=\"#FFFFFF\" opacity=\"0.95\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <polygon id=\"catchlight-right-star\" points=\"455,368 456.5,371 459,371 457,372.5 458,375 455,373 452,375 453,372.5 451,371 453.5,371\" fill=\"#FFFFFF\" opacity=\"0.95\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 84,
    "step": 84,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "右眼浓密上睫毛主线",
    "description": "右侧张力深黑上眼线勾勒",
    "elementId": "eyelash-right-upper",
    "xmlPatch": "<path id=\"eyelash-right-upper\" d=\"M 416 368 C 430 350 480 348 494 373\" stroke=\"#1F1A24\" stroke-width=\"4.2\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"eyelash-right-upper\" d=\"M 416 368 C 430 350 480 348 494 373\" stroke=\"#1F1A24\" stroke-width=\"4.2\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"eyelash-right-upper\" d=\"M 416 368 C 430 350 480 348 494 373\" stroke=\"#1F1A24\" stroke-width=\"4.2\" stroke-linecap=\"round\" fill=\"none\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 85,
    "step": 85,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "右眼眼角上扬尖锐睫毛刺",
    "description": "右眼外眼角2簇上翘睫毛小倒刺",
    "elementId": "eyelash-right-spikes",
    "xmlPatch": "<g id=\"eyelash-right-spikes\" fill=\"#1F1A24\" data-part=\"eyes\"><polygon points=\"492,366 500,360 494,370\" /><polygon points=\"482,354 487,348 485,356\" /></g>",
    "addedLines": [
      "+ <g id=\"eyelash-right-spikes\" fill=\"#1F1A24\" data-part=\"eyes\"><polygon points=\"492,366 500,360 494,370\" /><polygon points=\"482,354 487,348 485,356\" /></g>"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <g id=\"eyelash-right-spikes\" fill=\"#1F1A24\" data-part=\"eyes\"><polygon points=\"492,366 500,360 494,370\" /><polygon points=\"482,354 487,348 485,356\" /></g>"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 86,
    "step": 86,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "右眼清晰双眼皮褶皱折线",
    "description": "右眼纤细双眼皮自然折痕",
    "elementId": "eyelid-right-fold",
    "xmlPatch": "<path id=\"eyelid-right-fold\" d=\"M 428 350 Q 455 342 482 350\" stroke=\"#854D0E\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"eyelid-right-fold\" d=\"M 428 350 Q 455 342 482 350\" stroke=\"#854D0E\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"eyelid-right-fold\" d=\"M 428 350 Q 455 342 482 350\" stroke=\"#854D0E\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 87,
    "step": 87,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "右眼下眼睑精致软睫毛",
    "description": "右眼下眼睑点缀2根轻软细睫毛",
    "elementId": "eyelash-right-lower",
    "xmlPatch": "<path id=\"eyelash-right-lower\" d=\"M 442 397 L 440 402 M 468 396 L 470 401\" stroke=\"#451A03\" stroke-width=\"1.3\" stroke-linecap=\"round\" data-part=\"eyes\" />",
    "addedLines": [
      "+ <path id=\"eyelash-right-lower\" d=\"M 442 397 L 440 402 M 468 396 L 470 401\" stroke=\"#451A03\" stroke-width=\"1.3\" stroke-linecap=\"round\" data-part=\"eyes\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"eyelash-right-lower\" d=\"M 442 397 L 440 402 M 468 396 L 470 401\" stroke=\"#451A03\" stroke-width=\"1.3\" stroke-linecap=\"round\" data-part=\"eyes\" />"
      ]
    },
    "metadata": {
      "live2dPart": "eyes"
    }
  },
  {
    "id": 88,
    "step": 88,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "精致微小鼻尖点",
    "description": "小巧秀气琥珀棕色鼻尖微点",
    "elementId": "nose-tip-dot",
    "xmlPatch": "<circle id=\"nose-tip-dot\" cx=\"400\" cy=\"424\" r=\"1.6\" fill=\"#B45309\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <circle id=\"nose-tip-dot\" cx=\"400\" cy=\"424\" r=\"1.6\" fill=\"#B45309\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <circle id=\"nose-tip-dot\" cx=\"400\" cy=\"424\" r=\"1.6\" fill=\"#B45309\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 89,
    "step": 89,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "鼻底极淡柔和投影",
    "description": "鼻下微弱粉肉色自然立体投影",
    "elementId": "nose-subtle-shadow",
    "xmlPatch": "<path id=\"nose-subtle-shadow\" d=\"M 398 428 Q 400 430 402 428\" stroke=\"#FDBA74\" stroke-width=\"1\" fill=\"none\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"nose-subtle-shadow\" d=\"M 398 428 Q 400 430 402 428\" stroke=\"#FDBA74\" stroke-width=\"1\" fill=\"none\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"nose-subtle-shadow\" d=\"M 398 428 Q 400 430 402 428\" stroke=\"#FDBA74\" stroke-width=\"1\" fill=\"none\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 90,
    "step": 90,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "【神情灵魂】轻微咬唇萌态下唇波浪线",
    "description": "微微受委屈/担心的轻咬唇萌感波浪唇线",
    "elementId": "mouth-worried-bitten-lip",
    "xmlPatch": "<path id=\"mouth-worried-bitten-lip\" d=\"M 385 458 C 392 455 398 461 402 458 C 408 455 414 460 418 457\" stroke=\"#991B1B\" stroke-width=\"2.2\" stroke-linecap=\"round\" fill=\"none\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"mouth-worried-bitten-lip\" d=\"M 385 458 C 392 455 398 461 402 458 C 408 455 414 460 418 457\" stroke=\"#991B1B\" stroke-width=\"2.2\" stroke-linecap=\"round\" fill=\"none\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"mouth-worried-bitten-lip\" d=\"M 385 458 C 392 455 398 461 402 458 C 408 455 414 460 418 457\" stroke=\"#991B1B\" stroke-width=\"2.2\" stroke-linecap=\"round\" fill=\"none\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 91,
    "step": 91,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "微微露出的小白虎牙反光",
    "description": "下唇边轻咬露出的纯白小尖牙",
    "elementId": "mouth-cute-little-tooth",
    "xmlPatch": "<polygon id=\"mouth-cute-little-tooth\" points=\"409,456 414,456 411,462\" fill=\"#FFFFFF\" stroke=\"#991B1B\" stroke-width=\"0.8\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <polygon id=\"mouth-cute-little-tooth\" points=\"409,456 414,456 411,462\" fill=\"#FFFFFF\" stroke=\"#991B1B\" stroke-width=\"0.8\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <polygon id=\"mouth-cute-little-tooth\" points=\"409,456 414,456 411,462\" fill=\"#FFFFFF\" stroke=\"#991B1B\" stroke-width=\"0.8\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 92,
    "step": 92,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "水润珊瑚粉下唇润泽高光",
    "description": "下唇微翘圆润珊瑚粉唇彩反光",
    "elementId": "mouth-coral-lip-gloss",
    "xmlPatch": "<ellipse id=\"mouth-coral-lip-gloss\" cx=\"401\" cy=\"463\" rx=\"7\" ry=\"2.8\" fill=\"#FDA4AF\" opacity=\"0.65\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <ellipse id=\"mouth-coral-lip-gloss\" cx=\"401\" cy=\"463\" rx=\"7\" ry=\"2.8\" fill=\"#FDA4AF\" opacity=\"0.65\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <ellipse id=\"mouth-coral-lip-gloss\" cx=\"401\" cy=\"463\" rx=\"7\" ry=\"2.8\" fill=\"#FDA4AF\" opacity=\"0.65\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 93,
    "step": 93,
    "stageId": "stage-4",
    "stageName": "04五官眼眸",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "下巴圆润微弧凹窝线",
    "description": "下巴与下唇交界极浅凹陷结构线",
    "elementId": "chin-subtle-contour",
    "xmlPatch": "<path id=\"chin-subtle-contour\" d=\"M 397 482 Q 400 484 403 482\" stroke=\"#E2B194\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <path id=\"chin-subtle-contour\" d=\"M 397 482 Q 400 484 403 482\" stroke=\"#E2B194\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"chin-subtle-contour\" d=\"M 397 482 Q 400 484 403 482\" stroke=\"#E2B194\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 94,
    "step": 94,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】前发刘海主发量底面",
    "description": "★独立可移开的前额饱满紫灰刘海体块",
    "elementId": "hair-front-bangs-main",
    "xmlPatch": "<path id=\"hair-front-bangs-main\" d=\"M 265 310 C 275 385 300 400 325 355 C 340 405 370 415 390 365 C 410 415 440 410 455 365 C 475 405 505 395 515 355 C 525 385 535 340 535 310 C 510 230 290 230 265 310 Z\" fill=\"#3B3448\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-front-bangs-main\" d=\"M 265 310 C 275 385 300 400 325 355 C 340 405 370 415 390 365 C 410 415 440 410 455 365 C 475 405 505 395 515 355 C 525 385 535 340 535 310 C 510 230 290 230 265 310 Z\" fill=\"#3B3448\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-front-bangs-main\" d=\"M 265 310 C 275 385 300 400 325 355 C 340 405 370 415 390 365 C 410 415 440 410 455 365 C 475 405 505 395 515 355 C 525 385 535 340 535 310 C 510 230 290 230 265 310 Z\" fill=\"#3B3448\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 95,
    "step": 95,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】刘海下缘暗紫色深层背影",
    "description": "刘海发梢下缘产生纵深感的深暗紫阴影面",
    "elementId": "hair-front-bangs-underyarn",
    "xmlPatch": "<path id=\"hair-front-bangs-underyarn\" d=\"M 270 340 C 285 395 305 405 325 365 C 345 412 372 418 390 372 C 412 418 438 412 455 372 C 475 410 495 400 515 365 C 525 375 530 350 530 340 Z\" fill=\"#282232\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-front-bangs-underyarn\" d=\"M 270 340 C 285 395 305 405 325 365 C 345 412 372 418 390 372 C 412 418 438 412 455 372 C 475 410 495 400 515 365 C 525 375 530 350 530 340 Z\" fill=\"#282232\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-front-bangs-underyarn\" d=\"M 270 340 C 285 395 305 405 325 365 C 345 412 372 418 390 372 C 412 418 438 412 455 372 C 475 410 495 400 515 365 C 525 375 530 350 530 340 Z\" fill=\"#282232\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 96,
    "step": 96,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】前额左发簇修颜发梢",
    "description": "左侧自然贴合脸颊的斜切微卷发簇",
    "elementId": "hair-front-strand-l1",
    "xmlPatch": "<path id=\"hair-front-strand-l1\" d=\"M 290 320 C 300 375 315 390 322 360 C 310 350 300 330 290 320 Z\" fill=\"#4A415A\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-front-strand-l1\" d=\"M 290 320 C 300 375 315 390 322 360 C 310 350 300 330 290 320 Z\" fill=\"#4A415A\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-front-strand-l1\" d=\"M 290 320 C 300 375 315 390 322 360 C 310 350 300 330 290 320 Z\" fill=\"#4A415A\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 97,
    "step": 97,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】中左眉心前垂灵动发丝",
    "description": "垂在双眼之间的修颜发缕，微露眉眼",
    "elementId": "hair-front-strand-center-l",
    "xmlPatch": "<path id=\"hair-front-strand-center-l\" d=\"M 330 330 C 350 395 365 410 370 370 C 360 355 345 340 330 330 Z\" fill=\"#534965\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-front-strand-center-l\" d=\"M 330 330 C 350 395 365 410 370 370 C 360 355 345 340 330 330 Z\" fill=\"#534965\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-front-strand-center-l\" d=\"M 330 330 C 350 395 365 410 370 370 C 360 355 345 340 330 330 Z\" fill=\"#534965\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 98,
    "step": 98,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】中右眉心微卷发梢",
    "description": "与左中发簇形成微张人字形的分界发缕",
    "elementId": "hair-front-strand-center-r",
    "xmlPatch": "<path id=\"hair-front-strand-center-r\" d=\"M 405 330 C 420 395 435 410 440 370 C 430 355 415 340 405 330 Z\" fill=\"#4A415A\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-front-strand-center-r\" d=\"M 405 330 C 420 395 435 410 440 370 C 430 355 415 340 405 330 Z\" fill=\"#4A415A\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-front-strand-center-r\" d=\"M 405 330 C 420 395 435 410 440 370 C 430 355 415 340 405 330 Z\" fill=\"#4A415A\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 99,
    "step": 99,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】右侧额角修颜发簇",
    "description": "右侧贴合脸部曲线的外翘发梢",
    "elementId": "hair-front-strand-r1",
    "xmlPatch": "<path id=\"hair-front-strand-r1\" d=\"M 470 330 C 485 385 500 395 508 360 C 495 345 480 335 470 330 Z\" fill=\"#534965\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-front-strand-r1\" d=\"M 470 330 C 485 385 500 395 508 360 C 495 345 480 335 470 330 Z\" fill=\"#534965\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-front-strand-r1\" d=\"M 470 330 C 485 385 500 395 508 360 C 495 345 480 335 470 330 Z\" fill=\"#534965\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 100,
    "step": 100,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】左侧修颜长鬓角发缕",
    "description": "左脸侧垂落至锁骨上方的长卷发丝",
    "elementId": "hair-sidelock-left",
    "xmlPatch": "<path id=\"hair-sidelock-left\" d=\"M 268 310 C 240 400 245 490 265 540 C 275 510 270 440 282 360 Z\" fill=\"#3B3448\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-sidelock-left\" d=\"M 268 310 C 240 400 245 490 265 540 C 275 510 270 440 282 360 Z\" fill=\"#3B3448\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-sidelock-left\" d=\"M 268 310 C 240 400 245 490 265 540 C 275 510 270 440 282 360 Z\" fill=\"#3B3448\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 101,
    "step": 101,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】左鬓角外翘飞扬发尖",
    "description": "左侧胸前俏皮轻微外翻的发梢小翅膀",
    "elementId": "hair-sidelock-left-tip",
    "xmlPatch": "<path id=\"hair-sidelock-left-tip\" d=\"M 255 490 C 235 520 245 560 270 550 C 265 530 260 510 255 490 Z\" fill=\"#2C2638\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-sidelock-left-tip\" d=\"M 255 490 C 235 520 245 560 270 550 C 265 530 260 510 255 490 Z\" fill=\"#2C2638\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-sidelock-left-tip\" d=\"M 255 490 C 235 520 245 560 270 550 C 265 530 260 510 255 490 Z\" fill=\"#2C2638\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 102,
    "step": 102,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】右侧修颜长鬓角发缕",
    "description": "右脸侧对称垂落至锁骨上方的长卷发丝",
    "elementId": "hair-sidelock-right",
    "xmlPatch": "<path id=\"hair-sidelock-right\" d=\"M 532 310 C 560 400 555 490 535 540 C 525 510 530 440 518 360 Z\" fill=\"#3B3448\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-sidelock-right\" d=\"M 532 310 C 560 400 555 490 535 540 C 525 510 530 440 518 360 Z\" fill=\"#3B3448\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-sidelock-right\" d=\"M 532 310 C 560 400 555 490 535 540 C 525 510 530 440 518 360 Z\" fill=\"#3B3448\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 103,
    "step": 103,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】右鬓角外翘飞扬发尖",
    "description": "右侧胸前对称外翘的发尖",
    "elementId": "hair-sidelock-right-tip",
    "xmlPatch": "<path id=\"hair-sidelock-right-tip\" d=\"M 545 490 C 565 520 555 560 530 550 C 535 530 540 510 545 490 Z\" fill=\"#2C2638\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-sidelock-right-tip\" d=\"M 545 490 C 565 520 555 560 530 550 C 535 530 540 510 545 490 Z\" fill=\"#2C2638\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-sidelock-right-tip\" d=\"M 545 490 C 565 520 555 560 530 550 C 535 530 540 510 545 490 Z\" fill=\"#2C2638\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 104,
    "step": 104,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】头顶丰盈穹顶发盖",
    "description": "包裹住完整头骨的丰满前发顶部轮廓",
    "elementId": "hair-top-crown-cap",
    "xmlPatch": "<path id=\"hair-top-crown-cap\" d=\"M 270 270 C 290 190 510 190 530 270 C 480 220 320 220 270 270 Z\" fill=\"#4A415A\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-top-crown-cap\" d=\"M 270 270 C 290 190 510 190 530 270 C 480 220 320 220 270 270 Z\" fill=\"#4A415A\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-top-crown-cap\" d=\"M 270 270 C 290 190 510 190 530 270 C 480 220 320 220 270 270 Z\" fill=\"#4A415A\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 105,
    "step": 105,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】头顶标志性元气大呆毛",
    "description": "向上冲出再向前优雅下垂的标志性卷曲呆毛",
    "elementId": "hair-iconic-ahoge",
    "xmlPatch": "<path id=\"hair-iconic-ahoge\" d=\"M 396 220 C 390 150 425 105 450 125 C 465 140 445 165 422 175 C 412 185 408 205 404 225 Z\" fill=\"#5B506D\" stroke=\"#3B3448\" stroke-width=\"1.2\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-iconic-ahoge\" d=\"M 396 220 C 390 150 425 105 450 125 C 465 140 445 165 422 175 C 412 185 408 205 404 225 Z\" fill=\"#5B506D\" stroke=\"#3B3448\" stroke-width=\"1.2\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-iconic-ahoge\" d=\"M 396 220 C 390 150 425 105 450 125 C 465 140 445 165 422 175 C 412 185 408 205 404 225 Z\" fill=\"#5B506D\" stroke=\"#3B3448\" stroke-width=\"1.2\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 106,
    "step": 106,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "【Live2D拆件】呆毛反光边缘勾边",
    "description": "呆毛上迎光面的极细浅紫白光边缘",
    "elementId": "ahoge-rim-highlight",
    "xmlPatch": "<path id=\"ahoge-rim-highlight\" d=\"M 400 190 C 415 140 435 120 450 128\" stroke=\"#F3E8FF\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"ahoge-rim-highlight\" d=\"M 400 190 C 415 140 435 120 450 128\" stroke=\"#F3E8FF\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"ahoge-rim-highlight\" d=\"M 400 190 C 415 140 435 120 450 128\" stroke=\"#F3E8FF\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 107,
    "step": 107,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】左侧少女甜美粉红发夹",
    "description": "固定在左发梢上方的斜切甜心粉发夹",
    "elementId": "hairclip-left-pink",
    "xmlPatch": "<rect id=\"hairclip-left-pink\" x=\"252\" y=\"272\" width=\"20\" height=\"9\" rx=\"3.5\" transform=\"rotate(-25 262 276)\" fill=\"#F472B6\" stroke=\"#BE185D\" stroke-width=\"1.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <rect id=\"hairclip-left-pink\" x=\"252\" y=\"272\" width=\"20\" height=\"9\" rx=\"3.5\" transform=\"rotate(-25 262 276)\" fill=\"#F472B6\" stroke=\"#BE185D\" stroke-width=\"1.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <rect id=\"hairclip-left-pink\" x=\"252\" y=\"272\" width=\"20\" height=\"9\" rx=\"3.5\" transform=\"rotate(-25 262 276)\" fill=\"#F472B6\" stroke=\"#BE185D\" stroke-width=\"1.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 108,
    "step": 108,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "hair",
    "layerName": "发型轮廓",
    "title": "【Live2D拆件】右侧少女甜美粉红发夹",
    "description": "固定在右发梢上方的对称粉红发夹",
    "elementId": "hairclip-right-pink",
    "xmlPatch": "<rect id=\"hairclip-right-pink\" x=\"528\" y=\"272\" width=\"20\" height=\"9\" rx=\"3.5\" transform=\"rotate(25 538 276)\" fill=\"#F472B6\" stroke=\"#BE185D\" stroke-width=\"1.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <rect id=\"hairclip-right-pink\" x=\"528\" y=\"272\" width=\"20\" height=\"9\" rx=\"3.5\" transform=\"rotate(25 538 276)\" fill=\"#F472B6\" stroke=\"#BE185D\" stroke-width=\"1.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <rect id=\"hairclip-right-pink\" x=\"528\" y=\"272\" width=\"20\" height=\"9\" rx=\"3.5\" transform=\"rotate(25 538 276)\" fill=\"#F472B6\" stroke=\"#BE185D\" stroke-width=\"1.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 109,
    "step": 109,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "【Live2D拆件】刘海纯白天使高光光环环带",
    "description": "发丝中上段耀眼天使之环纯白环带高光",
    "elementId": "hair-angel-ring-white",
    "xmlPatch": "<path id=\"hair-angel-ring-white\" d=\"M 285 275 Q 400 295 515 275\" stroke=\"#FFFFFF\" stroke-width=\"4.5\" stroke-dasharray=\"14,8,22,6,12,8\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.88\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-angel-ring-white\" d=\"M 285 275 Q 400 295 515 275\" stroke=\"#FFFFFF\" stroke-width=\"4.5\" stroke-dasharray=\"14,8,22,6,12,8\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.88\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-angel-ring-white\" d=\"M 285 275 Q 400 295 515 275\" stroke=\"#FFFFFF\" stroke-width=\"4.5\" stroke-dasharray=\"14,8,22,6,12,8\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.88\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 110,
    "step": 110,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "【Live2D拆件】高光下缘梦幻浅粉晕染",
    "description": "白色天使光圈下边缘的浅樱粉微晕染光边",
    "elementId": "hair-angel-ring-pink-tint",
    "xmlPatch": "<path id=\"hair-angel-ring-pink-tint\" d=\"M 287 279 Q 400 299 513 279\" stroke=\"#FCE7F3\" stroke-width=\"2.5\" stroke-dasharray=\"12,10,18,8,10,10\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.65\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-angel-ring-pink-tint\" d=\"M 287 279 Q 400 299 513 279\" stroke=\"#FCE7F3\" stroke-width=\"2.5\" stroke-dasharray=\"12,10,18,8,10,10\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.65\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-angel-ring-pink-tint\" d=\"M 287 279 Q 400 299 513 279\" stroke=\"#FCE7F3\" stroke-width=\"2.5\" stroke-dasharray=\"12,10,18,8,10,10\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.65\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 111,
    "step": 111,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "左脸颊大面积元气蜜桃腮红",
    "description": "左颊柔和扩散的渐变红晕",
    "elementId": "blush-left-diffuse",
    "xmlPatch": "<ellipse id=\"blush-left-diffuse\" cx=\"325\" cy=\"425\" rx=\"30\" ry=\"15\" fill=\"#FDA4AF\" opacity=\"0.45\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <ellipse id=\"blush-left-diffuse\" cx=\"325\" cy=\"425\" rx=\"30\" ry=\"15\" fill=\"#FDA4AF\" opacity=\"0.45\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <ellipse id=\"blush-left-diffuse\" cx=\"325\" cy=\"425\" rx=\"30\" ry=\"15\" fill=\"#FDA4AF\" opacity=\"0.45\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 112,
    "step": 112,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "右脸颊大面积元气蜜桃腮红",
    "description": "右颊对称柔和扩散的渐变红晕",
    "elementId": "blush-right-diffuse",
    "xmlPatch": "<ellipse id=\"blush-right-diffuse\" cx=\"475\" cy=\"425\" rx=\"30\" ry=\"15\" fill=\"#FDA4AF\" opacity=\"0.45\" data-part=\"head_base\" />",
    "addedLines": [
      "+ <ellipse id=\"blush-right-diffuse\" cx=\"475\" cy=\"425\" rx=\"30\" ry=\"15\" fill=\"#FDA4AF\" opacity=\"0.45\" data-part=\"head_base\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <ellipse id=\"blush-right-diffuse\" cx=\"475\" cy=\"425\" rx=\"30\" ry=\"15\" fill=\"#FDA4AF\" opacity=\"0.45\" data-part=\"head_base\" />"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 113,
    "step": 113,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "左腮害羞斜线日系经典笔触",
    "description": "左脸颊三道惹人怜爱的深粉色斜线 ///",
    "elementId": "blush-hatch-left",
    "xmlPatch": "<g id=\"blush-hatch-left\" stroke=\"#F43F5E\" stroke-width=\"1.8\" stroke-linecap=\"round\" opacity=\"0.75\" data-part=\"head_base\"><line x1=\"315\" y1=\"418\" x2=\"323\" y2=\"430\" /><line x1=\"324\" y1=\"418\" x2=\"332\" y2=\"430\" /><line x1=\"333\" y1=\"418\" x2=\"341\" y2=\"430\" /></g>",
    "addedLines": [
      "+ <g id=\"blush-hatch-left\" stroke=\"#F43F5E\" stroke-width=\"1.8\" stroke-linecap=\"round\" opacity=\"0.75\" data-part=\"head_base\"><line x1=\"315\" y1=\"418\" x2=\"323\" y2=\"430\" /><line x1=\"324\" y1=\"418\" x2=\"332\" y2=\"430\" /><line x1=\"333\" y1=\"418\" x2=\"341\" y2=\"430\" /></g>"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <g id=\"blush-hatch-left\" stroke=\"#F43F5E\" stroke-width=\"1.8\" stroke-linecap=\"round\" opacity=\"0.75\" data-part=\"head_base\"><line x1=\"315\" y1=\"418\" x2=\"323\" y2=\"430\" /><line x1=\"324\" y1=\"418\" x2=\"332\" y2=\"430\" /><line x1=\"333\" y1=\"418\" x2=\"341\" y2=\"430\" /></g>"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 114,
    "step": 114,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "line_art",
    "layerName": "线条勾勒",
    "title": "右腮害羞斜线日系经典笔触",
    "description": "右脸颊三道对称惹人怜爱的斜线 ///",
    "elementId": "blush-hatch-right",
    "xmlPatch": "<g id=\"blush-hatch-right\" stroke=\"#F43F5E\" stroke-width=\"1.8\" stroke-linecap=\"round\" opacity=\"0.75\" data-part=\"head_base\"><line x1=\"462\" y1=\"418\" x2=\"470\" y2=\"430\" /><line x1=\"471\" y1=\"418\" x2=\"479\" y2=\"430\" /><line x1=\"480\" y1=\"418\" x2=\"488\" y2=\"430\" /></g>",
    "addedLines": [
      "+ <g id=\"blush-hatch-right\" stroke=\"#F43F5E\" stroke-width=\"1.8\" stroke-linecap=\"round\" opacity=\"0.75\" data-part=\"head_base\"><line x1=\"462\" y1=\"418\" x2=\"470\" y2=\"430\" /><line x1=\"471\" y1=\"418\" x2=\"479\" y2=\"430\" /><line x1=\"480\" y1=\"418\" x2=\"488\" y2=\"430\" /></g>"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <g id=\"blush-hatch-right\" stroke=\"#F43F5E\" stroke-width=\"1.8\" stroke-linecap=\"round\" opacity=\"0.75\" data-part=\"head_base\"><line x1=\"462\" y1=\"418\" x2=\"470\" y2=\"430\" /><line x1=\"471\" y1=\"418\" x2=\"479\" y2=\"430\" /><line x1=\"480\" y1=\"418\" x2=\"488\" y2=\"430\" /></g>"
      ]
    },
    "metadata": {
      "live2dPart": "head_base"
    }
  },
  {
    "id": 115,
    "step": 115,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "background",
    "layerName": "背景特效",
    "title": "全图空间浮空暖金光斑粒子 1",
    "description": "身侧飘荡的微型温暖金色反光球",
    "elementId": "ambient-spark-1",
    "xmlPatch": "<circle id=\"ambient-spark-1\" cx=\"220\" cy=\"280\" r=\"3\" fill=\"#FDE047\" opacity=\"0.8\" />",
    "addedLines": [
      "+ <circle id=\"ambient-spark-1\" cx=\"220\" cy=\"280\" r=\"3\" fill=\"#FDE047\" opacity=\"0.8\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <circle id=\"ambient-spark-1\" cx=\"220\" cy=\"280\" r=\"3\" fill=\"#FDE047\" opacity=\"0.8\" />"
      ]
    },
    "metadata": {
      "live2dPart": "background"
    }
  },
  {
    "id": 116,
    "step": 116,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "background",
    "layerName": "背景特效",
    "title": "全图空间浮空暖金光斑粒子 2",
    "description": "头顶高处微型金色反光点",
    "elementId": "ambient-spark-2",
    "xmlPatch": "<circle id=\"ambient-spark-2\" cx=\"580\" cy=\"260\" r=\"2.5\" fill=\"#FDE047\" opacity=\"0.7\" />",
    "addedLines": [
      "+ <circle id=\"ambient-spark-2\" cx=\"580\" cy=\"260\" r=\"2.5\" fill=\"#FDE047\" opacity=\"0.7\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <circle id=\"ambient-spark-2\" cx=\"580\" cy=\"260\" r=\"2.5\" fill=\"#FDE047\" opacity=\"0.7\" />"
      ]
    },
    "metadata": {
      "live2dPart": "background"
    }
  },
  {
    "id": 117,
    "step": 117,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "background",
    "layerName": "背景特效",
    "title": "全图空间浮空暖金光斑粒子 3",
    "description": "胸口侧边微型金色反光粒子",
    "elementId": "ambient-spark-3",
    "xmlPatch": "<circle id=\"ambient-spark-3\" cx=\"190\" cy=\"480\" r=\"2\" fill=\"#FDE047\" opacity=\"0.6\" />",
    "addedLines": [
      "+ <circle id=\"ambient-spark-3\" cx=\"190\" cy=\"480\" r=\"2\" fill=\"#FDE047\" opacity=\"0.6\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <circle id=\"ambient-spark-3\" cx=\"190\" cy=\"480\" r=\"2\" fill=\"#FDE047\" opacity=\"0.6\" />"
      ]
    },
    "metadata": {
      "live2dPart": "background"
    }
  },
  {
    "id": 118,
    "step": 118,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "background",
    "layerName": "背景特效",
    "title": "全图空间浮空暖金光斑粒子 4",
    "description": "右下侧飘逸金色微粒",
    "elementId": "ambient-spark-4",
    "xmlPatch": "<circle id=\"ambient-spark-4\" cx=\"610\" cy=\"500\" r=\"2.5\" fill=\"#FDE047\" opacity=\"0.7\" />",
    "addedLines": [
      "+ <circle id=\"ambient-spark-4\" cx=\"610\" cy=\"500\" r=\"2.5\" fill=\"#FDE047\" opacity=\"0.7\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <circle id=\"ambient-spark-4\" cx=\"610\" cy=\"500\" r=\"2.5\" fill=\"#FDE047\" opacity=\"0.7\" />"
      ]
    },
    "metadata": {
      "live2dPart": "background"
    }
  },
  {
    "id": 119,
    "step": 119,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 1",
    "description": "贝塞尔曲线精细发光高光微步 1",
    "elementId": "hair-micro-glint-1",
    "xmlPatch": "<path id=\"hair-micro-glint-1\" d=\"M 310 268 Q 329 276 343 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-1\" d=\"M 310 268 Q 329 276 343 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-1\" d=\"M 310 268 Q 329 276 343 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 120,
    "step": 120,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 2",
    "description": "贝塞尔曲线精细发光高光微步 2",
    "elementId": "hair-micro-glint-2",
    "xmlPatch": "<path id=\"hair-micro-glint-2\" d=\"M 320 276 Q 338 282 351 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-2\" d=\"M 320 276 Q 338 282 351 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-2\" d=\"M 320 276 Q 338 282 351 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 121,
    "step": 121,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 3",
    "description": "贝塞尔曲线精细发光高光微步 3",
    "elementId": "hair-micro-glint-3",
    "xmlPatch": "<path id=\"hair-micro-glint-3\" d=\"M 330 284 Q 347 270 359 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-3\" d=\"M 330 284 Q 347 270 359 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-3\" d=\"M 330 284 Q 347 270 359 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 122,
    "step": 122,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 4",
    "description": "贝塞尔曲线精细发光高光微步 4",
    "elementId": "hair-micro-glint-4",
    "xmlPatch": "<path id=\"hair-micro-glint-4\" d=\"M 340 260 Q 356 276 367 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-4\" d=\"M 340 260 Q 356 276 367 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-4\" d=\"M 340 260 Q 356 276 367 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 123,
    "step": 123,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 5",
    "description": "贝塞尔曲线精细发光高光微步 5",
    "elementId": "hair-micro-glint-5",
    "xmlPatch": "<path id=\"hair-micro-glint-5\" d=\"M 350 268 Q 365 282 375 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-5\" d=\"M 350 268 Q 365 282 375 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-5\" d=\"M 350 268 Q 365 282 375 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 124,
    "step": 124,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 6",
    "description": "贝塞尔曲线精细发光高光微步 6",
    "elementId": "hair-micro-glint-6",
    "xmlPatch": "<path id=\"hair-micro-glint-6\" d=\"M 360 276 Q 374 270 383 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-6\" d=\"M 360 276 Q 374 270 383 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-6\" d=\"M 360 276 Q 374 270 383 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 125,
    "step": 125,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 7",
    "description": "贝塞尔曲线精细发光高光微步 7",
    "elementId": "hair-micro-glint-7",
    "xmlPatch": "<path id=\"hair-micro-glint-7\" d=\"M 370 284 Q 383 276 391 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-7\" d=\"M 370 284 Q 383 276 391 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-7\" d=\"M 370 284 Q 383 276 391 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 126,
    "step": 126,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 8",
    "description": "贝塞尔曲线精细发光高光微步 8",
    "elementId": "hair-micro-glint-8",
    "xmlPatch": "<path id=\"hair-micro-glint-8\" d=\"M 380 260 Q 392 282 399 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-8\" d=\"M 380 260 Q 392 282 399 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-8\" d=\"M 380 260 Q 392 282 399 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 127,
    "step": 127,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 9",
    "description": "贝塞尔曲线精细发光高光微步 9",
    "elementId": "hair-micro-glint-9",
    "xmlPatch": "<path id=\"hair-micro-glint-9\" d=\"M 390 268 Q 401 270 407 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-9\" d=\"M 390 268 Q 401 270 407 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-9\" d=\"M 390 268 Q 401 270 407 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 128,
    "step": 128,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 10",
    "description": "贝塞尔曲线精细发光高光微步 10",
    "elementId": "hair-micro-glint-10",
    "xmlPatch": "<path id=\"hair-micro-glint-10\" d=\"M 400 276 Q 410 276 415 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-10\" d=\"M 400 276 Q 410 276 415 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-10\" d=\"M 400 276 Q 410 276 415 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 129,
    "step": 129,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 11",
    "description": "贝塞尔曲线精细发光高光微步 11",
    "elementId": "hair-micro-glint-11",
    "xmlPatch": "<path id=\"hair-micro-glint-11\" d=\"M 410 284 Q 419 282 423 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-11\" d=\"M 410 284 Q 419 282 423 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-11\" d=\"M 410 284 Q 419 282 423 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 130,
    "step": 130,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 12",
    "description": "贝塞尔曲线精细发光高光微步 12",
    "elementId": "hair-micro-glint-12",
    "xmlPatch": "<path id=\"hair-micro-glint-12\" d=\"M 420 260 Q 428 270 431 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-12\" d=\"M 420 260 Q 428 270 431 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-12\" d=\"M 420 260 Q 428 270 431 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 131,
    "step": 131,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 13",
    "description": "贝塞尔曲线精细发光高光微步 13",
    "elementId": "hair-micro-glint-13",
    "xmlPatch": "<path id=\"hair-micro-glint-13\" d=\"M 430 268 Q 437 276 439 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-13\" d=\"M 430 268 Q 437 276 439 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-13\" d=\"M 430 268 Q 437 276 439 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 132,
    "step": 132,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 14",
    "description": "贝塞尔曲线精细发光高光微步 14",
    "elementId": "hair-micro-glint-14",
    "xmlPatch": "<path id=\"hair-micro-glint-14\" d=\"M 440 276 Q 446 282 447 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-14\" d=\"M 440 276 Q 446 282 447 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-14\" d=\"M 440 276 Q 446 282 447 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 133,
    "step": 133,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 15",
    "description": "贝塞尔曲线精细发光高光微步 15",
    "elementId": "hair-micro-glint-15",
    "xmlPatch": "<path id=\"hair-micro-glint-15\" d=\"M 450 284 Q 455 270 455 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-15\" d=\"M 450 284 Q 455 270 455 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-15\" d=\"M 450 284 Q 455 270 455 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 134,
    "step": 134,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 16",
    "description": "贝塞尔曲线精细发光高光微步 16",
    "elementId": "hair-micro-glint-16",
    "xmlPatch": "<path id=\"hair-micro-glint-16\" d=\"M 460 260 Q 464 276 463 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-16\" d=\"M 460 260 Q 464 276 463 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-16\" d=\"M 460 260 Q 464 276 463 270\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 135,
    "step": 135,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 17",
    "description": "贝塞尔曲线精细发光高光微步 17",
    "elementId": "hair-micro-glint-17",
    "xmlPatch": "<path id=\"hair-micro-glint-17\" d=\"M 470 268 Q 473 282 471 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-17\" d=\"M 470 268 Q 473 282 471 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-17\" d=\"M 470 268 Q 473 282 471 275\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 136,
    "step": 136,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 18",
    "description": "贝塞尔曲线精细发光高光微步 18",
    "elementId": "hair-micro-glint-18",
    "xmlPatch": "<path id=\"hair-micro-glint-18\" d=\"M 480 276 Q 482 270 479 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-18\" d=\"M 480 276 Q 482 270 479 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-18\" d=\"M 480 276 Q 482 270 479 280\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 137,
    "step": 137,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 19",
    "description": "贝塞尔曲线精细发光高光微步 19",
    "elementId": "hair-micro-glint-19",
    "xmlPatch": "<path id=\"hair-micro-glint-19\" d=\"M 490 284 Q 491 276 487 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-19\" d=\"M 490 284 Q 491 276 487 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-19\" d=\"M 490 284 Q 491 276 487 285\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 138,
    "step": 138,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "shadow_highlight",
    "layerName": "阴影高光",
    "title": "前发发缕微高光切线 20",
    "description": "贝塞尔曲线精细发光高光微步 20",
    "elementId": "hair-micro-glint-20",
    "xmlPatch": "<path id=\"hair-micro-glint-20\" d=\"M 500 260 Q 500 282 495 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />",
    "addedLines": [
      "+ <path id=\"hair-micro-glint-20\" d=\"M 500 260 Q 500 282 495 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <path id=\"hair-micro-glint-20\" d=\"M 500 260 Q 500 282 495 265\" stroke=\"#F3E8FF\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\" data-part=\"hair_front\" />"
      ]
    },
    "metadata": {
      "live2dPart": "hair_front"
    }
  },
  {
    "id": 139,
    "step": 139,
    "stageId": "stage-5",
    "stageName": "05可拆发型与光影",
    "layerId": "background",
    "layerName": "背景特效",
    "title": "全图温暖微光柔和调色覆膜",
    "description": "全图顶部极淡温暖粉金漫反射氛围调色",
    "elementId": "final-ambient-harmony",
    "xmlPatch": "<rect id=\"final-ambient-harmony\" x=\"0\" y=\"0\" width=\"800\" height=\"1000\" fill=\"#FFFBEB\" opacity=\"0.03\" />",
    "addedLines": [
      "+ <rect id=\"final-ambient-harmony\" x=\"0\" y=\"0\" width=\"800\" height=\"1000\" fill=\"#FFFBEB\" opacity=\"0.03\" />"
    ],
    "removedLines": [],
    "diff": {
      "type": "add",
      "addedLines": [
        "+ <rect id=\"final-ambient-harmony\" x=\"0\" y=\"0\" width=\"800\" height=\"1000\" fill=\"#FFFBEB\" opacity=\"0.03\" />"
      ]
    },
    "metadata": {
      "live2dPart": "background"
    }
  }
];

  const steps: StrokeMicroStep[] = rawSteps.map((s: any) => ({
    id: s.id,
    step: s.step,
    stageId: s.stageId,
    stageName: s.stageName,
    layerId: s.layerId as LayerId,
    layerName: s.layerName,
    title: s.title,
    description: s.description,
    elementId: s.elementId,
    xmlPatch: s.xmlPatch,
    addedLines: s.addedLines,
    removedLines: s.removedLines,
    diff: s.diff,
    metadata: s.metadata,
  }));

  return {
    title: '幻梦航标 · 德奥欣 (Deocin - Live2D Dissectable Masterpiece)',
    version: '3.5.0-live2d',
    canvasWidth: 800,
    canvasHeight: 1000,
    viewBox: '0 0 800 1000',
    stages,
    steps,
  };
}

/**
 * Creates 10,000 micro-steps version for Deocin Live2D Masterpiece
 */
export function createDeocin10kProject(): ProjectData {
  const base = createDeocinProject();
  return StepDensityEngine.scaleProjectToDensity(base, 10000);
}

export const DEOCIN_PROJECT: ProjectData = createDeocinProject();
