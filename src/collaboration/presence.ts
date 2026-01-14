/**
 * Presence System
 *
 * Live cursor positions, user identifiers, active tool indicators.
 * Ephemeral data that never pollutes persistent board state.
 *
 * Uses Yjs awareness for ephemeral presence data.
 */

import { Awareness } from 'y-protocols/awareness';
import type { Point } from '@/canvas/types';

/**
 * Presence Data
 *
 * Ephemeral data for a single user's presence.
 * This data is not persisted and is automatically cleaned up
 * when the user disconnects.
 */
export interface PresenceData {
  /** User identifier */
  userId: string;
  /** User display name */
  userName?: string;
  /** User color (for cursor/UI) */
  userColor?: string;
  /** Cursor position in world coordinates */
  cursor: Point | null;
  /** Active tool ID */
  activeToolId: string | null;
  /** Timestamp of last update */
  lastSeen: number;
}

/**
 * Presence Map
 *
 * Maps client IDs to presence data.
 * Client IDs are Yjs client IDs (not user IDs).
 */
export type PresenceMap = Map<number, PresenceData>;

/**
 * Presence Manager
 *
 * Manages collaborative presence using Yjs awareness.
 * Tracks cursors, user info, and active tools for all connected clients.
 */
export class PresenceManager {
  private awareness: Awareness;
  private localClientId: number;
  private localPresence: PresenceData;
  private onPresenceChangeCallback?: (presence: PresenceMap) => void;
  private updateInterval: number | null = null;

  constructor(awareness: Awareness, userId: string) {
    this.awareness = awareness;
    this.localClientId = awareness.clientID;

    // Initialize local presence
    this.localPresence = {
      userId,
      cursor: null,
      activeToolId: null,
      lastSeen: Date.now(),
    };

    // Set initial awareness state
    this.awareness.setLocalStateField('presence', this.localPresence);

    // Listen for remote presence changes
    this.awareness.on('change', this.handleAwarenessChange.bind(this));

    // Throttle cursor updates (don't spam network)
    this.startCursorUpdateLoop();
  }

  /**
   * Update local cursor position
   *
   * Called when local user moves their cursor.
   * Updates are throttled to avoid network spam.
   *
   * @param cursor - Cursor position in world coordinates
   */
  updateCursor(cursor: Point | null): void {
    this.localPresence.cursor = cursor;
    this.localPresence.lastSeen = Date.now();
    this.awareness.setLocalStateField('presence', { ...this.localPresence });
  }

  /**
   * Update local active tool
   *
   * Called when local user changes tools.
   *
   * @param toolId - Active tool ID
   */
  updateActiveTool(toolId: string | null): void {
    this.localPresence.activeToolId = toolId;
    this.localPresence.lastSeen = Date.now();
    this.awareness.setLocalStateField('presence', { ...this.localPresence });
  }

  /**
   * Update user info
   *
   * @param userName - User display name
   * @param userColor - User color
   */
  updateUserInfo(userName?: string, userColor?: string): void {
    this.localPresence.userName = userName;
    this.localPresence.userColor = userColor;
    this.localPresence.lastSeen = Date.now();
    this.awareness.setLocalStateField('presence', { ...this.localPresence });
  }

  /**
   * Get all presence data (excluding local user)
   *
   * Returns a map of client IDs to presence data for remote users.
   */
  getRemotePresence(): PresenceMap {
    const presence = new Map<number, PresenceData>();
    const states = this.awareness.getStates();

    states.forEach((state: Record<string, unknown>, clientId: number) => {
      // Skip local client
      if (clientId === this.localClientId) {
        return;
      }

      const presenceData = state.presence as PresenceData | undefined;
      if (presenceData) {
        presence.set(clientId, presenceData);
      }
    });

    return presence;
  }

  /**
   * Get all presence data (including local user)
   */
  getAllPresence(): PresenceMap {
    const presence = new Map<number, PresenceData>();
    const states = this.awareness.getStates();

    states.forEach((state: Record<string, unknown>, clientId: number) => {
      const presenceData = state.presence as PresenceData | undefined;
      if (presenceData) {
        presence.set(clientId, presenceData);
      }
    });

    return presence;
  }

  /**
   * Set callback for presence changes
   */
  onPresenceChange(callback: (presence: PresenceMap) => void): void {
    this.onPresenceChangeCallback = callback;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopCursorUpdateLoop();
    this.awareness.setLocalStateField('presence', null);
    this.onPresenceChangeCallback = undefined;
  }

  /**
   * Handle awareness changes (remote presence updates)
   */
  private handleAwarenessChange(): void {
    const remotePresence = this.getRemotePresence();
    this.onPresenceChangeCallback?.(remotePresence);
  }

  /**
   * Start cursor update loop
   *
   * Throttles cursor updates to avoid network spam.
   * Updates are sent at most every 50ms.
   */
  private startCursorUpdateLoop(): void {
    // Update cursor position periodically if it's set
    this.updateInterval = window.setInterval(() => {
      if (this.localPresence.cursor) {
        this.localPresence.lastSeen = Date.now();
        this.awareness.setLocalStateField('presence', {
          ...this.localPresence,
        });
      }
    }, 50);
  }

  /**
   * Stop cursor update loop
   */
  private stopCursorUpdateLoop(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}
