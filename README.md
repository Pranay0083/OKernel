# OKernel

A cycle-accurate execution visualization platform for learning Operating Systems concepts. OKernel combines real-time code tracing, CPU scheduling simulation, and a browser-based C shell environment.

## What is OKernel?

OKernel transforms abstract OS theory into interactive visualizations:

- **Code Tracer**: Trace Python/C++ execution with memory inspection, stack frames, and hardware cost analysis
- **CPU Scheduler**: Simulate FCFS, Round Robin, SJF, SRTF, and Priority scheduling algorithms
- **Shell Maker**: Write and execute C code in a sandboxed browser environment with live memory visualization

## Repository Structure

```
OKernel/
├── apps/web/              # React frontend (Vite + TypeScript + Tailwind)
├── packages/okernel/
│   └── python/            # Python package for local tracing (PyPI)
├── syscore/               # Rust backend engine (Docker-based execution)
└── database/migrations/   # SQL schema and migrations
```

## Quick Start

### Web Application

```bash
cd apps/web
npm install
npm run dev
```

### Python Package

```bash
pip install okernel
```

```python
import okernel

code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
"""

trace = okernel.trace(code)
trace.to_html("fibonacci_trace.html")
```

### Rust Engine

```bash
cd syscore
cargo build
cargo run
```

## Documentation

| Resource | Description |
|----------|-------------|
| [Web App](./apps/web/README.md) | Frontend development guide |
| [Python Package](./packages/okernel/python/README.md) | okernel PyPI package docs |
| [Rust Engine](./syscore/README.md) | SysCore backend architecture |

## Links

- Website: [hackmist.tech](https://hackmist.tech)
- SiteMap: [Site Map Okernel](https://hackmist.tech/docs/sitemap)
- PyPI: [pypi.org/project/okernel](https://pypi.org/project/okernel/)
- Docs: [hackmist.tech/docs](https://hackmist.tech/docs)

## Special Thanks 

From (Vaiditya Tanwar) - Thanks to everyone who have ever committed a single line to the repo for helping me create this tool, that may revolutionize Software Education.
This project aims to educate software engineers who take their Silicon for-granted.

## License

MIT
