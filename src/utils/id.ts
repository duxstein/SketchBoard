/**
 * ID Generation
 *
 * Globally unique ID generation for shapes and entities.
 * Must be CRDT-compatible.
 */

/**
 * Generate a globally unique ID
 *
 * Uses a combination of timestamp and random number to ensure uniqueness.
 * CRDT-compatible: IDs are sortable and globally unique.
 *
 * Format: timestamp-random (e.g., "1704067200000-abc123")
 */
export function generateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Generate a user identifier
 *
 * Creates a simple user ID for attribution.
 * In a real app, this would come from authentication.
 */
export function generateUserId(): string {
  // For now, use a simple random ID
  // In production, this would come from auth system
  return `user-${Math.random().toString(36).substring(2, 9)}`;
}
