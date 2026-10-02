import { describe, it, expect } from 'vitest';
import { AiAnimeGenerator } from '../../src/engine/aiAnimeGenerator';
import { ExporterEngine } from '../../src/engine/exporter';

describe('Authentic Japanese Anime Masterworks Suite (D:\\文档\\图片\\X Study)', () => {
  const masterworks = [
    {
      name: 'Penia Hand-drawn Ink Manga Sketch',
      prompt: '手绘墨线 Penia 粉发原画',
      expectedTitlePart: 'Penia',
      minSteps: 700,
    },
    {
      name: 'Kisaki Summer Lounger Cel Shading',
      prompt: '玄龙门主 龙华妃姬 沙滩椅',
      expectedTitlePart: '妃姬',
      minSteps: 2500,
    },
    {
      name: 'Plana Summer Beach Cel Artwork',
      prompt: '什亭之匣 普拉娜 泳装海滩',
      expectedTitlePart: '普拉娜',
      minSteps: 4000,
    },
    {
      name: 'Shiroko Terror Wolf Ear Anime Girl',
      prompt: '阿拜多斯 砂狼白子·恐怖 狼耳',
      expectedTitlePart: '白子',
      minSteps: 2500,
    },
    {
      name: 'Rico Chiaroscuro Apple Girl',
      prompt: '光影交错 苹果少女 蓝发蕾丝',
      expectedTitlePart: '苹果',
      minSteps: 5000,
    },
    {
      name: 'Morning Stretch Maiden (伸懒腰)',
      prompt: '晨光舒展 伸懒腰少女 居家白衬衫',
      expectedTitlePart: '伸懒腰',
      minSteps: 300,
    },
    {
      name: 'Backless Evening Gown Glance (露背回眸)',
      prompt: '高贵晚宴 露背礼服回眸 紫花发饰',
      expectedTitlePart: '回眸',
      minSteps: 800,
    },
    {
      name: 'Athletic Tennis Sports Maiden (网球挥拍)',
      prompt: '青春活力 网球运动少女 挥拍擦汗',
      expectedTitlePart: '网球',
      minSteps: 700,
    },
    {
      name: 'Ethereal Floating Spirit (悬浮精灵赤足)',
      prompt: '空灵幻梦 悬浮抱膝精灵 赤足白裙',
      expectedTitlePart: '精灵',
      minSteps: 700,
    },
    {
      name: 'Makima Dominant Gaze (单手遮面魔眼)',
      prompt: '支配恶魔 单手遮面狂气魔眼 玛奇玛',
      expectedTitlePart: '魔眼',
      minSteps: 1500,
    },
    {
      name: 'Miku Summer Swimwear (初音双马尾手绘)',
      prompt: '清爽夏日 初音双马尾泳装 手绘签名',
      expectedTitlePart: '初音',
      minSteps: 650,
    },
    {
      name: 'Fox-Ear Field Maiden (花海兽耳少女)',
      prompt: '田园花海 金发兽耳抚花少女 麻花辫',
      expectedTitlePart: '兽耳',
      minSteps: 2500,
    },
    {
      name: 'Sylphie Original Masterpiece (星辉蝶愿原创粉毛金瞳少女)',
      prompt: '星辉蝶愿 希尔菲 原创粉毛金瞳少女',
      expectedTitlePart: '希尔菲',
      minSteps: 1900,
    },
  ];

  masterworks.forEach(({ name, prompt, expectedTitlePart, minSteps }) => {
    describe(name, () => {
      it(`generates complete project with over ${minSteps} authentic vector steps and 5 stages`, () => {
        const project = AiAnimeGenerator.generateProject({ prompt });
        expect(project.title).toContain(expectedTitlePart);
        expect(project.stages.length).toBe(5);
        expect(project.steps.length).toBeGreaterThanOrEqual(minSteps);

        // Verify layer coverage
        const layers = new Set(project.steps.map((s) => s.layerId));
        expect(layers.has('hair')).toBe(true);
        expect(layers.has('clothes')).toBe(true);
        expect(layers.has('line_art')).toBe(true);
        expect(layers.has('shadow_highlight')).toBe(true);

        // Verify stages order and continuity
        for (let i = 0; i < project.stages.length; i++) {
          const stage = project.stages[i];
          expect(stage.startStep).toBeLessThanOrEqual(stage.endStep);
          if (i > 0) {
            expect(stage.startStep).toBe(project.stages[i - 1].endStep + 1);
          }
        }
      });

      it('exports valid standalone SVG with geometric precision', () => {
        const project = AiAnimeGenerator.generateProject({ prompt });
        const svg = ExporterEngine.generateStandaloneSvg(project, project.steps.length);
        expect(svg).toContain('<svg');
        expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
        expect(svg).toContain('viewBox="0 0 800 1000"');
        expect(svg).toContain('</svg>');
      });
    });
  });

  describe('Universal Dynamic Palette Transmutation & Creative Synthesis', () => {
    it('dynamically transmutes hair and eye colors for custom character prompt with action', () => {
      const customPrompt = '黑发红瞳少女 晨光中伸懒腰 居家微风白衬衫';
      const project = AiAnimeGenerator.generateProject(
        AiAnimeGenerator.parsePrompt(customPrompt)
      );

      expect(project.title).toContain('黑发红瞳少女');
      expect(project.steps.length).toBeGreaterThanOrEqual(300);

      // Verify hair paths contain dark obsidian/black tones
      const hairSteps = project.steps.filter((s) => s.layerId === 'hair');
      const hasBlackHair = hairSteps.some((s) =>
        s.xmlPatch.includes('#1E293B') || s.xmlPatch.includes('#0F172A') || s.xmlPatch.includes('#334155')
      );
      expect(hasBlackHair).toBe(true);

      // Verify iris paths contain red tones
      const irisSteps = project.steps.filter((s) => s.layerId === 'iris');
      const hasRedEyes = irisSteps.some((s) =>
        s.xmlPatch.includes('#EF4444') || s.xmlPatch.includes('#B91C1C') || s.xmlPatch.includes('#FCA5A5')
      );
      expect(hasRedEyes).toBe(true);
    });

    it('dynamically transmutes golden hair for sports tennis action', () => {
      const customPrompt = '金发蓝瞳的网球少女 挥拍跳跃';
      const project = AiAnimeGenerator.generateProject(
        AiAnimeGenerator.parsePrompt(customPrompt)
      );

      expect(project.title).toContain('金发蓝瞳');
      const hairSteps = project.steps.filter((s) => s.layerId === 'hair');
      const hasGoldHair = hairSteps.some((s) =>
        s.xmlPatch.includes('#FDE047') || s.xmlPatch.includes('#EAB308') || s.xmlPatch.includes('#FEF9C3')
      );
      expect(hasGoldHair).toBe(true);
    });
  });
});
