import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudioProvider } from '../../src/store/studioContext';
import { StudioLayout } from '../../src/components/layout/StudioLayout';

describe('StudioLayout Component', () => {
  it('renders Studio Header with title and model status', () => {
    render(
      <StudioProvider>
        <StudioLayout />
      </StudioProvider>
    );

    expect(screen.getByText('AI Vector Anime Studio')).toBeInTheDocument();
    expect(screen.getByText('紫发金瞳少女')).toBeInTheDocument();
  });

  it('renders 62:38 dual-pane containers and docks', () => {
    render(
      <StudioProvider>
        <StudioLayout />
      </StudioProvider>
    );

    const leftPane = screen.getByTestId('studio-left-pane');
    const rightPane = screen.getByTestId('studio-right-pane');
    const canvasViewport = screen.getByTestId('canvas-viewport');
    const timelineDock = screen.getByTestId('timeline-dock');

    expect(leftPane).toBeInTheDocument();
    expect(rightPane).toBeInTheDocument();
    expect(canvasViewport).toBeInTheDocument();
    expect(timelineDock).toBeInTheDocument();

    // Verify Tailwind 62:38 dual-pane classes
    expect(leftPane.className).toContain('lg:basis-[62%]');
    expect(rightPane.className).toContain('lg:basis-[38%]');
  });

  it('renders interactive canvas viewport with controls HUD and reference grid', () => {
    render(
      <StudioProvider>
        <StudioLayout />
      </StudioProvider>
    );

    expect(screen.getByTestId('vector-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-controls-hud')).toBeInTheDocument();
    expect(screen.getByTestId('zoom-in-button')).toBeInTheDocument();
    expect(screen.getByTestId('zoom-out-button')).toBeInTheDocument();
    expect(screen.getByTestId('fit-screen-button')).toBeInTheDocument();
    expect(screen.getByTestId('reset-view-button')).toBeInTheDocument();
    expect(screen.getByTestId('grid-toggle-button')).toBeInTheDocument();
  });

  it('allows switching inspector tabs and interacts with layer filter panel', () => {
    render(
      <StudioProvider>
        <StudioLayout />
      </StudioProvider>
    );

    // Inspector starts on layers tab
    expect(screen.getByTestId('layer-filter-panel')).toBeInTheDocument();

    // Switch to diff tab
    const diffTab = screen.getByTestId('inspector-tab-diff');
    fireEvent.click(diffTab);
    expect(screen.getByText(/代码增量/)).toBeInTheDocument();

    // Switch back to layers tab
    const layersTab = screen.getByTestId('inspector-tab-layers');
    fireEvent.click(layersTab);
    expect(screen.getByTestId('layer-filter-panel')).toBeInTheDocument();
  });
});
