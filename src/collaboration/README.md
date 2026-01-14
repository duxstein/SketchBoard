# Collaboration Module

**Purpose**: CRDT-based realtime synchronization layer.

This module contains:
- Yjs document management
- WebSocket transport abstraction (provider-agnostic)
- Presence system (cursors, users)
- Conflict-free merge logic
- Offline queue management

**Key Principle**: Transport layer must be abstracted. No hard dependency on a specific backend provider. Local-first: app must work offline (PRD Section 5.5).
