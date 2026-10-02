import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMasterMikaBaseProject, createMasterMika10kProject } from '../../src/data/masterMikaProject';
import { StepDensityEngine } from '../../src/engine/stepDensityEngine';
import { ImageVectorizer } from '../../src/engine/imageVectorizer';
import { StudioProvider, useStudio } from '../../src/store/studioContext';
import { AiChatPanel } from '../../src/components/chat/AiChatPanel';
import { ExporterEngine } from '../../src/engine/exporter';

describe('Master Mika & AI Copilot System Tests', () => {
  describe('Master Mika Vector Artwork Dataset', () => {
    it('creates complete master Mika artwork with 5 stages and valid micro-steps', () => {
      const project = createMasterMikaBaseProject();
      expect(project.title).toContain('圣三一的天使');
      expect(project.title).toContain('弥香');
      expect(project.stages.length).toBe(5);
      expect(project.steps.length).toBeGreaterThanOrEqual(45);

      // Check layer coverage: all 7 layers present
      const layers = new Set(project.steps.map((s) => s.layerId));
      expect(layers.has('background')).toBe(true);
      expect(layers.has('skin_body')).toBe(true);
      expect(layers.has('hair')).toBe(true);
      expect(layers.has('iris')).toBe(true);
      expect(layers.has('clothes')).toBe(true);
      expect(layers.has('shadow_highlight')).toBe(true);
      expect(layers.has('line_art')).toBe(true);

      // Check specific Mika anatomical features
      const patches = project.steps.map((s) => s.xmlPatch).join(' ');
      expect(patches).toContain('mika-halo'); // 3D halo
      expect(patches).toContain('mika-wing'); // Angel wings
      expect(patches).toContain('mika-star-pupil'); // Yellow star pupils
      expect(patches).toContain('mika-galaxy-scrunchie'); // Starry hair scrunchie
      expect(patches).toContain('mika-trinity-crest'); // Gold Trinity emblem
    });

    it('generates standalone SVG containing all master gradients', () => {
      const project = createMasterMikaBaseProject();
      const svg = ExporterEngine.generateStandaloneSvg(project, project.steps.length);
      expect(svg).toContain('<svg');
      expect(svg).toContain('mika-hair-pink-grad');
      expect(svg).toContain('mika-eye-gold-grad');
      expect(svg).toContain('mika-halo-glow-grad');
      expect(svg).toContain('mika-wing-feather-grad');
      expect(svg).toContain('mika-trinity-gold-grad');
      expect(svg).toContain('</svg>');
    });
  });

  describe('Step Density Engine (10,000 Micro-Steps Expansion)', () => {
    it('scales project to exactly 10,000 steps with proper stage boundaries', () => {
      const base = createMasterMikaBaseProject();
      const scaled = StepDensityEngine.scaleProjectToDensity(base, 10000);

      expect(scaled.steps.length).toBe(10000);
      expect(scaled.title).toContain('10,000步');
      expect(scaled.stages.length).toBe(5);

      // First step is 1, last step is 10,000
      expect(scaled.steps[0].id).toBe(1);
      expect(scaled.steps[9999].id).toBe(10000);

      // Check stage sequence continuity
      expect(scaled.stages[0].startStep).toBe(1);
      expect(scaled.stages[4].endStep).toBe(10000);
    });

    it('creates pre-configured master Mika 10k project directly', () => {
      const mika10k = createMasterMika10kProject();
      expect(mika10k.steps.length).toBe(10000);
      expect(mika10k.viewBox).toBe('0 0 800 1000');
    });
  });

  describe('Image Vectorizer & Semantic Classifier', () => {
    it('classifies anime colors into semantic layers accurately', () => {
      // Dark outlines -> line_art
      expect(ImageVectorizer.classifyColorToLayer(20, 20, 25)).toBe('line_art');
      // Bright highlight -> shadow_highlight
      expect(ImageVectorizer.classifyColorToLayer(250, 250, 255)).toBe('shadow_highlight');
      // Amber / Gold iris -> iris
      expect(ImageVectorizer.classifyColorToLayer(245, 170, 40)).toBe('iris');
      // Pink hair -> hair
      expect(ImageVectorizer.classifyColorToLayer(244, 114, 182)).toBe('hair');
      // Deep blue / Navy clothes -> clothes
      expect(ImageVectorizer.classifyColorToLayer(30, 27, 75)).toBe('clothes');
    });
  });

  describe('In-Studio AI Chat Co-Pilot Component', () => {
    it('renders assistant greeting and initial capabilities', () => {
      render(
        <StudioProvider>
          <AiChatPanel />
        </StudioProvider>
      );

      expect(screen.getByText('AI 对话插画师')).toBeInTheDocument();
      expect(screen.getByText(/圣三一天使弥香/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/告诉 AI 你想绘制什么/)).toBeInTheDocument();
    });

    it('toggles AI config drawer with engine selector', () => {
      render(
        <StudioProvider>
          <AiChatPanel />
        </StudioProvider>
      );

      const configBtn = screen.getByTitle('配置 AI 引擎与 API 密钥');
      fireEvent.click(configBtn);

      expect(screen.getByText('AI 引擎模式与密钥设置')).toBeInTheDocument();
      expect(screen.getByText(/高精二次元矢量引擎/)).toBeInTheDocument();
    });

    it('submits a prompt and displays user message and quick response', async () => {
      vi.useFakeTimers();

      render(
        <StudioProvider>
          <AiChatPanel />
        </StudioProvider>
      );

      const input = screen.getByPlaceholderText(/告诉 AI 你想绘制什么/);
      fireEvent.change(input, { target: { value: '请绘制弥香 10000 步精修' } });

      const form = input.closest('form');
      expect(form).not.toBeNull();
      fireEvent.submit(form!);

      expect(screen.getByText('请绘制弥香 10000 步精修')).toBeInTheDocument();

      // Fast-forward simulated AI reasoning timer
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const mikaMatches = screen.getAllByText(/圣三一的天使 · 圣园弥香/);
      expect(mikaMatches.length).toBeGreaterThan(0);
      expect(screen.getAllByText('在画布渲染').length).toBeGreaterThan(0);
      expect(screen.getAllByText('动态回放').length).toBeGreaterThan(0);

      vi.useRealTimers();
    });
  });
});
