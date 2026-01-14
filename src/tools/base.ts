/**
 * Base Tool
 *
 * Abstract base class or interface for all tools.
 * Each tool implements: onPointerDown, onPointerMove, onPointerUp, optional onKeyDown
 *
 * This file provides helper utilities and base implementations
 * that tools can use, but tools are not required to extend a class.
 * The Tool interface is sufficient - tools can be plain objects.
 */

// Base utilities for tools - no imports needed

/**
 * Create default shape metadata
 *
 * Helper function for tools to create consistent metadata.
 */
export function createShapeMetadata(userId: string): {
  createdBy: string;
  createdAt: string;
  updatedAt: string;
} {
  const now = new Date().toISOString();
  return {
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update shape metadata timestamp
 *
 * Helper function to update the updatedAt timestamp.
 */
export function updateShapeMetadata(metadata: {
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}): {
  createdBy: string;
  createdAt: string;
  updatedAt: string;
} {
  return {
    ...metadata,
    updatedAt: new Date().toISOString(),
  };
}
