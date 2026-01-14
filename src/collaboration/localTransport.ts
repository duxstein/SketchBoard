/**
 * Local Transport Provider
 *
 * Example transport provider for local-only collaboration (testing/offline).
 * This demonstrates the transport abstraction pattern.
 *
 * In production, you would use a real transport like:
 * - y-websocket (WebSocket provider)
 * - y-partykit (PartyKit provider)
 * - y-http (HTTP provider)
 * - Custom WebSocket implementation
 */

import type { TransportProvider, ConnectionStatus } from './transport';

/**
 * Local Transport Provider
 *
 * Simple in-memory transport for local testing.
 * Does not actually sync with other clients.
 */
export class LocalTransport implements TransportProvider {
  private status: ConnectionStatus = 'disconnected';
  private onStatusChange?: (status: ConnectionStatus) => void;

  connect(
    _roomId: string,
    _onUpdate: (update: Uint8Array) => void,
    onStatusChange: (status: ConnectionStatus) => void
  ): Promise<void> {
    // Local transport doesn't use onUpdate (no actual syncing)
    this.onStatusChange = onStatusChange;

    // Simulate connection
    this.setStatus('connecting');
    setTimeout(() => {
      this.setStatus('connected');
    }, 100);

    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    this.setStatus('disconnected');
    this.onStatusChange = undefined;
  }

  sendUpdate(_update: Uint8Array): void {
    // Local transport doesn't actually sync
    // In a real transport, this would send the update over the network
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.onStatusChange?.(status);
  }
}

/**
 * Create a local transport instance
 */
export function createLocalTransport(): LocalTransport {
  return new LocalTransport();
}
