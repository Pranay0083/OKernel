# SysCore Engine

The high-performance system core engine for OKernel, written in Rust. SysCore manages code execution, tracing, and resource isolation for user-submitted code.

## Architecture

SysCore operates as an API server that orchestrates isolated execution environments using Docker. It handles:
- Code compilation and execution
- Real-time tracing (memory, CPU, syscalls)
- Security and resource containment
- WebSocket streaming of execution events

## Development

Prerequisites: Rust (latest stable)

```bash
# Build the project
cargo build

# Run the server locally
cargo run

# Run the test suite
cargo test
```

## Docker Environments

SysCore uses specialized Docker images to execute user code securely. These images are defined in `syscore/docker/`:

- `syscore/docker/python/`: Python runner with custom profiling hooks.
- `syscore/docker/cpp/`: C++ runner with Valgrind and GDB integration.

These images must be built and available to the SysCore engine for execution tasks to succeed.
