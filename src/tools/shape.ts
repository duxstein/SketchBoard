/**
 * Shape Tool
 *
 * Basic shape tool (rectangle / ellipse).
 * Placeholder implementation - full functionality to be added later.
 */

import type { Tool, ToolContext, PointerEvent, KeyboardEvent } from './types';
import type { ToolResult } from './types';

/**
 * Shape Tool Implementation
 *
 * Placeholder for shape tool functionality.
 * Will support rectangle and ellipse creation.
 */
export class ShapeTool implements Tool {
  id = 'shape';
  name = 'Shape';
  shortcut = 'S';

  onPointerDown(_event: PointerEvent, _context: ToolContext): ToolResult {
    // TODO: Implement shape creation (rectangle/ellipse)
    return null;
  }

  onPointerMove(_event: PointerEvent, _context: ToolContext): ToolResult {
    // TODO: Update shape while dragging
    return null;
  }

  onPointerUp(_event: PointerEvent, _context: ToolContext): ToolResult {
    // TODO: Finalize shape
    return null;
  }

  onKeyDown(_event: KeyboardEvent, _context: ToolContext): ToolResult {
    // TODO: Handle escape to cancel
    return null;
  }
}

/**
 * Create a new shape tool instance
 */
export function createShapeTool(): ShapeTool {
  return new ShapeTool();
}
