/**
 * Pen Tool
 *
 * Freehand drawing tool.
 * Creates PenShape objects as the user draws.
 */

import type { Tool, ToolContext, PointerEvent, KeyboardEvent } from './types';
import type { ToolResult } from './types';
import type { PenShape, Point, ShapeStyle } from '@/canvas/types';
import { generateId } from '@/utils/id';
import { createShapeMetadata, updateShapeMetadata } from './base';

/**
 * Pen Tool State
 *
 * Internal state for the pen tool during a drawing session.
 * This state is managed by the tool itself, not externally.
 */
interface PenToolState {
  /** Current shape being drawn */
  currentShape: PenShape | null;
  /** Shape ID (if updating existing shape) */
  shapeId: string | null;
}

/**
 * Pen Tool Implementation
 *
 * Example tool that demonstrates the tool plugin system.
 * Creates freehand pen strokes as the user drags.
 */
export class PenTool implements Tool {
  id = 'pen';
  name = 'Pen';
  shortcut = 'P';

  /** Internal state for current drawing session */
  private state: PenToolState = {
    currentShape: null,
    shapeId: null,
  };

  /**
   * Default pen style
   */
  private defaultStyle: ShapeStyle = {
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 2,
    lineCap: 'round',
    lineJoin: 'round',
  };

  /**
   * Handle pointer down - start a new stroke
   */
  onPointerDown(event: PointerEvent, context: ToolContext): ToolResult {
    // Create new pen shape
    const shapeId = generateId();
    const shape: PenShape = {
      id: shapeId,
      type: 'pen',
      points: [{ x: event.x, y: event.y }],
      style: this.defaultStyle,
      metadata: createShapeMetadata(context.userId),
      closed: false,
    };

    // Store state for move/up events
    this.state.currentShape = shape;
    this.state.shapeId = shapeId;

    // Return shape creation
    return {
      type: 'create',
      shape,
    };
  }

  /**
   * Handle pointer move - add point to current stroke
   */
  onPointerMove(event: PointerEvent, _context: ToolContext): ToolResult {
    // If no active stroke, do nothing
    if (!this.state.currentShape || !this.state.shapeId) {
      return null;
    }

    // Add new point to the stroke
    const newPoint: Point = { x: event.x, y: event.y };
    const updatedShape: PenShape = {
      ...this.state.currentShape,
      points: [...this.state.currentShape.points, newPoint],
      metadata: updateShapeMetadata(this.state.currentShape.metadata),
    };

    // Update internal state
    this.state.currentShape = updatedShape;

    // Return shape update
    return {
      type: 'update',
      shapeId: this.state.shapeId,
      shape: updatedShape,
    };
  }

  /**
   * Handle pointer up - finalize the stroke
   */
  onPointerUp(event: PointerEvent, _context: ToolContext): ToolResult {
    // If no active stroke, do nothing
    if (!this.state.currentShape || !this.state.shapeId) {
      return null;
    }

    // Add final point if different from last point
    const lastPoint =
      this.state.currentShape.points[this.state.currentShape.points.length - 1];
    const finalPoint: Point = { x: event.x, y: event.y };

    let finalShape = this.state.currentShape;
    const shapeId = this.state.shapeId;

    // Only add point if it's different (avoid duplicate points)
    if (
      !lastPoint ||
      lastPoint.x !== finalPoint.x ||
      lastPoint.y !== finalPoint.y
    ) {
      finalShape = {
        ...this.state.currentShape,
        points: [...this.state.currentShape.points, finalPoint],
        metadata: updateShapeMetadata(this.state.currentShape.metadata),
      };
    }

    // Clear state
    this.state.currentShape = null;
    this.state.shapeId = null;

    // Return final shape update
    return {
      type: 'update',
      shapeId: shapeId!,
      shape: finalShape,
    };
  }

  /**
   * Handle keyboard events
   *
   * Escape cancels current stroke (if any)
   */
  onKeyDown(event: KeyboardEvent, _context: ToolContext): ToolResult {
    // Escape cancels current stroke
    if (
      event.key === 'Escape' &&
      this.state.currentShape &&
      this.state.shapeId
    ) {
      const shapeId = this.state.shapeId;
      this.state.currentShape = null;
      this.state.shapeId = null;

      return {
        type: 'delete',
        shapeId,
      };
    }

    return null;
  }
}

/**
 * Create a new pen tool instance
 *
 * Factory function for creating pen tools.
 * Each instance has its own state.
 */
export function createPenTool(): PenTool {
  return new PenTool();
}
