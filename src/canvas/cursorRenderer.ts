/**
 * Cursor Renderer
 *
 * Renders remote user cursors on the canvas.
 * This is separate from shape rendering and does not affect canvas state.
 *
 * Cursors are ephemeral UI elements that provide presence awareness.
 */

import type { Point } from './types';
import type { Viewport } from './viewport';

/**
 * Cursor Data
 *
 * Data for rendering a single remote cursor.
 */
export interface CursorData {
  /** Cursor position in world coordinates */
  position: Point;
  /** User identifier */
  userId: string;
  /** User display name */
  userName?: string;
  /** User color (for cursor) */
  userColor: string;
  /** Active tool ID (for tool indicator) */
  activeToolId?: string | null;
}

/**
 * Render remote cursors
 *
 * Pure function that renders cursors on the canvas.
 * Does not affect canvas state - only draws UI elements.
 *
 * @param ctx - Canvas 2D rendering context (with viewport transform applied)
 * @param viewport - Viewport for coordinate transformations
 * @param cursors - Array of cursor data to render
 */
export function renderCursors(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  cursors: CursorData[]
): void {
  ctx.save();

  // Reset transform to screen coordinates for cursor rendering
  // Cursors should be rendered at a fixed screen size regardless of zoom
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  for (const cursor of cursors) {
    renderCursor(ctx, viewport, cursor);
  }

  ctx.restore();
}

/**
 * Render a single cursor
 *
 * @param ctx - Canvas context (in screen coordinates)
 * @param viewport - Viewport for coordinate conversion
 * @param cursor - Cursor data
 */
function renderCursor(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  cursor: CursorData
): void {
  // Convert world coordinates to screen coordinates
  const screenPos = viewport.worldToScreen(cursor.position);

  // Cursor size in screen pixels (fixed, doesn't scale with zoom)
  const cursorSize = 20;
  const toolIndicatorSize = 8;

  // Draw cursor
  ctx.save();

  // Cursor color (use user color or default)
  ctx.strokeStyle = cursor.userColor || '#3b82f6';
  ctx.fillStyle = cursor.userColor || '#3b82f6';
  ctx.lineWidth = 2;

  // Draw cursor pointer (arrow shape)
  ctx.beginPath();
  ctx.moveTo(screenPos.x, screenPos.y);
  ctx.lineTo(screenPos.x - cursorSize * 0.6, screenPos.y - cursorSize * 0.3);
  ctx.lineTo(screenPos.x - cursorSize * 0.3, screenPos.y - cursorSize * 0.3);
  ctx.lineTo(screenPos.x - cursorSize * 0.3, screenPos.y - cursorSize);
  ctx.lineTo(screenPos.x + cursorSize * 0.3, screenPos.y - cursorSize);
  ctx.lineTo(screenPos.x + cursorSize * 0.3, screenPos.y - cursorSize * 0.3);
  ctx.lineTo(screenPos.x + cursorSize * 0.6, screenPos.y - cursorSize * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw tool indicator (small circle)
  if (cursor.activeToolId) {
    ctx.fillStyle = cursor.userColor || '#3b82f6';
    ctx.beginPath();
    ctx.arc(
      screenPos.x,
      screenPos.y - cursorSize - toolIndicatorSize,
      toolIndicatorSize,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }

  // Draw user name label (optional)
  if (cursor.userName) {
    ctx.fillStyle = '#000000';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(
      cursor.userName,
      screenPos.x + cursorSize * 0.5,
      screenPos.y - cursorSize * 0.5
    );
  }

  ctx.restore();
}
