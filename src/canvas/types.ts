/**
 * Canvas Types
 *
 * Type definitions for canvas rendering system.
 */

export interface Point {
  x: number;
  y: number;
}

export interface ViewportState {
  x: number; // World X position (pan)
  y: number; // World Y position (pan)
  zoom: number; // Zoom level (1.0 = 100%)
}

export interface CanvasSize {
  width: number;
  height: number;
}

export type RenderCallback = (ctx: CanvasRenderingContext2D) => void;
