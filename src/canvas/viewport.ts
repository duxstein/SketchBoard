/**
 * Viewport Management
 *
 * Handles world-to-screen coordinate transformations,
 * pan, zoom, and viewport state.
 *
 * Coordinate System:
 * - viewport.x, viewport.y: World coordinates of the screen's top-left corner (0,0)
 * - zoom: Scale factor (1.0 = 100%, 2.0 = 200%, etc.)
 * - World coordinates are infinite and independent of screen size
 * - Screen coordinates are pixel positions on the canvas element
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
   * Pan the viewport by a delta in screen coordinates
   *
   * Math:
   * - User drags mouse by (deltaX, deltaY) screen pixels
   * - We need to move the viewport in world space
   * - Screen delta / zoom = world delta
   * - Example: zoom=2, drag 10px screen = 5px world movement
   */
  pan(deltaX: number, deltaY: number): void {
    // Convert screen pixel movement to world coordinate movement
    // At zoom=2, 1 screen pixel = 0.5 world units
    this.state.x += deltaX / this.state.zoom;
    this.state.y += deltaY / this.state.zoom;
  }

  /**
   * Set zoom level while keeping a specific screen point fixed
   * (Zoom anchors to cursor position)
   *
   * Math derivation:
   * 1. Before zoom: screen point p maps to world point w
   *    w = p/zoom + viewport.x  (from screenToWorld)
   *
   * 2. After zoom to newZoom: world point w should map to screen point p
   *    p = (w - newViewport.x) * newZoom  (from worldToScreen)
   *
   * 3. Substitute w from step 1:
   *    p = ((p/zoom + viewport.x) - newViewport.x) * newZoom
   *
   * 4. Solve for newViewport.x:
   *    p = (p/zoom + viewport.x - newViewport.x) * newZoom
   *    p = p * newZoom/zoom + (viewport.x - newViewport.x) * newZoom
   *    p - p * newZoom/zoom = (viewport.x - newViewport.x) * newZoom
   *    p * (1 - newZoom/zoom) = (viewport.x - newViewport.x) * newZoom
   *    newViewport.x = viewport.x - p * (1 - newZoom/zoom) / newZoom
   *    newViewport.x = viewport.x - p * (1/newZoom - 1/zoom)
   *
   * 5. Simplified form:
   *    newViewport.x = viewport.x + p * (1/zoom - 1/newZoom)
   *
   * This ensures the world point under the cursor stays fixed on screen.
   */
  zoomToPoint(newZoom: number, screenPoint: Point): void {
    const clampedZoom = Math.max(0.1, Math.min(10, newZoom));

    // Get the world coordinates of the point under cursor before zoom changes
    // This is the "anchor point" that must stay fixed
    const worldPoint = this.screenToWorld(screenPoint);

    // Update zoom level
    this.state.zoom = clampedZoom;

    // Calculate where that world point would appear on screen with new zoom
    // (using old viewport position)
    const newScreenPoint = this.worldToScreen(worldPoint);

    // Calculate the difference between desired and actual screen position
    // This tells us how much to adjust the viewport
    const deltaX = screenPoint.x - newScreenPoint.x;
    const deltaY = screenPoint.y - newScreenPoint.y;

    // Adjust viewport to compensate
    // Convert screen delta to world delta, then add to viewport
    // This is equivalent to: viewport.x += deltaX / newZoom
    this.state.x += deltaX / this.state.zoom;
    this.state.y += deltaY / this.state.zoom;

    // Verification: After this adjustment, worldPoint should map to screenPoint
    // worldToScreen(worldPoint) should equal screenPoint
  }

  /**
   * Zoom by a multiplicative factor
   *
   * @param factor - Zoom multiplier (1.1 = 10% zoom in, 0.9 = 10% zoom out)
   * @param centerPoint - Optional screen point to zoom towards (defaults to center)
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
   * Math:
   * - viewport.x is the world X coordinate of screen X=0
   * - To find screen position of world point w:
   *   1. Calculate offset from viewport origin: (w.x - viewport.x)
   *   2. Scale by zoom to get screen pixels: (w.x - viewport.x) * zoom
   *
   * Example:
   * - viewport.x = 100, zoom = 2
   * - World point (150, 200)
   * - Screen X = (150 - 100) * 2 = 50 * 2 = 100 pixels
   *
   * This is the forward transformation: world → screen
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
   * Math (inverse of worldToScreen):
   * - Screen point s maps to world point w
   * - From worldToScreen: s = (w - viewport) * zoom
   * - Solving for w: w = s / zoom + viewport
   *
   * Example:
   * - viewport.x = 100, zoom = 2
   * - Screen point (100, 200)
   * - World X = 100 / 2 + 100 = 50 + 100 = 150
   *
   * This is the inverse transformation: screen → world
   * Used for converting mouse/pointer events to world coordinates
   */
  screenToWorld(screenPoint: Point): Point {
    return {
      x: screenPoint.x / this.state.zoom + this.state.x,
      y: screenPoint.y / this.state.zoom + this.state.y,
    };
  }

  /**
   * Get the transformation matrix for canvas context
   *
   * This matrix transforms world coordinates to screen coordinates when applied
   * to the canvas context. It must match the worldToScreen() function exactly.
   *
   * Transformation order (applied right-to-left in canvas):
   * 1. Scale by zoom (world units → screen pixels)
   * 2. Translate by -viewport (move world origin to viewport position)
   *
   * Matrix form:
   * [zoom  0    -viewport.x * zoom]
   * [0     zoom -viewport.y * zoom]
   * [0     0     1                ]
   *
   * However, canvas applies transforms in reverse order, so we:
   * 1. Translate by -viewport (moves world point at viewport.x to origin)
   * 2. Scale by zoom (scales from origin)
   *
   * Verification:
   * - World point at viewport.x should map to screen 0
   * - After translate(-viewport.x): becomes 0
   * - After scale(zoom): stays 0 ✓
   *
   * - World point at viewport.x + 100 should map to screen 100*zoom
   * - After translate: becomes 100
   * - After scale: becomes 100*zoom ✓
   */
  getTransform(): DOMMatrix {
    const matrix = new DOMMatrix();
    // Step 1: Translate world origin to viewport position
    // This makes world point at viewport.x map to screen 0
    matrix.translateSelf(-this.state.x, -this.state.y);
    // Step 2: Scale by zoom factor
    // This converts world units to screen pixels
    matrix.scaleSelf(this.state.zoom, this.state.zoom);
    return matrix;
  }

  /**
   * Reset viewport to origin with 1:1 zoom
   */
  reset(): void {
    this.state = { x: 0, y: 0, zoom: 1.0 };
  }

  /**
   * Get zoom level
   */
  getZoom(): number {
    return this.state.zoom;
  }

  /**
   * Get viewport position in world coordinates
   */
  getPosition(): Point {
    return { x: this.state.x, y: this.state.y };
  }
}
