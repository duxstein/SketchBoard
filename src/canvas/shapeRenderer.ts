/**
 * Shape Renderer
 *
 * Pure function for rendering shapes deterministically.
 * No side effects, no state mutation - critical for multiplayer correctness.
 *
 * The same shapes + viewport always produce the same visual output.
 */

import type {
  Shape,
  PenShape,
  RectangleShape,
  EllipseShape,
  TextShape,
} from './types';
import {
  isPenShape,
  isRectangleShape,
  isEllipseShape,
  isTextShape,
} from './types';
import type { Viewport } from './viewport';

/**
 * Render an array of shapes to a canvas context
 *
 * This is a pure function - given the same inputs, it always produces
 * the same visual output. This property is essential for:
 * - Multiplayer synchronization (all clients render identically)
 * - Deterministic testing
 * - Time-travel debugging
 *
 * @param ctx - Canvas 2D rendering context (will be transformed by this function)
 * @param viewport - Viewport instance for coordinate transformations
 * @param shapes - Array of shapes to render (in world coordinates)
 *
 * Side effects: Only draws to canvas context (no state mutations)
 */
export function renderShapes(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  shapes: Shape[]
): void {
  // Save context state before rendering
  ctx.save();

  // Apply viewport transformation
  // This transforms world coordinates to screen coordinates
  const transform = viewport.getTransform();
  ctx.setTransform(transform);

  // Render each shape in order
  // Order matters for z-index (later shapes appear on top)
  for (const shape of shapes) {
    renderShape(ctx, shape);
  }

  // Restore context state
  ctx.restore();
}

/**
 * Render a single shape
 *
 * Pure function that renders a shape based on its type and properties.
 * All coordinates are in world space (viewport transform already applied).
 *
 * @param ctx - Canvas 2D rendering context (with viewport transform applied)
 * @param shape - Shape to render
 */
function renderShape(ctx: CanvasRenderingContext2D, shape: Shape): void {
  // Save context state for this shape
  ctx.save();

  try {
    // Apply shape-specific style
    applyShapeStyle(ctx, shape.style);

    // Render based on shape type
    if (isPenShape(shape)) {
      renderPenShape(ctx, shape);
    } else if (isRectangleShape(shape)) {
      renderRectangleShape(ctx, shape);
    } else if (isEllipseShape(shape)) {
      renderEllipseShape(ctx, shape);
    } else if (isTextShape(shape)) {
      renderTextShape(ctx, shape);
    }
  } catch (error) {
    // Log error but don't crash - continue rendering other shapes
    console.error(`Error rendering shape ${shape.id}:`, error);
  } finally {
    // Always restore context state
    ctx.restore();
  }
}

/**
 * Apply shape style to canvas context
 *
 * Sets all style properties from ShapeStyle to the canvas context.
 * This ensures consistent rendering across all shape types.
 */
function applyShapeStyle(
  ctx: CanvasRenderingContext2D,
  style: Shape['style']
): void {
  // Stroke properties
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = style.strokeWidth;
  ctx.lineCap = style.lineCap ?? 'round';
  ctx.lineJoin = style.lineJoin ?? 'round';

  // Fill properties
  ctx.fillStyle = style.fillColor;

  // Opacity (globalAlpha affects both stroke and fill)
  if (style.opacity !== undefined) {
    ctx.globalAlpha = style.opacity;
  } else {
    ctx.globalAlpha = 1.0;
  }
}

/**
 * Render a pen shape (freehand drawing)
 *
 * Draws a path through all points in the shape.
 * Points are in world coordinates (viewport transform already applied).
 */
function renderPenShape(ctx: CanvasRenderingContext2D, shape: PenShape): void {
  if (shape.points.length === 0) {
    return;
  }

  // Start path at first point
  const firstPoint = shape.points[0];
  if (!firstPoint) {
    return;
  }
  ctx.beginPath();
  ctx.moveTo(firstPoint.x, firstPoint.y);

  // Draw line to each subsequent point
  for (let i = 1; i < shape.points.length; i++) {
    const point = shape.points[i];
    if (!point) {
      continue;
    }
    ctx.lineTo(point.x, point.y);
  }

  // Close path if specified
  if (shape.closed) {
    ctx.closePath();
  }

  // Fill first (if fill color is not transparent)
  if (shape.style.fillColor !== 'transparent') {
    ctx.fill();
  }

  // Then stroke
  ctx.stroke();
}

/**
 * Render a rectangle shape
 *
 * Draws an axis-aligned rectangle.
 * Coordinates are in world space (viewport transform already applied).
 */
function renderRectangleShape(
  ctx: CanvasRenderingContext2D,
  shape: RectangleShape
): void {
  // Fill first (if fill color is not transparent)
  if (shape.style.fillColor !== 'transparent') {
    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
  }

  // Then stroke
  ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
}

/**
 * Render an ellipse shape
 *
 * Draws an ellipse (or circle if radiusX === radiusY).
 * Coordinates are in world space (viewport transform already applied).
 */
function renderEllipseShape(
  ctx: CanvasRenderingContext2D,
  shape: EllipseShape
): void {
  ctx.beginPath();

  // Use ellipse() method (more accurate than arc() for non-circular ellipses)
  // Parameters: x, y, radiusX, radiusY, rotation, startAngle, endAngle
  ctx.ellipse(
    shape.centerX,
    shape.centerY,
    shape.radiusX,
    shape.radiusY,
    0, // rotation (axis-aligned)
    0, // start angle
    2 * Math.PI // end angle (full circle)
  );

  // Fill first (if fill color is not transparent)
  if (shape.style.fillColor !== 'transparent') {
    ctx.fill();
  }

  // Then stroke
  ctx.stroke();
}

/**
 * Render a text shape
 *
 * Draws text at the specified position.
 * Coordinates are in world space (viewport transform already applied).
 *
 * Note: Font size is in world units, so it scales with zoom.
 * This ensures text remains readable at all zoom levels.
 */
function renderTextShape(
  ctx: CanvasRenderingContext2D,
  shape: TextShape
): void {
  // Set font properties
  const fontSize = shape.fontSize ?? 16; // Default font size in world units
  const fontFamily = shape.fontFamily ?? 'sans-serif';
  const fontWeight = shape.fontWeight ?? 'normal';
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  // Set text alignment
  ctx.textAlign = shape.textAlign ?? 'left';
  ctx.textBaseline = 'top'; // Anchor point is top-left

  // Set fill color for text (text uses fill, not stroke)
  ctx.fillStyle = shape.style.fillColor;

  // Draw text
  ctx.fillText(shape.text, shape.x, shape.y);
}
