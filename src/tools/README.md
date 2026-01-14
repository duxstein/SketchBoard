# Tools Module

**Purpose**: Pluggable tool system where each tool is a self-contained plugin.

This module contains:

- Tool interface/contract
- Individual tool implementations (pen, rectangle, ellipse, text, selection)
- Tool registry
- Tool state management

**Key Principle**: Tools must be plugins, not conditionals. Adding a new tool must not require modifying existing tools (PRD Section 5.3).
