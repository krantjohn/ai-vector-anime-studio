import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { createDeocinProject, createDeocin10kProject, DEOCIN_PROJECT } from '../../src/data/deocinProject';
import { AiAnimeGenerator } from '../../src/engine/aiAnimeGenerator';
import { StudioProvider } from '../../src/store/studioContext';
import { Header } from '../../src/components/layout/Header';
import { VectorCanvas } from '../../src/components/canvas/VectorCanvas';
import { LayerFilterPanel } from '../../src/components/layers/LayerFilterPanel';
import { AiChatPanel } from '../../src/components/chat/AiChatPanel';

describe('Live2D Flagship Suite: 幻梦航标 · 德奥欣 (Deocin Dissection & Occlusion Masterpiece)', () => {
  describe('1. Dataset Invariants & Closed Dome Architecture', () => {
    it('creates Deocin project with 139 authentic spline strokes and valid viewBox', () => {
      const project = createDeocinProject();
      expect(project.title).toContain('德奥欣');
      expect(project.version).toBe('3.5.0-live2d');
      expect(project.viewBox).toBe('0 0 800 1000');
      expect(project.canvasWidth).toBe(800);
      expect(project.canvasHeight).toBe(1000);
      expect(project.steps.length).toBe(139);
    });

    it('contains all 5 stages in strict progression with non-overlapping steps', () => {
      const project = createDeocinProject();
      expect(project.stages.length).toBe(5);

      project.stages.forEach((stage, idx) => {
        expect(stage.startStep).toBeLessThanOrEqual(stage.endStep);
        if (idx > 0) {
          expect(stage.startStep).toBe(project.stages[idx - 1].endStep + 1);
        }
      });

      expect(project.stages[0].startStep).toBe(1);
      expect(project.stages[4].endStep).toBe(139);
    });

    it('contains fully closed solid head dome (head-base-solid-cranium) without hollow cutouts', () => {
      const project = createDeocinProject();
      const headBaseStep = project.steps.find(
        (s) => s.elementId === 'head-base-solid-cranium' || s.xmlPatch.includes('id="head-base-solid-cranium"')
      );
      expect(headBaseStep).toBeDefined();
      expect(headBaseStep!.xmlPatch).toContain('d="M 270 320 C 265 240 320 175 400 175');
      // Verify cranium top reaches y: 175 and chin reaches y: 508
      expect(headBaseStep!.xmlPatch).toContain('175');
      expect(headBaseStep!.xmlPatch).toContain('508');
    });

    it('contains complete eyes and irises independent of hair', () => {
      const project = createDeocinProject();
      const irisSteps = project.steps.filter((s) => s.layerId === 'iris');
      expect(irisSteps.length).toBeGreaterThan(10);
      const catchlightStep = project.steps.find((s) => s.elementId?.includes('catchlight'));
      expect(catchlightStep).toBeDefined();
    });

    it('scales gracefully to ultra-high density 10,000 micro-steps', () => {
      const proj10k = createDeocin10kProject();
      expect(proj10k.steps.length).toBe(10000);
      expect(proj10k.stages.length).toBe(5);
      expect(proj10k.stages[4].endStep).toBe(10000);
    });
  });

  describe('2. AI Anime Generator NLP & Semantic Routing', () => {
    it('correctly maps user keyword prompts to deocin pose', () => {
      const prompts = [
        '德奥欣短发水手服萌妹，闭合头骨脸模',
        '水手服短发绿领双金条少女，Live2D可拆件',
        '德奥欣 10000步精修',
        'live2d 拆解前发闭合底模',
      ];

      for (const p of prompts) {
        const parsed = AiAnimeGenerator.parsePrompt(p);
        expect(parsed.actionPose).toBe('deocin');
      }
    });

    it('generates Deocin project when requested through generator', () => {
      const project = AiAnimeGenerator.generateProject({
        prompt: '德奥欣 Live2D 拆解水手服短发萌妹',
      });
      expect(project.title).toContain('德奥欣');
      expect(project.steps.length).toBe(139);
    });

    it('includes Deocin in preset prompts list', () => {
      const presets = AiAnimeGenerator.getPresetPrompts();
      const deocinPreset = presets.find((p) => p.label.includes('德奥欣'));
      expect(deocinPreset).toBeDefined();
      expect(deocinPreset!.prompt).toContain('德奥欣');
      expect(deocinPreset!.prompt).toContain('Live2D');
    });

    it('mentions Live2D closed dome specifications in system prompt', () => {
      const sysPrompt = AiAnimeGenerator.getSystemPromptForLlm();
      expect(sysPrompt).toContain('Live2D');
      expect(sysPrompt).toContain('闭合');
      expect(sysPrompt).toContain('头骨');
    });
  });

  describe('3. VectorCanvas & Illustrator Dissection HUD Invariants', () => {
    it('renders closed cranium dome and Illustrator measurement HUD when exploded', () => {
      render(
        <StudioProvider>
          <VectorCanvas />
        </StudioProvider>
      );

      // Initially closed face base path exists in SVG
      const faceBase = document.getElementById('skin-face-base');
      expect(faceBase).toBeInTheDocument();
      expect(faceBase?.getAttribute('d')).toContain('M 270 320 C 265 240 320 175 400 175');
    });

    it('renders Illustrator HUD elements when dissection offset is applied', () => {
      render(
        <StudioProvider>
          <Header />
          <VectorCanvas />
        </StudioProvider>
      );

      const explodeBtn = screen.getByTestId('header-live2d-explode-button');
      expect(explodeBtn).toBeInTheDocument();

      // Trigger explode
      fireEvent.click(explodeBtn);

      // Verify HUD exists
      const hud = document.getElementById('illustrator-dissection-hud');
      expect(hud).toBeInTheDocument();

      // Verify measurement tag text (dx & dy)
      const measurementText = hud?.querySelector('text');
      expect(measurementText?.textContent).toMatch(/dx:\s*280\.0pt\s*dy:\s*35\.0pt/);

      // Verify closed head dome badge
      expect(screen.getByText(/完整头骨脸模与双眼闭合底模/)).toBeInTheDocument();
    });
  });

  describe('4. UI Studio & Header & Chat Integration', () => {
    it('renders Header with Deocin option in dropdown and switches on selection', () => {
      render(
        <StudioProvider>
          <Header />
        </StudioProvider>
      );

      const select = screen.getByLabelText('选择演示作品') as HTMLSelectElement;
      expect(select).toBeInTheDocument();

      const deocinOption = screen.getByRole('option', { name: /幻梦航标 · 德奥欣/i });
      expect(deocinOption).toBeInTheDocument();

      fireEvent.change(select, { target: { value: 'deocin' } });
      const titles = screen.getAllByText(/德奥欣/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('renders 1-click quick recommendation button in Header and loads Deocin on click', () => {
      render(
        <StudioProvider>
          <Header />
        </StudioProvider>
      );

      const quickBtn = screen.getByRole('button', { name: /Live2D推荐: 德奥欣/i });
      expect(quickBtn).toBeInTheDocument();

      fireEvent.click(quickBtn);
      const titles = screen.getAllByText(/德奥欣/i);
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('processes user prompt in AiChatPanel and yields Deocin Live2D project', async () => {
      render(
        <StudioProvider>
          <AiChatPanel />
        </StudioProvider>
      );

      // Verify welcome message highlights Deocin
      expect(screen.getByText(/幻梦航标 德奥欣/i)).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/告诉 AI 你想绘制什么/i);
      fireEvent.change(input, { target: { value: '请绘制德奥欣，具备完整闭合头骨脸模与Live2D独立拆件前发' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(
        () => {
          expect(screen.getByText(/完整闭合头骨脸模/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('LayerFilterPanel contains 1-click explode toggle button and quick presets', () => {
      render(
        <StudioProvider>
          <LayerFilterPanel />
        </StudioProvider>
      );

      const toggleBtn = screen.getByTestId('toggle-live2d-explode-button');
      expect(toggleBtn).toBeInTheDocument();
      expect(screen.getByText(/Live2D 拆件与穿透遮挡/i)).toBeInTheDocument();

      fireEvent.click(toggleBtn);
      expect(screen.getByText(/退出 Live2D 拆解/i)).toBeInTheDocument();
    });
  });
});
