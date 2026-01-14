# Canvas Module

**Purpose**: Core rendering engine that operates independently of React lifecycle.

This module contains:
- Canvas renderer (Canvas API, not SVG)
- World-to-screen coordinate transformations
- RequestAnimationFrame render loop
- High-DPI/retina support
- Viewport management (pan, zoom)

**Key Principle**: Canvas rendering must never be blocked by React re-renders. This is the core system per PRD Section 2.1.
