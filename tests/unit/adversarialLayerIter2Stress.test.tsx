import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import { StudioProvider, useStudio } from '../../src/store/studioContext';
import { LayerFilterPanel } from '../../src/components/layers/LayerFilterPanel';
import { VectorCanvas } from '../../src/components/canvas/VectorCanvas';
import { ConcreteLayerId, LayerId, LAYER_DEFINITIONS } from '../../src/types/studio';

const CONCRETE_LAYERS: ConcreteLayerId[] = [
  'hair',
  'iris',
  'clothes',
  'shadow_highlight',
  'line_art',
];

describe('Challenger 2 Iteration 2: Deep Layer State Machine & Solo Isolation Invariant Stress', () => {
  // =========================================================================
  // SECTION 1: Independent Visibility & Sibling Immunity Matrix
  // =========================================================================
  describe('Section 1: Sibling Immunity Exhaustion Matrix', () => {
    for (const targetToHide of CONCRETE_LAYERS) {
      it(`hiding ${targetToHide} never cascade-extinguishes any other concrete layer`, () => {
        const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

        // Hide target layer
        act(() => {
          result.current.toggleLayer(targetToHide);
        });

        // Target layer is hidden
        expect(result.current.layers[targetToHide].visible).toBe(false);
        expect(result.current.isLayerVisible(targetToHide)).toBe(false);
        expect(result.current.getLayerFilterStyle(targetToHide).display).toBe('none');

        // All 4 remaining layers MUST retain visible: true, isLayerVisible: true, and display: undefined
        const siblings = CONCRETE_LAYERS.filter((l) => l !== targetToHide);
        for (const sibling of siblings) {
          expect(result.current.layers[sibling].visible, `${sibling} visible flag`).toBe(true);
          expect(result.current.isLayerVisible(sibling), `${sibling} isLayerVisible`).toBe(true);
          const style = result.current.getLayerFilterStyle(sibling);
          expect(style.display, `${sibling} style.display`).toBeUndefined();
          expect(style.opacity, `${sibling} style.opacity`).toBe(1);
          expect(style.filter, `${sibling} style.filter`).toBe('none');
        }

        // Master 'all' reflects that not all layers are visible
        expect(result.current.layers.all.visible).toBe(false);
      });
    }

    it('arbitrary subsets of hidden layers leave remaining active layers fully visible', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      // Hide 3 layers: hair, clothes, line_art
      act(() => {
        result.current.setLayerVisibility('hair', false);
        result.current.setLayerVisibility('clothes', false);
        result.current.setLayerVisibility('line_art', false);
      });

      // The 2 remaining layers (iris, shadow_highlight) must be completely visible
      const activeLayers: ConcreteLayerId[] = ['iris', 'shadow_highlight'];
      for (const id of activeLayers) {
        expect(result.current.layers[id].visible).toBe(true);
        expect(result.current.isLayerVisible(id)).toBe(true);
        const style = result.current.getLayerFilterStyle(id);
        expect(style.display).toBeUndefined();
        expect(style.opacity).toBe(1);
      }

      // The 3 hidden layers must have display: none
      const hiddenLayers: ConcreteLayerId[] = ['hair', 'clothes', 'line_art'];
      for (const id of hiddenLayers) {
        expect(result.current.layers[id].visible).toBe(false);
        expect(result.current.isLayerVisible(id)).toBe(false);
        const style = result.current.getLayerFilterStyle(id);
        expect(style.display).toBe('none');
      }
    });
  });

  // =========================================================================
  // SECTION 2: Solo State Machine Invariants & Persistence
  // =========================================================================
  describe('Section 2: Solo State Machine Invariants & Persistence', () => {
    it('focused layer remains fully focused (opacity 1, filter none) while unfocused layers are toggled off and on', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      // Solo 'iris'
      act(() => {
        result.current.toggleSoloLayer('iris');
      });
      expect(result.current.soloLayer).toBe('iris');

      // Focused layer has opacity 1, filter none
      let irisStyle = result.current.getLayerFilterStyle('iris');
      expect(irisStyle.opacity).toBe(1);
      expect(irisStyle.filter).toBe('none');

      // Now toggle off an unfocused layer 'clothes'
      act(() => {
        result.current.toggleLayer('clothes');
      });
      expect(result.current.layers.clothes.visible).toBe(false);

      // CRITICAL: iris MUST NOT be extinguished!
      expect(result.current.soloLayer).toBe('iris');
      irisStyle = result.current.getLayerFilterStyle('iris');
      expect(irisStyle.opacity).toBe(1);
      expect(irisStyle.filter).toBe('none');
      expect(irisStyle.display).toBeUndefined();

      // Clothes should be display: none
      const clothesStyle = result.current.getLayerFilterStyle('clothes');
      expect(clothesStyle.display).toBe('none');

      // Now toggle 'clothes' back ON
      act(() => {
        result.current.toggleLayer('clothes');
      });
      expect(result.current.layers.clothes.visible).toBe(true);

      // Iris is STILL focused (opacity 1, filter none)
      irisStyle = result.current.getLayerFilterStyle('iris');
      expect(irisStyle.opacity).toBe(1);
      expect(irisStyle.filter).toBe('none');

      // Clothes is now visible again, but dimmed because iris is soloed!
      const clothesRestored = result.current.getLayerFilterStyle('clothes');
      expect(clothesRestored.display).toBeUndefined();
      expect(clothesRestored.opacity).toBe(0.15);
      expect(clothesRestored.filter).toBe('grayscale(85%)');
    });

    it('toggling master "all" off cleanly dismisses any active solo mode', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      for (const layer of CONCRETE_LAYERS) {
        // Solo the layer
        act(() => {
          result.current.toggleSoloLayer(layer);
        });
        expect(result.current.soloLayer).toBe(layer);

        // Toggle master 'all' (which hides everything)
        act(() => {
          result.current.toggleLayer('all');
        });

        // Solo mode MUST be completely dismissed (null)
        expect(result.current.soloLayer, `soloLayer after toggleLayer('all') when ${layer} was soloed`).toBeNull();

        // Turn all layers back ON for the next iteration
        act(() => {
          result.current.toggleLayer('all');
        });
        expect(result.current.soloLayer).toBeNull();
      }
    });

    it('setLayerVisibility("all", false) cleanly dismisses active solo mode', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('shadow_highlight');
      });
      expect(result.current.soloLayer).toBe('shadow_highlight');

      act(() => {
        result.current.setLayerVisibility('all', false);
      });

      expect(result.current.soloLayer).toBeNull();
      for (const c of CONCRETE_LAYERS) {
        expect(result.current.layers[c].visible).toBe(false);
      }
    });

    it('soloing a hidden layer auto-unhides it and synchronizes master "all" when all others are visible', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      // Hide clothes
      act(() => {
        result.current.setLayerVisibility('clothes', false);
      });
      expect(result.current.layers.clothes.visible).toBe(false);
      expect(result.current.layers.all.visible).toBe(false);

      // Now solo clothes
      act(() => {
        result.current.toggleSoloLayer('clothes');
      });

      // Clothes should now be visible AND soloed
      expect(result.current.soloLayer).toBe('clothes');
      expect(result.current.layers.clothes.visible).toBe(true);

      // Because hair, iris, shadow_highlight, line_art were already visible,
      // all 5 are now visible, so layers.all.visible MUST be true!
      expect(result.current.layers.all.visible).toBe(true);
    });

    it('hiding the currently soloed layer cancels solo mode', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('hair');
      });
      expect(result.current.soloLayer).toBe('hair');

      act(() => {
        result.current.toggleLayer('hair');
      });
      expect(result.current.soloLayer).toBeNull();
      expect(result.current.layers.hair.visible).toBe(false);

      // Unhiding hair should NOT re-activate solo mode
      act(() => {
        result.current.toggleLayer('hair');
      });
      expect(result.current.soloLayer).toBeNull();
      expect(result.current.layers.hair.visible).toBe(true);
    });

    it('resetAllLayers resets all 5 layers to visible and cancels solo mode', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('line_art');
        result.current.setLayerVisibility('hair', false);
      });
      expect(result.current.soloLayer).toBe('line_art');
      expect(result.current.layers.hair.visible).toBe(false);

      act(() => {
        result.current.resetAllLayers();
      });

      expect(result.current.soloLayer).toBeNull();
      for (const c of CONCRETE_LAYERS) {
        expect(result.current.layers[c].visible).toBe(true);
        expect(result.current.isLayerVisible(c)).toBe(true);
      }
      expect(result.current.layers.all.visible).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 3: DOM Rendering & VectorCanvas Style Verification
  // =========================================================================
  describe('Section 3: DOM Rendering & VectorCanvas SVG Invariants', () => {
    it('applies correct SVG styles in VectorCanvas for normal, hidden, and solo states', () => {
      const { container } = render(
        <StudioProvider>
          <div>
            <LayerFilterPanel />
            <VectorCanvas />
          </div>
        </StudioProvider>
      );

      const irisGroup = container.querySelector('#layer-iris');
      const hairGroup = container.querySelector('#layer-hair-back');
      const clothesGroup = container.querySelector('#layer-clothes');

      // 1. Initial State: all groups visible
      expect(irisGroup?.getAttribute('style')).not.toContain('display: none');
      expect(hairGroup?.getAttribute('style')).not.toContain('display: none');

      // 2. Solo 'iris'
      const soloIrisBtn = screen.getByTestId('solo-toggle-iris');
      fireEvent.click(soloIrisBtn);

      // Iris is focused (opacity: 1)
      expect(irisGroup?.getAttribute('style')).toContain('opacity: 1');
      expect(irisGroup?.getAttribute('style')).not.toContain('grayscale');

      // Hair & Clothes are background (opacity: 0.15, grayscale(85%))
      expect(hairGroup?.getAttribute('style')).toContain('opacity: 0.15');
      expect(hairGroup?.getAttribute('style')).toContain('grayscale(85%)');
      expect(clothesGroup?.getAttribute('style')).toContain('opacity: 0.15');
      expect(clothesGroup?.getAttribute('style')).toContain('grayscale(85%)');

      // 3. Hide 'hair' while 'iris' is soloed
      const hairEyeBtn = screen.getByTestId('visibility-toggle-hair');
      fireEvent.click(hairEyeBtn);

      // Hair becomes display: none
      expect(hairGroup?.getAttribute('style')).toContain('display: none');

      // Iris MUST STILL BE OPACITY: 1 and NOT display: none
      expect(irisGroup?.getAttribute('style')).not.toContain('display: none');
      expect(irisGroup?.getAttribute('style')).toContain('opacity: 1');

      // 4. Toggle master 'all' from partially hidden state: turns all ON
      const allEyeBtn = screen.getByTestId('visibility-toggle-all');
      fireEvent.click(allEyeBtn);

      // Solo banner must be dismissed
      expect(screen.queryByTestId('solo-mode-banner')).toBeNull();

      // All groups are now visible
      expect(irisGroup?.getAttribute('style')).not.toContain('display: none');
      expect(hairGroup?.getAttribute('style')).not.toContain('display: none');
      expect(clothesGroup?.getAttribute('style')).not.toContain('display: none');

      // 5. Toggle master 'all' from fully visible state: turns all OFF
      fireEvent.click(allEyeBtn);

      // All groups are now hidden
      expect(irisGroup?.getAttribute('style')).toContain('display: none');
      expect(hairGroup?.getAttribute('style')).toContain('display: none');
      expect(clothesGroup?.getAttribute('style')).toContain('display: none');
    });

    it('UI panel reflects correct badge counts and master card styling when layers toggle', () => {
      render(
        <StudioProvider>
          <LayerFilterPanel />
        </StudioProvider>
      );

      // Initial badge: 7/7 可见
      expect(screen.getByText('7/7 可见')).toBeDefined();

      // Toggle hair off
      const hairEye = screen.getByTestId('visibility-toggle-hair');
      fireEvent.click(hairEye);

      // Badge updates to 6/7 可见
      expect(screen.getByText('6/7 可见')).toBeDefined();

      // Master card item does NOT receive opacity-50
      const masterItem = screen.getByTestId('layer-item-all');
      expect(masterItem.className).not.toContain('opacity-50');

      // Hair card item DOES receive opacity-50
      const hairItem = screen.getByTestId('layer-item-hair');
      expect(hairItem.className).toContain('opacity-50');

      // Iris card item does NOT receive opacity-50
      const irisItem = screen.getByTestId('layer-item-iris');
      expect(irisItem.className).not.toContain('opacity-50');

      // Click "退出聚焦" button on banner when active
      const irisSolo = screen.getByTestId('solo-toggle-iris');
      fireEvent.click(irisSolo);
      const exitSoloBtn = screen.getByTestId('exit-solo-button');
      expect(exitSoloBtn).toBeDefined();
      fireEvent.click(exitSoloBtn);

      // Banner should disappear
      expect(screen.queryByTestId('solo-mode-banner')).toBeNull();
    });
  });
});
