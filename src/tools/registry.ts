/**
 * Tool Registry
 *
 * Central registry for all available tools.
 * Enables tool discovery and plugin-style architecture.
 */

import type { Tool } from './types';
import { createPenTool } from './pen';

/**
 * Tool Registry
 *
 * Maps tool IDs to tool instances.
 * Tools are registered at application startup.
 */
class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  /**
   * Register a tool
   */
  register(tool: Tool): void {
    this.tools.set(tool.id, tool);
  }

  /**
   * Get a tool by ID
   */
  get(toolId: string): Tool | undefined {
    return this.tools.get(toolId);
  }

  /**
   * Get all registered tools
   */
  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Check if a tool is registered
   */
  has(toolId: string): boolean {
    return this.tools.has(toolId);
  }

  /**
   * Get tool IDs
   */
  getIds(): string[] {
    return Array.from(this.tools.keys());
  }
}

/**
 * Global tool registry instance
 */
export const toolRegistry = new ToolRegistry();

/**
 * Initialize default tools
 *
 * Registers all built-in tools.
 * Called at application startup.
 */
export function initializeTools(): void {
  // Register pen tool
  toolRegistry.register(createPenTool());

  // Additional tools will be registered here as they're implemented
  // toolRegistry.register(createSelectionTool());
  // toolRegistry.register(createShapeTool());
  // toolRegistry.register(createTextTool());
}
