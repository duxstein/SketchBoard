# SketchBoard
🧠 SketchBoard — The Open-Source Collaborative Whiteboard  A next-generation Excalidraw-style visual collaboration platform — built for speed, openness, and real-time creativity.


<p align="center">
  <img src="docs/banner-placeholder.png" width="800" alt="SketchBoard Banner (coming soon)" />
</p>

<p align="center">
  <a href="https://github.com/AbhishekMishra-OpenSource/SketchBoard/actions">
    <img src="https://github.com/AbhishekMishra-OpenSource/SketchBoard/workflows/CI/badge.svg" alt="Build Status" />
  </a>
  <a href="https://github.com/AbhishekMishra-OpenSource/SketchBoard/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" />
  </a>
  <a href="https://github.com/AbhishekMishra-OpenSource/SketchBoard/stargazers">
    <img src="https://img.shields.io/github/stars/AbhishekMishra-OpenSource/SketchBoard?style=social" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/AbhishekMishra-OpenSource/SketchBoard/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/AbhishekMishra-OpenSource/SketchBoard" alt="Contributors" />
  </a>
</p>

---

## 🎨 Overview

**SketchBoard** is an open-source, browser-based **visual collaboration tool** that enables teams, developers, designers, and educators to sketch, diagram, and brainstorm — *together, in real time.*

Inspired by [Excalidraw](https://excalidraw.com), but reimagined for **extensibility**, **offline-first workflows**, and **privacy-friendly real-time sync**, SketchBoard blends artistic freedom with technical precision.

---

## 🚀 Core Features

- ⚡ **Real-Time Collaboration** — powered by CRDTs (Yjs / Automerge)
- 🎨 **Modern Canvas Engine** — freehand drawing, shapes, text, connectors, grouping
- 💾 **Offline-First** — works seamlessly without internet
- 🧩 **Plugin System** — extend SketchBoard with custom shapes, tools, exporters
- 🛡️ **Privacy-Focused** — your data stays local unless you share it
- 📦 **Export Options** — PNG, SVG, PDF, JSON
- 🌈 **Extensible UI/UX** — built with React, TypeScript, TailwindCSS

---

## 🧑‍💻 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS, Canvas API |
| **Collaboration** | Yjs (CRDT), WebSockets, IndexedDB |
| **Backend (optional)** | Node.js, Express / Fastify, Redis, PostgreSQL |
| **Testing & DevOps** | Jest, Playwright, GitHub Actions, Docker |

---

## 🏗️ Getting Started

### Prerequisites
- Node.js ≥ 18
- pnpm / yarn / npm
- Modern browser (Chrome, Edge, Firefox, Safari)

### Run Locally
```bash
git clone https://github.com/AbhishekMishra-OpenSource/SketchBoard.git
cd SketchBoard
pnpm install
pnpm dev
```

Open **http://localhost:5173** in your browser 🚀

---

## 🤝 Contributing

SketchBoard is a community-driven project.  
We’re building a future where visual collaboration is **open, accessible, and creative** — and we’d love your help ❤️  

**Ways to Contribute:**
- 🧑‍💻 Add new features or improve existing ones  
- 🎨 Design icons, themes, or UX interactions  
- 🧠 Write documentation and tutorials  
- 🐛 Find and fix issues  
- 🌍 Share feedback and ideas in [Discussions](../../discussions)

> Read our [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before your first PR.

---

## 🧭 Roadmap

- [ ] Core canvas tools (pen, shapes, text)
- [ ] Real-time multi-user sessions
- [ ] Export/Import formats (PNG, SVG, JSON)
- [ ] Plugin API for developers
- [ ] Offline sync with IndexedDB
- [ ] Authentication & shared sessions
- [ ] Cloud storage (optional)
- [ ] Performance optimizations (WebGL)

Track progress in [Issues](../../issues) & [Projects](../../projects).

---

## 🧩 Architecture Snapshot

```text
Frontend (React + Yjs)
   │
   ├── Canvas Engine (Shapes, Tools, Renderer)
   ├── State Manager (CRDT / Yjs)
   └── IndexedDB (Offline Persistence)
         │
         └── WebSocket Sync Server (Node.js)
                 ├── Session Manager
                 └── Document Store (PostgreSQL/Redis)
```

---

## 🌍 Community

We believe collaboration tools should be **open, transparent, and community-built**.  
Join us on our mission to democratize visual collaboration!  

💬 [Discussions](../../discussions) | 🐛 [Issues](../../issues) | 📢 [Roadmap](../../projects)

---

## ⚖️ License

This project is licensed under the **MIT License** © 2025 Abhishek Mishra.  
See the [LICENSE](./LICENSE) file for details.

---

## 💡 Inspiration

Built with ❤️ by developers for creators — inspired by Excalidraw, tldraw, and Figma’s collaborative design systems.  
> “Visual thinking belongs to everyone — not just designers.”

---

### 🏷️ Topics

```
excalidraw-clone, open-source, collaboration, react, typescript, crdt, yjs,
websockets, whiteboard, pwa, realtime, frontend, fullstack, design-tools,
innovation, devcommunity, sketchboard
```

---

<p align="center">⭐ If you like this project, consider giving it a star! It really helps! ⭐</p>

---

## 📜 LICENSE

MIT License  

Copyright (c) 2025 Abhishek Mishra  

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:  

The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.

