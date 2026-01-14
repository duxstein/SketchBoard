# Store Module

**Purpose**: Centralized state management using Zustand.

This module contains:

- UI state (toolbar, panels, modals)
- Canvas state (shapes, viewport)
- Collaboration state (presence, sync status)

**Key Principle**: Clear separation between UI state, Canvas state, and Collaboration state. React components must subscribe only to minimal state slices and never cause full canvas re-renders (PRD Section 5.4).
