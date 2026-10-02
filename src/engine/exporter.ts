import { ProjectData, StrokeMicroStep } from '../types/anime';
import { LayerId } from '../types/studio';
import { VirtualDomNode } from '../types/diff';

export class ExporterEngine {
  static generateStandaloneSvg(
    project: ProjectData,
    activeStep: number,
    visibleLayers: Partial<Record<LayerId, boolean>> = {
      all: true,
      background: true,
      skin_body: true,
      hair: true,
      iris: true,
      clothes: true,
      shadow_highlight: true,
      line_art: true,
    }
  ): string {
    const stepsToRender = project.steps.slice(0, activeStep);
    const layerSnippets: Record<string, string[]> = {
      background: [],
      skin_body: [],
      hair: [],
      iris: [],
      clothes: [],
      shadow_highlight: [],
      line_art: [],
    };

    const stage1End = project.stages?.[0]?.endStep ?? 10;
    const isPastSketch = activeStep > stage1End;

    for (const step of stepsToRender) {
      if (isPastSketch && step.xmlPatch?.includes('data-sketch="true"')) {
        continue;
      }
      const isVisible = visibleLayers['all'] && (visibleLayers[step.layerId] ?? true);
      if (isVisible) {
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
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${project.viewBox || '0 0 800 1000'}" width="${project.canvasWidth || 800}" height="${project.canvasHeight || 1000}">`
    );
    lines.push('  <defs>');
    lines.push('    <style type="text/css">');
    lines.push('      .studio-node { shape-rendering: geometricPrecision; text-rendering: geometricPrecision; }');
    lines.push('    </style>');
    lines.push('    <radialGradient id="canvas-celestial-bg" cx="50%" cy="40%" r="75%">');
    lines.push('      <stop offset="0%" stop-color="#FFFFFF" />');
    lines.push('      <stop offset="60%" stop-color="#FFFBFB" />');
    lines.push('      <stop offset="100%" stop-color="#FAF5FF" />');
    lines.push('    </radialGradient>');
    lines.push('    <linearGradient id="purple-hair-grad" x1="0%" y1="0%" x2="0%" y2="100%">');
    lines.push('      <stop offset="0%" stop-color="#8B5CF6" />');
    lines.push('      <stop offset="60%" stop-color="#6D28D9" />');
    lines.push('      <stop offset="100%" stop-color="#2E1065" />');
    lines.push('    </linearGradient>');
    lines.push('    <radialGradient id="gold-iris-grad" cx="50%" cy="50%" r="50%">');
    lines.push('      <stop offset="0%" stop-color="#FDE68A" />');
    lines.push('      <stop offset="45%" stop-color="#F59E0B" />');
    lines.push('      <stop offset="85%" stop-color="#B45309" />');
    lines.push('      <stop offset="100%" stop-color="#1C1917" />');
    lines.push('    </radialGradient>');
    lines.push('    <radialGradient id="cheek-blush-grad" cx="50%" cy="50%" r="50%">');
    lines.push('      <stop offset="0%" stop-color="#FB7185" stop-opacity="0.5" />');
    lines.push('      <stop offset="100%" stop-color="#FB7185" stop-opacity="0" />');
    lines.push('    </radialGradient>');
    lines.push('    <linearGradient id="mika-hair-pink-grad" x1="0%" y1="0%" x2="0%" y2="100%">');
    lines.push('      <stop offset="0%" stop-color="#FCE7F3" />');
    lines.push('      <stop offset="45%" stop-color="#F472B6" />');
    lines.push('      <stop offset="85%" stop-color="#EC4899" />');
    lines.push('      <stop offset="100%" stop-color="#C084FC" />');
    lines.push('    </linearGradient>');
    lines.push('    <radialGradient id="mika-eye-gold-grad" cx="50%" cy="50%" r="50%">');
    lines.push('      <stop offset="0%" stop-color="#FEF9C3" />');
    lines.push('      <stop offset="35%" stop-color="#FDE047" />');
    lines.push('      <stop offset="70%" stop-color="#EAB308" />');
    lines.push('      <stop offset="92%" stop-color="#B45309" />');
    lines.push('      <stop offset="100%" stop-color="#451A03" />');
    lines.push('    </radialGradient>');
    lines.push('    <linearGradient id="mika-halo-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">');
    lines.push('      <stop offset="0%" stop-color="#F472B6" />');
    lines.push('      <stop offset="50%" stop-color="#FFFFFF" />');
    lines.push('      <stop offset="100%" stop-color="#FDE047" />');
    lines.push('    </linearGradient>');
    lines.push('    <linearGradient id="mika-wing-feather-grad" x1="0%" y1="0%" x2="100%" y2="100%">');
    lines.push('      <stop offset="0%" stop-color="#FFFFFF" />');
    lines.push('      <stop offset="70%" stop-color="#F8FAFC" />');
    lines.push('      <stop offset="100%" stop-color="#E0E7FF" />');
    lines.push('    </linearGradient>');
    lines.push('    <linearGradient id="mika-trinity-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">');
    lines.push('      <stop offset="0%" stop-color="#FDE68A" />');
    lines.push('      <stop offset="50%" stop-color="#F59E0B" />');
    lines.push('      <stop offset="100%" stop-color="#D97706" />');
    lines.push('    </linearGradient>');
    lines.push('    <radialGradient id="mika-galaxy-scrunchie-grad" cx="50%" cy="50%" r="50%">');
    lines.push('      <stop offset="0%" stop-color="#312E81" />');
    lines.push('      <stop offset="60%" stop-color="#1E1B4B" />');
    lines.push('      <stop offset="100%" stop-color="#0F172A" />');
    lines.push('    </radialGradient>');
    lines.push('    <radialGradient id="mika-blush-grad" cx="50%" cy="50%" r="50%">');
    lines.push('      <stop offset="0%" stop-color="#FB7185" stop-opacity="0.6" />');
    lines.push('      <stop offset="100%" stop-color="#FB7185" stop-opacity="0" />');
    lines.push('    </radialGradient>');
    lines.push('  </defs>');
    lines.push(`  <rect id="canvas-paper-bg" width="${project.canvasWidth || 800}" height="${project.canvasHeight || 1000}" fill="url(#canvas-celestial-bg)" />`);

    if (project.title !== '紫发金瞳少女 (Purple-haired Gold-eyed Anime Girl)') {
      // For dynamic master projects, preserve natural artistic stacking order
      for (const step of stepsToRender) {
        if (isPastSketch && step.xmlPatch?.includes('data-sketch="true"')) {
          continue;
        }
        const isVisible = visibleLayers['all'] && (visibleLayers[step.layerId] ?? true);
        if (isVisible) {
          lines.push(`  ${step.xmlPatch}`);
        }
      }
    } else {
      // Semantic drawing layer order (bottom to top) for canonical project
      const orderedLayers: LayerId[] = ['background', 'skin_body', 'hair', 'shadow_highlight', 'clothes', 'line_art', 'iris'];
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
    }

    lines.push('</svg>');
    return lines.join('\n');
  }

  static downloadSvg(svgContent: string, filename = 'anime-vector.svg'): void {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  static async downloadPng(
    svgContent: string,
    filename = 'anime-vector.png',
    scale: 1 | 2 | 4 = 2,
    width = 800,
    height = 1000
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('无法创建 Canvas 2D 上下文'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('Canvas 转 PNG Blob 失败'));
            return;
          }
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(pngUrl), 2000);
          resolve();
        }, 'image/png');
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('SVG 图片解析加载失败'));
      };

      img.src = url;
    });
  }

  static validateProjectJson(jsonString: string): { success: boolean; data?: ProjectData; error?: string } {
    if (!jsonString || typeof jsonString !== 'string') {
      return { success: false, error: '输入内容为空' };
    }

    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: '根元素必须为对象' };
      }
      if (!parsed.title) {
        return { success: false, error: '缺少 title 属性' };
      }
      if (!parsed.stages || !Array.isArray(parsed.stages) || parsed.stages.length === 0) {
        return { success: false, error: '缺少 stages 数组或为空' };
      }
      if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
        return { success: false, error: '缺少 steps 数组或为空' };
      }

      for (let i = 0; i < parsed.steps.length; i++) {
        const s = parsed.steps[i];
        if (typeof s.id !== 'number') {
          return { success: false, error: `步骤 [${i}] id 必须为数字` };
        }
        if (!s.layerId) {
          return { success: false, error: `步骤 [${s.id}] 缺少 layerId` };
        }
        if (!s.xmlPatch) {
          return { success: false, error: `步骤 [${s.id}] 缺少 xmlPatch` };
        }
      }

      return {
        success: true,
        data: {
          title: parsed.title,
          version: parsed.version || '1.0.0',
          viewBox: parsed.viewBox || '0 0 800 1000',
          canvasWidth: parsed.canvasWidth || 800,
          canvasHeight: parsed.canvasHeight || 1000,
          stages: parsed.stages,
          steps: parsed.steps,
        },
      };
    } catch (e: any) {
      return { success: false, error: `JSON 语法错误: ${e.message}` };
    }
  }

  static extractDomTree(steps: StrokeMicroStep[], activeStep: number): VirtualDomNode[] {
    const rootNodes: VirtualDomNode[] = [];
    const layerMap: Record<string, VirtualDomNode> = {
      background: { id: 'group-background', tag: 'g', layer: 'background', step: 0, attributes: { id: 'layer-background' }, children: [] },
      skin_body: { id: 'group-skin_body', tag: 'g', layer: 'skin_body', step: 0, attributes: { id: 'layer-skin_body' }, children: [] },
      hair: { id: 'group-hair', tag: 'g', layer: 'hair', step: 0, attributes: { id: 'layer-hair' }, children: [] },
      iris: { id: 'group-iris', tag: 'g', layer: 'iris', step: 0, attributes: { id: 'layer-iris' }, children: [] },
      clothes: { id: 'group-clothes', tag: 'g', layer: 'clothes', step: 0, attributes: { id: 'layer-clothes' }, children: [] },
      shadow_highlight: { id: 'group-shadow_highlight', tag: 'g', layer: 'shadow_highlight', step: 0, attributes: { id: 'layer-shadow_highlight' }, children: [] },
      line_art: { id: 'group-line_art', tag: 'g', layer: 'line_art', step: 0, attributes: { id: 'layer-line_art' }, children: [] },
    };

    const count = Math.min(activeStep, steps.length);
    for (let i = 0; i < count; i++) {
      const step = steps[i];
      const targetLayer = layerMap[step.layerId] || layerMap['line_art'];
      const elemId = step.elementId || `step-elem-${step.id}`;

      // Quick tag parse
      const tagMatch = step.xmlPatch.match(/<([a-zA-Z0-9]+)/);
      const tag = tagMatch ? tagMatch[1] : 'path';

      const node: VirtualDomNode = {
        id: elemId,
        tag,
        layer: step.layerId,
        step: step.id,
        attributes: { id: elemId },
      };

      if (!targetLayer.children) targetLayer.children = [];
      targetLayer.children.push(node);
    }

    const orderedLayers: LayerId[] = ['background', 'skin_body', 'hair', 'iris', 'clothes', 'shadow_highlight', 'line_art'];
    for (const lid of orderedLayers) {
      const lnode = layerMap[lid];
      if (lnode.children && lnode.children.length > 0) {
        rootNodes.push(lnode);
      }
    }

    return rootNodes;
  }
}
