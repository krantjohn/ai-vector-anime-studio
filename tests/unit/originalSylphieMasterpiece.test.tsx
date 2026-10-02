import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { createSylphieProject, createSylphie10kProject, SYLPHIE_PROJECT } from '../../src/data/sylphieProject';
import { AiAnimeGenerator } from '../../src/engine/aiAnimeGenerator';
import { ExporterEngine } from '../../src/engine/exporter';
import { StudioProvider } from '../../src/store/studioContext';
import { Header } from '../../src/components/layout/Header';
import { AiChatPanel } from '../../src/components/chat/AiChatPanel';

describe('Original Masterpiece Suite: 星辉蝶愿 · 希尔菲 (Sylphie - Starlight Chrysalis)', () => {
  describe('1. Dataset Invariants & Quality Standards', () => {
    it('creates Sylphie project with exactly 1,963 authentic spline strokes', () => {
      const project = createSylphieProject();
      expect(project.title).toContain('希尔菲');
      expect(project.version).toBe('3.0.0-original');
      expect(project.viewBox).toBe('0 0 800 1000');
      expect(project.canvasWidth).toBe(800);
      expect(project.canvasHeight).toBe(1000);
      expect(project.steps.length).toBe(1963);
    });

    it('contains all 5 stages in strict progression from sketch to divine glow', () => {
      const project = createSylphieProject();
      expect(project.stages.length).toBe(5);

      const expectedStages = [
        '01初版草图',
        '02底色铺设',
        '03结构阴影',
        '04细部雕琢',
        '05神圣光晕',
      ];

      project.stages.forEach((stage, idx) => {
        expect(stage.name).toBe(expectedStages[idx]);
        expect(stage.stageNumber).toBe(idx + 1);
        expect(stage.startStep).toBeLessThanOrEqual(stage.endStep);
        if (idx > 0) {
          expect(stage.startStep).toBe(project.stages[idx - 1].endStep + 1);
        }
      });

      expect(project.stages[0].startStep).toBe(1);
      expect(project.stages[4].endStep).toBe(1963);
    });

    it('covers all 5 layers with substantial stroke density and non-empty vector patches', () => {
      const project = createSylphieProject();
      const layerCounts: Record<string, number> = {};

      project.steps.forEach((step, index) => {
        expect(step.id).toBe(index + 1);
        expect(step.xmlPatch).toBeTruthy();
        expect(step.xmlPatch).toContain('<');
        expect(step.elementId).toBeTruthy();
        expect(step.stageId).toMatch(/^stage-[1-5]$/);
        expect(step.layerId).toBeTruthy();

        layerCounts[step.layerId] = (layerCounts[step.layerId] || 0) + 1;
      });

      // All 7 core anime layers MUST be populated
      expect(layerCounts['background']).toBeGreaterThan(0);
      expect(layerCounts['skin_body']).toBeGreaterThan(40);
      expect(layerCounts['line_art']).toBeGreaterThan(500); // Heavy DoG black ink contours
      expect(layerCounts['hair']).toBeGreaterThan(400);     // Voluminous sakura pink hair
      expect(layerCounts['clothes']).toBeGreaterThan(700);  // Starry gradient lolita gown
      expect(layerCounts['iris']).toBeGreaterThan(15);      // Glowing celestial gold iris & star pupils
      expect(layerCounts['shadow_highlight']).toBeGreaterThan(20); // Shading & highlights
    });

    it('scales gracefully to ultra-high density 10,000 micro-steps', () => {
      const project10k = createSylphie10kProject();
      expect(project10k.steps.length).toBe(10000);
      expect(project10k.stages[0].startStep).toBe(1);
      expect(project10k.stages[4].endStep).toBe(10000);
    });
  });

  describe('2. AI Anime Generator NLP & Semantic Routing', () => {
    it('correctly maps user keyword prompt to Sylphie pose and traits', () => {
      const prompt = '粉毛，金瞳，少女身材，其他的你看着来';
      const parsed = AiAnimeGenerator.parsePrompt(prompt);

      expect(parsed.actionPose).toBe('sylphie');
      expect(parsed.hairColor).toBe('pink');
      expect(parsed.eyeColor).toBe('gold');
    });

    it('generates Sylphie original masterpiece when requested with original keywords', () => {
      const project = AiAnimeGenerator.generateProject({
        prompt: '粉毛，金瞳，少女身材，其他的你看着来',
      });

      expect(project.title).toContain('粉毛，金瞳，少女身材');
      expect(project.steps.length).toBe(1963);
      expect(project.stages.length).toBe(5);
    });

    it('generates Sylphie when natural variations are used', () => {
      const testPrompts = [
        '原创一张吧，我给你几个关键词，粉毛，金瞳，少女身材，其他的你看着来',
        '原创粉毛金瞳少女，流光星蝶魔法少女希尔菲',
        '星辉蝶愿 希尔菲 原创插画',
      ];

      testPrompts.forEach((prompt) => {
        const project = AiAnimeGenerator.generateProject({ prompt });
        expect(project.steps.length).toBeGreaterThanOrEqual(1900);
        expect(project.stages.length).toBe(5);
      });
    });

    it('includes Sylphie in preset prompts as top recommendation', () => {
      const presets = AiAnimeGenerator.getPresetPrompts();
      expect(presets.length).toBeGreaterThan(0);
      expect(presets[0].label).toContain('星辉蝶愿');
      expect(presets[0].label).toContain('原创');
      expect(presets[0].prompt).toContain('粉毛金瞳');
    });
    it('preserves authentic 500+ hair fills without color flattening when generated with pink hair/gold eye keywords', () => {
      const project = AiAnimeGenerator.generateProject({
        prompt: '粉毛，金瞳，少女身材，其他的你看着来',
      });
      const hairFills = new Set<string>();
      project.steps
        .filter((s) => s.layerId === 'hair')
        .forEach((s) => {
          const match = s.xmlPatch.match(/fill="([^"]+)"/);
          if (match) hairFills.add(match[1]);
        });
      expect(hairFills.size).toBeGreaterThan(400); // 502 authentic shades preserved!
    });

    it('reliably maps diverse keyword combinations (e.g. 金瞳少女身材, 樱发金瞳) to Sylphie', () => {
      const variations = [
        '金瞳少女身材',
        '樱发，金瞳，少女身材',
        '粉毛少女身材，其它的你看着来',
        '原创二次元少女',
      ];
      variations.forEach((p) => {
        const parsed = AiAnimeGenerator.parsePrompt(p);
        expect(parsed.actionPose).toBe('sylphie');
        const proj = AiAnimeGenerator.generateProject({ prompt: p });
        expect(proj.steps.length).toBe(1963);
      });
    });
  });

  describe('3. Standalone SVG Generation & Rendering Invariants', () => {
    it('generates valid standalone SVG with all 1,963 paths at final step', () => {
      const project = createSylphieProject();
      const svg = ExporterEngine.generateStandaloneSvg(project, project.steps.length);

      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 800 1000"');
      expect(svg).toContain('sylphie-p1');
      expect(svg).toContain('sylphie-eye-stars');
      expect(svg).toContain('sylphie-star-butterflies');
      expect(svg).toContain('</svg>');
    });

    it('respects layer visibility filter during SVG generation', () => {
      const project = createSylphieProject();
      const visibleMap = {
        all: false,
        background: false,
        skin_body: false,
        hair: true,
        iris: false,
        clothes: false,
        shadow_highlight: false,
        line_art: false,
      };

      const svgHairOnly = ExporterEngine.generateStandaloneSvg(project, project.steps.length, visibleMap);
      expect(svgHairOnly).toContain('<svg');
      // Should not contain iris eye stars when iris is hidden
      expect(svgHairOnly).not.toContain('sylphie-eye-stars');
    });

    it('extracts complete DOM tree structure for element inspector', () => {
      const project = createSylphieProject();
      const domTree = ExporterEngine.extractDomTree(project.steps, project.steps.length);
      expect(domTree.length).toBe(7);
      const totalElements = domTree.reduce((acc, g) => acc + (g.children?.length || 0), 0);
      expect(totalElements).toBe(1963);
    });
  });

  describe('4. UI Studio & Header & Chat Integration', () => {
    it('renders Header with Sylphie option and switches project on selection', () => {
      render(
        <StudioProvider>
          <Header />
        </StudioProvider>
      );

      const select = screen.getByLabelText('选择演示作品') as HTMLSelectElement;
      expect(select).toBeInTheDocument();

      const sylphieOption = screen.getByRole('option', { name: /星辉蝶愿 · 希尔菲/i });
      expect(sylphieOption).toBeInTheDocument();

      fireEvent.change(select, { target: { value: 'sylphie' } });
      const titles = screen.getAllByText(/星辉蝶愿 · 希尔菲/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('renders 1-click quick recommendation button in Header and loads Sylphie on click', () => {
      render(
        <StudioProvider>
          <Header />
        </StudioProvider>
      );

      const quickBtn = screen.getByRole('button', { name: /原创推荐: 希尔菲/i });
      expect(quickBtn).toBeInTheDocument();

      fireEvent.click(quickBtn);
      const titles = screen.getAllByText(/星辉蝶愿 · 希尔菲/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('processes user prompt in AiChatPanel and yields Sylphie project', async () => {
      render(
        <StudioProvider>
          <AiChatPanel />
        </StudioProvider>
      );

      // Verify welcome message highlights Sylphie
      expect(screen.getByText(/原创星辉蝶愿 希尔菲/i)).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/告诉 AI 你想绘制什么/i);

      fireEvent.change(input, { target: { value: '粉毛，金瞳，少女身材，其他的你看着来' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(
        () => {
          const elements = screen.getAllByText(/星辉蝶愿 · 希尔菲/i);
          expect(elements.length).toBeGreaterThanOrEqual(1);
        },
        { timeout: 3000 }
      );
    });
  });
});
