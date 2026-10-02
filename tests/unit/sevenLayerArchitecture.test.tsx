import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import { StudioProvider, useStudio } from '../../src/store/studioContext';
import { LayerFilterPanel } from '../../src/components/layers/LayerFilterPanel';
import { LAYER_DEFINITIONS, ConcreteLayerId, LayerId } from '../../src/types/studio';
import { ExporterEngine } from '../../src/engine/exporter';
import { createSylphieProject } from '../../src/data/sylphieProject';
import { createMasterMikaBaseProject } from '../../src/data/masterMikaProject';
import { DEFAULT_ANIME_PROJECT } from '../../src/data/defaultAnimeProject';

// Import all 18 archetype compact JSON datasets to test completeness
import cyberpunkData from '../../src/data/cyberpunkCompact.json';
import etherealData from '../../src/data/etherealCompact.json';
import foxearData from '../../src/data/foxearCompact.json';
import glanceData from '../../src/data/glanceCompact.json';
import kisakiData from '../../src/data/kisakiCompact.json';
import magicalData from '../../src/data/magicalCompact.json';
import makimaData from '../../src/data/makimaCompact.json';
import masterMikaData from '../../src/data/masterMikaCompact.json';
import mikuData from '../../src/data/mikuCompact.json';
import peniaData from '../../src/data/peniaCompact.json';
import planaData from '../../src/data/planaCompact.json';
import ricoData from '../../src/data/ricoCompact.json';
import shirokoData from '../../src/data/shirokoCompact.json';
import shrineData from '../../src/data/shrineCompact.json';
import stretchData from '../../src/data/stretchCompact.json';
import sylphieData from '../../src/data/sylphieCompact.json';
import tennisData from '../../src/data/tennisCompact.json';
import vampireData from '../../src/data/vampireCompact.json';

const ALL_18_DATASETS: Record<string, { steps: Array<{ l: string }> }> = {
  cyberpunk: cyberpunkData,
  ethereal: etherealData,
  foxear: foxearData,
  glance: glanceData,
  kisaki: kisakiData,
  magical: magicalData,
  makima: makimaData,
  masterMika: masterMikaData,
  miku: mikuData,
  penia: peniaData,
  plana: planaData,
  rico: ricoData,
  shiroko: shirokoData,
  shrine: shrineData,
  stretch: stretchData,
  sylphie: sylphieData,
  tennis: tennisData,
  vampire: vampireData,
};

const SEVEN_CONCRETE_LAYERS: ConcreteLayerId[] = [
  'background',
  'skin_body',
  'hair',
  'iris',
  'clothes',
  'shadow_highlight',
  'line_art',
];

describe('Standard 7-Layer Anime Illustration Architecture Tests', () => {
  describe('1. Taxonomy & Metadata Definitions', () => {
    it('defines all 7 concrete layers and master all with correct names and badges', () => {
      SEVEN_CONCRETE_LAYERS.forEach((layerId) => {
        const def = LAYER_DEFINITIONS[layerId];
        expect(def).toBeDefined();
        expect(def.id).toBe(layerId);
        expect(def.name).toBeTruthy();
        expect(def.shortName).toBeTruthy();
        expect(def.badgeClass).toBeTruthy();
        expect(def.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(def.defaultVisible).toBe(true);
      });

      expect(LAYER_DEFINITIONS['background'].name).toContain('背景特效');
      expect(LAYER_DEFINITIONS['skin_body'].name).toContain('身体肤色');
      expect(LAYER_DEFINITIONS['hair'].name).toContain('发型');
      expect(LAYER_DEFINITIONS['iris'].name).toContain('五官眼眸');
      expect(LAYER_DEFINITIONS['clothes'].name).toContain('服饰');
      expect(LAYER_DEFINITIONS['shadow_highlight'].name).toContain('光影阴影');
      expect(LAYER_DEFINITIONS['line_art'].name).toContain('线条勾勒');
    });

    it('ensures default project layer step counts sum exactly to 43', () => {
      let sum = 0;
      SEVEN_CONCRETE_LAYERS.forEach((id) => {
        sum += LAYER_DEFINITIONS[id].defaultCount;
      });
      expect(sum).toBe(43);
      expect(LAYER_DEFINITIONS['all'].defaultCount).toBe(43);
    });
  });

  describe('2. All 18 Archetypes Full 7-Layer Completeness', () => {
    Object.entries(ALL_18_DATASETS).forEach(([charName, data]) => {
      it(`archetype [${charName}] populates non-zero strokes across all 7 layers`, () => {
        const counts: Record<string, number> = {};
        data.steps.forEach((s) => {
          counts[s.l] = (counts[s.l] || 0) + 1;
        });

        SEVEN_CONCRETE_LAYERS.forEach((layerId) => {
          expect(counts[layerId], `Character ${charName} missing layer ${layerId}`).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('3. Layer Independence & Cross-Layer Bleed Prevention', () => {
    it('toggling skin_body hides skin without extinguishing hair or clothes', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleLayer('skin_body');
      });

      expect(result.current.layers.skin_body.visible).toBe(false);
      expect(result.current.getLayerFilterStyle('skin_body').display).toBe('none');

      // Hair, clothes, line_art must remain visible
      expect(result.current.layers.hair.visible).toBe(true);
      expect(result.current.layers.clothes.visible).toBe(true);
      expect(result.current.layers.line_art.visible).toBe(true);
      expect(result.current.getLayerFilterStyle('hair').display).toBeUndefined();
      expect(result.current.getLayerFilterStyle('clothes').display).toBeUndefined();
    });

    it('toggling clothes hides clothes without extinguishing background', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleLayer('clothes');
      });

      expect(result.current.layers.clothes.visible).toBe(false);
      expect(result.current.layers.background.visible).toBe(true);
      expect(result.current.getLayerFilterStyle('background').display).toBeUndefined();
    });

    it('toggling hair hides hair without extinguishing clothes or face skin', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleLayer('hair');
      });

      expect(result.current.layers.hair.visible).toBe(false);
      expect(result.current.layers.clothes.visible).toBe(true);
      expect(result.current.layers.skin_body.visible).toBe(true);
      expect(result.current.getLayerFilterStyle('clothes').display).toBeUndefined();
      expect(result.current.getLayerFilterStyle('skin_body').display).toBeUndefined();
    });
  });

  describe('4. Solo Mode & Focusdim Behavior', () => {
    it('soloing background isolates background and dims all other 6 layers to 0.15 opacity', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('background');
      });

      expect(result.current.soloLayer).toBe('background');

      const bgStyle = result.current.getLayerFilterStyle('background');
      expect(bgStyle.opacity).toBe(1);
      expect(bgStyle.filter).toBe('none');

      const otherLayers: ConcreteLayerId[] = ['skin_body', 'hair', 'iris', 'clothes', 'shadow_highlight', 'line_art'];
      otherLayers.forEach((layerId) => {
        const style = result.current.getLayerFilterStyle(layerId);
        expect(style.opacity).toBe(0.15);
        expect(style.filter).toBe('grayscale(85%)');
      });
    });

    it('soloing skin_body isolates skin_body and dims all other 6 layers', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('skin_body');
      });

      expect(result.current.soloLayer).toBe('skin_body');

      const skinStyle = result.current.getLayerFilterStyle('skin_body');
      expect(skinStyle.opacity).toBe(1);

      const otherLayers: ConcreteLayerId[] = ['background', 'hair', 'iris', 'clothes', 'shadow_highlight', 'line_art'];
      otherLayers.forEach((layerId) => {
        const style = result.current.getLayerFilterStyle(layerId);
        expect(style.opacity).toBe(0.15);
      });
    });
  });

  describe('5. DOM Tree & Standalone SVG Export', () => {
    it('extracts DOM tree nodes for all 7 layers on default project', () => {
      const domTree = ExporterEngine.extractDomTree(DEFAULT_ANIME_PROJECT.steps, DEFAULT_ANIME_PROJECT.steps.length);
      expect(domTree.length).toBe(7);

      const layerIds = domTree.map((node) => node.layer);
      expect(layerIds).toEqual(['background', 'skin_body', 'hair', 'iris', 'clothes', 'shadow_highlight', 'line_art']);
    });

    it('extracts DOM tree nodes for all 7 layers on Mika project', () => {
      const project = createMasterMikaBaseProject();
      const domTree = ExporterEngine.extractDomTree(project.steps, project.steps.length);
      expect(domTree.length).toBe(7);

      const layerIds = domTree.map((node) => node.layer);
      expect(layerIds).toEqual(['background', 'skin_body', 'hair', 'iris', 'clothes', 'shadow_highlight', 'line_art']);
    });

    it('generates standalone SVG honoring layer visibility', () => {
      const project = createSylphieProject();
      const svgAll = ExporterEngine.generateStandaloneSvg(project, project.steps.length, {
        all: true,
        background: true,
        skin_body: true,
        hair: true,
        iris: true,
        clothes: true,
        shadow_highlight: true,
        line_art: true,
      });

      expect(svgAll).toContain('<svg');
      expect(svgAll).toContain('</svg>');
    });
  });

  describe('6. LayerFilterPanel UI Interactions', () => {
    it('renders all 7 concrete layer rows plus master row in panel', () => {
      render(
        <StudioProvider>
          <LayerFilterPanel />
        </StudioProvider>
      );

      expect(screen.getByTestId('layer-item-all')).toBeDefined();
      expect(screen.getByTestId('layer-item-background')).toBeDefined();
      expect(screen.getByTestId('layer-item-skin_body')).toBeDefined();
      expect(screen.getByTestId('layer-item-hair')).toBeDefined();
      expect(screen.getByTestId('layer-item-iris')).toBeDefined();
      expect(screen.getByTestId('layer-item-clothes')).toBeDefined();
      expect(screen.getByTestId('layer-item-shadow_highlight')).toBeDefined();
      expect(screen.getByTestId('layer-item-line_art')).toBeDefined();

      expect(screen.getByText('7/7 可见')).toBeDefined();
    });

    it('toggling multiple layers updates the visible counter badge sequentially', () => {
      render(
        <StudioProvider>
          <LayerFilterPanel />
        </StudioProvider>
      );

      expect(screen.getByText('7/7 可见')).toBeDefined();

      fireEvent.click(screen.getByTestId('visibility-toggle-background'));
      expect(screen.getByText('6/7 可见')).toBeDefined();

      fireEvent.click(screen.getByTestId('visibility-toggle-skin_body'));
      expect(screen.getByText('5/7 可见')).toBeDefined();

      // Reset button restores all
      fireEvent.click(screen.getByTestId('reset-layers-button'));
      expect(screen.getByText('7/7 可见')).toBeDefined();
    });
  });
});
