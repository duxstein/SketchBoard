/**
 * Text Tool
 *
 * Minimal text tool for adding text to canvas.
 * Placeholder implementation - full functionality to be added later.
 */

import type { Tool, ToolContext, PointerEvent, KeyboardEvent } from './types';
import type { ToolResult } from './types';

/**
 * Text Tool Implementation
 *
 * Placeholder for text tool functionality.
 */
export class TextTool implements Tool {
  id = 'text';
  name = 'Text';
  shortcut = 'T';

  onPointerDown(_event: PointerEvent, _context: ToolContext): ToolResult {
    // TODO: Implement text creation
    return null;
  }

  onPointerMove(_event: PointerEvent, _context: ToolContext): ToolResult {
    // Text tool doesn't need move handling
    return null;
  }

  onPointerUp(_event: PointerEvent, _context: ToolContext): ToolResult {
    // TODO: Finalize text input
    return null;
  }

  onKeyDown(_event: KeyboardEvent, _context: ToolContext): ToolResult {
    // TODO: Handle text input
    return null;
  }
}

/**
 * Create a new text tool instance
 */
export function createTextTool(): TextTool {
  return new TextTool();
}
