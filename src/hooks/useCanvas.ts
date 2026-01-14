/**
 * Canvas Hooks
 *
 * Hooks for interacting with canvas rendering system.
 */

import { useEffect, useRef, useCallback } from 'react';
import { Renderer } from '@/canvas/renderer';
import type { RenderCallback, ViewportState } from '@/canvas/types';

export interface UseCanvasOptions {
  onViewportChange?: (viewport: ViewportState) => void;
}

export interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  addRenderCallback: (callback: RenderCallback) => () => void;
  updateViewport: (state: Partial<ViewportState>) => void;
  getViewport: () => ViewportState | null;
}

/**
 * React hook for managing the infinite canvas
 *
 * This hook initializes the canvas renderer and provides methods
 * to interact with it. The renderer operates independently of React
 * lifecycle to ensure 60 FPS performance.
 */
export function useCanvas(options?: UseCanvasOptions): UseCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const onViewportChangeRef = useRef(options?.onViewportChange);

  // Update callback ref when it changes
  useEffect(() => {
    onViewportChangeRef.current = options?.onViewportChange;
  }, [options?.onViewportChange]);

  // Initialize renderer when canvas element is available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new Renderer();
    renderer.init(canvas);
    rendererRef.current = renderer;

    // Listen for viewport changes
    const viewport = renderer.getViewport();
    const checkViewport = () => {
      const state = viewport.getState();
      onViewportChangeRef.current?.(state);
    };

    // Poll viewport state (viewport changes happen outside React)
    // This is acceptable because viewport changes are infrequent
    const intervalId = setInterval(checkViewport, 100);

    return () => {
      clearInterval(intervalId);
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  const addRenderCallback = useCallback((callback: RenderCallback) => {
    if (!rendererRef.current) {
      return () => {};
    }
    return rendererRef.current.addRenderCallback(callback);
  }, []);

  const updateViewport = useCallback((state: Partial<ViewportState>) => {
    if (!rendererRef.current) return;
    rendererRef.current.updateViewport(state);
  }, []);

  const getViewport = useCallback((): ViewportState | null => {
    if (!rendererRef.current) return null;
    return rendererRef.current.getViewport().getState();
  }, []);

  return {
    canvasRef,
    addRenderCallback,
    updateViewport,
    getViewport,
  };
}
