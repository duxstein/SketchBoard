/**
 * Viewport Management
 *
 * Handles world-to-screen coordinate transformations,
 * pan, zoom, and viewport state.
 */

import type { Point, ViewportState } from './types';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

export class Viewport {
  private state: ViewportState;

  constructor(initialState?: Partial<ViewportState>) {
    this.state = {
      x: initialState?.x ?? 0,
      y: initialState?.y ?? 0,
      zoom: initialState?.zoom ?? 1,
    };
  }

  /* ------------------------------------------------------------------ */
  /* State                                                              */
  /* ------------------------------------------------------------------ */

  getState(): ViewportState {
    return { ...this.state };
  }

  setState(state: Partial<ViewportState>): void {
    if (state.zoom !== undefined) {
      this.state.zoom = this.clampZoom(state.zoom);
    }
    if (state.x !== undefined) this.state.x = state.x;
    if (state.y !== undefined) this.state.y = state.y;
  }

  /* ------------------------------------------------------------------ */
  /* Pan & Zoom                                                         */
  /* ------------------------------------------------------------------ */

  pan(deltaX: number, deltaY: number): void {
    this.state.x += deltaX / this.state.zoom;
    this.state.y += deltaY / this.state.zoom;
  }

  zoomToPoint(newZoom: number, screenPoint: Point): void {
    const clampedZoom = this.clampZoom(newZoom);

    // World point under cursor before zoom
    const worldPoint = this.screenToWorld(screenPoint);

    // Apply zoom
    this.state.zoom = clampedZoom;

    // Where that world point ends up after zoom
    const newScreenPoint = this.worldToScreen(worldPoint);

    // Adjust viewport to keep cursor anchored
    const dx = screenPoint.x - newScreenPoint.x;
    const dy = screenPoint.y - newScreenPoint.y;

    this.state.x += dx / this.state.zoom;
    this.state.y += dy / this.state.zoom;
  }

  zoomBy(factor: number, centerPoint?: Point): void {
    const targetZoom = this.state.zoom * factor;
    if (centerPoint) {
      this.zoomToPoint(targetZoom, centerPoint);
    } else {
      this.state.zoom = this.clampZoom(targetZoom);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Coordinate Transforms                                              */
  /* ------------------------------------------------------------------ */

  worldToScreen(worldPoint: Point): Point {
    return {
      x: (worldPoint.x - this.state.x) * this.state.zoom,
      y: (worldPoint.y - this.state.y) * this.state.zoom,
    };
  }

  screenToWorld(screenPoint: Point): Point {
    return {
      x: screenPoint.x / this.state.zoom + this.state.x,
      y: screenPoint.y / this.state.zoom + this.state.y,
    };
  }

  /**
   * Canvas transform for world → screen conversion
   *
   * IMPORTANT:
   * Canvas applies transforms right-to-left.
   * To achieve: (world - viewport) * zoom
   * we must apply:
   *   scale → translate
   */
  getTransform(): DOMMatrix {
    const { x, y, zoom } = this.state;
    const m = new DOMMatrix();
    m.scaleSelf(zoom, zoom);
    m.translateSelf(-x, -y);
    return m;
  }

  /* ------------------------------------------------------------------ */
  /* Utilities                                                          */
  /* ------------------------------------------------------------------ */

  reset(): void {
    this.state = { x: 0, y: 0, zoom: 1 };
  }

  getZoom(): number {
    return this.state.zoom;
  }

  getPosition(): Point {
    return { x: this.state.x, y: this.state.y };
  }

  private clampZoom(z: number): number {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
  }
}
