/**
 * Canvas Renderer
 *
 * Core rendering engine using Canvas API.
 * Must operate independently of React lifecycle.
 */

import type { ViewportState, RenderCallback, CanvasSize } from './types';
import { Viewport } from './viewport';

export class Renderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private viewport: Viewport;
  private animationFrameId: number | null = null;
  private renderCallbacks: Set<RenderCallback> = new Set();
  private devicePixelRatio: number = 1;
  private isDirty: boolean = true;
  private resizeHandler: () => void;

  constructor(viewport?: Viewport) {
    this.viewport = viewport ?? new Viewport();
    // Bind resize handler once so it can be properly removed
    this.resizeHandler = this.handleResize.bind(this);
  }

  /**
   * Initialize the renderer with a canvas element
   */
  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;

    // Get device pixel ratio for high-DPI support
    this.devicePixelRatio = window.devicePixelRatio || 1;

    // Handle resize
    this.handleResize();
    window.addEventListener('resize', this.resizeHandler);

    // Start render loop
    this.startRenderLoop();
  }

  /**
   * Cleanup renderer
   */
  destroy(): void {
    this.stopRenderLoop();
    window.removeEventListener('resize', this.resizeHandler);
    this.renderCallbacks.clear();
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Get the viewport instance
   */
  getViewport(): Viewport {
    return this.viewport;
  }

  /**
   * Register a render callback
   * Callbacks are called in the render loop to draw shapes
   */
  addRenderCallback(callback: RenderCallback): () => void {
    this.renderCallbacks.add(callback);
    this.markDirty();
    return () => {
      this.renderCallbacks.delete(callback);
      this.markDirty();
    };
  }

  /**
   * Mark the canvas as dirty (needs re-render)
   */
  markDirty(): void {
    this.isDirty = true;
  }

  /**
   * Get canvas size in screen pixels
   */
  getCanvasSize(): CanvasSize {
    if (!this.canvas) {
      return { width: 0, height: 0 };
    }
    return {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
    };
  }

  /**
   * Handle canvas resize and high-DPI scaling
   */
  private handleResize(): void {
    if (!this.canvas || !this.ctx) return;

    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Set actual size in memory (scaled for device pixel ratio)
    this.canvas.width = width * this.devicePixelRatio;
    this.canvas.height = height * this.devicePixelRatio;

    // Scale the canvas back down using CSS
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Scale the drawing context so everything draws at the correct size
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);

    this.markDirty();
  }

  /**
   * Start the requestAnimationFrame render loop
   */
  private startRenderLoop(): void {
    const render = () => {
      if (this.isDirty) {
        this.render();
        this.isDirty = false;
      }
      this.animationFrameId = requestAnimationFrame(render);
    };
    this.animationFrameId = requestAnimationFrame(render);
  }

  /**
   * Stop the render loop
   */
  private stopRenderLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main render function
   * Called by requestAnimationFrame loop
   */
  private render(): void {
    if (!this.ctx || !this.canvas) return;

    const size = this.getCanvasSize();

    // Clear canvas
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, size.width, size.height);
    this.ctx.restore();

    // Apply viewport transformation
    const transform = this.viewport.getTransform();
    this.ctx.setTransform(transform);

    // Call all render callbacks to draw shapes
    this.renderCallbacks.forEach(callback => {
      this.ctx!.save();
      try {
        callback(this.ctx!);
      } catch (error) {
        console.error('Error in render callback:', error);
      }
      this.ctx!.restore();
    });
  }

  /**
   * Update viewport state and mark dirty
   */
  updateViewport(state: Partial<ViewportState>): void {
    this.viewport.setState(state);
    this.markDirty();
  }
}
