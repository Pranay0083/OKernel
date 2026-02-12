# SYSTEM.md — Swarm Context for OKernel Package Overhaul

## Active Project
**okernel** - Zero-dependency Python tracing package

## Current Version
- Package: v0.1.3 (on PyPI)
- Target: v0.2.0 (with new visualizer)

## Repository Location
`/Users/vaiditya/Desktop/PROJECTS/OKernel`

## Package Location
`/Users/vaiditya/Desktop/PROJECTS/OKernel/okernel/`

## Key Files

### Package Core
- `okernel/__init__.py` - Public API (trace, Trace class)
- `okernel/syscore/tracer.py` - sys.settrace implementation
- `okernel/syscore/runner.py` - Code execution wrapper
- `okernel/syscore/memory.py` - Custom memory tracker
- `okernel/syscore/profiler.py` - Opcode→hardware mapping
- `okernel/visualizer/renderer.py` - JSON→HTML injection
- `okernel/visualizer/template.html` - **PRIMARY TARGET** for overhaul

### Tests
- `okernel/tests/test_*.py` - 36 tests total

### Configuration
- `pyproject.toml` - Package metadata

### Website (for Phase 3)
- `src/pages/Home.tsx` - Add package marketing section
- `src/pages/Changelog.tsx` - Add version entry

### Reference Implementation
- `syscore/docker/python/runner.py` - Backend tracer (gold standard)
- `src/apps/visualizer/` - Frontend components (design reference)

## Active Plan
See `agents/PLAN.md`

## Constraints
1. ZERO external Python dependencies
2. Pure HTML/CSS/JS in template (no React/Vue/etc)
3. Must work with `pip install okernel` from PyPI
4. Security: No innerHTML for user data, escape </script>

## Test Command
```bash
cd /Users/vaiditya/Desktop/PROJECTS/OKernel
python3 -m pytest okernel/tests/ -v
```

## Build & Publish
```bash
python3 -m build
python3 -m twine upload dist/okernel-*.whl dist/okernel-*.tar.gz
```

## Current Swarm State
- Phase: Planning Complete
- Next: Phase 2 (Template Overhaul)
- Agent: Keith (Orchestrator)
