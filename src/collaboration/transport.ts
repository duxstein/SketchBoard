/**
 * Transport Abstraction
 *
 * Provider-agnostic transport layer for WebSocket/HTTP.
 * Allows swapping backend providers without code changes.
 *
 * This abstraction enables:
 * - WebSocket providers (y-websocket, y-partykit, etc.)
 * - HTTP providers (y-http, custom REST APIs)
 * - Local-only providers (for testing)
 * - Custom providers (any CRDT sync mechanism)
 */

/**
 * Transport Provider Interface
 *
 * All transport providers must implement this interface.
 * This allows swapping providers without changing collaboration code.
 */
export interface TransportProvider {
  /**
   * Connect to the transport
   *
   * Called when collaboration should start.
   * Should establish connection and begin syncing.
   *
   * @param roomId - Unique room/board identifier
   * @param onUpdate - Callback when updates are received
   * @param onStatusChange - Callback when connection status changes
   * @returns Promise that resolves when connected
   */
  connect(
    roomId: string,
    onUpdate: (update: Uint8Array) => void,
    onStatusChange: (status: ConnectionStatus) => void
  ): Promise<void>;

  /**
   * Disconnect from the transport
   *
   * Called when collaboration should stop.
   * Should close connection and clean up resources.
   */
  disconnect(): Promise<void>;

  /**
   * Send an update to the transport
   *
   * Called when local changes need to be synced.
   *
   * @param update - Yjs update (Uint8Array)
   */
  sendUpdate(update: Uint8Array): void;

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus;
}

/**
 * Connection Status
 *
 * Represents the state of the transport connection.
 */
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'syncing'
  | 'error';

/**
 * Transport Provider Factory
 *
 * Creates a transport provider instance.
 * Different providers can be swapped by changing the factory.
 */
export type TransportProviderFactory = (
  config?: Record<string, unknown>
) => TransportProvider;
