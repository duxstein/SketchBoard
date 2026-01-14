/**
 * Tool Manager
 *
 * Routes pointer and keyboard events to the active tool.
 * Handles tool activation and hot-swapping.
 *
 * The ToolManager is the bridge between UI events and tools.
 * It ensures exactly one tool is active at a time and routes
 * all events to that tool.
 */

import { useToolStore } from '@/store/tool';
import type {
  Tool,
  ToolContext,
  PointerEvent,
  KeyboardEvent,
  ToolResult,
} from './types';
import type { Viewport } from '@/canvas/viewport';

/**
 * Tool Manager
 *
 * Manages tool activation and event routing.
 * Hot-swappable: can change active tool at any time.
 */
export class ToolManager {
  private viewport: Viewport;
  private userId: string;

  constructor(viewport: Viewport, userId: string) {
    this.viewport = viewport;
    this.userId = userId;
  }

  /**
   * Get the currently active tool
   */
  getActiveTool(): Tool | null {
    return useToolStore.getState().activeTool;
  }

  /**
   * Set the active tool by ID
   *
   * Hot-swaps the active tool. The previous tool's state
   * is preserved (tools manage their own state).
   */
  setActiveTool(toolId: string): void {
    useToolStore.getState().setActiveTool(toolId);
  }

  /**
   * Get active tool ID
   */
  getActiveToolId(): string | null {
    return useToolStore.getState().activeToolId;
  }

  /**
   * Check if a tool is active
   */
  isToolActive(toolId: string): boolean {
    return useToolStore.getState().isToolActive(toolId);
  }

  /**
   * Handle pointer down event
   *
   * Routes the event to the active tool.
   * Converts screen coordinates to world coordinates.
   *
   * @param screenX - Screen X coordinate
   * @param screenY - Screen Y coordinate
   * @param nativeEvent - Native pointer event (for modifiers, button, etc.)
   * @returns Tool result (create/update/delete shape, or null)
   */
  handlePointerDown(
    screenX: number,
    screenY: number,
    nativeEvent: {
      button?: number;
      shiftKey?: boolean;
      ctrlKey?: boolean;
      altKey?: boolean;
      metaKey?: boolean;
    }
  ): ToolResult | Promise<ToolResult> {
    const tool = this.getActiveTool();
    if (!tool) {
      return null;
    }

    // Convert screen coordinates to world coordinates
    const worldPoint = this.viewport.screenToWorld({
      x: screenX,
      y: screenY,
    });

    // Create pointer event
    const event: PointerEvent = {
      x: worldPoint.x,
      y: worldPoint.y,
      screenX,
      screenY,
      button: nativeEvent.button ?? 0,
      modifiers: {
        shift: nativeEvent.shiftKey ?? false,
        ctrl: nativeEvent.ctrlKey ?? false,
        alt: nativeEvent.altKey ?? false,
        meta: nativeEvent.metaKey ?? false,
      },
    };

    // Create tool context
    const context: ToolContext = {
      viewport: this.viewport,
      userId: this.userId,
    };

    // Route to active tool
    return tool.onPointerDown(event, context);
  }

  /**
   * Handle pointer move event
   *
   * Routes the event to the active tool.
   * Converts screen coordinates to world coordinates.
   */
  handlePointerMove(
    screenX: number,
    screenY: number,
    nativeEvent: {
      shiftKey?: boolean;
      ctrlKey?: boolean;
      altKey?: boolean;
      metaKey?: boolean;
    }
  ): ToolResult | Promise<ToolResult> {
    const tool = this.getActiveTool();
    if (!tool) {
      return null;
    }

    // Convert screen coordinates to world coordinates
    const worldPoint = this.viewport.screenToWorld({
      x: screenX,
      y: screenY,
    });

    // Create pointer event
    const event: PointerEvent = {
      x: worldPoint.x,
      y: worldPoint.y,
      screenX,
      screenY,
      button: 0, // Move events don't have a button
      modifiers: {
        shift: nativeEvent.shiftKey ?? false,
        ctrl: nativeEvent.ctrlKey ?? false,
        alt: nativeEvent.altKey ?? false,
        meta: nativeEvent.metaKey ?? false,
      },
    };

    // Create tool context
    const context: ToolContext = {
      viewport: this.viewport,
      userId: this.userId,
    };

    // Route to active tool
    return tool.onPointerMove(event, context);
  }

  /**
   * Handle pointer up event
   *
   * Routes the event to the active tool.
   * Converts screen coordinates to world coordinates.
   */
  handlePointerUp(
    screenX: number,
    screenY: number,
    nativeEvent: {
      button?: number;
      shiftKey?: boolean;
      ctrlKey?: boolean;
      altKey?: boolean;
      metaKey?: boolean;
    }
  ): ToolResult | Promise<ToolResult> {
    const tool = this.getActiveTool();
    if (!tool) {
      return null;
    }

    // Convert screen coordinates to world coordinates
    const worldPoint = this.viewport.screenToWorld({
      x: screenX,
      y: screenY,
    });

    // Create pointer event
    const event: PointerEvent = {
      x: worldPoint.x,
      y: worldPoint.y,
      screenX,
      screenY,
      button: nativeEvent.button ?? 0,
      modifiers: {
        shift: nativeEvent.shiftKey ?? false,
        ctrl: nativeEvent.ctrlKey ?? false,
        alt: nativeEvent.altKey ?? false,
        meta: nativeEvent.metaKey ?? false,
      },
    };

    // Create tool context
    const context: ToolContext = {
      viewport: this.viewport,
      userId: this.userId,
    };

    // Route to active tool
    return tool.onPointerUp(event, context);
  }

  /**
   * Handle keyboard event
   *
   * Routes the event to the active tool (if it supports keyboard input).
   */
  handleKeyDown(nativeEvent: {
    key: string;
    code: string;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  }): ToolResult | Promise<ToolResult> | null {
    const tool = this.getActiveTool();
    if (!tool || !tool.onKeyDown) {
      return null;
    }

    // Create keyboard event
    const event: KeyboardEvent = {
      key: nativeEvent.key,
      code: nativeEvent.code,
      modifiers: {
        shift: nativeEvent.shiftKey ?? false,
        ctrl: nativeEvent.ctrlKey ?? false,
        alt: nativeEvent.altKey ?? false,
        meta: nativeEvent.metaKey ?? false,
      },
    };

    // Create tool context
    const context: ToolContext = {
      viewport: this.viewport,
      userId: this.userId,
    };

    // Route to active tool
    return tool.onKeyDown(event, context);
  }

  /**
   * Update viewport reference
   *
   * Called when viewport changes (e.g., after resize).
   */
  setViewport(viewport: Viewport): void {
    this.viewport = viewport;
  }

  /**
   * Update user ID
   *
   * Called when user changes (e.g., login).
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }
}
