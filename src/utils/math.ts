/**
 * Math Utilities
 *
 * Coordinate transformations, geometry calculations, vector math.
 * Must be deterministic and well-commented.
 */

import type { Point } from '@/canvas/types';

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared distance (faster, useful for comparisons)
 */
export function distanceSquared(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Check if a point is within a rectangle
 */
export function pointInRect(
  point: Point,
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  return (
    point.x >= x &&
    point.x <= x + width &&
    point.y >= y &&
    point.y <= y + height
  );
}

/**
 * Get bounding rectangle from two points
 */
export function getBounds(
  p1: Point,
  p2: Point
): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const x = Math.min(p1.x, p2.x);
  const y = Math.min(p1.y, p2.y);
  const width = Math.abs(p2.x - p1.x);
  const height = Math.abs(p2.y - p1.y);
  return { x, y, width, height };
}
