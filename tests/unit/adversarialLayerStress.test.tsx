import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import { StudioProvider, useStudio } from '../../src/store/studioContext';
import { LayerFilterPanel } from '../../src/components/layers/LayerFilterPanel';
import { VectorCanvas } from '../../src/components/canvas/VectorCanvas';
import { ConcreteLayerId, LayerId } from '../../src/types/studio';

const CONCRETE_LAYERS: ConcreteLayerId[] = [
  'hair',
  'iris',
  'clothes',
  'shadow_highlight',
  'line_art',
];

describe('Milestone 1 Adversarial Challenger — Layer & State Stress Harness', () => {
  // =========================================================================
  // Challenge 1: Single Layer Toggle & Independent Visibility Invariant
  // =========================================================================
  describe('Challenge 1: Independent Layer Visibility Invariant', () => {
    it('should maintain visibility of remaining layers when ONE layer is toggled off', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      // Initially all layers visible
      expect(result.current.isLayerVisible('hair')).toBe(true);
      expect(result.current.isLayerVisible('iris')).toBe(true);
      expect(result.current.isLayerVisible('clothes')).toBe(true);

      // Toggle 'hair' OFF
      act(() => {
        result.current.toggleLayer('hair');
      });

      // 'hair' should be hidden
      expect(result.current.layers.hair.visible).toBe(false);
      expect(result.current.isLayerVisible('hair')).toBe(false);
      const hairStyle = result.current.getLayerFilterStyle('hair');
      expect(hairStyle.display).toBe('none');

      // CRITICAL INVARIANT: 'iris', 'clothes', etc. MUST REMAIN VISIBLE!
      // Their isLayerVisible() must be true, and getLayerFilterStyle() must NOT be display: 'none'!
      expect(result.current.layers.iris.visible).toBe(true);
      expect(result.current.isLayerVisible('iris')).toBe(true);
      const irisStyle = result.current.getLayerFilterStyle('iris');
      expect(irisStyle.display).toBeUndefined();
      expect(irisStyle.opacity).toBe(1);
    });

    it('should NOT dim all UI layer rows to opacity-50 when only one layer is hidden', () => {
      render(
        <StudioProvider>
          <LayerFilterPanel />
        </StudioProvider>
      );

      // Toggle 'hair' off via eye button
      const hairEye = screen.getByTestId('visibility-toggle-hair');
      fireEvent.click(hairEye);

      // Hair item should be dimmed (hidden)
      const hairItem = screen.getByTestId('layer-item-hair');
      expect(hairItem.className).toContain('opacity-50');

      // Iris item MUST NOT be dimmed (it is still visible!)
      const irisItem = screen.getByTestId('layer-item-iris');
      expect(irisItem.className).not.toContain('opacity-50');

      // Iris eye toggle should have aria-pressed="true"
      const irisEye = screen.getByTestId('visibility-toggle-iris');
      expect(irisEye.getAttribute('aria-pressed')).toBe('true');
    });

    it('should NOT hide iris layer in VectorCanvas SVG when hair is toggled off', () => {
      const { container } = render(
        <StudioProvider>
          <div>
            <LayerFilterPanel />
            <VectorCanvas />
          </div>
        </StudioProvider>
      );

      // Toggle 'hair' off
      const hairEye = screen.getByTestId('visibility-toggle-hair');
      fireEvent.click(hairEye);

      const hairGroup = container.querySelector('#layer-hair-back');
      expect(hairGroup?.getAttribute('style')).toContain('display: none');

      // Iris group MUST NOT have display: none
      const irisGroup = container.querySelector('#layer-iris');
      expect(irisGroup?.getAttribute('style')).not.toContain('display: none');
    });
  });

  // =========================================================================
  // Challenge 2: Master "all" Toggle Synchronization
  // =========================================================================
  describe('Challenge 2: Master "all" Toggle Synchronization', () => {
    it('should turn all layers ON when "all" is toggled from a partially visible state', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      // Partially hide 2 layers
      act(() => {
        result.current.setLayerVisibility('hair', false);
        result.current.setLayerVisibility('clothes', false);
      });

      expect(result.current.layers.hair.visible).toBe(false);
      expect(result.current.layers.clothes.visible).toBe(false);
      expect(result.current.layers.iris.visible).toBe(true);

      // Toggling 'all' should turn everything ON
      act(() => {
        result.current.toggleLayer('all');
      });

      for (const c of CONCRETE_LAYERS) {
        expect(result.current.layers[c].visible).toBe(true);
        expect(result.current.isLayerVisible(c)).toBe(true);
      }
      expect(result.current.layers.all.visible).toBe(true);
    });

    it('should turn all layers OFF when "all" is toggled from a fully visible state', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      // Toggling 'all' when all are visible should turn everything OFF
      act(() => {
        result.current.toggleLayer('all');
      });

      for (const c of CONCRETE_LAYERS) {
        expect(result.current.layers[c].visible).toBe(false);
        expect(result.current.isLayerVisible(c)).toBe(false);
      }
      expect(result.current.layers.all.visible).toBe(false);
    });
  });

  // =========================================================================
  // Challenge 3: Solo Mode State Machine & Edge Cases
  // =========================================================================
  describe('Challenge 3: Solo Mode State Machine Edge Cases', () => {
    it('should auto-restore visibility when soloing a hidden layer', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.setLayerVisibility('clothes', false);
      });
      expect(result.current.layers.clothes.visible).toBe(false);

      act(() => {
        result.current.toggleSoloLayer('clothes');
      });

      expect(result.current.soloLayer).toBe('clothes');
      expect(result.current.layers.clothes.visible).toBe(true);
      expect(result.current.isLayerSoloed('clothes')).toBe(true);
    });

    it('should clear solo mode when toggling the solo button on the same layer twice', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('iris');
      });
      expect(result.current.soloLayer).toBe('iris');

      act(() => {
        result.current.toggleSoloLayer('iris');
      });
      expect(result.current.soloLayer).toBeNull();
    });

    it('should smoothly transfer solo focus from layer A to layer B', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('hair');
      });
      expect(result.current.soloLayer).toBe('hair');

      act(() => {
        result.current.toggleSoloLayer('iris');
      });
      expect(result.current.soloLayer).toBe('iris');
      expect(result.current.isLayerSoloed('iris')).toBe(true);
      expect(result.current.isLayerSoloed('hair')).toBe(false);
    });

    it('should cancel solo mode when soloed layer is hidden via toggleLayer or setLayerVisibility', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('iris');
      });
      expect(result.current.soloLayer).toBe('iris');

      act(() => {
        result.current.setLayerVisibility('iris', false);
      });
      expect(result.current.soloLayer).toBeNull();
    });

    it('should cancel solo mode when master "all" is toggled to hide all layers', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('iris');
      });
      expect(result.current.soloLayer).toBe('iris');

      // Now toggle 'all' off (which hides all layers)
      act(() => {
        result.current.toggleLayer('all');
      });

      // Since all layers are hidden, solo mode should NOT remain active claiming iris is focused
      expect(result.current.soloLayer).toBeNull();
    });

    it('should reject or safely ignore soloing master "all" layer', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('all');
      });
      expect(result.current.soloLayer).toBeNull();

      act(() => {
        result.current.setSoloLayer('all');
      });
      // Filter styles should not crash or treat 'all' as solo
      const hairStyle = result.current.getLayerFilterStyle('hair');
      expect(hairStyle.opacity).toBe(1);
    });
  });

  // =========================================================================
  // Challenge 4: CSS Style Isolation Integrity
  // =========================================================================
  describe('Challenge 4: CSS Style Isolation Integrity', () => {
    it('verifies exact styling specs: focused layer has opacity 1 and filter none, others have opacity 0.15 and grayscale(85%)', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('iris');
      });

      // Focused layer
      const iris = result.current.getLayerFilterStyle('iris');
      expect(iris.opacity).toBe(1);
      expect(iris.filter).toBe('none');
      expect(iris.pointerEvents).toBe('auto');

      // All other concrete layers
      const otherLayers: ConcreteLayerId[] = ['hair', 'clothes', 'shadow_highlight', 'line_art'];
      for (const id of otherLayers) {
        const style = result.current.getLayerFilterStyle(id);
        expect(style.opacity).toBe(0.15);
        expect(style.filter).toBe('grayscale(85%)');
        expect(style.pointerEvents).toBe('none');
      }
    });

    it('properly overrides dimmed style with display: none if an unfocused layer is also hidden, without extinguishing the focused layer', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      act(() => {
        result.current.toggleSoloLayer('iris');
        result.current.setLayerVisibility('clothes', false);
      });

      const clothesStyle = result.current.getLayerFilterStyle('clothes');
      expect(clothesStyle.display).toBe('none');
      expect(clothesStyle.opacity).toBe(0);

      // Iris remains focused at opacity 1 (MUST NOT BE EXTINGUISHED BY CLOTHES BEING HIDDEN!)
      const irisStyle = result.current.getLayerFilterStyle('iris');
      expect(irisStyle.opacity).toBe(1);
      expect(irisStyle.filter).toBe('none');
    });
  });

  // =========================================================================
  // Challenge 5: High-Frequency Randomized 500-Cycle State Stress
  // =========================================================================
  describe('Challenge 5: High-Frequency Randomized 500-Cycle Layer Toggles', () => {
    it('executes 500 random toggles without throwing exceptions or corrupting state invariants', () => {
      const { result } = renderHook(() => useStudio(), { wrapper: StudioProvider });

      const allLayerIds: LayerId[] = [
        'all',
        'hair',
        'iris',
        'clothes',
        'shadow_highlight',
        'line_art',
      ];

      // Deterministic PRNG seed for reproducibility
      let seed = 42;
      const pseudoRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };

      for (let i = 0; i < 500; i++) {
        const actionType = Math.floor(pseudoRandom() * 3);
        const targetLayer = allLayerIds[Math.floor(pseudoRandom() * allLayerIds.length)];

        act(() => {
          if (actionType === 0) {
            result.current.toggleLayer(targetLayer);
          } else if (actionType === 1) {
            result.current.toggleSoloLayer(targetLayer);
          } else {
            const nextVis = pseudoRandom() > 0.5;
            result.current.setLayerVisibility(targetLayer, nextVis);
          }
        });

        // Verification of state integrity after each operation:
        for (const c of CONCRETE_LAYERS) {
          expect(typeof result.current.layers[c].visible).toBe('boolean');
        }

        if (result.current.soloLayer !== null) {
          expect(CONCRETE_LAYERS).toContain(result.current.soloLayer);
        }
      }

      // Finally, resetAllLayers should cleanly return everything to default
      act(() => {
        result.current.resetAllLayers();
      });

      for (const c of CONCRETE_LAYERS) {
        expect(result.current.layers[c].visible).toBe(true);
        expect(result.current.isLayerVisible(c)).toBe(true);
      }
      expect(result.current.soloLayer).toBeNull();
    });
  });

  // =========================================================================
  // Challenge 6: Zero Layout Shift Guarantee
  // =========================================================================
  describe('Challenge 6: Zero Layout Shift Guarantee', () => {
    it('maintains constant SVG viewBox, canvas dimensions, and persistent DOM nodes regardless of layer visibility', () => {
      const { container } = render(
        <StudioProvider>
          <VectorCanvas />
        </StudioProvider>
      );

      const svg = container.querySelector('#studio-vector-canvas');
      expect(svg).toBeDefined();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 800 1000');
      expect(svg?.getAttribute('width')).toBe('800');
      expect(svg?.getAttribute('height')).toBe('1000');

      // Verify that all 7 layer group DOM nodes are persistently present in the DOM
      // (They must not be mounted/unmounted conditionally, preventing reflows and layout shifts)
      const expectedGroupIds = [
        '#layer-hair-back',
        '#layer-clothes',
        '#layer-face-skin',
        '#layer-iris',
        '#layer-hair-front',
        '#layer-shadow_highlight',
        '#layer-line_art',
      ];

      for (const id of expectedGroupIds) {
        expect(container.querySelector(id)).not.toBeNull();
      }
    });
  });
});
