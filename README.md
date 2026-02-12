# OKernel

OKernel is a monorepo containing the ecosystem for the OKernel OS simulation platform. It combines a Rust-based system core, a Python package for distribution, and a modern React frontend.

## Structure

- **`apps/web/`**: React frontend application (Visualizer & Terminal UI)
- **`packages/okernel/`**: Python package for PyPI distribution
- **`syscore/`**: Rust backend engine handling core OS logic
- **`database/`**: SQL migrations and database schema management

## Quick Start

### `syscore` (Rust Engine)
The core logic engine.
```bash
cd syscore
cargo test
cargo run
```

### `apps/web` (Frontend)
The interactive visualizer.
```bash
cd apps/web
npm install
npm run dev
```

### `packages/okernel` (Python Package)
Python wrapper and tools.
```bash
cd packages/okernel
pip install -e .
```

### `database`
Database management scripts.
```bash
cd database
# See internal README for migration scripts
```

## Documentation

For detailed documentation, please refer to the README files within each directory:
- [Web App README](./apps/web/README.md)
- [SysCore README](./syscore/README.md)
- [Python Package README](./packages/okernel/README.md)
