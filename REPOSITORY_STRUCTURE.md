# SketchBoard Repository Structure

Complete documentation of the SketchBoard codebase organization and file structure.

## Overview

SketchBoard is a high-performance, collaborative, infinite-canvas whiteboard built with:
- **Frontend**: Vite + React + TypeScript
- **Rendering**: HTML Canvas API
- **State Management**: Zustand
- **Collaboration**: Yjs (CRDT-based)
- **Styling**: Tailwind CSS v4

## Root Directory

```
SketchBoard/
├── .gitignore                    # Git ignore patterns
├── .prettierignore               # Prettier ignore patterns
├── .prettierrc                   # Prettier configuration
├── CODE_OF_CONDUCT.md            # Code of conduct
├── CONTRIBUTING.md               # Contribution guidelines
├── LICENSE                       # License file
├── PRD.md                        # Product Requirements Document (source of truth)
├── README.md                     # Project README
├── REPOSITORY_STRUCTURE.md       # This file
├── TRADEOFFS.md                  # Performance tradeoffs documentation
├── eslint.config.js              # ESLint v9 flat configuration
├── index.html                    # HTML entry point
├── package.json                  # NPM dependencies and scripts
├── package-lock.json             # NPM lock file
├── postcss.config.js             # PostCSS configuration (Tailwind CSS v4)
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration (app)
├── tsconfig.node.json            # TypeScript configuration (Node/build tools)
└── vite.config.ts                # Vite build configuration
```

## Source Directory (`src/`)

### Entry Points

```
src/
├── main.tsx                      # React application entry point
├── App.tsx                       # Root React component
├── index.css                     # Global CSS (Tailwind imports)
└── vite-env.d.ts                 # Vite type definitions
```

### Canvas System (`src/canvas/`)

Core rendering engine and canvas infrastructure.

```
src/canvas/
├── CanvasRoot.tsx                # Main canvas container component
├── renderer.ts                   # Canvas renderer (requestAnimationFrame loop)
├── viewport.ts                   # Viewport management (pan, zoom, coordinates)
├── types.ts                      # Canvas and shape type definitions
├── shapeRenderer.ts              # Pure shape rendering functions
├── cursorRenderer.ts             # Remote cursor rendering
├── culling.ts                    # Viewport culling (performance optimization)
├── culling.md                    # Bounding box caching strategy documentation
└── README.md                     # Canvas system documentation
```

**Key Responsibilities:**
- Infinite canvas rendering
- World ↔ Screen coordinate transformations
- High-DPI support
- Viewport pan & zoom
- Shape rendering (deterministic, pure functions)
- Performance optimizations (culling)

### Tools System (`src/tools/`)

Plugin-based tool architecture for drawing and interaction.

```
src/tools/
├── types.ts                      # Tool interface and event types
├── base.ts                       # Tool utility functions (metadata, etc.)
├── manager.ts                    # ToolManager (routes events to active tool)
├── registry.ts                   # Tool registry (central tool repository)
├── pen.ts                        # PenTool implementation (freehand drawing)
├── selection.ts                  # SelectionTool (placeholder)
├── shape.ts                      # ShapeTool (placeholder - rectangles/ellipses)
├── text.ts                       # TextTool (placeholder)
└── README.md                     # Tools system documentation
```

**Key Responsibilities:**
- Tool plugin interface
- Event routing (pointer/keyboard → tools)
- Tool activation/switching
- Tool-specific logic (pen, selection, shapes, text)

### Collaboration System (`src/collaboration/`)

Realtime collaboration and synchronization.

```
src/collaboration/
├── yjs.ts                        # YjsDocument (CRDT document management)
├── transport.ts                  # TransportProvider interface (WebSocket abstraction)
├── localTransport.ts             # Local transport (testing/development)
├── presence.ts                   # PresenceManager (cursors, user info)
├── persistence.ts                 # PersistenceManager (IndexedDB auto-save)
└── README.md                     # Collaboration system documentation
```

**Key Responsibilities:**
- CRDT-based shape synchronization (Yjs)
- Transport layer abstraction (WebSocket-ready)
- Collaborative presence (cursors, active tools)
- Local persistence (IndexedDB)
- Conflict-free merging

### State Management (`src/store/`)

Zustand stores for application state.

```
src/store/
├── index.ts                      # Store exports
├── tool.ts                        # Active tool state
├── canvas.ts                     # Canvas state (shapes collection)
├── collaboration.ts               # Collaboration state (connection, users)
├── ui.ts                         # UI state (panels, modals, etc.)
└── README.md                     # State management documentation
```

**Key Responsibilities:**
- Tool selection state
- Canvas shapes state
- Collaboration connection state
- UI state management

### React Hooks (`src/hooks/`)

Custom React hooks for canvas and collaboration.

```
src/hooks/
├── useCanvas.ts                  # Canvas hook (renderer initialization)
├── useCollaboration.ts           # Collaboration hook (YjsDocument)
├── useTool.ts                    # Tool hook (tool selection)
├── useStore.ts                   # Store hook utilities
└── README.md                     # Hooks documentation
```

**Key Responsibilities:**
- Canvas renderer lifecycle
- Collaboration document lifecycle
- Tool selection integration
- React ↔ Canvas bridge

### UI Components (`src/ui/`)

React UI components.

```
src/ui/
├── Toolbar.tsx                   # Tool selection toolbar
├── CanvasContainer.tsx           # Canvas container component
└── README.md                     # UI components documentation
```

**Key Responsibilities:**
- Tool selection UI
- Canvas container
- Minimal UI chrome (per PRD)

### Utilities (`src/utils/`)

Shared utility functions.

```
src/utils/
├── id.ts                         # ID generation (shape IDs, user IDs)
├── math.ts                       # Math utilities (distance, clamp, lerp, etc.)
├── shape.ts                      # Shape utilities
└── README.md                     # Utilities documentation
```

**Key Responsibilities:**
- Unique ID generation
- Mathematical operations
- Shape manipulation helpers

### Type Definitions (`src/types/`)

Shared TypeScript type definitions.

```
src/types/
├── index.ts                      # Type exports
└── shape.ts                      # Shape type definitions (if separate from canvas/types)
```

## Configuration Files

### Build & Development

- **`vite.config.ts`**: Vite configuration (React plugin, path aliases)
- **`tsconfig.json`**: TypeScript configuration (strict mode, path aliases)
- **`tsconfig.node.json`**: TypeScript config for Node.js build tools
- **`postcss.config.js`**: PostCSS configuration (Tailwind CSS v4 plugin)
- **`tailwind.config.js`**: Tailwind CSS configuration

### Code Quality

- **`eslint.config.js`**: ESLint v9 flat configuration
  - TypeScript rules
  - React rules
  - Prettier integration
- **`.prettierrc`**: Prettier formatting rules
- **`.prettierignore`**: Files to exclude from Prettier

## Documentation Files

### Core Documentation

- **`PRD.md`**: Product Requirements Document (single source of truth)
- **`TRADEOFFS.md`**: Performance optimizations and tradeoffs
- **`REPOSITORY_STRUCTURE.md`**: This file
- **`README.md`**: Project overview and setup

### Module Documentation

Each major module has its own `README.md`:
- `src/canvas/README.md`
- `src/tools/README.md`
- `src/collaboration/README.md`
- `src/store/README.md`
- `src/hooks/README.md`
- `src/ui/README.md`
- `src/utils/README.md`

### Special Documentation

- **`src/canvas/culling.md`**: Bounding box caching strategy (deferred optimization)

## Architecture Principles

### Separation of Concerns

1. **Canvas Layer** (`canvas/`): Pure rendering, no React
2. **Tool Layer** (`tools/`): Plugin architecture, event-driven
3. **Collaboration Layer** (`collaboration/`): CRDT synchronization
4. **State Layer** (`store/`): Zustand stores
5. **UI Layer** (`ui/`): React components
6. **Hooks Layer** (`hooks/`): React ↔ Canvas bridge

### Key Design Decisions

1. **Canvas-First**: Canvas operates independently of React lifecycle
2. **Data > Pixels**: Shapes stored as data, not rendered pixels
3. **Deterministic Rendering**: Same input = same output (multiplayer correctness)
4. **Plugin Architecture**: Tools are plugins, not hard-coded
5. **Local-First**: Optimistic updates, CRDT merging
6. **Performance**: 60 FPS, viewport culling, no unnecessary re-renders

## File Naming Conventions

- **Components**: PascalCase (e.g., `CanvasRoot.tsx`, `Toolbar.tsx`)
- **Utilities**: camelCase (e.g., `useCanvas.ts`, `id.ts`)
- **Types**: camelCase (e.g., `types.ts`, `shape.ts`)
- **Classes**: PascalCase (e.g., `Renderer`, `Viewport`, `PenTool`)
- **Interfaces**: PascalCase (e.g., `Tool`, `Shape`, `ViewportState`)

## Import Paths

The project uses absolute imports via the `@/` alias:

```typescript
import { Viewport } from '@/canvas/viewport';
import { useToolStore } from '@/store/tool';
import { generateId } from '@/utils/id';
```

Configured in:
- `tsconfig.json`: `"baseUrl": "."`, `"paths": { "@/*": ["src/*"] }`
- `vite.config.ts`: `resolve.alias`

## Dependencies

### Production

- `react` / `react-dom`: React framework
- `zustand`: State management
- `yjs`: CRDT-based collaboration
- `y-protocols`: Yjs awareness protocol

### Development

- `vite`: Build tool
- `typescript`: Type checking
- `tailwindcss`: CSS framework
- `@tailwindcss/postcss`: Tailwind CSS v4 PostCSS plugin
- `eslint`: Linting
- `prettier`: Code formatting

## Scripts

```json
{
  "dev": "vite",                    // Development server
  "build": "tsc && vite build",     // Production build
  "lint": "eslint . --ext ts,tsx",  // Lint code
  "preview": "vite preview",        // Preview production build
  "format": "prettier --write ..."  // Format code
}
```

## Build Output

```
dist/
├── index.html                     # HTML entry
├── assets/
│   ├── index-*.css               # Compiled CSS
│   └── index-*.js                # Bundled JavaScript
```

## Development Workflow

1. **Development**: `npm run dev` → `http://localhost:5173`
2. **Build**: `npm run build` → `dist/`
3. **Lint**: `npm run lint`
4. **Format**: `npm run format`

## Module Dependencies

```
App.tsx
  └── CanvasRoot.tsx
      ├── Renderer (canvas/renderer.ts)
      │   ├── Viewport (canvas/viewport.ts)
      │   └── ShapeRenderer (canvas/shapeRenderer.ts)
      ├── LocalPenTool (temporary, Phase 3)
      └── Event Handlers (pan, zoom, draw)

Toolbar.tsx
  └── useToolStore (store/tool.ts)
      └── ToolManager (tools/manager.ts)
          └── ToolRegistry (tools/registry.ts)
              └── Tools (pen.ts, selection.ts, etc.)

Collaboration (future)
  └── YjsDocument (collaboration/yjs.ts)
      ├── TransportProvider (collaboration/transport.ts)
      ├── PresenceManager (collaboration/presence.ts)
      └── PersistenceManager (collaboration/persistence.ts)
```

## Notes

- **Phase 3 Status**: Currently implements local-only drawing (no collaboration yet)
- **Performance**: Optimized for 60 FPS with viewport culling
- **Type Safety**: Strict TypeScript throughout
- **Code Quality**: ESLint + Prettier enforced
- **Documentation**: Each module has README.md explaining its purpose

---

*Last updated: Based on Phase 3 implementation state*
