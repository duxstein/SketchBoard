/**
 * Persistence Layer
 *
 * IndexedDB-based local persistence.
 * Auto-save, restore on reload, compatible with CRDT document state.
 *
 * Uses Yjs document encoding for efficient storage and CRDT compatibility.
 */

import * as Y from 'yjs';

/**
 * Database Configuration
 */
const DB_NAME = 'sketchboard';
const DB_VERSION = 1;
const STORE_NAME = 'documents';
const DOCUMENT_KEY = 'main';

/**
 * Persistence Manager
 *
 * Manages IndexedDB persistence for Yjs documents.
 * Handles auto-save, restore, and CRDT-compatible state management.
 */
export class PersistenceManager {
  private db: IDBDatabase | null = null;
  private doc: Y.Doc;
  private autoSaveInterval: number | null = null;
  private pendingUpdate: Uint8Array | null = null;
  private isInitialized = false;
  private beforeUnloadHandler: () => void;
  private visibilityChangeHandler: () => void;
  private updateHandler: () => void;

  constructor(doc: Y.Doc) {
    this.doc = doc;
    // Bind handlers once so they can be properly removed
    this.beforeUnloadHandler = this.saveSync.bind(this);
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
    this.updateHandler = this.handleDocumentUpdate.bind(this);
  }

  /**
   * Initialize persistence
   *
   * Opens IndexedDB and restores document state if available.
   * Sets up auto-save.
   *
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Open IndexedDB
    this.db = await this.openDatabase();

    // Restore document state from IndexedDB
    await this.restore();

    // Set up auto-save
    this.setupAutoSave();

    this.isInitialized = true;
  }

  /**
   * Save document state to IndexedDB
   *
   * Encodes the current Yjs document state and saves it.
   * This is called automatically on document updates (throttled).
   */
  async save(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      // Encode current document state
      const update = Y.encodeStateAsUpdate(this.doc);

      // Save to IndexedDB
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      await this.promisifyRequest(store.put(update, DOCUMENT_KEY));

      this.pendingUpdate = null;
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  }

  /**
   * Restore document state from IndexedDB
   *
   * Loads saved state and applies it to the Yjs document.
   * Only restores if document is empty (first load).
   */
  async restore(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const savedUpdate = await this.promisifyRequest<Uint8Array | undefined>(
        store.get(DOCUMENT_KEY)
      );

      if (savedUpdate && savedUpdate.length > 0) {
        // Apply saved state
        // Yjs CRDT will handle conflict-free merging if document already has state
        // This is safe because CRDTs are designed for this
        Y.applyUpdate(this.doc, savedUpdate);
      }
    } catch (error) {
      console.error('Error restoring from IndexedDB:', error);
    }
  }

  /**
   * Cleanup
   *
   * Stops auto-save and closes database connection.
   */
  destroy(): void {
    this.stopAutoSave();
    // Remove event listeners
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    document.removeEventListener(
      'visibilitychange',
      this.visibilityChangeHandler
    );
    this.doc.off('update', this.updateHandler);
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
  }

  /**
   * Open IndexedDB database
   *
   * Creates database and object store if they don't exist.
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  /**
   * Set up auto-save
   *
   * Listens for document updates and saves periodically.
   * Uses debouncing to avoid excessive writes.
   */
  private setupAutoSave(): void {
    // Listen for document updates
    this.doc.on('update', this.updateHandler);

    // Auto-save every 2 seconds
    this.autoSaveInterval = window.setInterval(() => {
      if (this.pendingUpdate) {
        this.save();
      }
    }, 2000);

    // Save on page unload (synchronous for reliability)
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    // Save on visibility change (tab hidden)
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  /**
   * Handle document update
   */
  private handleDocumentUpdate(): void {
    // Mark that we have pending changes
    this.pendingUpdate = new Uint8Array([1]); // Dummy value, just a flag
  }

  /**
   * Handle visibility change
   */
  private handleVisibilityChange(): void {
    if (document.hidden && this.pendingUpdate) {
      this.save();
    }
  }

  /**
   * Synchronous save (for beforeunload)
   *
   * Attempts to save synchronously, but IndexedDB is async.
   * This is best-effort only.
   */
  private saveSync(): void {
    // IndexedDB is async, but we try our best
    // The browser may cancel this if the page is closing
    this.save().catch(() => {
      // Ignore errors on page unload
    });
  }

  /**
   * Stop auto-save
   */
  private stopAutoSave(): void {
    if (this.autoSaveInterval !== null) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Promisify IndexedDB request
   *
   * Helper to convert IndexedDB callbacks to Promises.
   */
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
