/**
 * Tool Registry
 *
 * Central registry for all tools.
 * Tools MUST be registered here to be usable.
 */

import type { Tool } from './types';
import { createPenTool } from './pen';

class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    if (this.tools.has(tool.id)) {
      console.warn(`[ToolRegistry] Tool "${tool.id}" already registered`);
      return;
    }
    this.tools.set(tool.id, tool);
  }

  get(toolId: string): Tool | undefined {
    return this.tools.get(toolId);
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  clear(): void {
    this.tools.clear();
  }
}

export const toolRegistry = new ToolRegistry();

/**
 * Initialize all built-in tools.
 * MUST be called once before using ToolManager.
 */
export function initializeTools(): void {
  toolRegistry.clear();

  // Register tools here
  toolRegistry.register(createPenTool());

  console.log(
    '[ToolRegistry] Registered tools:',
    toolRegistry.getAll().map(t => t.id)
  );
}
