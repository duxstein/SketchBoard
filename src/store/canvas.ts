/**
 * Canvas State
 *
 * State for shapes, viewport, and canvas data.
 * This is the source of truth for all drawing data.
 */

import { create } from 'zustand';
import type { Shape } from '@/canvas/types';

interface CanvasState {
  /** Map of shape ID to shape object */
  shapes: Map<string, Shape>;
  /** Add or update a shape */
  setShape: (shape: Shape) => void;
  /** Remove a shape */
  deleteShape: (shapeId: string) => void;
  /** Get all shapes as an array */
  getShapesArray: () => Shape[];
  /** Clear all shapes */
  clearShapes: () => void;
}

/**
 * Canvas Store
 *
 * Manages the collection of shapes on the canvas.
 * Shapes are stored by ID for efficient lookup and updates.
 */
export const useCanvasStore = create<CanvasState>((set, get) => ({
  shapes: new Map(),

  setShape: (shape: Shape) => {
    set(state => {
      const newShapes = new Map(state.shapes);
      newShapes.set(shape.id, shape);
      return { shapes: newShapes };
    });
  },

  deleteShape: (shapeId: string) => {
    set(state => {
      const newShapes = new Map(state.shapes);
      newShapes.delete(shapeId);
      return { shapes: newShapes };
    });
  },

  getShapesArray: () => {
    return Array.from(get().shapes.values());
  },

  clearShapes: () => {
    set({ shapes: new Map() });
  },
}));
