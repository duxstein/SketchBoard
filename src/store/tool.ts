/**
 * Tool State
 *
 * Zustand store for tool management.
 * Manages active tool selection and tool state.
 */

import { create } from 'zustand';
import { toolRegistry } from '@/tools/registry';
import type { Tool } from '@/tools/types';

interface ToolState {
  /** ID of the currently active tool */
  activeToolId: string | null;
  /** Get the currently active tool instance */
  activeTool: Tool | null;
  /** Set the active tool by ID */
  setActiveTool: (toolId: string) => void;
  /** Check if a tool is active */
  isToolActive: (toolId: string) => boolean;
}

/**
 * Tool Store
 *
 * Manages tool selection state.
 * Only one tool can be active at a time.
 */
export const useToolStore = create<ToolState>((set, get) => ({
  activeToolId: null,
  activeTool: null,

  setActiveTool: (toolId: string) => {
    const tool = toolRegistry.get(toolId);
    if (!tool) {
      console.warn(`Tool with ID "${toolId}" not found in registry`);
      return;
    }

    set({
      activeToolId: toolId,
      activeTool: tool,
    });
  },

  isToolActive: (toolId: string) => {
    return get().activeToolId === toolId;
  },
}));

/**
 * Initialize default tool
 *
 * Sets the first available tool as active on startup.
 */
export function initializeDefaultTool(): void {
  const tools = toolRegistry.getAll();
  const firstTool = tools[0];
  if (firstTool) {
    useToolStore.getState().setActiveTool(firstTool.id);
  }
}
