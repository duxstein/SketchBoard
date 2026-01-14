/**
 * Viewport Management
 *
 * Handles world-to-screen coordinate transformations,
 * pan, zoom, and viewport state.
 */

import type { Point, ViewportState } from './types';

export class Viewport {
  private state: ViewportState;

  constructor(initialState?: Partial<ViewportState>) {
    this.state = {
      x: initialState?.x ?? 0,
      y: initialState?.y ?? 0,
      zoom: initialState?.zoom ?? 1.0,
    };
  }

  /**
   * Get current viewport state
   */
  getState(): ViewportState {
    return { ...this.state };
  }

  /**
   * Set viewport state
   */
  setState(state: Partial<ViewportState>): void {
    this.state = {
      ...this.state,
      ...state,
    };
  }

  /**
   * Pan the viewport by delta (in screen coordinates)
   */
  pan(deltaX: number, deltaY: number): void {
    // Pan in world coordinates: screen delta divided by zoom
    this.state.x += deltaX / this.state.zoom;
    this.state.y += deltaY / this.state.zoom;
  }

  /**
   * Set zoom level at a specific screen point (zoom towards that point)
   */
  zoomToPoint(newZoom: number, screenPoint: Point): void {
    const clampedZoom = Math.max(0.1, Math.min(10, newZoom));

    // Get the world point under the cursor before zoom changes
    const worldPoint = this.screenToWorld(screenPoint);

    // Update zoom
    this.state.zoom = clampedZoom;

    // Calculate where that world point should be on screen after zoom
    const newScreenPoint = this.worldToScreen(worldPoint);

    // Adjust pan to keep the point under cursor fixed
    // The difference tells us how much to adjust the viewport
    const deltaX = screenPoint.x - newScreenPoint.x;
    const deltaY = screenPoint.y - newScreenPoint.y;
    this.state.x += deltaX / this.state.zoom;
    this.state.y += deltaY / this.state.zoom;
  }

  /**
   * Zoom by a factor (e.g., 1.1 for 10% zoom in)
   */
  zoomBy(factor: number, centerPoint?: Point): void {
    const newZoom = this.state.zoom * factor;
    if (centerPoint) {
      this.zoomToPoint(newZoom, centerPoint);
    } else {
      this.setState({ zoom: Math.max(0.1, Math.min(10, newZoom)) });
    }
  }

  /**
   * Convert world coordinates to screen coordinates
   *
   * Viewport x,y represents the world position of screen origin (0,0).
   * Transformation: translate by viewport position, then scale by zoom.
   */
  worldToScreen(worldPoint: Point): Point {
    return {
      x: (worldPoint.x - this.state.x) * this.state.zoom,
      y: (worldPoint.y - this.state.y) * this.state.zoom,
    };
  }

  /**
   * Convert screen coordinates to world coordinates
   *
   * Inverse of worldToScreen: divide by zoom, then add viewport position.
   */
  screenToWorld(screenPoint: Point): Point {
    return {
      x: screenPoint.x / this.state.zoom + this.state.x,
      y: screenPoint.y / this.state.zoom + this.state.y,
    };
  }

  /**
   * Get the transformation matrix for canvas context
   * This applies the viewport transformation
   *
   * Transformation order:
   * 1. Translate by negative viewport position (move world origin)
   * 2. Scale by zoom
   * This allows drawing at world coordinates directly
   */
  getTransform(): DOMMatrix {
    const matrix = new DOMMatrix();
    matrix.translateSelf(-this.state.x, -this.state.y);
    matrix.scaleSelf(this.state.zoom, this.state.zoom);
    return matrix;
  }

  /**
   * Reset viewport to origin
   */
  reset(): void {
    this.state = { x: 0, y: 0, zoom: 1.0 };
  }
}
