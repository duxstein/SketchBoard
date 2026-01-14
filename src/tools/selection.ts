/**
 * Selection Tool
 *
 * Tool for selecting and manipulating existing shapes.
 * Placeholder implementation - full functionality to be added later.
 */

import type { Tool, ToolContext, PointerEvent, KeyboardEvent } from './types';
import type { ToolResult } from './types';

/**
 * Selection Tool Implementation
 *
 * Placeholder for selection tool functionality.
 */
export class SelectionTool implements Tool {
  id = 'selection';
  name = 'Selection';
  shortcut = 'V';

  onPointerDown(_event: PointerEvent, _context: ToolContext): ToolResult {
    // TODO: Implement shape selection
    return null;
  }

  onPointerMove(_event: PointerEvent, _context: ToolContext): ToolResult {
    // TODO: Implement selection dragging
    return null;
  }

  onPointerUp(_event: PointerEvent, _context: ToolContext): ToolResult {
    // TODO: Finalize selection
    return null;
  }

  onKeyDown(_event: KeyboardEvent, _context: ToolContext): ToolResult {
    // TODO: Handle delete key, etc.
    return null;
  }
}

/**
 * Create a new selection tool instance
 */
export function createSelectionTool(): SelectionTool {
  return new SelectionTool();
}
