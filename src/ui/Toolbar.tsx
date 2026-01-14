/**
 * Toolbar Component
 *
 * Essential tools toolbar. Minimal UI chrome.
 * Keyboard shortcuts prioritized per PRD Section 8.
 */

import { useEffect, useMemo } from 'react';
import { useToolStore } from '@/store/tool';
import { toolRegistry } from '@/tools/registry';

/**
 * Toolbar Component
 *
 * Minimal toolbar with tool selection buttons and keyboard shortcuts.
 * Uses Zustand store with minimal subscriptions to avoid canvas re-renders.
 */
export function Toolbar() {
  const activeToolId = useToolStore(state => state.activeToolId);
  const setActiveTool = useToolStore(state => state.setActiveTool);

  // Memoize tools list to avoid re-computing on every render
  const tools = useMemo(() => toolRegistry.getAll(), []);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Check for tool shortcuts
      for (const tool of tools) {
        if (
          tool.shortcut &&
          event.key.toLowerCase() === tool.shortcut.toLowerCase()
        ) {
          event.preventDefault();
          setActiveTool(tool.id);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setActiveTool, tools]);

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex gap-1">
        {tools.map(tool => {
          const isActive = activeToolId === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`
                px-3 py-2 rounded text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }
              `}
              title={`${tool.name} (${tool.shortcut?.toUpperCase() || ''})`}
            >
              {tool.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
