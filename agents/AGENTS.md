# AGENTS.md — Swarm Rules for OKernel Package

## Engineering Standards

### TDD Mandatory
- Write failing tests FIRST
- Implement only what's needed to pass
- Refactor after green

### Zero Dependencies
- This package MUST use ONLY Python stdlib
- No pip dependencies allowed
- No tracemalloc (we build our own)
- No external tracing libraries

### Code Quality
- Type hints required
- Docstrings on public API
- No magic numbers without constants

---

## Review Protocol

### Reviewers
- Never edit code
- Run tests independently
- Verify trace output format matches spec

### Implementers
- Never self-review
- Document test output in WALKTHROUGH.md
- Follow the PLAN.md task order

---

## Package Structure (Required)

```
okernel/
├── __init__.py          # Public API: trace(), Trace class
├── syscore/
│   ├── __init__.py
│   ├── tracer.py        # Custom sys.settrace implementation
│   ├── memory.py        # Custom memory tracking (no tracemalloc)
│   ├── profiler.py      # Opcode → Hardware cost mapping
│   └── runner.py        # Subprocess execution wrapper
├── visualizer/
│   ├── __init__.py
│   ├── template.html    # Bundled static visualizer
│   └── renderer.py      # JSON → HTML injection
└── tests/
    ├── test_tracer.py
    ├── test_memory.py
    ├── test_renderer.py
    └── test_integration.py
```

---

## Trace Event Schema (Contract)

All trace events MUST conform to this JSON structure:

```json
{
  "type": "Trace" | "Stdout" | "Stderr" | "GC" | "Error",
  "event": "call" | "line" | "return" | "exception" | "opcode",
  "line": number,
  "function": string,
  "filename": string,
  "locals": {
    "var_name": {
      "value": string,
      "type": string,
      "address": string (hex),
      "size": number
    }
  },
  "memory_curr": number,
  "memory_peak": number,
  "stack_depth": number,
  "bytecode": {
    "opcode": string,
    "offset": number
  },
  "hardware": {
    "type": "MEM_READ" | "MEM_WRITE" | "ALU" | "CONTROL" | "FUNCTION" | "STACK" | "OTHER",
    "cost": number,
    "opcode": string
  },
  "timestamp": number (ns),
  "process_time": number (ns)
}
```
