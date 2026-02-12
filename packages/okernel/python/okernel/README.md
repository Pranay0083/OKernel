# okernel

Zero-dependency Python tracer with HTML visualization.

## Installation

pip install okernel

## Quick Start

```python
import okernel

code = """
def factorial(n):
    return 1 if n <= 1 else n * factorial(n-1)

print(factorial(5))
"""

# Generate trace and visualize
trace = okernel.trace(code)
trace.to_html("trace.html")
# Output: Generated trace.html with 24 steps
```

## Features

- Zero external dependencies (Python stdlib only)
- Rich trace events with memory, timing, hardware costs
- 3-panel HTML visualizer:
  - Code view with line highlighting
  - Stack/Heap inspector
  - Timeline with memory chart
- Security: No innerHTML, programmatic DOM creation
- Works offline - generates self-contained HTML files

## API

### `okernel.trace(code: str) -> Trace`
Executes code string and returns a Trace object containing execution events, memory stats, and timing data.

### `Trace.to_html(path: str)`
Generates a self-contained HTML visualizer at the specified path.

### `Trace.summary() -> str`
Returns a text summary of execution metrics (steps, peak memory, duration).

### `Trace.events`
List of raw execution events (line changes, calls, returns, opcode costs).

## Links

- PyPI: https://pypi.org/project/okernel/
- Website: https://hackmist.tech
