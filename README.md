# CPU Scheduler Visualizer (OKernel v0.3.0)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/syscore-v0.3.0-green.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

**OKernel** is an interactive, browser-based Operating System simulation designed to help students master core OS concepts. It features a fully functional **SysCore Engine** that drives a realistic terminal interface and a visual CPU scheduler.

## Features (v0.3.0)

### SysCore Terminal
- **Interactive Shell**: A robust command-line interface with history, auto-completion (Tab), and colored output.
- **SysCore Engine**: A modular kernel architecture (`src/syscore`) separating logic from UI.
- **Command Dispatcher**: Support for complex sub-commands (e.g., `syscore.cpu.info`, `syscore.algos.rr`).
- **Self-Documenting**: Built-in help and API discovery via the `syscore` command.

### CPU Scheduler Visualizer
- **Algorithms**: Round Robin (RR), Shortest Job First (SJF), First-Come First-Serve (FCFS), Shortest Remaining Time First (SRTF), Priority Scheduling.
- **Real-Time Visualization**: Dynamic Gantt chart rendering with process state tracking.
- **Customizable**: Adjust time quantum, add custom processes, and toggle algorithms on the fly.

### Modern Architecture
- **Tech Stack**: React 18, TypeScript, Vite, TailwindCSS.
- **Design System**: Glassmorphism + Retro-Futuristic Terminal aesthetic (detailed in [THEME.md](./THEME.md)).
- **Routing**: Namespace-based navigation (`/dev/*`).

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

\`\`\`bash
git clone https://github.com/Vaiditya2207/OKernel.git
cd OKernel
npm install
\`\`\`

### Running the Kernel

\`\`\`bash
npm run dev
\`\`\`

Open your browser to `http://localhost:5173`.

## Project Structure

\`\`\`
src/
├── core/           # Legacy core types and utilities
├── syscore/        # SysCore Engine v1 (v0.3.0)
│   ├── cpu/        # CPU Scheduling Algorithms & Logic
│   └── terminal/   # Terminal Command Modules & Dispatcher
├── components/     # React UI Components
├── hooks/          # React Hooks (useTerminal, useScheduler)
├── pages/          # Application Views (Console, Visualizer, etc.)
└── App.tsx         # Main Router
\`\`\`

## Roadmap

- [x] **v0.3.0: SysCore Engine Refactor** (Modular Architecture, Advanced CLI)
- [x] **v0.2.0: Core Visualizer** (Round Robin, Gantt Charts)
- [ ] **v0.4.0: Memory Management** (Paging, Segmentation Visualizer)
- [ ] **v0.5.0: Process Synchronization** (Deadlock simulation, Semaphores)

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/kernel-upgrade`).
3. Commit your changes (`git commit -m 'feat: Add new scheduler'`).
4. Push to the branch (`git push origin feature/kernel-upgrade`).
5. Open a Pull Request.

## License

Distributed under the MIT License. See `LICENSE` for more information.
