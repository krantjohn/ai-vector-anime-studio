import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import { StudioProvider, useStudio } from '../../src/store/studioContext';
import { LayerFilterPanel } from '../../src/components/layers/LayerFilterPanel';
import { LAYER_DEFINITIONS, LayerId } from '../../src/types/studio';

describe('Layer System & Studio Store Unit Tests', () => {
  describe('Layer Metadata & Definitions', () => {
    it('should define all 8 required layer categories', () => {
      const expectedLayers: LayerId[] = [
        'all',
        'background',
        'skin_body',
        'hair',
        'iris',
        'clothes',
        'shadow_highlight',
        'line_art',
      ];
      expectedLayers.forEach((id) => {
        expect(LAYER_DEFINITIONS[id]).toBeDefined();
        expect(LAYER_DEFINITIONS[id].name).toBeTruthy();
        expect(LAYER_DEFINITIONS[id].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(LAYER_DEFINITIONS[id].description).toBeTruthy();
      });
    });
  });

  describe('Layer Visibility State Transitions', () => {
    it('should initialize with all layers visible', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });
      expect(result.current.layers.all.visible).toBe(true);
      expect(result.current.layers.hair.visible).toBe(true);
      expect(result.current.layers.iris.visible).toBe(true);
      expect(result.current.soloLayer).toBeNull();
    });

    it('should toggle an individual layer visibility and update master layer without extinguishing others', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleLayer('hair');
      });

      expect(result.current.layers.hair.visible).toBe(false);
      expect(result.current.isLayerVisible('hair')).toBe(false);
      expect(result.current.getLayerFilterStyle('hair').display).toBe('none');

      // CRITICAL: sibling layers remain visible and rendered
      expect(result.current.layers.iris.visible).toBe(true);
      expect(result.current.isLayerVisible('iris')).toBe(true);
      expect(result.current.getLayerFilterStyle('iris').display).toBeUndefined();
      expect(result.current.getLayerFilterStyle('iris').opacity).toBe(1);

      // Master 'all' becomes false because not all layers are visible
      expect(result.current.layers.all.visible).toBe(false);

      // Toggle hair back on
      act(() => {
        result.current.toggleLayer('hair');
      });

      expect(result.current.layers.hair.visible).toBe(true);
      expect(result.current.isLayerVisible('hair')).toBe(true);
      // Master 'all' becomes true because all 5 concrete layers are visible
      expect(result.current.layers.all.visible).toBe(true);
    });

    it('should handle master layer bulk toggle correctly and cancel solo when hiding all', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      // Solo iris first
      act(() => {
        result.current.toggleSoloLayer('iris');
      });
      expect(result.current.soloLayer).toBe('iris');

      // When all are visible, toggling 'all' hides all layers and clears solo
      act(() => {
        result.current.toggleLayer('all');
      });

      expect(result.current.layers.all.visible).toBe(false);
      expect(result.current.layers.hair.visible).toBe(false);
      expect(result.current.layers.iris.visible).toBe(false);
      expect(result.current.layers.clothes.visible).toBe(false);
      expect(result.current.soloLayer).toBeNull();

      // When all are hidden, toggling 'all' reveals all layers
      act(() => {
        result.current.toggleLayer('all');
      });

      expect(result.current.layers.all.visible).toBe(true);
      expect(result.current.layers.hair.visible).toBe(true);
      expect(result.current.layers.iris.visible).toBe(true);
    });

    it('should set layer visibility directly via setLayerVisibility', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.setLayerVisibility('clothes', false);
      });

      expect(result.current.layers.clothes.visible).toBe(false);
      expect(result.current.isLayerVisible('clothes')).toBe(false);
      expect(result.current.isLayerVisible('iris')).toBe(true);
      expect(result.current.layers.all.visible).toBe(false);
    });
  });

  describe('Solo / Focus Mode Logic', () => {
    it('should toggle solo mode for a layer', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('iris');
      });

      expect(result.current.soloLayer).toBe('iris');
      expect(result.current.isLayerSoloed('iris')).toBe(true);
      expect(result.current.isLayerSoloed('hair')).toBe(false);

      // Re-clicking the same solo toggle clears solo mode
      act(() => {
        result.current.toggleSoloLayer('iris');
      });

      expect(result.current.soloLayer).toBeNull();
    });

    it('should auto-restore visibility of a hidden layer when soloed', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.setLayerVisibility('hair', false);
      });
      expect(result.current.layers.hair.visible).toBe(false);

      // Soloing the hidden hair layer must make it visible
      act(() => {
        result.current.toggleSoloLayer('hair');
      });

      expect(result.current.soloLayer).toBe('hair');
      expect(result.current.layers.hair.visible).toBe(true);
    });

    it('should clear solo mode when the soloed layer is toggled hidden', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('iris');
      });
      expect(result.current.soloLayer).toBe('iris');

      // Now hide iris
      act(() => {
        result.current.toggleLayer('iris');
      });

      expect(result.current.layers.iris.visible).toBe(false);
      expect(result.current.soloLayer).toBeNull();
    });

    it('should maintain solo focus opacity 1 even if another layer is toggled off', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('iris');
        result.current.toggleLayer('clothes');
      });

      expect(result.current.soloLayer).toBe('iris');
      expect(result.current.getLayerFilterStyle('clothes').display).toBe('none');
      expect(result.current.getLayerFilterStyle('iris').opacity).toBe(1);
      expect(result.current.getLayerFilterStyle('iris').filter).toBe('none');
    });

    it('should reset all layers and clear solo on resetAllLayers', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleLayer('hair');
        result.current.toggleSoloLayer('clothes');
      });

      expect(result.current.layers.hair.visible).toBe(false);
      expect(result.current.soloLayer).toBe('clothes');

      act(() => {
        result.current.resetAllLayers();
      });

      expect(result.current.layers.hair.visible).toBe(true);
      expect(result.current.layers.clothes.visible).toBe(true);
      expect(result.current.soloLayer).toBeNull();
    });
  });

  describe('CSS Filter & Opacity Generation (getLayerFilterStyle)', () => {
    it('should return opacity 1 and filter none for normal visible layers', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });
      const style = result.current.getLayerFilterStyle('iris');
      expect(style.opacity).toBe(1);
      expect(style.filter).toBe('none');
      expect(style.pointerEvents).toBe('auto');
    });

    it('should return display none for hidden layers', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });
      act(() => {
        result.current.toggleLayer('clothes');
      });
      const style = result.current.getLayerFilterStyle('clothes');
      expect(style.display).toBe('none');
      expect(style.opacity).toBe(0);
      expect(style.pointerEvents).toBe('none');
    });

    it('should dim non-focused layers to 0.15 opacity and grayscale(85%) in solo mode', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });
      act(() => {
        result.current.toggleSoloLayer('iris');
      });

      // Focused layer
      const irisStyle = result.current.getLayerFilterStyle('iris');
      expect(irisStyle.opacity).toBe(1);
      expect(irisStyle.filter).toBe('none');
      expect(irisStyle.pointerEvents).toBe('auto');

      // Unfocused layers
      const hairStyle = result.current.getLayerFilterStyle('hair');
      expect(hairStyle.opacity).toBe(0.15);
      expect(hairStyle.filter).toBe('grayscale(85%)');
      expect(hairStyle.pointerEvents).toBe('none');
    });
  });

  describe('LayerFilterPanel UI Integration', () => {
    it('should render all layer items, badges, and controls', () => {
      render(
        <StudioProvider>
          <LayerFilterPanel />
        </StudioProvider>
      );

      expect(screen.getByText('图层过滤')).toBeDefined();
      expect(screen.getByTestId('layer-item-all')).toBeDefined();
      expect(screen.getByTestId('layer-item-iris')).toBeDefined();
      expect(screen.getByTestId('layer-item-hair')).toBeDefined();
    });

    it('should toggle layer when eye button is clicked and only dim toggled item', () => {
      render(
        <StudioProvider>
          <LayerFilterPanel />
        </StudioProvider>
      );

      const eyeBtn = screen.getByTestId('visibility-toggle-iris');
      fireEvent.click(eyeBtn);

      const irisItem = screen.getByTestId('layer-item-iris');
      expect(irisItem.className).toContain('opacity-50');

      const hairItem = screen.getByTestId('layer-item-hair');
      expect(hairItem.className).not.toContain('opacity-50');
    });

    it('should display solo banner when target icon is clicked and dismiss it', () => {
      render(
        <StudioProvider>
          <LayerFilterPanel />
        </StudioProvider>
      );

      const soloBtn = screen.getByTestId('solo-toggle-iris');
      fireEvent.click(soloBtn);

      expect(screen.getByTestId('solo-mode-banner')).toBeDefined();
      expect(screen.getByText(/已聚焦:/)).toBeDefined();

      const exitBtn = screen.getByTestId('exit-solo-button');
      fireEvent.click(exitBtn);

      expect(screen.queryByTestId('solo-mode-banner')).toBeNull();
    });
  });

  describe('Store Provider Boundary Check', () => {
    it('should throw descriptive error when useStudio is used outside of StudioProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderHook(() => useStudio())).toThrow(
        'useStudio must be used within a StudioProvider'
      );
      consoleError.mockRestore();
    });
  });
});
