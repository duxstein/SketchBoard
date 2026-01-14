/**
 * Canvas Types
 *
 * Type definitions for canvas rendering system and shape data model.
 */

// ============================================================================
// Basic Types
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface ViewportState {
  x: number; // World X position (pan)
  y: number; // World Y position (pan)
  zoom: number; // Zoom level (1.0 = 100%)
}

export interface CanvasSize {
  width: number;
  height: number;
}

export type RenderCallback = (ctx: CanvasRenderingContext2D) => void;

// ============================================================================
// Shape Data Model
// ============================================================================

/**
 * Shape Type Discriminator
 *
 * Each shape type has a unique identifier for type-safe discrimination.
 */
export type ShapeType = 'pen' | 'rectangle' | 'ellipse' | 'text';

/**
 * Shape Style
 *
 * Visual styling properties for shapes.
 * All values are in world coordinates (not screen pixels).
 */
export interface ShapeStyle {
  /** Stroke color (CSS color string) */
  strokeColor: string;
  /** Fill color (CSS color string, or 'transparent') */
  fillColor: string;
  /** Stroke width in world units */
  strokeWidth: number;
  /** Line cap style */
  lineCap?: 'butt' | 'round' | 'square';
  /** Line join style */
  lineJoin?: 'miter' | 'round' | 'bevel';
  /** Opacity (0.0 to 1.0) */
  opacity?: number;
}

/**
 * Shape Metadata
 *
 * Immutable metadata attached to every shape.
 * Used for collaboration, history, and attribution.
 */
export interface ShapeMetadata {
  /** User identifier who created this shape */
  createdBy: string;
  /** Timestamp when shape was created (ISO 8601 string) */
  createdAt: string;
  /** Timestamp when shape was last updated (ISO 8601 string) */
  updatedAt: string;
}

/**
 * Base Shape Interface
 *
 * All shapes must implement this interface.
 * Shapes are immutable data objects - never mutate, always create new instances.
 */
export interface BaseShape {
  /** Globally unique identifier (CRDT-compatible) */
  id: string;
  /** Shape type discriminator */
  type: ShapeType;
  /** Visual style properties */
  style: ShapeStyle;
  /** Metadata (creation, updates, attribution) */
  metadata: ShapeMetadata;
}

// ============================================================================
// Pen Shape (Freehand Drawing)
// ============================================================================

/**
 * Pen Shape
 *
 * Freehand drawing represented as a series of points.
 * Points are stored in world coordinates.
 */
export interface PenShape extends BaseShape {
  type: 'pen';
  /** Array of points defining the stroke path */
  points: Point[];
  /** Whether the stroke is closed (connects last point to first) */
  closed?: boolean;
}

// ============================================================================
// Rectangle Shape
// ============================================================================

/**
 * Rectangle Shape
 *
 * Axis-aligned rectangle defined by two corner points.
 */
export interface RectangleShape extends BaseShape {
  type: 'rectangle';
  /** Top-left corner in world coordinates */
  x: number;
  /** Top-left corner in world coordinates */
  y: number;
  /** Width in world units */
  width: number;
  /** Height in world units */
  height: number;
}

// ============================================================================
// Ellipse Shape
// ============================================================================

/**
 * Ellipse Shape
 *
 * Ellipse (or circle) defined by center and radii.
 */
export interface EllipseShape extends BaseShape {
  type: 'ellipse';
  /** Center X coordinate in world units */
  centerX: number;
  /** Center Y coordinate in world units */
  centerY: number;
  /** Horizontal radius in world units */
  radiusX: number;
  /** Vertical radius in world units */
  radiusY: number;
}

// ============================================================================
// Text Shape
// ============================================================================

/**
 * Text Shape
 *
 * Text annotation on the canvas.
 * Position is the anchor point (typically top-left for LTR text).
 */
export interface TextShape extends BaseShape {
  type: 'text';
  /** Anchor X coordinate in world units */
  x: number;
  /** Anchor Y coordinate in world units */
  y: number;
  /** Text content */
  text: string;
  /** Font family (CSS font-family value) */
  fontFamily?: string;
  /** Font size in world units */
  fontSize?: number;
  /** Font weight (CSS font-weight value) */
  fontWeight?: string | number;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
}

// ============================================================================
// Union Type
// ============================================================================

/**
 * Shape Union Type
 *
 * Discriminated union of all shape types.
 * Use type guards to narrow to specific shape types.
 */
export type Shape = PenShape | RectangleShape | EllipseShape | TextShape;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for PenShape
 */
export function isPenShape(shape: Shape): shape is PenShape {
  return shape.type === 'pen';
}

/**
 * Type guard for RectangleShape
 */
export function isRectangleShape(shape: Shape): shape is RectangleShape {
  return shape.type === 'rectangle';
}

/**
 * Type guard for EllipseShape
 */
export function isEllipseShape(shape: Shape): shape is EllipseShape {
  return shape.type === 'ellipse';
}

/**
 * Type guard for TextShape
 */
export function isTextShape(shape: Shape): shape is TextShape {
  return shape.type === 'text';
}
