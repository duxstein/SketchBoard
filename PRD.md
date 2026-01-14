Below is a **cursor-lock, execution-grade Product Requirements Document (PRD)** for **SketchBoard**.
This is written **specifically to be pasted into Cursor** as a **source-of-truth contract**.
It is intentionally explicit, restrictive, and engineering-oriented to prevent hallucinated features, architecture drift, or premature optimization.

---

# 📘 Product Requirements Document (PRD)

## Product Name

**SketchBoard**

## Version

**1.0 (Cursor-Locked Execution Version)**

## Status

**Final — Do Not Infer, Do Not Expand**

## Audience

* Cursor (AI coding agent)
* Senior frontend / systems engineers
* Product & engineering stakeholders

---

## 1. Executive Summary

SketchBoard is a **high-performance, collaborative, infinite-canvas whiteboard** designed for **visual thinking, system design, brainstorming, and real-time collaboration**.

The product prioritizes:

* **Performance over polish**
* **Correctness over features**
* **Architecture over shortcuts**

SketchBoard must feel:

* As fast as drawing on paper
* As reliable as a local-first app
* As scalable as a multiplayer system

SketchBoard is **not** a diagramming tool, note-taking app, or presentation platform.

---

## 2. Product Principles (Non-Negotiable)

These principles override all other considerations.

1. **Canvas-first architecture**

   * Canvas rendering is the core system
   * UI must never block or re-render the canvas

2. **Data > Pixels**

   * All drawings are stored as structured data
   * Canvas is a pure projection layer

3. **Local-first, multiplayer by design**

   * The app must work offline
   * Collaboration enhances, never replaces, local usage

4. **Deterministic rendering**

   * Same input data must always produce the same visual output

5. **Extensibility**

   * Tools, shapes, and collaboration layers must be swappable without rewrites

Cursor **must not violate these principles**, even if faster solutions exist.

---

## 3. Target Users

### Primary Users

* Software engineers (system design, architecture diagrams)
* Product designers (ideation, flow sketching)
* Technical founders (brainstorming, planning)

### Explicitly Out of Scope

* Non-technical presentation users
* Classroom LMS use cases
* Graphic design or illustration workflows

---

## 4. Core Use Cases

### UC-1: Solo Infinite Whiteboarding

A user opens SketchBoard and:

* Draws freely on an infinite canvas
* Pans and zooms smoothly
* Reloads the page and sees their work restored

### UC-2: Real-Time Collaboration

Multiple users:

* Join the same board
* See each other’s cursors live
* Edit simultaneously without conflicts

### UC-3: Offline → Online Continuity

A user:

* Works offline
* Reconnects
* Sees all changes merged automatically

---

## 5. Functional Requirements

### 5.1 Canvas System

**Must Have**

* Infinite canvas (no boundaries)
* Smooth pan & zoom
* High-DPI / retina support
* RequestAnimationFrame render loop
* World coordinates separate from screen coordinates

**Must Not**

* Use SVG for rendering
* Tie rendering logic to React lifecycle

---

### 5.2 Shape Model

All drawings must be represented as **immutable data objects**.

Each shape must include:

* `id` (globally unique)
* `type` (pen, rectangle, ellipse, text, etc.)
* Geometry (points, bounds, vectors)
* Style (stroke, fill, width)
* Metadata:

  * createdBy
  * createdAt
  * updatedAt

Shapes must be:

* Serializable
* CRDT-compatible
* Deterministically renderable

---

### 5.3 Tool System

Tools must be **plugins**, not conditionals.

Each tool must implement:

* `onPointerDown`
* `onPointerMove`
* `onPointerUp`
* Optional `onKeyDown`

Initial tools (v1):

* Selection tool
* Pen tool
* Basic shape tool (rectangle / ellipse)
* Text tool (minimal)

Adding a new tool must **not** require modifying existing tools.

---

### 5.4 State Management

* Centralized state store (Zustand or equivalent)
* Clear separation between:

  * UI state
  * Canvas state
  * Collaboration state

React components must:

* Subscribe only to minimal state slices
* Never cause full canvas re-renders

---

### 5.5 Collaboration

**Approach**

* CRDT-based synchronization (e.g., Yjs)

**Capabilities**

* Real-time shared shapes
* Conflict-free concurrent edits
* Optimistic local updates
* Presence awareness (users, cursors, active tool)

**Constraints**

* Transport layer must be abstracted
* No hard dependency on a specific backend provider

---

### 5.6 Presence & Awareness

* Live cursor positions
* User identifiers (name/color)
* Active tool indicator (optional)

Presence must:

* Be ephemeral
* Never pollute persistent board state

---

### 5.7 Persistence

**Local Persistence**

* IndexedDB-based
* Auto-save
* Restore on reload

**Requirements**

* Compatible with CRDT document state
* Resilient to crashes or refreshes

---

## 6. Non-Functional Requirements

### 6.1 Performance

* 60 FPS on moderate hardware
* Must handle:

  * Thousands of shapes
  * Multiple collaborators
* No unnecessary re-renders
* No memory leaks from event listeners

---

### 6.2 Reliability

* No data loss on refresh
* No shape corruption
* Deterministic merge behavior

---

### 6.3 Scalability

* Architecture must support:

  * Large boards
  * Long sessions
  * Many incremental updates

---

## 7. Explicit Non-Goals (Do NOT Build)

Cursor must **not implement**:

* Authentication systems
* Permissions / roles
* Comments or chat
* Version history UI
* Export (PDF, PNG, etc.)
* Templates or pre-built shapes
* Sticky notes
* AI features

If requested later, these will be **separate PRDs**.

---

## 8. UI / UX Guidelines

* Minimal UI chrome
* Toolbar only for essential tools
* Keyboard shortcuts prioritized
* Canvas interaction must feel immediate
* No modal-heavy workflows

UI exists to **serve the canvas**, not the opposite.

---

## 9. Technical Constraints (Cursor Enforcement)

Cursor must:

* Ask for clarification if ambiguity exists
* Avoid premature abstractions not justified by PRD
* Prefer clarity over cleverness
* Comment non-obvious logic (especially math)

Cursor must **not**:

* Introduce features not listed
* Change architecture without justification
* Optimize before correctness

---

## 10. Definition of Done (v1)

SketchBoard v1 is complete when:

* Infinite canvas works flawlessly
* Drawing and shapes persist across reloads
* Two users can collaborate in real time
* No major performance regressions exist
* Codebase is clean, modular, and extensible

---

## 11. Cursor Lock Instruction (MANDATORY)

> You are Cursor, acting as a senior engineer.
> This PRD is the **single source of truth**.
> Do not invent features, UX flows, or architecture beyond this document.
> If uncertain, stop and ask for clarification.

---

## Recommended Next Action

Paste this PRD into:

1. A `PRD.md` file in the repository
2. Cursor system prompt before coding begins

If you want, next I can:

* Convert this into a **Cursor “always-on” system prompt**
* Break this PRD into **implementation milestones**
* Act as a **strict reviewer for Cursor-generated code**

State your preference and we proceed.
