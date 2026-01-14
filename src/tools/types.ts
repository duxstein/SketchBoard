/**
 * Tool Types
 *
 * Defines the tool interface contract that all tools must implement.
 * Tools are plugins - adding a new tool does not require modifying existing tools.
 */

import type { Shape } from '@/canvas/types';
import type { Viewport } from '@/canvas/viewport';

/**
 * Pointer Event
 *
 * Represents a pointer (mouse/touch) event in world coordinates.
 */
export interface PointerEvent {
  /** World X coordinate */
  x: number;
  /** World Y coordinate */
  y: number;
  /** Screen X coordinate (for reference) */
  screenX: number;
  /** Screen Y coordinate (for reference) */
  screenY: number;
  /** Pointer button (0 = left, 1 = middle, 2 = right) */
  button: number;
  /** Modifier keys (shift, ctrl, alt, meta) */
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };
}

/**
 * Keyboard Event
 *
 * Represents a keyboard event.
 */
export interface KeyboardEvent {
  /** Key code (e.g., 'Escape', 'Delete', 'Enter') */
  key: string;
  /** Key code (numeric) */
  code: string;
  /** Modifier keys */
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };
}

/**
 * Tool Context
 *
 * Provides tools with access to viewport and utilities.
 * Tools receive this context but should not mutate it.
 */
export interface ToolContext {
  /** Viewport instance for coordinate transformations */
  viewport: Viewport;
  /** Current user ID for shape attribution */
  userId: string;
}

/**
 * Tool Result
 *
 * Result of a tool operation. Tools can:
 * - Create new shapes
 * - Update existing shapes
 * - Delete shapes
 * - Do nothing (return null)
 */
export type ToolResult =
  | {
      type: 'create';
      shape: Shape;
    }
  | {
      type: 'update';
      shapeId: string;
      shape: Shape;
    }
  | {
      type: 'delete';
      shapeId: string;
    }
  | null;

/**
 * Tool Interface
 *
 * All tools must implement this interface.
 * Tools are stateless plugins - they receive events and return results.
 *
 * Key principles:
 * - Tools work with world coordinates (via viewport)
 * - Tools return shape data, never draw directly
 * - Tools are stateless (state managed externally)
 * - Tools are composable (can be combined/swapped)
 */
export interface Tool {
  /** Unique tool identifier */
  id: string;
  /** Human-readable tool name */
  name: string;
  /** Tool icon/keyboard shortcut (optional) */
  shortcut?: string;

  /**
   * Handle pointer down event
   *
   * Called when user presses mouse/touch down on canvas.
   * Returns a shape creation/update, or null if no action.
   *
   * @param event - Pointer event in world coordinates
   * @param context - Tool context (viewport, userId, etc.)
   * @returns Tool result (create/update/delete shape, or null)
   */
  onPointerDown(
    event: PointerEvent,
    context: ToolContext
  ): ToolResult | Promise<ToolResult>;

  /**
   * Handle pointer move event
   *
   * Called when user moves mouse/touch while pressed.
   * Returns shape updates (typically updating the shape being drawn).
   *
   * @param event - Pointer event in world coordinates
   * @param context - Tool context
   * @returns Tool result (usually update, or null)
   */
  onPointerMove(
    event: PointerEvent,
    context: ToolContext
  ): ToolResult | Promise<ToolResult>;

  /**
   * Handle pointer up event
   *
   * Called when user releases mouse/touch.
   * Typically finalizes the shape being drawn.
   *
   * @param event - Pointer event in world coordinates
   * @param context - Tool context
   * @returns Tool result (finalize shape, or null)
   */
  onPointerUp(
    event: PointerEvent,
    context: ToolContext
  ): ToolResult | Promise<ToolResult>;

  /**
   * Handle keyboard event (optional)
   *
   * Called when user presses a key while tool is active.
   * Useful for shortcuts, cancellation, etc.
   *
   * @param event - Keyboard event
   * @param context - Tool context
   * @returns Tool result, or null if key not handled
   */
  onKeyDown?(
    event: KeyboardEvent,
    context: ToolContext
  ): ToolResult | Promise<ToolResult>;
}
