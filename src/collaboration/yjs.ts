/**
 * Yjs Integration
 *
 * CRDT document management and synchronization.
 * Provides conflict-free merging and optimistic local updates.
 */

import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import type { Shape, PenShape } from '@/canvas/types';
import type { TransportProvider, ConnectionStatus } from './transport';
import { PersistenceManager } from './persistence';

/**
 * Yjs Document Manager
 *
 * Manages the Yjs document for shape synchronization.
 * Handles local optimistic updates and conflict-free merging.
 */
export class YjsDocument {
  private doc: Y.Doc;
  private shapesMap: Y.Map<Y.Map<unknown>>;
  private awareness: Awareness;
  private persistence: PersistenceManager;
  private transport: TransportProvider | null = null;
  private status: ConnectionStatus = 'disconnected';
  private onStatusChange?: (status: ConnectionStatus) => void;
  private onShapeChange?: (shapes: Map<string, Shape>) => void;

  constructor() {
    // Create Yjs document
    this.doc = new Y.Doc();

    // Create shapes map (nested Y.Map for each shape)
    // Structure: shapesMap.get(shapeId) -> Y.Map with shape properties
    this.shapesMap = this.doc.getMap('shapes');

    // Create awareness for ephemeral presence data
    this.awareness = new Awareness(this.doc);

    // Create persistence manager
    this.persistence = new PersistenceManager(this.doc);

    // Listen for local changes (for optimistic updates)
    this.shapesMap.observe(this.handleShapesChange.bind(this));

    // Listen for document updates (for remote changes)
    this.doc.on('update', this.handleDocumentUpdate.bind(this));
  }

  /**
   * Get the Yjs document
   */
  getDoc(): Y.Doc {
    return this.doc;
  }

  /**
   * Get the Yjs awareness instance
   *
   * Used for ephemeral presence data (cursors, user info).
   */
  getAwareness(): Awareness {
    return this.awareness;
  }

  /**
   * Get all shapes from the document
   *
   * Converts Yjs data structures to plain Shape objects.
   */
  getShapes(): Map<string, Shape> {
    const shapes = new Map<string, Shape>();

    this.shapesMap.forEach((shapeMap, shapeId) => {
      const shape = this.yjsMapToShape(shapeId, shapeMap);
      if (shape) {
        shapes.set(shapeId, shape);
      }
    });

    return shapes;
  }

  /**
   * Add or update a shape
   *
   * Optimistic update: changes are applied immediately locally,
   * then synced to other clients via CRDT.
   *
   * @param shape - Shape to add or update
   */
  setShape(shape: Shape): void {
    const shapeMap = this.shapesMap.get(shape.id);
    if (shapeMap) {
      // Update existing shape
      this.shapeToYjsMap(shape, shapeMap as Y.Map<unknown>);
    } else {
      // Create new shape
      const newShapeMap = new Y.Map();
      this.shapeToYjsMap(shape, newShapeMap);
      this.shapesMap.set(shape.id, newShapeMap);
    }
  }

  /**
   * Delete a shape
   *
   * @param shapeId - ID of shape to delete
   */
  deleteShape(shapeId: string): void {
    this.shapesMap.delete(shapeId);
  }

  /**
   * Initialize persistence
   *
   * Restores document state from IndexedDB and sets up auto-save.
   * Should be called before connecting to transport.
   */
  async initializePersistence(): Promise<void> {
    await this.persistence.initialize();
  }

  /**
   * Connect to transport provider
   *
   * @param transport - Transport provider instance
   * @param onStatusChange - Callback for status changes
   * @param onShapeChange - Callback for shape changes
   */
  async connect(
    transport: TransportProvider,
    onStatusChange?: (status: ConnectionStatus) => void,
    onShapeChange?: (shapes: Map<string, Shape>) => void
  ): Promise<void> {
    this.transport = transport;
    this.onStatusChange = onStatusChange;
    this.onShapeChange = onShapeChange;

    // Handle transport updates
    const handleUpdate = (update: Uint8Array) => {
      Y.applyUpdate(this.doc, update);
    };

    // Handle status changes
    const handleStatusChange = (status: ConnectionStatus) => {
      this.status = status;
      this.onStatusChange?.(status);
    };

    // Connect transport
    await transport.connect('default-room', handleUpdate, handleStatusChange);

    // Send initial state to transport
    const initialUpdate = Y.encodeStateAsUpdate(this.doc);
    transport.sendUpdate(initialUpdate);

    // Note: Awareness updates are typically handled by the transport provider
    // (e.g., y-websocket handles awareness separately)
    // If your transport supports awareness, sync it here
  }

  /**
   * Disconnect from transport
   */
  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.disconnect();
      this.transport = null;
    }
    this.status = 'disconnected';
    this.onStatusChange?.('disconnected');
  }

  /**
   * Cleanup
   *
   * Disconnects transport and destroys persistence.
   */
  destroy(): void {
    this.disconnect();
    this.persistence.destroy();
  }

  /**
   * Get connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Handle document updates (from remote clients)
   */
  private handleDocumentUpdate(update: Uint8Array, origin: unknown): void {
    // Only send updates that didn't originate from this client
    // (Yjs handles this automatically, but we can filter if needed)
    if (this.transport && origin !== this) {
      // This update came from remote - it's already applied
      // No need to send it back
      return;
    }

    // Send local updates to transport
    if (this.transport && origin === this) {
      this.transport.sendUpdate(update);
    }
  }

  /**
   * Handle shapes map changes
   *
   * Called when shapes are added, updated, or deleted.
   * Triggers callback for UI updates.
   */
  private handleShapesChange(): void {
    const shapes = this.getShapes();
    this.onShapeChange?.(shapes);
  }

  /**
   * Convert Yjs Map to Shape object
   *
   * Deserializes Yjs data structure to plain Shape.
   */
  private yjsMapToShape(
    shapeId: string,
    shapeMap: Y.Map<unknown>
  ): Shape | null {
    try {
      const type = shapeMap.get('type') as string;
      if (!type) {
        return null;
      }

      // Get common properties
      const style = shapeMap.get('style') as Shape['style'];
      const metadata = shapeMap.get('metadata') as Shape['metadata'];

      // Create shape based on type
      switch (type) {
        case 'pen': {
          const points = (shapeMap.get('points') as PenShape['points']) || [];
          return {
            id: shapeId,
            type: 'pen',
            points,
            style,
            metadata,
            closed: (shapeMap.get('closed') as boolean) ?? false,
          } as Shape;
        }

        case 'rectangle': {
          return {
            id: shapeId,
            type: 'rectangle',
            x: (shapeMap.get('x') as number) ?? 0,
            y: (shapeMap.get('y') as number) ?? 0,
            width: (shapeMap.get('width') as number) ?? 0,
            height: (shapeMap.get('height') as number) ?? 0,
            style,
            metadata,
          } as Shape;
        }

        case 'ellipse': {
          return {
            id: shapeId,
            type: 'ellipse',
            centerX: (shapeMap.get('centerX') as number) ?? 0,
            centerY: (shapeMap.get('centerY') as number) ?? 0,
            radiusX: (shapeMap.get('radiusX') as number) ?? 0,
            radiusY: (shapeMap.get('radiusY') as number) ?? 0,
            style,
            metadata,
          } as Shape;
        }

        case 'text': {
          return {
            id: shapeId,
            type: 'text',
            x: (shapeMap.get('x') as number) ?? 0,
            y: (shapeMap.get('y') as number) ?? 0,
            text: (shapeMap.get('text') as string) ?? '',
            fontFamily: (shapeMap.get('fontFamily') as string) ?? undefined,
            fontSize: (shapeMap.get('fontSize') as number) ?? undefined,
            fontWeight:
              (shapeMap.get('fontWeight') as string | number) ?? undefined,
            textAlign:
              (shapeMap.get('textAlign') as 'left' | 'center' | 'right') ??
              undefined,
            style,
            metadata,
          } as Shape;
        }

        default:
          console.warn(`Unknown shape type: ${type}`);
          return null;
      }
    } catch (error) {
      console.error(`Error deserializing shape ${shapeId}:`, error);
      return null;
    }
  }

  /**
   * Convert Shape object to Yjs Map
   *
   * Serializes plain Shape to Yjs data structure.
   */
  private shapeToYjsMap(shape: Shape, shapeMap: Y.Map<unknown>): void {
    // Set common properties
    shapeMap.set('type', shape.type);
    shapeMap.set('style', shape.style);
    shapeMap.set('metadata', shape.metadata);

    // Set type-specific properties
    switch (shape.type) {
      case 'pen':
        shapeMap.set('points', shape.points);
        if (shape.closed !== undefined) {
          shapeMap.set('closed', shape.closed);
        }
        break;

      case 'rectangle':
        shapeMap.set('x', shape.x);
        shapeMap.set('y', shape.y);
        shapeMap.set('width', shape.width);
        shapeMap.set('height', shape.height);
        break;

      case 'ellipse':
        shapeMap.set('centerX', shape.centerX);
        shapeMap.set('centerY', shape.centerY);
        shapeMap.set('radiusX', shape.radiusX);
        shapeMap.set('radiusY', shape.radiusY);
        break;

      case 'text':
        shapeMap.set('x', shape.x);
        shapeMap.set('y', shape.y);
        shapeMap.set('text', shape.text);
        if (shape.fontFamily !== undefined) {
          shapeMap.set('fontFamily', shape.fontFamily);
        }
        if (shape.fontSize !== undefined) {
          shapeMap.set('fontSize', shape.fontSize);
        }
        if (shape.fontWeight !== undefined) {
          shapeMap.set('fontWeight', shape.fontWeight);
        }
        if (shape.textAlign !== undefined) {
          shapeMap.set('textAlign', shape.textAlign);
        }
        break;
    }
  }
}
