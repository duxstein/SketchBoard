/**
 * Viewport Culling
 *
 * Determines which shapes are visible in the current viewport.
 * Prevents rendering off-screen shapes for performance.
 *
 * Tradeoff: Adds computation overhead, but significantly reduces
 * overdraw for large boards with many shapes.
 *
 * Bounding Box Computation:
 * - Bounding boxes are computed on-the-fly during culling
 * - PenShape: O(points) - iterates through point array
 * - Rectangle/Ellipse/Text: O(1) - simple calculations
 * - This approach is acceptable for v1 and remains the default
 *
 * Caching Strategy:
 * - Bounding box caching was considered but deferred (see culling.md)
 * - Rationale: Limited benefit, adds complexity, current performance sufficient
 * - Can be revisited if profiling shows bounding box computation is a bottleneck
 */

import type { Shape } from './types';
import type { Viewport } from './viewport';
import {
  isPenShape,
  isRectangleShape,
  isEllipseShape,
  isTextShape,
} from './types';

/**
 * Get shape bounding box in world coordinates
 *
 * Calculates the axis-aligned bounding box (AABB) for a shape.
 * Used for viewport culling.
 *
 * Performance:
 * - PenShape: O(points) - linear scan through point array
 * - RectangleShape: O(1) - direct calculation
 * - EllipseShape: O(1) - direct calculation
 * - TextShape: O(1) - approximate calculation
 *
 * Called once per shape per frame during culling.
 * Caching was considered but deferred (see culling.md for analysis).
 */
function getShapeBounds(shape: Shape): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} | null {
  if (isPenShape(shape)) {
    if (shape.points.length === 0) {
      return null;
    }
    let minX = shape.points[0]?.x ?? Infinity;
    let minY = shape.points[0]?.y ?? Infinity;
    let maxX = minX;
    let maxY = minY;

    for (const point of shape.points) {
      if (!point) continue;
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return { minX, minY, maxX, maxY };
  }

  if (isRectangleShape(shape)) {
    return {
      minX: shape.x,
      minY: shape.y,
      maxX: shape.x + shape.width,
      maxY: shape.y + shape.height,
    };
  }

  if (isEllipseShape(shape)) {
    return {
      minX: shape.centerX - shape.radiusX,
      minY: shape.centerY - shape.radiusY,
      maxX: shape.centerX + shape.radiusX,
      maxY: shape.centerY + shape.radiusY,
    };
  }

  if (isTextShape(shape)) {
    // Text bounds are approximate (would need text metrics for exact)
    // For now, use a reasonable estimate
    const estimatedWidth = shape.text.length * (shape.fontSize ?? 16) * 0.6;
    const estimatedHeight = shape.fontSize ?? 16;
    return {
      minX: shape.x,
      minY: shape.y,
      maxX: shape.x + estimatedWidth,
      maxY: shape.y + estimatedHeight,
    };
  }

  return null;
}

/**
 * Check if shape is visible in viewport
 *
 * Uses viewport bounds and shape bounding box to determine visibility.
 * Includes padding to account for shapes partially on-screen.
 *
 * @param shape - Shape to check
 * @param viewport - Viewport instance
 * @param canvasSize - Canvas size in screen pixels
 * @param padding - Padding in world units (for shapes partially visible)
 * @returns true if shape is visible, false otherwise
 */
export function isShapeVisible(
  shape: Shape,
  viewport: Viewport,
  canvasSize?: { width: number; height: number },
  padding: number = 100
): boolean {
  const bounds = getShapeBounds(shape);
  if (!bounds) {
    return false;
  }

  // Get viewport bounds in world coordinates
  const viewportState = viewport.getState();

  // Use provided canvas size or default (fallback for when not available)
  const size = canvasSize ?? { width: 1920, height: 1080 };

  // Convert viewport screen bounds to world bounds
  // Screen (0,0) maps to world (viewport.x, viewport.y)
  // Screen (width, height) maps to world (viewport.x + width/zoom, viewport.y + height/zoom)
  const worldWidth = size.width / viewportState.zoom;
  const worldHeight = size.height / viewportState.zoom;

  const viewportMinX = viewportState.x - padding;
  const viewportMinY = viewportState.y - padding;
  const viewportMaxX = viewportState.x + worldWidth + padding;
  const viewportMaxY = viewportState.y + worldHeight + padding;

  // Check if shape bounds overlap with viewport bounds
  return !(
    bounds.maxX < viewportMinX ||
    bounds.minX > viewportMaxX ||
    bounds.maxY < viewportMinY ||
    bounds.minY > viewportMaxY
  );
}

/**
 * Filter shapes by viewport visibility
 *
 * Returns only shapes that are visible in the current viewport.
 * This significantly reduces rendering work for large boards.
 *
 * Tradeoff: Culling adds O(n) computation per frame, but reduces
 * rendering cost from O(n) to O(visible). For boards with >100 shapes,
 * culling provides net performance gain.
 *
 * @param shapes - Array of shapes to filter
 * @param viewport - Viewport instance
 * @param canvasSize - Canvas size in screen pixels (optional)
 * @returns Filtered array of visible shapes
 */
export function cullShapes(
  shapes: Shape[],
  viewport: Viewport,
  canvasSize?: { width: number; height: number }
): Shape[] {
  return shapes.filter(shape => isShapeVisible(shape, viewport, canvasSize));
}
