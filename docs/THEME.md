# OKernel Design System (v0.3.0)

## Design Philosophy
OKernel combines modern **Glassmorphism** with a retro-futuristic **Terminal** aesthetic. The goal is to make the user feel like they are interacting with a sophisticated, next-generation operating system kernel simulation.

## Core Colors

### Primary Palette
- **Primary (Green)**: `#4ade80` (Tailwind `green-400`)
    - Used for: Success states, active commands, "system healthy" indicators.
- **Background**: `#09090b` (Tailwind `zinc-950`)
    - Used for: Main terminal background, deep OS layers.
- **Surface**: `#18181b` (Tailwind `zinc-900`) with opacity.
    - Used for: Modals, cards, glass panels.

### Accent Palette
- **Blue**: `#60a5fa` (Tailwind `blue-400`)
    - Used for: Information, method names, structural elements.
- **Yellow**: `#facc15` (Tailwind `yellow-400`)
    - Used for: Warnings, processing states, highlighted code.
- **Red**: `#f87171` (Tailwind `red-400`)
    - Used for: Errors, critical alerts, "Exit" actions.

## Typography
- **Monospace**: `font-mono` (Default stack)
    - Used for: Terminal output, code blocks, system logs, version numbers.
- **Sans-Serif**: `font-sans` (Inter/System)
    - Used for: Marketing copy, long-form explanations (About, Architecture).

## UI Components

### 1. Terminal Window (The "Console")
The heart of the application.
- **Background**: Deep black/zinc with high opacity.
- **Text**: Matrix-like green or sharp white.
- **Cursor**: Blinking block or underscore.
- **Input**: Unstyled, minimal.

### 2. Glass Cards
Used for visualizing data (CPU Visualizer, Changelog entries).
- **Effect**: `backdrop-blur-md`
- **Border**: Thin, translucent white/zinc (`border-white/10`).
- **Interaction**: Subtle hover glow or lift.

### 3. SysCore Status Indicators
Small badges reflecting kernel state.
- **Style**: Pill-shaped, monospaced.
- **Example**: `[RUNNING]`, `[IDLE]`, `v0.3.0`.

## Animations
- **Fade In**: Smooth entry for new terminal lines.
- **Pulse**: For "live" indicators (heartbeat, active process).
- **Slide Up**: For transitions between OS "layers" (pages).

## Usage Guidelines
1.  **Always be "In Character"**: Use technical jargon in UI copy (e.g., "Initializing..." instead of "Loading...").
2.  **Contrast is King**: Ensure terminal text is legible against dark backgrounds.
3.  **Performance**: Keep animations smooth (60fps); lag breaks the "high-performance kernel" immersion.
